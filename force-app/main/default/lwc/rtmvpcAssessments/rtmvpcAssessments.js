import { LightningElement, api,track } from 'lwc';
import getAccountId from '@salesforce/apex/AssessmentController.getAccountId';
import getAssessmentJunctionRecords from '@salesforce/apex/AssessmentController.getAssessmentJunctionRecords';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList'; //To fetch all the Questions from the Assessment_Template__c Id from the Supplier_Assessment__c record
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList'; //To fetch all the Supplier_Response__c records related to the Supplier_Assessment__c record
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList'; //To fetch the Assessment_Template__c Id from the Supplier_Assessment__c record

export default class RtmvpcAssessments extends LightningElement {
    
@track recList= [];
@track accId;//='0017i00001QCVtwAAH';
@track assessmentId;
@track accountassessmentId;
@track pageSize = 15;
@track show = {grid: false, survey: false};
@track fieldsList=[];
@track finalSection;
@track savedResponseMap=new Map();
@track objName='Rhythm__Assessment__c';
@api tablefieldList =  [
                            { label: 'Assessment Name', fieldName: 'Name' },
                            { label: 'Target Completion Date', fieldName: 'Rhythm__End_Date__c',type:'date' },
                            { label: 'Assessment Status', fieldName: 'Rhythm__Status__c'},
                            { label: '#Additional Requests',fieldName:'Rhythm__Follow_Up_Requests__c'},
                        ];

    connectedCallback(){
        this.fieldsList = [];
        if(this.tablefieldList && this.tablefieldList.length >0){
            this.tablefieldList.forEach(tabList => {
                this.fieldsList.push(this.objName + '.' + tabList.fieldName);
            })
        }   
        getAccountId({}).then((result) => {
         this.accId = result;
         this.fetchingRecords(); 
      });
    this.fetchingRecords();    
    
    }  
    
    fetchingRecords(){
        getAssessmentJunctionRecords({ accountId: this.accId}).then(result=>{
        console.log(' Assesments result sh -- ', result.length);
        this.recList = result;
        this.show.grid=true;
        let win=window.location.search;
        if(win && win.includes('=')){
            let x=win.split('=');
           if(x[0] ==='?Rhythm__AccountAssessmentRelation__c')
           {
               this.accountassessmentId=x[1];        
               this.show.survey = true;
               this.show.grid=false;
           }
        }
        });
         
    }



    openSurveyHandler(event){
        this.show.grid = false;
        this.accountassessmentId = event.detail.accountassessmentId;
        this.show.survey = true;
        let urlparam = '/?Rhythm__AccountAssessmentRelation__c'+'='+this.accountassessmentId;
        window.location.href = 'https://'+window.location.host+urlparam;
        // let inputUrl = new URL('https://'+window.location.host);
        // let inputParams = new URLSearchParams(inputUrl.search);
        // inputParams.append('Rhythm__AccountAssessmentRelation__c', this.accountassessmentId);
        //if(!(window.location.href+'').contains('Rhythm__AccountAssessmentRelation__c'))
        //window.location.href=window.location.href+'/?Rhythm__AccountAssessmentRelation__c'+'='+this.accountassessmentId;
    }

    backClickHandler(){
        this.show.survey = false;
        this.assessmentId = undefined;
        this.show.grid = true;
    }


