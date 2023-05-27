import { LightningElement, api } from 'lwc';
export default class RtmvpcAssessments extends LightningElement {
    
@api parentId='0015300000NfNRTAA3';

@api fieldList = {
        "Supplier_Assessment__c": [{ label: 'Assessment Name', fieldName: 'Name' },
         { label: 'Target Completion Date', fieldName: 'Rythm__Target_Completion_Date__c',type:'date' },
        // { label: 'Assessment Type', fieldName: 'Assessment_Type__c' },
        { label: 'Assessment Status', fieldName: 'Rythm__Assesment_Status__c'},
        {label: '#Additional Requests',fieldName:'Rythm__Additional_Requests__c'},
        {label:'Customer Review Status', fieldName: 'Rythm__Customer_Review__c'},
        // { label: 'Survey', fieldName:'Survey_Life_Cycle__c'},
        // { label: 'Frequency', fieldName:'Frequency__c'},
         { label: '# Number of Questions', fieldName:'Rythm__Number_of_Questions__c'},
         { label: '# Number of Responses', fieldName:'Rythm__Number_of_Responses__c'}
        ]
    };
}