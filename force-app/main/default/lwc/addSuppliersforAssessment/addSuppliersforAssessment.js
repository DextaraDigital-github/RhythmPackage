import { LightningElement,api,track,wire} from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import getAssessmentRecord from '@salesforce/apex/AssessmentController.getAssessmentRecord';
export default class AddSuppliersforAssessment extends LightningElement {
    @api recordId;
    @track suppliersList=[];
    @track existingSuppList;

    @wire(getAssessmentRecord, { assessmentId: '$recordId'})
    assessmentRecord(result) {
        if (result.data) {
            console.log('assessmentRecord---->',JSON.stringify(result.data));
            this.startDate = result.data[0].Rhythm__Start_Date__c;
        } else if (result.error) {
            console.log('eror---->',result.error);
        }
    }

    handleAdd(){
        let deleteList = [];
        if(this.existingSuppList.length>0){
            for(let supId of this.existingSuppList){
                if(this.suppliersList.indexOf(supId) === -1){
                    deleteList.push(supId);
                }
            }
        }
        let deleteListStr = '';
        if(deleteList.length>0){
            deleteListStr = JSON.stringify(deleteList);
        }
        let dateValue = new Date().toISOString().substring(0, 10);
        console.log('todayDate----->',dateValue);
        console.log('startDate----->',this.startDate);
        if(new Date(this.startDate) >= new Date(dateValue)){
            console.log('AddSuppliersMethod------->',JSON.stringify(this.suppliersList));
            if(this.suppliersList.length > 0){
                addSuppliers({assesmentId:this.recordId,suppliers:JSON.stringify(this.suppliersList),deleteList:deleteListStr})
                .then(result => {
                    console.log('addSuppliers Result------->'+JSON.stringify(result));
                    if(result.isSuccess == true){
                        this.showModal = false;
                        this.showNotification('Success','Suppliers Added to Assessments Successfully.','success');
                        this.closeModal();
                    }else{
                        //this.showNotification('Error',result.message,'error');
                    }
                })
                .catch(error => {
                    this.error = error;
                    //this.showNotification('Error',error,'error');
                });
            }else{
                this.showNotification('Error','Please select atleast one supplier to proceed.','error');
            }
        }else{
            this.showNotification('Error','Suppliers cannot be modified for the past assessments','error');
        }
       
        
    }

    updateSupplierData(event){
        console.log('addSuppliersAssessment------>'+JSON.stringify(event.detail));
        this.suppliersList = event.detail.newSuppliers;
        this.existingSuppList = event.detail.existingSupps;
    }

    showNotification(title,message,variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    closeModal() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}