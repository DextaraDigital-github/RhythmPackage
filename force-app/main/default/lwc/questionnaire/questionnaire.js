/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections and save the responses
* Last Modified Date: 
*/
import { LightningElement, api, track, wire } from 'lwc';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import createSupplierResponse from '@salesforce/apex/AssessmentController.createSupplierResponse';
import getSurveyValues from '@salesforce/apex/rtmvpcRelatedListsController.getSurveyValues';
import createChatterItem from '@salesforce/apex/rtmvpcRelatedListsController.createChatterItem';
//import getAssessmentlist from '@salesforce/apex/AssessmentController.getAssessmentlist';

export default class Questionnaire extends LightningElement {

    //@api chartProperties = { "chartType": "stacked" };
    @api chartData = {};
    @api vendor;

    @track success;
    @track section;
    @track requiredQuestionList = [];
    @api questionsAnswered = 0;
    @api assessment;
    @track totastmessage = '';
    @track isShowModal = false;
    @track showToast = false;
    @track responseList;
    @track disclosure = '';
    @track openChat = false;
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
    @track childQuestionList = [];

    @track hierarchy = [];
    @api recordId;
    @track questionlist = [];
    @track questionsAndAnswerss = [];
    @track sectionsforpicklist = [];
    @track showquestion = false;
    @track showtablereport = false;
    @track questionsvaluemap = {};
    @track surveyValuesJson = {};
    @track surveyValuesList = [];
    @track currentSurveyValue;
    @track isSubmitted;
    @track nextsection;
    @track sectionValue;
    @track questionresponseafterchange;
    sectionLabel = "All Sections";

    // @track showChatter;
    @track showUpload;
    @track Conversation_History__c;

    @track sample = [];

