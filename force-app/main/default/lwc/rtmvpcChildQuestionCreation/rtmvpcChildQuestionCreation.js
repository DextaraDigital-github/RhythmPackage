import { LightningElement, api, track } from 'lwc';
import getQuestionRespAttributes from '@salesforce/apex/QuestionAttributeResponseController.getQuestionRespAttributes';
export default class RtmvpcChildQuestionCreation extends LightningElement {
    @api childwrapper;
    @track questionnaire;
    @track loadCmp = false;
    @track childQuesCreation = true;
    @track options = [];
    @track data;
    @track createQues = false;
    @track loading = false;
    @track showcreateChild;
    connectedCallback() {
        this.showcreateChild = true;
        this.loading = true;
        console.log('childwrapper', this.childwrapper);
        this.questionnaire = this.childwrapper;
        let questionslst = [];
         questionslst.push(this.childwrapper.questionId);
            getQuestionRespAttributes({ questionlst: questionslst }).then(result => {
                this.data = result;
                console.log('Result');
                result.forEach(res => {
                    if (this.childwrapper.type === 'Checkbox') {
                        this.options = [{ 'label': 'Yes', 'value': 'true' }, { 'label': 'No', 'value': 'false' }];
                        this.loadCmp = true;
                    }
                    else
                    {
                        let map = { 'label': res.Rhythm__Response_value__c, 'value': res.Rhythm__Response_value__c };
                        this.options.push(map);
                    }
                    
                });
                this.loading = false;
                this.loadCmp = true;
            })
        

    }
    hideModalBox()
    {
        this.showcreateChild = false;
        const selectedEvent = new CustomEvent('handlecancel', {
            detail: this.showcreateChild
        });
        this.dispatchEvent(selectedEvent);
    }
    handleaftersave(event) {
        console.log('event.detail', event.detail);
        this.showcreateChild = false;
        this.loadCmp = false;
        const selectedEvent = new CustomEvent('handleaftersave', {
            detail: event.detail
        });
        this.dispatchEvent(selectedEvent);
    }
    handleChange(event) {
        let respval = event.target.value;
        console.log('event.target.value', respval);
        let resp = {};
        this.createQues = true;
        resp.conditionalResponse = respval;
        this.data.forEach(res => {
            if (res.Rhythm__Response_value__c === respval) {
                resp.responseAttributeId = res.Id;
            }
        })
        setTimeout(() => {
            this.template.querySelector('c-rtmvpc-question-creation').getParentQuestionCondition(resp);
        }, 200);

    }
    handleclose(event) {
        console.log('sssss;', event.detail);
        this.loadCmp = false;
        this.showcreateChild = false;
        const selectedEvent = new CustomEvent('handlecancel', {
            detail: this.showcreateChild
        });
        this.dispatchEvent(selectedEvent);
    }
}