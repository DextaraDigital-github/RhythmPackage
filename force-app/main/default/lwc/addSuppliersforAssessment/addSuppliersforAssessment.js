import { LightningElement,api,track,wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import getAssessmentRecord from '@salesforce/apex/AssessmentController.getAssessmentRecord';
import { NavigationMixin } from 'lightning/navigation';
import getTodayDate from '@salesforce/apex/AssessmentController.getTodayDate';
import { CurrentPageReference } from 'lightning/navigation';
export default class AddSuppliersforAssessment extends NavigationMixin(LightningElement) {
    @api recordId;
    @track suppliersList=[];
    @track existingSuppList=[];
    @track delList;
    todayDate;
    startDate;
    endDate;
    assessmentId;
    showManageSuppliers = false;
    showLWC = false;
    @api source;

    handleSuppliers(){
        this.showManageSuppliers = true;
    }

    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          this.assessmentId = currentPageReference.state.recordId;
       }
    }

    connectedCallback() {
        this.getTodayDate();
        console.log('source--->',this.source);
        if(typeof this.source === 'undefined'){
            this.showLWC = true;
        }
    }

    getTodayDate(){
        getTodayDate()
        .then(result => {
            if(result){
                this.todayDate = result;
            }
        })
        .catch(error => {
            //console.log(error);
        });
    }

    @wire(getAssessmentRecord, { assessmentId: '$recordId'})
    getAssessmentRecord_wiredData(result) {
        if (result.data) {
            this.assessmentRecord = result.data[0];
            this.startDate = result.data[0].Rhythm__Start_Date__c;
            this.endDate = result.data[0].Rhythm__End_Date__c;
        } else if (result.error) {
            //console.log(result.error);
        }
    }

    handleAdd(){
        try{
            let deleteListStr = '';
            let exSupListStr = '';
            if(this.existingSuppList.length>0){
                exSupListStr = JSON.stringify(this.existingSuppList);
            }
             if(this.delList.length>0){
                deleteListStr = JSON.stringify(this.delList);
            }
            let todayDate =  new Date(this.todayDate).toISOString().substring(0, 10);
            let save = false;
            if(this.endDate !== undefined){
                if(new Date(todayDate)>=new Date(this.startDate) &&  new Date(todayDate) <=new Date(this.endDate)){
                    save = true;
                }
            }else if(new Date(todayDate)>=new Date(this.startDate)){
                save = true;
            }
            if(save){
                if(this.suppliersList.length > 0 || this.delList.length>0){
                    addSuppliers({assessmentRecord:this.assessmentRecord,operationType:'update',suppliers:JSON.stringify(this.suppliersList),existingSups:exSupListStr,deleteList:deleteListStr})
                    .then(result => {
                        if(result.isSuccess === true){
                            this.showManageSuppliers = false;
                            this.source = false;
                            this.showLWC = false;
                            this.showNotification('Success','Suppliers Added to Assessments Successfully.','success');
                            this.closeModal();
                            this.navigateToRecordPage();
                        }else{
                            //this.showNotification('Error',result.message,'error');
                        }
                    })
                    .catch(error => {
                        //console.log('erroDetails----->',error);
                        this.showNotification('Error',error.body.message,'error');
                    });
                }else{
                    this.showNotification('Error','Select at least one Supplier to create the Assessment Program','error');
                }
            }else{
                this.showNotification('Error','Suppliers who received the Assessment cannot be removed from the Assessment Program.','error');
            }
        }catch(e){
            //console.log(e);
        }
    }

    updateSupplierData(event){
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
        if(this.source){
            this.source = false;
        }else{
            this.showManageSuppliers = false;
        }
        this.navigateToRecordPage();
    }
    navigateToRecordPage(){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
              objectApiName: "Rhythm__Assessment__c",
              actionName: "view",
              recordId: this.recordId
            }
        });
    }
}