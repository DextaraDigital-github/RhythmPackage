import { LightningElement,api,track,wire} from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import getAssessmentRecord from '@salesforce/apex/AssessmentController.getAssessmentRecord';
import { getRecordNotifyChange } from "lightning/uiRecordApi";
export default class AddSuppliersforAssessment extends LightningElement {
    @api recordId;
    @track suppliersList=[];
    @track existingSuppList=[];
    @track delList;

    @wire(getAssessmentRecord, { assessmentId: '$recordId'})
    getAssessmentRecord_wiredData(result) {
        if (result.data) {
            console.log('getAssessmentRecord : ',JSON.stringify(result.data));
            this.assessmentRecord = result.data[0];
            this.startDate = result.data[0].Rhythm__Start_Date__c;
        } else if (result.error) {
            console.log('getAssessmentRecord error : ',result.error);
        }
    }

    handleAdd(){
        try{
            console.log('handleAdd - START : ');
            let deleteListStr = '';
            let exSupListStr = '';
            if(this.existingSuppList.length>0){
                exSupListStr = JSON.stringify(this.existingSuppList);
            }
             if(this.delList.length>0){
                deleteListStr = JSON.stringify(this.delList);
            }
            let dateValue = new Date().toISOString().substring(0, 10);
            console.log('todayDate----->',dateValue);
            console.log('startDate----->',this.startDate);
            if(new Date(this.startDate) >= new Date(dateValue)){
                console.log('AddSuppliersMethod------->',JSON.stringify(this.suppliersList));
                if(this.suppliersList.length > 0 || this.delList.length>0){
                    addSuppliers({assessmentRecord:this.assessmentRecord,operationType:'update',suppliers:JSON.stringify(this.suppliersList),existingSups:exSupListStr,deleteList:deleteListStr})
                    .then(result => {
                        console.log('addSuppliers Result------->'+JSON.stringify(result));
                        if(result.isSuccess == true){
                            this.showModal = false;
                            this.showNotification('Success','Suppliers Added to Assessments Successfully.','success');
                            this.closeModal();
                            getRecordNotifyChange([{ recordId: this.assessmentRecord.Id }]);
                        }else{
                            //this.showNotification('Error',result.message,'error');
                        }
                    })
                    .catch(error => {
                        this.error = error;
                        this.showNotification('Error',error,'error');
                    });
                }else{
                    this.showNotification('Error','Please select atleast one supplier to proceed.','error');
                }
            }else{
                this.showNotification('Error','Suppliers cannot be modified for the past assessments','error');
            }
        }catch(e){
            console.log(JSON.stringify(e));
        }
    }

    updateSupplierData(event){
        console.log('addSuppliersAssessment------>'+JSON.stringify(event.detail));
        this.suppliersList = event.detail.newSuppliers;
        this.existingSuppList = event.detail.existingSupps;
        this.delList = event.detail.delList;
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