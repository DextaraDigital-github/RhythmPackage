import { LightningElement, track, api } from 'lwc';
export default class RtmvpcAssessmentDetail extends LightningElement {
    
    handleLeftButtonClick(event) {

        var cadtype = this.template.querySelector('[data-id="cadtype"]');
        console.log('cadtype'+cadtype);
        cadtype.classList.toggle('cadshowleft');
    }
    handleRightButtonClick(event) {
        var cadtype = this.template.querySelector('[data-id="caddisc"]');
        cadtype.classList.toggle('cadshowright');
    }

    connectedCallback() {
        
    }
    
    
}