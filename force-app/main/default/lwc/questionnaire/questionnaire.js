/* Component Name   : rtmvpcRenderQuestionTemplate
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
import getSurveyValues from '@salesforce/apex/rtmvpcRelatedListsController.getSurveyValues';
//import createChatterItem from '@salesforce/apex/rtmvpcRelatedListsController.createChatterItem';
import deleteFileAttachment from '@salesforce/apex/AssessmentController.deleteFileAttachment';

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
    @api section;
    @track requiredQuestionList = [];
    @api assessment;
    @track totastmessage = '';
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

    //Used /* handleAccordionSection is used to handle opening and closing of a section */
    handleAccordionQuestion() {
        if (this.accordionQuestionFlag == false) {
            this.accordionQuestionFlag = true;
            this.showAccordionQuestions = 'slds-accordion__section slds-is-open';
        }
        else {
            this.accordionQuestionFlag = false;
            this.showAccordionQuestions = 'slds-accordion__section slds-is-close';
        }
    }

    //Used /* Connectedcallback is used to get data on onload */
    connectedCallback() {
        if (this.assessment == null || this.assessment == '') {
            this.assessment = this.recordId;
        }
        getSurveyValues({}).then(result => {
            /*This method is used to get all the assessments records*/
            getSupplierAssessmentList({ assessmentId: this.assessment }).then(result => {
                var supplierAssessment = result[0];
                var assessmentTemplateId = result[0].Rhythm__Template__c;
                this.showDisclosure = result[0].Rhythm__Template__r.Rhythm__Disclosure__c;
                this.AssessmentName = result[0].Name;
                var sectionidslist = [];
                /*This method is used to get all the questions with particular section*/
                getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                    var resultMap = result;
                    for (let i = 0; i < resultMap.length; i++) {
                        if (!sectionidslist.includes(resultMap[i].Rhythm__Section__r.Id)) {
                            sectionidslist.push(resultMap[i].Rhythm__Section__r.Id);
                        }
                    }
                    // for (let i = 0; i < resultMap.length; i++) {
                    //     let count = 0;
                    //     for (let j = i; j < resultMap.length; j++) {
                    //         if (resultMap[i].Rhythm__Section__r.Id == resultMap[j].Rhythm__Section__r.Id) {
                    //             this.responseCount[resultMap[i].Rhythm__Section__r.Name] = count + 1;
                    //         }
                    //     }
                    // }

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
                            this.savedResponseMap.set(qres.Rhythm__Question__c, { "Id": qres.Id, "value": qres.Rhythm__Response__c, "Files__c": qres.Rhythm__Files__c, "Flag__c": qres.Rhythm__Flag__c, "Conversation_History__c": qres.Rhythm__Conversation_History__c });
                        });

                        console.log('this.savedResponseMap', this.savedResponseMap);
                        console.log('resultMap', resultMap);
                        this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                        var count = 0;
                        var sectionsList = [];

                        console.log('questionMap', this.questionMap);
                        for (const seckey of this.questionMap.keys()) {

                            console.log('seckey', seckey);
                            console.log('seckey', this.questionMap.get(seckey));
                            count++;
                            sectionsList.push({ label: seckey, value: sectionidslist[count - 1] });
                            this.questionsList.push({ "sectionId": sectionidslist[count - 1], "section": seckey, "numberOfQuestions": '', "numberOfResponses": '', "displayFlag": '', "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                        }

                        console.log('this.questionsList>>>', this.questionsList);
                        this.showButtons.Summary = false;
                        this.showButtons.Section_Navigation.show = false;
                        this.showButtons.Save_Submit = false;
                        if (supplierAssessment.Rhythm__Status__c === 'Submitted') {
                            this.showButtons.Summary = true;
                        }
                        else {
                            this.showButtons.Save_Submit = true;
                        }
                        if (this.questionsList.length > this.sectionLimits) {
                            this.showButtons.Summary = true;
                            this.showButtons.Section_Navigation.show = true;
                            this.showButtons.Section_Navigation.options = sectionsList;
                            this.showButtons.Section_Navigation.value = this.section;
                        }

                        console.log('this.section', this.section);
                        this.constructQuestionsAndAnswers(this.questionsList);
                        for (let i = 0; i < this.questionsList.length; i++) {
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
            })
        }).catch(error => {
            console.log('Error' + error);
        })
    }

    //Used /*constructQuestionsAndAnswers method is used to build the wrappers based on sections and their according questions  */
    constructQuestionsAndAnswers(questionsList) {
        var duplicatequestionList = questionsList;
        this.questionsAndAnswerss = [];
        if (typeof this.section != "undefined") {
            for (let i = 0; i < questionsList.length; i++) {
                questionsList[i].numberOfQuestions = questionsList[i].questions.length;
                if ((questionsList.length > this.sectionLimits && this.section != undefined && questionsList[i].sectionId == this.section) || questionsList.length <= this.sectionLimits) {
                    for (let j = 0; j < questionsList[i].questions.length; j++) {
                        questionsList[i].numberOfQuestions = questionsList[i].numberOfQuestions + questionsList[i].questions[j].Children.length;

                        console.log('this.childQuestionList', this.childQuestionList);
                        console.log('questionsList[i].questions[j].Id)', questionsList[i].questions[j].Id);
                        console.log(this.childQuestionList.includes(questionsList[i].questions[j].Id));
                        if ((this.childQuestionList.includes(questionsList[i].questions[j].Id))) {

                            console.log('questionsListinside', questionsList[i].questions[j].Id, 'JJJJ', j);
                            const deletedQues = questionsList[i].questions.splice(j, 1);

                            console.log('deletedQues', deletedQues);
                        }
                    }
                    this.questionsAndAnswerss.push(questionsList[i]);
                }
            }
            if (this.questionsAndAnswerss.length > 0) {
                if (typeof this.questionsAndAnswerss[0].questions[0] != "undefined" && typeof this.questionsAndAnswerss[0].questions[0].Id != "undefined" && typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id) != "undefined") {
                    if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c != 'undefined') {
                        this.Rhythm__Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[0].questions[0].Id, "chatHistory": (this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c ? JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rhythm__Conversation_History__c) : '') };
                    }
                }
            }
        }
       for(let i=0;i<duplicatequestionList.length;i++)
        {
            var numberOfResponses =0;
             var displayFlag=0;
             for (let j = 0; j < questionsList[i].questions.length; j++) {
                 if(typeof questionsList[i].questions[j].value !='undefined')
                 {
                     numberOfResponses++;
                 }
                 if(typeof questionsList[i].questions[j].Children !='undefined')
                 {
                    for(let k=0;k<questionsList[i].questions[j].Children.length;k++)
                    {
                        if(typeof questionsList[i].questions[j].Children.length !='undefined')
                        {
                            numberOfResponses++;
                        }
                    }
                 }
                 if(duplicatequestionList[i].questions[j].Rhythm__Flag__c == true)
                         {
                             displayFlag++;
                         }
             }
           questionsList[i].displayFlag=displayFlag;  
           questionsList[i].numberOfResponses=numberOfResponses;  
        }
    }

    //Used /* onResponseChange method is used to change the wrapper and display the changed responsed for questions values on UI */
    onResponseChange(event) {

        console.log(' event.detail', event.detail);
        this.questionresponseafterchange = event.detail;

        console.log(' this.questionresponseafterchange', this.questionresponseafterchange);
        if (this.questionresponseafterchange != undefined) {
            for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
                for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                    if (this.questionresponseafterchange.parent == null && this.questionresponseafterchange.questionId == this.questionsAndAnswerss[i].questions[j].Id) {
                        this.questionsAndAnswerss[i].questions[j].value = this.questionresponseafterchange.option;
                        if (this.questionsAndAnswerss[i].questions[j].Children.length > 0) {

                            console.log('Into if');
                            console.log('this.questionsAndAnswerss[i].questions[j].children.length', this.questionsAndAnswerss[i].questions[j].Children.length);
                            for (let k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
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
                            for (let k = 0; k < this.questionsAndAnswerss[i].questions[j].Children.length; k++) {
                                this.questionsAndAnswerss[i].questions[j].Children[k].value = this.questionresponseafterchange.option;
                            }
                        }
                    }
                }
            }
            this.responseMap.set(this.questionresponseafterchange.questionId, this.questionresponseafterchange.option);
        }

        console.log('this.questionsAndAnswerss after change', this.questionsAndAnswerss);
    }

    //Used /*handleFileUpload method is used to store the uploaded attachments into response records */
    handleFileUpload(event) {

        console.log('inQuestionnaire for file upload', event.detail);
        this.fileResponseData = event.detail;

        console.log(',this.savedResponseMap.get(fileResponseData.questionId).Id', this.savedResponseMap);
        console.log('this.saved', this.savedResponseMap.get(this.fileResponseData.questionId).Id);
        /*Apex method is used to store the uploaded attachments into response records */
        uploadFile({ resId: this.savedResponseMap.get(this.fileResponseData.questionId).Id, fileBlob: this.fileResponseData.filedata, name: this.fileResponseData.name, quesId: this.fileResponseData.questionId, assesmentId: this.assessment }).then(result => {
            this.template.querySelectorAll('c-rtmvpc-render-question-template')[0].getShowUploadStatus();

            console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
            console.log('uploadFile Result', result);
            for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
                if (this.questionsAndAnswerss[i].sectionId == this.fileResponseData.sectionId) {
                    for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                        if (this.questionsAndAnswerss[i].questions[j].Id == this.fileResponseData.questionId) {
                            if (typeof this.questionsAndAnswerss[i].questions[j].Files__c == 'undefined') {
                                let fileresponsedatalst = [];
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

            console.log('this.questionsAndAnswerss>>>', this.questionsAndAnswerss);
        });
    }

    //Used /* handledeletefile method is used to store the uploaded attachments into response records  */
    handledeletefile(event) {
        console.log('In Questionnaire handledeletefile', event.detail);
        let deletefileData = event.detail;
        console.log('In Questionnaire handledeletefile', deletefileData);
        deleteFileAttachment({ questionId: deletefileData.questionId, name: deletefileData.name }).then(result => {
            console.log('result', result);
            for (let i = 0; i < this.questionsAndAnswerss.length; i++) {
                if (this.questionsAndAnswerss[i].sectionId == deletefileData.sectionId) {
                    for (let j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                        if (this.questionsAndAnswerss[i].questions[j].Id == deletefileData.questionId &&
                            typeof this.questionsAndAnswerss[i].questions[j].Files__c != 'undefined') {
                            for (let k = 0; k < this.questionsAndAnswerss[i].questions[j].Files__c.length; k++) {
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

    //Used /* getQuestionTemplate is used to create the basic question template for wrapper construction */
    getQuestionTemplate() {
        var question = {
            "question": "", "helptext": "", "isText": false, "isRadio": false, "isPicklist": false,
            "isMultiPicklist": false, "isDate": false, "isCheckbox": false, "isNumber": false,
            "isEmail": false, "isTextArea": false, "Id": "",
            "type": "Radio", "conditional": "", "optionsValueSet": "Testrrrr1, Testrrrr11", "ConditionalQuestion": "test4,test5",
            "optionsWrapper": {
                "checkboxOptions": [],
                "pickListOptions": [
                    { "label": "Test1", "value": "Test1" },
                    { "label": " Test11", "value": " Test11" }
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
        let isAssessmentValidated = false;
        let responseList = [];

        console.log('this.responseMap', this.responseMap);
        for (const seckey of this.responseMap.keys()) {
            let reponse = { 'sobjectType': 'Rhythm__Response__c' };
            reponse.Rhythm__Assessment__c = this.assessment;
            reponse.Rhythm__Question__c = seckey;
            reponse.Rhythm__Account__c = this.vendor;
            reponse.Rhythm__Response__c = this.responseMap.get(seckey);

            console.log('reponse in constructResponse', reponse);
            if (this.requiredQuestionList.includes(reponse.Rhythm__Question__c) && (reponse.Rhythm__Response__c == '')) {
                isAssessmentValidated = true;
                break;
            }
            responseList.push(reponse);
        }
        if (isAssessmentValidated == false) { //Needs Optimization
            this.showToast = true;
            this.success = true;

            console.log('responseList', responseList);
            /* This method is used to create the response for the questions*/
            createSupplierResponse({ suppResponseList: responseList, vendorId: this.vendor, assesmentId: this.assessment, isSubmit: isSubmit }).then(result => {
                
                console.log('sucessfully created Response result==>', result);
                this.totastmessage = 'Responses saved successfully';

            }).catch(error => {
                console.log('Error' + error);
                this.totastmessage = 'Error : ' + JSON.stringify(error);
            })
        }
        else {
            this.showToast = true;
            this.success = false;
            this.totastmessage = 'Please fill the required question:';
        }
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
        quTemp.sectionId = this.section;
        quTemp.isText = ('Text' == qtype);
        quTemp.isRadio = ('Radio' == qtype);
        quTemp.isPicklist = ('Picklist' == qtype);
        quTemp.isMultiPicklist = ('Picklist (Multi-Select)' == qtype);
        quTemp.isDate = ('Date' == qtype);
        quTemp.isCheckbox = ('Checkbox' == qtype);
        quTemp.isNumber = ('Number' == qtype);
        quTemp.isEmail = ('Email' == qtype);
        quTemp.isTextArea = ('Text Area' == qtype);
        quTemp.type = qtype;
        quTemp.required = qu.Rhythm__Required__c;
        quTemp.inputId = qu.Id + '_inputId';
        quTemp.labelId = qu.Id + '_labelId';
        quTemp.spanId = qu.Id + '_spanId';
        quTemp.parentQuestionId = qu.Rhythm__Parent_Question__c;
        if (qu.Rhythm__Responses__r != null) {
            quTemp.Rhythm__Flag__c = qu.Rhythm__Responses__r[0].Rhythm__Flag__c;
        }
        else {
            quTemp.Rhythm__Flag__c = false;
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
                let optionMap = {};
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
        if (typeof savedResp.get(qu.Id) != "undefined" && typeof savedResp.get(qu.Id).value != "undefined") {
            console.log(savedResp.get(qu.Id));
            quTemp.value = savedResp.get(qu.Id).value;
        }
        else
            quTemp.value = undefined;
        if (typeof savedResp.get(qu.Id) != "undefined" && typeof savedResp.get(qu.Id).Rhythm__Conversation_History__c != "undefined")
            quTemp.Rhythm__Conversation_History__c = savedResp.get(qu.Id).Rhythm__Conversation_History__c;
        else
            quTemp.Rhythm__Conversation_History__c = [];
        quTemp.showUpload = qu.Rhythm__Requires_File_Upload__c;
        if (typeof savedResp.get(qu.Id) != "undefined" && typeof savedResp.get(qu.Id).Files__c != "undefined") {
            var responsedData = JSON.parse(savedResp.get(qu.Id).Files__c);
            console.log('(savedResp.get(qu.Id).Files__c)', (savedResp.get(qu.Id).Files__c));
            for (let i = 0; i < responsedData.length; i++) {
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
        if (typeof savedResp.get(qu.Id) != "undefined" && typeof savedResp.get(qu.Id).value != "undefined")
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

    //Used /* constructMultilevelhierarchy method is used to construct nested questions wrapper, based on condition of having parentQuestionId */
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

    //Used /* createChildHierarchy method is used to construct nested questions wrapper for child questions accordingly with its parent Question */
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
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    childObj.isdisplay = true;
                    parentObj['Children'].push(childObj);
                }
                else {
                    let key = parentObj.question + '-' + parentObj.value;
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
        this.showChat.assesmentId = this.assessment;

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
        this.section = event.target.value;
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
}