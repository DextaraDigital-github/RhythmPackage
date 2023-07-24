import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import componentStylesheet from '@salesforce/resourceUrl/ComponentStylesheet';
import fetchQuestions from '@salesforce/apex/QuestionAttributeResponseController.fetchQuestions';
import updateQuestionsSequence from '@salesforce/apex/QuestionAttributeResponseController.updateQuestionsSequence';

export default class RtmvpcChildQuestionReordering extends LightningElement {
    @api question;   //Stores the selected question
    @track show = { spinner: true, saveBtn: false };   //Used for conditionally rendering elements on UI
    @track activeResponse;   //Stores the currently selected response
    responseMap;   //Stores the responses in map format
    @track responseList;   //Stores a list of response names to display the responses on the screen
    @track questionsData = [];   //Stores a list of value-label pair of each question

    connectedCallback() {
        // this.question = { Id: 'a0H8F000002eyTsUAI', Name: 'Test' };   //Testing purpose only
        this.fetchQuestionsData();
    }
    renderedCallback() {
        Promise.all([
            loadStyle(this, componentStylesheet)
        ]);
        this.renderNavBar();
    }

    /* Renders the UI to make the indicate the active response in the navigation item with WHITE background-color */
    renderNavBar() {
        if (typeof this.activeResponse != undefined) {
            let navItems = this.template.querySelectorAll('[data-name="response"]');
            if (typeof navItems != 'undefined' && navItems.length > 0) {
                this.responseList.forEach(navItem => {
                    this.template.querySelectorAll('[data-response="' + navItem + '"]')[0].classList.remove('slds-is-active');
                });
                this.template.querySelectorAll('[data-response="' + this.activeResponse + '"]')[0].classList.add('slds-is-active');
            }
        }
    }

    /* Fetches questions data from Apex */
    fetchQuestionsData() {
        let _parameterMap = JSON.stringify({ assessmentId: this.question.Id });
        fetchQuestions({ parameterMap: _parameterMap }).then(result => {
            if (result.toString() != 'null') {
                this.refreshQuestionsData(result);
            }
            else {
                this.configureToast('Couldn\'t load questions', 'Please contact your administrator.', 'error');
                this.closeModal();
            }
        }).catch(error => {
            console.log(JSON.stringify(error));
            this.configureToast('Couldn\'t load questions', 'Please contact your administrator.', 'error');
            // this.closeModal();
        });
    }
    /* Initializes the required parameters and fetches the questions to get updated data */
    refreshQuestionsData(result) {
        this.formatQuestionsData(result);   //Creates responseMap for easy fetching of questions and responseList for displaying the responses on the screen
        this.activeResponse = (typeof this.activeResponse != 'undefined') ? this.activeResponse : this.responseList[0];   //Stores the active response name
        this.questionsData = this.responseMap.get(this.activeResponse);   //Fetches the questions list of the active response
        this.show.spinner = false;
    }
    /* Formats the questions data into the required format */
    formatQuestionsData(result) {
        this.responseMap = new Map();
        this.responseList = (typeof this.question.Rhythm__OptionValueSet__c != 'undefined') ? this.question.Rhythm__OptionValueSet__c.split('\r\n') : [];
        result.forEach(question => {
            let responseJson;
            if (!this.responseMap.has(question.Rhythm__Conditional_Response__c)) {
                responseJson = { questionList: [], questionValues: [] };
                if (!this.responseList.includes(question.Rhythm__Conditional_Response__c)) {
                    this.responseList.push(question.Rhythm__Conditional_Response__c);
                }
            }
            else {
                responseJson = this.responseMap.get(question.Rhythm__Conditional_Response__c);
            }
            responseJson.questionList.push({ label: responseJson.questionList.length + 1 + '. ' + question.Rhythm__Question__c, value: question.Id });
            responseJson.questionValues.push(question.Id);
            responseJson.hideReorderBtns = (responseJson.questionList.length > 1) ? false : true;
            this.responseMap.set(question.Rhythm__Conditional_Response__c, responseJson);
        });
    }
    /* Configures and displays the toast message */
    configureToast(_title, _message, _variant) {
        const toast = new ShowToastEvent({
            title: _title,
            message: _message,
            variant: _variant
        });
        this.dispatchEvent(toast);
    }

    /* Handles closure of modal */
    closeModal() {
        const closemodal = new CustomEvent('closemodal', {});
        this.dispatchEvent(closemodal);
    }
    /* Handles saving of the new sequence of the child questions */
    saveOrderHandler() {
        this.updateCQuesSequence();
    }
    /* Saves the new sequence of the child questions and fetches the updated data from Apex*/
    updateCQuesSequence() {
        this.show.spinner = true;
        this.show.saveBtn = false;
        let _parameterMap = JSON.stringify({ questionIdList: this.questionsData.questionValues, questionId: this.question.Id });
        updateQuestionsSequence({ parameterMap: _parameterMap }).then(result => {
            if (result.toString() != 'null') {
                this.configureToast('Sequence Saved Successfully', 'Sequence for Conditional Questions of ' + this.activeResponse + ' reponse is saved.', 'success');
                this.refreshQuestionsData(result);
            }
            else {
                this.show.spinner = false;
                this.configureToast('Some error has occured', 'Please contact your administrator.', 'error');
            }
        }).catch(error => {
            this.show.saveBtn = true;
            this.show.spinner = false;
            this.configureToast('Some error has occured', 'Please contact your administrator.', 'error');
            this.closeModal();
        });
    }

    /* Handles the navigation item i.e. stores the response which is selected and gets the list of questions accordingly to display on the UI */
    navItemClickHandler(event) {
        this.activeResponse = event.currentTarget.dataset.response;
        this.questionsData = this.responseMap.get(this.activeResponse);
    }

    /* Handles the reordering of questions */
    questionReorderHandler(event) {
        this.show.saveBtn = true;
        let responseJson = this.responseMap.get(this.activeResponse);
        responseJson.questionValues = event.detail.value;
        this.responseMap.set(this.activeResponse, responseJson);
    }
}