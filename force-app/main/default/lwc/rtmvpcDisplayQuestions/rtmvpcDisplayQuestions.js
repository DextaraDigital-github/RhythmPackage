import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import componentStyleSheet from '@salesforce/resourceUrl/ComponentStyleSheet';
import getQuestions from '@salesforce/apex/QuestionAttributeResponseSelector.getQuestions';
import deleteQuestion from '@salesforce/apex/QuestionAttributeResponseService.deleteQuestion';
import getTemplateRecord from '@salesforce/apex/TemplateSelector.getTemplateRecord';
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

    // {   label: 'Action',
    //     type: 'action',
    //     initialWidth:'50px',
    //     typeAttributes: { rowActions: actions, variant : 'base' },
    // },  
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
        console.log('row', row);
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
            console.log('Status__c', tempresult);
            if (tempresult[0].Rhythm__Status__c === 'New') {
                this.tempStatus = true;
            }
            console.log('this.tempStatus = true',this.tempStatus );
            getQuestions({ templateId: this.recordId }).then(result => {
                //this.data = result;
                let questionData = JSON.parse(JSON.stringify(result));
                let children = questionData.filter(res => typeof res.Rhythm__Parent_Question__c !== 'undefined');
                let parent = questionData.filter(res => typeof res.Rhythm__Parent_Question__c === 'undefined');
                parent.forEach(parentdata => {
                    let childlst = [];
                    let snumber =0;
                    let qnumber = (parentdata.Name).split('-');
                    children.forEach(child => {
                        if (parentdata.Id === child.Rhythm__Parent_Question__c) {
                            snumber++;
                            console.log('child', child);
                            let x = '↳ [' + child.Rhythm__Conditional_Response__c + '] : ' + child.Rhythm__Question__c;
                            child.Rhythm__Question__c = x;
                            child['isMetCriteria'] = false;
                            child['priorityicon'] = '';
                            child['isiconavailable'] = true;
                            
                            if(snumber<10){
                                child.Name = qnumber[1] + '.0'+snumber;
                            }
                            else{
                                child.Name  = qnumber[1] + '.'+snumber;
                            }
                            childlst.push(child);


                            // parentdata['priorityicon'] = '';
                            //parentdata['isiconavailable'] = true;

                            //parentdata.Rhythm__Question__c = parentdata.Rhythm__Question__c + '\n';
                            //parentdata.Rhythm__Question__c+= '==> (' + child.Rhythm__Conditional_Response__c +') : '+child.Rhythm__Question__c;
                        }
                        if (childlst.length > 0) {
                            console.log('childlst', childlst);
                            parentdata.Name = qnumber[1];
                            parentdata['_children'] = childlst;
                        }

                    });
                    if (parentdata.Rhythm__Question_Type__c === 'Picklist' || parentdata.Rhythm__Question_Type__c === 'Radio'
                        || parentdata.Rhythm__Question_Type__c === 'Picklist (Multi-Select)' || parentdata.Rhythm__Question_Type__c === 'Checkbox') {
                        parentdata['isMetCriteria'] = true;
                        parentdata.Rhythm__OptionValueSet__c = parentdata.Rhythm__OptionValueSet__c.replaceAll('\r\n',', ');
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
                if(typeof this.data != 'undefined' && this.data.length > 0)
                {
                    this.show.childReorderBtn = this.show.table = true;
                }
                console.log('this.data', this.data);
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
        console.log('handleCancel diaptch');
        if (typeof event.detail !== 'undefined') {
            this.viewQuestions = false;
            this.createNewQues = false;
             this.handleOnload();
        }
    }
    handleClose(event) {
        console.log('Handle dispatch');
        if (typeof event.detail !== 'undefined') {
            this.createChildQues = false;
             this.handleOnload();
        }
    }
    handleRowSelection(event) {
        console.log('selected row', event.detail.selectedRows);

    }
    handleCellClick(event) {
        console.log('clicked');
        const cellData = event.detail.fieldName;
        console.log(cellData);
    }
    handleNewClick() {
        console.log('NewClick',this.tempStatus);
        this.createNewQues = true;
        
    }
    handleRowAction(event) {
        let actionName = event.detail.action.name;
        console.log('actionName', actionName);
        let row = event.detail.row;
        console.log('row', row);
        if (this.tempStatus) {
            console.log('Into if');
            if (actionName === 'view' || actionName === 'edit') {

                this.questionId = row.Id;
                this.sectionName = row.Rhythm__Section__r.Name;
                this.viewQuestions = true;
            }
            if (actionName === 'addchildquestion') {
                if (row.Rhythm__Question_Type__c === 'Picklist' || row.Rhythm__Question_Type__c === 'Radio'
                    || row.Rhythm__Question_Type__c === 'Picklist (Multi-Select)' || row.Rhythm__Question_Type__c === 'Checkbox') {
                    this.childQuesWrapper.questionId = row.Id;
                    this.childQuesWrapper.question = row.Rhythm__Question__c;
                    this.childQuesWrapper.sectionName = row.Rhythm__Section__r.Name;
                    this.childQuesWrapper.sectionId = row.Rhythm__Section__c;
                    this.childQuesWrapper.templateId = this.recordId;
                    this.childQuesWrapper.type = row.Rhythm__Question_Type__c;
                    console.log('this.childQuesWrapper', this.childQuesWrapper);
                    this.createChildQues = true;
                }
                else {
                    this.totastmessage = 'Child Question will be added for only Picklist, multi picklist and Radio type Questions';
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
            else{
                this.configureToast('Some Error has Occured', 'Active Template cannot be edited', 'error');
            }
            
        }

    }
    handlesave(event) {
        console.log('event dispatched');
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
                console.log(this.selectedRow);
            }
            else {
                this.configureToast('No child questions to reorder', 'Selected question doesn\'t have any child questions to reorder.', 'error');
            }
        }
    }

    /* Handles the closure of the modal where child questions can be reordered */
    closeCQuesReorderHandler() {
        this.show.cQuesReorderModal = false;
        this.handleOnload();
    }
}