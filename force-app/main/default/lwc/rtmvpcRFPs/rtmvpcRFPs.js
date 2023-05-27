import { LightningElement,api } from 'lwc';
export default class RtmvpcRFPs extends LightningElement {

    //kept for testing purpose (no impact on removing)
@api fieldList = {
        "Employee_Onsite__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Designation', fieldName: 'Designation__c' },
        { label: 'Check In', fieldName: 'Check_In__c' },
        { label: 'Check Out', fieldName: 'Check_Out__c' }],
        "Employee__c": [{ label: 'Id', fieldName: 'Id__c' },
        { label: 'Name', fieldName: 'Name' },
        { label: 'Job Title', fieldName: 'JobTitle__c' },
        { label: 'Qualification', fieldName: 'Qualification__c' },
        { label: 'Driver\'s License Number', fieldName: 'Driver_s_License_Number__c' },
        { label: 'Citizenship', fieldName: 'Citizenship__c' },
        { label: 'ITAR Certified', fieldName: 'ITAR_Certified__c' },
        { label: 'Status', fieldName: 'Status__c' }],
        "Certication__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Issued By', fieldName: 'Issued_By__c' },
        { label: 'Issued Date', fieldName: 'Issued_Date__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Expiry Date', fieldName: 'Expiry_Date__c' }],
        "Training__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Issued By', fieldName: 'Issued_By__c' },
        { label: 'Training Type', fieldName: 'Training_Type__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Valid Until', fieldName: 'Valid_Thru__c' }],
        "Driver_MVR_Report__c":[{ label: 'Score', fieldName: 'Score__c' },
        { label: 'Rating', fieldName: 'Rating__c' },
        { label: 'MVR Date', fieldName: 'MVR_Date__c' },
        { label: 'Number of Violations', fieldName: 'Number_of_Violations__c' }],
        "Drug_Alcohol_Report__c":[{ label: 'Description', fieldName: 'Description__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Result', fieldName: 'Result__c' }],
        "Criminal_Records_Report__c":[{ label: 'Order_Number__c', fieldName: 'Order_Number__c' },
        { label: 'Order Date', fieldName: 'Order_Date__c' },
        { label: 'States Searched', fieldName: 'States_Searched__c' }],
        "Work_Orders__c":[{ label: 'Projects Name', fieldName: 'Name' },
        { label: 'Start Date', fieldName: 'Start_Date__c' },
        { label: 'End Date', fieldName: 'Due_Date__c' },
        { label: 'Status', fieldName: '	Status__c' }],
        "Observations__c":[{ label: 'Name', fieldName: 'Name' }],
        "Incidents__c":[{ label: 'Incident Name', fieldName: 'Name' },
        { label: 'Incident Date', fieldName: 'Incident_Date__c' },
        { label: 'Incident Type', fieldName: 'Incident_Type__c' },
        { label: 'Priority', fieldName: 'Priority__c' }],
        "Alert__c":[{ label: 'Alerts Name', fieldName: 'Name' }],
    };
}