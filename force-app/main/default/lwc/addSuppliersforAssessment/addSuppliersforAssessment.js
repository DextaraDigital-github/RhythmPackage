import { LightningElement,api,track,wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import getAssessmentRecord from '@salesforce/apex/AssessmentController.getAssessmentRecord';
import { NavigationMixin } from 'lightning/navigation';
import getTodayDate from '@salesforce/apex/AssessmentController.getTodayDate';
import { CurrentPageReference } from 'lightning/navigation';
import { RefreshEvent } from 'lightning/refresh';
import { loadStyle } from 'lightning/platformResourceLoader';
import CUS_STYLES from '@salesforce/resourceUrl/rtmcpcsldscustomstyles';

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

    handleRefresh() {
        this.dispatchEvent(new RefreshEvent());
    }

    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          this.assessmentId = currentPageReference.state.recordId;
       }
    }

    connectedCallback() {
        this.getTodayDate();
        if(typeof this.source === 'undefined'){
            this.showLWC = true;
        }
        Promise.all([
            loadStyle(this, CUS_STYLES),
        ]).then(() => {
        })
            .catch(error => {
            });
    }

    getTodayDate(){
        getTodayDate()
        .then(result => {
            if(result){
                this.todayDate = JSON.parse(JSON.stringify(result));
            }
        })
        .catch(error => {
        });
    }

    @wire(getAssessmentRecord, { assessmentId: '$recordId'})
    getAssessmentRecord_wiredData(result) {
        if (result.data) {
            this.assessmentRecord = result.data[0];
            this.startDate = result.data[0].Rhythm__Start_Date__c;
            this.endDate = result.data[0].Rhythm__End_Date__c;
        } else if (result.error) {
            
        }
    }

    handleAdd(){
        try{
            let deleteListStr = '';
            let exSupListStr = '';
            if(this.existingSuppList.length>0){
                exSupListStr = JSON.stringify(this.existingSuppList);
            }
             if(typeof this.delList !== 'undefined' && this.delList.length>0){
                deleteListStr = JSON.stringify(this.delList);
            }
            let todayDate =  new Date(this.todayDate).toISOString().substring(0, 10);
            let save = false;
           
            if(this.suppliersList.length > 0 || (typeof this.delList !== 'undefined' && this.delList.length>0)){
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
                    
                    this.showNotification('Error',error.body.message,'error');
                });
            }else{
                this.closeModal();
            }
            
        }catch(e){
            let errString = e.name+' '+e.message;
            this.showNotification('Error',errString,'error');
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
        this.handleRefresh();
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