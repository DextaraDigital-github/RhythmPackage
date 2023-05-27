import { LightningElement, api } from 'lwc';
export default class RtmvpcDocuments extends LightningElement {
    @api parentId='a14DE00000CRco1YAD';
    @api fieldList = {
        "Insurance__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Aggregate', fieldName: 'Aggregate__c' },
        { label: 'Expiry Date', fieldName: 'Expiry_Date__c', type:'date' }],
        "Lisence__c": [{ label: 'Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Next Upload', fieldName: 'Next_Upload__c', type:'date'  }]
    };
}