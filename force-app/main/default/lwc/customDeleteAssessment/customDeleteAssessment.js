import { LightningElement,api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteAssessment from '@salesforce/apex/AssessmentController.deleteAssessment';

export default class CustomDeleteAssessment extends NavigationMixin(LightningElement) {
    @api recordId;

    handleConfirm(){
        deleteAssessment({assessmentId:this.recordId})
        .then(result => {
            if(result.isSuccess === true){
                this.showNotification('Success','Assessment Deleted Successfully','success');
                this.navigateToObjectHome();
                this.handleCancel();
            }else{
                this.showNotification('Error',result.message,'error');
            }
        })
        .catch(error => {
            let error_msg = error.body.message;
            this.showNotification('Error',error_msg.toString(),'error');
        });
    }
    handleCancel(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    showNotification(title,message,variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    navigateToObjectHome(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Rhythm__Assessment__c',
                actionName: 'home'
            },
        });
    }
}