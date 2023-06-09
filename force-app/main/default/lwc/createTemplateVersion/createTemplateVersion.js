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
        console.log('recordId---->',this.recordId);
        createTemplateVersion({recordId:this.recordId})
        .then(result => {
            this.isLoaded = true;
            console.log('createNewVersion------>',JSON.stringify(result));
            if(result.isSuccess == true){
                this.showNotification('Success','New Version Created Successfully.','success');
                this.closeModal();
                this.isLoaded = false;
            }else{
                this.showNotification('Error','error',result.message);
                this.isLoaded = false;
            }
        })
        .catch(error => {
            console.log('createNewVersionError------>',error);
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