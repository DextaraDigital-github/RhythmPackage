import { LightningElement,api,track } from 'lwc';
import selectedActionRecord from '@salesforce/apex/CAPAController.selectedActionRecord';
import saveActionResponse from '@salesforce/apex/CAPAController.saveActionResponse';
import greenFlag from '@salesforce/resourceUrl/greenFlag';
import redFlag from '@salesforce/resourceUrl/redFlag';
import notifyUsers from '@salesforce/apex/CAPAController.notifyUsers';

export default class ActionDetailForm extends LightningElement {

    @api actionid;
    @track actionFormData;
    @track showresponse;
    @track showToast=false;
    @track success=false;
    @track isSave=true;
    @track showPopup=false;
    @track options =[{label :'Open', value:'Open'},
    {label:'Closed',value : 'Closed'}
    ];
    greenFlagUrl = greenFlag;
    redFlagUrl = redFlag;
    
    connectedCallback() {
        selectedActionRecord({actionid:this.actionid}).then(res=>{
          this.actionFormData=res;
          if(this.actionFormData[0].Rhythm__Status__c === 'Closed'){
            this.isSave=false;
        }
               
        })

    }
    handleChange(event) {
    let changedData = event.target.value;
    let name = event.currentTarget.dataset.id;
    this.actionFormData[0][name] = changedData;
    this.showresponse = [];
    this.showresponse.push(this.actionFormData[0]);
  }
    handleSave(){
      this.showPopup=true;
    }
    handleCancelButton(){
            this.showPopup=false;
    }
    handleCloseButton(){
      saveActionResponse({ actionResponse: this.showresponse ,isUpdate:true}).then(() => {
        console.log('kkkkk',this.showresponse);
        this.showPopup=false;
        this.showToast = true;
        this.success=true;
        this.totastmessage = 'Action form Submitted successfully';
        if(this.actionFormData[0].Rhythm__Status__c === 'Closed'){
          let userlist = [];
              userlist.push(this.showresponse[0].Rhythm__Ownership__c);
              notifyUsers({ actionData: (this.showresponse[0]), body: 'Action Item has been marked as closed', userList: userlist }).then(() => {

            }).catch(error => {
              console.log('ggfgf', error);
            })
            this.isSave=false;
        }

        })

    }
    closeToastHandler(event){
         this.showToast = event.detail.showModal;
    }

}