    handleAnswerSelection(event) {
        this.selectedAnswers[event.target.name] = event.target.value;
    }
    handlegrouptwochange(e) {
        this.groupTwoValues = e.detail.value;
    }
    /* This method is used to get the sectionId selected from parent component*/
    @api
    getSectionId(sectionId) {
        console.log('getSectionId', sectionId);
        this.section = sectionId;
    }
    connectedCallback() {
        this.Rythm__Conversation_History__c = "";
        this.chartData.questionsStatus = [
            { "label": "Answered", "value": 0 },
            { "label": "Unanswered", "value": 0 }
        ];
        this.chartData.sectionwiseStatus = {};
        var assessmentTemplateId;
        if (this.assessment == null || this.assessment == '') {
            this.assessment = this.recordId;
        }
        /*Ths method is to get */
        getSurveyValues({}).then(result => {
            this.surveyValuesJson = result;
            /*This method is used to get all the assessments records*/
            getSupplierAssessmentList({ assessmentId: this.assessment }).then(result => {
                console.log('this.assessment', result);
                assessmentTemplateId = result[0].Rythm__Assessment_Template__c;
                this.showDisclosure = result[0].Rythm__Assessment_Template__r.Rythm__Disclosure__c;
                this.AssessmentName = result[0].Name;
                for (var key in this.surveyValuesJson) {
                    var jsonData = { label: this.surveyValuesJson[key], value: key };
                    this.surveyValuesList.push(jsonData);
                    if (this.surveyValuesJson[key] === result[0].Rythm__Assesment_Status__c) {//Survey_Life_Cycle__c) {
                        this.currentSurveyValue = key;
                    }
                }
                // this.showDisclosure = true;

                if (result[0].Rythm__Assesment_Status__c !== 'Submitted') {
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
                var sectionidslist = [];
                /*This method is used to get all the questions with particular section*/
                getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                    var resultMap = result;
                    console.log('getQuestionsList', resultMap);
                    for (let i = 0; i < resultMap.length; i++) {
                        if (!sectionidslist.includes(resultMap[i].Rythm__Section__r.Id)) {
                            sectionidslist.push(resultMap[i].Rythm__Section__r.Id);
                        }
                        if (resultMap[i].Rythm__Parent_Question__c != null) {

                        }

                    }
                    this.chartData.questionsStatus[1].value = resultMap.length;

                    /* This method is used to get all the responses of the questions in particular section*/
                    getSupplierResponseList({ assessmentId: this.assessment }).then(result => {
                        if (result && result.length > 0 && result[0] && result[0].CreatedBy && result[0].CreatedDate) {
                            this.supplierAssessmentName = result[0].CreatedBy.Name;
                            this.supplierAssCreatedDate = result[0].CreatedDate;
                            //if(datetype){
                            var x = this.supplierAssCreatedDate.split('T')[0];
                            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            this.supplierAssCreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                            console.log('this.supplierAssCreatedDate===>' + this.supplierAssCreatedDate);
                            // }
                        }
                        result.forEach(qres => {

                            this.savedResponseMap.set(qres.Rythm__Question__c, { "Id": qres.Id, "value": qres.Rythm__Response__c, "Flag__c": qres.Rythm__Flag__c, "Conversation_History__c": qres.Rythm__Conversation_History__c });
                            // if (qres.Rythm__Response__c) {
                            //     this.chartData.questionsStatus[0].value += 1;
                            //     this.chartData.questionsStatus[1].value -= 1;
                            // }

                        });
                        //this.questionsAnswered = (this.chartData.questionsStatus[0].value * 100 / this.chartData.questionsStatus[1].value).toString().split('.')[0];
                        this.call = true;
                        console.log('resultMap', resultMap);
                        this.constructMultilevelhierarchy(resultMap, this.savedResponseMap);
                        //this.constructWrapper(resultMap, this.savedResponseMap);
                        var questionsList = [];
                        var totalsections = [];
                        var count = 0;
                        var sectioncount = 0;
                        console.log('questionMap', this.questionMap);
                        for (const seckey of this.questionMap.keys()) {
                            console.log('seckey', seckey);
                            count++;
                            sectioncount += 1;
                            questionsList.push({ "sectionId": sectionidslist[count - 1], "section": seckey, "questions": this.questionMap.get(seckey), "showNext": true, "show": false });
                            totalsections.push({ label: seckey, value: sectioncount });
                        }
                        console.log('questionsList>>>', questionsList);
                        this.sectionsforpicklist = totalsections;
                        //if (questionsList.length > 5)
                        this.activeSection = questionsList[0].section;
                        if (count <= 5) {
                            this.needPagination = false;
                        }
                        else {
                            this.needPagination = true;
                            this.showSummary = true;
                        }
                        var displayQuestionList=[];
                        if (typeof this.section != "undefined") {
                            for (let i = 0; i < questionsList.length; i++) {
                               
                                if (this.section != undefined && questionsList[i].sectionId == this.section) {
                                    for (let j = 0; j < questionsList[i].questions.length; j++) {
                                         console.log('this.childQuestionList', this.childQuestionList);
                                        console.log('questionsList[i].questions[j].Id)',questionsList[i].questions[j].Id);
                                        console.log(this.childQuestionList.includes(questionsList[i].questions[j].Id));
                                        if ((this.childQuestionList.includes(questionsList[i].questions[j].Id))) {
                                             console.log('questionsListinside', questionsList[i].questions[j].Id,'JJJJ',j);
                                            const deletedQues = questionsList[i].questions.splice(j,1);
                                            console.log('deletedQues',deletedQues);
                                            
                                            //displayQuestionList.push(questionsList[i].questions[j]);
                                        }
                                    }
                                    this.questionsAndAnswerss.push(questionsList[i]);
                                }
                            }
                            console.log('displayQuestionList',displayQuestionList);
                            for(let i=0;i<displayQuestionList.length;i++)
                            {
                                this.questionsAndAnswerss.push(displayQuestionList[i]);
                            }
                            if (this.questionsAndAnswerss.length > 0) {
                                if (typeof this.questionsAndAnswerss[0].questions[0] != "undefined" && typeof this.questionsAndAnswerss[0].questions[0].Id != "undefined" && typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id) != "undefined") {
                                    if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rythm__Conversation_History__c != 'undefined') {
                                        this.Rythm__Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[0].questions[0].Id, "chatHistory": (this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rythm__Conversation_History__c ? JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[0].questions[0].Id).Rythm__Conversation_History__c) : '') };
                                    }
                                }
                            }
                        }
                        //this.questionsAndAnswerss = questionsList;

                        console.log('this.questionsAndAnswerss', this.questionsAndAnswerss);
                        console.log('this.questionsvaluemap', this.questionsvaluemap)

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
    onResponseChange(event) {
        console.log(' event.detail', event.detail);
        this.questionresponseafterchange = event.detail;
        console.log(' this.questionresponseafterchange', this.questionresponseafterchange);

    }
    // constructWrapper(questionResp, savedResp) {
    //     var questionMap = new Map();
    //     questionResp.forEach(qu => {
    //         var quTemp = this.getQuestionTemplate();
    //         quTemp.Id = qu.Rythm__Question__c;
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
    //         quTemp.value = savedResp.get(qu.Rythm__Question__c);
    //         this.responseMap.set(qu.Rythm__Question__c, savedResp.get(qu.Rythm__Question__c));
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
            this.Rythm__Conversation_History__c = undefined;
            if (this.questionsAndAnswerss[i]) {
                for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                    if (this.questionsAndAnswerss[i].questions && this.questionsAndAnswerss[i].questions[j].Id.toString() === event.currentTarget.dataset.key.toString()) {
                        qaa_i = i;
                        qaa_j = j;
                        if (typeof this.questionsAndAnswerss[i].questions[j] != "undefined" && typeof this.questionsAndAnswerss[i].questions[j].Id != "undefined" && typeof this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id) != "undefined") {
                            if (typeof this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Rythm__Conversation_History__c != 'undefined') {
                                this.Rythm__Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[i].questions[j].Id, "chatHistory": JSON.parse(this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Rythm__Conversation_History__c) };
                            }
                            else {
                                this.Rythm__Conversation_History__c = { "Id": this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Id, "AssessmentId": this.assessment, "QuestionnaireId": this.questionsAndAnswerss[i].questions[j].Id, "chatHistory": "" };
                            }
                        } break;
                    }
                }
            }

