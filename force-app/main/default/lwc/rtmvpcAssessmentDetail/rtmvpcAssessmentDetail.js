/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/
import { LightningElement, track, api } from 'lwc';
import getAssessmentStatus from '@salesforce/apex/AssessmentController.getAssessmentStatus';
import getAccountAssessmentRecordData from '@salesforce/apex/AssessmentController.getAccountAssessmentRecordData';
import getAccountAssesmentRecords from '@salesforce/apex/AssessmentController.getAccountAssesmentRecords';
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
    @track showExpand=true;
     @track finalSection;
     @track assaccId;
     @track accountassessmentrelId;
     @track accountAssessmentStatus;

    @track savedResponseMap = new Map();
    connectedCallback() {
        this.customerId = this.recordId;
        this.showconverstion = true;
       
        console.log('accountid',this.accountid);
        this.assaccId = this.accountid;
        /* To get the username */
        this.handleTimeLine();
         
        
    }
    handleAccordian(event)
    {
        console.log('event.detail',event.currentTarget.dataset.id);
        this.template.querySelector('c-Questionnaire').handleCollapseExpand(event.currentTarget.dataset.id);
    }
    handleExpandCollapse(event)
    {
        console.log('handleExpandCollapse',event.detail);
        this.showExpand= !(this.showExpand);
    }
    handleTimeLine()
    {
        this.assessmentTimeline=[];
        getUserName({}).then(result => {
            this.isRecordPage = false;
            this.userName = result;
            /* To get the assessment startdata, enddate and status */
            console.log('this.recordID', this.recordId);
            if(this.recordId==null || typeof this.recordId=='undefined')
            {
                console.log('getUserName result',result);
                getAccountAssesmentRecords({accountId:this.assaccId, assessmentId:this.assessmentid}).then(result => {
                    console.log('handleTimeLine',result);
                for (var j = 0; j < result.length; j++) {
                    if (result[j].Rhythm__Assessment__c == this.assessmentid) {
                        
                        console.log('result[j]',result[j]);
                        this.accountassessmentrelId = result[j].Id;
                        if(typeof result[j].Rhythm__Status__c!='undefined')
                        {
                        this.accountAssessmentStatus = result[j].Rhythm__Status__c;
                        this.statusassessment = result[j].Rhythm__Status__c;
                        if (this.accountAssessmentStatus == 'Submitted' || this.accountAssessmentStatus == 'Open' || this.accountAssessmentStatus == 'Completed' || this.accountAssessmentStatus == 'Closed') {
                            this.showstatus = true;
                        }
                        }
                        this.assessmentName = result[j].Rhythm__Assessment__r.Name;
                        if (typeof result[j].Rhythm__Start_Date__c != 'undefined') {
                            var statustrack = {};
                            var dateformat = result[j].Rhythm__Start_Date__c;
                            var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                            statustrack['date'] = dateformats + ' ' + '00:00:00';
                            statustrack['status'] = 'Start Date';
                            statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                            statustrack['name'] = result[j].Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                            this.assessmentTimeline.push(statustrack);
                        }
                        else {
                            var statustrack = {};
                            if(typeof result[j].CreatedDate!='undefined')
                            {
                            var date = result[j].CreatedDate.split('T');
                            var time = date[1].split('.');
                            var dateformat = date[0];
                            var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                            statustrack['date'] = dateformats + ' ' + time[0];
                            statustrack['status'] = 'Start Date';
                            statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                            statustrack['name'] =result[j].Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                            this.assessmentTimeline.push(statustrack);
                            }
                        }
                        if (typeof result[j].Rhythm__End_Date__c != 'undefined') {
                            var statustrack = {};
                            var dateformat = result[j].Rhythm__End_Date__c;
                            var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                            statustrack['date'] = '(Due date ' + dateformats + ')';
                            this.endDate = statustrack['date'];
                            statustrack['status'] = 'End Date';
                            statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                            statustrack['name'] = result[j].Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                            this.assessmentTimeline.push(statustrack);
                        }
                        // if(typeof result[j].Rhythm__Status__c != 'undefined')
                        // {
                        //     var statustrack = {};
                        //     var dateformat = result[j].CreatedDate;
                        //     var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                        //     statustrack['date'] = dateformats + ' ' + '00:00:00';
                        //     this.endDate = statustrack['date'];
                        //     statustrack['status'] = result[j].Rhythm__Status__c;
                        //     statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited';
                        //     statustrack['name'] = this.userName;
                        //     this.assessmentTimeline.push(statustrack);
                        // }
                    }
                }
                console.log('this.accountassessmentrelId',this.accountassessmentrelId);
                /* To get the assessment tracking history to update on timeline*/
                getAssessmentStatus({ assessmentId: this.accountassessmentrelId }).then(result => {
                    console.log('accountassessmentrelId',result);
                    var assessmentStatus = result;
                    if(result.length>0){
                    if (typeof result != 'undefined' && typeof result !='[]') {
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
                                    case "In progress": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_pending'; break;
                                    case "Submitted": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited'; break;
                                    case "In review": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending'; break;
                                    case "Accepted": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_approved'; break;
                                    case "Need more information": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_needmoreinfo'; break;
                                    case "Review Completed": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited'; break;
                                }
                                statustrack['name'] = result[i].CreatedBy.Name;
                                this.assessmentTimeline.push(statustrack);
                            }
                        }
                         var relocate = this.assessmentTimeline.splice(0, 1);
                         this.assessmentTimeline.push(relocate[0]);
                    }
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
                this.isRecordPage=true;
                console.log('Into else condition');
                getAccountAssessmentRecordData({ assrecordId: this.recordId }).then(result => {
                console.log('getAccountAssessmentRecordData result',result);
                this.assessmentid = result[0].Rhythm__Assessment__r.Id;
                for (var j = 0; j < result.length; j++) {
                    console.log('Executing for 1',this.assessmentid);
                    if (typeof result[j].Rhythm__Assessment__r != 'undefined' && typeof result[j].Rhythm__Assessment__r.Id != 'undefined') {
                        if (result[j].Rhythm__Assessment__r.Id == this.assessmentid) {
                            if (typeof result[j].Rhythm__Status__c != 'undefined') {

                                this.statusassessment = result[j].Rhythm__Status__c;
                                this.accountAssessmentStatus=this.statusassessment;
                                if (this.statusassessment == 'Submitted' || this.statusassessment == 'Open' || this.statusassessment == 'Completed' || this.statusassessment == 'Closed') {
                                    this.showstatus = true;
                                }
                                this.assessmentName =  result[j].Rhythm__Assessment__r.Name;
                                if (typeof result[j].Rhythm__Start_Date__c != 'undefined') {
                                    var statustrack = {};
                                    var dateformat = result[j].Rhythm__Start_Date__c;
                                    var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                    statustrack['date'] = dateformats + ' ' + '00:00:00';
                                    statustrack['status'] = 'Start Date';
                                    statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                    statustrack['name'] = result[j].Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                                    this.assessmentTimeline.push(statustrack);
                                }
                                else {
                                    var statustrack = {};
                                    if(typeof result[j].CreatedDate!='undefined')
                                    {
                                        var date = result[j].Rhythm__Assessment__r.CreatedDate.split('T');
                                        var time = date[1].split('.');
                                        var dateformat = date[0];
                                        var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                        statustrack['date'] = dateformats + ' ' + time[0];
                                        statustrack['status'] = 'Start Date';
                                        statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                        statustrack['name'] = result[j].Rhythm__Assessment__r.Rhythm__CreatedUser__c;
                                        this.assessmentTimeline.push(statustrack);
                                    }
                                    
                                }
                                if (typeof result[j].Rhythm__End_Date__c != 'undefined') {
                                    var statustrack = {};
                                    var dateformat = result[j].Rhythm__End_Date__c;
                                    var dateformats = months[Number(dateformat.split('-')[1]) - 1] + '-' + dateformat.split('-')[2] + '-' + dateformat.split('-')[0];
                                    statustrack['date'] = '(Due date ' + dateformats + ')';
                                    this.endDate = statustrack['date'];
                                    statustrack['status'] = 'End Date';
                                    statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_default';
                                    statustrack['name'] = result[j].Rhythm__CreatedUser__c;
                                    this.assessmentTimeline.push(statustrack);
                                }
                            }
                        }
                    }
                    console.log('Executing for');
                }
                /* To get the assessment tracking history to update on timeline*/
                getAssessmentStatus({ assessmentId: this.recordId }).then(result => {
                    var assessmentStatus = result;
                    console.log('assessmentStatus',assessmentStatus);
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
                                    case "In progress": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_pending'; break;
                                    case "Submitted": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited'; break;
                                    case "In review": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_pending'; break;
                                    case "Accepted": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_vendor cad-timeline_approved'; break;
                                    case "Need more information": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_needmoreinfo'; break;
                                    case "Review Completed": statustrack['classlist'] = 'cad-timeline_slidebase cad-timeline_customer cad-timeline_submited'; break;
                                    
                                }
                                if(typeof result[i].CreatedBy.Name!='undefined')
                                {
                                    statustrack['name'] =result[i].CreatedBy.Name;
                                }
                                
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
        console.log('Into assessment detail time line handler');
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
    handleExportCSV(event)
    {
         var assessmentId = event.currentTarget.dataset.id;
      
        getSupplierAssessmentList({ assessmentId: assessmentId }).then(resultData => {
            var assessmentTemplateId = resultData[0].Rhythm__Template__c
         
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: assessmentId }).then(result => {
                    result.forEach(qres => { 
                        console.log('jjjj',qres);
                         var savedResponseList= new Map();
                        savedResponseList.set('value',qres.Rhythm__Response__c);
                        if(('Rhythm__Conversation_History__c' in qres))
                        {
                         savedResponseList.set('history',(qres.Rhythm__Conversation_History__c));
                        }
                        if(('Rhythm__Files__c' in qres))
                        {
                         savedResponseList.set('files',(qres.Rhythm__Files__c));
                        }
                        this.savedResponseMap.set(qres.Rhythm__Question__c, savedResponseList);
                    });
                     console.log('jjjj');
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                     console.log('jjjjss');
                    var str = 'Section,Question,Answer,ConversationHistory,NumberOfAttachments\n';
                    for (const key of this.finalSection.keys()) {
                        for (var i = 0; i < this.finalSection.get(key).length; i++) {
                             if(typeof this.finalSection.get(key)[i].conversationHistory != "undefined")
                            {
                                 var tempstr='';
                                for( var j=0;j<JSON.parse(this.finalSection.get(key)[i].conversationHistory).length;j++)
                                {
                                    
                                      tempstr=tempstr + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Name +':' + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Text+ '\n';
                                }
                               
                            this.finalSection.get(key)[i].conversationHistory=tempstr;
                            }
                              if(typeof this.finalSection.get(key)[i].files != "undefined")
                            {
                                this.finalSection.get(key)[i].files=JSON.parse(this.finalSection.get(key)[i].files).length;
                            }
                            
                            str += '"'+key+ '","'+(i+1)+'.'+' '+ this.finalSection.get(key)[i].question + '","'  + this.finalSection.get(key)[i].value + '","' + this.finalSection.get(key)[i].conversationHistory + '","'+this.finalSection.get(key)[i].files+ '"\n';
                        }
                        str+='\n';
                    }
                    str = str.replaceAll('undefined', '').replaceAll('null', '');
                    var blob = new Blob([str], { type: 'text/plain' });
                    var url = window.URL.createObjectURL(blob);
                    var atag = document.createElement('a');
                    atag.setAttribute('href', url);                    
                    atag.setAttribute('download', resultData[0].Name + '.csv');
                    atag.click();
                }).catch(error => {
                   errorLogRecord({ componentName: 'CustomTable', methodName: 'getSupplierResponseList', className: 'AssessmentController', errorData: error.message }).then((result) => {
                    });                
                    })

            }).catch(error => {
                errorLogRecord({ componentName: 'CustomTable', methodName: 'getQuestionsList', className: 'AssessmentController', errorData: error.message }).then((result) => {
                    });
            })
        }).catch(error => {
             errorLogRecord({ componentName: 'CustomTable', methodName: 'getSupplierAssessmentList', className: 'AssessmentController', errorData: error.message }).then((result) => {
                    });    
        })
    }
     constructWrapper(questionResp, savedResp) {
        var questionMap = new Map();
        console.log('responsemap',savedResp);
        questionResp.forEach(qu => {
            var quTemp = {};          
            quTemp.questionId = qu.Id;          
            quTemp.question = qu.Rhythm__Question__c;
             if(qu.Rhythm__Required__c == true)
            {
                var str='';
                str=str+ qu.Rhythm__Question__c+'*';
                quTemp.question = str;
            }
            if (questionMap.has(qu.Rhythm__Section__r.Name)) {
                questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                var quesList = [];
                quesList.push(quTemp);
                questionMap.set(qu.Rhythm__Section__r.Name, quesList);
            }            
            if(typeof (savedResp.get(quTemp.questionId)) != 'undefined' && savedResp.get(quTemp.questionId).conversationHistory == 'undefined')
            {
               quTemp.value = savedResp.get(quTemp.questionId).get('value');
            }
            else if( typeof (savedResp.get(quTemp.questionId)) != 'undefined'){               
                  quTemp.value = savedResp.get(quTemp.questionId).get('value');
                     quTemp.conversationHistory = savedResp.get(quTemp.questionId).get('history');
                     quTemp.files = savedResp.get(quTemp.questionId).get('files');
                
            }
            
        });
        return questionMap;
    }
    handleExportPDF(event) {
         var assessmentId = event.currentTarget.dataset.id;
        getSupplierAssessmentList({ assessmentId: assessmentId }).then(resultData => {
            var assessmentTemplateId = resultData[0].Rhythm__Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: assessmentId }).then(result => {
                    result.forEach(qres => {
                         var savedResponseList= new Map();

                        savedResponseList.set('value',qres.Rhythm__Response__c);
                        if(('Rhythm__Conversation_History__c' in qres))
                        {
                         savedResponseList.set('history',(qres.Rhythm__Conversation_History__c));
                        }
                        if(('Rhythm__Files__c' in qres))
                        {
                         savedResponseList.set('files',(qres.Rhythm__Files__c));
                        }
                        this.savedResponseMap.set(qres.Rhythm__Question__c, savedResponseList);
                    });
                    console.log('savedmap',this.savedResponseMap);
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                    var tableHtml = '<table><thead><tr>';
                    tableHtml += '<th>Section</th><th colspan="2">Question</th><th>Response</th><th>ConversationHistory</th><th>NumberOfAttachments</th>';
                    tableHtml += '</tr></thead><tbody>';
                    console.log('this.finalSection',this.finalSection);
                    var count = 0;
                    for (const key of this.finalSection.keys()) {                        
                        count += 1;
                        if (count % 2 === 0) {
                            tableHtml += '<tr><td class="evenLeftTd" rowspan=' + this.finalSection.get(key).length + '>' + key + '</td>';
                        }
                        else {
                            tableHtml += '<tr><td class="oddLeftTd" rowspan=' + this.finalSection.get(key).length + '>' + key + '</td>';
                        }
                        for (var i = 0; i < this.finalSection.get(key).length; i++) {                                                 
                            if(typeof this.finalSection.get(key)[i].conversationHistory != "undefined")
                            {
                                 var str='';
                                for( var j=0;j<JSON.parse(this.finalSection.get(key)[i].conversationHistory).length;j++)
                                {                                    
                                      str=str + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Name +':' + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Text+ '\n';
                                }
                               
                            this.finalSection.get(key)[i].conversationHistory=str;
                            }
                             if(typeof this.finalSection.get(key)[i].files != "undefined")
                            {
                                this.finalSection.get(key)[i].files=JSON.parse(this.finalSection.get(key)[i].files).length;
                            }
                            tableHtml += '<td class="align-to-top">'+ (i+1)+'.'+'</td><td>'+ this.finalSection.get(key)[i].question + '</td><td>' + this.finalSection.get(key)[i].value + '</td><td> ' + this.finalSection.get(key)[i].conversationHistory +'</td><td> ' + this.finalSection.get(key)[i].files + '</td></tr>';
                        
                        }
                        tableHtml +='<tr><td></td><td></td><td></td><td></td></tr>';
                    }
                    tableHtml += '</tbody></table>';
                   
                   var win = window.open('', '', 'width=' + (window.innerWidth * 0.9) + ',height=' + (window.innerHeight * 0.9) + ',location=no, top=' + (window.innerHeight * 0.1) + ', left=' + (window.innerWidth * 0.1));
                    var style = '<style>@media print { * {-webkit-print-color-adjust:exact;}}} @page{ margin: 0px;} *{margin: 0px; padding: 0px; height: 0px; font-family: Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif !important;} .headerDiv{width: 100%; height: 56px; padding: 20px; background-color: #03314d;} .headerText{font-size: 40px; color: white; font-weight: bold} .tableDiv{padding: 20px;} table {border-collapse:collapse; font-size: 14px;} table td, th{ padding: 4px;} table tr:nth-child(odd) td {background-color: #F9F9F9;} .oddLeftTd{background-color: #E9E9E9 !important;} .evenLeftTd{background-color: #F1F1F1 !important;} table th{ border: 1px solid #E9E9E9; background-color:#B5BEC58F} table { page-break-inside:auto; } tr { page-break-inside:avoid; page-break-after:auto; } .align-to-top{ vertical-align: top; }</style>';
                    win.document.getElementsByTagName('head')[0].innerHTML += style;
                    win.document.getElementsByTagName('body')[0].innerHTML += '<div class="headerDiv slds-p-around_small"><span class="headerText">Rhythm</span></div><br/>';
                    tableHtml = tableHtml.replaceAll('undefined', '').replaceAll('null', '');
                    win.document.getElementsByTagName('body')[0].innerHTML += '<div class="tableDiv slds-p-around_medium">' + tableHtml + '</div>';
                    win.print();
                    win.close();
                }).catch(error => {
                    errorLogRecord({ componentName: 'CustomTable', methodName: 'getSupplierResponseList', className: 'AssessmentController', errorData: error.message }).then((result) => {
                    });
                })

            }).catch(error => {
                 errorLogRecord({ componentName: 'CustomTable', methodName: 'getQuestionsList', className: 'AssessmentController', errorData: error.message }).then((result) => {
                    });
            })
        }).catch(error => {
                errorLogRecord({ componentName: 'CustomTable', methodName: 'getSupplierAssessmentList', className: 'AssessmentController', errorData: error.message }).then((result) => {
                    });        
                })
    }
    handleupdatetimeline(event)
    {
        console.log('handleUpload Timeline',event.detail);
        this.handleTimeLine();
    }
}