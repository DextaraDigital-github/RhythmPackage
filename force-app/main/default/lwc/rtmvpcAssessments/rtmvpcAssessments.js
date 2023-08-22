import { LightningElement, api, track, wire } from 'lwc';
import getAccountId from '@salesforce/apex/AssessmentController.getAccountId';
import getAssessmentJunctionRecords from '@salesforce/apex/AssessmentController.getAssessmentJunctionRecords';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import getPdfContent from '@salesforce/apex/AssessmentController.getPdfContent';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList'; //To fetch all the Questions from the Assessment_Template__c Id from the Supplier_Assessment__c record
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList'; //To fetch all the Supplier_Response__c records related to the Supplier_Assessment__c record
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList'; //To fetch the Assessment_Template__c Id from the Supplier_Assessment__c record
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
export default class RtmvpcAssessments extends NavigationMixin(LightningElement) {

    @track recList = [];
    @track accId;
    @track assessmentId;
    @track accountassessmentId;
    @track pageSize = 15;
    @track show = { grid: false, survey: false };
    @track fieldsList = [];
    @track finalSection;
    @track savedResponseMap = new Map();
    @track objName = 'Rhythm__Assessment__c';
    @track urlId;
    @track questiondataMap;
    @api tablefieldList = [
        { label: 'Assessment Name', fieldName: 'Name' },
        { label: 'Target Completion Date', fieldName: 'Rhythm__End_Date__c', type: 'date' },
        { label: 'Assessment Status', fieldName: 'Rhythm__Status__c' },
        { label: '#Follow Up Requests', fieldName: 'Rhythm__Follow_Up_Requests__c' },
        { label: '% Completed', fieldName: 'Rhythm__Response_Percentage__c', type: 'progressBar' },
    ];
    /* connectedCallback is used to get accountAssessment data based on the account Id */
    connectedCallback() {
        console.log('connectedassessments');
        this.fieldsList = [];
        if (this.tablefieldList && this.tablefieldList.length > 0) {
            this.tablefieldList.forEach(tabList => {
                this.fieldsList.push(this.objName + '.' + tabList.fieldName);
            })
        }
        getAccountId({}).then((result) => {
            this.accId = result;
            this.fetchingRecords();
        });

    }
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.urlId = currentPageReference.state?.Rhythm__AccountAssessmentRelation__c;
        }
    }
    @api handleInbox()
    {
        this.show.survey = false;
        this.show.grid = true;
    }
    handleurl(event){
         this.show.survey = false;
        this.show.grid = true;
    }

    /* fetchingRecords is used to get accountAssessment data based on the account Id and URL navigation */
    fetchingRecords(refreshData) {
        getAssessmentJunctionRecords({ accountId: this.accId }).then(result => {
            this.recList = result;
            this.show.grid = true;
            if (this.urlId != null && typeof this.urlId != 'undefined') {
                this.accountassessmentId = this.urlId;
                this.show.survey = true;
                this.show.grid = false;
            }
            // let win=window.location.search;
            // if(win && win.includes('=')){
            //     let x=win.split('=');
            //    if(x[0] ==='?Rhythm__AccountAssessmentRelation__c')
            //    {
            //        this.accountassessmentId=x[1];        
            //       this.show.survey = true;
            //        this.show.grid=false;
            //    }
            // }
            if(typeof refreshData !== 'undefined' && refreshData === true){
                this.show.survey = false;
                this.assessmentId = undefined;
                this.show.grid = true;
                const pageRef = {
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Home' // Replace with your community page name
                    }

                };
                // Navigate to the community page
                this[NavigationMixin.Navigate](pageRef);
            }

        });
    }

    /* openSurveyHandler is used to hide the custom table component and display assessment detail component */
    openSurveyHandler(event) {
        this.show.grid = false;
        this.accountassessmentId = event.detail.accountassessmentId;
        this.show.survey = true;
        const pageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Home' // Replace with your community page name
            },
            state: {
                // Define your parameters here
                Rhythm__AccountAssessmentRelation__c: this.accountassessmentId
            }
        };
        // Navigate to the community page
        this[NavigationMixin.Navigate](pageRef);
    }

    /* backClickHandler is used to show the custom table component and hide the assessment detail component when clicked on back button */
    backClickHandler() {
        this.fetchingRecords(true);
        //this.recList =[];
        
        

    }

    /* exportRowAsCsvHandler is used to generate assessment data in the csv format. It is being called from its child component customtable by 
       dispatching an event */
    exportRowAsCsvHandler(event) {
        var assessmentId = event.detail.value;
        this.handlCsv(assessmentId);
    }

    /* exportRowAsPdfHandler is used to generate assessment data in the pdf format. It is being called from its child component customtable by 
   dispatching an event */
    exportRowAsPdfHandler(event) {
        var x = event.detail.value;
        this.handlepdf(x);
    }

    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    /* constructWrapper is used is used to build the wrapper data properly to the questions*/
    constructWrapper(questionResp, savedResp) {
        var questionMap = new Map();
        questionResp.forEach(qu => {
            var quTemp = {};
            quTemp.questionId = qu.Id;
            quTemp.question = qu.Rhythm__Question__c;
            quTemp.rhythm__Conditional_Response__c = qu.Rhythm__Conditional_Response__c;
            quTemp.rhythm__Parent_Question__c = qu.Rhythm__Parent_Question__c;
            if (qu.Rhythm__Required__c === true) {
                quTemp.question = qu.Rhythm__Question__c + '*';
            }
            if (questionMap.has(qu.Rhythm__Section__r.Name)) {
                questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                questionMap.set(qu.Rhythm__Section__r.Name, [quTemp]);
            }

            if (typeof (savedResp.get(quTemp.questionId)) !== 'undefined' && savedResp.get(quTemp.questionId).conversationHistory === 'undefined') {
                quTemp.value = savedResp.get(quTemp.questionId).get('value');
            }
            else if (typeof (savedResp.get(quTemp.questionId)) !== 'undefined') {
                quTemp.value = savedResp.get(quTemp.questionId).get('value');
                quTemp.conversationHistory = savedResp.get(quTemp.questionId).get('history');
                quTemp.files = savedResp.get(quTemp.questionId).get('files');
            }
        });
        console.log('questionMap123', questionMap);
        for (let key of questionMap) {
            console.log('key', key);
            for (let key1 in key) {
                console.log('key12', key1);
                var questiondata = questionMap.get(key1);
                console.log('key1', questiondata);

            }

            for (let i = 0; i < questiondata.length; i++) {
                for (let j = i; j < questiondata.length; j++) {
                    if (typeof questiondata[j].rhythm__Parent_Question__c != 'undefined') {
                        if (questiondata[i].Id === questiondata[j].rhythm__Parent_Question__c && questiondata[i].value === questiondata[j].rhythm__Conditional_Response__c) {

                        }
                        else {
                            console.log('questiondata123', questiondata);
                            questiondata.splice(j, 1);
                            console.log('questiondata', questiondata);

                        }
                    }
                }
            }
        }
        console.log('questionmap', questionMap);
        return questionMap;

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
                     if (typeof ques.value === 'undefined') {
                        str = str +''+ '","';
                    }
                    if (typeof ques.files !== 'undefined') {
                        str = str + ques.files + '","';
                    }
                     if (typeof ques.files === 'undefined') {
                        str = str + '' + '","';
                    }
                    if (typeof ques.conversationHistory !== 'undefined') {
                        str = str + ques.conversationHistory;
                    }
                     if (typeof ques.conversationHistory === 'undefined') {
                        str = str + '' + '","';
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
                tableHtml += '<tr><td class="oddLeftTd" rowspan=' + (data.length+1) + '>' + section + '</td>';
                if (count % 2 === 0) {
                   // tableHtml += '<tr><td class="evenLeftTd" rowspan=' + section.length + '>' + section + '</td>';
                }
                else {
                    
                }
                console.log('data',data);
                data.forEach(ques => {
                    tableHtml += '<tr><td class="align-to-top">';
                    tableHtml = tableHtml + ques.snumber + '</td><td>' + ques.question + '</td>';
                    if (typeof ques.value !== 'undefined') {
                        tableHtml = tableHtml + '<td>' + ques.value + '</td>';
                    }
                    if(typeof ques.value === 'undefined'){
                         tableHtml = tableHtml + '<td>' + '' + '</td>';
                    }
                    if (typeof ques.files !== 'undefined') {
                        tableHtml = tableHtml + '<td>' + ques.files + '</td>';
                    }
                    if (typeof ques.files === 'undefined') {
                        tableHtml = tableHtml + '<td>' + '' + '</td>';
                    }
                    if (typeof ques.conversationHistory !== 'undefined') {
                        tableHtml = tableHtml + '<td>' + ques.conversationHistory + '</td>';
                    }
                    if (typeof ques.conversationHistory === 'undefined') {
                        tableHtml = tableHtml + '<td>' + ''+ '</td>';
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
}