import { LightningElement,api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import updateAssessmentSuppliers from '@salesforce/apex/AssessmentController.updateAssessmentSuppliers';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ActivateAssessmentSchedules extends LightningElement {

    @api recordId;
    closeModal() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
    handleConfirm(){
        console.log('handleConfirm------->',this.recordId);
        updateAssessmentSuppliers({assessmentId:this.recordId})
        .then(result => {
            console.log('updateAssessmentSuppliers:Result------->',JSON.stringify(result));
            if(result.isSuccess == true){
                this.showNotification('Success','Assessments Scheduled Successfully','success');
                this.closeModal();
            }else{
                this.showNotification('Error',result.message,'error');
            }
        })
        .catch(error => {
            console.log('handleConfirm:Error------->',JSON.stringify(result));
            this.showNotification('Error',error,'error');
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