    exportRowAsCsvHandler(event) {
        var assessmentId = event.detail.value;
        console.log('jjjjj',assessmentId);
        getSupplierAssessmentList({ assessmentId: assessmentId }).then(resultData => {
            var assessmentTemplateId = resultData[0].Rhythm__Assessment__r.Rhythm__Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: assessmentId }).then(result => {
                    result.forEach(qres => {
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
                    var str = 'Section,Question,Answer,ConversationHistory,NumberOfAttachments\n';
                    for (const key of this.finalSection.keys()) {
                        for (var i = 0; i < this.finalSection.get(key).length; i++) {
                            if (typeof this.finalSection.get(key)[i].conversationHistory != "undefined") {
                                var tempstr = '';
                                for (var j = 0; j < JSON.parse(this.finalSection.get(key)[i].conversationHistory).length; j++) {
                                    tempstr = tempstr + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Name + ':' + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Text + '\n';
                                }
                                this.finalSection.get(key)[i].conversationHistory = tempstr;
                            }
                            if (typeof this.finalSection.get(key)[i].files != "undefined") {
                                this.finalSection.get(key)[i].files = JSON.parse(this.finalSection.get(key)[i].files).length;
                            }
                            str += '"' + key + '","' + (i + 1) + '.' + ' ' + this.finalSection.get(key)[i].question + '","' + this.finalSection.get(key)[i].value + '","' + this.finalSection.get(key)[i].conversationHistory + '","' + this.finalSection.get(key)[i].files + '"\n';
                        }
                        str += '\n';
                    }
                    str = str.replaceAll('undefined', '').replaceAll('null', '');
                    var blob = new Blob([str], { type: 'text/plain' });
                    var url = window.URL.createObjectURL(blob);
                    var atag = document.createElement('a');
                    atag.setAttribute('href', url);
                    atag.setAttribute('download', resultData[0].Rhythm__Assessment__r.Name + '.csv');
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

    // Extracts the row as PDF
    exportRowAsPdfHandler(event) {
        var x = event.detail.value;
        console.log('jjjjj',x);
        getSupplierAssessmentList({ assessmentId: x }).then(resultData => {
            var assessmentTemplateId = resultData[0].Rhythm__Assessment__r.Rhythm__Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: x }).then(result => {
                    result.forEach(qres => {
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
                    var tableHtml = '<table><thead><tr>';
                    tableHtml += '<th>Section</th><th colspan="2">Question</th><th>Response</th><th>ConversationHistory</th><th>NumberOfAttachments</th>';
                    tableHtml += '</tr></thead><tbody>';
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
                            if (typeof this.finalSection.get(key)[i].conversationHistory != "undefined") {
                                var str = '';
                                for (var j = 0; j < JSON.parse(this.finalSection.get(key)[i].conversationHistory).length; j++) {
                                    str = str + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Name + ':' + JSON.parse(this.finalSection.get(key)[i].conversationHistory)[j].Text + '\n';
                                }
                                this.finalSection.get(key)[i].conversationHistory = str;
                            }
                            if (typeof this.finalSection.get(key)[i].files != "undefined") {
                                this.finalSection.get(key)[i].files = JSON.parse(this.finalSection.get(key)[i].files).length;
                            }
                            tableHtml += '<td class="align-to-top">' + (i + 1) + '.' + '</td><td>' + this.finalSection.get(key)[i].question + '</td><td>' + this.finalSection.get(key)[i].value + '</td><td> ' + this.finalSection.get(key)[i].conversationHistory + '</td><td> ' + this.finalSection.get(key)[i].files + '</td></tr>';
                        }
                        tableHtml += '<tr><td></td><td></td><td></td><td></td></tr>';
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

    constructWrapper(questionResp, savedResp) {
        var questionMap = new Map();
        console.log('responsemap', savedResp);
        questionResp.forEach(qu => {
            var quTemp = {};
            quTemp.questionId = qu.Id;
            quTemp.question = qu.Rhythm__Question__c;
            if (qu.Rhythm__Required__c == true) {
                var str = '';
                str = str + qu.Rhythm__Question__c + '*';
                quTemp.question = str;
            }
            if (questionMap.has(qu.Rhythm__Section__r.Name)) {
                questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                var quesList = [];
                quesList.push(quTemp);
                questionMap.set(qu.Rhythm__Section__r.Name, quesList);
            }
            if (typeof (savedResp.get(quTemp.questionId)) != 'undefined' && savedResp.get(quTemp.questionId).conversationHistory == 'undefined') {
                quTemp.value = savedResp.get(quTemp.questionId).get('value');
            }
            else if (typeof (savedResp.get(quTemp.questionId)) != 'undefined') {
                quTemp.value = savedResp.get(quTemp.questionId).get('value');
                quTemp.conversationHistory = savedResp.get(quTemp.questionId).get('history');
                quTemp.files = savedResp.get(quTemp.questionId).get('files');
            }
        });
        return questionMap;
    }
}