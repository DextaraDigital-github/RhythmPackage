import { LightningElement, track, api } from 'lwc';
import deleteRecords from '@salesforce/apex/rtmvpcRelatedListsController.deleteRecords';

export default class CustomTable extends LightningElement {
    statusOptions = [
        {
            value: 'all',
            label: 'All',
            //description: 'Done working on this item',
        },
        {
            value: 'new',
            label: 'New',
            //description: 'A new item',
        },
        {
            value: 'RecentlyViewed',
            label: 'Recently Viewed',
            //description: 'Currently working on this item',
        },

    ];
    value = 'All';
    @api record;
    @track iconName = 'utility:pin';


    //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded 
    @track isShowHideColumnsModalOpen = false;
    @track isShuffleColumnsModalOpen = false;
    @api objName;
    @api colList;
    @api showProgressBar;
    @api defPageSize = 15;
    @track recList = [];
    @track selectedPageNumber;
    @track pageNumberOptions;
    @track selectedPageSize;
    @track savedResponseMap = new Map();
    @track finalSection;
    @api gridoptions = { deleteRecords: false, calendarViews: false, bulkCreation: false, newRecord: false, newEmployee: false, exportRowAsCsv: false, exportRowAsPdf: false };
    @track rowDataIdList = [];
    @api relatedListRecords = [];
    allRecordsList;
    @api objectRecordData;
    @track pageSizeOptions = [
        { label: '15', value: '15' },
        { label: '20', value: '20' },
        { label: '25', value: '25' },
        { label: '30', value: '30' }
    ];
    selectedColumnsList = null;


    // @api records;

    //Start: Show/Hide/Shuffle Columns
    viewColList;
    columnsOptions = [];
    selectedColumnOptions = [];
    requiredColumnsOptions = [];
    //End: Show/Hide/Shuffle Columns


    //Handles the pin icon for list view
    handleClick() {
        this.iconName = (this.iconName === 'utility:pin') ? 'utility:pinned' : 'utility:pin';
    }

    //Handles the selected list view
    handleChange(event) {
        // Get the string of the "value" attribute on the selected option
        this.value = event.detail.value;
    }

    // Gets all the filter details
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

