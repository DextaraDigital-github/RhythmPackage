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

   connectedCallback() {
      this.questionId = this.chattermap.questionId;
      this.assessmentId = this.chattermap.assesmentId;

      /*getUserName is used to get the username */
      getUserName({}).then((result) => {
         this.userName = result;
      })

      /*getChatterResponse is used to get conversation history between vendor and customer on onload */
      getChatterResponse({ assessmentId: this.assessmentId, questionId: this.questionId }).then((result) => {

         if (('Rhythm__Conversation_History__c' in result[0])) {
            this.newResponse = JSON.parse(result[0].Rhythm__Conversation_History__c);
            this.responseList = this.newResponse;
            this.showResponse = true;
         }
         else {
            this.showResponse = false;
         }

      }).catch((err) => {
         errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'getChatterResponse', className: 'AssessmentController', errorData: err.message }).then((result) => {
         });
      });
      console.log('response', this.responseList);
   }
   /*callChatterResponse is used to save the conversation history between vendor and customer in the response record */
   callChatterResponse(response) {
      saveChatterResponse({ responseList: JSON.stringify(response), assessmentId: this.assessmentId, questionId: this.questionId }).then((resultData) => {

      }).catch((err) => {
         errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'saveChatterResponse', className: 'AssessmentController', errorData: err.message }).then((result) => {
         });
      });
   }

   /*chatChangeHandler is used to get the message typed in the message box */
   chatChangeHandler(event) {
      this.newChat = event.target.value;
   }

   /* handleRightButtonClick is used to save the newly typed message to the response record */
   handleRightButtonClick(event) {
      /*This method is used to get conversation history between vendor and customer after firing the event */
      getChatterResponse({ assessmentId: this.assessmentId, questionId: this.questionId }).then((result1) => {
         if (result1[0].Rhythm__Conversation_History__c != null) {
            this.newResponse = JSON.parse(result1[0].Rhythm__Conversation_History__c);
         }
         this.responseMap.Text = this.newChat;
         this.responseMap.createdTime = result1[0].CreatedDate;
         this.responseMap.Name = this.userName;
         this.responseMap.recipientType = 'cad-ad-supplier';
         this.newResponse.push(this.responseMap);
         this.callChatterResponse(this.newResponse);
         this.responseList = this.newResponse;
         this.showResponse = true;
         this.newChat = '';
         console.log('newResponse', this.newResponse);
         this.chatDataMap.conversationHistory=JSON.stringify(this.responseList);
         this.chatDataMap.questionId=this.questionId;

         /* This dispatch event is used to assign the conversation data to the main wrapper (questionnaire) to update the data in the latest records. */
          const selectedEvent = new CustomEvent('chatconversation', {
            detail: this.chatDataMap
        });
        /* Dispatches the event.*/
        this.dispatchEvent(selectedEvent);
      }).catch((err) => {
         errorLogRecord({ componentName: 'RtmvpcAssessmentChatter', methodName: 'getChatterResponse', className: 'AssessmentController', errorData: err.message }).then((result) => {
         });

      });

   }

}