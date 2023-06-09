/* Component Name   : rtmvpcAssessmentChatter
* Developer         : Reethika Velpula and Sai Koushik Nimmaturi           
* Created Date      : 
* Description       : This component is used for conversation between vendor and customer
* Last Modified Date: 
*/
import { LightningElement, track ,api} from 'lwc';
import getChatterResponse from '@salesforce/apex/AssessmentController.getResponseList';
import getUserName from '@salesforce/apex/AssessmentController.getUserName';
import saveChatterResponse from '@salesforce/apex/AssessmentController.saveChatterResponse';
export default class RtmvpcAssessmentChatter extends LightningElement {
    @api chattermap;
    @track questionId ;
    @track assessmentId;
    @track newChat;
    userName;
   @track responseList = [];
   @track showResponse = false;
   @track responseMap = {};
   @track newResponse = [];

   connectedCallback() {
   this.questionId = this.chattermap.questionId;
    this.assessmentId=this.chattermap.assesmentId;

      /*getUserName is used to get the username */
      getUserName({}).then((result) => {
         this.userName = result;
      })

      /*getChatterResponse is used to get conversation history between vendor and customer on onload */
      getChatterResponse({ assessmentId: this.assessmentId, questionId: this.questionId }).then((result) => {

         if (('Rythm__Conversation_History__c' in result[0])) {
            this.newResponse = JSON.parse(result[0].Rythm__Conversation_History__c);
            this.responseList = this.newResponse;
            this.showResponse = true;
         }
         else {
            this.showResponse = false;
         }

      }).catch((err) => {
      });
      console.log('response', this.responseList);
   }
   /*callChatterResponse is used to save the conversation history between vendor and customer in the response record */
   callChatterResponse(response) {
      saveChatterResponse({ responseList: JSON.stringify(response), assessmentId: this.assessmentId, questionId: this.questionId }).then((resultData) => {

      }).catch((err) => {
         console.log('error');

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
         if (result1[0].Rythm__Conversation_History__c != null) {
            this.newResponse = JSON.parse(result1[0].Rythm__Conversation_History__c);
         }
         this.responseMap.Text = this.newChat;
         this.responseMap.createdTime = result1[0].CreatedDate;
         this.responseMap.Name = this.userName;
         this.responseMap.recipientType = 'Vendor';
         this.newResponse.push(this.responseMap);
         this.callChatterResponse(this.newResponse);
         this.responseList = this.newResponse;
         this.showResponse = true;
         this.newChat = '';
         console.log('newResponse', this.newResponse);
      }).catch((err) => {

      });

   }

}