    // Filters data based on the search
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
            this.recList = newRecList;
        }
        else {
            this.recList = this.allRecordsList;
        }
    }

    // Clears all the values in the search boxes provided for each column
    clearAllFilterTextboxes() {
        let allTextBoxes = this.template.querySelectorAll('[data-filtertextbox]');
        if (!!allTextBoxes && allTextBoxes.length > 0) {
            for (let i = 0; i < allTextBoxes.length; i++) {
                allTextBoxes[i].value = '';
            }
        }
    }

    // Resets the sort status of all the column i.e. neither ascending or descending
    resetAllColumnSortStatusToDefault() {
        let allSortIcons = this.template.querySelectorAll('[data-sorticon]');
        if (!!allSortIcons && allSortIcons.length > 0) {
            allSortIcons.forEach(allsort => {
                allsort.className = 'las la-angle-down sort-inactive';
            })
        }
    }

    // Gets all the records in the page
    getPageRecords(items, page = 1, perPage = 10) {
        const offset = perPage * (page - 1);
        const paginatedItems = items.slice(offset, perPage * page);
        return paginatedItems;
    }

    // Returns the count of total records
    getTotalRelatedRecordsCount() {
        let totalRecordsCount = 0;
        if (this.relatedListRecords) {
            totalRecordsCount = this.relatedListRecords.length;
        }
        return totalRecordsCount;
    }

    // Handles the change in page number and prepares the data accordingly
    handlePageNumberChange(event) {
        if (event) {
            this.selectedPageNumber = event.detail.value;
        }
        this.clearAllFilterTextboxes();
        this.resetAllColumnSortStatusToDefault();
        let currentPageRecords = this.getPageRecords(this.relatedListRecords, this.selectedPageNumber, this.selectedPageSize);
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
    }

    // Handles the change in page size i.e. the number of records to be displayed in the table
    handlePageSizeChange(event) {
        this.clearAllFilterTextboxes();
        this.resetAllColumnSortStatusToDefault();
        this.selectedPageSize = event.detail.value;
        this.preparePaginationControlsData(this.selectedPageSize);
        let currentPageRecords = this.getPageRecords(this.relatedListRecords, 1, this.selectedPageSize);
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
    }

    // Navigates to the previous page in the table pagination
    handlePreviousClick() {
        if (this.selectedPageNumber) {
            let page = Number(this.selectedPageNumber);
            let previousPage = page - 1 ? page - 1 : null;
            if (previousPage) {
                this.selectedPageNumber = previousPage.toString();
                this.handlePageNumberChange(null);
            }
        }
    }

    // Navigates to the next page in the table pagination
    handleNextClick() {
        if (!!this.selectedPageSize && !!this.selectedPageNumber) {
            let perPage = Number(this.selectedPageSize);
            let page = Number(this.selectedPageNumber);
            let totalRecordsCount = this.getTotalRelatedRecordsCount();
            let totalPages = Math.ceil(totalRecordsCount / perPage);
            let nextPage = (totalPages > page) ? page + 1 : null;
            if (nextPage && nextPage !== null) {
                this.selectedPageNumber = nextPage.toString();
                this.handlePageNumberChange(null);
            }
        }
    }
    
    // Prepare data for pagination
    preparePaginationControlsData(perPage) {
        if (!perPage) {
            perPage = this.pageSizeOptions[0].value;
            this.selectedPageSize = perPage;
        }
        this.pageNumberOptions = [];
        let totalRecordsCount = this.getTotalRelatedRecordsCount();
        let totalPages = Math.ceil(totalRecordsCount / Number(perPage));
        if (totalPages > 0) {
            let tempPageOptions = [];
            for (let i = 1; i <= totalPages; i++) {
                tempPageOptions.push({ label: i.toString(), value: i.toString() });
            }
            this.pageNumberOptions = tempPageOptions;
            this.selectedPageNumber = this.pageNumberOptions[0].value;
        }
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
        this.recList.sort(function (a, b) {
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
            let compareVal  = false;
            if (sortType === "ASC") {
                compareVal = aFieldValue.localeCompare(bFieldValue);
            }
            else {
                compareVal = bFieldValue.localeCompare(aFieldValue);
            }
            return compareVal;
        });
    }

    // Formats the data into the format which can be displayed in the table
    assignData(relatedListRecords, colList) {
        var recDataList = [];
        for (let i = 0; i < relatedListRecords.length; i++) {
            let recDetails = {};
            let recArray = [];
            if (relatedListRecords[i] !== null) {
                for (let j = 0; j < colList.length; j++) {
                    if (typeof relatedListRecords[i].Rhythm__Assessment__r !== 'undefined') {
                        let recJson = {};
                        recJson.fieldName = colList[j].fieldName;
                        recJson.label = colList[j].label;
                        if (colList[j].type === 'date') {
                            if (typeof relatedListRecords[i].Rhythm__End_Date__c !== 'undefined') {
                                let x = relatedListRecords[i].Rhythm__End_Date__c.split('T')[0];
                                let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                recJson.value = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                            }
                        }
                        else {
                            if (typeof relatedListRecords[i][colList[j].fieldName] !== 'undefined' && colList[j].fieldName !== 'Name') {
                                recJson.value = relatedListRecords[i][colList[j].fieldName];
                            }
                            else if (colList[j].fieldName === 'Name') {
                                if (typeof relatedListRecords[i].Rhythm__Assessment__r.Name !== 'undefined') {
                                    recJson.value = relatedListRecords[i].Rhythm__Assessment__r.Name;
                                }
                            }
                        }
                        if (colList[j].fieldName.includes('Status') && recJson.value) {
                            if (recJson.value.toLowerCase() === 'not started' || recJson.value.toLowerCase() === 'open')
                                recJson.classList = 'status-notstarted';
                            else if (recJson.value.toLowerCase() === 'completed' || recJson.value.toLowerCase() === 'active' || recJson.value.toLowerCase() === 'submitted')
                                recJson.classList = 'status-completed';
                            else if (recJson.value.toLowerCase() === 'deferred' || recJson.value.toLowerCase() === 'overdue' || recJson.value.toLowerCase() === 'inactive')
                                recJson.classList = 'status-deferred';
                            else if (recJson.value.toLowerCase() === 'In Progress')
                                recJson.classList = 'cad-timeline_pending';
                            else if (recJson.value.toLowerCase() === 'waiting on someone else' || recJson.value.toLowerCase() === 'on hold' || recJson.value.toLowerCase() === 'new')
                                recJson.classList = 'status-waitingonsomeoneelse';
                                else if (recJson.value === 'In Review')
                                recJson.classList = 'cad-timeline_pending';
                                 else if (recJson.value === 'Review Completed')
                                recJson.classList = 'cad-timeline_reviewcompleted';
                                 else if (recJson.value === 'Need More Information')
                                recJson.classList = 'cad-timeline_rejected';
                        }
                        if (colList[j].fieldName === 'Name') {
                            recJson.isHyperlink = true;
                            if (this.objName === 'Rhythm__Assessment__c') {
                                if (typeof relatedListRecords[i].Rhythm__Assessment__r.Rhythm__Additional_Requests__c !== 'undefined'
                                    && Number(relatedListRecords[i].Rhythm__Assessment__r.Rhythm__Additional_Requests__c) > 0) {
                                    recJson.flagSymbol = 'action:priority';
                                }
                            }
                        }
                        if (colList[j].fieldName === 'Rhythm__Status__c') {
                            if (typeof relatedListRecords[i].Rhythm__Status__c !== 'undefined')
                                if (relatedListRecords[i].Rhythm__Status__c === 'Submitted') {
                                    recJson.surveySymbol = 'utility:lock';
                                }
                                else {
                                    recJson.surveySymbol = 'utility:unlock';
                                }
                        }
                        recArray.push(recJson);
                        if (this.showProgressBar === "true") {
                            if (typeof relatedListRecords[i].Rhythm__Completed__c !== 'undefined') {
                                recDetails.progressBarValue = relatedListRecords[i].Rhythm__Completed__c;
                            }
                        }
                        recDetails.id = relatedListRecords[i].Id;
                    }
                }
            }
            recDetails.record = recArray;
            recDataList.push(recDetails);
        }
        return recDataList;
    }

    // Dispatches an event to the parent when a record is clicked so that the parent hides the table and opens the record detail of the record selected
    takeSurveyHandler(event) {
        const rowclick = new CustomEvent('rowclick', {
            detail: { accountassessmentId: event.currentTarget.dataset.id }
        });
        this.dispatchEvent(rowclick);
    }
    
    connectedCallback() {
        let pageSizeDefaultValue = this.pageSizeOptions[0].value;
        let currentPageRecords = this.getPageRecords(this.objectRecordData, 1, pageSizeDefaultValue);
        this.viewColList = this.colList;
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        // this.accountsId = this.accountid;
        this.allRecordsList = this.recList;
        this.relatedListRecords = this.objectRecordData;
        this.preparePaginationControlsData();
        this.gridoptions.exportRowAsCsv = (this.objName === 'Rhythm__Assessment__c' ? true : false);
        this.gridoptions.exportRowAsPdf = (this.objName === 'Rhythm__Assessment__c' ? true : false);
        this.viewColList = this.colList;
        if (typeof this.colList !== 'undefined' && this.colList !== null) {
            this.prepareColumnsOptions();
        }
        //Do not delete
        /* if (!this.recordType) {
            this.recordType = '012000000000000AAA';
        } */
    }

    renderedCallback() {
        // Render the HTML value in fields if any field contains HTML data
        if (this.recList) {
            for (let i = 0; i < this.recList.length; i++) {
                if (this.recList[i].record) {
                    for (let j = 0; j < this.recList[i].record.length; j++) {
                        if (this.recList[i].record[j].isHtml === true) {
                            if (this.template.querySelectorAll('.' + this.recList[i].id + this.recList[i].record[j].fieldName + 'ContainsHtmlMarkUp').length > 0) {
                                this.template.querySelectorAll('.' + this.recList[i].id + this.recList[i].record[j].fieldName + 'ContainsHtmlMarkUp')[0].innerHTML = this.recList[i].record[j].value;
                            }
                        }
                    }
                }
            }
        }
    }

    // Prepares the available columns options and selected columns options for the Show/Hide columns popup
    prepareColumnsOptions() {
        if (!(this.colList && this.colList.length > 0)) {
            return;
        }
        let tempColumnsOptions = []
        let tempSelectedColumnOptions = [];
        for (let i = 0; i < this.colList.length; i++) {
            let colDetails = this.colList[i];
            tempColumnsOptions.push({ label: colDetails.label, value: colDetails.fieldName });
            tempSelectedColumnOptions.push(colDetails.fieldName);
        }
        this.columnsOptions = tempColumnsOptions;
        this.selectedColumnOptions = tempSelectedColumnOptions;
    }

    // Handles the columns which are moved between Available and Selected values in the duallistbox
    handleColumnChange(event) {
        // Get the list of the "value" attribute on all the selected options
        this.selectedColumnsList = event.detail.value;
    }

    // Opens the Modal with Show/Hide columns feature
    openShowHideColumnsModal() {
        this.isShowHideColumnsModalOpen = true;
    }

    // Closes the modal which contains Show/Hide columns feature
    closeShowHideColumnsModal() {
        this.isShowHideColumnsModalOpen = false;
    }

    // Handles the showing/hiding of columns
    applyShowHideColumns() {
        this.clearAllFilterTextboxes();
        this.resetAllColumnSortStatusToDefault();
        if (!(this.selectedColumnsList && this.selectedColumnsList.length > 0)) {
            return;
        }
        let columnDetailsList = [];
        for (let i = 0; i < this.selectedColumnsList.length; i++) {
            let selectedColumn = this.selectedColumnsList[i];
            for (let j = 0; j < this.colList.length; j++) {
                let colDetails = this.colList[j];
                if (colDetails.fieldName === selectedColumn) {
                    columnDetailsList.push(colDetails);
                    break;
                }
            }
        }
        this.viewColList = columnDetailsList;
        let currentPageRecords = this.getPageRecords(this.relatedListRecords, this.selectedPageNumber, this.selectedPageSize);
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
    }

    // Opens the modal with column reordering feature
    openShuffleColumnsModal() {
        this.isShuffleColumnsModalOpen = true;
    }

    // Closes the modal with column reordering feature
    closeShuffleColumnsModal() {
        this.isShuffleColumnsModalOpen = false;
    }

    // Saves the columns display settings i.e. order
    saveColumnsDisplaySettings() {
        this.applyShowHideColumns();
        this.selectedColumnOptions = this.selectedColumnsList;
        this.isShowHideColumnsModalOpen = false;
        this.isShuffleColumnsModalOpen = false;
    }

    // Extracts the row as CSV
    exportRowAsCsvHandler(event) {
        const exportrowascsv = new CustomEvent('exportrowascsv',{
            detail: {value: event.currentTarget.dataset.id}
        }); 
        this.dispatchEvent(exportrowascsv);
    }

    // Extracts the row as PDF
    exportRowAsPdfHandler(event) {
        const exportrowaspdf = new CustomEvent('exportrowaspdf',{
            detail: {value: event.currentTarget.dataset.id}
        });  
        this.dispatchEvent(exportrowaspdf);
    }
    
    exportGridAsCsvHandler() {
        if (!(!!this.recList && this.recList.length > 0)) {
            return;
        }
        let csvHeader = '';
        for (let colIndex = 0; colIndex < this.recList[0].record.length; colIndex++) {
            csvHeader = csvHeader + this.recList[0].record[colIndex].label + ',';
        }
        csvHeader = csvHeader.substring(0, csvHeader.length - 1) + ',% completed,\n';
        let csvRows = '';
        for (let i = 0; i < this.recList.length; i++) {
            let recordDetails = this.recList[i];
            if (!!recordDetails.record && recordDetails.record.length > 0) {
                let csvRow = '';
                for (let j = 0; j < recordDetails.record.length; j++) {
                    csvRow += recordDetails.record[j].value + ',';
                }
                csvRow=csvRow+this.recList[i].progressBarValue;
                csvRow = csvRow.substring(0, csvRow.length - 1) + '\n';
                csvRows += csvRow;
            }
        }
        csvHeader = csvHeader + csvRows;
        csvHeader = csvHeader.replaceAll('undefined', '').replaceAll('null', '').replaceAll('undefine','');
        let blob = new Blob([csvHeader], { type: 'text/plain' });
        let url = window.URL.createObjectURL(blob);
        let atag = document.createElement('a');
        atag.setAttribute('href', url);
        atag.setAttribute('download', 'assessments.csv');
        atag.click();

    }

    // Extracts the Grid as PDF
    exportGridAsPdfHandler() {
        var tableHtml = '<table><thead><tr>';
        for (let i = 0; i < this.viewColList.length; i++) {
            tableHtml += '<th>' + this.viewColList[i].label + '</th>';
        }
        tableHtml += '<th>% Completed</th>';
        tableHtml += '</tr></thead><tbody>';
        for (let i = 0; i < this.recList.length; i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < this.recList[i].record.length; j++) {
                if (j === 0) {
                    if (i % 2 === 0)
                        tableHtml += '<td class="oddLeftTd">' + this.recList[i].record[j].value + '</td>';
                    else
                        tableHtml += '<td class="evenLeftTd">' + this.recList[i].record[j].value + '</td>';
                }
                else {
                    tableHtml += '<td>' + this.recList[i].record[j].value + '</td>';
                }
                 
            }
            tableHtml += '<td>' + this.recList[i].progressBarValue + '</td>'; 
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        let win = window.open('', '', 'width=' + (window.innerWidth * 0.9) + ',height=' + (window.innerHeight * 0.9) + ',location=no, top=' + (window.innerHeight * 0.1) + ', left=' + (window.innerWidth * 0.1));
        let style = '<style>@media print { * {-webkit-print-color-adjust:exact;}} @page{ margin: 0px;} *{margin: 0px; padding: 0px; height: 0px; font-family: Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif !important;} .headerDiv{width: 100%; height: 56px; padding: 20px; background-color: #03314d;} .headerText{font-size: 40px; color: white; font-weight: bold} .tableDiv{padding: 20px;} table {border-collapse:collapse; font-size: 14px;} table td, th{ padding: 4px;} table tr:nth-child(odd) td {background-color: #F9F9F9;} .oddLeftTd{background-color: #E9E9E9 !important;} .evenLeftTd{background-color: #F1F1F1 !important;} table th{ border: 1px solid #E9E9E9; background-color:#B5BEC58F}</style>';
        win.document.getElementsByTagName('head')[0].innerHTML += style;
        win.document.getElementsByTagName('body')[0].innerHTML += '<div class="headerDiv slds-p-around_small"><span class="headerText">Rhythm</span></div><br/>';
        tableHtml = tableHtml.replaceAll('undefined', '').replaceAll('null', '');
        win.document.getElementsByTagName('body')[0].innerHTML += '<div class="tableDiv slds-p-around_medium">' + tableHtml + '</div>';
        win.print();
        win.close();
    }
    
    // Handles the selection of checkboxes in the table
    checkboxChangeHandler(event) {
        var dataId = event.currentTarget.dataset.id;
        var value = event.target.checked;
        var cbList = this.template.querySelectorAll('.recCheckbox');
        if (dataId === 'allCheckboxes') {
            for (let i = 0; i < cbList.length; i++) {
                this.template.querySelectorAll('.recCheckbox')[i].checked = value;
                if (value === true)
                    this.rowDataIdList.push(this.template.querySelectorAll('.recCheckbox')[i].dataset.id.toString());
                else
                    this.rowDataIdList.splice(this.rowDataIdList.indexOf(dataId), 1);
            }
        }
        else {
            if (value === true) {
                this.rowDataIdList.push(dataId);
                if (this.rowDataIdList.length === cbList.length)
                    this.template.querySelectorAll('[data-id="allCheckboxes"]')[0].checked = value;
            }
            else if (value === false) {
                if (this.rowDataIdList.length === cbList.length)
                    this.template.querySelectorAll('[data-id="allCheckboxes"]')[0].checked = value;
                this.rowDataIdList.splice(this.rowDataIdList.indexOf(dataId), 1);
            }
        }
        this.gridoptions.deleteRecords = (this.rowDataIdList.length > 0 && this.gridoptions.deleteRecords);
    }

    // Handles deletion of rows 
    deleteHandler() {
        deleteRecords({ recIdList: this.rowDataIdList }).then(result => {
            if (result === 'Success') {
                let reclist_dup = this.recList;
                for (let j = 0; j < this.rowDataIdList.length; j++) {
                    for (let i = 0; i < this.recList.length; i++) {
                        if (reclist_dup[i].id.toString() === this.rowDataIdList[j].toString()) {
                            reclist_dup.splice(i, 1);
                            break;
                        }
                    }
                }
                this.recList = reclist_dup;
            }
        }).catch(error => {
            console.log(error);
            
        });
    }

    //Column Resize : START
    columnResizeDetails = {
        "initialPosition": 0,
        "lastPosition": 0,
        "fieldName": '',
        "columnHeader": null,
        "resizeHandleInitPosition": 0,
        "columnResizeHandle": null
    };
    handleResizeMouseDown(event) {
        this.clearColumnResizeDetails();
        this.columnResizeDetails.initialPosition = event.clientX;
        this.columnResizeDetails.resizeHandleInitPosition = event.clientX;
        this.columnResizeDetails.fieldName = event.currentTarget.dataset.resizefield;
        let columnHeader = this.template.querySelectorAll('[data-columnheader="' + this.columnResizeDetails.fieldName + '"]');
        let columnresizeHandle = this.template.querySelectorAll('[data-resizefield="' + this.columnResizeDetails.fieldName + '"]');
        if (!!columnHeader && columnHeader.length > 0 && !!columnresizeHandle && columnresizeHandle.length > 0) {
            let cResizeDetails = this.columnResizeDetails;
            cResizeDetails.columnHeader = columnHeader[0];
            cResizeDetails.columnResizeHandle = columnresizeHandle[0];
            let handleResizeMouseMoveHandler1 = this.handleResizeMouseMove;
            let resizeMouseMoveHandler = function (event1) {
                handleResizeMouseMoveHandler1(event1, cResizeDetails);
            };
            window.addEventListener('mouseup', (muEvent) => {
                this.handleColumnResizeMouseUp(muEvent, cResizeDetails, resizeMouseMoveHandler);
            }, { once: true });
        }
    }
    handleResizeMouseMove(mmEvent, mmResizeDetails) {
        let pos1 = mmResizeDetails.resizeHandleInitPosition - mmEvent.clientX;
        mmResizeDetails.resizeHandleInitPosition = mmEvent.clientX;
        let mmResizeHandle = mmResizeDetails.columnResizeHandle;
        mmResizeHandle.style.left = (mmResizeHandle.offsetLeft - pos1) + "px";
    }
    handleColumnResizeMouseUp(muEvent, muResizeDetails) {
        window.isResizingProgress = false;
        muResizeDetails.lastPosition = muEvent.clientX;
        let differencePosition = muResizeDetails.lastPosition - muResizeDetails.initialPosition;
        let colWidth = muResizeDetails.columnHeader.offsetWidth + differencePosition;
        muResizeDetails.columnHeader.setAttribute("style", "width:" + colWidth + "px");
    }
    clearColumnResizeDetails() {
        this.columnResizeDetails.initialPosition = 0;
        this.columnResizeDetails.lastPosition = 0;
        this.columnResizeDetails.fieldName = '';
        this.columnResizeDetails.columnHeader = null;
        this.columnResizeDetails.resizeHandleInitPosition = 0;
        this.columnResizeDetails.columnResizeHandle = null;
    }
    setAllColumnHeadersWidth() {
        let columnHeaders = this.template.querySelectorAll('[data-columnheader]');
        if (!!columnHeaders && columnHeaders.length > 0) {
            columnHeaders.forEach( colHeader =>{
                let cWidth = colHeader.offsetWidth;
                colHeader.setAttribute("style", "width:" + cWidth + "px");
            })
        }
    }
    //Column Resize : END
}