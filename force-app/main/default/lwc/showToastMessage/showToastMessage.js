import { LightningElement,api } from 'lwc';
export default class ShowToastMessage extends LightningElement {
    @api isShowModal;
    @api isSucess;
    @api messageFromComponent;
    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
        const selectEvent = new CustomEvent('closetoast', {
        detail: {
            showModal: false
        }
        });
        this.dispatchEvent(selectEvent);
    }
    connectedCallback() {
    }
}