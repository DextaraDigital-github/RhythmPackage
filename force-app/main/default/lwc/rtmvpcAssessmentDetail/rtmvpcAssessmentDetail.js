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
import getPdfContent from '@salesforce/apex/AssessmentController.getPdfContent';
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
    @api templateId;
    @track savedResponseMap = new Map();
    @track showdownloadIcon;
    @track tempId;
    @api detaileddata;
    @track showrejectquestions = true;
    @track showResponseForm;
    @track showCapaForm = false;
    @track showResponseForm;
    @track showCapaForm = false;
    @track openReviewComments = false;
    @track actionData;
    @track fileData;
    @track selectedchatData;
    @track accountassessmentFileId;
    @track questionId;
    @track recid;
    @track responseId;
    @track showUpload = false;
    @track isdisabled = false;
    @track objectApiName;
    @track openRightFile = false;

    connectedCallback() {
        this.customerId = this.recordId;
        this.showconverstion = false;
        this.assaccId = this.accountid;
        if (this.templateId != undefined) {
            this.tempId = this.templateId;
        }
        console.log('detaileddata------>', this.detaileddata);
        console.log('assaccId------>', this.assaccId);
        console.log('TADId------>', this.tempId);
        /* To get the username */
        this.handleTimeLine();
    }
    handleDeleteIcon(event) {
        this.template.querySelectorAll('c-Questionnaire')[0].removeDeleteButton(event.detail);
    }

    handleAccordian(event) {
        this.template.querySelector('c-Questionnaire').handleCollapseExpand(event.currentTarget.dataset.id);
    }

    handleExpandCollapse() {
        this.showExpand = !(this.showExpand);
    }

    handleTimeLine() {
        console.log('this.assessmentTimeline',this.assessmentTimeline);
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
                if (this.isRecordPage) {
                    this.assessid = asmtResult[0].Rhythm__Assessment__r.Id;
                } else {
                    this.assesstid = this.accountassessmentid;
                }
                if (asmtResult && asmtResult.length > 0) {
                    asmtResult.forEach(accAssessment => {
                        if (typeof accAssessment.Rhythm__Assessment__c !== 'undefined' && typeof accAssessment.Rhythm__Assessment__r.Id !== 'undefined') {
                            //if (accAssessment.Rhythm__Assessment__r.Id === this.assessid) {
                            if (typeof accAssessment.Rhythm__Status__c !== 'undefined') {
                                this.statusassessment = accAssessment.Rhythm__Status__c;
                                this.accountAssessmentStatus = this.statusassessment;
                                // if (this.statusassessment === 'Need More Information' || this.statusassessment === 'Review Completed') {
                                //     this.showstatus = true;
                                // }
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
                                    //this.assessmentTimeline.push(statustrack);
                                }
                            }
                        }
                        // }
                    })
                }
                /* To get the assessment tracking history to update on timeline*/
                getAssessmentStatus({ assessmentId: accountAssessmentRecord, objectName: 'AccountAssessmentRelation__c' }).then(statusResult => {
                    var assessmentStatus = statusResult;
                    if (typeof statusResult !== 'undefined') {
                        if (assessmentStatus && assessmentStatus !== null) {
                            assessmentStatus.forEach(assessStatus => {
                                if (assessStatus.Rhythm__Object_Field_Name__c === 'Rhythm__Status__c') {
                                    let statustrack = {};
                                    if (typeof assessStatus.Rhythm__Object_Field_Value__c !== 'undefined') {
                                        let date = assessStatus.CreatedDate.split('T');
                                        let dateformat = date[0];
                                        let time = date[1].split('.');
                                        let dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                        statustrack.date = dateformats + ' ' + time[0];
                                        statustrack.status = assessStatus.Rhythm__Object_Field_Value__c;

                                        switch (assessStatus.Rhythm__Object_Field_Value__c) {
                                            case "New": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                            case "In Progress": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_pending'; break;
                                            case "Submitted": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                            case "In Review": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending'; break;
                                            case "Accepted": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_submited'; break;
                                            case "Need More Information": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_rejected'; break;
                                            case "Cancel": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_rejected'; break;
                                            case "Review Completed": statustrack.classlist = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_reviewcompleted'; break;
                                            default: console.log('default');
                                        }
                                        if (typeof assessStatus.Rhythm__Activity_User__c !== 'undefined') {
                                            statustrack.name = assessStatus.Rhythm__Activity_User__c;
                                            statustrack.id = assessStatus.Rhythm__ActivityUserId__c;
                                        }
                                        this.assessmentTimeline.push(statustrack);
                                    }
                                }
                            })
                            if (this.accountAssessmentStatus === 'Need More Information') {
                                this.showflagquestions = false;
                            }
                            if (this.accountAssessmentStatus !== 'New') {
                                this.showdownloadIcon = true;
                            }
                            if (this.assessmentTimeline.length > 1) {
                                let relocate = this.assessmentTimeline.splice(0, 1);
                                this.assessmentTimeline.push(relocate[0]);
                            }
                            this.showSections = true;
                            this.handleFilter();
                        }
                    }
                }).catch(error => {
                    errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'getChatterResponse', className: 'AssessmentController', errorData: error.message }).then(() => {
                    });
                });

            }).catch(error => {
                errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'getChatterResponse', className: 'AssessmentController', errorData: error.message }).then(() => {
                });
            });
        });


    }
     handleResponse(event)
    {
        let response=event.detail;
        console.log('sampledata');
        this.template.querySelector('c-Questionnaire').handleChatResponse(response);
    }
    handleDeleteFile(event)
    {
        console.log('handleDeleteFile');
        let mp = event.detail;
        console.log('handleDeleteFile');
        this.template.querySelector('c-Questionnaire').handleDeleteFile(mp);
    }
    handleFilter() {
        if (this.objectApiName === 'Rhythm__AccountAssessmentRelation__c') {
            this.assessmentTimeline.forEach(res => {
                if (res.status === 'In Review') {
                    this.showstatus = true;
                }
            })
        }
        else {
            this.assessmentTimeline.forEach(res => {
                if (res.status === 'Need More Information') {
                    this.showstatus = true;
                }
            })
        }
        setTimeout(()=>{
             console.log(' this.template',this.template.querySelectorAll('c-Questionnaire')[0]);
            this.template.querySelectorAll('c-Questionnaire')[0].gethandleTimeline(this.assessmentTimeline);
        },400);
       
    }
    /*To display only the flagged questions(flag colour- green) or all questions(flag colour- red) by clicking on flag */
    handleChange(event) {
        var dataId = event.currentTarget.dataset.id;
        this.showflagquestions = !this.showflagquestions;
        let isLowerFlag = false;
        if (dataId === 'showlowerflag') {
            isLowerFlag = true;
        }
        if (dataId === 'All') {
            isLowerFlag = false;
        }
        this.template.querySelector('c-Questionnaire').handleFilterFlag(isLowerFlag);

    }
    handleRejectChange() {

        this.template.querySelector('c-Questionnaire').handleFilterRejected();

    }
    handleAction(event) {
        console.log('hhh', event.detail);
        this.showResponseForm = event.detail.action;
        this.showCapaForm = this.showResponseForm[0].showCapaForm;
        this.openReviewComments = false;
        this.selectedchatData = event.detail.chat;
        console.log('sample', this.showResponseForm, this.openReviewComments);
        this.assessmentTimeline.forEach(res => {
            if (res.status === 'In Review') {
                this.showResponseForm[0].ownershipId = res.id;
                this.showResponseForm[0].ownershipName = res.name;
            }
            else if (res.status === 'Submitted') {
                this.showResponseForm[0].assignedToId = res.id;
                this.showResponseForm[0].assignedToName = res.name;
            }
        })
        setTimeout(() => {
            this.template.querySelectorAll('c-action')[0].displayForm(this.showResponseForm);
        }, 500);

    }
    // emptyFormData(event){

    //     this.template.querySelectorAll('c-action')[0].emptyForm(event.detail);
    // }
    closeForm(event) {
        let deletedataform = event.detail;
        this.template.querySelectorAll('c-questionnaire')[0].displayCloseIcon(deletedataform);
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
        this.showChat = event.detail.chat;
        //this.showCapaForm=event.detail.showCapaForm;
        this.openReviewComments = this.showChat.openReviewComments;
        this.showCapaForm = false;
        this.openRightFile = false;

        console.log('chatter', this.showChat);
        this.showChat.accountassessmentId = this.accountassessmentid;
        this.showData = this.showChat.openChat;
        this.showconverstion = this.showChat.disableSendButton;
        this.actionData = event.detail.actionData;
        this.selectedchatData = event.detail.chat;
        this.fileData = event.detail.file;
        this.assessmentTimeline.forEach(res => {
            if (res.status === 'In Review') {
                this.actionData[0].ownershipId = res.id;
                this.actionData[0].ownershipName = res.name;
            }
            else if (res.status === 'Submitted') {
                this.actionData[0].assignedToId = res.id;
                this.actionData[0].assignedToName = res.name;
            }
        })
        console.log('sample', this.fileData);
        setTimeout(() => {
            console.log('chatter===>', this.template.querySelectorAll('c-rtmvpc-assessment-chatter'));
            this.template.querySelectorAll('c-rtmvpc-assessment-chatter')[0].displayConversation(this.showChat);
        }, 300);


    }
    handleSelectedAction() {
        this.openReviewComments = false;
        this.showCapaForm = true;
        this.openRightFile = false;
        setTimeout(() => {
            this.template.querySelectorAll('c-action')[0].displayForm(this.actionData);
        }, 500);

    }
    handleFileData(event) {
        this.openRightFile = true;
        this.openReviewComments = false;
        this.showCapaForm = false;
        this.objectApiName = event.detail.objectApiName;
        this.isdisabled = (event.detail.isEditable === "true") ? true : false;
        console.log('isdisable', event.detail);
        this.responseId = event.detail.response;
        this.showUpload = (event.detail.showUpload === "true") ? true : false;
        this.recid = event.detail.recid;
        this.questionId = event.detail.questionId;
        this.accountassessmentFileId = event.detail.accountassessmentid;
    }
    handleOnLoad(event) {
        console.log('filemap', event.detail);
        this.template.querySelectorAll('c-questionnaire')[0].handleGetRespRecord(event.detail);
    }
    handleSelectedChat() {
        this.openReviewComments = true;
        this.showCapaForm = false;
        this.openRightFile = false;
        setTimeout(() => {
            this.template.querySelectorAll('c-rtmvpc-assessment-chatter')[0].displayConversation(this.selectedchatData);
        }, 300);
    }
    handleSelectedFile() {
        console.log('this.filedata', this.fileData);
        this.openRightFile = true;
        this.openReviewComments = false;
        this.showCapaForm = false;
        this.objectApiName = this.fileData.objectApiName;
        this.isdisabled = (this.fileData.isEditable === "true") ? true : false;
        this.responseId = this.fileData.response;
        this.showUpload = (this.fileData.showUpload === "true") ? true : false;
        this.recid = this.fileData.recid;
        this.questionId = this.fileData.questionId;
        this.accountassessmentFileId = this.fileData.accountassessmentid;
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
        if (this.recordId !== null && typeof this.recordId !== 'undefined') {
            this.accountassessmentid = this.recordId;
        }
        this.handlCsv(this.accountassessmentid);
    }
    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
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
        if (this.recordId !== null && typeof this.recordId !== 'undefined') {
            let pageurl = window.location.href;
            if (typeof this.recordId != 'undefined') {
                let baseurl = pageurl.split('.com')[0] + '.com/apex/RenderAsPdf?id=' + this.recordId;
                window.open(baseurl);
            } else {
                let baseurl = pageurl.split('.com')[0] + '.com/apex/RenderAsPdf?id=' + this.accountassessmentid;
                window.open(baseurl);
            }
        }
        else {
            this.handlepdf(this.accountassessmentid);
        }
    }

    handleupdatetimeline(event) {
        let filesdata = event.detail;
        this.handleTimeLine(); 
        if(filesdata.files){
        this.template.querySelector('c-portal-s3-files').handleFilesdata(filesdata);
        }      
    }
    handlepdf(accountassessmentId) {
        getPdfContent({ accountassessmentId: accountassessmentId }).then(result => {
            let attachment = (result[0].Rhythm__PdfConvertor__c);
            name = result[0].Rhythm__Assessment__r.Name;
           
            let attachmentstr = attachment.replaceAll('&quot;', '\"');
            let parseLst = JSON.parse(attachmentstr);
            let count = 0;
             console.log('parseLst',parseLst);
            let tableHtml = '<table><thead><tr>';
            tableHtml += '<th>Section</th><th colspan="2">Question</th><th>Response</th><th>NumberOfAttachments</th><th>ConversationHistory</th>';
            tableHtml += '</tr></thead><tbody>';
            for (const section in parseLst) {
                count++;
                let data = parseLst[section];
                tableHtml += '<tr><td class="oddLeftTd" rowspan=' + data.length + '>' + section + '</td>';
                if (count % 2 === 0) {
                   // tableHtml += '<tr><td class="evenLeftTd" rowspan=' + section.length + '>' + section + '</td>';
                }
                else {
                    
                }
                
                data.forEach(ques => {
                    tableHtml += '<td class="align-to-top">';
                    tableHtml = tableHtml + ques.snumber + '</td><td>' + ques.question + '</td>';
                    if (typeof ques.value !== 'undefined') {
                        tableHtml = tableHtml + '<td>' + ques.value + '</td>';
                    }
                    if (typeof ques.files !== 'undefined') {
                        tableHtml = tableHtml + '<td>' + ques.files + '</td>';
                    }
                    if (typeof ques.conversationHistory !== 'undefined') {
                        tableHtml = tableHtml + '<td>' + ques.conversationHistory + '</td>';
                    }
                    tableHtml = tableHtml +'</tr>';
                });
            }
            tableHtml += '</tbody></table>';
            console.log('Str>>', tableHtml);
            let win = window.open('', '', 'width=' + (window.innerWidth * 0.9) + ',height=' + (window.innerHeight * 0.9) + ',location=no, top=' + (window.innerHeight * 0.1) + ', left=' + (window.innerWidth * 0.1));
            let style = '<style>@media print { * {-webkit-print-color-adjust:exact;}}} @page{ margin: 0px;} *{margin: 0px; padding: 0px; height: 0px; font-family: Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif !important;} .headerDiv{width: 100%; height: 56px; padding: 20px; background-color: #03314d;} .headerText{font-size: 40px; color: white; font-weight: bold} .tableDiv{padding: 20px;} table {border-collapse:collapse; font-size: 14px;} table td, th{ padding: 4px;} table tr:nth-child(odd) td {background-color: #F9F9F9;} .oddLeftTd{background-color: #E9E9E9 !important;} .evenLeftTd{background-color: #F1F1F1 !important;} table th{ border: 1px solid #E9E9E9; background-color:#B5BEC58F} table { page-break-inside:auto; } tr { page-break-inside:avoid; page-break-after:auto; } .align-to-top{ vertical-align: top; }</style>';
            win.document.getElementsByTagName('head')[0].innerHTML += style;
            win.document.getElementsByTagName('body')[0].innerHTML += '<div class="headerDiv slds-p-around_small"><span class="headerText">Rhythm</span></div><br/>';
            tableHtml = tableHtml.replaceAll('undefined', '').replaceAll('null', '');
            win.document.getElementsByTagName('body')[0].innerHTML += '<div class="tableDiv slds-p-around_medium">' + tableHtml + '</div>';
            win.print();
            win.close();
        }).catch(error => {

        });



    }
    handlCsv(accountassessmentId) {
        let name = 'Sample';
        console.log('this.accountassessmentId', accountassessmentId);

        getPdfContent({ accountassessmentId: accountassessmentId }).then(result => {
            let attachment = (result[0].Rhythm__PdfConvertor__c);
            name = result[0].Rhythm__Assessment__r.Name;
            let attachmentstr = attachment.replaceAll('&quot;', '\"');
            let parseLst = JSON.parse(attachmentstr);
            let str = 'Section,Question,Answer,NumberOfAttachments,ConversationHistory\n';
            for (const section in parseLst) {
                str = str + section + '"\n"';
                let data = parseLst[section];
                console.log('data', data);
                data.forEach(ques => {
                    str = str + ques.snumber + '","' + ques.question + '","';
                    if (typeof ques.value !== 'undefined') {
                        str = str + ques.value + '","';
                    }
                    if (typeof ques.files !== 'undefined') {
                        str = str + ques.files + '","';
                    }
                    if (typeof ques.conversationHistory !== 'undefined') {
                        str = str + ques.conversationHistory;
                    }
                    str = str + '"\n"';
                });
                str = str + '"\n"';
            }
            console.log('Str>>', str);
            //str = str.replaceAll('undefined', '').replaceAll('null', '');
            let blob = new Blob([str], { type: 'text/plain' });
            let url = window.URL.createObjectURL(blob);
            let atag = document.createElement('a');
            //finalQuestionlst.push(questionmap);
            atag.setAttribute('href', url);
            atag.setAttribute('download', name + '.csv');
            atag.click();
        }).catch(error => {

        });
    }
}