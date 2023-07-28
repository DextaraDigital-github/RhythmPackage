import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe, unsubscribe } from 'lightning/empApi';
import fetchAccounts from '@salesforce/apex/EmailController.fetchAccounts';
import fetchEmailtemplates from '@salesforce/apex/EmailController.fetchEmailtemplates';
import sendEmail from '@salesforce/apex/EmailController.sendEmail';

export default class SendEmailToContacts extends NavigationMixin(LightningElement) {
    @api source;
    @api assessmentId;   // Stores the assessment Id coming from Aura Component 
    @api assessmentName;   // Stores the assessment Name coming from Aura Component
    @track show = { searchCount: 0, searchText: '', accSearchLoading: false, spinner: false, disableBtns: false };   // Stores values used for displaying, conditional rendering or etc.
    @api pageProp = {};   // Stores the properties of each page in the Modal pop up
    @track currentPage;   // Stores data related to current page in the Modal pop up
    columnsList = [{ fieldName: 'Name', label: 'Name', sortable: true }];   // Columns to be displayed in the datatable
    @track accountsData = [];   // Contains the data related to Accounts fetched from Apex
    @track emailTemplatesOpt = [];   // Contains the data related to Email Templates fetched from Apex
    emailTemplatesData;   // Contains a list of Email Templates
    @api emailApi = {};
    @track email = { assessmentId: '', subject: '', body: '', isBuilderContent: false, limitProp: false, selectedAccountsCount: 0, selectedAccounts: [], templateId: 'null', hasCustomAttachments: false, hasCustomContents: false, attachmentsData: { attachments: [], contentDocuments: [], customContentDocuments: [], standardContentDocuments: [], deleteContentDocuments: [] } };   // Stores data regarding the email which is to be sent
    subscription;
    trackSearchAccounts = { searchKey: '', allAccounts: [], selectedAccounts: [], isInitialized: false };

    /* Related to Database column sorting */
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    connectedCallback() {
        this.show.spinner = true;
        switch (this.source) {
            case 'rtmvpcRelatedEmails':
                this.email = this.emailApi;
                this.assessmentId = this.email.assessmentId;
                this.accountsData = this.email.accountsData;
                this.show.searchCount = this.accountsData.length;
                this.emailTemplatesOpt = this.email.emailTemplatesOpt;
                this.pageProp = JSON.parse(JSON.stringify(this.pageProp));
                this.assignCurrentPageProp(0);
                this.show.spinner = false;
                break;
            default: {
                this.assignPageProp(0);
                this.email.subject = this.assessmentName;
                this.fetchAccountsData('');
                this.fetchEmailTempsData();
                this.subscribeToPlatformEvent('/event/SendEmailEvent__e');
            }
        }
    }
    disconnectedCallback() {
        this.show.spinner = false; this.accountsData = []; this.emailTemplatesOpt = [];
        this.assignPageProp(0);
        this.unsubscribeToPlatformEvent();
    }

    /* Assigns values to conditionally render the pages on the modal */
    assignPageProp(pageNumber) {
        this.pageProp.pageNames = [{ label: 'Choose Suppliers', name: 'chooseAccounts' }, { label: 'Compose Email', name: 'composeEmail' }];
        this.pageProp.pageInfo = {};
        this.pageProp.pageInfo.chooseAccounts = { label: 'Choose Suppliers', name: 'chooseAccounts', show: false, pageNo: 0, buttons: { prevButton: { label: "Previous", show: false }, nextButton: { label: "Next", show: true }, saveButton: false } };
        this.pageProp.pageInfo.composeEmail = { label: 'Compose Email', name: 'composeEmail', show: false, pageNo: 1, buttons: { prevButton: { label: "Previous", show: true }, nextButton: { label: "Next", show: false }, saveButton: true } };
        this.assignCurrentPageProp(pageNumber)
    }
    /* Assigns current page properties to restrict properties on UI to a particular page */
    assignCurrentPageProp(pageNumber) {
        if(typeof this.pageProp != 'undefined' && typeof this.pageProp.pageNames != 'undefined'){
            this.pageProp.pageNames.forEach(page => {
                this.pageProp.pageInfo[page.name].show = (this.pageProp.pageInfo[page.name].pageNo === pageNumber);
            });
        }
        this.currentPage = this.pageProp.pageInfo[this.pageProp.pageNames[Number(pageNumber)].name];
    }

