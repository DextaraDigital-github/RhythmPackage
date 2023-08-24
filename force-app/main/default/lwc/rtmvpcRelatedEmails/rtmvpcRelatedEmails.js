import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import fetchEmailMessages from '@salesforce/apex/EmailController.fetchEmailMessages';
import fetchUsers from '@salesforce/apex/EmailController.fetchUsers';
import ComponentStylesheet from '@salesforce/resourceUrl/ComponentStyleSheet';
import { subscribe, unsubscribe } from 'lightning/empApi';

export default class RtmvpcRelatedEmails extends LightningElement {
    @api recordId;
    @track show = { emailsDataCount: 0 };
    @track modal = { emailRecord: { show: false } };
    columnsList = [{
        label: 'Subject', type: 'button', typeAttributes: { label: { fieldName: 'Subject' }, id: { fieldName: 'Subject' }, variant: 'base', name: 'Subject', alternativeText: 'download', disabled: false, class: "rem-rbtn" }
    }, { label: '# of Received Suppliers', fieldName: 'ReceivedSuppliers', sortable: true }, { label: 'Sent Date', fieldName: 'SentDate', sortable: true }];   // Columns to be displayed in the datatable
    @track emailsData;
    @track selectedEmail = {};
    @track pageProp = {};
    emailsDataMap;
    subscription;

    @api
    get showRecords() {
        if(typeof this.emailsData !== 'undefined' && this.emailsData.length > 0) {
            return true;
        }
        return false;
    }

    connectedCallback() {
        this.fetchEmailMsgsData();
        this.subscribeToPlatformEvent('/event/SendEmailEvent__e');
    }
    renderedCallback() {
        Promise.all([
            loadStyle(this, ComponentStylesheet)
        ]);
    }

    /* Subscribes to Platform Event to capture the status of emails sent */
    subscribeToPlatformEvent(channelName) {
        let _this = this;
        const messageCallback = function (response) {
            if (response.data.payload.Rhythm__Source__c === 'Refresh Emails' && response.data.payload.Rhythm__Type__c === 'RefreshEmails') {
                _this.fetchEmailMsgsData();
            }
        };
        subscribe(channelName, -1, messageCallback).then((response) => {
            this.subscription = response;
        });
    }
    unsubscribeToPlatformEvent() {
        unsubscribe(this.subscription, () => { });
    }

