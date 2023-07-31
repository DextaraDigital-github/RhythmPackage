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
   @track accountassessmentId;
   userName;
   @track responseList = [];
   @track showResponse = false;
   @track responseMap = {};
   @track newResponse = [];
   @api recordid;
   @track responseWrapper = {};
   @track showData = false;

   @api
   displayConversation(chatmap) {
      console.log('catmap',chatmap);
      this.newChat = '';
      this.responseWrapper = {};
      this.showData = chatmap.openChat;
      if (typeof chatmap !== 'undefined' && chatmap) {
         this.chattermap = chatmap;
      }
      this.showData = false;
      this.questionId = this.chattermap.questionId;
      this.assessmentId = this.chattermap.assesmentId;
      this.accountType = this.chattermap.accountType;
      this.accountassessmentId = this.chattermap.accountassessmentId;
      /*getUserName is used to get the username */
      getUserName({}).then((result) => {
         this.userName = result;
      });
      this.responseWrapper.assessmentId = this.assessmentId;
      this.responseWrapper.questionId = this.questionId;
      if (typeof this.recordid !== 'undefined') {
         this.responseWrapper.accountassessmentId = this.recordid;
      }
      else {
         this.responseWrapper.accountassessmentId = this.accountassessmentId;
      }
      this.newResponse = [];
      this.handleGetChatterResponse();
   }

   renderedCallback() {
      var chatterBody = this.template.querySelectorAll('[data-id="chatterBody"]')[0];//Scrolls the chathistory to the bottom
      chatterBody.scrollTop = chatterBody.scrollHeight;
   }
   connectedCallback() {
   }
   /*callChatterResponse is used to save the conversation history between vendor and customer in the response record */
   callChatterResponse(response) {
      this.responseWrapper.responseList = response;
      saveChatterResponse({ chatWrapperstring: JSON.stringify(this.responseWrapper) }).then(() => {

      }).catch((err) => {
         var errormap = {};
         errormap.componentName = 'RtmvpcAssessmentChatter';
         errormap.methodName = 'saveChatterResponse';
         errormap.className = 'AssessmentController';
         errormap.errorData = err.message;
         errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => {
         });

      });
   }

   /*chatChangeHandler is used to get the message typed in the message box */
   chatChangeHandler(event) {
      this.newChat = event.target.value;
   }

   /* handleRightButtonClick is used to save the newly typed message to the response record */
   handleRightButtonClick() {
      var chat = this.newChat.trim(' ');
      if (typeof this.newChat !== 'undefined' && this.newChat !== '' && chat.length > 0) {
         this.showData = false;
         this.responseWrapper.assessmentId = this.assessmentId;
         this.responseWrapper.questionId = this.questionId;
         if (typeof this.recordid !== 'undefined') {
            this.responseWrapper.accountassessmentId = this.recordid;
         }
         else {
            this.responseWrapper.accountassessmentId = this.accountassessmentId;
         }
         this.newResponse = [];
         this.handleGetChatterResponse();
      }
      else {
         this.newChat = '';
      }
   }

   handleGetChatterResponse() {
      /*This method is used to get conversation history between vendor and customer after firing the event */
      getChatterResponse({ responseWrapper: JSON.stringify(this.responseWrapper) }).then((result1) => {
         if (result1.length !== 0) {
            if (typeof result1[0].Rhythm__Conversation_History__c !== 'undefined') {
               this.newResponse = JSON.parse(result1[0].Rhythm__Conversation_History__c);
            }
            if (typeof result1[0].CreatedDate !== 'undefined') {
               let x = result1[0].CreatedDate.split('T')[0];
               let time = result1[0].CreatedDate.split('T')[1].split('.')[0];
               let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
               result1[0].CreatedDate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
               let hours = time.split(':')[0];
               let minutes = time.split(':')[1];               
               this.responseMap.createdTime = result1[0].CreatedDate + ' ' + hours + ':' + minutes;
            }
         }

         this.responseMap.Text = this.newChat;

         this.responseMap.Name = this.userName;
         let customerChatCSS = (typeof this.recordid !== 'undefined') ? 'cad-cd-customer' : 'cad-ad-customer';
         let supplierChatCSS = (typeof this.recordid !== 'undefined') ? 'cad-cd-supplier' : 'cad-ad-supplier';
         if (this.newResponse && this.newResponse.length > 0) {
            this.newResponse.forEach(newresp => {
               if (newresp.accountType === 'customer') {
                  newresp.recipientType = customerChatCSS;
               }
               else {
                  newresp.recipientType = supplierChatCSS;
               }
            })
         }

         if (this.recordid !== null && typeof this.recordid !== 'undefined') {
            this.responseMap.accountType = 'customer';
         }
         else {
            this.responseMap.accountType = 'supplier';
         }

         if (this.accountType === 'vendor') {
            this.responseMap.recipientType = customerChatCSS;
         }
         else if (this.accountType === 'supplier') {
            this.responseMap.recipientType = supplierChatCSS;
         }

         if (typeof this.responseMap.Text != 'undefined' && this.responseMap.Text !== '') {
            this.newResponse.push(this.responseMap);
         }
         if (this.newResponse.length > 0) {
            this.callChatterResponse(this.newResponse);
         }
         this.responseList = this.newResponse;
         this.showData = true;
         this.showResponse = true;
         this.newChat = '';
         this.chatDataMap.conversationHistory = JSON.stringify(this.responseList);
         this.chatDataMap.questionId = this.questionId;
         this.chatDataMap.accountassessmentId = this.accountassessmentId;
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
         errorLogRecord({ errorLogWrapper: JSON.stringify(errormap) }).then(() => {
         });
      });
   }

}