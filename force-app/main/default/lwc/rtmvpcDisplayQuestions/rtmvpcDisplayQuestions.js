import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import componentStyleSheet from '@salesforce/resourceUrl/ComponentStyleSheet';
import getQuestions from '@salesforce/apex/QuestionController.getQuestions';
import deleteQuestion from '@salesforce/apex/QuestionController.deleteQuestion';
import getTemplateRecord from '@salesforce/apex/QuestionController.getTemplateRecord';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';

const columns = [
    { label: 'Section', fieldName: 'Rhythm__SectionName__c', type: "text" },
    {
        label: 'Question Number', type: "button", typeAttributes: {
            label: { fieldName: 'Name' },
            name: 'view',
            title: 'view',
            disabled: false,
            value: 'view',
            iconPosition: 'left',
            variant: 'base',
            cellAttributes: { class: 'slds-p-vertical_none slds-m-vertical_none' }
        }
    },
    { label: 'Question', fieldName: 'Rhythm__Question__c', wrapText: true },
    { label: 'Question Type', fieldName: 'Rhythm__Question_Type__c' },
    { label: 'Response Values', fieldName: 'Rhythm__OptionValueSet__c' },
    {
        label: 'Add Conditional Question',
        type: "button-icon",
        typeAttributes: { iconName: { fieldName: 'priorityicon' }, disabled: { fieldName: 'isiconavailable' }, variant: 'bare', name: 'addchildquestion' }
    },
];



export default class RtmvpcDisplayQuestions extends LightningElement {
    @track gridcolumns = columns;
    @track data;
    @track showToast = false;
    @track viewQuestions = false;
    @api recordId;
    @track totastmessage;
    @track success;
    @track tempId;
    @track questionId;
    @track sectionId;
    @track createNewQues = false;
    @track childQuesWrapper = {};
    @track createChildQues = false;
    selectedRows = [];   //Stores the selected rows (questions)
    @track show = { cQuesReorderModal: false };   //Conditionally render the modal popup where the child questions can sequenced 
    @track selectedRow;
    @track tempStatus = false;
    @track show = { childReorderBtn: false, table: false };

