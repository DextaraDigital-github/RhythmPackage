/*
* Component Name    : rtmvpcQuestionCreation
* Developer         : Sai Koushik Nimmaturi        
* Created Date      : 
* Description       : This component is used for the question creation.
* Last Modified Date: 
*/
import { LightningElement, track, api } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import ComponentStylesheet from '@salesforce/resourceUrl/ComponentStyleSheet';
import getQuestionTypeValues from '@salesforce/apex/QuestionController.getQuestionTypeValues';
import createQuestions from '@salesforce/apex/QuestionController.createQuestions';
import createResponseAttributes from '@salesforce/apex/QuestionController.createResponseAttributes';
import getQuestionsData from '@salesforce/apex/QuestionController.getQuestionsData';
import createResponseQuestionMap from '@salesforce/apex/QuestionController.createResponseQuestionMap';
import updateResponseAttributes from '@salesforce/apex/QuestionController.updateResponseAttributes';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getChildQuestions from '@salesforce/apex/QuestionController.getChildQuestions';
import deleteQuesRespAttribute from '@salesforce/apex/QuestionController.deleteQuesRespAttribute';


export default class RtmvpcQuestionCreation extends LightningElement {
    @track createQues = false;
    @api recordId;
    @track displayNew = true;
    @api tempstatus;
    @api templateId;
    @api questionId;
    @api assessmentTemplate;
    @api sectionName;
    @track loading = false;
    @api childwrapper;
    @track isdisabled = false;
    @track questionlst = [];
    @track questionWrapper = { 'sobjectType': 'Rhythm__Question__c' };
    @track lookupLabel = 'Section';
    @track options = [];
    @track success;
    @track totastmessage;
    @track showToast = false;
    @api childQuesCreation;
    @track responseAttributes;
    @track showResponseAttributes = false;
    @track selQuestionType;
    @track questionnaire = {};
    @track childTempId;
    @track responseAttributeId;

