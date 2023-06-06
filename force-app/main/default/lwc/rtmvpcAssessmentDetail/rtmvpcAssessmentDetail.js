/* Component Name   : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/ 
import { LightningElement, track, api } from 'lwc';
export default class RtmvpcAssessmentDetail extends LightningElement {
    @track sectionid;
    @api accountid;
    @api assessmentid;
    @track showSections = true;
    @track showFlag = false;
    @track showChat;
    
    handleLeftButtonClick(event) {

        var cadtype = this.template.querySelector('[data-id="cadtype"]');
        cadtype.classList.toggle('cadshowleft');
    }
    handleRightButtonClick(event) {
        var cadtype = this.template.querySelector('[data-id="caddisc"]');
        cadtype.classList.toggle('cadshowright');
    }
    /* This on click event is used to get section id and send it to the child component*/
    showQuestionnaire(event)
    {
        if(event.detail.sectionId!=null || event.detail.sectionId!=undefined)
        {
            this.sectionid = event.detail.sectionId;
            console.log('showQuestionnaire', this.sectionid);
            this.showSections = false;
            this.showFlag=false;
            setTimeout(()=>{
                 console.log(" this.template.querySelectorAll('c-Questionnaire')", this.template.querySelectorAll('c-Questionnaire'));
                this.template.querySelectorAll('c-Questionnaire')[0].getSectionId(this.sectionid);
               
                console.log(this.sectionid);
            },100);          
        }
    }
    
    handleChat(event)
    {
        console.log('handleChat');
        this.showChat=event.detail;
    }
    
    
}