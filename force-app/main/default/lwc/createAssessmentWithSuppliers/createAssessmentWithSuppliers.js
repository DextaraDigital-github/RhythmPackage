import { LightningElement,track,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addSuppliers from '@salesforce/apex/AssessmentController.sendAssessment';
import getTemplateData from '@salesforce/apex/AssessmentController.getTemplateData';
import fetchAssessmentTemplates from '@salesforce/apex/AssessmentController.fetchAssessmentTemplates';
import getTodayDate from '@salesforce/apex/AssessmentController.getTodayDate';
import fetchlistviewId from '@salesforce/apex/AssessmentController.fetchlistviewId';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
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
    frequencyValue = 'One Time';
    @track assessmentRecord;
    todayDate;
    templateStatus ='';
    @track templateOptions = [];
    startDate;
    @track logoutURL;

    connectedCallback() {
        this.templateId=(this.templateId.length === 0)?null:this.templateId;
        this.getTodayDate();
        this.fetchTemplateData();
        this.fetchAssessmentTempData();
        
    }
    /* Fetches list of Assessment Templates from Apex */
    fetchAssessmentTempData() {
        fetchAssessmentTemplates({}).then(result => {
            this.formatAssessmentTempData(result);
        }).catch(error => {
            this.configureToast('Error loading Templates', 'Please contact your Administrator.', 'error');
        });
    }
    /* Formats the Assessment Template data fetched from Apex into required format so as to display as options in the combobox */
    formatAssessmentTempData(result) {
        this.templateOptions = [];
        if(typeof result != 'undefined'){
            result.forEach(template => {

                this.templateId = (typeof this.templateId != 'undefined' && template.Id.includes(this.templateId))?template.Id:this.templateId;
                this.templateOptions.push({ label: template.Name, value: template.Id, icon: 'custom:custom13' });
            });
        
        }
    }

    /* Displays toast message */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    handleChange(event){
        this.templateId = event.detail.value;
        this.fetchTemplateData();
    }

    getTodayDate(){
        getTodayDate()
        .then(result => {
            if(result){
                this.todayDate = result;
                this.startDate = result;
            }
        })
        .catch(() => {
           
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

    updateValuesHandler(event){
        this.values[event.currentTarget.dataset.id] = event.target.value;
        if(event.currentTarget.dataset.id == 'startdate'){
            this.startDate = event.target.value;
        }
    }
    
    handleNext(event){
        try{
            event.preventDefault();
            let validatedData = this.validateData();
            if(validatedData.isSave){
                let fields = event.detail.fields;
                fields.Rhythm__Template__c = this.templateId;
                fields = Object.assign( { 'sobjectType': 'Rhythm__Assessment__c'}, fields );
                this.assessmentRecord = fields;
                this.showNewAssessment = false;
                this.showSuppliers = true;
                this.modalHeading = 'Add Suppliers';
            }else{

                this.showVfpageNotification('Error',validatedData.message,'error');                
                this.showNotification('Error',validatedData.message,'error');
            }
        }catch(e){
            
        };
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
        if(typeof this.templateId === 'undefined' || this.templateId === null || (typeof this.templateId != 'undefined' && this.templateId != null && this.templateId.trim().length === 0)) {
            validatedDetails.isSave = false;
            validatedDetails.message = 'Template Name cannot be empty';
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
                        this.showNotification('Error',result.message,'error');
                    }
                })
                .catch(error => {
                    this.showNotification('Error',error,'error');
                });
            }else{
                 this.showVfpageNotification('Error','Please select atleast one supplier to proceed.','error');
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
        if(this.templateId !== undefined && this.templateId){
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
     showVfpageNotification(title,message,variant) {
          this.dispatchEvent(new CustomEvent(
            'callvferror',
            {
                detail:{title:title,message:message,variant:variant},
                bubbles: true,
                composed: true,
            }));       
    }


    navigateToObjectHome(){
        let listviewId;
        fetchlistviewId({}).then(result=>{
            listviewId=(result[0].Id).toString();
            this.dispatchEvent(new CustomEvent(
            'callvf',
            {
                detail:{list:listviewId,type:'listview'},
                bubbles: true,
                composed: true,
            }
        ));
        })
        .catch(error=>{

        });
        // this.dispatchEvent(navigateEvent);
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__objectPage',
        //     attributes: {
        //         objectApiName: 'Rhythm__Assessment__c',
        //         actionName: 'home'
        //     },
        // });
       
    }
    navigateToRecordPage(){
         this.dispatchEvent(new CustomEvent(
            'callvf',
            {
                detail:{list:this.assessmentId,type:'record'},
                bubbles: true,
                composed: true,
            }));

        // this[NavigationMixin.Navigate]({
        //     type: "standard__recordPage",
        //     attributes: {
        //       objectApiName: "Rhythm__Assessment__c",
        //       actionName: "view",
        //       recordId: this.assessmentId
        //     }
        // });
    }
    // Navigation to Related list 
    navigateRelatedListView() {
          this.dispatchEvent(new CustomEvent(
            'callvf',
            {
                detail:{list:this.templateId,type:'relatedlist'},
                bubbles: true,
                composed: true,
            }));
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__recordRelationshipPage',
        //     attributes: {
        //         recordId: this.templateId,
        //         objectApiName: 'Rhythm__Assessment_Template__c',
        //         relationshipApiName: 'Rhythm__Assessments__r',
        //         actionName: 'view'
        //     },
        // });
    }

    backHandler()
    {
        this.showSuppliers = false;
        this.showNewAssessment = true;
    }
    getTodayDate(){
        getTodayDate()
        .then(result => {
                this.todayDate = result;
                
            //}
        })
        .catch(error => {
    
        });
    }
}