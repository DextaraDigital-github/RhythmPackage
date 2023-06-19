/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/
import { LightningElement, track, api } from 'lwc';
import getAssessmentStatus from '@salesforce/apex/AssessmentController.getAssessmentStatus';
import getAccountAssessmentRecordData from '@salesforce/apex/AssessmentController.getAccountAssessmentRecordData';
import getAssesmentRecords from '@salesforce/apex/AssessmentController.getAssesmentRecords';
import getUserName from '@salesforce/apex/AssessmentController.getUserName';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';

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
    connectedCallback() {
        this.customerId = this.recordId;
        this.showconverstion = true;
        /* To get the username */
        getUserName({}).then(result => {
            this.userName = result;
            /* To get the assessment startdata, enddate and status */
            console.log('this.recordID', this.recordId);
            if(this.recordId==null || typeof this.recordId=='undefined')
            {
                getAssesmentRecords({}).then(result => {
                for (var j = 0; j < result.length; j++) {
                    if (result[j].Id == this.assessmentid) {
                        this.statusassessment = result[j].Rhythm__Status__c;
                        if (this.statusassessment == 'Submitted' || this.statusassessment == 'Open' || this.statusassessment == 'Completed' || this.statusassessment == 'Closed') {
                            this.showstatus = true;
                        }
                        this.assessmentName = result[j].Name;
                        if (typeof result[j].Rhythm__Start_Date__c != 'undefined') {
                            var statustrack = {};
                            var dateformat = result[j].Rhythm__Start_Date__c;
                            var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                            statustrack['date'] = dateformats + ' ' + '00:00:00';
                            statustrack['status'] = 'Start Date';
                            statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                            statustrack['name'] = this.userName;
                            this.assessmentTimeline.push(statustrack);
                        }
                        else {
                            var statustrack = {};
                            var date = result[j].CreatedDate.split('T');
                            var time = date[1].split('.');
                            var dateformat = date[0];
                            var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                            statustrack['date'] = dateformats + ' ' + time[0];
                            statustrack['status'] = 'Start Date';
                            statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                            statustrack['name'] = this.userName;
                            this.assessmentTimeline.push(statustrack);
                        }
                        if (typeof result[j].Rhythm__End_Date__c != 'undefined') {
                            var statustrack = {};
                            var dateformat = result[j].Rhythm__End_Date__c;
                            var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                            statustrack['date'] = '(Due date ' + dateformats + ')';
                            this.endDate = statustrack['date'];
                            statustrack['status'] = 'End Date';
                            statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                            statustrack['name'] = this.userName;
                            this.assessmentTimeline.push(statustrack);
                        }
                    }
                }
                /* To get the assessment tracking history to update on timeline*/
                getAssessmentStatus({ assessmentId: this.assessmentid }).then(result => {
                    var assessmentStatus = result;
                    if (typeof result != 'undefined') {
                        var oldvaluelst = [];
                        for (var i = 0; i < assessmentStatus.length; i++) {
                            if (typeof assessmentStatus[i].OldValue != 'undefined') {
                                oldvaluelst.push(assessmentStatus[i].OldValue);
                            }
                        }
                        for (var i = 0; i < assessmentStatus.length; i++) {
                            var statustrack = {};
                            if (typeof assessmentStatus[i].NewValue != 'undefined') {
                                var date = assessmentStatus[i].CreatedDate.split('T');
                                var dateformat = date[0];
                                var time = date[1].split('.');
                                var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                statustrack['date'] = dateformats + ' ' + time[0];
                                statustrack['status'] = assessmentStatus[i].NewValue;
                                switch (assessmentStatus[i].NewValue) {
                                    case "New": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited'; break;
                                    case "Submitted": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                    case "Draft": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending'; break;
                                    case "Open": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default'; break;
                                    case "Completed": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_needmoreinfo'; break;
                                    case "Closed": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_approved'; break;
                                }
                                statustrack['name'] = this.userName;
                                this.assessmentTimeline.push(statustrack);
                            }
                        }
                        var relocate = this.assessmentTimeline.splice(0, 1);
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
            }
            else
            {
                getAccountAssessmentRecordData({ assrecordId: this.recordId }).then(result => {
                console.log('getAccountAssessmentRecordData result',result);
                this.assessmentid = result[0].Rhythm__Assessment__r.Id;
                for (var j = 0; j < result.length; j++) {
                    console.log('Executing for 1',this.assessmentid);
                    if (typeof result[j].Rhythm__Assessment__r != 'undefined' && typeof result[j].Rhythm__Assessment__r.Id != 'undefined') {
                        if (result[j].Rhythm__Assessment__r.Id == this.assessmentid) {
                            if (typeof result[j].Rhythm__Assessment__r.Rhythm__Status__c != 'undefined') {

                                this.statusassessment = result[j].Rhythm__Assessment__r.Rhythm__Status__c;
                                if (this.statusassessment == 'Submitted' || this.statusassessment == 'Open' || this.statusassessment == 'Completed' || this.statusassessment == 'Closed') {
                                    this.showstatus = true;
                                }
                                this.assessmentName = result[j].Rhythm__Assessment__r.Name;
                                if (typeof result[j].Rhythm__Assessment__r.Rhythm__Start_Date__c != 'undefined') {
                                    var statustrack = {};
                                    var dateformat = result[j].Rhythm__Assessment__r.Rhythm__Start_Date__c;
                                    var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                    statustrack['date'] = dateformats + ' ' + '00:00:00';
                                    statustrack['status'] = 'Start Date';
                                    statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                    statustrack['name'] = this.userName;
                                    this.assessmentTimeline.push(statustrack);
                                }
                                else {
                                    var statustrack = {};
                                    if(typeof result[j].Rhythm__Assessment__r.CreatedDate!='undefined')
                                    {
                                        var date = result[j].Rhythm__Assessment__r.CreatedDate.split('T');
                                        var time = date[1].split('.');
                                        var dateformat = date[0];
                                        var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                        statustrack['date'] = dateformats + ' ' + time[0];
                                        statustrack['status'] = 'Start Date';
                                        statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                        statustrack['name'] = this.userName;
                                        this.assessmentTimeline.push(statustrack);
                                    }
                                    
                                }
                                if (typeof result[j].Rhythm__Assessment__r.Rhythm__End_Date__c != 'undefined') {
                                    var statustrack = {};
                                    var dateformat = result[j].Rhythm__Assessment__r.Rhythm__End_Date__c;
                                    var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                    statustrack['date'] = '(Due date ' + dateformats + ')';
                                    this.endDate = statustrack['date'];
                                    statustrack['status'] = 'End Date';
                                    statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                    statustrack['name'] = this.userName;
                                    this.assessmentTimeline.push(statustrack);
                                }
                            }
                        }
                    }
                    console.log('Executing for');
                }
                /* To get the assessment tracking history to update on timeline*/
                getAssessmentStatus({ assessmentId: this.assessmentid }).then(result => {
                    var assessmentStatus = result;
                    if (typeof result != 'undefined') {
                        var oldvaluelst = [];
                        for (var i = 0; i < assessmentStatus.length; i++) {
                            if (typeof assessmentStatus[i].OldValue != 'undefined') {
                                oldvaluelst.push(assessmentStatus[i].OldValue);
                            }
                        }
                        for (var i = 0; i < assessmentStatus.length; i++) {
                            var statustrack = {};
                            if (typeof assessmentStatus[i].NewValue != 'undefined') {
                                var date = assessmentStatus[i].CreatedDate.split('T');
                                var dateformat = date[0];
                                var time = date[1].split('.');
                                var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                statustrack['date'] = dateformats + ' ' + time[0];
                                statustrack['status'] = assessmentStatus[i].NewValue;
                                switch (assessmentStatus[i].NewValue) {
                                    case "New": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited'; break;
                                    case "Submitted": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                    case "Draft": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending'; break;
                                    case "Open": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default'; break;
                                    case "Completed": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_needmoreinfo'; break;
                                    case "Closed": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_approved'; break;
                                }
                                statustrack['name'] = this.userName;
                                this.assessmentTimeline.push(statustrack);
                            }
                        }
                        var relocate = this.assessmentTimeline.splice(0, 1);
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
            }
        });
    }

    /*To display only the flagged questions(flag colour- green) or all questions(flag colour- red) by clicking on flag */
    handleChange(event) {
        var dataId = event.currentTarget.dataset.id;
        this.showflagquestions = !this.showflagquestions;
        if (dataId == 'showlowerflag') {
            this.template.querySelector('c-Questionnaire').handleFilterFlag(true);
        }
        if (dataId == 'showpriorityflag') {
            this.template.querySelector('c-Questionnaire').handleFilterFlag(false);
        }


    }

    /*handleLeftButtonClick used to display records on page1*/
    handleLeftButtonClick(event) {
        var cadtype = this.template.querySelector('[data-id="cadtype"]');
        cadtype.classList.toggle('cadshowleft');
    }

    /*handleLeftButtonClick used to display records on next page*/
    handleRightButtonClick(event) {
        var cadtype = this.template.querySelector('[data-id="caddisc"]');
        cadtype.classList.toggle('cadshowright');
    }

    /* showQuestionnaire is used to get section id and send it to the child component*/
    showQuestionnaire(event) {
        if (event.detail.sectionId != null || event.detail.sectionId != undefined) {
            this.sectionid = event.detail.sectionId;
            this.showSections = false;
            this.showFlag = false;
        }
    }
    /* chatHistory is used to get the question id, assessment id and flag boolean from the child component (Questionnaire) and pass it to the child component(AssessmentChatter)*/
    chatHistory(event) {
        this.showChat = event.detail;
        this.showData = this.showChat.openChat;
        this.showconverstion = this.showChat.disableSendButton;
    }

    showsummaryHandler(event) {
        this.showSections = true;
    }
    /* handleChat is used to assign the chat history to the main wrapper in the questionnaire */
    handleChat(event) {
        this.chatterData = event.detail;
        this.template.querySelector('c-Questionnaire').handleConversationData(this.chatterData);

    }
}