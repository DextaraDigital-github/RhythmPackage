import { LightningElement, track, api } from 'lwc';
import getQuestionRespAttributes from '@salesforce/apex/QuestionAttributeResponseController.getQuestionRespAttributes';
import deleteResponseAttribute from '@salesforce/apex/QuestionAttributeResponseController.deleteResponseAttribute';
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
    /* Connectedcallback is used to get data on onload */
    connectedCallback() {
        if (typeof this.questionId != 'undefined') {
            this.constructWrapper();
        }
        else {
            this.constructNewWrapper();
        }
    }
    /* 
       This method method is used to display the toast messages.
   */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }
    /*
        This method is used to construct the wrapper
    */
    constructWrapper() {
        let disable = false;
        if (typeof this.isdisable !== 'undefined') {
            disable = this.isdisable;
        }
        let lst = [];
        lst.push(this.questionId);
        /*
            Apex method is used to get the Response Attribute data in onload for particular question.
        */
        getQuestionRespAttributes({ questionlst: lst }).then(result => {
            let cnt =0;
            let len = result.length;
            result.forEach(res => {
                let rowlabel = res.Rhythm__Response_value__c;
                if (this.quesType === 'Checkbox') {
                    disable = true;
                    this.isCheckbox = true;
                    if (res.Rhythm__Response_value__c === 'true') {
                        rowlabel = 'Checked';
                    }
                    else {
                        rowlabel = 'Unchecked'
                    }
                }
                let responsewrapper = {};
                let rownum = this.tablerowlst.length + 1;
                responsewrapper.rownum = this.tablerowlst.length + 1;
                let rowdata = [{ 'label': 'Rhythm__Response_value__c', 'rowlabel': rowlabel, 'value': res.Rhythm__Response_value__c, 'ispicklist': false, 'key': 'responseValue-' + rownum, 'display': true, 'isEditable': disable },
                { 'label': 'Rhythm__preferred_Not_preferred__c', 'rowlabel': res.Rhythm__preferred_Not_preferred__c, 'value': res.Rhythm__preferred_Not_preferred__c, 'ispicklist': true, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true, 'isEditable': disable },
                { 'label': 'Rhythm__Upload_Required__c', 'rowlabel': res.Rhythm__Upload_Required__c, 'value': res.Rhythm__Upload_Required__c, 'ispicklist': true, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true, 'isEditable': disable },
                { 'label': 'Rhythm__Score__c', 'rowlabel': res.Rhythm__Score__c, 'value': res.Rhythm__Score__c, 'ispicklist': false, 'key': 'score-' + rownum, 'display': true, 'isEditable': this.isdisable },
                { 'label': 'Rhythm__Weight__c', 'rowlabel': res.Rhythm__Weight__c, 'value': res.Rhythm__Weight__c, 'ispicklist': false, 'key': 'weight-' + rownum, 'display': true, 'isEditable': this.isdisable },
                { 'label': 'Id', 'rowlabel': res.Id, 'value': res.Id, 'ispicklist': false, 'key': 'id-' + rownum, 'display': false, 'isEditable': this.isdisable }
                ];
                responsewrapper.rowdata = rowdata;
                responsewrapper.isAddnewrow = false;
               
                if(cnt===len-1){
                    responsewrapper.isAddnewrow = true;
                }
                cnt++;
                this.tablerowlst.push(responsewrapper);

            });
            if (this.tablerowlst.length == 0) {
                this.constructNewWrapper();
            }
        }).catch(error => {
            let errormap = {};
            errormap.componentName = 'RtmvpcCreateResponseAttributes';
            errormap.methodName = 'getQuestionRespAttributes';
            errormap.className = 'QuestionAttributeResponseController';
            errormap.errorData = error.message;
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        });
    }
    /*
        handleDeleteRow method is used to delete the Response Attribute data for a particular row.
    */
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
    }
    /*
        handleQuestionTypeChange method is used to change the wrapper based on response type change.
    */
    @api handleQuestionTypeChange(value) {
        this.tablerowlst = [];
        this.quesType = value;
        this.constructNewWrapper();
    }
    /*
       This method is used to construct the wrapper for clickling on add new response attribute
   */
    constructNewWrapper() {
        if (this.quesType === 'Checkbox') {
            let responsewrapper = {};
            let rownum = this.tablerowlst.length + 1;
            responsewrapper.rownum = this.tablerowlst.length + 1;
            let rowdata = [{ 'label': 'Rhythm__Response_value__c', 'rowlabel': 'Checked', 'value': 'true', 'ispicklist': false, 'isNumber': false, 'key': 'responseValue-' + rownum, 'display': true, 'isEditable': true },
            { 'label': 'Rhythm__preferred_Not_preferred__c', 'rowlabel': '', 'value': '', 'ispicklist': true, 'isNumber': false, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Upload_Required__c', 'rowlabel': '', 'value': '', 'ispicklist': true, 'isNumber': false, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Score__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': true, 'key': 'score-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Weight__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': true, 'key': 'weight-' + rownum, 'display': true, 'isEditable': false }];
            responsewrapper.rowdata = rowdata;
            responsewrapper.isAddnewrow = false;
            this.tablerowlst.push(responsewrapper);
            responsewrapper = {};
            rownum = this.tablerowlst.length + 1;
            responsewrapper.rownum = this.tablerowlst.length + 1;
            rowdata = [{ 'label': 'Rhythm__Response_value__c', 'rowlabel': 'Unchecked', 'value': 'false', 'ispicklist': false, 'isNumber': false, 'key': 'responseValue-' + rownum, 'display': true, 'isEditable': true },
            { 'label': 'Rhythm__preferred_Not_preferred__c', 'rowlabel': '', 'value': '', 'ispicklist': true, 'isNumber': false, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Upload_Required__c', 'rowlabel': '', 'value': '', 'ispicklist': true, 'isNumber': false, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Score__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': true, 'key': 'score-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Weight__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': true, 'key': 'weight-' + rownum, 'display': true, 'isEditable': false }];
            responsewrapper.rowdata = rowdata;
            responsewrapper.isAddnewrow = false;
            this.tablerowlst.push(responsewrapper);
            this.isCheckbox = true;
        }
        else {
            this.isCheckbox = false;
            let responsewrapper = {};
            let rownum = this.tablerowlst.length + 1;
            responsewrapper.rownum = this.tablerowlst.length + 1;
            let rowdata = [{ 'label': 'Rhythm__Response_value__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': false, 'key': 'responseValue-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__preferred_Not_preferred__c', 'rowlabel': '', 'value': '', 'ispicklist': true, 'isNumber': false, 'options': this.preferredOptions, 'key': 'preffered-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Upload_Required__c', 'rowlabel': '', 'value': '', 'ispicklist': true, 'isNumber': false, 'options': this.reqFileOptions, 'key': 'uploadrequired-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Score__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': true, 'key': 'score-' + rownum, 'display': true, 'isEditable': false },
            { 'label': 'Rhythm__Weight__c', 'rowlabel': '', 'value': '', 'ispicklist': false, 'isNumber': true, 'key': 'weight-' + rownum, 'display': true, 'isEditable': false }];
            responsewrapper.rowdata = rowdata;
            responsewrapper.isAddnewrow = true;
            this.tablerowlst.push(responsewrapper);
        }
    }
    /*
        This method is used to store the values of Response Attributes.
    */
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
        let responselst = [];
        this.tablerowlst.forEach(rowinfo => {
            let responsemap = { 'sobjectType': 'Rhythm__Response_Attribute__c' };
            rowinfo.rowdata.forEach(item => {
                responsemap[item.label] = item.value;
            });
            responselst.push(responsemap);
        })
        const selectedEvent = new CustomEvent('selectedvalue', { detail: responselst });
        this.dispatchEvent(selectedEvent);
    }
    /*
        This method is used to add the new response attribute.
    */
    handleNewRow() {
        this.constructNewWrapper();
        let cnt =0;
        let len = this.tablerowlst.length;
        this.tablerowlst.forEach(tab=>{
            
            if(cnt===len-1){
                tab.isAddnewrow =  true;
            }
            else{
                tab.isAddnewrow = false;
            }
            cnt++;
        })
    }
    handlefocus(event) {
        // let dataId = event.currentTarget.getAttribute('data-val');
        // let respValue = event.target.value;
        // console.log('dataId',dataId);
    }
}