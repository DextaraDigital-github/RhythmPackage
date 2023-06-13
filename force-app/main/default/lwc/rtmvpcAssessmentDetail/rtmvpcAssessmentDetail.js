/* 
* Component Name    : rtmvpcRenderQuestionTemplate
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the question template based on the sections
* Last Modified Date: 
*/ 
import { LightningElement, track, api } from 'lwc';
export default class RtmvpcAssessmentDetail extends LightningElement {
    @track sectionid; 
    @api accountid; //record id of an Account(supplier)
    @api assessmentid; //record id of an Assessment__c
    @track showSections = true;
    @track showFlag = false;
    @track showChat;
    @track showData;
    
    /*handleLeftButtonClick used to display records on page1*/
    handleLeftButtonClick(event) {
        var cadtype = this.template.querySelector('[data-id="cadtype"]');
        cadtype.classList.toggle('cadshowleft');
    }

    /*handleLeftButtonClick used to display records on next page*/
    handleRightButtonClick(event) {
        var cadtype = this.template.querySelector('[data-id="caddisc"]');
        cadtype.classList.toggle('cadshowright');
    }

    /* This on click event is used to get section id and send it to the child component*/
    showQuestionnaire(event)
    {
        if(event.detail.sectionId != null || typeof event.detail.sectionId != 'undefined')
        {
            this.sectionid = event.detail.sectionId;
            console.log('showQuestionnaire', this.sectionid);
            this.showSections = false;
            this.showFlag=false;        
        }
    }
    /* This chatHistory is used to catch the value from parent and pass it to the child component(AssessmentChatter)*/
    chatHistory(event)
    {
        this.showChat=event.detail;
        this.showData=this.showChat.openChat;
    }

    showsummaryHandler(event)
    {
        this.showSections=true;
    }
}