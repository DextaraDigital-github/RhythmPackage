import { LightningElement } from 'lwc';

export default class RtmvpcReportsTabset extends LightningElement {
    showTabFour;

    toggleOptionalTab() {
        this.showTabFour = !this.showTabFour;
    }
}