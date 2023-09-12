import { LightningElement, track, api } from 'lwc';
import getSignedURL from '@salesforce/apex/AWSS3Controller.getFileSignedUrl';
import filesUpload from '@salesforce/apex/AWSS3Controller.uploadFiles';
import getAuthentication from '@salesforce/apex/AWSS3Controller.getAuthenticationData';
import awsjssdk from '@salesforce/resourceUrl/AWSJSSDK';
import getTemplateDetails from '@salesforce/apex/AWSS3Controller.getTemplateDetails';
import deleteContentDocument from '@salesforce/apex/AWSS3Controller.deleteContentDocument';
import Id from '@salesforce/user/Id';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AWSS3FileOperations extends LightningElement {
    @api recordId;
    @api objectApiName;
    @track userId = Id;
    @track accessKey;
    @track secretKey;
    @track region;
    @track endpoint;
    @track selectedFilesToUpload = [];
    @track fileName;
    @track file; //holding file instance
    @track myFile;
    @track fileType;//holding file type
    @track fileReaderObj;
    @track base64FileData;
    @track s3;
    @track keyList = [];
    @track getFilesFlag = true;
    @track renderFlag = true;
    @track disableFlag = false;
    heightStyle = 'height:300px;';
    previewUrl;
    keyString;
    fileKey;
    showDeleteModal = false;
    showFrame = false;
    noFilesContent = 'No Files Uploaded...';
    noPreviewContent = 'No Preview Content...';
    @api showUpload;
    @api isupload;

    //Accept File Formats
    get acceptedFormats() {
        return ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.txt', '.docx', '.doc'];
    }

    connectedCallback() {
        if (this.objectApiName === 'Rhythm__Assessment_Template__c') {
            getTemplateDetails({ templateId: this.recordId })
                .then(result => {
                    this.disableFlag = result;
                    if (result === true) {
                        this.heightStyle = 'height:387px;';
                    }
                });
        }
        else if (this.objectApiName === 'Rhythm__Action__c') {
            if (this.showUpload === '' || this.showUpload === undefined) {
                this.disableFlag = false;
            }
            else {
                this.disableFlag = !(this.isupload);
                if (this.disableFlag === true) {
                    this.heightStyle = 'height:387px;';
                }
            }
        }
        else {
            this.disableFlag = false;
        }

        Promise.all([
            loadScript(this, awsjssdk),
        ])
            .then(() => {
                this.configAWS();
            });
    }

    renderedCallback() {
        Promise.all([
            loadScript(this, awsjssdk),
        ])
            .then(() => {
                setTimeout(() => {
                    this.configAWS();
                }, 100);
            });
    }

    //AWS configuration
    configAWS() {
        if (this.renderFlag === true) {
            getAuthentication({})
                .then(result => {
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

    // Retrieve the files from S3 folder
    async retrieveFilesFromS3() {
        const folderName = this.objectApiName + '/' + this.recordId + '/';
        this.s3.listObjects({ Bucket: this.bucketName, Prefix: folderName }, (err, data) => {
            if (err) {
                
            } else {
                const files = data.Contents;
                let fileList = [];
                this.keyList = [];
                files && files.forEach(file => {
                    let checkFile = file.Key.split('/')
                    if (checkFile[checkFile.length - 1] != null && checkFile[checkFile.length - 1] != '') {
                        const objectKey = file.Key;
                        let fileName = objectKey.substring(objectKey.lastIndexOf("/") + 1);
                        let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
                        if (fileExtension === 'doc' || fileExtension === 'docx' || fileExtension === 'xls' || fileExtension === 'xlsx') {
                            fileList.push({ type: fileExtension, preview: false, key: objectKey, url: this.endpoint + '/' + objectKey, value: fileName.substring(fileName.indexOf("_") + 1) });
                        }
                        else {
                            fileList.push({ type: fileExtension, preview: true, key: objectKey, url: this.endpoint + '/' + objectKey, value: fileName.substring(fileName.indexOf("_") + 1) });
                        }
                    }
                });
                this.keyList = fileList.reverse();
                if (this.keyList.length > 0) {
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
            }
        });
    }


    //Download the file from AWS S3
    handleDownload(event) {
        getSignedURL({
            location: event.target.title,
            file: event.currentTarget.dataset.id,
            expires: 30
        })
            .then(result => {
                if (result) {
                    window.open(result);
                }
            });
    }

    //Open Delete Modal Popup
    handleDeletePopup(event) {
        this.fileKey = event.target.name;
        this.keyString = this.fileKey.replace(this.endpoint + '/', '');
        if (this.keyString.includes(this.userId)) {
            this.showDeleteModal = true;
        }
        else {
            this.showToastMessage('No Delete Access', 'You do not have access to delete this file', 'error');
        }
    }

    //Close Delete Modal Popup
    handleCloseDelPopup() {
        this.showDeleteModal = false;
    }

    //Delete File from AWS S3
    handleDeleteFile() {
        this.handleCloseDelPopup();
        this.renderFlag = true;
        this.configAWS();
        const params = {
            Bucket: this.bucketName,
            Key: this.keyString
        };
        this.s3.deleteObject(params, (error, data) => {
            if (data) {
                let fileName = this.fileKey.substring(this.fileKey.lastIndexOf("/") + 1);
                this.showToastMessage('Deleted', fileName.substring(fileName.indexOf("_") + 1) + ' - Deleted Successfully', 'success');
                this.fileKey = '';
                this.keyString = '';
                this.previewUrl = '';
                this.showFrame = false;
            }
        });
    }

    handleUploadFiles() {
        filesUpload({
            recId: this.recordId, objectName: this.objectApiName, pathRecId: null, deleteFlag: true, userId: this.userId
        }).then(result => {
            if (result) {
                this.renderFlag = true;
                this.showToastMessage('Uploaded', 'Uploaded Successfully', 'success');
            }
            else {
                this.showToastMessage('Exceeded File Limit', 'The maximum file size you can upload is 10 MB', 'error');
            }
        })
            .catch(error => {
                //window.console.log(error);
            });
    }

    //Upload files to AWS after uploaded successfully to salesforce
    handleUploadFinished() {
        if (this.objectApiName === 'Rhythm__Assessment_Template__c') {
            getTemplateDetails({ templateId: this.recordId })
                .then(result => {
                    this.disableFlag = result;
                    if (result === true) {
                        this.heightStyle = 'height:387px;';
                        deleteContentDocument({ recordId: this.recordId })
                            .then(result => {
                                this.showToastMessage('Error', 'Template status is changed to active, further changes cannot be made to it.', 'error');
                            });
                    }
                    else {
                        this.handleUploadFiles();
                    }
                });
        }
        else {
            this.handleUploadFiles();
        }
    }

    //Toast Message handler
    async showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
        this.renderFlag = true;
        this.configAWS();
        //eval("$A.get('e.force:refreshView').fire();");
    }

    //Preivew File
    filePreview(event) {
        getSignedURL({
            location: event.target.title,
            file: event.currentTarget.dataset.id,
            expires: 30,
        })
            .then(result => {
                if (result) {
                    this.previewUrl = result;
                    this.showFrame = true;
                }
            });
    }
}