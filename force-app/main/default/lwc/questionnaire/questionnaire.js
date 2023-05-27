import { LightningElement, api, track, wire } from 'lwc';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import createSupplierResponse from '@salesforce/apex/AssessmentController.createSupplierResponse';
import getSurveyValues from '@salesforce/apex/rtmvpcRelatedListsController.getSurveyValues';
import createChatterItem from '@salesforce/apex/rtmvpcRelatedListsController.createChatterItem';
import getAssessmentlist from '@salesforce/apex/AssessmentController.getAssessmentlist';

export default class Questionnaire extends LightningElement {

    @api chartProperties = { "chartType": "stacked" };
    @api chartData = {};
    @api vendor;
    @api questionsAnswered = 0;
    @api assessment;
    @track totastmessage = '';
    @track isShowModal = false;
    @track showToast = false;
    @track responseList;
    @track disclosure = '';
    groupTwoValues = [];
    @track responseMap = new Map();
    @track savedResponseMap = new Map();
    @track isOpen = true;
    @track visible = false;
    @track ParentQuestion = false;
    @track multiple = true;
    @track selectedCount = 0;
    @track showDisclosure;
    @track supplierAssessmentName;
    @track supplierAssCreatedDate;
    @track supplierAssCreatedById;
    @track AssessmentName;
    @track showSummary;
    @track needPagination;
    @track activeSection;
    @track questionMap = new Map();

    @track hierarchy = [];
    @api recordId;

    @track questionsAndAnswerss = [];
    @track sectionsforpicklist = [];
    @track showquestion = false;
    @track showtablereport = false;

    @track surveyValuesJson = {};
    @track surveyValuesList = [];
    @track currentSurveyValue;
    @track isSubmitted;
    @track nextsection;
    @track sectionValue;
    sectionLabel = "All Sections";

    // @track showChatter;
    @track showUpload;
    @track Conversation_History__c;

    @wire(getSurveyValues)
    getSurveyValues_wiredData({ error, data }) {
        if (data) {
            this.surveyValuesJson = data;
        }
        else if (error) {
            console.log('getSurveyValues Error', error);
        }
    }


