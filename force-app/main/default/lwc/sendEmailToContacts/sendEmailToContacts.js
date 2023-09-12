import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchAccounts from '@salesforce/apex/EmailController.fetchAccounts';

export default class SendEmailToContacts extends LightningElement {
    @api assessmentId;   // Stores the assessment Id coming from Aura Component 
    @api assessmentName;   // Stores the assessment Name coming from Aura Component
    @track show = { spinner: false };   // Conditionally renders/displays data on UI
    @track accountsData;
    @track pageLabelsData;

    connectedCallback() {
        this.show.spinner = true;
        this.fetchAccountsData();
    }

    /* Configures toast message to diplay on UI */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    /* Fetches list of accounts from Apex */
    fetchAccountsData() {
        let _parameterMap = { assessmentId: this.assessmentId };
        fetchAccounts({ parameterMap: JSON.stringify(_parameterMap) }).then(result => {
            this.accountsData = this.formatAccountsData(result);
            this.createPageLabelsData();
            this.template.querySelectorAll('c-send-email')[0].send();
        }).catch(() => {
            this.configureToast('Error loading Accounts', 'Please contact your Administrator.', 'error');
        });
    }
    /* Formats the Account data fetched from Apex into required format so as to display as options in the combobox */
    formatAccountsData(result) {
        let accData = [];
        if (typeof result != 'undefined') {
            result.forEach(acc => {
                accData.push({ Id: acc.Rhythm__Account__c, Name: acc.Rhythm__Account__r.Name });
            });
        }
        return accData;
    }

    /* Creates page labels to display on pages on the UI */
    createPageLabelsData() {
        this.pageLabelsData = { 'page1': 'Choose Suppliers' };
        this.show.spinner = false;
    }

    closeHandler() {
        const close = new CustomEvent('close', {});
        this.dispatchEvent(close);
    }
}