    /* Fetches list of accounts from Apex */
    fetchAccountsData(_searchKey) {
        let _parameterMap = { assessmentId: this.assessmentId, searchKey: _searchKey };
        fetchAccounts({ parameterMap: JSON.stringify(_parameterMap) }).then(result => {
            this.accountsData = this.formatAccountsData(result);
            if (!this.trackSearchAccounts.isInitialized) {
                this.trackSearchAccounts.allAccounts = this.accountsData;
                this.trackSearchAccounts.isInitialized = true;
            }
            if (_searchKey.length < this.trackSearchAccounts.searchKey.length) {
                this.rowSelectionHandler({ detail: { selectedRows: JSON.parse(JSON.stringify(this.trackSearchAccounts.selectedAccounts)) } });
            }
            this.trackSearchAccounts.searchKey = _searchKey;
            this.show.searchCount = this.accountsData.length;
            this.show.spinner = false;
            this.show.accSearchLoading = false;
        }).catch(() => {
            this.configureToast('Error loading Accounts', 'Please contact your Administrator.', 'error');
        });
    }
    /* Formats the Account data fetched from Apex into required format so as to display as options in the combobox */
    formatAccountsData(result) {
        let accData = [];
        if(typeof result != 'undefined'){
            result.forEach(acc => {
                accData.push({ Id: acc.Rhythm__Account__c, Name: acc.Rhythm__Account__r.Name });
            });
        }
        return accData;
    }

    /* Fetches list of Email Templates from Apex */
    fetchEmailTempsData() {
        fetchEmailtemplates({}).then(result => {
            this.emailTemplatesData = JSON.parse(JSON.stringify(result));
            this.emailTemplatesData.push({ 'Id': 'null', 'Name': '--None--', Subject: this.assessmentName, Body: '' });
            this.emailTemplatesOpt = this.formatEmailTempsData(this.emailTemplatesData);
        }).catch(() => {
            this.configureToast('Error loading Email Templates', 'Please contact your Administrator.', 'error');
        })
    }
    /* Formats the Email Template data fetched from Apex into required format so as to display as options in the combobox */
    formatEmailTempsData(result) {
        let emailTemplatesOpt = [];
        if(typeof result != 'undefined'){
            result.forEach(emailtemp => {
                emailTemplatesOpt.push({ label: emailtemp.Name, value: emailtemp.Id });
            });
        }
        return emailTemplatesOpt;
    }