    handleAnswerSelection(event) {
        this.selectedAnswers[event.target.name] = event.target.value;
    }
    handlegrouptwochange(e) {
        this.groupTwoValues = e.detail.value;
    }
    connectedCallback() {
        this.Conversation_History__c = "";
        this.chartData.questionsStatus = [
            { "label": "Answered", "value": 0 },
            { "label": "Unanswered", "value": 0 }
        ];
        this.chartData.sectionwiseStatus = {};
        var assessmentTemplateId;
        if (this.assessment == null || this.assessment == '') {
            this.assessment = this.recordId;
        }
        getSurveyValues({}).then(result => {
            this.surveyValuesJson = result;
            getSupplierAssessmentList({ assessmentId: this.assessment }).then(result => {
                assessmentTemplateId = result[0].Assessment_Template__c;
                this.showDisclosure = result[0].Assessment_Template__r.Disclosure__c;
                this.AssessmentName = result[0].Name;
                for (var key in this.surveyValuesJson) {
                    var jsonData = { label: this.surveyValuesJson[key], value: key };
                    console.log('jsonData' + JSON.stringify(jsonData));
                    this.surveyValuesList.push(jsonData);
                    if (this.surveyValuesJson[key] === result[0].Assesment_Status__c){//Survey_Life_Cycle__c) {
                        this.currentSurveyValue = key;
                    }
                }
                //console.log('showDisclosure===>'+ showDisclosure);
                // this.showDisclosure = true;

                if (result[0].Assesment_Status__c !== 'Submitted') {
                    this.showquestion = true;
                    this.showSummary = false;
                    this.isSubmitted = false;
                    // this.showtablereport = false;
                } else {
                    this.isOpen = false;
                    this.showquestion = true;
                    this.showSummary = true;
                    this.isSubmitted = true;
                    // this.showtablereport = true;
                }
                getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                    var resultMap = result;
                    this.chartData.questionsStatus[1].value = resultMap.length;
                    getSupplierResponseList({ assessmentId: this.assessment }).then(result => {
                        if (result[0] && result[0].CreatedBy && result[0].CreatedDate) {
                            this.supplierAssessmentName = result[0].CreatedBy.Name;
                            //console.log('this.supplierAssessmentName===>' + this.supplierAssessmentName);
                            this.supplierAssCreatedDate = result[0].CreatedDate;
                            console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);

                            //if(datetype){
                            var x = this.supplierAssCreatedDate.split('T')[0];
                            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                            console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);
                            // }
                        }
                        result.forEach(qres => {
                            this.savedResponseMap.set(qres.Questionnaire__c, { "Id": qres.Id, "value": qres.Response__c, "Flag__c": qres.Flag__c, "Conversation_History__c": qres.Conversation_History__c });
                            // if (qres.Response__c) {
                            //     this.chartData.questionsStatus[0].value += 1;
                            //     this.chartData.questionsStatus[1].value -= 1;
                            // }
                        });
                        console.log(this.savedResponseMap);
                        //this.questionsAnswered = (this.chartData.questionsStatus[0].value * 100 / this.chartData.questionsStatus[1].value).toString().split('.')[0];
                        this.call = true;
                        //console.log('I am here');
                        this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                        //this.constructWrapper(resultMap, this.savedResponseMap);
                        // console.log(this.questionMap);
                        var questionsList = [];
                        var totalsections = [];
                        var count = 0;
                        var sectioncount = 0;
                        for (const seckey of this.questionMap.keys()) {
                            count++;
                            sectioncount += 1;
                            questionsList.push({ "section": seckey, "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                            totalsections.push({ label: seckey, value: sectioncount });
                        }
                        //if (questionsList.length > 5)
                        this.activeSection = questionsList[0].section;
                        if (count <= 5) {
                            this.needPagination = false;
                        }
                        else {
                            this.needPagination = true;
                            this.showSummary = true;
                        }
                        console.log('this.needPagination', this.needPagination);
                        this.questionsAndAnswerss = questionsList;
                        this.sectionsforpicklist = totalsections;
                        console.log('I am at 169');
                        if (typeof this.questionsAndAnswerss[0].questions[0] != "undefined" && typeof this.questionsAndAnswerss[0].questions[0].Id != "undefined" && typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id) != "undefined") {
                            if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Conversation_History__c != 'undefined') {
                                this.Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[0].questions[0].Id, "chatHistory": (this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Conversation_History__c ? JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Conversation_History__c) : '') };
                            }
                        } console.log('I am at 170');
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

    renderedCallback() {
        console.log('Changes Recieved');
    }

    // constructWrapper(questionResp, savedResp) {
    //     var questionMap = new Map();
    //     questionResp.forEach(qu => {
    //         var quTemp = this.getQuestionTemplate();
    //         quTemp.Id = qu.questionId;
    //         quTemp.question = qu.Question;
    //         quTemp.ParentQuestion = qu.parentQuestion;
    //         quTemp.isText = ('Text' == qu.Type);
    //         quTemp.isRadio = ('Radio' == qu.Type);
    //         quTemp.isPicklist = ('Picklist' == qu.Type);
    //         quTemp.isMultiPicklist = ('Picklist (Multi-Select)' == qu.Type);
    //         quTemp.isDate = ('Date' == qu.Type);
    //         quTemp.isCheckbox = ('Checkbox' == qu.Type);
    //         quTemp.isNumber = ('Number' == qu.Type);
    //         quTemp.isEmail = ('Email' == qu.Type);
    //         quTemp.isTextArea = ('Text Area' == qu.Type);
    //         quTemp.type = qu.Type;
    //         quTemp.conditional = qu.conditionalValue==null?'':qu.conditionalValue;
    //         quTemp.optionsValueSet = qu.optionValueSet;
    //         if (quTemp.optionsValueSet) {
    //             var optionValues = quTemp.optionsValueSet.split("\r\n");
    //             var optionList = [];
    //             optionValues.forEach(opt => {
    //                 let optionMap = {};
    //                 optionMap['label'] = opt;
    //                 optionMap['value'] = opt;
    //                 optionList.push(optionMap);
    //             });
    //         }
    //         quTemp.optionsWrapper.options = optionList;
    //         quTemp.optionsWrapper.pickListOptions = optionList;
    //         quTemp.optionsWrapper.radioOptions = optionList;
    //         quTemp.optionsWrapper.multiPickListOptions = optionList;
    //         if (questionMap.has(qu.sectionName)) {
    //             questionMap.get(qu.sectionName).push(quTemp);
    //         } else {
    //             var quesList = [];
    //             quesList.push(quTemp);
    //             questionMap.set(qu.sectionName, quesList);
    //         }
    //         quTemp.value = savedResp.get(qu.questionId);
    //         this.responseMap.set(qu.questionId, savedResp.get(qu.questionId));
    //     });
    //     var questionsList = [];
    //     for (const seckey of questionMap.keys()) {
    //         questionsList.push({ "section": seckey, "questions": questionMap.get(seckey) });
    //     }
    //     this.questionsAndAnswerss = questionsList;
    //     return questionsList;
    // }


    getQuestionTemplate() {
        var question = {
            "question": "", "isText": false, "isRadio": false, "isPicklist": false,
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

    handleChange(event) {
        if (typeof event.target.value === 'object' && event.target.value.length) {
            this.responseMap.set(event.currentTarget.dataset.key, JSON.stringify(event.target.value));
        } else {
            this.responseMap.set(event.currentTarget.dataset.key, event.target.value);
        }
        if (event.target.value === event.currentTarget.dataset.con) {
            this.visible = true;
        } else {
            this.visible = false;
        }
        console.log('responsemap', this.responseMap);
        var qaa_i;
        var qaa_j;
        for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
            this.Conversation_History__c=undefined;
            if (this.questionsAndAnswerss[i]) {
                for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                    if (this.questionsAndAnswerss[i].questions && this.questionsAndAnswerss[i].questions[j].Id.toString() === event.currentTarget.dataset.key.toString()) {
                        qaa_i = i;
                        qaa_j = j;
                        if (typeof this.questionsAndAnswerss[i].questions[j] != "undefined" && typeof this.questionsAndAnswerss[i].questions[j].Id != "undefined" && typeof this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id) != "undefined") {
                            if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Conversation_History__c != 'undefined') {
                                this.Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[i].questions[j].Id, "chatHistory": JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Conversation_History__c) };
                            }
                            else {
                                this.Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[i].questions[j].Id, "chatHistory": "" };
                            }
                        } break;
                    }
                }
            }
                console.log(i);
                console.log(this.questionsAndAnswerss.length);
            if (typeof this.Conversation_History__c != 'undefined')
                break;
            if(i===this.questionsAndAnswerss.length-1)
            {
                this.Conversation_History__c={};
            }
        }
        if (event.target.value.toLowerCase() === 'yes') {
            this.questionsAndAnswerss[qaa_i].questions[qaa_j].showUpload = true;
            // this.Conversation_History__c = this.savedResponseMap.get(event.currentTarget.dataset.key).Conversation_History__c;
        }
        else {
            this.questionsAndAnswerss[qaa_i].questions[qaa_j].showUpload = false;
        }
    }
    handleSectionToggle(event) {
        const sections = this.template.querySelectorAll('lightning-accordion-section');
        let count = 0;
        sections.forEach((section) => {
            if (section !== event.target && section.activeSection) {
                count++;
            }
        });
        this.selectedCount = count;
    }
    handleSave() {
        this.constructResponse(false);
    }

    handleSubmit() {
        this.constructResponse(true);
    }

    handlegotoQuestion(event) {
        console.log('Event Fired---.');
        this.showSummary = false;
        this.questionsAndAnswerss[0].show = true;
        this.showquestion = true;
        this.showtablereport = false;
    }

    constructResponse(isSubmit) {

        let responseList = [];
        for (const seckey of this.responseMap.keys()) {
            let reponse = { 'sobjectType': 'Supplier_Response__c' };
            reponse.Assessment__c = this.assessment;
            console.log('reponse.Assessment__c==>' + JSON.stringify(reponse.Assessment__c));
            reponse.Questionnaire__c = seckey;
            console.log('reponse.Questionnaire__c' + JSON.stringify(reponse.Questionnaire__c));
            reponse.Vendor__c = this.vendor;
            console.log('reponse.Vendor__c' + JSON.stringify(reponse.Vendor__c));
            reponse.Response__c = this.responseMap.get(seckey);
            console.log('reponse.Response__c==>' + JSON.stringify(reponse.Response__c));


            responseList.push(reponse);
        }
        this.showToast = true;
        createSupplierResponse({ suppResponseList: responseList, vendorId: this.vendor, assesmentId: this.assessment, isSubmit: isSubmit }).then(result => {
            console.log('sucessfully created Response result==>' + result);
            this.totastmessage = 'Responses saved successfully';

        }).catch(error => {
            console.log('Error' + error);
            this.totastmessage = 'Error : ' + JSON.stringify(error);
        })
    }
    closeToastHandler(event) {
        console.log('In Disptch event');
        this.showToast = event.detail.showModal;
    }

    constructWrapperConditionalQuestion(qu, savedResp) {
        var quTemp = this.getQuestionTemplate();
        quTemp.Id = qu.questionId;
        quTemp.question = qu.Question;
        quTemp.ParentQuestion = qu.parentQuestion;
        quTemp.isText = ('Text' == qu.Type);
        quTemp.isRadio = ('Radio' == qu.Type);
        quTemp.isPicklist = ('Picklist' == qu.Type);
        quTemp.isMultiPicklist = ('Picklist (Multi-Select)' == qu.Type);
        quTemp.isDate = ('Date' == qu.Type);
        quTemp.isCheckbox = ('Checkbox' == qu.Type);
        quTemp.isNumber = ('Number' == qu.Type);
        quTemp.isEmail = ('Email' == qu.Type);
        quTemp.isTextArea = ('Text Area' == qu.Type);
        quTemp.type = qu.Type;
        quTemp.conditional = qu.conditionalValue == null ? '' : qu.conditionalValue;
        quTemp.optionsValueSet = qu.optionValueSet;
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
        console.log('I am here');
        if (typeof savedResp.get(qu.questionId) != "undefined" && typeof savedResp.get(qu.questionId).value != "undefined")
            quTemp.value = savedResp.get(qu.questionId).value;
        else
            quTemp.value = undefined;
        if (typeof savedResp.get(qu.questionId) != "undefined" && typeof savedResp.get(qu.questionId).Flag__c != "undefined")
            quTemp.Flag__c = savedResp.get(qu.questionId).Flag__c ? savedResp.get(qu.questionId).Flag__c : false;
        else
            quTemp.Flag__c = false;
        console.log('I am after value');
        if (typeof savedResp.get(qu.questionId) != "undefined" && typeof savedResp.get(qu.questionId).Conversation_History__c != "undefined")
            quTemp.Conversation_History__c = savedResp.get(qu.questionId).Conversation_History__c;
        else
            quTemp.Conversation_History__c = [];
        quTemp.showUpload = false;
        if (typeof savedResp.get(qu.questionId) != "undefined" && typeof savedResp.get(qu.questionId).value != "undefined")
            this.responseMap.set(qu.questionId, savedResp.get(qu.questionId).value);
        quTemp.Children = [];
        if (this.questionMap.has(qu.sectionName)) {
            this.questionMap.get(qu.sectionName).push(quTemp);
        } else {
            var quesList = [];
            quesList.push(quTemp);
            this.questionMap.set(qu.sectionName, quesList);
        }
        return quTemp;
    }



    constructMultilevelhierarchy(queryResults, savedResp) {
        const topLevelParents = queryResults.filter(result => result.parentQuestion === '');
        topLevelParents.forEach(parent => {
            const hierarchyObj = this.constructWrapperConditionalQuestion(parent, savedResp);
            // Call recursive function to create nested children objects
            this.createChildHierarchy(queryResults, hierarchyObj, savedResp);
            this.hierarchy.push(hierarchyObj);
        });
    }

    createChildHierarchy(queryResults, parentObj, savedResp) {
        const children = queryResults.filter(result => result.parentQuestion === parentObj.Id);
        if (children.length > 0) {
            children.forEach(child => {
                const childObj = this.constructWrapperConditionalQuestion(child, savedResp);
                this.createChildHierarchy(queryResults, childObj, savedResp);
                parentObj.Children.push(childObj);
            });
        }
    }
    nextSectionHandler() {
        if (this.showSummary === true) {
            this.showSummary = false;
            this.questionsAndAnswerss[0].show = true;
        }
        else {
            console.log('this.questionsAndAnswerss.length' + JSON.stringify(this.questionsAndAnswerss.length));
            for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                console.log(this.questionsAndAnswerss[i]);
                if (this.questionsAndAnswerss[i].show === true) {
                    this.questionsAndAnswerss[i].show = false;
                    console.log('this.questionsAndAnswerss[i].show==>' + this.questionsAndAnswerss[i].show)
                    this.questionsAndAnswerss[i + 1].show = true;
                    if (i === this.questionsAndAnswerss.length - 2) {
                        this.questionsAndAnswerss[i + 1].showNext = false;

                    }
                    break;
                }
            }
        }
    }
    prevSectionHandler() {
        for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
            console.log(this.questionsAndAnswerss[i]);
            if (this.questionsAndAnswerss[i].show === true) {
                this.questionsAndAnswerss[i].show = false;
                if (i === 0) {
                    this.showSummary = true;
                }
                else {
                    this.questionsAndAnswerss[i - 1].show = true;
                    if (i === this.questionsAndAnswerss.length - 2) {
                        this.questionsAndAnswerss[i - 1].showNext = false;
                    }
                }
                break;
            }
        }
    }
    navigatetorecord(event) {
        console.log('child event');
        console.log('Parent', event.detail.SectionNumber);
        this.showSummary = false;
        for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
            this.questionsAndAnswerss[i].show = false;
        }
        this.questionsAndAnswerss[event.detail.SectionNumber - 1].show = true;
        this.sectionValue = Number(event.detail.SectionNumber);//this.questionsAndAnswerss[event.detail.SectionNumber -1].section;
        // this.sectionLabel = this.questionsAndAnswerss[sectionNumber-1].section;
        // this.nextSectionHandler();
        // this.nextsection = event.target.
        // this.nextSectionHandler();
    }


    handleSectionChange(event) {
        console.log('test==>' + event.target.value);
        var sectionNumber = event.target.value;

        this.questionsAndAnswerss.forEach(child => {
            child.show = false;

        });
        this.questionsAndAnswerss[sectionNumber - 1].show = true;
        this.sectionValue = Number(sectionNumber);
        //this.sectionLabel = this.questionsAndAnswerss[sectionNumber-1].section;


    }
    handleClick() {
        this.showSummary = true;
    }

    @track newChat;
    chatChangeHandler(event) {
        this.newChat = event.target.value;
    }
    sendButtonHandler(event) {
        console.log(this.Conversation_History__c.Id + ' : ' + this.newChat + ' : ' + this.Conversation_History__c.AssessmentId);
        if (this.newChat && this.newChat.toString().length > 0) {
            createChatterItem({ responseId: this.Conversation_History__c.Id, source: "Customer", subject: this.newChat, assId: this.Conversation_History__c.AssessmentId, qId: this.Conversation_History__c.QuestionnaireId }).then(result => {
                console.log('sendButtonHandler Data', JSON.stringify(result));
                var x = JSON.parse(JSON.stringify(result));
                this.Conversation_History__c.chatHistory = JSON.parse(x[0].Conversation_History__c);
                for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                    if (this.questionsAndAnswerss[i]) {
                        for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                            if (this.questionsAndAnswerss[i].questions && this.questionsAndAnswerss[i].questions[j].Id.toString() === this.Conversation_History__c.QuestionnaireId) {
                                this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Conversation_History__c = JSON.stringify(this.Conversation_History__c.chatHistory);
                                console.log(this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Conversation_History__c);
                            }
                        }
                    }
                    // if (typeof qaa_i != 'undefined')
                    //     break;
                }
            }).catch(error => {
                console.log('sendButtonHandler Error', JSON.stringify(result));
            });
        }
    }

}