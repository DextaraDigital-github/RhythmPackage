import { LightningElement,api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import createTemplateVersion from '@salesforce/apex/TemplateController.createTemplateVersion';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateTemplateVersion extends LightningElement {
    @api recordId;
    isLoaded = false;
    closeModal() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    createNewVersion(){
        createTemplateVersion({recordId:this.recordId})
        .then(result => {
            this.isLoaded = true;
            if(result.isSuccess === true){
                this.showNotification('Success','New Version Created Successfully.','success');
                this.closeModal();
                this.isLoaded = false;
            }else{
                this.showNotification('Error','error',result.message);
                this.isLoaded = false;
            }
        })
        .catch(error => {
            console.log(error);
            this.showNotification('Error','error',error);
            this.isLoaded = false;
        });
    }

    showNotification(title,message,variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}