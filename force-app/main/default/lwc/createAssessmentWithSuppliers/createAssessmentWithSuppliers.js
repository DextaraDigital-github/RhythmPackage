import { LightningElement,track,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import getTemplateData from '@salesforce/apex/AssessmentController.getTemplateData';
import getTodayDate from '@salesforce/apex/AssessmentController.getTodayDate';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
import TIME_ZONE from '@salesforce/i18n/timeZone';
import LOCALE_DATA from '@salesforce/i18n/locale';


export default class CreateAssessmentWithSuppliers extends NavigationMixin(LightningElement) {
    showModal = true;
    showNewAssessment=false;
    isTemplateInactive = false;
    showSuppliers = false;
    @track suppliersList=[];
    modalHeading = 'New Assessment';
    assessmentId ='';
    @api values = { name: '', template: '', frequencyvalue: 'One Time', startdate: '', enddate:'', category:'', disclosure:'', description:'' };
    @api templateId;
    dateValue;
    frequencyValue = 'One Time';
    @track assessmentRecord;
    timeZone = TIME_ZONE;
    locale = LOCALE_DATA;
    todayDate;
    templateStatus ='';

    connectedCallback() {
        this.getTodayDate();
        this.fetchTemplateData();
    }

    handleChange(event){
        this.templateId = event.target.value;
        this.fetchTemplateData();
    }

    getTodayDate(){
        getTodayDate()
        .then(result => {
            if(result){
                this.todayDate = result;
            }
        })
        .catch(error => {
           
        });
    }

    fetchTemplateData(){
        getTemplateData({templateId:this.templateId})
        .then(result => {
            if(result){
                this.templateStatus = result[0].Rhythm__Status__c;
                if(result[0].Rhythm__Status__c === 'Inactive'){
                    this.isTemplateInactive = true;
                    this.showNewAssessment = false;
                }else{
                    this.showNewAssessment = true;
                }
            }else{
                this.showNewAssessment = true;
            }
        })
        .catch(error => {
            this.showNewAssessment = true;
            let errormap = {}; 
            errormap.componentName = 'CreateAssessmentWithSuppliers'; 
            errormap.methodName = 'fetchTemplateData'; 
            errormap.className = 'AssessmentController';
            errormap.errorData = error.message; 
            errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => { });
        });
    }

    get startDate(){
        if(typeof this.dateValue === 'undefined'){
            this.dateValue= new Date().toLocaleString(this.locale, {timeZone: this.timeZone})
        }
        return this.dateValue;
    }

    updateValuesHandler(event)
    {
        this.values[event.currentTarget.dataset.id] = event.target.value;
    }
    
    handleNext(event){
        try{
            event.preventDefault();
            let validatedData = this.validateData();
            if(validatedData.isSave){
                let fields = event.detail.fields;
                fields = Object.assign( { 'sobjectType': 'Rhythm__Assessment__c'}, fields );
                this.assessmentRecord = fields;
                this.showNewAssessment = false;
                this.showSuppliers = true;
                this.modalHeading = 'Add Suppliers';
            }else{
                this.showNotification('Error',validatedData.message,'error');
            }
        }catch(e){
           
        }
    }

    validateData(){
        let validatedDetails = {};
        validatedDetails.isSave = true;
        validatedDetails.message = '';
        let startDate = this.template.querySelector(`[data-id="startdate"]`).value;
        let endDate = this.template.querySelector(`[data-id="enddate"]`).value;
        let todayDate =  new Date(this.todayDate).toISOString().substring(0, 10);
        if(this.templateStatus !== undefined && (this.templateStatus ==='New' || this.templateStatus ==='Inactive')){
            validatedDetails.isSave = false;
            validatedDetails.message = 'Assessment Program can be created only using an Active Template';
        }if(new Date(startDate) < new Date(todayDate)){
            validatedDetails.isSave = false;
            validatedDetails.message = 'Start Date of an Assessment Program cannot be a Past Date'
        }
        else if((typeof endDate !== 'undefined' && endDate !== null) && new Date(endDate) < new Date(startDate)){
            validatedDetails.isSave = false;
            validatedDetails.message = 'End Date of an Assessment Program cannot be before the Start Date'
        }
        return validatedDetails;
    }

    addSuppliers(){
        try{
            if(this.suppliersList.length > 0){
                addSuppliers({assessmentRecord:this.assessmentRecord,operationType:'new',suppliers:JSON.stringify(this.suppliersList),existingSups:'',deleteList:''})
                .then(result => {
                    if(result.isSuccess === true){
                        let successEvent = new CustomEvent("success", {
                        detail: {value:'refreshit'}
                        });
                        this.dispatchEvent(successEvent);
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
           
        }
    }

    updateSupplierData(event){
        this.suppliersList = event.detail.newSuppliers;
    }

    closeModal(){
        this.showModal = false;
        if(this.values.template !== undefined && this.values.template){
            this.navigateRelatedListView();
        }else{
            this.navigateToObjectHome();
        }
        eval("$A.get('e.force:refreshView').fire();");//Todo Prudvi please check this
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
                recordId: this.values.template,
                objectApiName: 'Rhythm__Assessment_Template__c',
                relationshipApiName: 'Rhythm__Assessments__r',
                actionName: 'view'
            },
        });
    }

    backHandler()
    {
        this.showSuppliers = false;
        this.showNewAssessment = true;
    }
}