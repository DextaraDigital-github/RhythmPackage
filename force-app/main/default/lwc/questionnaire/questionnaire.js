/*
* Component Name    : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections and save the responses
* Last Modified Date: 
* Secondary Contributors: 08/06/2023(Sri Kushal Reddy Nomula)
*/
import { LightningElement, api, track} from 'lwc';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import createSupplierResponse from '@salesforce/apex/AssessmentController.createSupplierResponse';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import uploadFile from '@salesforce/apex/AssessmentController.uploadFile';
import updateAccountAssessmentStatus from '@salesforce/apex/AssessmentController.updateAccountAssessmentStatus';
import deleteFileAttachment from '@salesforce/apex/AssessmentController.deleteFileAttachment';
import getResponseFlag from '@salesforce/apex/AssessmentController.getResponseFlag';
import getAccountAssessmentRecordData from '@salesforce/apex/AssessmentController.getAccountAssessmentRecordData';

export default class Questionnaire extends LightningElement {

    @track showButtons = {
        Summary: false,
        Section_Navigation: {
            show: false,
            value: '',
            options: []
        },
        Save_Submit: false
    }
    sectionLimits = 5;
    questionsList = [];
    @api vendor;
    @track success;
    @track requiredQuestionList = [];
    @track questionsandAnswersflag;
    @api assessment;
    @track totastmessage = '';
    @track isTemplate;
    @track showToast = false;
    @track responseMap = new Map();
    @track savedResponseMap = new Map();
    @track selectedCount = 0;
    @track supplierAssessmentName;
    @track supplierAssCreatedDate;
    @track AssessmentName;
    @track questionMap = new Map();
    @track childQuestionList = [];
    @track hierarchy = [];
    @api recordId;
    @track questionsAndAnswerss = [];
    @track questionsvaluemap = {};
    @track questionresponseafterchange;
    @track fileResponseData;
    @track showUpload;
    @track parentQuestionList = []
    @track Conversation_History__c;
    @track showChat;
    @track showAccordion;
    @track showAccordionQuestions;
    @track accordionFlag = false;
    @track accordionQuestionFlag = false;
    @track showRefreshbutton = false;
    @track showspinner;
    sectionidslist = [];
    @track buttonlabel = '[ + ]';
    assessmentStatus;
    @api objectApiName;
    @api accid;
    @track accountsId;
    @track isAccountAssessment;
    @track isSupplier;
    @api accountAssessmentStatus;
    @track showcustomerbuttons = false;
    @track showInReview = false;
    @track showSaveAndSubmit = false;
    @api accountassessmentid;
    @track loading = false;
    @track uploadingFile = false;

