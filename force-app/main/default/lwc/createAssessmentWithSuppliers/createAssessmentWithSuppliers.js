import { LightningElement,track,wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import { CurrentPageReference } from 'lightning/navigation';
import { RefreshEvent } from 'lightning/refresh';

export default class CreateAssessmentWithSuppliers extends NavigationMixin(LightningElement) {
    showNewAssessment=true;
    showModal = true;
    showSuppliers = false;
    @track suppliersList=[];
    modalHeading = 'New Assessment';
    assessmentId ='';
    templateId = '';
    dateValue;
    frequencyValue = 'One Time';
    isTempRO = false;
    @track assessmentRecord;

    get startDate(){
        if(this.dateValue == undefined){
          this.dateValue = new Date().toISOString().substring(0, 10);
        }
        return this.dateValue;
    }

    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
            if(currentPageReference.state.c__templateId != undefined){
                this.templateId = currentPageReference.state.c__templateId;
                this.isTempRO = true;
            }
          console.log('pageParms----->',currentPageReference.state.c__templateId);
        }
    }
    
    handleNext(event){
        try{
            event.preventDefault();
            let isSave = this.validateData(); // can be removed
            if(isSave){
                let fields = event.detail.fields;
                console.log('refFields--------->',JSON.stringify(fields));
                fields = Object.assign( { 'sobjectType': 'Rhythm__Assessment__c'}, fields );
                this.assessmentRecord = fields;
                this.showNewAssessment = false;
                this.showSuppliers = true;
                this.modalHeading = 'Add Suppliers';
            }else{
                this.showNotification('Error','Please fill all the required fields','error');
            }
        }catch(e){
            console.log('handleNextError----->',e)
        }
    }

    validateData(){
        let isSave = true;
        if(this.template.querySelector(`[data-id="name"]`).value == null||
        (!this.template.querySelector(`[data-id="template"]`).value) || 
        (!this.template.querySelector(`[data-id="category"]`).value) ||
        this.template.querySelector(`[data-id="startdate"]`).value == null){
            isSave = false;
        }
        return isSave;
    }

    addSuppliers(event){
        try{
            console.log('AddSuppliersMethod------->',JSON.stringify(this.suppliersList));
            console.log('assessmentRecord--------->',JSON.stringify(this.assessmentRecord));
            if(this.suppliersList.length > 0){
                addSuppliers({assessmentRecord:this.assessmentRecord,operationType:'new',suppliers:JSON.stringify(this.suppliersList),deleteList:''})
                .then(result => {
                    console.log('addSuppliers Result------->'+JSON.stringify(result));
                    if(result.isSuccess == true){
                        this.showModal = false;
                        this.assessmentId = result.recordId;
                        this.showNotification('Success','Assessment created and suppliers added successfully.','success');
                        this.navigateToRecordPage();
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
        }catch(e){
            console.log('error----->',e);
        }
    }

    updateSupplierData(event){
        console.log('updatedSupplierData------>'+JSON.stringify(event.detail));
        this.suppliersList = event.detail.newSuppliers;
    }

    closeModal(){
        this.showModal = false;
        if(this.templateId != undefined && this.templateId){
            this.navigateRelatedListView();
        }else{
            this.navigateToObjectHome();
        }
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
    navigateToRecordPage(){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
              objectApiName: "Rhythm__Assessment__c",
              actionName: "view",
              recordId: this.assessmentId
            }
        });
    }
    // Navigation to Related list 
    navigateRelatedListView() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.templateId,
                objectApiName: 'Rhythm__Assessment_Template__c',
                relationshipApiName: 'Rhythm__Assessments__r',
                actionName: 'view'
            },
        });
    }
}