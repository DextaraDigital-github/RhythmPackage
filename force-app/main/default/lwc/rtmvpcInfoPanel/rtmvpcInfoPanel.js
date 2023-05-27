import { LightningElement } from 'lwc';

export default class RtmvpcInfoPanel extends LightningElement {
    handleClick() {
        this.isSelected = !this.isSelected;
    }
}