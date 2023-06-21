import { LightningElement,api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomDeleteAssessment extends LightningElement {
    @api recordId;

    handleConfirm(){
        console.log('In the Confirm---->');
    }
    handleCancel(){
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}