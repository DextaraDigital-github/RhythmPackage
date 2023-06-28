/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/
import { LightningElement, track, api } from 'lwc';
import getAssessmentStatus from '@salesforce/apex/AssessmentController.getAssessmentStatus';
import getAccountAssessmentRecordData from '@salesforce/apex/AssessmentController.getAccountAssessmentRecordData';
import getUserName from '@salesforce/apex/AssessmentController.getUserName';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList'; //To fetch all the Questions from the Assessment_Template__c Id from the Supplier_Assessment__c record
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList'; //To fetch all the Supplier_Response__c records related to the Supplier_Assessment__c record
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList'; //To fetch the Assessment_Template__c Id from the Supplier_Assessment__c record

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export default class RtmvpcAssessmentDetail extends LightningElement {
    @track sectionid;
    @api accountid;
    @api assessmentid;
    @api recordId;
    @api objectApiName;
    @track showflagquestions = true;
    @track userName;
    @track showSections;
    @track showFlag = false;
    @track showChat;
    @track endDate;
    @track showconverstion;
    @track showData;
    @track assessmentTimeline = [];
    @track assessmentName;
    @track showstatus;
    @track chatterData;
    @track filterflag = false;
    @track customerId;
    @track isRecordPage;
    @track showExpand = true;
    @track finalSection;
    @track assaccId;
    @track accountassessmentrelId;
    @track accountAssessmentStatus;
    @api accountassessmentid;
    @track savedResponseMap = new Map();


    connectedCallback() {
        this.customerId = this.recordId;
        this.showconverstion = false;
        this.assaccId = this.accountid;
        /* To get the username */
        this.handleTimeLine();
    }

    handleAccordian(event) {
        this.template.querySelector('c-Questionnaire').handleCollapseExpand(event.currentTarget.dataset.id);
    }

    handleExpandCollapse() {
        this.showExpand = !(this.showExpand);
    }

    handleTimeLine() {
        this.assessmentTimeline = [];
        let accountAssessmentRecord = ''
        getUserName({}).then(result => {
            this.isRecordPage = false;
            this.userName = result;
            /* To get the assessment startdata, enddate and status */
            if (this.recordId === null || typeof this.recordId === 'undefined') {
                accountAssessmentRecord = this.accountassessmentid;
            }
            else {
                this.isRecordPage = true;
                accountAssessmentRecord = this.recordId;
            }
            /* */
            getAccountAssessmentRecordData({ assrecordId: accountAssessmentRecord }).then(asmtResult => {
                    if(this.isRecordPage){
                        this.assessid = asmtResult[0].Rhythm__Assessment__r.Id;
                    }else{
                        this.assesstid = this.accountassessmentid ;
                    }
                    if(asmtResult && asmtResult.length > 0){
                        asmtResult.forEach(accAssessment => {
                            if (typeof accAssessment.Rhythm__Assessment__c !== 'undefined' && typeof accAssessment.Rhythm__Assessment__r.Id !== 'undefined') {
                                //if (accAssessment.Rhythm__Assessment__r.Id === this.assessid) {
                                    if (typeof accAssessment.Rhythm__Status__c !== 'undefined') {
                                        this.statusassessment = accAssessment.Rhythm__Status__c;
                                        this.accountAssessmentStatus = this.statusassessment;
                                        if (this.statusassessment === 'Submitted' || this.statusassessment === 'Open' || this.statusassessment === 'Completed' || this.statusassessment === 'Closed') {
                                            this.showstatus = true;
                                        }
                                        this.assessmentName = accAssessment.Rhythm__Assessment__r.Name;
                                        if (typeof accAssessment.Rhythm__Start_Date__c !== 'undefined') {
                                            let statustrack = {};
                                            let dateformat = accAssessment.Rhythm__Start_Date__c;
                                            let dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                            statustrack.date = dateformats + ' 00:00:00';
                                            statustrack.status = 'Start Date';
                                            statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                            statustrack.name = accAssessment.Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                                            this.assessmentTimeline.push(statustrack);
                                        }
                                        else {
                                            let statustrack = {};
                                            if (typeof accAssessment.CreatedDate !== 'undefined') {
                                                let date = accAssessment.Rhythm__Assessment__r.CreatedDate.split('T');
                                                let time = date[1].split('.');
                                                let dateformat = date[0];
                                                let dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                                statustrack.date = dateformats + ' ' + time[0];
                                                statustrack.status = 'Start Date';
                                                statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                                statustrack.name = accAssessment.Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                                                this.assessmentTimeline.push(statustrack);
                                            }

                                        }
                                        if (typeof accAssessment.Rhythm__End_Date__c !== 'undefined') {
                                            let statustrack = {};
                                            let dateformat = accAssessment.Rhythm__End_Date__c;
                                            let dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                            statustrack.date = '(Due date ' + dateformats + ')';
                                            this.endDate = statustrack.date;
                                            statustrack.status = 'End Date';
                                            statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                            statustrack.name = accAssessment.Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                                            this.assessmentTimeline.push(statustrack);
                                        }
                                    }
                                }
                        // }
                        })
                    }

                    /* To get the assessment tracking history to update on timeline*/
                    getAssessmentStatus({ assessmentId: accountAssessmentRecord }).then(statusResult => {
                        var assessmentStatus = statusResult;
                        if (typeof statusResult !== 'undefined') {   
                            let oldvaluelst = [];
                            if(assessmentStatus  && assessmentStatus!==null){
                            assessmentStatus.forEach(assessStatus => {
                                if (typeof assessStatus.OldValue !== 'undefined') {
                                    oldvaluelst.push(assessStatus.OldValue);
                                }
                                let statustrack = {};
                                if (typeof assessStatus.NewValue !== 'undefined') {
                                    let date = assessStatus.CreatedDate.split('T');
                                    let dateformat = date[0];
                                    let time = date[1].split('.');
                                    let dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                    statustrack.date = dateformats + ' ' + time[0];
                                    statustrack.status = assessStatus.NewValue;
                                    switch (assessStatus.NewValue) {
                                        case "New": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                        case "In progress": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_pending'; break;
                                        case "Submitted": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                        case "In review": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending'; break;
                                        case "Accepted": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                        case "Need more information": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_rejected'; break;
                                        case "Review Completed": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_reviewcompleted'; break;
                                        default : console.log('default');
                                    }
                                    // if (typeof assessStatus.CreatedBy.Name !== 'undefined') {
                                    //    // statustrack.name = assessStatus.CreatedBy.Name;
                                    // }
                                    this.assessmentTimeline.push(statustrack);
                                }
                            })
                        }
                        }
                        if (this.assessmentTimeline.length > 1) {
                            let relocate = this.assessmentTimeline.splice(0, 1);
                            this.assessmentTimeline.push(relocate[0]);
                        }
                        this.showSections = true;
                    }).catch(error => {
                        errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'getChatterResponse', className: 'AssessmentController', errorData: error.message }).then((result) => {
                        });
                    });

            }).catch(error => {
                errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'getChatterResponse', className: 'AssessmentController', errorData: error.message }).then((result) => {
                });
            });
        });

        console.log('Into assessment detail time line handler');
    }
    /*To display only the flagged questions(flag colour- green) or all questions(flag colour- red) by clicking on flag */
    handleChange(event) {
        var dataId = event.currentTarget.dataset.id;
        this.showflagquestions = !this.showflagquestions;
        let isLowerFlag = false;
        if (dataId === 'showlowerflag') {
            isLowerFlag = true;
        }
        if (dataId === 'showpriorityflag') {
            isLowerFlag = false;
        }
        this.template.querySelector('c-Questionnaire').handleFilterFlag(isLowerFlag);

    }

    /*handleLeftButtonClick used to display records on page1*/
    handleLeftButtonClick() {
        var cadtype = this.template.querySelector('[data-id="cadtype"]');
        cadtype.classList.toggle('cadshowleft');
    }

    /*handleLeftButtonClick used to display records on next page*/
    handleRightButtonClick() {
        var cadtype = this.template.querySelector('[data-id="caddisc"]');
        cadtype.classList.toggle('cadshowright');
    }

    /* showQuestionnaire is used to get section id and send it to the child component*/
    showQuestionnaire(event) {
        if (event.detail.sectionId !== null && event.detail.sectionId !== undefined) {
            this.sectionid = event.detail.sectionId;
            this.showSections = false;
            this.showFlag = false;
        }
    }
    /* chatHistory is used to get the question id, assessment id and flag boolean from the child component (Questionnaire) and pass it to the child component(AssessmentChatter)*/
    chatHistory(event) {
        this.showChat = JSON.parse(JSON.stringify(event.detail));
        this.showChat.accountassessmentId = this.accountassessmentid;
        this.showData = this.showChat.openChat;
        this.showconverstion = this.showChat.disableSendButton;
        this.template.querySelector('c-rtmvpc-assessment-chatter').displayConversation(this.showChat);
    }

    showsummaryHandler() {
        this.showSections = true;
    }
    /* handleChat is used to assign the chat history to the main wrapper in the questionnaire */
    handleChat(event) {
        this.chatterData = event.detail;
        this.template.querySelector('c-Questionnaire').handleConversationData(this.chatterData);

    }

    handleExportCSV() {
        getSupplierAssessmentList({ assessmentId: this.accountassessmentid }).then(resultData => {
            var assessmentTemplateId = resultData[0].Rhythm__Assessment__r.Rhythm__Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: this.accountassessmentid }).then(suppResult => {
                    suppResult.forEach(qres => {
                        var savedResponseList = new Map();
                        savedResponseList.set('value', qres.Rhythm__Response__c);
                        if (('Rhythm__Conversation_History__c' in qres)) {
                            savedResponseList.set('history', (qres.Rhythm__Conversation_History__c));
                        }
                        if (('Rhythm__Files__c' in qres)) {
                            savedResponseList.set('files', (qres.Rhythm__Files__c));
                        }
                        this.savedResponseMap.set(qres.Rhythm__Question__c, savedResponseList);
                    });
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                    let str = 'Section,Question,Answer,ConversationHistory,NumberOfAttachments\n';
                    for (const key of this.finalSection.keys()) {
                        for (let i = 0; i < this.finalSection.get(key).length; i++) {
                            if (typeof this.finalSection.get(key)[i].conversationHistory !== "undefined") {
                                let tempstr = '';
                                for (let j = 0; j < JSON.parse(this.finalSection.get(key)[i].conversationHistory).length; j++) {
                                    tempstr = tempstr + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Name + ':' + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Text + '\n';
                                }
                                this.finalSection.get(key)[i].conversationHistory = tempstr;
                            }
                            if (typeof this.finalSection.get(key)[i].files !== "undefined") {
                                this.finalSection.get(key)[i].files = JSON.parse(this.finalSection.get(key)[i].files).length;
                            }
                            str += '"' + key + '","' + (i + 1) + '. ' + this.finalSection.get(key)[i].question + '","' + this.finalSection.get(key)[i].value + '","' + this.finalSection.get(key)[i].conversationHistory + '","' + this.finalSection.get(key)[i].files + '"\n';
                        }
                        str += '\n';
                    }
                    str = str.replaceAll('undefined', '').replaceAll('null', '');
                    let blob = new Blob([str], { type: 'text/plain' });
                    let url = window.URL.createObjectURL(blob);
                    let atag = document.createElement('a');
                    atag.setAttribute('href', url);
                    atag.setAttribute('download', resultData[0].Rhythm__Assessment__r.Name + '.csv');
                    atag.click();
                }).catch(error => {
                    errorLogRecord({ componentName: 'CustomTable', methodName: 'getSupplierResponseList', className: 'AssessmentController', errorData: error.message }).then(() => {
                    });
                })

            }).catch(error => {
                errorLogRecord({ componentName: 'CustomTable', methodName: 'getQuestionsList', className: 'AssessmentController', errorData: error.message }).then(() => {
                });
            })
        }).catch(error => {
            errorLogRecord({ componentName: 'CustomTable', methodName: 'getSupplierAssessmentList', className: 'AssessmentController', errorData: error.message }).then(() => {
            });
        })
    }


    constructWrapper(questionResp, savedResp) {
        var questionMap = new Map();
        questionResp.forEach(qu => {
            var quTemp = {};
            quTemp.questionId = qu.Id;
            quTemp.question = qu.Rhythm__Question__c;
            if (qu.Rhythm__Required__c === true) {
                quTemp.question = qu.Rhythm__Question__c + '*';
            }
            if (questionMap.has(qu.Rhythm__Section__r.Name)) {
                questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                questionMap.set(qu.Rhythm__Section__r.Name, [quTemp]);
            }
            if (typeof (savedResp.get(quTemp.questionId)) !== 'undefined' 
                && savedResp.get(quTemp.questionId).conversationHistory === 'undefined') {
                quTemp.value = savedResp.get(quTemp.questionId).get('value');
            }
            else if (typeof (savedResp.get(quTemp.questionId)) !== 'undefined') {
                quTemp.value = savedResp.get(quTemp.questionId).get('value');
                quTemp.conversationHistory = savedResp.get(quTemp.questionId).get('history');
                quTemp.files = savedResp.get(quTemp.questionId).get('files');
            }

        });
        return questionMap;
    }

    handleExportPDF() {
        let pageurl = window.location.href;
        if(typeof this.recordId!='undefined'){
            let baseurl = pageurl.split('.com')[0] +'.com/apex/RenderAsPdf?id='+this.recordId;
            window.open(baseurl);
        }else{
            let baseurl = pageurl.split('.com')[0] +'.com/apex/RenderAsPdf?id='+this.accountassessmentid;
            window.open(baseurl);
        }
    }

    handleupdatetimeline() {
        this.handleTimeLine();
    }
}