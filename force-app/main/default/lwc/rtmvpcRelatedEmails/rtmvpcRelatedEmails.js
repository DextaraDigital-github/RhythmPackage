import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import fetchEmailMessages from '@salesforce/apex/EmailController.fetchEmailMessages';
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
                console.log('Hi');
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
            this.emailsDataMap = this.formatEmailMsgsMap(result);
            this.emailsData = this.formatEmailMsgsData(this.emailsDataMap);
            //this.assignPageProp();
        }).catch(error => {
            console.log(error);
            this.configureToast('Error loading Accounts', 'Please contact your Administrator.', 'error');
        });
    }
    /* Prepares a Map of EmailMessages */
    formatEmailMsgsMap(result) {
        let emailMap = new Map();
        if (typeof result != 'undefined') {
            result.forEach(user => {
                if (typeof user.EmailMessageRelations != 'undefined') {
                    user.EmailMessageRelations.forEach(email => {
                        let emailJson = {};
                        if (!emailMap.has(email.EmailMessageId)) {
                            emailJson.whatId = this.recordId;
                            emailJson.isBuilderContent = true;
                            emailJson.emailMessageId = email.EmailMessageId;
                            emailJson.fromName = email.EmailMessage.FromName + ' <' + email.EmailMessage.FromAddress + '>';
                            let monthMap = new Map([['01', 'Jan'], ['02', 'Feb'], ['03', 'Mar'], ['04', 'Apr'], ['05', 'May'], ['06', 'Jun'], ['07', 'Jul'], ['08', 'Aug'], ['09', 'Sep'], ['10', 'Oct'], ['11', 'Nov'], ['12', 'Dec']]);
                            let hh = Number(email.EmailMessage.CreatedDate.split('T')[1].split(':')[0]);
                            let mm = email.EmailMessage.CreatedDate.split('T')[1].split(':')[1];
                            emailJson.sentDate = (email.EmailMessage.CreatedDate.split('T')[0].split('-')[2] + ' ' + monthMap.get(email.EmailMessage.CreatedDate.split('T')[0].split('-')[1]) + ', ' + email.EmailMessage.CreatedDate.split('T')[0].split('-')[0]) + ' ' + ((hh < 10 ? '0' : '') + (hh > 12 ? (hh - 12 < 10 ? '0' : '') + (hh - 12) : hh) + ':' + (mm) + (hh > 12 ? 'PM' : 'AM'));
                            emailJson.whatName = email.EmailMessage.RelatedTo.Name;
                            emailJson.subject = email.EmailMessage.Subject;
                            emailJson.body = email.EmailMessage.HtmlBody;
                            emailJson.templateId = (typeof email.EmailMessage.EmailTemplate != 'undefined') ? email.EmailMessage.EmailTemplate.Name : '--None--';
                            emailJson.emailTemplatesOpt = [{ label: emailJson.templateId, value: emailJson.templateId }];
                            emailJson.recipientsData = emailJson.selectedRecipientsData = (typeof email.EmailMessage.Rhythm__Failed_Recipients__c != 'undefined' && email.EmailMessage.Rhythm__Failed_Recipients__c !== null && email.EmailMessage.Rhythm__Failed_Recipients__c !== '[]' && email.EmailMessage.Rhythm__Failed_Recipients__c !== '') ? JSON.parse(email.EmailMessage.Rhythm__Failed_Recipients__c) : [];
                            emailJson.failedRecipientsCount = 0;
                            if (emailJson.recipientsData !== 'undefined' && emailJson.recipientsData.length > 0) {
                                emailJson.recipientsData.forEach(rec => {
                                    rec.Status = 'Sent';
                                });
                                emailJson.failedRecipientsCount = emailJson.recipientsData.length;
                            }
                        }
                        else {
                            emailJson = emailMap.get(email.EmailMessageId);
                        }
                        if (typeof user.Contact != 'undefined' && typeof user.Contact.AccountId != 'undefined' && typeof user.Contact.Account != 'undefined' && typeof user.Contact.Account.Name != 'undefined') {
                            emailJson.recipientsData.push({ Id: user.Contact.AccountId, Name: user.Contact.Account.Name, Email: user.Email, Status: 'Sent' });
                            emailMap.set(email.EmailMessageId, emailJson);
                        }
                    });
                }
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
        console.log('Hi');
        this.fetchEmailMsgsData();
    }
}