    //Used /* handleAccordionSection is used to handle opening and closing of a disclosure */
    handleAccordionSection() {
        if (this.accordionFlag === false) {
            this.accordionFlag = true;
            this.showAccordion = 'slds-accordion__section slds-is-open';
        }
        else {
            this.accordionFlag = false;
            this.showAccordion = 'slds-accordion__section slds-is-close';
        }
    }
    // This method is to handle expand all and collapse all in the supplier portal and customer portal.
     @api
    handleCollapseExpand(accordianId) {
        console.log(accordianId);
        let isdispatch = (accordianId === '[ - ]' || accordianId ===  '[ + ]');
        if (isdispatch) {
            this.buttonlabel = accordianId;
        }
        if (this.buttonlabel === '[ - ]') {
            this.sectionidslist.forEach(secId => {
                this.template.querySelector('[data-accordian="' + secId + '"]').classList = 'slds-accordion__section slds-is-close';
            });
            this.buttonlabel = '[ + ]';
        }
        else if (this.buttonlabel === '[ + ]') {
            this.sectionidslist.forEach(secId => {
                this.template.querySelector('[data-accordian="' + secId + '"]').classList = 'slds-accordion__section slds-is-open';
            });
            this.buttonlabel = '[ - ]';
        }
        if (isdispatch) {
            const selectedEvent = new CustomEvent('expandcollapse', {
                detail: this.buttonlabel
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);
        }


    }
   
    //Used /* handleAccordionSection is used to handle opening and closing of a section */
    handleAccordionQuestion(event) {
        let accordianClassList = this.template.querySelector('[data-accordian="' + event.currentTarget.dataset.id + '"]').classList;
        if (accordianClassList.contains('slds-accordion__section') && accordianClassList.contains('slds-is-open')) {
            accordianClassList.remove('slds-accordion__section');
            accordianClassList.remove('slds-is-open')
        } else {
            accordianClassList.add('slds-accordion__section')
            accordianClassList.add('slds-is-open');
        }
    }


    /* Connectedcallback is used to get data on onload */
    connectedCallback() {
        this.loading = true;
        this.accountsId = this.accid;
        this.isTemplate = false;
        let isCustomerPortal = (typeof this.recordId!== 'undefined' && typeof this.objectApiName!== 'undefined');
        if (isCustomerPortal) {
            this.assessment = this.recordId;
            this.isTemplate = true;
        }
        console.log('this.isTemplate',this.isTemplate);
        this.handleOnload();

    }
    /* handleOnload is used to get Sections data and corresponding Questions data and Responses data on onload */
    handleOnload() {
        this.questionMap = new Map();
        this.questionsList = [];
        this.sectionidslist = [];
        let sectionName = [];
        if (this.isTemplate) {
            this.isSupplier = false;
            if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                this.isAccountAssessment = true;
                console.log('this.objectApiName', this.objectApiName);
                console.log('this.recordId', this.recordId);
                /* get all assessments data of a particular AccountAssessmentRelaton__c Id */
                getAccountAssessmentRecordData({ assrecordId: this.recordId }).then(result => {
                    console.log('getAccountAssessmentRecordData result', result);
                    if (typeof result[0].Rhythm__Assessment__r !== 'undefined' && typeof result[0].Rhythm__Assessment__r.Rhythm__Template__c !== 'undefined');
                    {
                        let assessmentJunctionId = result[0].Id;
                        this.assessment = result[0].Rhythm__Assessment__r.Id;
                        let assessmentTemplateId = result[0].Rhythm__Assessment__r.Rhythm__Template__c;
                        this.assessmentStatus = result[0].Rhythm__Status__c;
                        /* get all Sections data and Questions data of a particular Template Id */
                        getQuestionsList({ templateId: assessmentTemplateId }).then(questionResult => {
                            let resultMap = questionResult;
                            resultMap.forEach(question => {
                                if (typeof question.Rhythm__Section__r !== 'undefined') {
                                    if (typeof question.Rhythm__Section__r.Id !== 'undefined') {
                                        if (!this.sectionidslist.includes(question.Rhythm__Section__r.Id)) {
                                            this.sectionidslist.push(question.Rhythm__Section__r.Id);
                                            sectionName.push(question.Rhythm__Section__r.Name);
                                        }
                                    }
                                }
                            });
                            console.log('getQuestionsList', resultMap);
                            console.log('result[0].Rhythm__Assessment__r.Id', assessmentJunctionId);
                            /* This method is used to get all the responses of the questions in particular section*/
                            getSupplierResponseList({ assessmentId: assessmentJunctionId }).then(suppResult => {
                                console.log('getSupplierResponseList', suppResult);
                                if (suppResult && suppResult.length > 0 && suppResult[0] && suppResult[0].CreatedBy && suppResult[0].CreatedDate) {
                                    this.supplierAssessmentName = suppResult[0].CreatedBy.Name;
                                    this.supplierAssCreatedDate = suppResult[0].CreatedDate;
                                    let x = this.supplierAssCreatedDate.split('T')[0];
                                    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                                    console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);
                                    // }
                                }
                                console.log('getSupplierResponseList result', this.assessmentStatus);
                                if (this.assessmentStatus !== 'New' && this.assessmentStatus !== 'In Progress') {
                                    console.log('qres===>', suppResult);
                                    suppResult.forEach(qres => {
                                        if (typeof qres.Rhythm__Question__r !== 'undefined') {
                                            this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "questionType": qres.Rhythm__Question__r.Rhythm__Question_Type__c, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                                        }
                                    });
                                }
                                console.log('this.savedResponseMap', this.savedResponseMap);
                                console.log('resultMap', resultMap);
                                //
                                this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                                let count = 0;
                                let sectionsList = [];
                                console.log('questionMap', this.questionMap);
                                for (const seckey of this.questionMap.keys()) {
                                    count++;
                                    sectionsList.push({ label: seckey, value: sectionName[count - 1] });
                                    this.questionsList.push({ "sectionId": seckey, "section": sectionName[count - 1], "numberOfQuestions": '', "numberOfResponses": '', "displayFlag": '', "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                                }
                                console.log('this.questionsList>>>', this.questionsList);
                                this.showButtons.Summary = false;
                                this.showButtons.Section_Navigation.show = false;
                                this.showButtons.Save_Submit = false;

                                if (this.questionsList.length > this.sectionLimits) {
                                    this.showButtons.Summary = true;
                                    this.showButtons.Section_Navigation.show = true;
                                    this.showButtons.Section_Navigation.options = sectionsList;
                                    //this.showButtons.Section_Navigation.value = this.section;
                                }
                                this.constructQuestionsAndAnswers(this.questionsList);
                                //This loop is to give the Qustion number for all the Questions
                                this.questionsList.forEach(questionWrap => {
                                    let sequence = 0;
                                    questionWrap.questions.forEach(question => {
                                        let childsequence = 0;
                                        question.snumber = ++sequence;
                                        //This loop is to give all the number for all children Questions
                                        question.Children.forEach(childQuestion => {
                                            childQuestion.snumber = sequence + '.' + (++childsequence); 
                                        })
                                    })
                                    questionWrap.responsesPercentage = Math.floor((Number(questionWrap.numberOfResponses) / Number(questionWrap.numberOfQuestions)) * 100);
                                });
                                if (this.accountAssessmentStatus === 'Need More Information') {
                                    //this.handleFilterFlag(true);
                                }
                        this.loading = false;
                            }).catch(error => {
                                let errormap = {}; 
                                errormap.componentName = 'Questionnaire'; 
                                errormap.methodName = 'getSupplierResponseList'; 
                                errormap.className = 'AssessmentController';
                                errormap.errorData = error.message; 
                                errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                            });

                        }).catch(error => {
                            let errormap = {}; 
                            errormap.componentName = 'Questionnaire'; 
                            errormap.methodName = 'getQuestionsList'; 
                            errormap.className = 'AssessmentController';
                            errormap.errorData = error.message; 
                            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                        });
                        console.log('result getAccountAssessmentRecordData', result);
                    }

                }).catch(error => {
                    let errormap = {}; 
                    errormap.componentName = 'Questionnaire'; 
                    errormap.methodName = 'getAccountAssessmentsRecordData'; 
                    errormap.className = 'AssessmentController';
                    errormap.errorData = error.message; 
                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
           
                });

            }
            else {
                this.showRefreshbutton = true;
                this.savedResponseMap = {};
                /* get all Sections data and Questions data of a particular Template Id */
                getQuestionsList({ templateId: this.recordId }).then(questionResult => {
                    let resultMap = questionResult;
                    resultMap.forEach(question => {
                        if (typeof question.Rhythm__Section__r !== 'undefined' && typeof question.Rhythm__Section__r.Id !== 'undefined') {
                            if (!this.sectionidslist.includes(question.Rhythm__Section__r.Id)) {
                                this.sectionidslist.push(question.Rhythm__Section__r.Id);
                                sectionName.push(question.Rhythm__Section__r.Name);
                            }
                        }
                    });
                    console.log('resultMap', resultMap);
                    //
                    this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                    let count = 0;
                    let sectionsList = [];

                    console.log('questionMap', this.questionMap);
                    for (const seckey of this.questionMap.keys()) {
                        count++;
                        sectionsList.push({ label: seckey, value: sectionName[count - 1] });
                        this.questionsList.push({ "sectionId": seckey, "section": sectionName[count - 1], "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                    }
                    console.log('this.questionsList>>>244', this.questionsList);
                    this.constructQuestionsAndAnswers(this.questionsList);
                    console.log('this.questionsList>>>', this.questionsList);
                    //This loop is to give the Qustion number for all the Questions. 
                     this.questionsList.forEach(questionWrap => {
                        let sequence = 0;
                        questionWrap.questions.forEach(question => {
                            let childsequence = 0;
                            question.snumber = ++sequence;
                            //This loop is to give all the number for all children Questions.
                            question.Children.forEach(childQuestion => {
                                childQuestion.snumber = sequence + '.' + (++childsequence); 
                            })
                        })
                       // questionWrap.responsesPercentage = Math.floor((Number(questionWrap.numberOfResponses) / Number(questionWrap.numberOfQuestions)) * 100);
                    })
                    //this.handleFilterFlag(true);
                    this.loading = false;
                }).catch(error => {
                    let errormap = {}; 
                    errormap.componentName = 'Questionnaire'; 
                    errormap.methodName = 'getQuestionsList'; 
                    errormap.className = 'AssessmentController';
                    errormap.errorData = error.message; 
                    errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                });
            }
        }
        else {
            this.isSupplier = true;

            /*This method is used to get all the assessments records*/
            getSupplierAssessmentList({ assessmentId: this.accountassessmentid }).then(result => {
                let assessmentTemplateId = result[0].Rhythm__Assessment__r.Rhythm__Template__c;
                this.showDisclosure = result[0].Rhythm__Assessment__r.Rhythm__Disclosure__c;
                this.AssessmentName = result[0].Name;
                this.assessmentStatus = result[0].Rhythm__Status__c;
                this.sectionidslist = [];
                /*This method is used to get all the questions with particular section*/
                getQuestionsList({ templateId: assessmentTemplateId }).then(questionResult => {
                    let resultMap = questionResult;
                    resultMap.forEach(question => {
                        if (typeof question.Rhythm__Section__r !== 'undefined' && typeof question.Rhythm__Section__r.Id !== 'undefined') {
                            if (!this.sectionidslist.includes(question.Rhythm__Section__r.Id)) {
                                this.sectionidslist.push(question.Rhythm__Section__r.Id);
                                sectionName.push(question.Rhythm__Section__r.Name);
                            }
                        }
                    });
                    /* This method is used to get all the responses of the questions in particular section*/
                    getSupplierResponseList({ assessmentId: this.accountassessmentid }).then(suppResult => {
                        if (suppResult && suppResult.length > 0 && suppResult[0] && suppResult[0].CreatedBy && suppResult[0].CreatedDate) {
                            this.supplierAssessmentName = suppResult[0].CreatedBy.Name;
                            this.supplierAssCreatedDate = suppResult[0].CreatedDate;
                            let x = this.supplierAssCreatedDate.split('T')[0];
                            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                            console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);
                            // }
                        }
                        console.log('getSupplierResponseList result', suppResult);
                        suppResult.forEach(qres => {
                            if (typeof qres.Rhythm__Question__r !== 'undefined') {
                                this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "questionType": qres.Rhythm__Question__r.Rhythm__Question_Type__c, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                            }
                        });
                        //
                        this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                        let count = 0;
                        let sectionsList = [];
                        for (const seckey of this.questionMap.keys()) {
                            count++;
                            sectionsList.push({ label: seckey, value: sectionName[count - 1] });
                            this.questionsList.push({ "sectionId": seckey, "section": sectionName[count - 1], "numberOfQuestions": '', "numberOfResponses": '', "displayFlag": '', "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                        }
                        this.showButtons.Summary = false;
                        this.showButtons.Section_Navigation.show = false;
                        if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus === 'Review Completed' ||
                            this.accountAssessmentStatus === 'In Review') {
                            this.showButtons.Save_Submit = false;
                            this.showcustomerbuttons = false;
                            this.showButtons.Summary = true;
                        }
                        else {
                            this.showButtons.Save_Submit = true;
                        }
                        if (this.questionsList.length > this.sectionLimits) {
                            this.showButtons.Summary = true;
                            this.showButtons.Section_Navigation.show = true;
                            this.showButtons.Section_Navigation.options = sectionsList;
                            //this.showButtons.Section_Navigation.value = this.section;
                        }
                        this.constructQuestionsAndAnswers(this.questionsList);
                        //
                        this.questionsList.forEach(questionWrap => {
                            let sequence = 0;
                            questionWrap.questions.forEach(question => {
                                let childsequence = 0;
                                question.snumber = ++sequence;
                                //
                                question.Children.forEach(childQuestion => {
                                    childQuestion.snumber = sequence + '.' + (++childsequence); 
                                })
                            })
                            questionWrap.responsesPercentage = Math.floor((Number(questionWrap.numberOfResponses) / Number(questionWrap.numberOfQuestions)) * 100);
                        })

                        if (this.accountAssessmentStatus === 'Need More Information') {
                            console.log('Into the if to call handlefilterflag');
                            //this.handleFilterFlag(true);
                        }
                    this.loading = false;
                    }).catch(error => {
                        let errormap = {}; 
                        errormap.componentName = 'Questionnaire'; 
                        errormap.methodName = 'getSupplierResponseList'; 
                        errormap.className = 'AssessmentController';
                        errormap.errorData = error.message; 
                        errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                    })
                }).catch(error => {
                        let errormap = {}; 
                        errormap.componentName = 'Questionnaire'; 
                        errormap.methodName = 'getQuestionsList'; 
                        errormap.className = 'AssessmentController';
                        errormap.errorData = error.message; 
                        errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                })
            }).catch(error => {
                let errormap = {}; 
                errormap.componentName = 'Questionnaire'; 
                errormap.methodName = 'getAccountAssessmentsRecordData'; 
                errormap.className = 'AssessmentController';
                errormap.errorData = error.message; 
                errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
            });
            this.showspinner = false;

        }
    }
    /**
* constructQuestionsAndAnswers method method is used to build the wrappers based on sections and their according questions.
* @param List of sections.
* 
*/
    constructQuestionsAndAnswers(questionsList) {
        let duplicatequestionList = questionsList;
        this.questionsAndAnswerss = [];
        questionsList.forEach(questionlst =>{
            if ((questionsList.length > this.sectionLimits) || questionsList.length <= this.sectionLimits) {
                for (let j = 0; j < questionlst.questions.length; j++) {
                    if ((this.childQuestionList.includes(questionlst.questions[j].Id))) {
                        questionlst.questions.splice(j, 1);
                    }
                }
                questionlst.numberOfQuestions = questionlst.questions.length;
                this.questionsAndAnswerss.push(questionlst);
            }
        });
        console.log('this.questionsAndAnswerss 407', this.questionsAndAnswerss);
        if (this.questionsAndAnswerss.length > 0) {
            if (!this.isTemplate || this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                if (typeof this.questionsAndAnswerss[0].questions[0] !== 'undefined' && typeof this.questionsAndAnswerss[0].questions[0].Id !== 'undefined' && typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id) !== 'undefined') {
                    if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c !== 'undefined' && this.isTemplate === false) {
                        this.Rhythm__Conversation_History__c = { 'Id': this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Id, 'AssessmentId': this.assessment, 'QuestionnaireId': this.questionsAndAnswerss[0].questions[0].Id, 'chatHistory': (this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c ? JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c) : '') };
                    }
                }
                for (let i = 0; i < duplicatequestionList.length; i++) {
                    let numberOfResponses = 0;
                    let displayFlag = 0;
                    //
                    for (let j = 0; j < questionsList[i].questions.length; j++) {
                        if (typeof questionsList[i].questions[j].value !== 'undefined') {
                            if (typeof questionsList[i].questions[j].defaultValue === 'undefined') {
                                numberOfResponses++;
                            }
                            else if(typeof this.accountAssessmentStatus !== 'undefined' && this.accountAssessmentStatus !== 'New'){
                                numberOfResponses++;
                            }
                        }
                        if (typeof questionsList[i].questions[j].Children !== 'undefined') {
                        // written and commented for nesting of questions which will be handled at sprint 2.
                            // for (let k = 0; k < questionsList[i].questions[j].Children.length; k++) {
                            //     if (typeof questionsList[i].questions[j].Children.value !== 'undefined') {
                            //         numberOfResponses++;
                            //     }
                            // }
                        }
                        if (duplicatequestionList[i].questions[j].Rhythm__Flag__c === true) {
                            displayFlag++;
                        }
                    }
                    questionsList[i].displayFlag = displayFlag;
                    if (typeof this.accountAssessmentStatus !== 'undefined' && this.accountAssessmentStatus !== 'New')
                        questionsList[i].numberOfResponses = numberOfResponses;
                    else
                        questionsList[i].numberOfResponses = 0;
                }
            }

        }
    }

    //Used /* onResponseChange method is used to change the wrapper and display the changed responsed for questions values on UI */
    onResponseChange(event) {
        console.log(' event.detail', event.detail);
        this.questionresponseafterchange = event.detail;
        if (this.questionresponseafterchange !== undefined) {
            //This loop is to iterate over the sections in the wrapper.
                this.questionsAndAnswerss.forEach(questionAnswer => {
                    //This loop is to iterate over the Questions for a particular sections in the wrapper.
                    questionAnswer.questions.forEach(question => {
                        if (this.questionresponseafterchange.parent === null && this.questionresponseafterchange.questionId === question.Id) {
                            if (Array.isArray(this.questionresponseafterchange.option)) {
                                question.value = JSON.stringify(this.questionresponseafterchange.option);
                            }
                            else {
                                question.value = this.questionresponseafterchange.option;
                            }
                            if (question.Children.length > 0) {
                                //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                                question.Children.forEach(subquestion => {
                                    if (subquestion.conditional === question.value) {
                                        subquestion.isdisplay = true;
                                    }
                                    else {
                                        subquestion.isdisplay = false;
                                    }
                                })
                            }
                        }
                        else {
                            if (this.questionresponseafterchange.parentObj === question .Id) {
                            //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                               question.Children.forEach(subquestion => {
                                console.log(subquestion);
                                    if (Array.isArray(this.questionresponseafterchange.option)) {
                                        question.value = JSON.stringify(this.questionresponseafterchange.option);
                                    }
                                    else {
                                        question.value = this.questionresponseafterchange.option;
                                    }
                                });
                            }
                        }
                    });
                });
            this.responseMap.set(this.questionresponseafterchange.questionId, this.questionresponseafterchange.option);
            console.log('onResponseChange this.responseMap', this.responseMap);
        }
        console.log('this.questionsAndAnswerss after change', this.questionsAndAnswerss);
    }

    /*handleFileUpload method is used to store the uploaded attachments into response records */
    handleFileUpload(event) {
        this.uploadingFile = true
        // this.template.querySelector('c-rtmvpc-render-question-template').fileUploadHandler('true');
        console.log('inQuestionnaire for file upload', event.detail);
        this.fileResponseData = event.detail;

        let responseId = '';
        if (this.savedResponseMap !== null) {
            if (this.savedResponseMap.hasOwnProperty(this.fileResponseData.questionId)) {
                responseId = this.savedResponseMap.get(this.fileResponseData.questionId).Id;
            }
        }
        console.log('responseId' + responseId);
        let filemap = {};
        filemap.responseId = responseId;
        filemap.fileBlob = this.fileResponseData.filedata;
        filemap.name = this.fileResponseData.name;
        filemap.quesId = this.fileResponseData.questionId;
        filemap.assessmentId = this.accountassessmentid;
        console.log('filemap', filemap);
        console.log('this.fileResponseData', this.fileResponseData);
        /*Apex method is used to store the uploaded attachments into response records */
        uploadFile({ fileResp: JSON.stringify(filemap) }).then(result => {
            console.log('handleFileUpload', result);
            this.template.querySelectorAll('c-rtmvpc-render-question-template')[0].getShowUploadStatus();
            console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
            for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
                if (this.questionsAndAnswerss[i].sectionId === this.fileResponseData.sectionId) {
                    for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                        if (this.questionsAndAnswerss[i].questions[j].Id === this.fileResponseData.questionId) {
                            // if (typeof this.questionsAndAnswerss[i].questions[j].Files__c === 'undefined') {
                            //     let fileresponsedatalst = [];
                            //     fileresponsedatalst.push(this.fileResponseData);
                            //     this.questionsAndAnswerss[i].questions[j].Files__c = fileresponsedatalst;
                            // }
                            // else {
                            //     this.questionsAndAnswerss[i].questions[j].Files__c.push(this.fileResponseData);
                            // }
                            this.uploadingFile = false;
                            let filesdatastored = JSON.parse(result[0].Rhythm__Files__c);
                            let x = JSON.parse(JSON.stringify(filesdatastored[filesdatastored.length - 1]));
                            if (typeof this.questionsAndAnswerss[i].questions[j].Files__c === 'undefined') {
                                let fileresponsedatalst = [];
                                fileresponsedatalst.push(x);
                                this.questionsAndAnswerss[i].questions[j].Files__c = fileresponsedatalst;
                            }
                            else {
                                this.questionsAndAnswerss[i].questions[j].Files__c.push(x);
                            }

                        }
                    }
                }
            }
            let quesResponse = { "Id": result[0].Id, "questionType": this.fileResponseData.type, "value": '', "Files__c": result[0].Rhythm__Files__c, "Flag__c": this.fileResponseData['flag'], "Conversation_History__c": this.fileResponseData['conversationHistory'] };
            this.savedResponseMap.set(this.fileResponseData.questionId, quesResponse);
            this.responseMap.set(this.fileResponseData.questionId, quesResponse);
            console.log('this.questionsAndAnswerss>>>', this.questionsAndAnswerss);
            // this.template.querySelector('c-rtmvpc-render-question-template').fileUploadHandler('false');
            this.uploadingFile = false;
            //this.handleOnload();
        }); 
    }

    /* handledeletefile method is used to store the uploaded attachments into response records  */
    handledeletefile(event) {
        console.log('In Questionnaire handledeletefile', event.detail);
        let deletefileData = event.detail;
        console.log('In Questionnaire handledeletefile', deletefileData);
        let deletefile = {};
        deletefile.accountAssessmentId = this.accountassessmentid;
        deletefile.questionId = deletefileData.questionId;
        deletefile.name = deletefileData.name;
        console.log('deletefile', deletefile);
        deleteFileAttachment({ deleteMap: JSON.stringify(deletefile) }).then(result => {
            console.log('result', result);
            //This loop is to iterate over the sections in the wrapper.
            for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
                if (this.questionsAndAnswerss[i].sectionId === deletefileData.sectionId) {
                    ////This loop is to iterate over the Questions for a particular sections in the wrapper.
                    for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                        if (this.questionsAndAnswerss[i].questions[j].Id === deletefileData.questionId &&
                            typeof this.questionsAndAnswerss[i].questions[j].Files__c !== 'undefined') {
                            ////This loop is to iterate over the Files Questions for a particular sections and Questions in the wrapper.
                            for (let k = 0; k < this.questionsAndAnswerss[i].questions[j].Files__c.length; k++) {
                                if (this.questionsAndAnswerss[i].questions[j].Files__c[k].name === deletefileData.name) {
                                    this.questionsAndAnswerss[i].questions[j].Files__c.splice(k, 1); //Review for Optimization
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    /* This method is used to display the only flageed Questions and All the Questions based on selection */
    @api
    handleFilterFlag(flagFilter) {
        console.log('From parent');
        //this.questionsandAnswersflag =this.questionsAndAnswerss);
        if (flagFilter) {
            this.questionsAndAnswerss.forEach(questionAnswer => {
                questionAnswer.questions = questionAnswer.questions.filter(item => (item.Rhythm__Flag__c ));
                questionAnswer.questions.forEach(question =>{
                    question.Children = question.Children.filter(item => item.Rhythm__Flag__c);
                })
                console.log('this.questionsAndAnswerss handlefilter flag', this.questionsAndAnswerss);
            })
        }
        else {
            this.questionsList = [];
            this.questionMap = new Map();
            this.questionsAndAnswerss = [];
            this.handleOnload();
        }
    }

    /* getQuestionTemplate is used to create the basic question template for wrapper construction */
    getQuestionTemplate() {
        let question = {
            "question": "", "helptext": "", "isText": false, "isRadio": false, "isPicklist": false,
            "isMultiPicklist": false, "isDate": false, "isDateTime": false, "isCheckbox": false, "isNumber": false, "isCurrency": false, "isPhone": false, "isPercent": false,
            "isEmail": false, "isTextArea": false, "Id": "",
            "type": "Radio", "conditional": "", "optionsValueSet": "Test1, Test2", "ConditionalQuestion": "test4,test5",
            "optionsWrapper": {
                "checkboxOptions": [],
                "pickListOptions": [
                    { "label": "", "value": "" }
                ],
                "radioOptions": [],
                "multiPickListOptions": [],
                "options": []
            }
        };
        return question;
    }

    /*handleSave method is used to save the responses for particular question */
    handleSave() {
        this.constructResponse(false);
    }

    /* handleSubmit method is used to save the responses for particular question and update the assessment status to submit */
    handleSubmit() {
        this.constructResponse(true);
    }

    /* constructResponse is used to call an apex class to store the response */
    constructResponse(isSubmit) {
        var isAssessmentValidated = false;
        var responseList = [];
        var questionsId = [];
        var flagmap = {};
        var filesmap = {};
        var responseIdlist = [];
        var tabledata = '<table><thead>';
        tabledata += '<tr><th>Section</th><th>Question</th><th>Responses</th><th>No.of File Attachments</th><th>Response History</th></tr>';
        tabledata += '</thead><tbody>';
        for (const seckey of this.responseMap.keys()) {
            responseIdlist.push(seckey);
        }
        console.log('responseIdlist', responseIdlist);
        //This loop is to iterate over the sections in the wrapper.
        this.questionsAndAnswerss.forEach(questionAnswer => {
            let rowdata = '';
             //This loop is to iterate over the Questions for a particular sections in the wrapper.
            questionAnswer.questions.forEach(question => {
                if (this.requiredQuestionList.includes(question.Id) &&
                typeof question.value !== 'undefined') {
                    if(typeof this.accountAssessmentStatus==='undefined' ||  this.accountAssessmentStatus === 'New')
                    {
                        let index = this.requiredQuestionList.indexOf(question.Id);
                        this.requiredQuestionList.splice(index, 1);
                    }
                 }
                if (typeof question.defaultValue !== 'undefined') {
                    if (responseIdlist.includes(question.Id)) {
                        let index = responseIdlist.indexOf(question.Id);
                        responseIdlist.splice(index, 1);
                    }
                    else {
                        if (typeof question.value !== 'undefined') {
                            if (question.value !== question.defaultValue) {
                                this.responseMap.set(question.Id, question.value);
                            }
                            else {
                                this.responseMap.set(question.Id, question.defaultValue);
                            }
                        }
                    }
                }
                if (typeof questionAnswer.section !== 'undefined') {
                    rowdata = rowdata + '<tr><td>' + questionAnswer.section + '</td>';
                    if (typeof question.snumber !== 'undefined' && typeof question.question !== 'undefined') {
                        rowdata = rowdata + '<td>' + question.snumber + ' ' + question.question + '</td>';
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    if (typeof question.value !== 'undefined') {
                        rowdata = rowdata + '<td>' + question.value + '</td>';
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    if (typeof question.Files__c !== 'undefined') {
                        rowdata = rowdata + '<td>' + question.Files__c.length + '</td>';
                    }
                    else {
                        rowdata = rowdata + '<td></td>';
                    }
                    if (typeof question.Rhythm__Conversation_History__c !== 'undefined') {
                        if (JSON.parse((question.Rhythm__Conversation_History__c).length > 0)) {
                            let str = '';
                            let convHistory = JSON.parse(question.Rhythm__Conversation_History__c);
                            convHistory.forEach(conv => {
                                str = str + conv.Name + ':' + conv.Text + '\n';
                            })
                            rowdata = rowdata + '<td>' + str + '</td>';
                        }
                    }
                    else {
                        rowdata = rowdata + '<td></td>'
                    }
                }
                });
                tabledata = tabledata + rowdata;
            });
        tabledata = tabledata + '</tbody></table>';
        let conversationhistory = {};
        for (const questionkey of this.responseMap.keys()) {
            questionsId.push(questionkey);
        }
        //This loop is to iterate over the sections in the wrapper.
        this.questionsAndAnswerss.forEach(questionAnswer => {
            //This loop is to iterate over the Questions for a particular sections in the wrapper.
            questionAnswer.questions.forEach(question => {
            if (questionsId.includes(question.Id)) {
                if (typeof question.Rhythm__Flag__c !== 'undefined') {
                    flagmap[question.Id] = question.Rhythm__Flag__c;
                    conversationhistory[question.Id] = question.Rhythm__Conversation_History__c;
                }
                if (typeof question.Files__c !== 'undefined') {
                    filesmap[question.Id] = question.Files__c;
                }
                if (question.isEmail === true && !(question.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))) {
                    isAssessmentValidated = true;
                    this.showspinner = false;
                    this.showToast = true;
                    this.success = false;
                    this.totastmessage = 'Please enter the valid email:';
                }
                if (question.isPhone === true && !(question.value.match('[0-9]{3}-[0-9]{3}-[0-9]{4}'))) {
                    isAssessmentValidated = true;
                    this.showspinner = false;
                    this.showToast = true;
                    this.success = false;
                    this.totastmessage = 'Please enter the valid phone number in the format xxx-xxx-xxxx:';
                }
                //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                question.Children.forEach(subQuestion => {
                    if (questionsId.includes(subQuestion.Id)) {
                        if (typeof subQuestion.Rhythm__Flag__c !== 'undefined') {
                            flagmap[subQuestion.Id] = subQuestion.Rhythm__Flag__c;
                            conversationhistory[subQuestion.Id] = subQuestion.Rhythm__Conversation_History__c;
                        }
                        if (typeof subQuestion.Files__c !== 'undefined') {
                            filesmap[subQuestion.Id] = subQuestion.Files__c;
                        }
                    }
                });
            }
            });
        });
        for (const seckey of this.responseMap.keys()) {
            let reponse = { 'sobjectType': 'Rhythm__Response__c' };
            reponse.Rhythm__AccountAssessmentRelation__c = this.accountassessmentid;
            reponse.Rhythm__Question__c = seckey;
            reponse.Rhythm__Account__c = this.vendor;
            if (Array.isArray(this.responseMap.get(seckey))) {
                reponse.Rhythm__Response__c = JSON.stringify(this.responseMap.get(seckey));
            }
            else if(this.responseMap.get(seckey) === true || this.responseMap.get(seckey) === false )
            {
                reponse.Rhythm__Response__c=JSON.stringify(this.responseMap.get(seckey));
            }
            else {
                reponse.Rhythm__Response__c = (this.responseMap.get(seckey));
            }
            if (typeof flagmap[seckey] !== 'undefined') {
                console.log('into this');
                reponse.Rhythm__Flag__c = flagmap[seckey];
            }
            if (typeof filesmap[seckey] !== 'undefined') {
                console.log('into filesmap');
            }
            if (typeof conversationhistory[seckey] !== 'undefined' && conversationhistory[seckey].length > 0) {
                reponse.Rhythm__Conversation_History__c = conversationhistory[seckey];
            }
            reponse.Rhythm__Is_Latest_Response__c = true;
            console.log('reponse in constructResponse', reponse);
            if (this.requiredQuestionList.includes(reponse.Rhythm__Question__c)) {
                if (typeof reponse.Rhythm__Response__c === 'undefined' ||
                    (typeof reponse.Rhythm__Response__c !== 'undefined' && reponse.Rhythm__Response__c === '') ||
                    (typeof reponse.Rhythm__Response__c !== 'undefined' && reponse.Rhythm__Response__c === '[]')) {
                    isAssessmentValidated = true;
                    break;
                }
                else {
                    for (let i = 0; i < this.requiredQuestionList.length; i++) {
                        if (this.requiredQuestionList[i] === reponse.Rhythm__Question__c) {
                            this.requiredQuestionList.splice(i, 1);
                        }
                    }
                }
            }
            responseList.push(reponse);
        }
        console.log('this.requiredQuestionList', this.requiredQuestionList);
        if (this.requiredQuestionList.length > 0 && isSubmit) {
            isAssessmentValidated = true;
            this.showspinner = false;
            this.showToast = true;
            this.success = false;
            this.totastmessage = 'Please fill Mandatory questions ';
        }
        console.log('responseList', responseList);
        if (isAssessmentValidated === false) {
            this.showToast = true;
            this.success = true;
            let responseQueryMap = {};
            responseQueryMap.accountId = this.accid;
            responseQueryMap.assesmentId = this.assessment;
            responseQueryMap.accountassessmentid = this.accountassessmentid;
            if (this.assessmentStatus !== 'Need More Information') {
                if (isSubmit) {
                    responseQueryMap.status = 'Submitted';
                }
                else {
                    responseQueryMap.status = 'In Progress';
                }
            }
            else {
                if (isSubmit) {
                    responseQueryMap.status = 'Submitted';
                    this.showButtons.Save_Submit = false;
                }
                else {
                    responseQueryMap.status = 'Need More Information';

                }
            }
            if (isSubmit) {
                responseQueryMap.submit = true;
            }
            else {
                responseQueryMap.submit = false;
            }
            responseQueryMap.pdfContnet = tabledata;
            /* This method is used to create the response for the questions*/
            createSupplierResponse({ suppResponseList: responseList, paramMap: JSON.stringify(responseQueryMap) }).then(result => {
                this.totastmessage = 'Responses saved successfully';
                if (isSubmit) {
                    this.questionsAndAnswerss.forEach(questionAnswer => {
                        questionAnswer.questions.forEach(question => {
                            if (question.Flag__c !== true) {
                                question.isEditable = true;
                            }
                            question.Children.forEach(subQuestion => {
                                if (subQuestion.Flag__c !== true) {
                                    subQuestion.isEditable = true;
                                }
                            })
                        })
                    });
                }
                const selectedEvent = new CustomEvent('updatetimeline', {
                    detail: true
                });
                this.dispatchEvent(selectedEvent);
                this.handleOnload();
            }).catch(error => {
                let errormap = {}; 
                errormap.componentName = 'Questionnaire'; 
                errormap.methodName = 'createSupplierResponse'; 
                errormap.className = 'AssessmentController';
                errormap.errorData = error.message; 
                errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
                this.totastmessage = 'Error : ' + JSON.stringify(error);
            });
        }
    }

    /* Used to close the toast message populated on saving */
    closeToastHandler(event) {
        console.log('In Disptch event');
        this.showToast = event.detail.showModal;
    }

    /*constructWrapperConditionalQuestion method is used to construct the wrapper for Questions and responses  */
    constructWrapperConditionalQuestion(qu, savedResp) {
        let quTemp = this.getQuestionTemplate();
        quTemp.Id = qu.Id;
        if (typeof qu.Rhythm__HelpText__c !== 'undefined') {
            quTemp.helptext = qu.Rhythm__HelpText__c;
        }
        quTemp.question = qu.Rhythm__Question__c;
        let qtype = qu.Rhythm__Question_Type__c;
        console.log('sampleData', qtype);
        //quTemp.sectionId = this.section;
        quTemp.isText = ('Text' === qtype);
        quTemp.isPercent = ('Percent' === qtype);
        quTemp.isRadio = ('Radio' === qtype);
        quTemp.isPicklist = ('Picklist' === qtype);
        quTemp.isMultiPicklist = ('Picklist (Multi-Select)' === qtype);
        quTemp.isDate = ('Date' === qtype);
        quTemp.isDateTime = ('Date/Time' === qtype);
        quTemp.isCheckbox = ('Checkbox' === qtype);
        quTemp.isNumber = ('Number' === qtype);
        quTemp.isPhone = ('Phone' === qtype);
        quTemp.isCurrency = ('Currency' === qtype);
        quTemp.isEmail = ('Email' === qtype);
        quTemp.isTextArea = ('Text Area (Rich)' === qtype);
        quTemp.type = qtype;
        quTemp.required = qu.Rhythm__Required__c;
        quTemp.inputId = qu.Id + '_inputId';
        quTemp.labelId = qu.Id + '_labelId';
        quTemp.spanId = qu.Id + '_spanId';
        quTemp.customerFlag = false;
        if (typeof qu.Rhythm__Default_Value__c !== 'undefined' && typeof this.recordId === 'undefined' 
            && typeof this.objectApiName === 'undefined') {
            quTemp.defaultValue = qu.Rhythm__Default_Value__c;
        }
        quTemp.Rhythm__Flag__c = false;
        quTemp.parentQuestionId = qu.Rhythm__Parent_Question__c;
        if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c' || !this.isTemplate) {
            if (typeof savedResp.get(qu.Id) !== 'undefined') {
                quTemp.Rhythm__Flag__c = savedResp.get(qu.Id).Flag__c;
            }
            console.log('status==>', this.accountAssessmentStatus);
            if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
                if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus === 'In Review' || this.accountAssessmentStatus === 'Need More Information') {
                    this.showcustomerbuttons = true;
                    if (this.accountAssessmentStatus === 'Submitted') {
                        this.showInReview = true;
                    }
                    if (this.accountAssessmentStatus === 'Need More Information' || this.accountAssessmentStatus === 'In Review') {
                        this.showInReview = false;
                        this.showSaveAndSubmit = true;
                        quTemp.customerFlag = true;
                    }
                }
                else {
                    if (this.accountAssessmentStatus === 'Review completed') {
                        quTemp.isEditable = true;
                    }
                    else {
                        quTemp.isEditable = false;
                    }
                }

            }
            else {
                if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus === 'Need More Information' || this.assessmentStatus === 'In Review') {
                    if (this.assessmentStatus === 'Need More Information') {
                        if (quTemp.Rhythm__Flag__c) {
                            quTemp.isEditable = false;
                        }
                        else {
                            quTemp.isEditable = true;
                        }
                    }
                    else {
                        quTemp.isEditable = true;
                        this.showButtons.Save_Submit = false;
                    }
                }
                else {
                    if (this.accountAssessmentStatus === 'Review Completed') {
                        quTemp.isEditable = true;
                    }
                    else {
                        quTemp.isEditable = false;
                    }
                }
            }
            if (qu.Rhythm__Required__c === true) {
                this.requiredQuestionList.push(qu.Id);
            }
            quTemp.conditional = qu.Rhythm__Conditional_Response__c === null ? '' : qu.Rhythm__Conditional_Response__c;
            quTemp.optionsValueSet = qu.Rhythm__OptionValueSet__c;
            let optionList = [];
            if (quTemp.optionsValueSet) {
                let optionValues = quTemp.optionsValueSet.split("\r\n");
                optionValues.forEach(opt => {
                    let optionMap = {};
                    optionMap.label = opt;
                    optionMap.value = opt;
                    optionList.push(optionMap);
                });
            }
            quTemp.optionsWrapper.options = optionList;
            quTemp.optionsWrapper.pickListOptions = optionList;
            quTemp.optionsWrapper.radioOptions = optionList;
            quTemp.optionsWrapper.multiPickListOptions = optionList;
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).value !== 'undefined') {
                console.log(savedResp.get(qu.Id));
                quTemp.value = savedResp.get(qu.Id).value;
                console.log('manual', savedResp);
                if (savedResp.get(qu.Id).questionType === "Checkbox") {
                    if (savedResp.get(qu.Id).value === "true")
                        quTemp.value = true;
                    else
                        quTemp.value = false;
                }
                if (savedResp.get(qu.Id).questionType === "Picklist (Multi-Select)") {
                    if (savedResp.get(qu.Id).value.includes('[')) {
                        quTemp.optionsWrapper.selectedListOptions = JSON.parse(savedResp.get(qu.Id).value);
                        quTemp.value = JSON.stringify(quTemp.optionsWrapper.selectedListOptions);

                    }
                    else
                        quTemp.optionsWrapper.selectedListOptions = false;
                }
                console.log('manual', quTemp);
            }
            else {
                if (typeof qu.Rhythm__Default_Value__c !== 'undefined' && qu.Rhythm__Default_Value__c !== null && (this.objectApiName!=='Rhythm__AccountAssessmentRelation__c'||typeof this.recordId!=='undefined')) {
                    if (qu.Rhythm__Question_Type__c === 'Picklist') {
                        quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') {
                        quTemp.optionsWrapper.selectedListOptions = JSON.parse('[' + JSON.stringify(qu.Rhythm__Default_Value__c) + ']');
                        quTemp.value = JSON.stringify(quTemp.optionsWrapper.selectedListOptions);
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Text Area (Rich)') {
                        quTemp.value = '<p>' + JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)) + '</p>';
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Checkbox') {
                        quTemp.value = (Boolean)(JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)));
                    }
                    else {
                        quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                    }
                }
            }
            //console.log('savedResp.get(qu.Id).Rhythm__Conversation_History__c',savedResp.get(qu.Id).Conversation_History__c);   
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).Conversation_History__c !== 'undefined') {
                quTemp.Rhythm__Conversation_History__c = savedResp.get(qu.Id).Conversation_History__c;
            }
            else {
                quTemp.Rhythm__Conversation_History__c = [];
            }
            quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).Files__c !== 'undefined') {
                let responsedData = JSON.parse(savedResp.get(qu.Id).Files__c);
                if(responsedData){
                    responsedData.forEach(resData =>{
                        resData.isPng = (resData).type === 'png';
                        resData.isPdf = (resData).type === 'pdf';
                        resData.isCsv = (resData).type === 'csv';
                        resData.isDocx = (resData).type === 'docx';
                        resData.isDocx = (resData).type === 'doc';
                    });
                }
                quTemp.Files__c = responsedData;
            }
            quTemp.showUploadProgress = false;
            if (typeof savedResp.get(qu.Id) !== 'undefined' && typeof savedResp.get(qu.Id).value !== 'undefined')
                this.responseMap.set(qu.Id, savedResp.get(qu.Id).value);
            quTemp.Children = [];
            if (typeof qu.Rhythm__Section__r !== 'undefined' && typeof qu.Rhythm__Section__r.Name !== 'undefined') {
                if (this.questionMap.has(qu.Rhythm__Section__r.Id)) {
                    this.questionMap.get(qu.Rhythm__Section__r.Id).push(quTemp);
                } else {
                    this.questionMap.set(qu.Rhythm__Section__r.Id, [quTemp]);
                }
            }
            if(this.isTemplate || this.objectApiName === 'Rhythm__AccountAssessmentRelation__c'){
                quTemp.isEditable = true;
            }
        }else {
            quTemp.isEditable = false;
            if (qu.Rhythm__Required__c === true) {
                this.requiredQuestionList.push(qu.Id);
            }
            quTemp.conditional = qu.Rhythm__Conditional_Response__c === null ? '' : qu.Rhythm__Conditional_Response__c;
            quTemp.optionsValueSet = qu.Rhythm__OptionValueSet__c;
            let optionList = [];
            if (quTemp.optionsValueSet) {
                let optionValues = quTemp.optionsValueSet.split("\r\n");
                optionValues.forEach(opt => {
                    let optionMap = {};
                    optionMap.label = opt;
                    optionMap.value = opt;
                    optionList.push(optionMap);
                });
            }
            quTemp.optionsWrapper.options = optionList;
            quTemp.optionsWrapper.pickListOptions = optionList;
            quTemp.optionsWrapper.radioOptions = optionList;
            quTemp.optionsWrapper.multiPickListOptions = optionList;
            quTemp.value = undefined;
             if (typeof qu.Rhythm__Default_Value__c !== 'undefined' && qu.Rhythm__Default_Value__c !== null && (this.objectApiName!=='Rhythm__AccountAssessmentRelation__c'||typeof this.recordId!=='undefined')) {
                    if (qu.Rhythm__Question_Type__c === 'Picklist') {
                        quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Picklist (Multi-Select)') {
                        quTemp.optionsWrapper.selectedListOptions = JSON.parse('[' + JSON.stringify(qu.Rhythm__Default_Value__c) + ']');
                        quTemp.value = JSON.stringify(quTemp.optionsWrapper.selectedListOptions);
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Text Area (Rich)') {
                        quTemp.value = '<p>' + JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)) + '</p>';
                    }
                    else if (qu.Rhythm__Question_Type__c === 'Checkbox') {
                        quTemp.value = (Boolean)(JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c)));
                    }
                    else {
                        quTemp.value = JSON.parse(JSON.stringify(qu.Rhythm__Default_Value__c));
                    }
                }
            if(this.isTemplate || this.objectApiName === 'Rhythm__AccountAssessmentRelation__c'){
                quTemp.isEditable = true;
            }
            quTemp.Rhythm__Conversation_History__c = [];
            quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
            quTemp.showUploadProgress = false;
            quTemp.Children = [];
            if (this.questionMap.has(qu.Rhythm__Section__r.Id)) {
                this.questionMap.get(qu.Rhythm__Section__r.Id).push(quTemp);
            } else {
                this.questionMap.set(qu.Rhythm__Section__r.Id, [quTemp]);
            }           
        }
        return quTemp;

    }

    // constructMultilevelhierarchy method is used to construct nested questions wrapper, based on condition of having parentQuestionId
    constructMultilevelhierarchy(queryResults, savedResp) {
        const children = queryResults.filter(result => typeof result.Rhythm__Parent_Question__c !== 'undefined');
        const parent = queryResults.filter(result => typeof result.Rhythm__Parent_Question__c === 'undefined');
        console.log('topLevelChildren', children);
        children.forEach(child => {
            const hierarchyObj = this.constructWrapperConditionalQuestion(child, savedResp);
            this.createChildHierarchy(queryResults, hierarchyObj, savedResp);
            this.hierarchy.push(hierarchyObj);
        });
        parent.forEach(parentdata => {
            if (!(this.parentQuestionList.includes(parentdata.Id))) {
                console.log('parentdata', parentdata);
                const hierarchyObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                this.hierarchy.push(hierarchyObj);
            }
        });
    }

    // createChildHierarchy method is used to construct nested questions wrapper for child questions accordingly with its parent Question 
    createChildHierarchy(queryResults, childObj, savedResp) {
        console.log('createChildHierarchy queryResults', queryResults);
        const parent = queryResults.filter(result =>
            result.Id === childObj.parentQuestionId);
        if (parent.length > 0) {
            parent.forEach(parentdata => {
                const parentObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                console.log('parentObj', parentObj);
                this.createChildHierarchy(queryResults, parentObj, savedResp);
                console.log('childObj', childObj);
                this.childQuestionList.push(childObj.Id);
                this.parentQuestionList.push(parentdata.Id);
                if (parentObj.value === childObj.conditional) {
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    childObj.isdisplay = true;
                    parentObj.Children.push(childObj);
                }
                else {
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    childObj.isdisplay = false;
                    parentObj.Children.push(childObj);
                }
            });
            console.log('this.questionsvaluemap', this.questionsvaluemap);
        }
    }

    /* handlechatHistory is used to dispatch the event to the parent component (rtmvpcAssessmentDetail) */
    handleFlagResponseMethod(event) {
        this.showChat = event.detail;
        this.showChat.assesmentId = this.assessment;
        console.log('this.showChat', this.showChat);
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if(question.Id === this.showChat.questionId && typeof this.showChat.responseflag !== 'undefined'){
                    question.Rhythm__Flag__c = this.showChat.responseflag;
                }
            })
        })
        getResponseFlag({ questionId: this.showChat.questionId, accountAssessmentId: this.recordId }).then((result) => {
            console.log('getResponseFlag ', result);
        }).catch((error) => {
            let errormap = {}; 
            errormap.componentName = 'Questionnaire'; 
            errormap.methodName = 'getResponseFlag'; 
            errormap.className = 'AssessmentController';
            errormap.errorData = error.message; 
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        });
        console.log('chat', this.showChat);
        const selectedChat = new CustomEvent('selectconversation', {
            detail: this.showChat
        });
        this.dispatchEvent(selectedChat);
    }
    handlechatHistory(event) {
        this.showChat = event.detail;
        const selectedChat = new CustomEvent('selectconversation', {
            detail: this.showChat
        });
        this.dispatchEvent(selectedChat);
    }

    /* summaryClickHandler is used to navigate to the sections */
    summaryClickHandler() {
        const showsummary = new CustomEvent('showsummary', {});
        this.dispatchEvent(showsummary);
    }

    /* section_navigationChangeHandler is used to navigate to the sections */
    section_navigationChangeHandler() {
        this.constructQuestionsAndAnswers(this.questionsList);
    }

    /* selectquestionHandler is used to highlight the question when flag icon is clicked */
    selectquestionHandler(event) {
        let x = this.template.querySelectorAll('c-rtmvpc-render-question-template');
        for (let i = 0; i < x.length; i++) {
            x[i].removehighlightHandler(event.detail.id);
        }
    }
    /* handleConversationData is used to Store the conversation in  the wrapper for a particular Question*/
    @api handleConversationData(chatterData) {
        //This loop is to iterate over the sections in the wrapper.
        for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
            //This loop is to iterate over the Questions for a particular sections in the wrapper.
            for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                if (this.questionsAndAnswerss[i].questions[j].Id === chatterData.questionId) {
                    this.questionsAndAnswerss[i].questions[j].Rhythm__Conversation_History__c = chatterData.conversationHistory;
                    break;
                }
                //This loop is to iterate over the Child Questions for a particular sections and Questions in the wrapper.
                for (let k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                    if (this.questionsAndAnswerss[i].questions[j].Children[k].Id === chatterData.questionId) {
                        this.questionsAndAnswerss[i].questions[j].Children[k].Rhythm__Conversation_History__c = chatterData.conversationHistory;
                        break;
                    }
                }
            }
        }
        console.log('this.questionsAndAnswerss in dispatch');
    }
    /*This method is to update the AccountAssessmentStatus to In Review. And to display the flags in customer portal. */
    handleStartReview() {
        let param = {};
        let status = 'In Review';
        param.assessmentStatus = status;
        param.recId = this.recordId;
        /* The Apex methd is to update the AccountAssessmentStatus to In Review */
        updateAccountAssessmentStatus({ paramMap: JSON.stringify(param) }).then(result => {
            console.log(' handleStartReview result', result);
            this.showSaveAndSubmit = true;
            this.showInReview = false;
            const selectedEvent = new CustomEvent('updatetimeline', {
                detail: param
            });
            this.dispatchEvent(selectedEvent);
           setTimeout(() => { this.handleOnload() }, 350);

        }).catch(error => {
            let errormap = {}; 
            errormap.componentName = 'Questionnaire'; 
            errormap.methodName = 'updateAccountAssessmentStatus'; 
            errormap.className = 'AssessmentController';
            errormap.errorData = error.message; 
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        });
        this.showcustomerbuttons = true;
        this.showInReview = false;
        this.showSaveAndSubmit = true;
    }
    /* The Apex method is to update the AccountAssessmentStatus to 'Need More Information or Review Completed 
    based on the flags on customer portal */
    handleSubmitCustomer() {
        console.log('Hello', this.template.querySelectorAll('c-rtmvpc-render-question-template'));
        let param = {};
        let isNeedMoreInfo = false;
        this.showcustomerbuttons = false;
        this.showSaveAndSubmit = false;
        for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
            for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                if (this.questionsAndAnswerss[i].questions[j].customerFlag === true &&
                    this.questionsAndAnswerss[i].questions[j].Rhythm__Flag__c === true) {
                    param.assessmentStatus = 'Need More Information';
                    isNeedMoreInfo = true;
                    break;
                }
                else {
                    param.assessmentStatus = 'Review Completed';
                }
            }
            if (isNeedMoreInfo) {
                break;
            }
        }
        param.recId = this.recordId;
        /* The Apex methd is to update the AccountAssessmentStatus to Need more Information or Review Completed */
        updateAccountAssessmentStatus({ paramMap: JSON.stringify(param) }).then(result => {
            console.log('result', result);
            const selectedEvent = new CustomEvent('updatetimeline', {
                detail: param
            });
            this.dispatchEvent(selectedEvent);
            this.handleOnload();
        }).catch(error => {
            let errormap = {}; 
            errormap.componentName = 'Questionnaire'; 
            errormap.methodName = 'updateAccountAssessmentStatus'; 
            errormap.className = 'AssessmentController';
            errormap.errorData = error.message; 
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        });
        this.showToast = true;
        this.success = true;
        this.totastmessage = 'The Assessment Status is updated to  ' + param.assessmentStatus + ' successfuly.';
    }

}