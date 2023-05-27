import { LightningElement, api } from 'lwc';

export default class RtmvpcEmployeesTabset extends LightningElement {
    showTabFour;
    @api fieldList = {
        "Employee_Onsite__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Designation', fieldName: 'Designation__c' },
        { label: 'Check In', fieldName: 'Check_In__c',type:'date'  },
        { label: 'Check Out', fieldName: 'Check_Out__c',type:'date'  }],
        "Employee__c": [{ label: 'Id', fieldName: 'Id__c' },
        { label: 'Name', fieldName: 'Name' },
        { label: 'Job Title', fieldName: 'JobTitle__c' },
        { label: 'Qualification', fieldName: 'Qualification__c' },
        { label: 'Driver\'s License Number', fieldName: 'Driver_s_License_Number__c' },
        { label: 'Citizenship', fieldName: 'Citizenship__c' },
        { label: 'ITAR Certified', fieldName: 'ITAR_Certified__c' },
        { label: 'Status', fieldName: 'Status__c' }],
        "Certication__c": [{ label: 'Certification Name', fieldName: 'Name' },
        { label: 'Issued By', fieldName: 'Issued_By__c' },
        { label: 'Issued Date', fieldName: 'Issued_Date__c',type:'date'  },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Expiry Date', fieldName: 'Expiry_Date__c',type:'date'  }],
        "Training__c": [{ label: 'Training Name', fieldName: 'Name' },
        { label: 'Descriptions', fieldName: 'Descriptions__c' },
        { label: 'Organization', fieldName: 'Organization__c' },
        { label: 'Date of Completion', fieldName: 'Date_of_Completion__c',type:'date'  },
        { label: 'Valid Until', fieldName: 'Valid_Thru__c',type:'date'  },
        { label: 'Status', fieldName: 'Status__c' }],
        "Driver_MVR_Report__c":[{ label: 'Score', fieldName: 'Score__c' },
        { label: 'Rating', fieldName: 'Rating__c' },
        { label: 'MVR Date', fieldName: 'MVR_Date__c',type:'date'  },
        { label: 'Number of Violations', fieldName: 'Number_of_Violations__c' }],
        "Drug_Alcohol_Report__c":[{ label: 'Description', fieldName: 'Description__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Result', fieldName: 'Result__c' }],
        "Criminal_Records_Report__c":[{ label: 'Order_Number__c', fieldName: 'Order_Number__c' },
        { label: 'Order Date', fieldName: 'Order_Date__c',type:'date'  },
        { label: 'States Searched', fieldName: 'States_Searched__c' }],
        "Work_Order_Employee__c":[{ label: 'ID', fieldName: 'Name' },
        { label: 'Project Name', fieldName: 'Work_Orders__r.Name',type:'lookup'  },
        { label: 'Start Date', fieldName: 'Start_Date__c',type:'date'  },
        { label: 'End Date', fieldName: 'End_Date__c',type:'date'  },
        { label: 'Status', fieldName: 'Status__c' }],
        "Observations__c":[{ label: 'Describe Your Observation', fieldName: 'Name' },
        { label: 'Observation Date', fieldName: 'Observation_Date__c', type: 'date' },
        { label: 'Observed By', fieldName: 'Observed_By__r.Name', type: 'lookup' },
        { label: 'Projects', fieldName: 'Work_Orders__r.Name', type: 'lookup' },
        { label: 'Employee Onsite', fieldName: 'Employee_Onsite__r.Name', type: 'lookup' },
        { label: 'Outcome', fieldName: 'Outcome__c' }],
        "Incidents__c":[{ label: 'Incident Name', fieldName: 'Name' },
        { label: 'Incident Date', fieldName: 'Incident_Date__c',type:'date'  },
        { label: 'Incident Type', fieldName: 'Incident_Type__c' },
        { label: 'Priority', fieldName: 'Priority__c' }],
        "Alert__c":[{ label: 'Alerts Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' }],
    };
    @api tabsData;
    @api parentId='a0h5i000004oqZEAAY';

    connectedCallback() {
        this.tabsData = {
            "Employee__c": [{ label: 'PROFILE', tabName: 'Details', isDetailsTab: true },
            {
                label: 'CREDENTIALS', tabName: 'Credentials', isDetailsTab: false, childObjects: [
                    { label: 'Certifications', relName: 'Certifications__r', objName: 'Certication__c', colList: this.fieldList.Certication__c },
                    { label: 'Trainings', relName: 'Trainings__r', objName: 'Training__c', colList: this.fieldList.Training__c }]
            },
            {
                label: 'BACKGROUND VERIFICATION', tabName: 'Background_Verification', isDetailsTab: false, childObjects: [
                    { label: 'Driver MVR Reports', relName: 'Driver_MVR_Reports__r', objName: 'Driver_MVR_Report__c', colList: this.fieldList.Driver_MVR_Report__c },
                    { label: 'Drug & Alcohol Reports', relName: 'Drug_Alcohol_Reports__r', objName: 'Drug_Alcohol_Report__c', colList: this.fieldList.Drug_Alcohol_Report__c },
                    { label: 'Criminal Records Reports', relName: 'Criminal_Records_Reports__r', objName: 'Criminal_Records_Report__c', colList: this.fieldList.Criminal_Records_Report__c }]
            },
            {
                label: 'WORK HISTORY', tabName: 'Work_History', isDetailsTab: false, childObjects: [
                    { label: 'Projects', relName: 'Employees__r', objName: 'Work_Order_Employee__c', colList: this.fieldList.Work_Order_Employee__c },
                    { label: 'Observations', relName: 'Observations1__r', objName: 'Observations__c', colList: this.fieldList.Observations__c },
                    { label: 'Incidents', relName: 'Event_Reportings__r', objName: 'Incidents__c', colList: this.fieldList.Incidents__c }]
            },
            {
                label: 'ALERTS', tabName: 'Alerts', isDetailsTab: false, childObjects: [
                    { label: 'Alerts', relName: 'Alerts__r', objName: 'Alert__c', colList: this.fieldList.Alert__c }]
            }
            ]
        };
    }

    toggleOptionalTab() {
        this.showTabFour = !this.showTabFour;
    }

    // gotoParentHandler(event)
    // {
    //     console.log('ProjectsTabset',JSON.stringify(event.detail));
    //     var gotoParentPage=new CustomEvent('getchildnavobjectfromtabset',{
    //         detail:event.detail
    //     });
    //     this.dispatchEvent(gotoParentPage);
    // }

    // gotoParentonBackClickHandler(event)
    // {
    //     console.log('ProjectsTabset',JSON.stringify(event.detail));
    //     var gotoParentPageOnBackClick=new CustomEvent('getchildnavobjectfromtabsetonbackclick',{
    //         detail:event.detail
    //     });
    //     this.dispatchEvent(gotoParentPageOnBackClick);
    // }

    gotoParentHandler(event)
    {
        console.log('Employee Tabset',JSON.stringify(event.detail));
        var gotoParentPage=new CustomEvent('getchildnavobjectfromtabset',{
            detail:event.detail
        });
        this.dispatchEvent(gotoParentPage);
    }

    gotoParentonBackClickHandler(event)
    {
        console.log('Employee Tabset',JSON.stringify(event.detail));
        var gotoParentPageOnBackClick=new CustomEvent('getchildnavobjectfromtabsetonbackclick',{
            detail:event.detail
        });
        this.dispatchEvent(gotoParentPageOnBackClick);
    }
}