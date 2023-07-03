import { LightningElement,api,track,wire} from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
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

    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          console.log(currentPageReference);
          this.assessmentId = currentPageReference.state.recordId;
       }
    }

    connectedCallback() {
         console.log('PARNTRECORDID---->',this.assessmentId);
         console.log('PARNTRECORDID---->',this.recordId);
        this.getTodayDate();
    }

    getTodayDate(){
        getTodayDate()
        .then(result => {
            console.log(JSON.stringify(result));
            if(result){
                this.todayDate = result;
            }
        })
        .catch(error => {
            console.log(JSON.stringify(error));
        });
    }

    @wire(getAssessmentRecord, { assessmentId: '$recordId'})
    getAssessmentRecord_wiredData(result) {
        if (result.data) {
            console.log('getAssessmentRecord : ',JSON.stringify(result.data));
            this.assessmentRecord = result.data[0];
            this.startDate = result.data[0].Rhythm__Start_Date__c;
            this.endDate = result.data[0].Rhythm__End_Date__c;
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
            console.log('todayDate----->',this.todayDate);
            console.log('startDate----->',this.startDate);
            console.log('endDate----->',this.endDate);
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
                console.log('AddSuppliersMethod------->',JSON.stringify(this.suppliersList));
                if(this.suppliersList.length > 0 || this.delList.length>0){
                    addSuppliers({assessmentRecord:this.assessmentRecord,operationType:'update',suppliers:JSON.stringify(this.suppliersList),existingSups:exSupListStr,deleteList:deleteListStr})
                    .then(result => {
                        console.log('addSuppliers Result------->'+JSON.stringify(result));
                        if(result.isSuccess === true){
                            this.showModal = false;
                            this.showNotification('Success','Suppliers Added to Assessments Successfully.','success');
                            this.closeModal();
                            this.navigateToRecordPage();
                        }else{
                            //this.showNotification('Error',result.message,'error');
                        }
                    })
                    .catch(error => {
                        console.log('erroDetails----->',error);
                        this.showNotification('Error',error.body.message,'error');
                    });
                }else{
                    this.showNotification('Error','Please select atleast one supplier to proceed.','error');
                }
            }else{
                this.showNotification('Error','Suppliers cannot be modified for the past assessments','error');
            }
        }catch(e){
            console.log(e);
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