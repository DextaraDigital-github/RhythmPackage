import { LightningElement, api, track } from 'lwc';
export default class CustomCombobox extends LightningElement {
    @api label = '';
    @api options;
    @api value;
    @api allowSearch = false;
    @api variant;
    @api placeholder = 'Select an Option...';
    @track show = { label: true, options: false };
    @track selectedOption = false;
    @track optionsData;
    @track searchText;

    connectedCallback() {
        this.convertToBoolean();
        this.checkVariant();
        this.assignOptionsData();
    }
    /* Converts string values coming from parent into Boolean */
    convertToBoolean() {
        this.allowSearch = JSON.parse(this.allowSearch.toString());
    }
    /* Checks for the variant to show/hide the label */
    checkVariant() {
        this.show.label = (this.variant === 'label-hidden') ? false : this.show.label;
    }
    /* Assigns the selected value so as to display on the UI */
    assignOptionsData() {
        this.optionsData = JSON.parse(JSON.stringify(this.options));
        if (typeof this.options != 'undefined') {
            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i].value.includes(this.value)) {
                    this.selectedOption = this.options[i];
                    break;
                }
            }
        }
        this.searchText = (typeof this.selectedOption != 'undefined' && typeof this.selectedOption.label != 'undefined') ? this.selectedOption.label : this.searchText;
    }

    /* Shows the options on the UI */
    showOptionsHandler() {
        this.show.options = true;
        this.template.querySelectorAll('[data-id=renderComboboxOptions]')[0].classList.add('slds-is-open');
    }
    /* Hides the options on the UI */
    hideOptionsHandler() {
        let _this = this;
        setTimeout(() => {
            _this.show.options = false;
            _this.template.querySelectorAll('[data-id=renderComboboxOptions]')[0].classList.remove('slds-is-open');
        }, 300);
    }
    /* Clears search text */
    clearSearchHandler() {
        this.selectedOption = false;
        this.searchText = '';
    }

    /* Handles search among options */
    searchOptionsHandler(event) {
        this.selectedOption = false;
        this.searchText = event.target.value;
        this.optionsData = this.options.filter((option) => { return option.label.toLowerCase().includes(this.searchText.toLowerCase()); });
    }

    optionClickHandler(event) {
        this.selectedOption = { label: event.currentTarget.dataset.optionlabel, value: event.currentTarget.dataset.optionvalue, icon: event.currentTarget.dataset.optionicon };
        this.searchText = this.selectedOption.label;
        this.value = this.selectedOption.value;
        const change = new CustomEvent('change', { detail: { value: this.selectedOption.value }, target: { value: this.selectedOption.value } });
        this.dispatchEvent(change);
    }
}