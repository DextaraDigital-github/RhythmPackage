import { LightningElement,api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteAssessment from '@salesforce/apex/AssessmentController.deleteAssessment';

export default class CustomDeleteAssessment extends LightningElement {
    @api recordId;

    handleConfirm(){
        console.log('In the Confirm---->',this.recordId);
        deleteAssessment({assessmentId:this.recordId})
        .then(result => {
            console.log('Delete Assessment Result------->'+JSON.stringify(result));
            if(result.isSuccess == true){
                this.showNotification('Success','Assessment Deleted Successfully','success');
                this.handleCancel();
            }else{
                //this.showNotification('Error',result.message,'error');
            }
        })
        .catch(error => {
            this.error = error;
            //this.showNotification('Error',error,'error');
        });
    }
    handleCancel(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}