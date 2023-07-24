import { LightningElement,api,wire,track } from 'lwc';
import { CurrentPageReference,NavigationMixin } from 'lightning/navigation';
import { CloseActionScreenEvent } from 'lightning/actions';
import cloneTemplate from '@salesforce/apex/TemplateController.doClone';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CloneTemplatewithRelatedRecords extends NavigationMixin(LightningElement) {
    templateId;
    templateName;
    objectApiName = 'Rhythm__Assessment_Template__c';
    @track templateRecord;
    clonedTemplateId;

    @wire(CurrentPageReference)
    getPageReferenceParameters(currentPageReference) {
       if (currentPageReference) {
          this.templateId = currentPageReference.state.recordId;
        }
    }

    handleSubmit(event){
        try{
            event.preventDefault();
            let fields = event.detail.fields;
            fields = Object.assign( { 'sobjectType': 'Rhythm__Assessment_Template__c'}, fields );
            this.templateRecord = fields;
            console.log('templateRecord---->',JSON.stringify(this.templateRecord));
            cloneTemplate({templateId:this.templateId,templateRecord:this.templateRecord})
            .then(result => {
                console.log('cloneTemplateResult------>',JSON.stringify(result));
                if(result.isSuccess){
                    this.showNotification('Success','Template Cloned Successfully.','success');
                    this.clonedTemplateId = result.recordId;
                    this.closeModal();
                }else{
                    this.showNotification('Error',result.message,'error');
                }
            })
            .catch(error => {
                console.log(error);
            });
        }catch(e){
            console.log('handleSubmit----->',e);
        }
    }

    fieldChangeHandler(event){
        this.templateName = event.detail.value;
    }
    closeModal(){
        this.dispatchEvent(new CloseActionScreenEvent());
        let recId = '';
        if(this.clonedTemplateId && this.clonedTemplateId != undefined){
            recId = this.clonedTemplateId;
        }else{
            recId = this.templateId;
        }
        this.navigateToRecordPage(recId);
    }

    navigateToRecordPage(recId){
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
              objectApiName: "Rhythm__Assessment_Template__c",
              actionName: "view",
              recordId: recId
            }
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