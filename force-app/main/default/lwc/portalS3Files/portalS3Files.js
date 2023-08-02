import { LightningElement, track, api } from 'lwc';
import getSignedURL from '@salesforce/apex/AWSS3Controller.getFileSignedUrl';
import filesUpload from '@salesforce/apex/AWSS3Controller.uploadFiles';
import getAuthentication from '@salesforce/apex/AWSS3Controller.getAuthenticationData';
import awsjssdk from '@salesforce/resourceUrl/AWSJSSDK';
import { loadScript } from 'lightning/platformResourceLoader';
import createResponseforFileUpload from '@salesforce/apex/AWSS3Controller.createResponseforFileUpload';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AWSS3FileOperations extends LightningElement {
    @api assessmentRecId;
    @api recId;
    @api questionId;
    @api objectName;
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
    @track getFilesFlag = false;
    @track renderFlag = true;
    previewUrl;
    keyString;
    fileKey;
    showDeleteModal = false;
    showFrame = false;
    fileRecordID;
    @api responseRecId;


    //Accept File Formats
    get acceptedFormats() {
        return ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.txt', '.docx', '.doc'];
    }

    connectedCallback() {
        console.log(this.responseRecId);
        if ((this.recId === null || this.recId === undefined) && this.assessmentRecId != null) {
            this.fileRecordID = this.assessmentRecId;
        }
        else {
            this.fileRecordID = this.recId;
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
        const folderName = this.objectName + '/' + this.responseRecId + '/';
        this.s3.listObjects({ Bucket: this.bucketName, Prefix: folderName }, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const files = data.Contents;
                let fileList = [];
                this.keyList = [];
                files && files.forEach(file => {
                    const objectKey = file.Key;
                    fileList.push({ key: objectKey, url: this.endpoint + '/' + objectKey, value: objectKey.substring(objectKey.lastIndexOf("/") + 1) });
                });
                this.keyList = fileList.reverse();
                if (this.keyList.length != 0) {
                    this.getFilesFlag = true;
                }
                else {
                    this.getFilesFlag = false;
                }
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
                    //this.previewUrl = result;
                    window.open(result);
                }
            });
    }

    //Open Delete Modal Popup
    handleDeletePopup(event) {
        this.showDeleteModal = true;
        this.fileKey = event.target.name;
        this.keyString = this.fileKey.replace(this.endpoint + '/', '');
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
                this.showToastMessage('Deleted', this.fileKey.substring(this.fileKey.lastIndexOf("/") + 1) + ' - Deleted Successfully', 'success');
                this.fileKey = '';
                this.keyString = '';
                this.previewUrl = '';
                this.showFrame = false;
            }
        });
    }


    //Upload files to AWS after uploaded successfully to salesforce
    handleUploadFinished(event) {
        if (this.responseRecId == null) {
            let filemap = {};
            filemap.quesId = this.questionId;
            filemap.assessmentId = this.fileRecordID;
            createResponseforFileUpload({
                fileResp: JSON.stringify(filemap)
            }).then(rec => {
                if (rec) {
                    this.responseRecId = rec;
                    filesUpload({
                        recId: this.fileRecordID, objectName: this.objectName, pathRecId: rec, deleteFlag: true
                    }).then(result => {
                        if (result) {
                            this.renderFlag = true;
                            this.showToastMessage('Uploaded', 'Uploaded Successfully', 'success');
                            const selectedEvent = new CustomEvent('getdata', {
                                detail: event.detail
                            });
                            // Dispatches the event.
                            this.dispatchEvent(selectedEvent);
                        }
                        else {
                            this.showToastMessage('Exceeded File Limit', 'The maximum file size you can upload is 10 MB', 'error');
                        }
                    })
                        .catch(error => {
                            window.console.log(error);
                        });
                }
            }).catch(error => {
                console.error(error);
            });

        }
        else {
            filesUpload({
                recId: this.fileRecordID, objectName: this.objectName, pathRecId: this.responseRecId, deleteFlag: true
            }).then(result => {
                if (result) {
                    this.renderFlag = true;
                    this.showToastMessage('Uploaded', 'Uploaded Successfully', 'success');
                    const selectedEvent = new CustomEvent('getdata', {
                                detail: event.detail
                            });
                            // Dispatches the event.
                            this.dispatchEvent(selectedEvent);
                }
                else {
                    this.showToastMessage('Exceeded File Limit', 'The maximum file size you can upload is 10 MB', 'error');
                }
            })
                .catch(error => {
                    window.console.log(error);
                });
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
        //this.retrieveFilesFromS3();
    }

    //Preivew File
    filePreview(event) {
        getSignedURL({
            location: event.target.title,
            file: event.currentTarget.dataset.id,
            expires: 30,
            ContentType: 'image/png'
        })
            .then(result => {
                if (result) {
                    this.previewUrl = result;
                    this.showFrame = true;
                }
            });
    }
}