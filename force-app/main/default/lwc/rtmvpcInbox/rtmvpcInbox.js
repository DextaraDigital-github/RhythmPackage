import { LightningElement } from 'lwc';

//import hurricanePNG from '@salesforce/resourceUrl/hurricane';
//import getRecordsForInbox from '@salesforce/apex/rtmvpcRelatedListsController.getRecordsForInbox';
// import getTaskRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getTaskRelatedRecords';
// import getAlertRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getAlertRelatedRecords';
// import getIncidentRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getIncidentRelatedRecords';
export default class RtmvpcInbox extends LightningElement {
    //hurricanePNG = hurricanePNG;
  /*  value = 'new';
    @api vendorId = 'a14DE00000CRco1YAD';
    @track relatedListRecords = [];
    @track relatedListRecords_copy = [];
    @track displayFields = [];
    @track error;
    @track rec = {};
    @track show = { 'Task': true, 'Alert__c': false, 'Incidents__c': false };
    @track spin;
    @track classlist_read = 'cib-unread';
    @track assessmentId = 'a18DE00000J0o5AYAR';
    @track activeCategory;
    @track showAcceptModal = false;
    get options() {
        return [
            { label: 'Newest', value: 'new' },
            { label: 'Oldest', value: 'old' },
        ];
    }

    openTaskHandler(event) {
        var assessId = event.currentTarget.dataset.id;
        const opentask = new CustomEvent('opentask', {
            detail: {
                assessmentId: assessId,
                category: "Assessments"
            }
        });
        this.dispatchEvent(opentask);
    }
    openAcceptModalHandler() {
        this.showAcceptModal = true;
    }
    closeAcceptModalHandler() {
        this.showAcceptModal = false;
    }
    handleTempActive(event) {
        let buttonId = event.currentTarget.dataset.id;

        // Remove cib-current class from all buttons
        //const buttons = this.template.querySelectorAll('.cib-current');
        const buttons = this.template.querySelectorAll('[data-id^="cib-button"]');
        console.log(buttons);
        buttons.forEach(button => {
            if (typeof button.classList != "undefined" && button.classList.value.includes('cib-current')) {
                console.log(button.classList);
                button.classList.remove('cib-current');
                button.classList += 'cib-read';
            }
        });
        const clickedButton = this.template.querySelectorAll('[data-id="' + buttonId + '"]');
        clickedButton[0].classList.remove('cib-read', 'cib-unread');
        clickedButton[0].classList += 'cib-current';

        const containers = this.template.querySelectorAll('[data-id^="cib-rightsec"]');
        //const containers = this.template.querySelectorAll('.slds-show');
        containers.forEach(container => {
            if (typeof container.classList != "undefined" && container.classList.value.includes('slds-show')) {
                container.classList.remove('slds-show');
                container.classList += 'slds-hide';
            }
        });
        const openContainer = this.template.querySelectorAll('[data-id="cib-rightsec_' + buttonId.split('_')[1] + '"]');
        openContainer[0].classList.remove('slds-hide');
        openContainer[0].classList += 'slds-show';

    }
    handleChange(event) {
        this.value = event.detail.value;
    }
    start = 0;
    end = 0;
    selectMode = 'select';

    handleLeftButtonClick(event) {
        var cibtype = this.template.querySelector('[data-id="cibtype"]');
        cibtype.classList.toggle('cibshowleft');
    }
    handleRightButtonClick(event) {
        var cibtype = this.template.querySelector('[data-id="cibdisc"]');
        cibtype.classList.toggle('cibshowright');
    }

    @track childRecords = [];
    @track childRecords2 = [];
    connectedCallback() {
        this.spin = true;
        this.relatedListRecords = [];
        getRecordsForInbox({}).then(result => {
            this.relatedListRecords = JSON.parse(JSON.stringify(result));
            for (var i = 0; i < this.relatedListRecords.length; i++) {
                this.relatedListRecords[i].unreadCount = 0;
                if (this.relatedListRecords[i].Supplier_Tasks__r) {
                    for (var j = 0; j < this.relatedListRecords[i].Supplier_Tasks__r.length; j++) {
                        this.relatedListRecords[i].Supplier_Tasks__r[j].classList = "cib-unread";
                    }
                    this.relatedListRecords[i].unreadCount = this.relatedListRecords[i].Supplier_Tasks__r.length;
                }
                console.log('Data1' + ' ' + this.relatedListRecords[i].Name, this.relatedListRecords);
                this.relatedListRecords[i].classList = "cib-mtype items";
                this.relatedListRecords[i].totalCount = this.relatedListRecords[i].unreadCount;
            }
            console.log('Data2', this.relatedListRecords);
            this.relatedListRecords[0].classList = "cib-mtype items active";
            this.childRecords = this.relatedListRecords[0].Supplier_Tasks__r;
            this.childRecords2 = this.childRecords;
            console.log('Data3', this.relatedListRecords);
            this.spin = false;
        }).catch(error => {
            console.log('Error', JSON.stringify(error));
        });

    }
    showDataHandler(event) {
        var id = event.currentTarget.dataset.id;
        this.activeCategory = event.currentTarget.dataset.id;
        console.log('RecData', this.relatedListRecords);
        this.dynamicData = false;
        if (event.currentTarget.dataset.id.toString() === this.assessmentId.toString()) {
            this.dynamicData = true;
        }
        for (var i = 0; i < this.relatedListRecords.length; i++) {
            this.relatedListRecords[i].classList = this.relatedListRecords[i].classList.replaceAll('active', '');
            if (this.relatedListRecords[i].Id.toString() === id.toString()) {
                this.relatedListRecords[i].classList += ' active';
                if (this.relatedListRecords[i].Supplier_Tasks__r) {
                    this.childRecords = this.relatedListRecords[i].Supplier_Tasks__r;
                    for (var j = 0; j < this.childRecords.length; j++) {
                        this.childRecords[j].classList = 'cib-unread';
                    }
                    this.childRecords2 = this.childRecords;
                }
                else {
                    this.childRecords = undefined;
                    this.childRecords2 = this.childRecords;
                }
            }
        }
        console.log(this.relatedListRecords);
        console.log(this.childRecords);
        
    }

    openChatHandler(event) {
        var id = event.currentTarget.dataset.id;
        this.activeCategory = event.currentTarget.dataset.id;
        console.log('RecData', this.relatedListRecords);
        this.dynamicData = false;
        for (var i = 0; i < this.relatedListRecords.length; i++) {
            this.relatedListRecords[i].classList = this.relatedListRecords[i].classList.replaceAll('active', '');
            if (this.relatedListRecords[i].Id.toString() === id.toString()) {
                this.relatedListRecords[i].classList += ' active';
                if (this.relatedListRecords[i].Supplier_Tasks__r) {
                    this.childRecords = this.relatedListRecords[i].Supplier_Tasks__r;
                    for (var j = 0; j < this.childRecords.length; j++) {
                        this.childRecords[j].classList = 'cib-unread';
                    }
                    this.childRecords2 = this.childRecords;
                }
                else {
                    this.childRecords = undefined;
                    this.childRecords2 = this.childRecords;
                }
            }
        }
        console.log(this.relatedListRecords);
        console.log(this.childRecords);
        var recId = event.currentTarget.dataset.id;
        console.log(this.childRecords);
        for (var i = 0; i < this.childRecords.length; i++) {
            if (this.childRecords[i].Id.toString() === recId.toString()) {
                this.childRecords[i].classList = 'cib-read';
                for (var i = 0; i < this.relatedListRecords.length; i++) {
                    if (this.relatedListRecords[i].Supplier_Tasks__r) {
                        for (var j = 0; j < this.relatedListRecords[i].Supplier_Tasks__r.length; j++) {
                            if (this.relatedListRecords[i].Supplier_Tasks__r[j].Id === recId && this.relatedListRecords[i].unreadCount > 0) {
                                this.relatedListRecords[i].unreadCount -= 1;
                                if (typeof this.relatedListRecords[i].Supplier_Tasks__r[j].Assessment__c != 'undefined' && this.relatedListRecords[i].Supplier_Tasks__r[j].Assessment__c != 'null') {
                                    var supAssmntId = this.relatedListRecords[i].Supplier_Tasks__r[j].Assessment__c;
                                    const opentask = new CustomEvent('opentask', {
                                        detail: {
                                            categoryId: this.activeCategory,
                                            taskId: recId,
                                            assessmentId: supAssmntId,
                                            category: "Assessments"
                                        }
                                    });
                                    this.dispatchEvent(opentask);
                                }
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
        var cibtype = this.template.querySelector('[data-id="cibdisc"]');
        cibtype.classList.toggle('cibshowright');
    }

    searchInputChangeHandler(event) {
        var childRecords_copy = this.childRecords2;
        this.childRecords = [];
        var fields = ['CreatedDate', 'Name', 'Description__c'];
        var search = event.target.value;
        for (var i = 0; i < childRecords_copy.length; i++) {
            for (var j = 0; j < fields.length; j++) {
                if (childRecords_copy[i][fields[j]].toLowerCase().includes(search.toLowerCase())) {
                    this.childRecords.push(childRecords_copy[i]);
                    break;
                }
            }
        }
    }
    */
}

