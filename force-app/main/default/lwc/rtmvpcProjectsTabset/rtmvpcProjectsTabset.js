import { LightningElement, api } from 'lwc';

export default class RtmvpcProjectsTabset extends LightningElement {
    showTabFour;
    @api fieldList = {
        "Work_Orders__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Project Owner', fieldName: 'Employee__r.Name', type: 'lookup' },
        { label: 'Department', fieldName: 'Department__c' },
        { label: 'Work Area', fieldName: 'Work_Area__c' },
        { label: 'Vendor', fieldName: 'Vendor__r.Name', type: 'lookup' },
        { label: 'Status', fieldName: 'Status__c' }],
        "Alert__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' }],
        "Incidents__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Incident Date', fieldName: 'Incident_Date__c', type: 'date' },
        { label: 'Incident Type', fieldName: 'Incident_Type__c' },
        { label: 'Priority', fieldName: 'Priority__c' }],
        "Permit__c": [{ label: 'Permit No', fieldName: 'Name' },
        { label: 'Permit Required ?', fieldName: 'Permit_Required__c' },
        { label: 'Permit Issued ?', fieldName: 'Permit__c'},
        { label: 'Permit File', fieldName: 'Permit_File__c', type: 'html' }],
        "Onsite_Evaluation__c": [{ label: 'Describe Your Observation', fieldName: 'Name' },
        { label: 'Observed By', fieldName: 'Performed_By__c' },
        { label: 'Observation Date ?', fieldName: 'Date_Time_Conducted__c', type: 'date' },
        { label: 'Type of Observation', fieldName: 'Type_of_Observation__c' },
        { label: 'Outcome', fieldName: 'Outcome__c' }],
        "Employee_Onsite__c": [{ label: 'ID', fieldName: 'Name' },
        { label: 'Employee', fieldName: 'Employee__r.Name', type: 'lookup' },
        { label: 'Onsite Work Approval', fieldName: 'Approval_Hyperlink__c', type: 'html' },
        { label: 'Qualification', fieldName: 'Qualification__c' },
        { label: 'ITAR Clearance', fieldName: 'ITAR_Clearance__c' },
        { label: 'Citizenship', fieldName: 'Citizenship__c' },
        { label: 'Competency', fieldName: 'Competency__c', type: 'html' },
        { label: 'Credentials', fieldName: 'Credentials__c', type: 'html' }], 
        "Work_Orders__c2": [{ label: 'Project Name', fieldName: 'Name' },
        { label: 'Customer', fieldName: 'Customer__r.Name', type: 'lookup' },
        { label: 'Actual Completion Date', fieldName: 'Actual_Completion_Date__c', type: 'date' },
        { label: 'Status', fieldName: 'Status__c', type: 'html' },
        { label: 'Health', fieldName: 'Health_Status__c', type: 'html' },
        { label: 'Project Approval Status', fieldName: 'Project_Approval_Status__c' },
        { label: 'Closure Comments', fieldName: 'Closure_Comments__c' }],
        "Observations__c": [{ label: 'Describe Your Observation', fieldName: 'Name' },
        { label: 'Observation Date', fieldName: 'Observation_Date__c', type: 'date' },
        { label: 'Observed By', fieldName: 'Observed_By__c', type: 'lookup' },
        { label: 'Projects', fieldName: 'Work_Orders__c', type: 'lookup' },
        { label: 'Employee Onsite', fieldName: 'Employee_Onsite__r.Name', type: 'lookup' },
        { label: 'Outcome', fieldName: 'Outcome__c' }],
        "Check_In_Out_History__c": [{ label: 'Checked in (Date & Time)', fieldName: 'Checked_In__c', type: 'date' },
        { label: 'Checked Out (Date & Time)', fieldName: 'Checked_Out__c', type: 'date' },
        { label: 'Employee', fieldName: 'Employee__r.Name', type: 'lookup' }]
    };
    @api tabsData;
    @api parentId = 'a0h5i000004oqZEAAY';

    toggleOptionalTab() {
        this.showTabFour = !this.showTabFour;
        // this.tabsData = {
        //     "Work_Orders__c": [{ label: 'PROJECT PROFILE', tabName: 'Details', isDetailsTab: true }]
        // }; // Commented By Kushal
    }
    connectedCallback() {
        this.tabsData = {
            "Work_Orders__c": [{ label: 'Project PROFILE', tabName: 'ProjectProfile', isDetailsTab: true },
            {
                label: 'Risk Assessment', tabName: 'Risk_Assessment', objName: 'Risk_Assessment__c', isDetailsTab: false, isCustomDesignPage: true
            },
            {
                label: 'Employees', tabName: 'Employees', isDetailsTab: false, childObjects: [
                    {
                        label: 'Vendor Employees', relName: 'Employee_Onsite__r', objName: 'Employee_Onsite__c', colList: this.fieldList.Employee_Onsite__c, tabsData: [
                            { label: 'PROFILE', tabName: 'Profile', isDetailsTab: true },
                            {
                                label: 'Details', tabName: 'Details', isDetailsTab: false, childObjects: [
                                    { label: 'Observations', relName: 'Observations__r', objName: 'Observations__c', colList: this.fieldList.Observations__c },
                                    { label: 'Check In/Out Histories', relName: 'Check_In_Out_Histories__r', objName: 'Check_In_Out_History__c', colList: this.fieldList.Check_In_Out_History__c }]
                            }
                        ]
                    }]
            },
            {
                label: 'Permits', tabName: 'Permits', isDetailsTab: false, childObjects: [
                    { label: 'Permits', relName: 'Permit__r', objName: 'Permit__c', colList: this.fieldList.Permit__c }]
            },
            {
                label: 'Onsite Evaluation', tabName: 'Onsite_Evaluation', isDetailsTab: false, childObjects: [
                    { label: 'Onsite Evaluations', relName: 'Work_Order_Onsite_Evaluations__r', objName: 'Onsite_Evaluation__c', colList: this.fieldList.Onsite_Evaluation__c }]
            },
            {
                label: 'Incidents', tabName: 'Incidents', isDetailsTab: false, childObjects: [
                    { label: 'Incidents', relName: 'Incidents__r', objName: 'Incidents__c', colList: this.fieldList.Incidents__c }]
            },
            {
                label: 'Alerts', tabName: 'Alerts', isDetailsTab: false, childObjects: [
                    { label: 'Alerts', relName: 'Alerts__r', objName: 'Alert__c', colList: this.fieldList.Alert__c }]
            },
            {
                label: 'Project Close Out', tabName: 'Project_Close_Out', isDetailsTab: false, childObjects: [
                    { label: 'Projects', relName: 'Parent_Work_Order__r', objName: 'Work_Orders__c', colList: this.fieldList.Work_Orders__c2 }]
            }
            ]
        };
    }

    gotoParentHandler(event)
    {
        console.log('ProjectsTabset',JSON.stringify(event.detail));
        var gotoParentPage=new CustomEvent('getchildnavobjectfromtabset',{
            detail:event.detail
        });
        this.dispatchEvent(gotoParentPage);
    }

    gotoParentonBackClickHandler(event)
    {
        console.log('ProjectsTabset',JSON.stringify(event.detail));
        var gotoParentPageOnBackClick=new CustomEvent('getchildnavobjectfromtabsetonbackclick',{
            detail:event.detail
        });
        this.dispatchEvent(gotoParentPageOnBackClick);
    }
}