    /* Subscribes to Platform Event to capture the status of emails sent */
    subscribeToPlatformEvent(channelName) {
        let _this = this;
        const messageCallback = function (response) {
            if (response.data.payload.Rhythm__Source__c === 'SendEmailBatch status') {
                let status = JSON.parse(response.data.payload.Rhythm__Data__c);
                if (status.success === _this.email.selectedAccountsCount) {
                    _this.configureToast('Success', 'Successfully sent emails to ' + status.success + ' Suppliers.', 'success');
                    _this.show.spinner = false;
                    _this.closeSendEmailHandler();
                }
                else if (status.success > 0 && (this.selectedAccountsCount-status.success) > 0) {
                    _this.configureToast('Couldn\'t send email to all Suppliers', 'Succesfully sent to ' + status.success + ' Suppliers and couldn\'t send to ' + (this.selectedAccountsCount-status.success) + ' Suppliers.', 'info');
                    _this.show.spinner = false;
                    _this.closeSendEmailHandler();
                }
                else {
                    _this.configureToast('Couldn\'t send email', 'Please contact your Administrator.', 'error');
                    _this.show.spinner = false;
                    this.show.disableBtns = false;
                }
            }
        };
        subscribe(channelName, -1, messageCallback).then((response) => {
            this.subscription = response;
        });
    }
    unsubscribeToPlatformEvent() {
        unsubscribe(this.subscription, () => { });
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
    /* Displays a common error message */
    commonErrorMessage() {
        this.configureToast('Some error has occured', 'Please contact your Administrator', 'error');
    }

    /* Used to store the selected rows(accounts) in the datatable */
    rowSelectionHandler(event) {
        if (typeof this.source === 'undefined') {
            let selectedRows = [];
            for (let i = 0; i < event.detail.selectedRows.length; i++) {
                selectedRows.push(event.detail.selectedRows[i].Id);
            }
            let _accountsData = [];
            for (let i = 0; i < this.accountsData.length; i++) {
                _accountsData.push(this.accountsData[i].Id);
            }
            let selectedAccounts = [];
            this.trackSearchAccounts.selectedAccounts = [];
            for (let i = 0; i < this.trackSearchAccounts.allAccounts.length; i++) {
                if (selectedRows.includes(this.trackSearchAccounts.allAccounts[i].Id) || ((!_accountsData.includes(this.trackSearchAccounts.allAccounts[i].Id)) && this.email.selectedAccounts.includes(this.trackSearchAccounts.allAccounts[i].Id))) {
                    selectedAccounts.push(this.trackSearchAccounts.allAccounts[i].Id);
                    this.trackSearchAccounts.selectedAccounts.push(this.trackSearchAccounts.allAccounts[i]);
                }
            }
            this.email.selectedAccounts = selectedAccounts;
            this.email.selectedAccountsCount = this.email.selectedAccounts.length;
        }
    }
    /* Used to sort Data in datatable -- START*/
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                return primer(x[field]);
            }
            : function (x) {
                return x[field];
            };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }
    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.accountsData];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.accountsData = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    /* Used to sort Data in datatable -- END*/

    /* Navigates to the next page in the pop up */
    nextSendEmailHandler(event) {
        if (this.currentPage.name === 'chooseAccounts' && ((typeof this.email.selectedAccounts != 'undefined' && this.email.selectedAccounts.length <= 0) || typeof this.email.selectedAccounts === 'undefined')) {
            this.configureToast('No Suppliers chosen', 'Choose atleast 1 Supplier to proceed.', 'error');
        }
        else {
            this.assignCurrentPageProp(Number(event.currentTarget.dataset.pageno) + 1);
        }
    }
    /* Navigates to the previous page in the pop up */
    prevSendEmailHandler(event) {
        this.assignCurrentPageProp(Number(event.currentTarget.dataset.pageno) - 1);
    }
    /* Closes the pop up and navigates to the Assessment Record Page */
    closeSendEmailHandler() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.assessmentId,
                objectApiName: 'Rhythm__Assessment__c',
                actionName: 'view'
            }
        });
        eval("$A.get('e.force:refreshView').fire();");
    }
    closeModalHandler() {
        const closemodal = new CustomEvent('closemodal', {});
        this.dispatchEvent(closemodal);
    }
    /* Calls an Apex method to send an email to the Accounts selected */
    sendEmailHandler() {
        if (this.email.subject.trim() !== '' && this.email.body.trim() !== '') {
            this.show.disableBtns = true;
            this.show.spinner = true;
            this.email.assessmentId = this.assessmentId;
            if (this.email.hasCustomAttachments) {
                this.email.attachmentsData.contentDocuments = [...this.email.attachmentsData.customContentDocuments, ...this.email.attachmentsData.standardContentDocuments];   //If any standard attachment is removed, we make customAttachments to true and merge both the available standard and custom attachments as the template id wi;; be removed and custom subject and body will be used while sending email
            }
            sendEmail({ parameterMap: JSON.stringify(this.email) }).then(() => {
            }).catch(() => {
                this.commonErrorMessage();
                this.show.disableBtns = false;
            });
        }
        else {
            if (this.email.subject.trim() === '') {
                this.configureToast('Subject is empty', 'Add a subject to send the mail.', 'error');
            }
            else if (this.email.body.trim() === '') {
                this.configureToast('Body is empty', 'Enter body to send the mail.', 'error');
            }
        }
    }

    /* Handles the search functionality where the data is fetched from Apex based on the text entered in search box */
    accSearchHandler(event) {
        this.show.accSearchLoading = true;   //flags as true to show loading symbol on search box
        this.show.searchText = event.target.value;
        if (typeof this.source === 'undefined') {
            this.fetchAccountsData(this.show.searchText);   //fetches updated data from Apex as per the search text
        }
        else {
            this.accountsData = [];
            this.email.accountsData.forEach(acc => {
                if (acc.Name.toLowerCase().includes(this.show.searchText.toLowerCase())) {
                    this.accountsData.push(acc);
                }
            });
            this.show.searchCount = this.accountsData.length;
            this.show.accSearchLoading = false;
        }
    }

    /* Handles the change in email template in the combobox so as to display the latest preview of the email with updated subject, body, attachments */
    emTempChangeHandler(event) {
        for (let i = 0; i < this.emailTemplatesData.length; i++) {
            if (this.emailTemplatesData[i].Id === event.target.value) {
                this.email.templateId = event.target.value;
                this.email.subject = this.emailTemplatesData[i].Subject;
                this.email.body = this.emailTemplatesData[i].HtmlValue;
                this.email.isBuilderContent = (this.emailTemplatesData[i].IsBuilderContent === true) ? true : false;
                this.email.hasCustomAttachments = false;
                this.email.hasCustomContents = false;
                this.email.attachmentsData = {};
                this.email.attachmentsData.attachments = [];   //pill containers containing attachments to display on the screen
                this.email.attachmentsData.contentDocuments = [];   //list of contentdocument ids to add to the email
                this.email.attachmentsData.standardContentDocuments = [];   //attachments already existing with the email template
                this.email.attachmentsData.customContentDocuments = [];   //attachments added by the customer
                this.email.attachmentsData.deleteContentDocuments = [];   //all the attachments including those which were added and removed
                if (typeof this.emailTemplatesData[i].ContentDocumentLinks != 'undefined' && this.emailTemplatesData[i].ContentDocumentLinks.length > 0) {
                    this.emAddAttachments(this.emailTemplatesData[i].ContentDocumentLinks);
                }
                break;
            }
        }
    }
    /* Prepares attachments JSON to display the attachments as pill conatiners on UI */
    emAddAttachments(attachments) {
        if(typeof attachments != 'undefined'){
            attachments.forEach(attachment => {
                let a = {};
                a.type = "icon";

                /* Executes for attachments existing with the email template */
                if (typeof attachment.ContentDocument != 'undefined') {
                    a.label = attachment.ContentDocument.Title;
                    a.name = attachment.ContentDocumentId;
                    a.isStandardAttachment = true;
                    a.fileType = attachment.ContentDocument.FileType.toLowerCase();
                    this.email.attachmentsData.standardContentDocuments.push(a.name);
                }
                /* Executes for every new attachment uploaded by the customer */
                else {
                    a.label = attachment.name.slice(0, attachment.name.lastIndexOf('.'));
                    a.name = attachment.documentId;
                    a.isStandardAttachment = false;
                    a.fileType = attachment.name.slice(attachment.name.lastIndexOf('.') + 1);
                    this.email.attachmentsData.customContentDocuments.push(a.name);
                    this.email.attachmentsData.deleteContentDocuments.push(a.name);
                }

                switch (a.fileType) {
                    case 'png':
                    case 'jpg':
                    case 'jpeg': a.iconName = 'doctype:image'; break;
                    case 'docs': a.iconName = 'doctype:word'; break;
                    case 'pdf': a.iconName = 'doctype:pdf'; break;
                    case 'csv': a.iconName = 'doctype:csv'; break;
                    default: a.iconName = 'doctype:attachment'; break;
                }
                a.href = '/sfc/servlet.shepherd/document/download/' + attachment.ContentDocumentId + '?operationContext=S1'; //Creating a downloadable link
                this.email.attachmentsData.attachments.push(a);
            });
        }
    }

    /* Handles the change in email's subject */
    emSubjectChangeHandler(event) {
        this.email.hasCustomContents = true;   //flags as true to indicate the apex class not to use emailtemplate and use the custom subject and body while sending email
        this.email.subject = event.target.value;
    }
    /* Handles the change in email's body */
    emBodyChangeHandler(event) {
        this.email.hasCustomContents = true;   //flags as true to indicate the apex class not to use emailtemplate and use the custom subject and body while sending email
        this.email.body = event.target.value;
    }

    /* Handles the new attachment added i.e. adds this attachment to current previewing template */
    fileUploadHandler(event) {
        let uploadFiles = event.detail.files;   //fetches all the attachments uploaded
        this.email.hasCustomAttachments = true;   //flags as true to indicate the apex class that there are custom attachments so that these attachments will be added to the mail along with the attachments existing with email template
        if (typeof uploadFiles != 'undefined' && uploadFiles.length > 0) {
            this.emAddAttachments(uploadFiles);   //prepares attachments json to display on the screen, contentdocumentjson to attach to the email
        }
    }
    /* Removes the attachment from current previewing template */
    removeFileHandler(event) {
        let deleteFile = event.detail.item;
        if (typeof this.email != 'undefined') {
            for (let i = 0; i < this.email.attachmentsData.attachments.length; i++) {
                if (this.email.attachmentsData.attachments[i].name === deleteFile.name) {   //Checking for the file which is removed from the list of attachments
                    this.email.attachmentsData.attachments.splice(i, 1);   //Removing attachments from attachments display to remove that attachment from UI
                    if (deleteFile.isStandardAttachment) {
                        this.email.hasCustomAttachments = this.email.hasCustomContents = true;   //Emails sent using template include the attachments available with template and the extra attachments. But when the standard attachments are removed, we have to remove the templateId also so that all the standard attachments are not sent. SO, we make the customCOntents to true indicating the Apex class to remove template Id and include custom Subject and Body from the template
                        this.email.attachmentsData.standardContentDocuments.splice(this.email.attachmentsData.standardContentDocuments.indexOf(deleteFile.name), 1);   //Removing ContentDocumentId from list of standard Attachments
                    }
                    else {
                        this.email.attachmentsData.customContentDocuments.splice(this.email.attachmentsData.customContentDocuments.indexOf(deleteFile.name), 1);   //Removing ContentDocumentId from list of custom Attachments
                    } break;
                }
            }
        }
    }
}