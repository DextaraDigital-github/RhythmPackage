import { LightningElement,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.addSuppliers';

export default class CreateAssessmentWithSuppliers extends NavigationMixin(LightningElement) {
    showNewAssessment=true;
    showModal = true;
    showSuppliers = false;
    @track suppliersList;
    modalHeading = 'New Assessment';
    assesmentId ='';

    handleNext(event){
        try{
            console.log('IntheSubmit------>');
            const fields = event.detail.fields;
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }catch(e){
            console.log('SubmitError------->',e);
        }
    }
    handleSuccess(event){
        console.log('NewAssessmentRecordId------->',event.detail.id);
        this.assesmentId = event.detail.id;
        this.showNotification('Success','New Assessment Created Successfully.','success');
        this.showNewAssessment = false;
        this.showSuppliers = true;
        this.modalHeading = 'Add Suppliers';
    }

    addSuppliers(){
        console.log('AddSuppliersMethod------->',JSON.stringify(this.suppliersList));
        addSuppliers({assesmentId:this.assesmentId,suppliers:JSON.stringify(this.suppliersList)})
        .then(result => {
            console.log('addSuppliers Result------->'+JSON.stringify(result));
            if(result.isSuccess == true){
                this.showModal = false;
                this.showNotification('Success','Suppliers Added to Assessments Successfully.','success');
                this.navigateToObjectHome();
            }else{
                //this.showNotification('Error',result.message,'error');
            }
        })
        .catch(error => {
            this.error = error;
            //this.showNotification('Error',error,'error');
        });
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

    updateSupplierData(event){
        console.log('updatedSupplierData------>'+JSON.stringify(event.detail));
        this.suppliersList = event.detail;
    }

    closeModal(){
        this.showModal = false;
        this.navigateToObjectHome();
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