            if (typeof this.Rythm__Conversation_History__c != 'undefined')
                break;
            if (i === this.questionsAndAnswerss.length - 1) {
                this.Rythm__Conversation_History__c = {};
            }
        }
        if (event.target.value.toLowerCase() === 'yes') {
            this.questionsAndAnswerss[qaa_i].questions[qaa_j].showUpload = true;
            // this.Rythm__Conversation_History__c = this.savedResponseMap.get(event.currentTarget.dataset.key).Rythm__Conversation_History__c;
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
        let isAssessmentValidated = false;
        let responseList = [];
        console.log('this.responseMap', this.responseMap);
        for (const seckey of this.responseMap.keys()) {
            let reponse = { 'sobjectType': 'Rythm__Response__c' };
            reponse.Rythm__Assessment__c = this.assessment;

            reponse.Rythm__Question__c = seckey;

            reponse.Rythm__Account__c = this.vendor;

            reponse.Rythm__Response__c = this.responseMap.get(seckey);

            if (this.requiredQuestionList.includes(reponse.Rythm__Question__c) && (reponse.Rythm__Response__c == '')) {
                // let index = this.requiredQuestionList.indexOf(reponse.Rythm__Question__c);

                // this.requiredQuestionList.splice(index,1);
                isAssessmentValidated = true;
                break;

            }
            responseList.push(reponse);
        }
        if (isAssessmentValidated == false) {
            this.showToast = true;
            this.success = true;
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
    closeToastHandler(event) {
        console.log('In Disptch event');
        this.showToast = event.detail.showModal;
    }

    constructWrapperConditionalQuestion(qu, savedResp) {
        console.log('constructWrapperConditionalQuestion qu', qu);
        var quTemp = this.getQuestionTemplate();
        quTemp.Id = qu.Id;
        if (qu['Rythm__HelpText__c'] != 'undefined') {
            console.log('qu[Rythm__HelpText__c]', qu['Rythm__HelpText__c']);
            quTemp.helptext = qu.Rythm__HelpText__c;
        }
        quTemp.question = qu.Rythm__Question__c;
        //quTemp.ParentQuestion = qu.Rythm__Parent_Question__c;
        var qtype = qu.Rythm__Question_Type__c;
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
        quTemp.required = qu.Rythm__Required__c;
        quTemp.parentQuestionId = qu.Rythm__Parent_Question__c;
          if(qu.Rythm__Responses__r !=null)
          {
               quTemp.Rythm__Flag__c = qu.Rythm__Responses__r[0].Rythm__Flag__c;
     
          }
          else{
               quTemp.Rythm__Flag__c=false;
          }
        if (qu.Rythm__Required__c == true) {
            this.requiredQuestionList.push(qu.Id);
        }
        quTemp.conditional = qu.Rythm__Conditional_Response__c == null ? '' : qu.Rythm__Conditional_Response__c;
        quTemp.optionsValueSet = qu.Rythm__OptionValueSet__c;

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
        if (typeof savedResp.get(qu.Rythm__Question__c) != "undefined" && typeof savedResp.get(qu.Rythm__Question__c).value != "undefined")
            quTemp.value = savedResp.get(qu.Rythm__Question__c).value;
        else
            quTemp.value = undefined;
        // if (typeof savedResp.get(qu.Rythm__Question__c) != "undefined" && typeof savedResp.get(qu.Rythm__Question__c).Flag__c != "undefined")
        //     quTemp.Rythm__Flag__c = savedResp.get(qu.Rythm__Question__c).Flag__c;
        // else
        //     quTemp.Rythm__Flag__c = false;
        if (typeof savedResp.get(qu.Rythm__Question__c) != "undefined" && typeof savedResp.get(qu.Rythm__Question__c).Rythm__Conversation_History__c != "undefined")
            quTemp.Rythm__Conversation_History__c = savedResp.get(qu.Rythm__Question__c).Rythm__Conversation_History__c;
        else
            quTemp.Rythm__Conversation_History__c = [];
        quTemp.showUpload = false;
        if (typeof savedResp.get(qu.Rythm__Question__c) != "undefined" && typeof savedResp.get(qu.Rythm__Question__c).value != "undefined")
            this.responseMap.set(qu.Rythm__Question__c, savedResp.get(qu.Rythm__Question__c).value);
        quTemp.Children = [];
        if (this.questionMap.has(qu.Rythm__Section__r.Name)) {
            this.questionMap.get(qu.Rythm__Section__r.Name).push(quTemp);
        } else {
            var quesList = [];
            quesList.push(quTemp);
            this.questionMap.set(qu.Rythm__Section__r.Name, quesList);
        }
        return quTemp;
    }



    constructMultilevelhierarchy(queryResults, savedResp) {
        const children = queryResults.filter(result => typeof result['Rythm__Parent_Question__c'] != 'undefined');
        console.log('topLevelParents', children);
        children.forEach(child => {
            const hierarchyObj = this.constructWrapperConditionalQuestion(child, savedResp);
            // Call recursive function to create nested children objects
            this.createChildHierarchy(queryResults, hierarchyObj, savedResp);
            this.hierarchy.push(hierarchyObj);
        });
    }

    createChildHierarchy(queryResults, childObj, savedResp) {
        console.log('createChildHierarchy queryResults', queryResults);
        console.log('createChildHierarchy parentObj', childObj);
        const parent = queryResults.filter(result =>
            result.Id === childObj.parentQuestionId);
        if (parent.length > 0) 
        {
            parent.forEach(parentdata => {
                const parentObj = this.constructWrapperConditionalQuestion(parentdata, savedResp);
                console.log('parentObj', parentObj);
                this.createChildHierarchy(queryResults, parentObj, savedResp);
                console.log('childObj', childObj);
                var x = childObj.conditional;
                this.childQuestionList.push(childObj.Id);
                if (parentObj.value == childObj.conditional) {
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    //var mp ={};
                    childObj.isdisplay = true;
                    //mp[x] = childObj;
                    parentObj['Children'].push(childObj);
                }
                else {

                    // var mp ={};
                    let key = parentObj.question + '-' + parentObj.value;
                    this.questionsvaluemap[key] = childObj;
                    childObj.isdisplay = false;
                    //mp['other'] = childObj;
                    parentObj['Children'].push(childObj);
                }
                
            });
            console.log('this.questionsvaluemap', this.questionsvaluemap);

            // if(parentObj.Children.length>0)
            // {
            //     console.log('parentObj>>>>>',parentObj.Children.length);

            // }
        }

    }
    nextSectionHandler() {
        if (this.showSummary === true) {
            this.showSummary = false;
            this.questionsAndAnswerss[0].show = true;
        }
        else {

            for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
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
    openChatHandler(event) {
        if (this.openChat == false) {
            this.openChat = true;

        }
        else {
            this.openChat = false;
        }
        const selectedEvent = new CustomEvent("openchathistory", {
            detail: this.openChat
        });

        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
    prevSectionHandler() {
        for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
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
        console.log(this.Rythm__Conversation_History__c.Id + ' : ' + this.newChat + ' : ' + this.Rythm__Conversation_History__c.AssessmentId);
        if (this.newChat && this.newChat.toString().length > 0) {
            createChatterItem({ responseId: this.Rythm__Conversation_History__c.Id, source: "Customer", subject: this.newChat, assId: this.Rythm__Conversation_History__c.AssessmentId, qId: this.Rythm__Conversation_History__c.QuestionnaireId }).then(result => {

                var x = JSON.parse(JSON.stringify(result));
                this.Rythm__Conversation_History__c.chatHistory = JSON.parse(x[0].Rythm__Conversation_History__c);
                for (var i = 0; i < this.questionsAndAnswerss.length; i++) {
                    if (this.questionsAndAnswerss[i]) {
                        for (var j = 0; j < this.questionsAndAnswerss[i].questions.length; j++) {
                            if (this.questionsAndAnswerss[i].questions && this.questionsAndAnswerss[i].questions[j].Id.toString() === this.Rythm__Conversation_History__c.QuestionnaireId) {
                                this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Rythm__Conversation_History__c = JSON.stringify(this.Rythm__Conversation_History__c.chatHistory);
                                console.log(this.savedResponseMap.get(this.questionsAndAnswerss[i].questions[j].Id).Rythm__Conversation_History__c);
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