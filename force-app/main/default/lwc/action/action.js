import { LightningElement, api, track, wire } from 'lwc';
import getPicklistValues from '@salesforce/apex/CAPAController.getPicklistValues';
import saveActionResponse from '@salesforce/apex/CAPAController.saveActionResponse';
import getActionResponse from '@salesforce/apex/CAPAController.getActionResponse';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import deleteActionData from '@salesforce/apex/CAPAController.deleteActionData';
import send from '@salesforce/apex/CAPAController.send';
import notifyUsers from '@salesforce/apex/CAPAController.notifyUsers';
import getSignedURL from '@salesforce/apex/AWSS3Controller.getFileSignedUrl';
import filesUpload from '@salesforce/apex/AWSS3Controller.uploadFiles';
import saveActionRecord from '@salesforce/apex/AWSS3Controller.saveActionRecord';
import getAuthentication from '@salesforce/apex/AWSS3Controller.getAuthenticationData';
import awsjssdk from '@salesforce/resourceUrl/AWSJSSDK';
import Id from '@salesforce/user/Id';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Action extends LightningElement {
  @track pickListNames = [];
  @track userId = Id;
  @api showresponse;
  @track questionId;
  @track accountAssessmentId;
  @track responseMap = {};
  @track saveActionResponse = {};
  @track resultdata;
  @track showPicklist = false;
  @track showCustom = false;
  @track showForm = false;
  @track onloadPicklist;
  @track showUpdate = false;
  @track showToast = false;
  @track totastmessage = '';
  @track success = false;
  @track showPopup = false;
  @track updateData;
  @track isSupplier;
  @track isSave = false;
  @track showAction = false;
  @track loading=false;

  @track lookupLabel = ['Ownership', 'Assigned To'];
  @track options = [{ label: 'Open', value: 'Open' },
  { label: 'Closed', value: 'Closed' }
  ];
  /* S3 Code Starts*/
  @track recId;
  @track objectApiName = 'Rhythm__Action__c';
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
  @track renderRetriveFlag = 0;
  @track renderFlag = true;
  @track newFlag = false;
  @track relatedRecordName;
  @track optionsData;
  @track isLabel;
  previewUrl;
  keyString;
  fileKey;
  showDeleteModal = false;
  //Accept File Formats
  get acceptedFormats() {
    return ['.pdf', '.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.txt', '.docx', '.doc'];
  }
  connectedCallback() {
    Promise.all([
      loadScript(this, awsjssdk),
    ])
      .then(() => {
        this.configAWS();
      });
      this.handleGetpicklistvalue();
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
            this.renderRetriveFlag = 0;
            this.retrieveFilesFromS3();
          }
        });
    }
    else {
      if (this.renderRetriveFlag < 1) {
        this.retrieveFilesFromS3();
      }
    }
  }

  // Retrieve the files from S3 folder
  retrieveFilesFromS3() {
    const folderName = this.objectApiName + '/' + this.responseMap.Id + '/';
    this.s3.listObjects({ Bucket: this.bucketName, Prefix: folderName }, (err, data) => {
      if (err) {
        console.error(err);
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
        this.showToastMessage('Deleted', this.fileKey.substring(this.fileKey.lastIndexOf("/") + 1) + ' - Deleted Successfully', 'success');
        this.fileKey = '';
        this.keyString = '';
        this.previewUrl = '';
        this.showFrame = false;
      }
    });
  }
  //Upload files to AWS after uploaded successfully to salesforce
  handleUploadFinished() {
    if (this.responseMap.Id != null) {
      filesUpload({
        recId: this.accountAssessmentId, objectName: this.objectApiName, pathRecId: this.responseMap.Id, deleteFlag: true, userId: this.userId
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
          window.console.log(error);
        });
    }
    else {
      var userMap = {};
      let actionResp = [];
      //this.saveActionResponse = this.responseMap;
      this.saveActionResponse.sobjectType = 'Rhythm__Action__c';
      this.saveActionResponse.Rhythm__Question__c = this.questionId;
      this.saveActionResponse.Rhythm__AccountAssessment__c = this.accountAssessmentId;
      actionResp.push(JSON.parse(JSON.stringify(this.saveActionResponse)));
      saveActionRecord({ actionResponse: actionResp }).then((res) => {
        this.responseMap.Id = res;
        filesUpload({
          recId: this.accountAssessmentId, objectName: this.objectApiName, pathRecId: res, deleteFlag: true, userId: this.userId
        }).then(result => {
          if (result) {
            this.showCustom = true;
            this.showUpdate = true;
            this.showPicklist = true;
            this.saveActionResponse.saveActionForm = true;
            this.renderFlag = true;
            const selectedAction = new CustomEvent('closeform', {
              detail: this.saveActionResponse
            });
            this.dispatchEvent(selectedAction);
            this.showToastMessage('Uploaded', 'Uploaded Successfully', 'success');
          }
          else {
            this.showToastMessage('Exceeded File Limit', 'The maximum file size you can upload is 10 MB', 'error');
          }
        })
          .catch(error => {
            window.console.log(error);
          });
      }).catch(error => {
      });
    }
  }
  handleGetpicklistvalue(){
    getPicklistValues({}).then(data=>{
      console.log('handleGetpicklistvalue',data);
      if (data) {
      this.pickListNames = [];
      for (let key in data) {
        let pickListNamedata = [];
        data[key].forEach(item => {
          let map = { 'label': item, 'value': item };
          pickListNamedata.push(map);
        });
        let obj = {};
        obj.key = key;
        let labelname = key.substring(8, key.length - 3);
        labelname = labelname.replaceAll('_', ' ');
        obj.label = labelname;
        obj.options = pickListNamedata;
        if (obj.label === 'Priority' || obj.label === 'Status') {
          obj.required = true;
        }
        else {
          obj.required = false;
        }
        this.pickListNames.push(obj);
      }
      this.onloadPicklist = this.pickListNames;
      console.log('picklist', this.onloadPicklist);
    }
    }).catch(error=>{

    })
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
  /* S3 Code Ends*/
  // @wire(getPicklistValues, {})
  // picklistdata({ error, data }) {
  //   if (data) {
  //     this.pickListNames = [];
  //     for (let key in data) {
  //       let pickListNamedata = [];
  //       data[key].forEach(item => {
  //         let map = { 'label': item, 'value': item };
  //         pickListNamedata.push(map);
  //       });
  //       let obj = {};
  //       obj.key = key;
  //       let labelname = key.substring(8, key.length - 3);
  //       labelname = labelname.replaceAll('_', ' ');
  //       obj.label = labelname;
  //       obj.options = pickListNamedata;
  //       if (obj.label === 'Priority' || obj.label === 'Status') {
  //         obj.required = true;
  //       }
  //       else {
  //         obj.required = false;
  //       }
  //       this.pickListNames.push(obj);
  //     }
  //     this.onloadPicklist = this.pickListNames;
  //     console.log('picklist', this.onloadPicklist);
  //   } else if (error) {
  //     let errormap = {};
  //     errormap.componentName = 'Action';
  //     errormap.methodName = 'getPicklistValues';
  //     errormap.className = 'AssessmentController';
  //     errormap.errorData = error;
  //     errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
  //   }
  // }

  @api displayForm(response) {
    this.showAction = true;
    this.loading=true;
     this.isSupplier = response[0].isSupplier;
    console.log('jjj', response);
    if (typeof response !== 'undefined' && this.isSupplier !== true) {
      this.showAction = false;
    }
    console.log('acton',this.showAction);
    this.updateData = response;
    this.showForm = true;
    this.showCustom = false;
    this.showUpdate = false;
   
    if (this.isSupplier) {
      this.isSave = false;
    }
    else {
      this.isSave = true;
    }
    this.questionId = response[0].Rhythm__Question__c;
    this.accountAssessmentId = response[0].Rhythm__AccountAssessment__c;
    //this.isSupplier=response[0].isSupplier;
    this.accountName = response[0].accountName;
    this.relatedRecordName = response[0].relatedRecordName;
    this.responseMap = {};
    this.resultdata = {};
    
    if(typeof this.onloadPicklist !== 'undefined')
    {
    this.onloadPicklist.forEach(res => {
      if (res.key === 'Rhythm__Status__c') {
        this.optionsData = JSON.parse(JSON.stringify(res.options));
        console.log('options', this.optionsData);
      }
      if (typeof res.onLoadValue !== 'undefined') {
        res.onLoadValue = '';
      }
    })
    }

    getActionResponse({ actionResponse: response[0] }).then((result) => {
      if (typeof result != 'undefined' && result.length > 0) {
        
        this.resultdata = result[0];
        this.showUpdate = true;
        this.showCustom = true;
        this.showAction = false;
        this.showPicklist = true;
        this.responseMap.Id = result[0].Id;
        if (typeof result[0].Name !== 'undefined') {
          this.responseMap.Name = result[0].Name;
        }
        if (typeof result[0].Rhythm__Action_Item_Description__c !== 'undefined') {
          this.responseMap.Rhythm__Action_Item_Description__c = result[0].Rhythm__Action_Item_Description__c;
        }
        if (typeof result[0].Rhythm__Due_Date__c !== 'undefined') {
          this.responseMap.Rhythm__Due_Date__c = result[0].Rhythm__Due_Date__c;
        }
        if (typeof result[0].Rhythm__Comments__c !== 'undefined') {
          this.responseMap.Rhythm__Comments__c = result[0].Rhythm__Comments__c;
        }
        if (typeof result[0].Rhythm__Related_Record__c !== 'undefined') {
          this.responseMap.Rhythm__Related_Record__c = result[0].Rhythm__Related_Record__c;
          //this.responseMap.Rhythm__Related_Record__Name=response[0].Rhythm__Related_Record__Name;
        }
        if (typeof result[0].Rhythm__Supplier__c !== 'undefined') {
          this.responseMap.Rhythm__Supplier__c = result[0].Rhythm__Supplier__c;
        }
        console.log('sample>>>>');
       if(typeof this.onloadPicklist !== 'undefined'){
         console.log('this.onloadPicklist',this.onloadPicklist);
        this.onloadPicklist.forEach(res => {
          if (typeof result[0].Rhythm__Related_module__c !== 'undefined' || typeof result[0].Rhythm__Status__c !== 'undefined'
            || typeof result[0].Rhythm__Priority__c !== 'undefined') {
            let keydata = res.key;
            
             res.onLoadValue = result[0][keydata];
             console.log('keydata',keydata,result[0][keydata]);
            if (res.onLoadValue === 'Open' || res.onLoadValue === 'Closed') {
              if (res.onLoadValue === 'Closed') {
                this.isSave = true;
              }
              this.isLabel='Save';
              if(typeof this.optionsData !=='undefined'){
              res.options = JSON.parse(JSON.stringify(this.optionsData));
              }
            }
            if (res.onLoadValue === 'Expired') {
              let optionMap = {};
              optionMap.label = 'Expired';
              optionMap.value = 'Expired';
              res.options.push(optionMap);
              this.options = res.options;
              console.log('reethika', res.options);
              this.isSave = true;
            }
            this.responseMap[keydata] = result[0][keydata];
          }
        });
       }
       console.log('sample123');
        if (typeof result[0].Rhythm__Assigned_To__c !== 'undefined') {
          this.responseMap.Rhythm__Assigned_To__c = result[0].Rhythm__Assigned_To__c;
        }
        console.log('sample');
        if (typeof result[0].Rhythm__Ownership__c !== 'undefined') {
          this.responseMap.Rhythm__Ownership__c = result[0].Rhythm__Ownership__c;
        }
        this.saveActionResponse = this.responseMap;
        console.log('reposnedata', this.responseMap.Rhythm__Status__c);
        this.showresponse = [];
        this.showresponse.push(this.saveActionResponse);
        this.loading=false;
      }
      else {
        if (this.isSupplier === true) {
          this.showAction = true;
        }

        let userMap = {};
        this.showCustom = true;
        this.showUpdate = false;
        this.showPicklist = true;
        this.saveActionResponse = this.responseMap;
        this.saveActionResponse.sobjectType = 'Rhythm__Action__c';
        this.saveActionResponse.Rhythm__Question__c = response[0].Rhythm__Question__c;
        this.saveActionResponse.Rhythm__AccountAssessment__c = response[0].Rhythm__AccountAssessment__c;
        this.saveActionResponse.Rhythm__Related_Record__c = response[0].Rhythm__Related_Record__c;
        this.saveActionResponse.Rhythm__Supplier__c = response[0].Rhythm__Account__c;
        this.saveActionResponse.Rhythm__Assigned_To__c = response[0].assignedToId;
        this.saveActionResponse.Rhythm__Ownership__c = response[0].ownershipId;
        //this.responseMap.Rhythm__Related_Record__Name=response[0].Rhythm__Related_Record__Name;
        // console.log('jjjfk',this.responseMap.Rhythm__Related_Record__Name);
         if(typeof this.onloadPicklist !== 'undefined'){
        this.onloadPicklist.forEach(res => {
          if (res.key === 'Rhythm__Related_module__c') {
            res.onLoadValue = 'Assessments';

            this.saveActionResponse.Rhythm__Related_module__c = 'Assessments';
          }
        });
         }

        userMap.Name = response[0].ownershipName;
        this.resultdata.Rhythm__Ownership__r = userMap;
        userMap = {};
        userMap.Name = response[0].assignedToName;
        this.resultdata.Rhythm__Assigned_To__r = userMap;
        this.showresponse = [];
        this.showresponse.push(this.saveActionResponse);
        console.log('kkkk', this.saveActionResponse);
        this.loading=false;

      }
    }).catch(error => {
      let errormap = {};
      errormap.componentName = 'Action';
      errormap.methodName = 'getActionResponse';
      errormap.className = 'CAPASelector';
      errormap.errorData = error.message;
      errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });


    });
  }
  // @api emptyForm(formData) {
  //   this.showPopup = true;
  //   this.questionId = formData.questionid;
  //   this.accountAssessmentId = formData.accountAssessmentId;

  // }
  handleDelete() {
    this.showPopup = true;
  }
  handleCancelButton() {
    this.showPopup = false;
  }
  handleDeleteButton() {
    deleteActionData({ questionId: this.questionId, accountAssessmentId: this.accountAssessmentId }).then((result) => {
      let userlist = [];
      userlist.push(result[0].Rhythm__Assigned_To__c);
      this.showPopup = false;
      this.showForm = false;
      this.showToast = true;
      this.success = true;
      this.totastmessage = 'Action Item has been deleted successfully';
      // send({ subject: (result[0].Name), body: 'Action Item has been deleted successfully', userList: userlist }).then(() => {

      // }).catch(error => {
      //   console.log('ggfgf', error);
      // })

      const selectedAction = new CustomEvent('removedeleteicon', {
        detail: this.questionId
      });
      this.dispatchEvent(selectedAction);

    })
  }

  /* Used to close the toast message populated on saving */
  closeToastHandler(event) {
    this.showToast = event.detail.showModal;

  }

  handleChange(event) {
    let changedData = event.target.value;
   
    let name = event.currentTarget.dataset.id;
     if(name === 'Rhythm__Status__c' && changedData === 'Open'){
      this.isLabel='Save';
    }
    this.saveActionResponse[name] = changedData;
    this.showresponse = [];
    this.showresponse.push(this.saveActionResponse);
    if (name === 'Rhythm__Status__c') {
      this.onloadPicklist.forEach(res => {
        console.log('res.options');
        if (res.key === 'Rhythm__Status__c' && typeof this.optionsData !=='undefined') {
          res.options = JSON.parse(JSON.stringify(this.optionsData));
        }
      });
    }
     if(name === 'Rhythm__Status__c' && changedData === 'Closed'){
      this.isLabel='Submit';
    }
  }
  handleSelectedValue(event) {
    let name = event.currentTarget.dataset.id;
    if (name === 'Ownership') {
      this.saveActionResponse.Rhythm__Ownership__c = event.detail;
    }
    else {
      this.saveActionResponse.Rhythm__Assigned_To__c = event.detail;
    }
  }
  handleSave() {
    console.log('save', this.showresponse);
    if ((typeof this.showresponse[0].Name !== 'undefined') && (typeof this.showresponse[0].Rhythm__Ownership__c !== 'undefined')
      && (typeof this.showresponse[0].Rhythm__Assigned_To__c !== 'undefined') && (typeof this.showresponse[0].Rhythm__Priority__c !== 'undefined')
      && (typeof this.showresponse[0].Rhythm__Status__c !== 'undefined')) {
      if (this.showresponse[0].Rhythm__Assigned_To__c !== "" && this.showresponse[0].Rhythm__Ownership__c !== "" && this.showresponse[0].Name !== "") {
        let userlist = [];
        userlist.push(this.showresponse[0].Rhythm__Assigned_To__c);
        saveActionResponse({ actionResponse: this.showresponse, isUpdate: this.showUpdate }).then(() => {

          if (this.showUpdate == false) {

            this.showUpdate = true;
            this.showToast = true;
            this.success = true;
            this.totastmessage = 'Action Item has been created successfully';
            // send({ subject: (this.showresponse[0].Name), body: 'Action Item has been created successfully', userList: userlist }).then(() => {

            // }).catch(error => {
            //   console.log('ggfgf', error);
            // })
            this.displayForm(this.updateData);
            this.saveActionResponse.saveActionForm = true;
            const selectedAction = new CustomEvent('closeform', {
              detail: this.saveActionResponse
            });
            this.dispatchEvent(selectedAction);
          }
          else {
            this.showToast = true;
            this.success = true;
            this.totastmessage = 'Action Item has been updated successfully';
            // send({ subject: (this.showresponse[0].Name), body: 'Action Item has been updated successfully', userList: userlist }).then(() => {

            // }).catch(error => {
            //   console.log('ggfgf', error);
            // });
            if (this.saveActionResponse.Rhythm__Status__c === 'Open' && this.isSupplier === true) {
              this.showToast = true;
              this.success = true;
              this.totastmessage = 'Comment saved Successfully';
            }
            if (this.saveActionResponse.Rhythm__Status__c === 'Closed' && this.isSupplier === true) {
              this.showToast = true;
              this.success = true;
              this.totastmessage = 'Action Item has been marked as closed';
              userlist = [];
              userlist.push(this.showresponse[0].Rhythm__Ownership__c);
              notifyUsers({ actionData: (this.showresponse[0]), body: 'Action Item has been marked as closed', userList: userlist }).then(() => {

              }).catch(error => {
                console.log('ggfgf', error);
              })
              this.isSave = true;
            }
          }
        })
          .catch((error) => {
            let errormap = {};
            this.showToast = true;
            this.success = false;
            this.totastmessage = 'Due date cannot be set to a past date';
            errormap.componentName = 'Action';
            errormap.methodName = 'saveActionResponse';
            errormap.className = 'CAPAService';
            errormap.errorData = error.message;
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
          });
      }
      else {
        this.showToast = true;
        this.success = false;
        this.totastmessage = 'Please fill the mandatory fields';

      }
    }
    else {
      this.showToast = true;
      this.success = false;
      this.totastmessage = 'Please fill the mandatory fields';

    }
  }

}