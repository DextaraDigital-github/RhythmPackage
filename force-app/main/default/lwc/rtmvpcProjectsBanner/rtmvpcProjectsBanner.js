import { LightningElement, api } from 'lwc';

export default class RtmvpcProjectsBanner extends LightningElement {
    @api navList;
    @api activeNavItem;
    connectedCallback() {
        console.log('Banner',this.navList);
    }
    renderedCallback() {
        console.log('Banner',this.navList);
        console.log('Banner ActiveTab',this.activeNavItem);
    }
}