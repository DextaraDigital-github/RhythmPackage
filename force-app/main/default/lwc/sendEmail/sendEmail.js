import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import sendEmail from '@salesforce/apex/EmailController.sendEmail';
import getSignedURL from '@salesforce/apex/AWSS3Controller.getFileSignedUrl';
import getAuthentication from '@salesforce/apex/AWSS3Controller.getAuthenticationData';
import awsjssdk from '@salesforce/resourceUrl/AWSJSSDK';
import { loadScript } from 'lightning/platformResourceLoader';

export default class SendEmail extends NavigationMixin(LightningElement) {
    @api open = false;
    @api whatId;   // Stores the What Id coming from Aura Component
    @api whatName;   // Stores the What Name coming from Aura Component
    @api recipientsData = [];   // Stores list of recipients
    @api recipientsDataTemp;
    @api pageLabelsData;   // Contains labels of the pages in the modal popup
    @track columns = [{ fieldName: 'Name', label: 'Name', sortable: true }];
    @track pagesData;   // Contains page navigations
    @track pagesList;   // Contains list of page Names to avoid looping wherever necessary
    @track show = { spinner: false, showAttachments: false, recSearchKey: '', recSearchCount: { value: 0, show: false }, recSearchLoading: false };   // Conditonally renders/displays data on UI
    @track currentPage;   // Contains current page details of the modal popup
    @track email = { whatId: '', subject: '', body: '', isBuilderContent: false, selectedRecipientsCount: 0, selectedRecipients: [], selectedRecipientsData: '', templateId: '', hasCustomContents: false, attachmentsData: { attachments: [], contentDocuments: [], deleteContentDocuments: [] } };   // Stores data regarding the email which is to be sent
    @track trackSearchRecipients = { searchKey: '', allRecipients: [], selectedRecipients: [] };
    @api isReadOnly = false;

