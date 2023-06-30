import { LightningElement, track, wire,api } from 'lwc';
import getRecordsList from '@salesforce/apex/AssessmentTemplateController.getSections';
export default class SearchComponentLwc extends  LightningElement{
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
   
   hideValues()
   {
     console.log('Yes');
     var _this = this;
     const myTimeout = setTimeout(()=>{_this.showSearchedValues = false;}, 300);
    }
   handleClick(event){
     console.log('Yeah');
        getRecordsList({sectionName:this.lookupName,templateId:this.templateId})
        .then(data => {
        this.messageResult=false;
         if (data) {
           // TODO: Error handling 
           console.log('data::'+data.length);
           if(data.length>0 && this.isShowResult){
               this.lookupValuesList = data;                
               this.showSearchedValues = true; 
               this.messageResult=false;
           }            
           else if(data.length==0){
               this.lookupValuesList = [];                
               this.showSearchedValues = false;
               if(this.lookupName!='')
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
      });
        
   
    this.isShowResult = true;   
    this.messageResult=false;        
  }
  handleKeyChange(event){       
    this.messageResult=false; 
    this.lookupName = event.target.value;
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
    console.log('lookupId::'+this.lookupId);    
    const selectedEvent = new CustomEvent('selectedvalue', { detail: this.lookupId });
        // Dispatches the event.
    this.dispatchEvent(selectedEvent);    
} 
}