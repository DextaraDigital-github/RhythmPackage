import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchAssessments from '@salesforce/apex/EmailController.fetchAssessments';

export default class SendEmailLWCButton extends LightningElement {
    @api recordId;
    @api recordName;
    @track show = { sendEmail: false };

    /* Configures toast message to diplay on UI */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    sendEmailHandler() {
        let _parameterMap = { recordId: this.recordId };
        fetchAssessments({ parameterMap: JSON.stringify(_parameterMap) }).then(result => {
            if (typeof result !== 'undefined' && result.length > 0 && typeof result[0].Name !== 'undefined') {
                this.recordName = result[0].Name;
                this.show.sendEmail = true;
            }
        }).catch(error => {
            this.configureToast('Some error has occured', 'Please contact your Administrator.', 'error');
        });
    }
}