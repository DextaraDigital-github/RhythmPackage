import { LightningElement,api,track } from 'lwc';
export default class QuestionnaireChildCmp extends LightningElement {
    @api input;

    connectedCallback() {
        console.log('Hi');
        console.log('Input----->' + JSON.parse(JSON.stringify(this.input)));
    }

    handleChange(event) {
    //     if (typeof event.target.value === 'object' && event.target.value.length) {
    //         this.responseMap.set(event.currentTarget.dataset.key, JSON.stringify(event.target.value));
    //     } else {
    //         this.responseMap.set(event.currentTarget.dataset.key, event.target.value);
    //     }
     }
}