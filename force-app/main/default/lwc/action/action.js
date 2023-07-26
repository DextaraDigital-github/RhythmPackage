import { LightningElement, api, track, wire } from 'lwc';
import getPicklistValues from '@salesforce/apex/CAPAController.getPicklistValues';
import saveActionResponse from '@salesforce/apex/CAPAController.saveActionResponse';
import getActionResponse from '@salesforce/apex/CAPAController.getActionResponse';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import deleteActionData from '@salesforce/apex/CAPAController.deleteActionData';
export default class Action extends LightningElement {
  @track pickListNames = [];
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

  @track lookupLabel = ['Ownership', 'Assigned To'];
  @track options = [{ label: 'Open', value: 'Open' },
  { label: 'Closed', value: 'Closed' }
  ];
  @wire(getPicklistValues, {})
  picklistdata({ error, data }) {
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
    } else if (error) {
      let errormap = {};
      errormap.componentName = 'Action';
      errormap.methodName = 'getPicklistValues';
      errormap.className = 'AssessmentController';
      errormap.errorData = error;
      errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
    }
  }

  @api displayForm(response) {
    console.log('jjj',response);
    this.updateData = response;
    this.showForm = true;
    this.showCustom = false;
    this.showUpdate = false;
    this.isSupplier = response[0].isSupplier;
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
    this.responseMap = {};
    this.resultdata = {};
    this.onloadPicklist.forEach(res => {
      if (typeof res.onLoadValue !== 'undefined') {
        res.onLoadValue = '';
      }
    })

    getActionResponse({ actionResponse: response[0] }).then((result) => {
      if (typeof result != 'undefined' && result.length > 0) {
        this.resultdata = result[0];
        this.showUpdate = true;
        this.showCustom = true;
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
        }
        if (typeof result[0].Rhythm__Supplier__c !== 'undefined') {
          this.responseMap.Rhythm__Supplier__c = result[0].Rhythm__Supplier__c;
        }

        this.onloadPicklist.forEach(res => {
          if (typeof result[0].Rhythm__Related_module__c !== 'undefined' || typeof result[0].Rhythm__Status__c !== 'undefined'
            || typeof result[0].Rhythm__Priority__c !== 'undefined') {
            let keydata = res['key'];
            res.onLoadValue = result[0][keydata];
            if(res.onLoadValue === 'Closed'){
              this.isSave=true;
            }
            this.responseMap[keydata] = result[0][keydata];
          }
        });
        if (typeof result[0].Rhythm__Assigned_To__c !== 'undefined') {
          this.responseMap.Rhythm__Assigned_To__c = result[0].Rhythm__Assigned_To__c;
        }
        if (typeof result[0].Rhythm__Ownership__c !== 'undefined') {
          this.responseMap.Rhythm__Ownership__c = result[0].Rhythm__Ownership__c;
        }
        this.saveActionResponse = this.responseMap;
        this.showresponse = [];
        this.showresponse.push(this.saveActionResponse);
      }
      else {
        var userMap = {};
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
        userMap.Name = response[0].ownershipName;
        this.resultdata.Rhythm__Ownership__r = userMap;
        userMap = {};
        userMap.Name = response[0].assignedToName;
        this.resultdata.Rhythm__Assigned_To__r = userMap;
        this.showresponse = [];
        this.showresponse.push(this.saveActionResponse);
        console.log('kkkk',this.saveActionResponse);

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
  @api emptyForm(formData) {
    this.showPopup = true;
    this.questionId = formData.questionid;
    this.accountAssessmentId = formData.accountAssessmentId;

  }
  handleDelete() {
    this.showPopup = true;
  }
  handleCancelButton() {
    this.showPopup = false;
  }
  handleDeleteButton() {
    deleteActionData({ questionId: this.questionId, accountAssessmentId: this.accountAssessmentId }).then(() => {
      this.showPopup = false;
      this.showForm = false;
      this.showToast = true;
      this.success = true;
      this.totastmessage = 'Action form deleted successfully';
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
    this.saveActionResponse[name] = changedData;
    this.showresponse = [];
    this.showresponse.push(this.saveActionResponse);
  }
  handleSelectedValue(event) {
    let name = event.currentTarget.dataset.id;
    if (name === 'Ownership') {
      this.saveActionResponse['Rhythm__Ownership__c'] = event.detail;
    }
    else {
      this.saveActionResponse['Rhythm__Assigned_To__c'] = event.detail;
    }
  }
  handleSave() {
    console.log('save',this.showresponse);
    if ((typeof this.showresponse[0].Name !== 'undefined') && (typeof this.showresponse[0].Rhythm__Ownership__c !== 'undefined')
      && (typeof this.showresponse[0].Rhythm__Assigned_To__c !== 'undefined') && (typeof this.showresponse[0].Rhythm__Priority__c !== 'undefined')
      && (typeof this.showresponse[0].Rhythm__Status__c !== 'undefined')) {
      if (this.showresponse[0].Rhythm__Assigned_To__c !== "" && this.showresponse[0].Rhythm__Ownership__c !== "" && this.showresponse[0].Name !== "") {

        saveActionResponse({ actionResponse: this.showresponse, isUpdate: this.showUpdate }).then(() => {

          if (this.showUpdate == false) {

            this.showUpdate = true;
            this.showToast = true;
            this.success = true;
            this.totastmessage = 'Action form created successfully';
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
            this.totastmessage = 'Action form updated successfully';
            if (this.saveActionResponse.Rhythm__Status__c === 'Closed' && this.isSupplier === true) {
              this.showToast = true;
              this.success = true;
              this.totastmessage = 'Action form submitted successfully';
              this.isSave = true;
            }
          }
        })
          .catch((error) => {
            let errormap = {};
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
        this.totastmessage = 'please fill the mandatory fields';

      }
    }
    else {
      this.showToast = true;
      this.success = false;
      this.totastmessage = 'please fill the mandatory fields';

    }
  }

}