    /* 
    This method is used to get Response value of Parent Question for creating the Conditional Question.
    */
    @api
    getParentQuestionCondition(conditionValue) {
        
        if (typeof conditionValue !== 'undefined') {
            this.questionWrapper['Rhythm__Conditional_Response__c'] = conditionValue.conditionalResponse;
            //this.questionWrapper['Rhythm__Section__c'] = 
            this.responseAttributeId = conditionValue.responseAttributeId;
        }
    }
    /* Connectedcallback is used to get data on onload */
    connectedCallback() {
        //this.questionWrapper.Rhythm__Question__c = '';
        this.isdisabled = !this.tempstatus;
        /* 
        This method is used to get Response Type values for Question Object.
        */
        getQuestionTypeValues({}).then(data => {
            let optionsList = [];
            if (data.length > 0) {
                data.forEach(currentItem => {
                    let map = { 'label': currentItem, 'value': currentItem };
                    optionsList.push(map);

                });
                this.options = optionsList;
                this.handleOnLoad();
            }

        }).catch(error => {

        });

    }
    renderedCallback() {
        Promise.all([
            loadStyle(this,ComponentStylesheet)
        ]);
    }
    handleOnLoad() {
        this.questionWrapper.Rhythm__Question__c = '';
        if (typeof this.assessmentTemplate !== 'undefined') {
            this.createQues = true;
        }
        if (typeof this.questionId !== 'undefined') {
            /* 
            This method is used to get Questions data in Onload.
            */
            getQuestionsData({ questionId: this.questionId, templateId: this.templateId }).then(result => {
                this.questionWrapper['Id'] = result[0].Id;
                this.questionWrapper.Rhythm__Question__c = result[0].Rhythm__Question__c;
                this.sectionId = result[0].Rhythm__Section__r.Name;
                this.questionWrapper.Rhythm__Question_Type__c = result[0].Rhythm__Question_Type__c;
                this.questionWrapper.Rhythm__Requires_File_Upload__c = result[0].Rhythm__Requires_File_Upload__c;
                this.questionWrapper.Rhythm__Required__c = result[0].Rhythm__Required__c;
                if (typeof result[0].Rhythm__HelpText__c !== 'undefined') {
                    this.questionWrapper.Rhythm__HelpText__c = result[0].Rhythm__HelpText__c;
                }
                if (typeof result[0].Rhythm__HelpText__c !== 'undefined') {
                    this.questionWrapper.Rhythm__Default_Value__c = result[0].Rhythm__Default_Value__c;
                }

                if (result[0].Rhythm__Question_Type__c === 'Radio' || result[0].Rhythm__Question_Type__c === 'Picklist' || result[0].Rhythm__Question_Type__c === 'Picklist (Multi-Select)'
                    || result[0].Rhythm__Question_Type__c === 'Checkbox') {

                    this.showResponseAttributes = true;
                    this.selQuestionType = result[0].Rhythm__Question_Type__c;
                }
                if (typeof result[0].Rhythm__Section__c !== 'undefined') {
                    this.questionWrapper.Rhythm__Section__c = result[0].Rhythm__Section__c;
                }
                if (typeof result[0].Rhythm__Assessment_Template__c !== 'undefined') {
                    this.questionWrapper.Rhythm__Assessment_Template__c = result[0].Rhythm__Assessment_Template__c;
                }
            }).catch(error => {
                let errormap = {};
                errormap.componentName = 'RtmvpcQuestionCreation';
                errormap.methodName = 'getQuestionsData';
                errormap.className = 'QuestionAttributeResponseService';
                errormap.errorData = error.message;
                errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
            });
            this.createQues = true;
        }
        if (typeof this.childQuesCreation !== 'undefined' && typeof this.childwrapper !== 'undefined') {
            this.displayNew = false;
            this.questionWrapper['Rhythm__Parent_Question__c'] = this.childwrapper.questionId;
            this.questionWrapper['Rhythm__Assessment_Template__c'] = this.childwrapper.templateId;
            this.questionWrapper['Rhythm__Section__c'] = this.childwrapper.sectionId;
            this.childTempId = this.childwrapper.templateId;

        }
    }
    /* 
        This method is used to close the popup of creating questions.
    */
    handleClose() {
        this.createQues = false;
        this.childQuesCreation = false;
        const selectedEvent = new CustomEvent('handlecancel', {
            detail: this.createQues
        });
        this.dispatchEvent(selectedEvent);
    }
    /* 
        This method method is used to change the wrapper and display the changed responsed for questions on UI.
    */
    handleChange(event) {

        let type = event.currentTarget.dataset.id;
        let value;
        if (type === 'Rhythm__Required__c' || type === 'Rhythm__Requires_File_Upload__c') {
            value = event.detail.checked;
        }
        else {
            value = event.target.value;
        }
        if (type !== undefined || type !== null) {
            if (type === 'Rhythm__Question_Type__c' && (value === 'Picklist' || value === 'Radio' || value === 'Picklist (Multi-Select)' || value === 'Checkbox')) {
                this.selQuestionType = value;
                this.questionWrapper.Rhythm__Requires_File_Upload__c = false;
                this.showResponseAttributes = true;
                setTimeout(() => {
                    this.template.querySelectorAll('c-rtmvpc-create-response-attributes')[0].handleQuestionTypeChange(value);
                }, 200);

            }
            else {
                if (type === 'Rhythm__Question_Type__c') {
                    this.showResponseAttributes = false;
                }
            }
            this.questionWrapper[type] = value;
        }
    }
    /* 
        This method method is used to close the toast message.
    */
    closeToastHandler() {
        this.showToast = false;
    }
    /* 
        This method method is used to Select the sections value (custom lookup).
    */
    handleSelectedValue(event) {
        this.questionWrapper['Rhythm__Section__c'] = event.detail;
        if (typeof this.assessmentTemplate !== 'undefined') {
            this.questionWrapper['Rhythm__Assessment_Template__c'] = this.assessmentTemplate;
        }
    }
    /* 
        This method method is used to get the changed values of Response Attributes.
    */
    handleResponseAttribute(event) {
        this.responseAttributes = event.detail;

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
        This method method is used to save Questions to backend.
    */
    handlesave() {
        this.loading = true;
        let isSubmit = false;
        let isValidate = false;
        let isChildCreated = false;
        if (typeof this.questionWrapper.Id !== 'undefined') {
            isSubmit = true;
        }
        if (typeof this.questionWrapper['Rhythm__Question_Type__c'] === 'undefined' || typeof this.questionWrapper['Rhythm__Section__c'] === 'undefined' || typeof this.questionWrapper['Rhythm__Question__c'] === 'undefined') {
            isValidate = true;
        }
        if (this.questionWrapper['Rhythm__Question_Type__c'] === '' || this.questionWrapper['Rhythm__Section__c'] === '' || this.questionWrapper['Rhythm__Question__c'] === '') {
            isValidate = true;
        }
        if (isValidate) {
            // this.totastmessage = 'Please give Required fields question type and section';
            // this.success = false;
            // this.showToast = true;
            this.configureToast('Some Error has occured', 'Please Fill the required Fields : Question, Question Type and Section ', 'error');
        }
        else {
            this.questionlst = [];
            if (this.questionWrapper['Rhythm__Question_Type__c'] === 'Picklist' || this.questionWrapper['Rhythm__Question_Type__c'] === 'Radio'
                || this.questionWrapper['Rhythm__Question_Type__c'] === 'Picklist (Multi-Select)' || this.questionWrapper['Rhythm__Question_Type__c'] === 'Checkbox') {

                if (typeof this.responseAttributes !== 'undefined' && this.responseAttributes.length > 0 && this.responseAttributes[0].Rhythm__Response_value__c !== '') {
                    let optionvalues = '';
                    let set1 = new Set();
                    this.responseAttributes.forEach(resp => {
                        optionvalues = optionvalues + resp.Rhythm__Response_value__c + '\r\n';
                        set1.add(resp.Rhythm__Response_value__c);
                    });

                    if (typeof this.childQuesCreation !== 'undefined') {
                        isChildCreated = true;
                    }
                    this.questionWrapper['Rhythm__OptionValueSet__c'] = optionvalues;
                    this.questionlst.push(this.questionWrapper);

                    let preferredlst = this.responseAttributes.filter(res => res.Rhythm__preferred_Not_preferred__c === '');
                    let requiredupdatelst = this.responseAttributes.filter(res => res.Rhythm__Upload_Required__c === '');

                    let scorelst = this.responseAttributes.filter(res => res.Rhythm__Score__c < 0);
                    let weightlst = this.responseAttributes.filter(res => res.Rhythm__Weight__c < 0);

                    if (preferredlst.length === 0 && requiredupdatelst.length === 0
                        && (Array.from(set1).length) === this.responseAttributes.length) {
                        createQuestions({ questions: this.questionlst, isUpdate: isSubmit }).then(result => {
                            let questionId = result[0].Id;
                            this.responseAttributes.forEach(resp => {
                                resp['Rhythm__QuestionId__c'] = result[0].Id;
                            });

                            let updatelst = this.responseAttributes.filter(res => typeof res.Id !== 'undefined');
                            let inserlst = this.responseAttributes.filter(res => typeof res.Id === 'undefined');

                            createResponseAttributes({ responseAttributes: inserlst }).then(result => {
                                console.log('result', result);
                            }).catch(error => {

                                let errormap = {};
                                errormap.componentName = 'RtmvpcQuestionCreation';
                                errormap.methodName = 'createResponseAttributes';
                                errormap.className = 'QuestionAttributeResponseService';
                                errormap.errorData = error.message;
                                errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                            });
                            if (updatelst.length > 0) {
                                updateResponseAttributes({ responseAttributes: updatelst }).then(result => {
                                    console.log('update result', result);
                                }).catch(error => {
                                    let errormap = {};
                                    errormap.componentName = 'RtmvpcQuestionCreation';
                                    errormap.methodName = 'updateResponseAttributes';
                                    errormap.className = 'QuestionAttributeResponseService';
                                    errormap.errorData = error.message;
                                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                                })
                            }
                            if (isChildCreated) {
                                let responsemap = { 'sobjectType': 'Rhythm__Response_Question_Map__c' };
                                responsemap['Rhythm__QuestionId__c'] = questionId;
                                responsemap['Rhythm__ResponseAttributeId__c'] = this.responseAttributeId;
                                let respQueslst = [];
                                respQueslst.push(responsemap);
                                createResponseQuestionMap({ responseQuestionmap: respQueslst }).then(result => {
                                    console.log('createResponseQuestionMap', result);
                                    this.totastmessage = 'Conditional Question has been created Successfully.';
                                    this.createQues = false;
                                    this.childQuesCreation = false;
                                    this.loading = false;
                                    // const selectedEvent = new CustomEvent('handleaftersave', {
                                    //     detail: this.totastmessage
                                    // });
                                    // this.dispatchEvent(selectedEvent);
                                });
                            }
                            if (isSubmit) {
                                this.totastmessage = 'Updated Successfully';
                            }
                            else {
                                this.totastmessage = 'Created Successfully';
                            }
                            this.loading = false;
                            this.createQues = false;
                            this.childQuesCreation = false;
                            const selectedEvent = new CustomEvent('handleaftersave', {
                                detail: this.totastmessage
                            });
                            this.dispatchEvent(selectedEvent);

                        }).catch(error => {
                            let errormap = {};
                            errormap.componentName = 'RtmvpcCreateResponseAttributes';
                            errormap.methodName = 'createQuestions';
                            errormap.className = 'QuestionAttributeResponseService';
                            errormap.errorData = error.message;
                            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                        });
                    }
                    else {
                        if (Array.from(set1).length !== this.responseAttributes.length) {
                            this.configureToast('Some Error has occured', 'Enter unique response values', 'error');
                        }
                        else {
                            
                            this.configureToast('Some Error has occured', 'Preferred/Not Preferred and Upload Required fields are mandatory', 'error');
                        }
                    }
                }
                else {
                    if (typeof this.questionWrapper.Id !== 'undefined') {
                        this.questionlst.push(this.questionWrapper);
                        if (isSubmit) {
                            createQuestions({ questions: this.questionlst, isUpdate: isSubmit }).then(result => {
                                this.totastmessage = 'Updated Successfully';
                                this.createQues = false;
                                this.loading = false;
                                this.childQuesCreation = false;
                                const selectedEvent = new CustomEvent('handleaftersave', {
                                    detail: this.totastmessage
                                });
                                this.dispatchEvent(selectedEvent);
                            }).catch(error=>{
                                this.configureToast('Some Error has occured', 'Response value,Preferred/Not Preferred and Upload Required fields are mandatory', 'error');
                                this.loading = false;
                            });
                        }
                        else {
                            this.configureToast('Some Error has occured', 'Preferred/Not Preferred and Upload Required fields are mandatory', 'error');
                            this.loading = false;
                        }
                    }
                    else {
                        this.configureToast('Some Error has occured', 'Preferred/Not Preferred and Upload Required fields are mandatory', 'error');
                        this.loading = false;
                    }
                }
            }
            else {
                this.questionlst.push(this.questionWrapper);
                if (typeof this.childQuesCreation === 'undefined') {
                    if (typeof this.questionWrapper.Id !== 'undefined' && typeof this.responseAttributes === 'undefined') {
                        getChildQuestions({ questionId: this.questionWrapper.Id, templateId: this.templateId }).then(result => {
                            if (result.length > 0) {
                                this.configureToast('Some Error has occured', 'Before changing the Response type, please delete Condtional questions', 'error');
                                this.createQues = false;
                                this.loading = false;
                            }
                            else {
                                this.questionWrapper['Rhythm__OptionValueSet__c'] = '';
                                createQuestions({ questions: this.questionlst, isUpdate: isSubmit }).then(result => {
                                    if (isSubmit) {
                                        this.totastmessage = 'Updated Successfully.';
                                    }
                                    else {
                                        this.totastmessage = 'Created Successfully.';
                                    }
                                    let questionlst = [];
                                    questionlst.push(this.questionWrapper.Id);
                                    deleteQuesRespAttribute({ questionId: questionlst }).then(delresult => {
                                        this.createQues = false;
                                        this.childQuesCreation = false;
                                        this.loading = false;
                                        const selectedEvent = new CustomEvent('handleaftersave', {
                                            detail: this.totastmessage
                                        });
                                        this.dispatchEvent(selectedEvent);
                                    }).catch(error => {
                                        let errormap = {};
                                        errormap.componentName = 'RtmvpcQuestionCreation';
                                        errormap.methodName = 'deleteQuesRespAttribute';
                                        errormap.className = 'QuestionAttributeResponseService';
                                        errormap.errorData = error.message;
                                        errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                                    });
                                }).catch(error => {
                                    let errormap = {};
                                    errormap.componentName = 'RtmvpcQuestionCreation';
                                    errormap.methodName = 'createQuestions';
                                    errormap.className = 'QuestionAttributeResponseService';
                                    errormap.errorData = error.message;
                                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                                });
                            }
                        });
                    }
                    else {
                        createQuestions({ questions: this.questionlst, isUpdate: isSubmit }).then(result => {
                            if (isSubmit) {
                                this.totastmessage = 'Updated Successfully.';
                            }
                            else {
                                this.totastmessage = 'Created Successfully.';
                            }
                            this.createQues = false;
                            this.childQuesCreation = false;
                            this.loading = false;
                            const selectedEvent = new CustomEvent('handleaftersave', {
                                detail: this.totastmessage
                            });
                            this.dispatchEvent(selectedEvent);
                        }).catch(error => {
                            let errormap = {};
                            errormap.componentName = 'RtmvpcQuestionCreation';
                            errormap.methodName = 'createQuestions';
                            errormap.className = 'QuestionAttributeResponseService';
                            errormap.errorData = error.message;
                            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                        });
                    }
                }
            }
            if (typeof this.childQuesCreation !== 'undefined' && (!isChildCreated)) {
                //this.questionlst.push(this.questionWrapper);
                createQuestions({ questions: this.questionlst, isUpdate: isSubmit }).then(result => {
                    let responsemap = { 'sobjectType': 'Rhythm__Response_Question_Map__c' };
                    responsemap['Rhythm__QuestionId__c'] = result[0].Id;
                    responsemap['Rhythm__ResponseAttributeId__c'] = this.responseAttributeId;
                    let respQueslst = [];
                    respQueslst.push(responsemap);
                    createResponseQuestionMap({ responseQuestionmap: respQueslst }).then(result => {
                        this.totastmessage = 'Conditional Question has been created Successfully.';
                        this.createQues = false;
                        this.childQuesCreation = false;
                        this.loading = false;
                        const selectedEvent = new CustomEvent('handleaftersave', {
                            detail: this.totastmessage
                        });
                        this.dispatchEvent(selectedEvent);
                    }).catch(error => {
                        let errormap = {};
                        errormap.componentName = 'RtmvpcQuestionCreation';
                        errormap.methodName = 'createResponseQuestionMap';
                        errormap.className = 'QuestionAttributeResponseService';
                        errormap.errorData = error.message;
                        errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                    });
                });
            }
        }
    }
}