import { LightningElement, track, api } from 'lwc';
import getResponseAttributes from '@salesforce/apex/QuestionAttributeResponseSelector.getResponseAttributes';
import deleteResponseAttribute from '@salesforce/apex/QuestionAttributeResponseService.deleteResponseAttribute';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class RtmvpcCreateResponseAttributes extends LightningElement {
    @track tableheaders = ['Response Value', 'Preferred/ Non-Preferred', 'Upload Required', 'Score', 'Weight'];
    @track showtable = true;
    @track preferredOptions = [{ 'label': 'Preferred', 'value': 'Preferred' }, { 'label': 'Non Preferred', 'value': 'Non Preferred' }];
    @track reqFileOptions = [{ 'label': 'Yes', 'value': 'Yes' }, { 'label': 'No', 'value': 'No' }, { 'label': 'Optional', 'value': 'Optional' }];
    @track tablerowlst = [];
    @api questionId;
    @api quesType;
    @api isdisable;
    @track isCheckbox = false;

    connectedCallback() {
        console.log('quesType',this.quesType);
        if (typeof this.questionId != 'undefined') {
            this.constructWrapper();
        }
        else {
            this.constructNewWrapper();
        }
    }
     configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }
    constructWrapper() {
        let disable = false;
        console.log('this.questionId', this.questionId);
        console.log('this.isdisable',this.isdisable);
        if(typeof this.isdisable!=='undefined'){
            disable = this.isdisable;
        }
        getResponseAttributes({ questionId: this.questionId }).then(result => {
            result.forEach(res => {
                console.log('getResponseAttributes',res);
                if(this.quesType==='Checkbox')
                {
                    disable = true;
                    this.isCheckbox = true;
                }
                let responsewrapper = {};
                let rownum = this.tablerowlst.length + 1;
                responsewrapper.rownum = this.tablerowlst.length + 1;
                let rowdata = [{ 'label': 'Rhythm__Response_value__c','rowlabel':res.Rhythm__Response_value__c, 'value': res.Rhythm__Response_value__c, 'ispicklist': false, 'key': 'responseValue-' + rownum, 'display': true,'isEditable':disable  },
                { 'label': 'Rhythm__preferred_Not_preferred__c','rowlabel':res.Rhythm__preferred_Not_preferred__c, 'value': res.Rhythm__preferred_Not_preferred__c, 'ispicklist': true, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true,'isEditable':disable  },
                { 'label': 'Rhythm__Upload_Required__c','rowlabel':res.Rhythm__Upload_Required__c, 'value': res.Rhythm__Upload_Required__c, 'ispicklist': true, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true,'isEditable':disable  },
                { 'label': 'Rhythm__Score__c','rowlabel':res.Rhythm__Score__c, 'value': res.Rhythm__Score__c, 'ispicklist': false, 'key': 'score-' + rownum, 'display': true,'isEditable':this.isdisable  },
                { 'label': 'Rhythm__Weight__c','rowlabel':res.Rhythm__Weight__c, 'value': res.Rhythm__Weight__c, 'ispicklist': false, 'key': 'weight-' + rownum, 'display': true,'isEditable':this.isdisable  },
                { 'label': 'Id','rowlabel':res.Id, 'value': res.Id, 'ispicklist': false, 'key': 'id-' + rownum, 'display': false,'isEditable':this.isdisable}
                ];
                responsewrapper.rowdata = rowdata;
                this.tablerowlst.push(responsewrapper);

            });
            if (this.tablerowlst.length == 0) {
                this.constructNewWrapper();
            }
        }).catch(error => {
            let errormap = {};
            errormap.componentName = 'RtmvpcCreateResponseAttributes';
            errormap.methodName = 'getResponseAttributes';
            errormap.className = 'QuestionAttributeResponseSelector';
            errormap.errorData = error.message;
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        });

        console.log(this.tablerowlst);
    }
    handleDeleteRow(event) {
        let index = event.currentTarget.dataset.id;
        let tabdata = this.tablerowlst[index - 1];
        tabdata.rowdata.forEach(data => {
            if (data.label === 'Id') {
                deleteResponseAttribute({ responseId: data.value }).then(result => {
                    console.log('deleted Successfully', result);
                }).catch(error => {
                    let errormap = {};
                    errormap.componentName = 'RtmvpcCreateResponseAttributes';
                    errormap.methodName = 'deleteResponseAttribute';
                    errormap.className = 'QuestionAttributeResponseService';
                    errormap.errorData = error.message;
                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                });
            }
        });
        this.tablerowlst.splice(index - 1, 1);
        if (this.tablerowlst.length == 0) {
            this.constructNewWrapper();
        }
        console.log('this.tablerowlst', this.tablerowlst);
    }
    @api handleQuestionTypeChange()
    {
        console.log('handleQuestionTypeChange');
        this.tablerowlst=[];
        this.constructNewWrapper();
    }
    constructNewWrapper() {
        if(this.quesType ==='Checkbox')
        {
        let responsewrapper = {};
        let rownum = this.tablerowlst.length + 1;
        responsewrapper.rownum = this.tablerowlst.length + 1;
        let rowdata = [{ 'label': 'Rhythm__Response_value__c','rowlabel':'Yes', 'value':'true', 'ispicklist': false,'isNumber': false, 'key': 'responseValue-' + rownum, 'display': true ,'isEditable':true },
        { 'label': 'Rhythm__preferred_Not_preferred__c','rowlabel':'', 'value': '', 'ispicklist': true,'isNumber': false, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Upload_Required__c','rowlabel':'', 'value': '', 'ispicklist': true,'isNumber': false, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Score__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': true, 'key': 'score-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Weight__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': true, 'key': 'weight-' + rownum, 'display': true,'isEditable':false  }];
        responsewrapper.rowdata = rowdata;
        this.tablerowlst.push(responsewrapper);
        responsewrapper = {};
        rownum = this.tablerowlst.length + 1;
        responsewrapper.rownum = this.tablerowlst.length + 1;
        rowdata = [{ 'label': 'Rhythm__Response_value__c','rowlabel':'No', 'value':'false', 'ispicklist': false, 'isNumber': false, 'key': 'responseValue-' + rownum, 'display': true ,'isEditable':true },
        { 'label': 'Rhythm__preferred_Not_preferred__c','rowlabel':'', 'value': '', 'ispicklist': true,'isNumber': false, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Upload_Required__c','rowlabel':'', 'value': '', 'ispicklist': true,'isNumber': false, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Score__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': true, 'key': 'score-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Weight__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': true, 'key': 'weight-' + rownum, 'display': true,'isEditable':false  }];
        responsewrapper.rowdata = rowdata;
        this.tablerowlst.push(responsewrapper);
        this.isCheckbox = true;
        }
        else{
        let responsewrapper = {};
        let rownum = this.tablerowlst.length + 1;
        responsewrapper.rownum = this.tablerowlst.length + 1;
        let rowdata = [{ 'label': 'Rhythm__Response_value__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': false, 'key': 'responseValue-' + rownum, 'display': true ,'isEditable':false },
        { 'label': 'Rhythm__preferred_Not_preferred__c','rowlabel':'', 'value': '', 'ispicklist': true,'isNumber': false, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Upload_Required__c','rowlabel':'', 'value': '', 'ispicklist': true,'isNumber': false, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Score__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': true, 'key': 'score-' + rownum, 'display': true,'isEditable':false  },
        { 'label': 'Rhythm__Weight__c','rowlabel':'', 'value': '', 'ispicklist': false,'isNumber': true, 'key': 'weight-' + rownum, 'display': true,'isEditable':false  }];
        responsewrapper.rowdata = rowdata;
        this.tablerowlst.push(responsewrapper);
        }   
    }
    handleChange(event) {
        let dataId = event.currentTarget.dataset.id;
        let respValue = event.target.value;
        let index = Number(dataId.split('-')[1]);
        this.tablerowlst[index - 1].rowdata.forEach(item => {
            if (item.key === dataId) {
                item.value = respValue;
                item.rowlabel = respValue;
            }
        });
        console.log('this.tablerowlst', this.tablerowlst);
        let responselst = [];
        this.tablerowlst.forEach(rowinfo => {
            let responsemap = { 'sobjectType': 'Rhythm__Response_Attribute__c' };
            rowinfo.rowdata.forEach(item => {
                responsemap[item.label] = item.value;
            });
            responselst.push(responsemap);
        })
        console.log('resposelst', responselst);
        const selectedEvent = new CustomEvent('selectedvalue', { detail: responselst });
        this.dispatchEvent(selectedEvent);
    }
    handleNewRow() {
        this.constructNewWrapper();
    }
    handlefocus(event){
        // let dataId = event.currentTarget.getAttribute('data-val');
        // let respValue = event.target.value;
        // console.log('dataId',dataId);
    }
}