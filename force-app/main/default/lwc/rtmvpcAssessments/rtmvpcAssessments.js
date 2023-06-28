import { LightningElement, api,track } from 'lwc';
import getAccountId from '@salesforce/apex/AssessmentController.getAccountId';
import getAssessmentJunctionRecords from '@salesforce/apex/AssessmentController.getAssessmentJunctionRecords';
export default class RtmvpcAssessments extends LightningElement {
    
@track recList= [];
@track accId;
@track assessmentId;
@track accountassessmentId;
@track pageSize = 15;
@track show = {grid: false, survey: false};
@track fieldsList=[];
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
    
    }  
    
    fetchingRecords(){
        getAssessmentJunctionRecords({ accountId: this.accId}).then(result=>{
        this.recList = result;
        this.show.grid=true;
        let win=window.location.search;
        let x=win.split('=');
         if(x[0] ==='?Rhythm__AccountAssessmentRelation__c')
        {
           this.accountassessmentId=x[1];        
           this.show.survey = true;
           this.show.grid=false;
         }
        });
         
    }



    openSurveyHandler(event){
        this.show.grid = false;
        this.accountassessmentId = event.detail.accountassessmentId;
        this.show.survey = true;
    }

    backClickHandler(){
        this.show.survey = false;
        this.assessmentId = undefined;
        this.show.grid = true;
    }
}