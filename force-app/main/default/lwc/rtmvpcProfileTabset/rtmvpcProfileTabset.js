import { LightningElement, api } from 'lwc';

export default class RtmvpcProfileTabset extends LightningElement {
    showTabFour;
    @api parentId = 'a0h5i000004oqZEAAY';
    @api fieldList = {
        "Assessment__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Assesment date', fieldName: 'Assesment_date__c' },
        { label: 'Observed Date', fieldName: 'Conducted_Date__c' },
        { label: 'Outcome', fieldName: 'Outcome__c' },
        { label: 'Score', fieldName: 'Score__c' }],
        "Insurance__c": [{ label: 'Name', fieldName: 'Name'},
        { label: 'Date Of Commencement', fieldName: 'Date_Of_Commencement__c', type: 'date' },
        { label: 'Expiration Date', fieldName: 'Expiration_Date__c', type: 'date' },
        { label: 'Insurance Carrier', fieldName: 'Insurance_Carrier__c' }],
        "Lisence__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Is this a certificate or license?', fieldName: 'Is_this_a_certificate_or_license__c' },
        { label: 'Type', fieldName: 'Type__c' },
        { label: 'Issued By', fieldName: 'Issued_By__c' },
        { label: 'License #', fieldName: 'License__c' },
        { label: 'Expires', fieldName: 'Expiry_Date__c', type: 'date' },
        { label: 'Upload Documents', fieldName: 'Upload_Documents__c' }],
        "Policy_Procedure__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Last Uploaded', fieldName: 'Last_Uploaded__c' },
        { label: 'Next Upload', fieldName: 'Next_Upload__c' }]
    };
    @api tabsData;

    connectedCallback() {
        this.tabsData = {
            "Lisence__c": [{ label: 'Details', tabName: 'Details', isDetailsTab: true }],
            "Insurance__c": [{ label: 'Details', tabName: 'Details', isDetailsTab: true }]
        }
    }

    toggleOptionalTab() {
        this.showTabFour = !this.showTabFour;
    }
}