    constructor() {
        super();
        this.gridcolumns = columns.concat([
            { type: 'action', typeAttributes: { rowActions: this.getRowActions } }
        ]);
    }
    getRowActions(row, doneCallback) {
        const actions = [];
        actions.push({
            'label': 'Edit',
            'name': 'view'
        });
        actions.push({
            'label': 'Delete',
            'name': 'delete'
        });
        if (row['isMetCriteria'] === true) {
            actions.push({
                'label': 'Add Conditional Question',
                'name': 'addchildquestion'
            });
        }
        setTimeout(() => {
            doneCallback(actions);
        }, 200);

    }
    connectedCallback() {
        this.tempId = this.recordId;
        this.handleOnload();
    }
    renderedCallback() {
        Promise.all([
            loadStyle(this, componentStyleSheet)
        ]);
    }
    closeToastHandler() {
        this.showToast = false;

    }
    handleOnload() {
        getTemplateRecord({ templateId: this.recordId }).then(tempresult => {
            if (tempresult[0].Rhythm__Status__c === 'New') {
                this.tempStatus = true;
            }
            getQuestions({ templateId: this.recordId }).then(result => {
                let questionData = JSON.parse(JSON.stringify(result));
                let children = questionData.filter(res => typeof res.Rhythm__Parent_Question__c !== 'undefined');
                let parent = questionData.filter(res => typeof res.Rhythm__Parent_Question__c === 'undefined');
                let pnumber = 0;
                let parentnumber;
                parent.forEach(parentdata => {
                    let childlst = [];
                    let snumber = 0;
                    pnumber++;
                    if (pnumber < 10) {
                        parentnumber = '00' + pnumber;
                    }
                    else if (pnumber >= 10 && pnumber < 100) {
                        parentnumber = '0' + pnumber;
                    }
                    else {
                        parentnumber = pnumber;
                    }
                    parentdata.Name = parentnumber;
                    //parentdata.Name = qnumber[1];
                    let childMp ={};
                    children.forEach(child => {
                        if (parentdata.Id === child.Rhythm__Parent_Question__c) {
                            snumber++;
                            let x='';
                            if(parentdata.Rhythm__Question_Type__c==='Checkbox'){
                                if(child.Rhythm__Conditional_Response__c==='true'){
                                    x = '↳ [' + 'Checked' + '] : ' + child.Rhythm__Question__c;
                                }
                                else{
                                     x = '↳ [' + 'Unchecked' + '] : ' + child.Rhythm__Question__c;
                                }
                                child.Rhythm__Question__c = x;
                            }
                            else{
                                x = '↳ [' + child.Rhythm__Conditional_Response__c + '] : ' + child.Rhythm__Question__c;
                                child.Rhythm__Question__c = x;
                            }
                            child['isMetCriteria'] = false;
                            child['priorityicon'] = '';
                            child['isiconavailable'] = true;
                            if (snumber < 10) {
                                child.Name = parentnumber + '.0' + snumber;
                            }
                            else {
                                child.Name = parentnumber + '.' + snumber;
                            }
                            if (typeof child.Rhythm__OptionValueSet__c !== 'undefined') {
                                if (child.Rhythm__Question_Type__c === 'Checkbox') {
                                    child.Rhythm__OptionValueSet__c = 'Checked, Unchecked';
                                }
                                else {
                                    child.Rhythm__OptionValueSet__c = child.Rhythm__OptionValueSet__c.replaceAll('\r\n', ', ');
                                }
                            }
                            if(typeof childMp[child.Rhythm__Conditional_Response__c]!=='undefined'){
                                let lst =childMp[child.Rhythm__Conditional_Response__c];
                                lst.push(child);
                                childMp[child.Rhythm__Conditional_Response__c] = lst;
                            }
                            else{
                                let lst =[];
                                lst.push(child);
                                childMp[child.Rhythm__Conditional_Response__c]=lst
                            }
                            //childlst.push(child);
                        }
                        
                    });
                    for(let key in childMp){
                       let lst = childMp[key];
                       lst.forEach(childrenlst=>{
                           childlst.push(childrenlst);
                       });
                    }
                    if (childlst.length > 0) {
                        parentdata['_children'] = childlst;
                    }
                    if (parentdata.Rhythm__Question_Type__c === 'Picklist' || parentdata.Rhythm__Question_Type__c === 'Radio'
                        || parentdata.Rhythm__Question_Type__c === 'Checkbox') {
                        parentdata['isMetCriteria'] = true;
                        parentdata.options = parentdata.Rhythm__OptionValueSet__c;
                        if (parentdata.Rhythm__Question_Type__c === 'Checkbox') {
                            parentdata.Rhythm__OptionValueSet__c = 'Checked, Unchecked';
                        }
                        else {
                            parentdata.Rhythm__OptionValueSet__c = parentdata.Rhythm__OptionValueSet__c.replaceAll('\r\n', ', ');
                        }
                        parentdata['priorityicon'] = 'utility:record_create';
                        parentdata['isiconavailable'] = false;
                    }
                    else {
                        parentdata['isMetCriteria'] = false;
                        parentdata['priorityicon'] = ' ';
                        parentdata['isiconavailable'] = true;
                    }

                    //parentdata.Rhythm__OptionValueSet__c = parentdata.Rhythm__OptionValueSet__c.replaceAll('\r\n',',');
                });
                this.data = parent;
                if (typeof this.data != 'undefined' && this.data.length > 0) {
                    this.show.childReorderBtn = this.show.table = true;
                }
            }).catch(error => {
                let errormap = {};
                errormap.componentName = 'RtmvpcDisplayQuestions';
                errormap.methodName = 'getQuestions';
                errormap.className = 'getQuestions';
                errormap.errorData = error.message;
                errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });

            });
        }).catch(error => {
            let errormap = {};
            errormap.componentName = 'RtmvpcDisplayQuestions';
            errormap.methodName = 'getTemplateRecord';
            errormap.className = 'TemplateSelector';
            errormap.errorData = error.message;
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        })

    }
    handleClick() {
        this.viewQuestions = true;
    }
    handleCancel(event) {
        
        if (typeof event.detail !== 'undefined') {
            this.viewQuestions = false;
            this.createNewQues = false;
            this.handleOnload();
        }
    }
    handleClose(event) {
        if (typeof event.detail !== 'undefined') {
            this.createChildQues = false;
            this.handleOnload();
        }
    }
    handleRowSelection(event) {
        console.log('selected row', event.detail.selectedRows);
    }
    handleCellClick(event) {
        const cellData = event.detail.fieldName;
    }
    handleNewClick() {
        this.createNewQues = true;

    }
    handleRowAction(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        if (this.tempStatus) {
            if (actionName === 'view' || actionName === 'edit') {

                this.questionId = row.Id;
                this.sectionName = row.Rhythm__Section__r.Name;
                this.viewQuestions = true;
            }
            if (actionName === 'addchildquestion') {
                if (row.Rhythm__Question_Type__c === 'Picklist' || row.Rhythm__Question_Type__c === 'Radio'
                    || row.Rhythm__Question_Type__c === 'Checkbox') {
                    this.childQuesWrapper.questionId = row.Id;
                    this.childQuesWrapper.question = row.Rhythm__Question__c;
                    this.childQuesWrapper.sectionName = row.Rhythm__Section__r.Name;
                    this.childQuesWrapper.sectionId = row.Rhythm__Section__c;
                    this.childQuesWrapper.templateId = this.recordId;
                    this.childQuesWrapper.type = row.Rhythm__Question_Type__c;
                    this.createChildQues = true;
                }
                else {
                    this.totastmessage = 'Child Question will be added for only Picklist and Radio type Questions';
                    this.success = false;
                    this.showToast = true;
                }

            }
            else if (actionName === 'delete') {
                this.questionId = row.Id;
                let templateId = row.Rhythm__Assessment_Template__c;
                deleteQuestion({ questionId: this.questionId, templateId: templateId }).then(result => {
                    // this.totastmessage = 'Question deleted successfully';
                    // this.success = true;
                    // this.showToast = true;
                    this.configureToast('Success', 'Deleted Successfully ', 'success');
                    this.handleOnload();
                }).catch(error => {
                    let errormap = {};
                    errormap.componentName = 'RtmvpcDisplayQuestions';
                    errormap.methodName = 'deleteQuestion';
                    errormap.className = 'deleteQuestion';
                    errormap.errorData = error.message;
                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                });
            }
        }
        else {
            if (actionName === 'view' || actionName === 'edit') {

                this.questionId = row.Id;
                this.sectionName = row.Rhythm__Section__r.Name;
                this.viewQuestions = true;
            }
            else {
                this.configureToast('Some Error has Occured', 'Active Template cannot be edited', 'error');
            }

        }

    }
    handlesave(event) {
        
        if (typeof event.detail !== 'undefined') {
            this.createChildQues = false;
            this.viewQuestions = false;
            this.createNewQues = false;
            this.handleOnload();
        }
        // this.totastmessage = event.detail;
        // this.success = true;
        // this.showToast = true;
        this.configureToast('Success', event.detail, 'success');

    }

    /* Configures and displays the toast message */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    /* Handles the selection of rows in the tree grid */
    handleRowSelection(event) {
        this.selectedRows = [...event.detail.selectedRows];
    }

    /* Opens the modal popup for child questions reordering when only 1 question is selected */
    cQuesReorderHandler() {
        if (this.selectedRows.length > 1) {
            this.configureToast('Multiple questions selected', 'Select only 1 question to continue.', 'error');
        }
        else if (this.selectedRows.length === 0) {
            this.configureToast('No questions selected', 'Select a question to continue.', 'error');
        }
        else if (this.selectedRows.length === 1) {
            if (this.selectedRows[0].hasChildren) {
                this.selectedRow = this.selectedRows[0];
                this.show.cQuesReorderModal = true;
                // this.childQuestions = this.data.filter(question => (question.Id === this.selectedRows[0].Id))[0]._children;
            }
            else {
                this.configureToast('No conditional questions to reorder', 'Selected question doesn\'t have any conditional questions to reorder.', 'error');
            }
        }
    }

    /* Handles the closure of the modal where child questions can be reordered */
    closeCQuesReorderHandler() {
        this.show.cQuesReorderModal = false;
        this.handleOnload();
    }
}