    /* S3 File Upload Code -- START */
    @track objectApiName = 'EmailMessage';
    @track accessKey;
    @track secretKey;
    @track region;
    @track endpoint;
    @track selectedFilesToUpload = [];
    @track fileName;
    @track file;   //holding file instance
    @track myFile;
    @track fileType;   //holding file type
    @track fileReaderObj;
    @track base64FileData;
    @track s3;
    @track keyList = [];
    @track getFilesFlag = false;
    @track renderFlag = true;
    previewUrl;
    keyString;
    fileKey;
    showDeleteModal = false;
    showFrame = false;
    /* Accept File Formats */
    get acceptedFormats() {
        return ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.txt', '.docx', '.doc'];
    }
    /* AWS configuration */
    configAWS() {
        if (this.renderFlag === true) {
            getAuthentication({}).then(result => {
                if (result) {
                    let metadataRecs = JSON.parse(JSON.stringify(result));
                    metadataRecs && metadataRecs.forEach(rec => {
                        (rec["DeveloperName"] === 'region') && (this.region = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] === 'accessKey') && (this.accessKey = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] === 'secretKey') && (this.secretKey = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] === 's3bucket') && (this.bucketName = rec["Rhythm__Value__c"]);
                        (rec["DeveloperName"] === 'endpoint') && (this.endpoint = rec["Rhythm__Value__c"]);
                    });
                    const AWS = window.AWS;
                    AWS.config.update({
                        accessKeyId: this.accessKey,//Assigning access key id
                        secretAccessKey: this.secretKey,//Assigning secret access key
                        region_config: this.region
                    });
                    this.s3 = new AWS.S3({
                        params: {
                            Bucket: this.bucketName //Assigning S3 bucket name
                        }
                    });
                    this.renderFlag = false;
                    this.retrieveFilesFromS3();
                }
            });
        }
        else {
            this.retrieveFilesFromS3();
        }
    }
    /* Retrieve the files from S3 folder */
    async retrieveFilesFromS3() {
        const folderName = this.objectApiName + '/' + this.email.emailMessageId + '/';
        this.s3.listObjects({ Bucket: this.bucketName, Prefix: folderName }, (err, data) => {
            if (err) {
                console.error(err);
            }
            else {
                const files = data.Contents;
                let fileList = [];
                this.keyList = [];
                files && files.forEach(file => {
                    const objectKey = file.Key;
                    let fileName = objectKey.substring(objectKey.lastIndexOf("/") + 1);
                    let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                    if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx') {
                        fileList.push({ type: fileExtension, preview: false, key: objectKey, url: this.endpoint + '/' + objectKey, value: fileName.substring(fileName.indexOf("_") + 1) });
                    }
                    else {
                        fileList.push({ type: fileExtension, preview: true, key: objectKey, url: this.endpoint + '/' + objectKey, value: fileName.substring(fileName.indexOf("_") + 1) });
                    }
                });
                this.keyList = fileList.reverse();
                if (this.keyList.length != 0) {
                    this.getFilesFlag = true;
                }
                else {
                    this.getFilesFlag = false;
                }
                this.keyList && this.keyList.forEach(rec => {
                    rec.icon = ((rec).type === 'png') ? 'doctype:image' :
                        ((rec).type === 'pdf') ? 'doctype:pdf' :
                            ((rec).type === 'jpg') ? 'doctype:image' :
                                ((rec).type === 'jpeg') ? 'doctype:image' :
                                    ((rec).type === 'xlsx') ? 'doctype:excel' :
                                        ((rec).type === 'xls') ? 'doctype:excel' :
                                            ((rec).type === 'txt') ? 'doctype:txt' :
                                                ((rec).type === 'docx' || (rec).type === 'doc') ? 'doctype:word' : 'doctype:flash';
                });
                if(typeof this.keyList != 'undefined' && this.keyList.length > 0) {
                    this.show.showAttachments = true;
                }
            }
        });
    }
    /* Download the file from AWS S3 */
    handleDownload(event) {
        getSignedURL({
            location: event.currentTarget.dataset.title,
            file: event.currentTarget.dataset.id,
            expires: 30
        }).then(result => {
            if (result) {
                window.open(result);
            }
        });
    }
    /* S3 File Upload Code -- END */

    @api get recipients() {
        return this.recipientsData;
    }
    set recipients(value) {
        this.recipientsData = value;
        this.recipientsDataTemp = (typeof value !== 'undefined') ? JSON.parse(JSON.stringify(value)) : [];
        this.trackSearchRecipients.allRecipients = (typeof value !== 'undefined') ? JSON.parse(JSON.stringify(value)) : [];
    }

    @api get emailData() {
        return this.email;
    }
    set emailData(value) {
        this.email = JSON.parse(JSON.stringify(value));
    }

    @api
    send() {
        this.initializeAttributes();
    }
    connectedCallback() {
        Promise.all([
            loadScript(this, awsjssdk),
        ]).then(() => {
            this.configAWS();
        });
    }
    renderedCallback() {
        Promise.all([
            loadScript(this, awsjssdk),
        ]).then(() => {
            setTimeout(() => {
                this.configAWS();
            }, 100);
        });
    }
    /* Initializes the attributes */
    initializeAttributes() {
        this.assignPagesData();
        this.email.subject = this.whatName;
        this.trackSearchRecipients.searchKey;
        this.trackSearchRecipients.selectedRecipients = [];
        this.show.recSearchKey = '';
        this.show.recSearchCount = { value: 0, show: false };
        this.show.recSearchLoading = false;
    }
    assignPagesData() {
        if (JSON.parse(JSON.stringify(this.isReadOnly))) {
            this.pagesList = ['chooseRecipients', 'composeEmail'];
            this.pagesData = {
                chooseRecipients: {
                    label: (typeof this.pageLabelsData != 'undefined' && typeof this.pageLabelsData.page1 != 'undefined') ? this.pageLabelsData.page1 : 'View Suppliers', name: 'chooseRecipients', show: true, pageNo: 1, buttons: {
                        previous: { label: 'View Suppliers', name: 'previous', disabled: false, show: false },
                        next: { label: 'View Email', name: 'next', variant: 'brand', disabled: false, show: true },
                        cancel: { label: 'Close', name: 'close', disabled: false, show: true }
                    }
                },
                composeEmail: {
                    label: (typeof this.pageLabelsData != 'undefined' && typeof this.pageLabelsData.page2 != 'undefined') ? this.pageLabelsData.page2 : 'View Email', name: 'composeEmail', show: false, pageNo: 2, buttons: {
                        previous: { label: 'View Suppliers', name: 'previous', disabled: false, show: true },
                        next: { label: 'View Email', name: 'send', variant: 'brand', disabled: false, show: false },
                        cancel: { label: 'Close', name: 'close', disabled: false, show: true }
                    }
                }
            }
            this.columns = [{ fieldName: 'Name', label: 'Name', sortable: true }, { fieldName: 'Email', label: 'Email', sortable: true }, { fieldName: 'Status', label: 'Email Status', sortable: true }]
        }
        else {
            this.pagesList = ['chooseRecipients', 'composeEmail'];
            this.pagesData = {
                chooseRecipients: {
                    label: (typeof this.pageLabelsData != 'undefined' && typeof this.pageLabelsData.page1 != 'undefined') ? this.pageLabelsData.page1 : 'Choose Recipients', name: 'chooseRecipients', show: true, pageNo: 1, footerButtons: {
                        previous: { label: 'Previous', name: 'previous', disabled: false, show: false },
                        next: { label: 'Next', name: 'next', variant: 'brand', disabled: false, show: true },
                        cancel: { label: 'Cancel', name: 'cancel', disabled: false, show: true }
                    }
                },
                composeEmail: {
                    label: (typeof this.pageLabelsData != 'undefined' && typeof this.pageLabelsData.page2 != 'undefined') ? this.pageLabelsData.page2 : 'Compose Email', name: 'composeEmail', show: false, pageNo: 2, footerButtons: {
                        previous: { label: 'Previous', name: 'previous', disabled: false, show: true },
                        next: { label: 'Send', name: 'send', variant: 'brand', disabled: false, show: true },
                        cancel: { label: 'Cancel', name: 'cancel', disabled: false, show: true }
                    }
                }
            }
        }
        this.assignCurrentPage(1);
        this.open = true;
    }

    /* Configures toast message to diplay on UI */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    /* Assigns current page properties based on the page number */
    assignCurrentPage(pageNo) {
        if (typeof this.pagesData != 'undefined' && this.pagesList != 'undefined') {
            this.pagesList.forEach(page => {
                this.pagesData[page].show = (this.pagesData[page].pageNo === pageNo);
            });
            this.currentPage = this.pagesData[this.pagesList[pageNo - 1]];
        }
    }

    /* Used to store the selected rows of the datatable */
    rowSelectionHandler(event) {
        let selectedRows = [];
        for (let i = 0; i < event.detail.selectedRows.length; i++) {
            selectedRows.push(event.detail.selectedRows[i].Id);
        }
        let _recipientsData = [];
        for (let i = 0; i < this.recipientsData.length; i++) {
            _recipientsData.push(this.recipientsData[i].Id);
        }
        let _selectedRecipients = [];
        this.trackSearchRecipients.selectedRecipients = [];
        for (let i = 0; i < this.trackSearchRecipients.allRecipients.length; i++) {
            if (selectedRows.includes(this.trackSearchRecipients.allRecipients[i].Id) || ((!_recipientsData.includes(this.trackSearchRecipients.allRecipients[i].Id)) && this.email.selectedRecipients.includes(this.trackSearchRecipients.allRecipients[i].Id))) {
                _selectedRecipients.push(this.trackSearchRecipients.allRecipients[i].Id);
                this.trackSearchRecipients.selectedRecipients.push(this.trackSearchRecipients.allRecipients[i]);
            }
        }
        this.email.selectedRecipients = _selectedRecipients;
        this.email.selectedRecipientsCount = this.email.selectedRecipients.length;
    }

    /* Sort functionality in datatable -- START*/
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
        const cloneData = [...this.recipientsData];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.recipientsData = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    /* Sort functionality in datatable -- END */

    /* Navigates to the previous page in the pop up */
    previousModalHandler(event) {
        this.assignCurrentPage(Number(event.currentTarget.dataset.pageno) - 1);
    }
    /* Navigates to the next page in the pop up */
    nextModalHandler(event) {
        if (event.currentTarget.dataset.name === 'send') {
            this.sendEmailHandler();
        }
        else {
            if (this.isReadOnly === false && this.currentPage.name === 'chooseRecipients' && ((typeof this.email.selectedRecipients != 'undefined' && this.email.selectedRecipients.length <= 0) || typeof this.email.selectedRecipients === 'undefined')) {
                this.configureToast('No Recipients chosen', 'Choose atleast 1 Recipient to proceed.', 'error');
            }
            else {
                this.assignCurrentPage(Number(event.currentTarget.dataset.pageno) + 1);
            }
        }
    }
    /* Closes the pop up and navigates to the record page */
    cancelModalHandler() {
        if (this.isReadOnly) {
            this.open = false;
        }
        else {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.whatId,
                    objectApiName: 'Rhythm__Assessment__c',
                    actionName: 'view'
                }
            });
        }
    }
    /* Sends an Email */
    sendEmailHandler() {
        if (this.email.subject.trim() !== '' && this.email.body.trim() !== '') {
            this.currentPage.footerButtons.next.disabled = this.currentPage.footerButtons.cancel.disabled = this.currentPage.footerButtons.previous.disabled = true;
            this.show.spinner = true;
            this.email.whatId = this.whatId;
            this.createRecipientsMap();
            sendEmail({ parameterMap: JSON.stringify(this.email) }).then(() => {
                this.configureToast('Sending Emails', 'Emails will be sent to the selected Suppliers shortly.', 'success');
                this.email = { whatId: '', subject: '', body: '', isBuilderContent: false, selectedRecipientsCount: 0, selectedRecipients: [], selectedRecipientsData: '', templateId: '', hasCustomContents: false, attachmentsData: { attachments: [], contentDocuments: [], deleteContentDocuments: [] } };   // Stores data regarding the email which is to be sent
                this.initializeAttributes();
                this.show.spinner = false;
                this.currentPage.footerButtons.next.disabled = this.currentPage.footerButtons.cancel.disabled = this.currentPage.footerButtons.previous.disabled = false;
                this.cancelModalHandler();
            }).catch(() => {
                this.configureToast('Some error has occured', 'Please contact your Administrator', 'error');
                this.show.spinner = false;
                this.currentPage.footerButtons.next.disabled = this.currentPage.footerButtons.cancel.disabled = this.currentPage.footerButtons.previous.disabled = false;
            });
        }
        else {
            if (this.email.subject.trim() === '') {
                this.configureToast('Subject can\'t be empty', 'Add a subject to send the mail.', 'error');
            }
            else if (this.email.body.trim() === '') {
                this.configureToast('Message can\'t be empty', 'Type a Message to send the mail.', 'error');
            }
        }
    }
    /* Creates a map to access recipients data easily */
    createRecipientsMap() {
        let _selectedRecipientsJson = {};
        this.recipientsDataTemp.filter(rec1 => { return this.email.selectedRecipients.includes(rec1.Id) }).forEach(rec2 => {
            _selectedRecipientsJson[rec2.Id] = rec2;
        });
        this.email.selectedRecipientsData = JSON.stringify(_selectedRecipientsJson);
    }

    /* Handles the search functionality where the data is fetched from Apex based on the text entered in search box */
    recSearchHandler(event) {
        if (typeof this.trackSearchRecipients.allRecipients != 'undefined' && this.trackSearchRecipients.allRecipients.length > 0) {
            this.show.recSearchLoading = true;   //flags as true to show loading symbol on search box
            this.show.recSearchKey = event.target.value;

            this.recipientsData = this.searchRecipients(this.trackSearchRecipients.allRecipients);

            if (!this.isReadOnly) {
                if (this.show.recSearchKey.length < this.trackSearchRecipients.searchKey.length) {
                    this.rowSelectionHandler({ detail: { selectedRows: JSON.parse(JSON.stringify(this.trackSearchRecipients.selectedRecipients)) } });
                }
                this.trackSearchRecipients.searchKey = this.show.recSearchKey;
            }

            this.show.recSearchCount.value = this.recipientsData.length;
            this.show.recSearchCount.show = (this.show.recSearchKey != '') ? true : false;
            this.show.recSearchLoading = false;
        }
    }
    /* Filters recipient records as per the serach key */
    searchRecipients(_recipientsDataTemp) {
        let _recipientsData = [];
        for (let i = 0; i < _recipientsDataTemp.length; i++) {
            if (_recipientsDataTemp[i].Name.toLowerCase().includes(this.show.recSearchKey.toLowerCase())) {
                _recipientsData.push(_recipientsDataTemp[i]);
            }
        }
        return _recipientsData;
    }

    /* Prepares attachments JSON to display the attachments as pill conatiners on UI */
    addAttachments(attachments) {
        if (typeof attachments != 'undefined') {
            this.email.hasCustomContents = true;
            attachments.forEach(attachment => {
                let a = {};
                a.type = "icon";

                /* Executes for attachments existing with the email template */
                if (typeof attachment.ContentDocument != 'undefined') {
                    a.label = attachment.ContentDocument.Title;
                    a.name = attachment.ContentDocumentId;
                    a.fileType = attachment.ContentDocument.FileType.toLowerCase();
                    a.href = '/sfc/servlet.shepherd/document/download/' + attachment.ContentDocumentId + '?operationContext=S1'; //Creating a downloadable link
                }
                /* Executes for every new attachment uploaded by the customer */
                else {
                    a.label = attachment.name.slice(0, attachment.name.lastIndexOf('.'));
                    a.name = attachment.documentId;
                    a.fileType = attachment.name.slice(attachment.name.lastIndexOf('.') + 1);
                    a.href = '/sfc/servlet.shepherd/document/download/' + attachment.documentId + '?operationContext=S1'; //Creating a downloadable link
                }
                this.email.attachmentsData.contentDocuments.push(a.name);
                this.email.attachmentsData.deleteContentDocuments.push(a.name);

                switch (a.fileType) {
                    case 'png':
                    case 'jpg':
                    case 'jpeg': a.iconName = 'doctype:image'; break;
                    case 'docs': a.iconName = 'doctype:word'; break;
                    case 'pdf': a.iconName = 'doctype:pdf'; break;
                    case 'csv': a.iconName = 'doctype:csv'; break;
                    default: a.iconName = 'doctype:attachment'; break;
                }
                this.email.attachmentsData.attachments.push(a);
            });
        }
    }

    /* Handles the change in email's subject */
    subjectChangeHandler(event) {
        this.email.hasCustomContents = true;   //flags as true to indicate the apex class not to use emailtemplate and use the custom subject and body while sending email
        this.email.subject = event.target.value;
    }
    /* Handles the change in email's body */
    bodyChangeHandler(event) {
        this.email.hasCustomContents = true;   //flags as true to indicate the apex class not to use emailtemplate and use the custom subject and body while sending email
        this.email.body = event.target.value;
    }

    /* Handles the new attachment added i.e. adds this attachment to current previewing template */
    fileUploadHandler(event) {
        let uploadFiles = event.detail.files;   //fetches all the attachments uploaded
        if (typeof uploadFiles != 'undefined' && uploadFiles.length > 0) {
            this.addAttachments(uploadFiles);   //prepares attachments json to display on the screen, contentdocumentjson to attach to the email
        }
    }
    /* Removes the attachment from current previewing template */
    removeFileHandler(event) {
        let deleteFile = event.detail.item;
        if (typeof this.email != 'undefined') {
            for (let i = 0; i < this.email.attachmentsData.attachments.length; i++) {
                if (this.email.attachmentsData.attachments[i].name === deleteFile.name) {   //Checking for the file which is removed from the list of attachments
                    this.email.attachmentsData.attachments.splice(i, 1);   //Removing attachments from attachments display to remove that attachment from UI
                    this.email.attachmentsData.contentDocuments.splice(this.email.attachmentsData.contentDocuments.indexOf(deleteFile.name), 1);   //Removing ContentDocumentId which will be sent to Apex
                    break;
                }
            }
        }
    }
}