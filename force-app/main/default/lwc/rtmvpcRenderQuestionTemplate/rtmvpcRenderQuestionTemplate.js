/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/ 
import { LightningElement,api,track } from 'lwc';
export default class RtmvpcRenderQuestionTemplate extends LightningElement {
 @api responses; /*questions related to particular section will be stored in this JSON wrapper */ 
 @track openChat = false;
 @track responsemap={}
    connectedCallback() {
        console.log('responses',this.responses);
    }
     /*This onchange event is used to change the response and send back to the parent component*/
    handleChange(event) {
        var value= event.target.value;
        var questionId=event.currentTarget.dataset.key;  
        if(this.responses.hasOwnProperty('ParentQuestion'))
        {
            this.responsemap['ParentQuestion']=this.responses.ParentQuestion;
            this.responsemap['option']=value;
            this.responsemap['questionId']=questionId;

        }
        else{
            this.responsemap['ParentQuestion']=null;
            this.responsemap['option']=value;
            this.responsemap['questionId']=questionId;

        }
        console.log('this.responsemap',this.responsemap);
        const selectedEvent = new CustomEvent('valuechange', {
            detail: this.responsemap
        });
        console.log('this.selectedEvent',selectedEvent);
        this.dispatchEvent(selectedEvent);
    }
       openChatHandler(event) {
        if (this.openChat == false) {
            this.openChat = true;

        }
        else {
            this.openChat = false;
        }
        const selectedEvent = new CustomEvent('openchathistory', {
            detail: this.openChat
        });

        // Dispatches the event.
        console.log('this.selectedEvent',selectedEvent);
        this.dispatchEvent(selectedEvent);
    }

}