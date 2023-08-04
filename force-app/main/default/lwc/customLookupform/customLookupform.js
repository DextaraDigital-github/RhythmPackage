import { LightningElement, track, api } from 'lwc';
import getRecordsList from '@salesforce/apex/CAPAController.getRecordsList';
export default class CustomLookupform extends  LightningElement{
    @track lookupName='';
    @track lookupValuesList = [];
    @track lookupId;
    @api objLabel;
    @api templateId;
    @track isshow=false;
    @track messageResult=false;
    @track isShowResult = true;
    @track showSearchedValues = false;   
    @api lookupLabel;
    @api result;
    @api supplier;
    //@api lookupLabelName;
   
   hideValues()
   {
     var _this = this;
     setTimeout(()=>{_this.showSearchedValues = false;}, 300);
    }
    connectedCallback() {
      console.log('resultdata',this.result);
      if(typeof this.result !='undefined'){
         if(this.lookupLabel === 'Ownership' && typeof this.result.Rhythm__Ownership__r != 'undefined' )
         {
           this.lookupName = this.result.Rhythm__Ownership__r.Name;
         } 
         if(this.lookupLabel === 'Assigned To' && typeof this.result.Rhythm__Assigned_To__r.Name != 'undefined')
         {
           this.lookupName = this.result.Rhythm__Assigned_To__r.Name;
         }
         if(this.lookupLabel === 'Ownership' && typeof this.result.Rhythm__Ownership__r == 'undefined' )
         {
           this.lookupName = this.result.Rhythm__OwnershipName__c;
         } 

    }
    console.log('mmm',this.lookupName);    
    }
   handleClick(){
        getRecordsList({userName:this.lookupName})
        .then(data => {
          console.log('data',data);
        this.messageResult=false;
         if (data) {
           // TODO: Error handling 
           if(data.length>0 && this.isShowResult){
               this.lookupValuesList = data;                
               this.showSearchedValues = true; 
               this.messageResult=false;
           }            
           else if(data.length === 0){
               this.lookupValuesList = [];                
               this.showSearchedValues = false;
               if(this.lookupName !== '')
                   this.messageResult=true;               
           } 
         } 
          })
          .catch(error => {
            this.lookupId =  '';
            this.lookupName =  '';
            this.lookupValuesList=[];           
            this.showSearchedValues = false;
            this.messageResult=true;
            console.log(error);
      });
        
   
    this.isShowResult = true;   
    this.messageResult=false;        
  }
  handleKeyChange(event){       
    this.messageResult=false; 
    this.lookupName = event.target.value;
    console.log('this.lookupName',this.lookupName);
    if( this.lookupName === '') {
                   this.lookupId = '';
                   const selectedEvent = new CustomEvent('selectedvalue', { detail:  this.lookupName });
                   this.dispatchEvent(selectedEvent); 
               }
  } 
  handleParentSelection(event){     
    this.showSearchedValues = false;
    this.isShowResult = false;
    this.messageResult=false;
    //Set the parent calendar id
    this.lookupId =  event.target.dataset.value;
    //Set the parent calendar label
    this.lookupName =  event.target.dataset.label; 
    console.log('this.lookupName',this.lookupName ,'Id:',this.lookupId)
    const selectedEvent = new CustomEvent('selectedvalue', { detail: this.lookupId });
        // Dispatches the event.
    this.dispatchEvent(selectedEvent);    
} 
}