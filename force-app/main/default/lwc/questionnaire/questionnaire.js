/*
* Component Name    : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections and save the responses
* Last Modified Date: 
* Secondary Contributors: 08/06/2023(Sri Kushal Reddy Nomula)
*/
import { LightningElement, api, track, wire } from 'lwc';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import createSupplierResponse from '@salesforce/apex/AssessmentController.createSupplierResponse';
import uploadFile from '@salesforce/apex/AssessmentController.uploadFile';
import updateAccountAssessmentStatus from '@salesforce/apex/AssessmentController.updateAccountAssessmentStatus';
//import createChatterItem from '@salesforce/apex/rtmvpcRelatedListsController.createChatterItem';
import deleteFileAttachment from '@salesforce/apex/AssessmentController.deleteFileAttachment';
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
    //@api section;
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

    //Used /* handleAccordionSection is used to handle opening and closing of a disclosure */
    handleAccordionSection() {
        if (this.accordionFlag == false) {
            this.accordionFlag = true;
            this.showAccordion = 'slds-accordion__section slds-is-open';
        }
        else {
            this.accordionFlag = false;
            this.showAccordion = 'slds-accordion__section slds-is-close';
        }
    }
    @api
    handleCollapseExpand(accordianId) {
        console.log(accordianId);
        if (accordianId == '[ - ]') {
            for (var i = 0; i < this.sectionidslist.length; i++) {

                this.template.querySelector('[data-accordian="' + this.sectionidslist[i] + '"]').classList = 'slds-accordion__section slds-is-close';
            }
            accordianId = '[ + ]';
        }
        else if (accordianId == '[ + ]') {
            for (var i = 0; i < this.sectionidslist.length; i++) {

                this.template.querySelector('[data-accordian="' + this.sectionidslist[i] + '"]').classList = 'slds-accordion__section slds-is-open';
            }
            accordianId = '[ - ]';
        }
            const selectedEvent = new CustomEvent('expandcollapse', {
                detail: accordianId
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);

    }
    closeAccordionSection(event) {
        console.log(this.buttonlabel);
        if (this.buttonlabel == '[ - ]') {
            for (var i = 0; i < this.sectionidslist.length; i++) {

                this.template.querySelector('[data-accordian="' + this.sectionidslist[i] + '"]').classList = 'slds-accordion__section slds-is-close';
            }
            this.buttonlabel = '[ + ]';
        }
        else if (this.buttonlabel == '[ + ]') {
            for (var i = 0; i < this.sectionidslist.length; i++) {

                this.template.querySelector('[data-accordian="' + this.sectionidslist[i] + '"]').classList = 'slds-accordion__section slds-is-open';
            }
            this.buttonlabel = '[ - ]';
        }

    }

    //Used /* handleAccordionSection is used to handle opening and closing of a section */
    handleAccordionQuestion(event) {
         var accordianClassList = this.template.querySelector('[data-accordian="' + event.currentTarget.dataset.id + '"]').classList;
        if(accordianClassList.contains('slds-accordion__section') && accordianClassList.contains('slds-is-open')){
            accordianClassList.remove('slds-accordion__section');
            accordianClassList.remove('slds-is-open')
        }else{
            accordianClassList.add('slds-accordion__section')
            accordianClassList.add('slds-is-open');
        }
    }
    

    //Used /* Connectedcallback is used to get data on onload */
    connectedCallback() {
        console.log('this.accid',this.accid);
        this.accountsId = this.accid;
        //this.showspinner = true;
        if (this.assessment == null || this.assessment == '') {
            this.assessment = this.recordId;
        }
        console.log('recordId', this.recordId);
        console.log('Object Name', this.objectApiName);
        if (typeof this.recordId != 'undefined') {
            this.isTemplate = true;
            
            console.log('this.isTemplate', this.isTemplate);
            console.log('this.recordId', this.recordId);
        }
        else {
            this.isTemplate = false;
            console.log('this.isTemplate', this.isTemplate);
            console.log('this.recordId in Questionnaire', this.recordId);
        }
        this.handleOnload();
        
    }
    handleOnload()
    {
        //this.questionMap={};
        this.questionsList=[];
        this.sectionidslist=[];
        if (this.isTemplate) {
            this.isSupplier = false;
            if (this.objectApiName == 'Rhythm__AccountAssessmentRelation__c') {
               this.isAccountAssessment = true;
               console.log('this.objectApiName',this.objectApiName);
               console.log('this.recordId',this.recordId);
                getAccountAssessmentRecordData({ assrecordId: this.recordId }).then(result => {
                    console.log('result',result);
                    if (typeof result[0].Rhythm__Assessment__r != 'undefined' && typeof result[0].Rhythm__Assessment__r.Rhythm__Template__c);
                    {
                        var assessmentJunctionId = result[0].Rhythm__Assessment__r.Id;
                        this.assessment = result[0].Rhythm__Assessment__r.Id;
                        var assessmentTemplateId = result[0].Rhythm__Assessment__r.Rhythm__Template__c;
                        getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                            var resultMap = result;
                            for (var i = 0; i < resultMap.length; i++) {
                                if (!this.sectionidslist.includes(resultMap[i].Rhythm__Section__r.Id)) {
                                    this.sectionidslist.push(resultMap[i].Rhythm__Section__r.Id);
                                }
                            }
                            console.log('getQuestionsList', resultMap);
                            console.log('result[0].Rhythm__Assessment__r.Id', assessmentJunctionId);
                            /* This method is used to get all the responses of the questions in particular section*/
                            getSupplierResponseList({ assessmentId: assessmentJunctionId }).then(result => {
                                if (result && result.length > 0 && result[0] && result[0].CreatedBy && result[0].CreatedDate) {
                                    this.supplierAssessmentName = result[0].CreatedBy.Name;
                                    this.supplierAssCreatedDate = result[0].CreatedDate;
                                    var x = this.supplierAssCreatedDate.split('T')[0];
                                    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                                    console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);
                                    // }
                                }
                                console.log('getSupplierResponseList result', result);
                                if(!this.assessmentStatus=='New' || !this.assessmentStatus=='In progress'){
                                result.forEach(qres => {
                                    if(typeof qres.Rhythm__Question__r !='undefined')
                                    {
                                         this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "questionType": qres.Rhythm__Question__r.Rhythm__Question_Type__c, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                                    }
                                   
                                });
                                }
                                console.log('this.savedResponseMap', this.savedResponseMap);
                                console.log('resultMap', resultMap);
                                //
                                this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                                var count = 0;
                                var sectionsList = [];
                                console.log('questionMap', this.questionMap);
                                for (const seckey of this.questionMap.keys()) {
                                    console.log('seckey', seckey);
                                    console.log('seckey', this.questionMap.get(seckey));
                                    count++;
                                    sectionsList.push({ label: seckey, value: this.sectionidslist[count - 1] });
                                    this.questionsList.push({ "sectionId": this.sectionidslist[count - 1], "section": seckey, "numberOfQuestions": '', "numberOfResponses": '', "displayFlag": '', "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
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
                                for (var i = 0; i < this.questionsList.length; i++) {
                                    var sequence = 0;
                                    for (var j = 0; j < this.questionsList[i].questions.length; j++) {
                                        sequence++;
                                        this.questionsList[i].questions[j]['snumber'] = sequence;
                                        var childsequence = 0;
                                        for (var k = 0; k < this.questionsList[i].questions[j].Children.length; k++) {
                                            childsequence++;
                                            var sequencenum = sequence + '.' + childsequence;
                                            this.questionsList[i].questions[j].Children[k]['snumber'] = sequencenum;
                                        }
                                    }
                                    this.questionsList[i]['responsesPercentage'] = Math.floor((Number(this.questionsList[i].numberOfResponses) / Number(this.questionsList[i].numberOfQuestions)) * 100);
                                }
                                console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
                                console.log('this.questionsvaluemap', this.questionsvaluemap);
                            }).catch(error => {
                                console.log('Error' + error);
                            })
                        }).catch(error => {
                            console.log('Error' + error);
                        });
                        console.log('result getAccountAssessmentRecordData', result);
                    }

                }).catch(error => {
                    console.log('Error', error);
                });
            }
            else {
                this.savedResponseMap = {};
                getQuestionsList({ templateId: this.recordId }).then(result => {
                    var resultMap = result;
                    for (var i = 0; i < resultMap.length; i++) {
                        if (!this.sectionidslist.includes(resultMap[i].Rhythm__Section__r.Id)) {
                            this.sectionidslist.push(resultMap[i].Rhythm__Section__r.Id);
                        }
                    }
                    console.log('resultMap', resultMap);
                    //
                    this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                    var count = 0;
                    var sectionsList = [];

                    console.log('questionMap', this.questionMap);
                    for (const seckey of this.questionMap.keys()) {
                        console.log('seckey', seckey);
                        console.log('seckey', this.questionMap.get(seckey));
                        count++;
                        sectionsList.push({ label: seckey, value: this.sectionidslist[count - 1] });
                        this.questionsList.push({ "sectionId": this.sectionidslist[count - 1], "section": seckey, "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                    }
                    console.log('this.questionsList>>>244', this.questionsList);
                    // this.showButtons.Summary = false;
                    // this.showButtons.Section_Navigation.show = false;
                    // this.showButtons.Save_Submit = false;
                    // if (supplierAssessment.Rhythm__Status__c === 'Submitted') {
                    //     this.showButtons.Summary = true;
                    // }
                    // else {
                    //     this.showButtons.Save_Submit = true;
                    // }
                    // if (this.questionsList.length > this.sectionLimits) {
                    //     this.showButtons.Summary = true;
                    //     this.showButtons.Section_Navigation.show = true;
                    //     this.showButtons.Section_Navigation.options = sectionsList;
                    //     //this.showButtons.Section_Navigation.value = this.section;
                    // }
                    this.constructQuestionsAndAnswers(this.questionsList);
                    console.log('this.questionsList>>>', this.questionsList);
                    for (var i = 0; i < this.questionsList.length; i++) {
                        var sequence = 0;
                        for (var j = 0; j < this.questionsList[i].questions.length; j++) {
                            sequence++;
                            this.questionsList[i].questions[j]['snumber'] = sequence;
                            var childsequence = 0;
                            for (var k = 0; k < this.questionsList[i].questions[j].Children.length; k++) {
                                childsequence++;
                                var sequencenum = sequence + '.' + childsequence;
                                this.questionsList[i].questions[j].Children[k]['snumber'] = sequencenum;
                            }
                        }
                        //this.questionsList[i]['responsesPercentage'] = Math.floor((Number(this.questionsList[i].numberOfResponses) / Number(this.questionsList[i].numberOfQuestions)) * 100);
                    }
                    console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
                    console.log('this.questionsvaluemap', this.questionsvaluemap);
                }).catch(error => {

                });
            }
        }
        else {
            this.isSupplier = true;
            
                /*This method is used to get all the assessments records*/
                console.log('this.assessment', this.assessment);
                getSupplierAssessmentList({ assessmentId: this.assessment }).then(result => {
                    console.log('getSupplierAssessmentList 293', result);
                    var supplierAssessment = result[0];
                    var assessmentTemplateId = result[0].Rhythm__Template__c;
                    this.showDisclosure = result[0].Rhythm__Disclosure__c;
                    this.AssessmentName = result[0].Name;
                    this.assessmentStatus = result[0].Rhythm__Status__c;
                    this.sectionidslist = [];
                    /*This method is used to get all the questions with particular section*/
                    getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                        var resultMap = result;
                        console.log('resultMap 303',resultMap)
                        for (var i = 0; i < resultMap.length; i++) {
                            if (!this.sectionidslist.includes(resultMap[i].Rhythm__Section__r.Id)) {
                                this.sectionidslist.push(resultMap[i].Rhythm__Section__r.Id);
                            }
                        }
                        console.log('getQuestionsList', resultMap);
                        /* This method is used to get all the responses of the questions in particular section*/
                        getSupplierResponseList({ assessmentId: this.assessment }).then(result => {
                            if (result && result.length > 0 && result[0] && result[0].CreatedBy && result[0].CreatedDate) {
                                this.supplierAssessmentName = result[0].CreatedBy.Name;
                                this.supplierAssCreatedDate = result[0].CreatedDate;
                                var x = this.supplierAssCreatedDate.split('T')[0];
                                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                                console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);
                                // }
                            }
                            console.log('getSupplierResponseList result', result);
                            result.forEach(qres => {
                                 if(typeof qres.Rhythm__Question__r !='undefined')
                                 {
                                this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "questionType": qres.Rhythm__Question__r.Rhythm__Question_Type__c, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                                 }
                            });

                            console.log('this.savedResponseMap', this.savedResponseMap);
                            console.log('resultMap', resultMap);
                            //
                            this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                            var count = 0;
                            var sectionsList = [];
                            console.log('questionMap', this.questionMap);
                            for (const seckey of this.questionMap.keys()) {
                                console.log('seckey', seckey);
                                console.log('seckey', this.questionMap.get(seckey));
                                count++;
                                sectionsList.push({ label: seckey, value: this.sectionidslist[count - 1] });
                                this.questionsList.push({ "sectionId": this.sectionidslist[count - 1], "section": seckey, "numberOfQuestions": '', "numberOfResponses": '', "displayFlag": '', "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                            }
                            console.log('this.questionsList>>>', this.questionsList);
                            this.showButtons.Summary = false;
                            this.showButtons.Section_Navigation.show = false;
                            
                            if (this.accountAssessmentStatus === 'Submitted' || this.accountAssessmentStatus=='Review Completed' || 
                            this.accountAssessmentStatus=='In review') {
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
                            for (var i = 0; i < this.questionsList.length; i++) {
                                var sequence = 0;
                                for (var j = 0; j < this.questionsList[i].questions.length; j++) {
                                    sequence++;
                                    this.questionsList[i].questions[j]['snumber'] = sequence;
                                    var childsequence = 0;
                                    for (var k = 0; k < this.questionsList[i].questions[j].Children.length; k++) {
                                        childsequence++;
                                        var sequencenum = sequence + '.' + childsequence;
                                        this.questionsList[i].questions[j].Children[k]['snumber'] = sequencenum;
                                    }
                                }
                                this.questionsList[i]['responsesPercentage'] = Math.floor((Number(this.questionsList[i].numberOfResponses) / Number(this.questionsList[i].numberOfQuestions)) * 100);
                            }
                            console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
                            console.log('this.questionsvaluemap', this.questionsvaluemap);
                        }).catch(error => {
                            console.log('Error' + error);
                        })
                    }).catch(error => {
                        console.log('Error' + error);
                    })
                }).catch(error => {
                    console.log('Error' + error);
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
        var duplicatequestionList = questionsList;
        this.questionsAndAnswerss = [];
       
        for (var i = 0; i < questionsList.length; i++) {
            
            if ((questionsList.length > this.sectionLimits) || questionsList.length <= this.sectionLimits) {
                for (var j = 0; j < questionsList[i].questions.length; j++) {
                    //questionsList[i].numberOfQuestions = questionsList[i].numberOfQuestions + questionsList[i].questions[j].Children.length;
                    if ((this.childQuestionList.includes(questionsList[i].questions[j].Id))) {
                        const deletedQues = questionsList[i].questions.splice(j, 1);
                        console.log('deletedQues', deletedQues);
                    }
                }
                questionsList[i].numberOfQuestions = questionsList[i].questions.length;
                this.questionsAndAnswerss.push(questionsList[i]);
            }
        }
        console.log('this.questionsAndAnswerss 407', this.questionsAndAnswerss);
        if (this.questionsAndAnswerss.length > 0) {
            if (!this.isTemplate || this.objectApiName == 'Rhythm__AccountAssessmentRelation__c') {
                
                if (typeof this.questionsAndAnswerss[0].questions[0] != 'undefined' && typeof this.questionsAndAnswerss[0].questions[0].Id != 'undefined' && typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id) != 'undefined') {
                    if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c != 'undefined' && this.isTemplate == false) {
                        this.Rhythm__Conversation_History__c = { 'Id': this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Id, 'AssessmentId': this.assessment, 'QuestionnaireId': this.questionsAndAnswerss[0].questions[0].Id, 'chatHistory': (this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c ? JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c) : '') };
                    }
                }
                for (var i = 0; i < duplicatequestionList.length; i++) {
                    var numberOfResponses = 0;
                    var displayFlag = 0;
                    //
                    for (var j = 0; j < questionsList[i].questions.length; j++) {
                        if (typeof questionsList[i].questions[j].value != 'undefined') {
                            numberOfResponses++;
                        }
                        if (typeof questionsList[i].questions[j].Children != 'undefined') {
                            //
                            // for (var k = 0; k < questionsList[i].questions[j].Children.length; k++) {
                            //     if (typeof questionsList[i].questions[j].Children.value != 'undefined') {
                            //         numberOfResponses++;
                            //     }
                            // }
                        }
                        if (duplicatequestionList[i].questions[j].Rhythm__Flag__c == true) {
                            displayFlag++;
                        }
                    }
                    questionsList[i].displayFlag = displayFlag;
                    questionsList[i].numberOfResponses = numberOfResponses;
                }
            }

        }
    }

    //Used /* onResponseChange method is used to change the wrapper and display the changed responsed for questions values on UI */
    onResponseChange(event) {

        console.log(' event.detail', event.detail);
        this.questionresponseafterchange = event.detail;

        console.log(' this.questionresponseafterchange', this.questionresponseafterchange);
        if (this.questionresponseafterchange != undefined) {
            //
            for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                //
                for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                    if (this.questionresponseafterchange.parent == null && this.questionresponseafterchange.questionId == this.questionsAndAnswerss[i].questions[j].Id) {
                        if (Array.isArray(this.questionresponseafterchange.option)) {
                            this.questionsAndAnswerss[i].questions[j].value = JSON.stringify(this.questionresponseafterchange.option);
                        }
                        else {
                            this.questionsAndAnswerss[i].questions[j].value = this.questionresponseafterchange.option;
                        }


                        if (this.questionsAndAnswerss[i].questions[j].Children.length > 0) {
                            for (var k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                                if (this.questionsAndAnswerss[i].questions[j].Children[k].conditional == this.questionsAndAnswerss[i].questions[j].value) {
                                    this.questionsAndAnswerss[i].questions[j].Children[k].isdisplay = true;
                                }
                                else {
                                    this.questionsAndAnswerss[i].questions[j].Children[k].isdisplay = false;
                                }
                            }
                        }
                    }
                    else {
                        if (this.questionresponseafterchange.parentObj == this.questionsAndAnswerss[i].questions[j].Id) {
                            for (var k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                                if (Array.isArray(this.questionresponseafterchange.option)) {
                                    this.questionsAndAnswerss[i].questions[j].value = JSON.stringify(this.questionresponseafterchange.option);
                                }
                                else {
                                    this.questionsAndAnswerss[i].questions[j].value = this.questionresponseafterchange.option;
                                }

                            }
                        }
                    }
                }
            }
            this.responseMap.set(this.questionresponseafterchange.questionId, this.questionresponseafterchange.option);
            console.log('onResponseChange this.responseMap', this.responseMap);
        }

        console.log('this.questionsAndAnswerss after change', this.questionsAndAnswerss);
    }

    //Used /*handleFileUpload method is used to store the uploaded attachments into response records */
    handleFileUpload(event) {

        console.log('inQuestionnaire for file upload', event.detail);
        this.fileResponseData = event.detail;

        var responseId = '';
        if (this.savedResponseMap != null) {
            if (this.savedResponseMap.hasOwnProperty(this.fileResponseData.questionId)) {
                responseId = this.savedResponseMap.get(this.fileResponseData.questionId).Id;
            }

        }
        console.log('responseId' + responseId);
        var filemap={};
        filemap.responseId = responseId;
        filemap.fileBlob = this.fileResponseData.filedata;
        filemap.name = this.fileResponseData.name;
        filemap.quesId = this.fileResponseData.questionId;
        console.log('this.fileResponseData.questionId',this.fileResponseData.questionId);
        filemap.assessmentId = this.assessment;
        /*Apex method is used to store the uploaded attachments into response records */
        uploadFile({ fileResp: JSON.stringify(filemap)}).then(result => {
            console.log('handleFileUpload',result);
            this.template.querySelectorAll('c-rtmvpc-render-question-template')[0].getShowUploadStatus();
            console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
            for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                if (this.questionsAndAnswerss[i].sectionId == this.fileResponseData.sectionId) {
                    for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                        if (this.questionsAndAnswerss[i].questions[j].Id == this.fileResponseData.questionId) {
                            if (typeof this.questionsAndAnswerss[i].questions[j].Files__c == 'undefined') {
                                var fileresponsedatalst = [];
                                fileresponsedatalst.push(this.fileResponseData);
                                this.questionsAndAnswerss[i].questions[j].Files__c = fileresponsedatalst;
                            }
                            else {
                                this.questionsAndAnswerss[i].questions[j].Files__c.push(this.fileResponseData);
                            }
                        }
                    }
                }
            }
            var quesResponse = { "Id": result[0].Id, "questionType": this.fileResponseData['type'], "value": '', "Files__c": result[0].Rhythm__Files__c, "Flag__c": this.fileResponseData['flag'], "Conversation_History__c": this.fileResponseData['conversationHistory'] };
             this.savedResponseMap.set(this.fileResponseData.questionId, quesResponse);
             this.responseMap.set(this.fileResponseData.questionId, quesResponse);
            console.log('this.questionsAndAnswerss>>>', this.questionsAndAnswerss);
        });
    }

    //Used /* handledeletefile method is used to store the uploaded attachments into response records  */
    handledeletefile(event) {
        console.log('In Questionnaire handledeletefile', event.detail);
        var deletefileData = event.detail;
        console.log('In Questionnaire handledeletefile', deletefileData);
        deleteFileAttachment({ questionId: deletefileData.questionId, name: deletefileData.name }).then(result => {
            console.log('result', result);
            
            for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                if (this.questionsAndAnswerss[i].sectionId == deletefileData.sectionId) {
                    //
                    for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                        if (this.questionsAndAnswerss[i].questions[j].Id == deletefileData.questionId &&
                            typeof this.questionsAndAnswerss[i].questions[j].Files__c != 'undefined') {
                            //    
                            for (var k = 0; k < this.questionsAndAnswerss[i].questions[j].Files__c.length; k++) {
                                if (this.questionsAndAnswerss[i].questions[j].Files__c[k].name == deletefileData.name) {
                                    var temp = this.questionsAndAnswerss[i].questions[j].Files__c.splice(k, 1); //Review for Optimization
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });
    }
    @api
    handleFilterFlag(flagFilter) {
        console.log('From parent');
        //this.questionsandAnswersflag =this.questionsAndAnswerss);
        let flagquestionsandanswers;
        if (flagFilter) {
            for (let i = 0; i < this.questionsAndAnswerss.length; i++) {

                this.questionsAndAnswerss[i].questions = this.questionsAndAnswerss[i].questions.filter(item => item.Rhythm__Flag__c);
                for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                    this.questionsAndAnswerss[i].questions[j].Children = this.questionsAndAnswerss[i].questions[j].Children.filter(item => item.Rhythm__Flag__c);
                }
                console.log('this.questionsAndAnswerss handlefilter flag', this.questionsAndAnswerss);
            }
        }
        else {
            this.questionsList = [];
            this.questionMap = new Map();
            this.questionsAndAnswerss = [];
            this.connectedCallback();
        }
    }

    //Used /* getQuestionTemplate is used to create the basic question template for wrapper construction */
    getQuestionTemplate() {
        var question = {
            "question": "", "helptext": "", "isText": false, "isRadio": false, "isPicklist": false,
            "isMultiPicklist": false, "isDate": false,"isDateTime": false, "isCheckbox": false, "isNumber": false, "isCurrency": false, "isPhone": false, "isPercent": false,
            "isEmail": false, "isTextArea": false, "Id": "",
            "type": "Radio", "conditional": "", "optionsValueSet": "Testrrrr1, Testrrrr11", "ConditionalQuestion": "test4,test5",
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

    //Used /*handleSave method is used to save the responses for particular question */
    handleSave() {
        this.constructResponse(false);
    }

    //Used /* handleSubmit method is used to save the responses for particular question and update the assessment status to submit */
    handleSubmit() {
        this.constructResponse(true);
    }

    //Used /* constructResponse is used to call an apex class to store the response */
    constructResponse(isSubmit) {
        this.showspinner = true;
        var isAssessmentValidated = false;
        var responseList = [];
        console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
        console.log('this.responseMap', this.responseMap);
        var questionsId = [];
        var flagmap = {};
        var filesmap = {}
        var conversationhistory = {};
        for (const questionkey of this.responseMap.keys()) {
            questionsId.push(questionkey);
        }

        for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
            for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                if (questionsId.includes(this.questionsAndAnswerss[i].questions[j].Id)) {
                    if (typeof this.questionsAndAnswerss[i].questions[j].Rhythm__Flag__c != 'undefined') {
                        flagmap[this.questionsAndAnswerss[i].questions[j].Id] = this.questionsAndAnswerss[i].questions[j].Rhythm__Flag__c;
                        conversationhistory[this.questionsAndAnswerss[i].questions[j].Id] = this.questionsAndAnswerss[i].questions[j].Rhythm__Conversation_History__c;
                    }
                    if (typeof this.questionsAndAnswerss[i].questions[j].Files__c != 'undefined') {
                        filesmap[this.questionsAndAnswerss[i].questions[j].Id] = this.questionsAndAnswerss[i].questions[j].Files__c;
                    }
                
                if (this.questionsAndAnswerss[i].questions[j].isEmail == true && !(this.questionsAndAnswerss[i].questions[j].value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))) {
                    isAssessmentValidated = true;
                    this.showspinner = false;
                    this.showToast = true;
                    this.success = false;
                    this.totastmessage = 'Please enter the valid email:';
                }

                if (this.questionsAndAnswerss[i].questions[j].isPhone == true && !(this.questionsAndAnswerss[i].questions[j].value.match('[0-9]{3}-[0-9]{3}-[0-9]{4}'))) {
                    isAssessmentValidated = true;
                    this.showspinner = false;
                    this.showToast = true;
                    this.success = false;
                    this.totastmessage = 'Please enter the valid phone number in the format xxx-xxx-xxxx:';
                }
                for (var k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                    if (questionsId.includes(this.questionsAndAnswerss[i].questions[j].Children[k].Id)) {
                        if (typeof this.questionsAndAnswerss[i].questions[j].Children[k].Rhythm__Flag__c != 'undefined') {
                            flagmap[this.questionsAndAnswerss[i].questions[j].Children[k].Id] = this.questionsAndAnswerss[i].questions[j].Children[k].Rhythm__Flag__c;
                            conversationhistory[this.questionsAndAnswerss[i].questions[j].Children[k].Id] = this.questionsAndAnswerss[i].questions[j].Rhythm__Conversation_History__c;
                        }
                        if (typeof this.questionsAndAnswerss[i].questions[j].Children[k].Files__c != 'undefined') {
                            filesmap[this.questionsAndAnswerss[i].questions[j].Children[k].Id] = this.questionsAndAnswerss[i].questions[j].Children[k].Files__c;
                        }
                    }
                }
            }
            }
        }

        console.log('hello');
        console.log('conversationhistory>>', conversationhistory);
        console.log('this.responseMap',this.responseMap);
        for (const seckey of this.responseMap.keys()) {
            var reponse = { 'sobjectType': 'Rhythm__Response__c' };
            reponse.Rhythm__Assessment__c = this.assessment;
            reponse.Rhythm__Question__c = seckey;
            reponse.Rhythm__Account__c = this.vendor;
            if (Array.isArray(this.responseMap.get(seckey))) {
                reponse.Rhythm__Response__c = JSON.stringify(this.responseMap.get(seckey));
            }
            else {
                reponse.Rhythm__Response__c = (this.responseMap.get(seckey));
            }
            if (typeof flagmap[seckey] != 'undefined') {
                console.log('into this');
                reponse.Rhythm__Flag__c = flagmap[seckey];
            }
            if (typeof filesmap[seckey] != 'undefined') {
                console.log('into filesmap');
               //reponse.Rhythm__Files__c = filesmap[seckey];
            }
            if (typeof conversationhistory[seckey] != 'undefined' && conversationhistory[seckey].length > 0) {
                console.log('into conversation');
                reponse.Rhythm__Conversation_History__c = conversationhistory[seckey];
            }
            reponse.Rhythm__Is_Latest_Response__c = true;
            console.log('reponse in constructResponse', reponse);
            if (this.requiredQuestionList.includes(reponse.Rhythm__Question__c)) {
                if (typeof reponse.Rhythm__Response__c == 'undefined' ||
                    (typeof reponse.Rhythm__Response__c != 'undefined' && reponse.Rhythm__Response__c == '') ||
                    (typeof reponse.Rhythm__Response__c != 'undefined' && reponse.Rhythm__Response__c == '[]')) {
                    isAssessmentValidated = true;
                    break;
                }
                else {
                    for (var i = 0; i < this.requiredQuestionList.length; i++) {
                        if (this.requiredQuestionList[i] == reponse.Rhythm__Question__c) {
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
        if (isAssessmentValidated == false) {
            this.showToast = true;
            this.success = true;

            console.log('responseList', responseList);
            var responseQueryMap={};
            responseQueryMap.accountId = this.accid;
            responseQueryMap.assesmentId = this.assessment;
            if(isSubmit)
            {
                responseQueryMap.status = 'Submitted';
            }
            else
            {
                responseQueryMap.status = 'In progress';
            }
            if(isSubmit)
            {
                responseQueryMap.submit = true;
            }
            else
            {
                responseQueryMap.submit = false;
            }
            console.log('this.accid',this.accid);
            /* This method is used to create the response for the questions*/
            createSupplierResponse({ suppResponseList: responseList, paramMap: JSON.stringify(responseQueryMap) }).then(result => {

                console.log('sucessfully created Response result==>', result);
                this.totastmessage = 'Responses saved successfully';
                if (isSubmit) {
                    for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                        //
                        for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                            for (var k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                                if (this.questionsAndAnswerss[i].questions[j].Children[k].Flag__c != true) {
                                    this.questionsAndAnswerss[i].questions[j].Children[k].isEditable = true;
                                }
                            }
                            if (this.questionsAndAnswerss[i].questions[j].Flag__c != true) {
                                this.questionsAndAnswerss[i].questions[j].isEditable = true;
                            }

                        }
                    }
                }
                if(isSubmit)
                {
                    this.showButtons.Save_Submit= false;
                }

                this.showspinner = false;
            }).catch(error => {
                console.log('Error' + error);
                this.totastmessage = 'Error : ' + JSON.stringify(error);
            });
        //     const selectedEvent = new CustomEvent('timelinehandle', {
        //     detail: 'true'});
        // // Dispatches the event.
        // this.dispatchEvent(selectedEvent);
        }
        // else {
        //     this.showspinner = false;
        //     this.showToast = true;
        //     this.success = false;
        //     this.totastmessage = 'Please fill the required question:';

        // }
    }

    //Used /* Used to close the toast message populated on saving */
    closeToastHandler(event) {
        console.log('In Disptch event');
        this.showToast = event.detail.showModal;
    }

    //Used /*constructWrapperConditionalQuestion method is used to construct the wrapper for Questions and responses  */
    constructWrapperConditionalQuestion(qu, savedResp) {
        console.log('constructWrapperConditionalQuestion qu', qu);
        console.log('savedResp', savedResp);
        var quTemp = this.getQuestionTemplate();
        quTemp.Id = qu.Id;
        if (qu['Rhythm__HelpText__c'] != 'undefined') {
            console.log('qu[Rhythm__HelpText__c]', qu['Rhythm__HelpText__c']);
            quTemp.helptext = qu.Rhythm__HelpText__c;
        }
        quTemp.question = qu.Rhythm__Question__c;
        var qtype = qu.Rhythm__Question_Type__c;
        console.log('sampleData', qtype);
        //quTemp.sectionId = this.section;
        quTemp.isText = ('Text' == qtype);
        quTemp.isPercent = ('Percent' == qtype);
        quTemp.isRadio = ('Radio' == qtype);
        quTemp.isPicklist = ('Picklist' == qtype);
        quTemp.isMultiPicklist = ('Picklist (Multi-Select)' == qtype);
        quTemp.isDate = ('Date' == qtype);
        quTemp.isDateTime = ('Date/Time' == qtype);
        quTemp.isCheckbox = ('Checkbox' == qtype);
        quTemp.isNumber = ('Number' == qtype);
        quTemp.isPhone = ('Phone' == qtype);
        quTemp.isCurrency = ('Currency' == qtype);
        quTemp.isEmail = ('Email' == qtype);
        quTemp.isTextArea = ('Text Area (Rich)' == qtype);
        quTemp.type = qtype;

        quTemp.required = qu.Rhythm__Required__c;
        quTemp.inputId = qu.Id + '_inputId';
        quTemp.labelId = qu.Id + '_labelId';
        quTemp.spanId = qu.Id + '_spanId';
        quTemp.customerFlag = false;
        quTemp.Rhythm__Flag__c = false;
        quTemp.parentQuestionId = qu.Rhythm__Parent_Question__c;
        if (this.objectApiName == 'Rhythm__AccountAssessmentRelation__c' || !this.isTemplate) {
            
            if (typeof savedResp.get(qu.Id) != 'undefined' ) {
                quTemp.Rhythm__Flag__c = savedResp.get(qu.Id).Flag__c;

            }
            console.log('nnn',this.accountAssessmentStatus);
            if(this.objectApiName=='Rhythm__AccountAssessmentRelation__c')
            {
                 console.log('nnn',this.accountAssessmentStatus);
                // quTemp.customerFlag = true;
                // if(this.accountAssessmentStatus=='Submitted')
                // {
                //     quTemp.customerFlag = true;
                //     this.showcustomerbuttons = true;
                    
                // }
                // else
                // {
                //     quTemp.customerFlag = false;
                // }
                if(this.accountAssessmentStatus=='Submitted' || this.accountAssessmentStatus=='In review' || this.accountAssessmentStatus=='Need more information')
                {
                    
                    this.showcustomerbuttons = true;
                    if(this.accountAssessmentStatus=='Submitted')
                    {
                        this.showInReview = true;
                    }
                    if(this.accountAssessmentStatus=='Need more information' || this.accountAssessmentStatus=='In review')
                    {
                        this.showInReview = false;
                        this.showSaveAndSubmit = true;
                        quTemp.customerFlag = true;
                    }
                    
                }
                else
                {
                    quTemp.customerFlag = false;
                }

            }   
            if (this.accountAssessmentStatus == 'Submitted' || this.accountAssessmentStatus == 'In review' || this.accountAssessmentStatus == 'Need more information') {
                if (quTemp.Rhythm__Flag__c) {
                    quTemp.isEditable = false;
                }
                else {
                    quTemp.isEditable = true;
                }
            }
            else {
                quTemp.isEditable = false;
            }
            if (this.objectApiName == 'Rhythm__AccountAssessmentRelation__c') {
                
                quTemp.isEditable = true;
            }

            if (qu.Rhythm__Required__c == true) {
                this.requiredQuestionList.push(qu.Id);
            }
            quTemp.conditional = qu.Rhythm__Conditional_Response__c == null ? '' : qu.Rhythm__Conditional_Response__c;
            quTemp.optionsValueSet = qu.Rhythm__OptionValueSet__c;
            if (quTemp.optionsValueSet) {
                var optionValues = quTemp.optionsValueSet.split("\r\n");
                var optionList = [];
                optionValues.forEach(opt => {
                    var optionMap = {};
                    optionMap['label'] = opt;
                    optionMap['value'] = opt;
                    optionList.push(optionMap);
                });
            }
            quTemp.optionsWrapper.options = optionList;
            quTemp.optionsWrapper.pickListOptions = optionList;
            quTemp.optionsWrapper.radioOptions = optionList;
            quTemp.optionsWrapper.multiPickListOptions = optionList;
            console.log('qu.Rhythm__Question__c', qu.Id);
            console.log(savedResp.get(qu.Id));
            if (typeof savedResp.get(qu.Id) != 'undefined' && typeof savedResp.get(qu.Id).value != 'undefined') {
                console.log(savedResp.get(qu.Id));
                quTemp.value = savedResp.get(qu.Id).value;
                console.log('manual', savedResp);
                if (savedResp.get(qu.Id).questionType == "Checkbox") {
                    if (savedResp.get(qu.Id).value == "true")
                        quTemp.value = true;
                    else
                        quTemp.value = false;
                }
                if (savedResp.get(qu.Id).questionType == "Picklist (Multi-Select)") {
                    if (savedResp.get(qu.Id).value.includes('['))
                        quTemp.optionsWrapper.selectedListOptions = JSON.parse(savedResp.get(qu.Id).value);
                    else
                        quTemp.optionsWrapper.selectedListOptions = false;
                }
                console.log('manual', quTemp);
            }
            else
                quTemp.value = undefined;
            //console.log('savedResp.get(qu.Id).Rhythm__Conversation_History__c',savedResp.get(qu.Id).Conversation_History__c);   
            if (typeof savedResp.get(qu.Id) != 'undefined' && typeof savedResp.get(qu.Id).Conversation_History__c != 'undefined') {
                quTemp.Rhythm__Conversation_History__c = savedResp.get(qu.Id).Conversation_History__c;
            }
            else {
                quTemp.Rhythm__Conversation_History__c = [];
            }
            quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
            if (typeof savedResp.get(qu.Id) != 'undefined' && typeof savedResp.get(qu.Id).Files__c != 'undefined') {
                var responsedData = JSON.parse(savedResp.get(qu.Id).Files__c);
                console.log('(savedResp.get(qu.Id).Files__c)', (savedResp.get(qu.Id).Files__c));
                for (var i = 0; i < responsedData.length; i++) {
                    console.log(' responsedData[i]', responsedData[i]);
                    console.log(' (savedResp.get(qu.Id).Files__c).type[i]', (savedResp.get(qu.Id).Files__c)[0].type);
                    responsedData[i]['isPng'] = (responsedData[i]).type == 'png';
                    responsedData[i]['isPdf'] = (responsedData[i]).type == 'pdf';
                    responsedData[i]['isCsv'] = (responsedData[i]).type == 'csv';
                    responsedData[i]['isDocx'] = (responsedData[i]).type == 'docx';
                    responsedData[i]['isDocx'] = (responsedData[i]).type == 'doc';
                }

                console.log('responsedData', responsedData);
                quTemp.Files__c = responsedData;
            }
            quTemp.showUploadProgress = false;
            if (typeof savedResp.get(qu.Id) != 'undefined' && typeof savedResp.get(qu.Id).value != 'undefined')
                this.responseMap.set(qu.Id, savedResp.get(qu.Id).value);
            quTemp.Children = [];
            if (this.questionMap.has(qu.Rhythm__Section__r.Name)) {
                this.questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                var quesList = [];
                quesList.push(quTemp);
                this.questionMap.set(qu.Rhythm__Section__r.Name, quesList);
            }
            console.log('this.questionMap', this.questionMap);
            
            return quTemp;
        }

        else {
            console.log('Into else');
            quTemp.isEditable = false;
            if (qu.Rhythm__Required__c == true) {
                this.requiredQuestionList.push(qu.Id);
            }
            quTemp.conditional = qu.Rhythm__Conditional_Response__c == null ? '' : qu.Rhythm__Conditional_Response__c;
            quTemp.optionsValueSet = qu.Rhythm__OptionValueSet__c;
            if (quTemp.optionsValueSet) {
                var optionValues = quTemp.optionsValueSet.split("\r\n");
                var optionList = [];
                optionValues.forEach(opt => {
                    var optionMap = {};
                    optionMap['label'] = opt;
                    optionMap['value'] = opt;
                    optionList.push(optionMap);
                });
            }
            quTemp.optionsWrapper.options = optionList;
            quTemp.optionsWrapper.pickListOptions = optionList;
            quTemp.optionsWrapper.radioOptions = optionList;
            quTemp.optionsWrapper.multiPickListOptions = optionList;
            console.log('qu.Rhythm__Question__c', qu.Id);
            quTemp.value = undefined;
            quTemp.Rhythm__Conversation_History__c = [];
            quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
            quTemp.showUploadProgress = false;
            quTemp.Children = [];
            if (this.questionMap.has(qu.Rhythm__Section__r.Name)) {
                this.questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                var quesList = [];
                quesList.push(quTemp);
                this.questionMap.set(qu.Rhythm__Section__r.Name, quesList);
            }
            console.log('this.questionMap', this.questionMap);
            return quTemp;
        }

    }

    //Used // constructMultilevelhierarchy method is used to construct nested questions wrapper, 
    //based on condition of having parentQuestionId
    constructMultilevelhierarchy(queryResults, savedResp) {
        console.log('queryResults', queryResults);
        console.log('constructMultilevelhierarchy savedResp', savedResp);
        const children = queryResults.filter(result => typeof result['Rhythm__Parent_Question__c'] != 'undefined');
        const parent = queryResults.filter(result => typeof result['Rhythm__Parent_Question__c'] === 'undefined');
        console.log('topLevelChildren', children);
        children.forEach(child => {
            const hierarchyObj = this.constructWrapperConditionalQuestion(child, savedResp);
            this.createChildHierarchy(queryResults, hierarchyObj, savedResp);
            this.hierarchy.push(hierarchyObj);
        });
        parent.forEach(parentdata => {
            console.log('this.parentQuestionList', this.parentQuestionList);
            if (!(this.parentQuestionList.includes(parentdata.Id))) {
                console.log('parentdata', parentdata);
                const hierarchyObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                this.hierarchy.push(hierarchyObj);
            }
        });
    }

    //Used // createChildHierarchy method is used to construct nested questions wrapper 
    //for child questions accordingly with its parent Question 
    createChildHierarchy(queryResults, childObj, savedResp) {
        console.log('createChildHierarchy queryResults', queryResults);
        console.log('createChildHierarchy parentObj', childObj);
        const parent = queryResults.filter(result =>
            result.Id === childObj.parentQuestionId);
        if (parent.length > 0) {
            parent.forEach(parentdata => {
                const parentObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                console.log('parentObj', parentObj);
                this.createChildHierarchy(queryResults, parentObj, savedResp);
                console.log('childObj', childObj);
                var x = childObj.conditional;
                this.childQuestionList.push(childObj.Id);
                this.parentQuestionList.push(parentdata.Id);
                if (parentObj.value == childObj.conditional) {
                    var key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    childObj.isdisplay = true;
                    parentObj['Children'].push(childObj);
                }
                else {
                    var key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    childObj.isdisplay = false;
                    parentObj['Children'].push(childObj);
                }
            });
            console.log('this.questionsvaluemap', this.questionsvaluemap);
        }
    }

    //Used /* handlechatHistory is used to dispatch the event to the parent component (rtmvpcAssessmentDetail) */
    handlechatHistory(event) {
        this.showChat = event.detail;
        console.log('this.showChat',this.showChat);
        console.log('this.assessment',this.assessment);
        this.showChat.assesmentId = this.assessment;
        console.log('this.showChat',this.showChat);
        for(var i=0;i<this.questionsAndAnswerss.length;i++)
        {
            for(var j=0;j<this.questionsAndAnswerss[i].questions.length;j++)
            {
                if(this.questionsAndAnswerss[i].questions[j].Id==this.showChat.questionId)
                {
                    if(typeof this.showChat.responseflag != 'undefined')
                    {
                    this.questionsAndAnswerss[i].questions[j].Rhythm__Flag__c=this.showChat.responseflag;
                    }
                }
            }
        }
        console.log('chat', this.showChat);
        const selectedChat = new CustomEvent('selectconversation', {
            detail: this.showChat
        });

        console.log('this.selectedEvent', selectedChat);
        this.dispatchEvent(selectedChat);
    }

    //Used /* summaryClickHandler is used to navigate to the sections */
    summaryClickHandler(event) {
        const showsummary = new CustomEvent('showsummary', {});
        this.dispatchEvent(showsummary);
    }

    //Used /* section_navigationChangeHandler is used to navigate to the sections */
    section_navigationChangeHandler(event) {
        //this.section = event.target.value;
        this.constructQuestionsAndAnswers(this.questionsList);
    }

    //Used /* selectquestionHandler is used to highlight the question when flag icon is clicked */
    selectquestionHandler(event) {
        console.log('selectquestionHandler');
        var x = this.template.querySelectorAll('c-rtmvpc-render-question-template');
        for (var i = 0; i < x.length; i++) {
            x[i].removehighlightHandler(event.detail.id);
        }
    }
    @api handleConversationData(chatterData) {
        for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
            for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                if (this.questionsAndAnswerss[i].questions[j].Id == chatterData.questionId) {
                    this.questionsAndAnswerss[i].questions[j].Rhythm__Conversation_History__c = chatterData.conversationHistory;
                    break;
                }
                for (var k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                    if (this.questionsAndAnswerss[i].questions[j].Children[k].Id == chatterData.questionId) {
                        this.questionsAndAnswerss[i].questions[j].Children[k].Rhythm__Conversation_History__c = chatterData.conversationHistory;
                        break;
                    }
                }
            }
        }
        console.log('this.questionsAndAnswerss in dispatch');
    }
    handleStartReview()
    {
        var param={};
        var status ='In review';
        param.assessmentStatus = status;
        param.recId = this.recordId;
        for(var i=0;i<this.questionsAndAnswerss.length;i++)
        {
            for(var j=0;j<this.questionsAndAnswerss[i].questions.length;j++)
            {
                this.questionsAndAnswerss[i].questions[j].customerFlag = true;
            }
        }

        updateAccountAssessmentStatus({paramMap : JSON.stringify(param) }).then(result=>{
            console.log(' handleStartReview result',result);
            this.showSaveAndSubmit = true;
            this.showInReview = false;
            const selectedEvent = new CustomEvent('updatetimeline', {
                detail: param
            });
            this.dispatchEvent(selectedEvent);
            this.handleOnload();
        }).catch(error=>{
            console.log('error',error);
        });
         
        this.showcustomerbuttons = true;
        this.showInReview = false;
        this.showSaveAndSubmit = true;
    }
    handleSubmitCustomer()
    {
        console.log('Hello',this.template.querySelectorAll('c-rtmvpc-render-question-template'));
        this.template.querySelectorAll('c-rtmvpc-render-question-template')[0].checkCustomerFlags();
    }
    enableCustomFlag(event)
    {
        console.log('enableCustomFlag',event.detail);
        var param = event.detail;
        updateAccountAssessmentStatus({paramMap : JSON.stringify(param) }).then(result=>{
            console.log('result',result);

            const selectedEvent = new CustomEvent('updatetimeline', {
                detail: param
            });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent);
            this.handleOnload();

        }).catch(error=>{
            console.log('error',error);
        });
         
    }
}