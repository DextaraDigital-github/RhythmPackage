import { LightningElement, track, wire, api } from 'lwc';
import actionRecords from '@salesforce/apex/CAPAController.actionRecords';
import getCurrentDate from '@salesforce/apex/CAPAController.getCurrentDate';
import greenFlag from '@salesforce/resourceUrl/greenFlag';
import redFlag from '@salesforce/resourceUrl/redFlag';
import orangeFlag from '@salesforce/resourceUrl/orangeFlag';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
export default class ActionItemGrid extends NavigationMixin(LightningElement) {
    @track show = { grid: false, survey: false };
    @track actionItemData = [];
    @track fieldCheck = false;
    @track allRecordsList;
    @track currentDate;
    @track urlId;
    @track viewColList = [
        { label: 'Action Item Name', fieldName: 'Name' },
        { label: 'Related Record', fieldName: 'Rhythm__Related_Record__r' },
        { label: 'Ownership', fieldName: 'Rhythm__OwnershipName__c' },
        { label: 'Assigned To', fieldName: 'Rhythm__Assigned_To__r' },
        { label: 'Due Date', fieldName: 'Rhythm__Due_Date__c', type: 'date' },
        { label: 'Priority', fieldName: 'Rhythm__Priority__c' },
        { label: 'Flag Status', fieldName: 'Rhythm__Flag_Status__c', type: 'image' },
        { label: 'Status', fieldName: 'Rhythm__Status__c' },

    ];
    @track actionRecordsData;
    greenFlagUrl = greenFlag;
    redFlagUrl = redFlag;
    orangeFlagUrl = orangeFlag;
    connectedCallback() {
        this.show.grid = true;
        this.handleonload();
    }
    handleonload(refreshData) {
        this.actionItemData = [];
        this.allRecordsList = [];
        getCurrentDate({}).then((result) => {
            this.currentDate = result;
        })
        actionRecords({}).then((result) => {
            this.actionRecordsData = result;
            this.actionRecordsData.forEach(res => {
                var actionRecordList = [];
                var actionMap = {};
                actionMap.Id = res['Id'];
                for (let i = 0; i < this.viewColList.length; i++) {
                    this.fieldCheck = false;
                    for (let key in res) {
                        if (this.viewColList[i].fieldName == key) {
                            var actionRecordMap = {};
                            this.fieldCheck = true;
                            if (key === 'Rhythm__Due_Date__c' || key === 'Rhythm__Priority__c'
                                || key === 'Rhythm__Status__c' || key === 'Rhythm__OwnershipName__c') {
                                actionRecordMap.fieldName = key;
                                actionRecordMap.value = res[key];
                                actionRecordList.push(actionRecordMap);
                            }
                            if (key === 'Name') {
                                actionRecordMap.fieldName = key;
                                actionRecordMap.value = res[key];
                                actionRecordMap.isHyperlink = true;
                                actionRecordList.push(actionRecordMap);
                            }
                            if (key === 'Rhythm__Flag_Status__c') {
                                actionRecordMap.fieldName = key;
                                actionRecordMap.value = res[key];
                                if (res['Rhythm__Status__c'] == 'Closed') {
                                    actionRecordMap.isFlag = true;
                                }
                                if (res['Rhythm__Status__c'] == 'Expired') {
                                    actionRecordMap.isRedFlag = true;
                                }
                                else if (res['Rhythm__Status__c'] == 'Open') {
                                    actionRecordMap.isOrangeFlag = true;
                                }
                                actionRecordList.push(actionRecordMap);
                            }
                            if (key === 'Rhythm__Assigned_To__r' || key === 'Rhythm__Related_Record__r') {
                                actionRecordMap.fieldName = key;
                                actionRecordMap.value = res[key]['Name'];
                                actionRecordList.push(actionRecordMap);
                            }
                        }
                    }
                    if (this.fieldCheck === false) {
                        var actionRecordMapData = {};
                        actionRecordMapData.fieldName = this.viewColList[i].fieldName;
                        actionRecordMapData.value = '';
                        actionRecordList.push(actionRecordMapData);
                    }
                }

                actionMap.record = actionRecordList;
                this.actionItemData.push(actionMap);
            })
            this.allRecordsList = this.actionItemData;
        });

        if (this.urlId !== null && typeof this.urlId !== 'undefined') {
            this.actionId = this.urlId;
            this.show.survey = true;
            this.show.grid = false;
        }
        if (typeof refreshData !== 'undefined' && refreshData === true) {
            this.show.grid = true;
            this.show.survey = false;
            const pageRef = {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Home' // Replace with your community page name
                }

            };
            // Navigate to the community page
            this[NavigationMixin.Navigate](pageRef);
        }

    }
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.urlId = currentPageReference.state?.Rhythm__Action__c;
        }
    }
    @api handleActionItem() {
        this.show.grid = true;
        this.show.survey = false;
    }
    takeSurveyHandler(event) {

        this.show.grid = false;
        this.show.survey = true;
        this.actionId = event.currentTarget.dataset.id;
        const pageRef = {
            type: 'comm__namedPage',
            attributes: {
                name: 'Home' // Replace with your community page name
            },
            state: {
                // Define your parameters here
                Rhythm__Action__c: this.actionId
            }
        };
        // Navigate to the community page
        this[NavigationMixin.Navigate](pageRef);

    }
    backClickHandler() {
        this.handleonload(true);

    }
    inputChangeHandler() {
        let filterDetailsList = this.getAllFilterDetails();
        var newRecList = [];
        if (!!filterDetailsList && filterDetailsList.length > 0
            && !!this.allRecordsList && this.allRecordsList.length > 0) {
            for (let i = 0; i < this.allRecordsList.length; i++) {
                let currentRecord = this.allRecordsList[i];
                let isRecordMatched = true;
                for (let j = 0; j < filterDetailsList.length; j++) {
                    let filterValue = filterDetailsList[j].filterValue.toUpperCase();
                    let fieldName = filterDetailsList[j].fieldName;
                    if (!!currentRecord.record && currentRecord.record.length > 0) {
                        for (let k = 0; k < currentRecord.record.length; k++) {
                            let fieldDetails = currentRecord.record[k];
                            if (fieldDetails.fieldName === fieldName) {
                                if (typeof fieldDetails.value === 'undefined' || !(typeof fieldDetails.value !== 'undefined' && fieldDetails.value.toString().toUpperCase().includes(filterValue))) {
                                    isRecordMatched = false;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (isRecordMatched) {
                    newRecList.push(currentRecord);
                }
            }
            this.actionItemData = newRecList;
        }
        else {
            this.actionItemData = this.allRecordsList;
        }
    }
    getAllFilterDetails() {
        let filterDetailsList = [];
        let allTextBoxes = this.template.querySelectorAll('[data-filtertextbox]');
        if (!!allTextBoxes && allTextBoxes.length > 0) {
            for (let i = 0; i < allTextBoxes.length; i++) {
                let txtBox = allTextBoxes[i];
                if (txtBox.value !== '') {
                    let filterDetail = {};
                    filterDetail.fieldName = txtBox.dataset.id;
                    filterDetail.filterValue = txtBox.value;
                    filterDetailsList.push(filterDetail);
                }
            }
        }
        return filterDetailsList;
    }
    // Handles sorting of data
    sortClickHandler(event) {
        let sortFieldName = event.currentTarget.dataset.id;
        let sortType = 'ASC';
        let isFirstClick = false;
        if (event.currentTarget.className.includes('la-angle-down')) {
            isFirstClick = true;
            sortType = 'ASC';
        }
        else {
            sortType = 'DESC';
        }
        this.setAllColumnSortStatusToDefault(sortFieldName, sortType, isFirstClick);
        this.sortRecordDetailsList(sortFieldName, sortType);
    }

    // Resets the column sort status to inactive
    setAllColumnSortStatusToDefault(activeSortFieldName, sortType) {
        let allSortIcons = this.template.querySelectorAll('[data-sorticon]');
        if (allSortIcons && allSortIcons.length > 0) {
            for (let i = 0; i < allSortIcons.length; i++) {
                let sortIcon = allSortIcons[i];
                if (sortIcon.dataset.id === activeSortFieldName) {
                    if (sortType === 'ASC') {
                        sortIcon.className = 'las la-angle-up';
                    }
                    else {
                        sortIcon.className = 'las la-angle-down';
                    }
                }
                else {
                    sortIcon.className = 'las la-angle-down sort-inactive';
                }
            }
        }
    }

    // Sorts the data w.r.t the column selected
    sortRecordDetailsList(sortFieldName, sortType) {
        this.actionItemData.sort(function (a, b) {
            let getFieldDetailsByName = function (recordDetails, fieldName) {
                let resFieldDetails = null;
                if (recordDetails.record && recordDetails.record.length > 0) {
                    for (let k = 0; k < recordDetails.record.length; k++) {
                        let fieldDetails = recordDetails.record[k];
                        if (fieldDetails.fieldName === fieldName) {
                            resFieldDetails = fieldDetails;
                            break;
                        }
                    }
                }
                return resFieldDetails;
            };
            let aFieldDetails = getFieldDetailsByName(a, sortFieldName);
            let bFieldDetails = getFieldDetailsByName(b, sortFieldName);
            let aFieldValue = (aFieldDetails.value) ? aFieldDetails.value : '';
            let bFieldValue = (bFieldDetails.value) ? bFieldDetails.value : '';
            let compareVal = false;
            if (sortType === "ASC") {
                compareVal = aFieldValue.localeCompare(bFieldValue);
            }
            else {
                compareVal = bFieldValue.localeCompare(aFieldValue);
            }
            return compareVal;
        });
    }

}