    /*fetches EmailMessages along with Users */
    fetchEmailMsgsData() {
        let _parameterMap = JSON.stringify({ assessmentId: this.recordId });
        fetchEmailMessages({ parameterMap: _parameterMap }).then(result => {
            let resultList = JSON.parse(JSON.stringify(result));
            let userIds = [];
            if (typeof resultList != 'undefined' && resultList.length > 0) {
                resultList.forEach(em => {
                    if (typeof em.EmailMessageRelations != 'undefined' && em.EmailMessageRelations.length > 0) {
                        let usersList = em.EmailMessageRelations.map(i => { return i.RelationId; });
                        userIds.push(...usersList);
                    }
                });
            }
            _parameterMap = JSON.stringify({ userIds: userIds });
            fetchUsers({ parameterMap: _parameterMap }).then(result => {
                this.emailsDataMap = this.formatEmailMsgsMap(resultList, result);
                this.emailsData = this.formatEmailMsgsData(this.emailsDataMap);
            }).catch(error => {
                this.configureToast('Unable to load Email Communications', 'Please contact your Administrator.', 'error');
            });
        }).catch(error => {
            this.configureToast('Unable to load Email Communications', 'Please contact your Administrator.', 'error');
        });
    }
    /* Prepares a Map of EmailMessages */
    formatEmailMsgsMap(result, userMap) {
        let emailMap = new Map();
        if (typeof result != 'undefined') {
            result.forEach(em => {
                let emailJson = {};
                emailJson.whatId = this.recordId;
                emailJson.isBuilderContent = true;
                emailJson.emailMessageId = em.Id;
                emailJson.fromName = em.FromName + ' <' + em.FromAddress + '>';
                let monthMap = new Map([['01', 'Jan'], ['02', 'Feb'], ['03', 'Mar'], ['04', 'Apr'], ['05', 'May'], ['06', 'Jun'], ['07', 'Jul'], ['08', 'Aug'], ['09', 'Sep'], ['10', 'Oct'], ['11', 'Nov'], ['12', 'Dec']]);
                let hh = Number(em.CreatedDate.split('T')[1].split(':')[0]);
                let mm = em.CreatedDate.split('T')[1].split(':')[1];
                emailJson.sentDate = (em.CreatedDate.split('T')[0].split('-')[2] + ' ' + monthMap.get(em.CreatedDate.split('T')[0].split('-')[1]) + ' ' + em.CreatedDate.split('T')[0].split('-')[0]) + ', ' + ((hh < 10 ? '0' : '') + (hh > 12 ? (hh - 12 < 10 ? '0' : '') + (hh - 12) : hh) + ':' + (mm) + (hh > 12 ? 'PM' : 'AM'));
                emailJson.whatName = em.RelatedTo.Name;
                emailJson.subject = em.Subject;
                emailJson.body = em.HtmlBody;
                emailJson.templateId = (typeof em.EmailTemplate != 'undefined') ? em.EmailTemplate.Name : '--None--';
                emailJson.emailTemplatesOpt = [{ label: emailJson.templateId, value: emailJson.templateId }];
                emailJson.recipientsData = [];
                let failedRecipientsData = (typeof em.Rhythm__Failed_Recipients__c != 'undefined' && em.Rhythm__Failed_Recipients__c !== null && em.Rhythm__Failed_Recipients__c !== '[]' && em.Rhythm__Failed_Recipients__c !== '') ? JSON.parse(em.Rhythm__Failed_Recipients__c) : [];
                emailJson.failedRecipientsCount = 0;
                if (typeof failedRecipientsData !== 'undefined' && failedRecipientsData.length > 0) {
                    failedRecipientsData.forEach(rec => {
                        emailJson.recipientsData.push({ Id: rec.id, Name: rec.name, Email: rec.email, Status: 'Failed' });
                    });
                    emailJson.failedRecipientsCount = emailJson.recipientsData.length;
                }
                if (typeof em.EmailMessageRelations !== 'undefined' && em.EmailMessageRelations.length > 0) {
                    let successRecipientsData = [];
                    let accList = [];
                    em.EmailMessageRelations.forEach(emr => {
                        if (accList.includes(userMap[emr.RelationId].Contact.AccountId)) {
                            successRecipientsData = successRecipientsData.map(x => {
                                if (x.Id === userMap[emr.RelationId].Contact.AccountId) {
                                    return { Id: x.Id, Name: x.Name, Email: x.Email + ', ' + userMap[emr.RelationId].Email, Status: 'Sent' };
                                }
                                else {
                                    return x;
                                }
                            });
                        }
                        else {
                            accList.push(userMap[emr.RelationId].Contact.AccountId);
                            successRecipientsData.push({ Id: userMap[emr.RelationId].Contact.AccountId, Name: userMap[emr.RelationId].Contact.Account.Name, Email: userMap[emr.RelationId].Email, Status: 'Sent' });
                        }
                    });
                    emailJson.recipientsData.push(...successRecipientsData);
                }
                emailJson.selectedRecipientsData = emailJson.recipientsData;
                emailMap.set(em.Id, emailJson);
            });
        }
        return emailMap;
    }
    /* Prepares a List of EmailMessages to display in datatable */
    formatEmailMsgsData(_emailsDataMap) {
        let emailList = [];
        if (typeof _emailsDataMap != 'undefined' && Array.from(_emailsDataMap.keys()).length > 0) {
            for (let [key, value] of _emailsDataMap) {
                emailList.push({ Id: key, Subject: value.subject, ReceivedSuppliers: value.recipientsData.length - value.failedRecipientsCount, SentDate: value.sentDate });
            }
        }
        this.show.emailsDataCount = emailList.length;
        return emailList;
    }
    /* Assigns values to conditionally render the pages on the modal */
    assignPageProp() {
        this.pageProp.pageNames = [{ label: 'Suppliers', name: 'chooseAccounts' }, { label: 'Email', name: 'composeEmail' }];
        this.pageProp.pageInfo = {};
        this.pageProp.pageInfo.chooseAccounts = { label: this.pageProp.pageNames[0].label, name: this.pageProp.pageNames[0].name, show: false, pageNo: 0, buttons: { prevButton: { label: "Previous", show: false }, nextButton: { label: "View Email", show: true }, saveButton: false } };
        this.pageProp.pageInfo.composeEmail = { label: this.pageProp.pageNames[1].label, name: this.pageProp.pageNames[1].name, show: false, pageNo: 1, buttons: { prevButton: { label: "View Suppliers", show: true }, nextButton: { label: "Previous", show: false }, saveButton: false } };
    }

    /* Displays toast message */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    /* Handles row actions performed on datatable */
    rowActionsHandler(event) {
        if (event.detail.action.name === 'Subject') {
            this.openRecordHandler(event);
        }
    }
    /* Opens the modal containing record data */
    openRecordHandler(event) {
        this.selectedEmail = this.emailsDataMap.get(event.detail.row.Id);
        if (typeof this.selectedEmail.recipientsData !== 'undefined' && this.selectedEmail.recipientsData.length > 0) {
            this.selectedEmail.selectedRecipients = this.selectedEmail.recipientsData.map((rec) => { return rec.Id; });
            this.selectedEmail.selectedRecipientsCount = this.selectedEmail.selectedRecipients.length;
        }
        this.template.querySelectorAll('c-send-email')[0].send();
    }

    /* Refreshed the data in the datatable */
    refreshDataHandler() {
        this.fetchEmailMsgsData();
    }
}