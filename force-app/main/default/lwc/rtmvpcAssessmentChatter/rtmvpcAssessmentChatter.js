/* Component Name   : rtmvpcAssessmentChatter
* Developer         : Reethika Velpula and Sai Koushik Nimmaturi           
* Created Date      : 
* Description       : This component is used for conversation between vendor and customer
* Last Modified Date: 
*/
import { LightningElement, track, api } from 'lwc';
import getChatterResponse from '@salesforce/apex/AssessmentController.getResponseList';
import getUserName from '@salesforce/apex/AssessmentController.getUserName';
import saveChatterResponse from '@salesforce/apex/AssessmentController.saveChatterResponse';
import errorLogRecord from '@salesforce/apex/AssessmentController.errorLogRecord';
export default class RtmvpcAssessmentChatter extends LightningElement {
   @api chattermap;
   @track questionId;
   @track assessmentId;
   @track chatDataMap = {};
   @track newChat;
   userName;
   @track responseList = [];
   @track showResponse = false;
   @track responseMap = {};
   @track newResponse = [];
   @api recordid;
   @track responseWrapper = {};

   connectedCallback() {
      this.questionId = this.chattermap.questionId;
      this.assessmentId = this.chattermap.assesmentId;
      this.accountType = this.chattermap.accountType;
      console.log('kkkk',this.chattermap);
      /*getUserName is used to get the username */
      getUserName({}).then((result) => {
         this.userName = result;
      });
      console.log('kkkk');
      this.responseWrapper.assessmentId = this.assessmentId;
      this.responseWrapper.questionId = this.questionId;
      console.log('kkkk', this.responseWrapper);

      /*getChatterResponse is used to get conversation history between vendor and customer on onload */
      getChatterResponse({ responseWrapper: JSON.stringify(this.responseWrapper) }).then((result) => {
         console.log('Chatter result', result);
         if (typeof result != 'undefined') {
            if (('Rhythm__Conversation_History__c' in result[0])) {
               this.newResponse = JSON.parse(result[0].Rhythm__Conversation_History__c);
               if (typeof this.recordid != 'undefined') {
                  for (let i = 0; i < this.newResponse.length; i++) {
                     if (this.newResponse[i].accountType == 'customer') {
                        console.log('hhhh');
                        this.newResponse[i].recipientType = 'cad-cd-customer';
                     }
                     else {
                         console.log('hhhhfff');
                        this.newResponse[i].recipientType = 'cad-cd-supplier';
                        console.log('hhhhfff',this.newResponse[i].recipientType);
                     }
                  }
               }
               else {
                  for (let i = 0; i < this.newResponse.length; i++) {
                     if (this.newResponse[i].accountType == 'customer') {
                        this.newResponse[i].recipientType = 'cad-ad-customer';
                     }
                     else {
                        this.newResponse[i].recipientType = 'cad-ad-supplier';
                     }
                  }
               }
               this.responseList = this.newResponse;
               this.showResponse = true;
            }
         }
         else {
            this.showResponse = false;
         }

      }).catch((err) => {
         var errormap = {};
         errormap.componentName = 'RtmvpcAssessmentChatter';
         errormap.methodName = 'getChatterResponse';
         errormap.className = 'AssessmentController';
         errormap.errorData = err.message;
         errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then((result) => {
         });
      });
      console.log('response', this.responseList);
   }
   /*callChatterResponse is used to save the conversation history between vendor and customer in the response record */
   callChatterResponse(response) {
      console.log('callChatterResponse response', response);
      this.responseWrapper.responseList = response;
      saveChatterResponse({ chatWrapperstring: JSON.stringify(this.responseWrapper) }).then((resultData) => {

      }).catch((err) => {
         var errormap = {};
         errormap.componentName = 'RtmvpcAssessmentChatter';
         errormap.methodName = 'saveChatterResponse';
         errormap.className = 'AssessmentController';
         errormap.errorData = err.message;
         errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then((result) => {
         });

      });
   }

   /*chatChangeHandler is used to get the message typed in the message box */
   chatChangeHandler(event) {
      this.newChat = event.target.value;
   }

   /* handleRightButtonClick is used to save the newly typed message to the response record */
   handleRightButtonClick(event) {
      this.responseWrapper.assessmentId = this.assessmentId;
      this.responseWrapper.questionId = this.questionId;
      /*This method is used to get conversation history between vendor and customer after firing the event */
      getChatterResponse({ responseWrapper: JSON.stringify(this.responseWrapper) }).then((result1) => {
         console.log('ssss',result1);
         if(result1.length !=0  )
         {
         if (typeof result1[0].Rhythm__Conversation_History__c != 'undefined') {
            this.newResponse = JSON.parse(result1[0].Rhythm__Conversation_History__c);
         }
         if(typeof result1[0].CreatedDate!='undefined')
         {
            this.responseMap.createdTime = result1[0].CreatedDate;
         }
         
         }
         console.log('sssshhh');
         this.responseMap.Text = this.newChat;
         this.responseMap.Name = this.userName;
         console.log('this.recordid', this.recordid);

         if (typeof this.recordid != 'undefined') {
                  for (let i = 0; i < this.newResponse.length; i++) {
                     if (this.newResponse[i].accountType == 'customer') {
                        console.log('hhhh');
                        this.newResponse[i].recipientType = 'cad-cd-customer';
                     }
                     else {
                         console.log('hhhhfff');
                        this.newResponse[i].recipientType = 'cad-cd-supplier';
                        console.log('hhhhfff',this.newResponse[i].recipientType);
                     }
                  }
               }
               else {
                  for (let i = 0; i < this.newResponse.length; i++) {
                     if (this.newResponse[i].accountType == 'customer') {
                        this.newResponse[i].recipientType = 'cad-ad-customer';
                     }
                     else {
                        this.newResponse[i].recipientType = 'cad-ad-supplier';
                     }
                  }
               }



         if (this.recordid != null || typeof this.recordid != 'undefined') {
            
            console.log('this.accountType',this.accountType);
            this.responseMap.accountType = 'customer';
            if (this.accountType == 'vendor') {
               this.responseMap.recipientType = 'cad-cd-customer';
            }
            else if (this.accountType == 'supplier') {
               this.responseMap.recipientType = 'cad-cd-supplier';
            }
         
         }
         else {
            this.responseMap.accountType = 'supplier';
            if (this.accountType == 'vendor') {
               this.responseMap.recipientType = 'cad-ad-customer';
            }
            else if (this.accountType == 'supplier') {
               this.responseMap.recipientType = 'cad-ad-supplier';
            }

         }

         
         console.log('Hello i am at 145');

         this.newResponse.push(this.responseMap);
         this.callChatterResponse(this.newResponse);
         this.responseList = this.newResponse;
         this.showResponse = true;
         this.newChat = '';
         console.log('newResponse', this.newResponse);
         this.chatDataMap.conversationHistory = JSON.stringify(this.responseList);
         this.chatDataMap.questionId = this.questionId;

         /* This dispatch event is used to assign the conversation data to the main wrapper (questionnaire) to update the data in the latest records. */
         const selectedEvent = new CustomEvent('chatconversation', {
            detail: this.chatDataMap
         });
         /* Dispatches the event.*/
         this.dispatchEvent(selectedEvent);
      }).catch((err) => {
         var errormap = {};
         errormap.componentName = 'RtmvpcAssessmentChatter';
         errormap.methodName = 'getChatterResponse';
         errormap.className = 'AssessmentController';
         errormap.errorData = err.message;
         errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then((result) => {
         });
      });

   }

}