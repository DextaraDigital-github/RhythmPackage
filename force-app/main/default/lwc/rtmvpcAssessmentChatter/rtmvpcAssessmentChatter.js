/* Component Name   : rtmvpcAssessmentChatter
* Developer         : Reethika Velpula and Sai Koushik Nimmaturi           
* Created Date      : 
* Description       : This component is used for conversation between vendor and customer
* Last Modified Date: 
*/  
import { LightningElement,track } from 'lwc';
import getChatterResponse from '@salesforce/apex/AssessmentController.getResponseList';
import getUserName from '@salesforce/apex/AssessmentController.getUserName';
import saveChatterResponse from '@salesforce/apex/AssessmentController.saveChatterResponse';
import { LogRecord } from 'c/rtmvpcUtilityComponent';

export default class RtmvpcAssessmentChatter extends LightningElement {
    questionId='a0853000003HQvSAAW';
    sectionId;
    newChat;
    userName;
    assessmentId='a04530000032N9zAAE';
     @track responseList=[];
    @track responseMap = {};
    @track newResponse=[];  
   connectedCallback() {
      /*This method is used to get the username */
       getUserName({}).then((result)=>{
          this.userName=result;
       })
       /*This method is used to get conversation history between vendor and customer on onload */
    getChatterResponse({assessmentId : this.assessmentId, questionId: this.questionId }).then((result) => {
       
       if(('Rythm__Conversation_History__c' in result[0]))
       {
       this.newResponse=JSON.parse(result[0].Rythm__Conversation_History__c);
        this.responseList=  this.newResponse;
       }
         
    }).catch((err) => {
     //  var res= LogRecord('rtmvpcAssessmentChatter','getResponseList','AssessmentController',err);
    });

   }
   /*This method is used to save the conversation history between vendor and customer */
   callChatterResponse(response)
   {
        saveChatterResponse({responseList:JSON.stringify(response),assessmentId : this.assessmentId, questionId: this.questionId}).then((resultData) => {
     
         }).catch((err) => {
             console.log('error');
        
       });
   }
   chatChangeHandler(event)
   {
     this.newChat = event.target.value;
   }
   handleRightButtonClick(event)
   {
       /*This method is used to get conversation history between vendor and customer after firing the event */
        getChatterResponse({assessmentId : this.assessmentId, questionId: this.questionId }).then((result1) => {
           if(result1[0].Rythm__Conversation_History__c !=null)
           {
           this.newResponse=JSON.parse(result1[0].Rythm__Conversation_History__c);
           }
           this.responseMap.Text=this.newChat;
           this.responseMap.createdTime=result1[0].CreatedDate;
           this.responseMap.Name=this.userName;
           this.responseMap.recipientType='Vendor';
           this.newResponse.push(this.responseMap);
           this.callChatterResponse(this.newResponse);
           this.responseList=  this.newResponse;
            this.newChat='';
         console.log('newResponse',this.newResponse);
         }).catch((err) => {
        
         });
 
   }

}