import { LightningElement, wire, track, api } from 'lwc';
import getAssesmentRecords from '@salesforce/apex/AssessmentController.getAssesmentRecords';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi'; //To fetch all the related records of a RecordId
import getRelatedTasks from '@salesforce/apex/rtmvpcRelatedListsController.getRelatedTasks'; //To fetch all the related Task records of a RecordId as the uiRelatedListApi doesn't support Activity
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList'; //To fetch all the Questions from the Assessment_Template__c Id from the Supplier_Assessment__c record
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList'; //To fetch all the Supplier_Response__c records related to the Supplier_Assessment__c record
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList'; //To fetch the Assessment_Template__c Id from the Supplier_Assessment__c record
import deleteRecords from '@salesforce/apex/rtmvpcRelatedListsController.deleteRecords';
// import getQuestionsCount from '@salesforce/apex/rtmvpcRelatedListsController.getQuestionsCount'; //Commented By Kushal
// import getResponsesCount from '@salesforce/apex/rtmvpcRelatedListsController.getResponsesCount'; //Commented By Kushal


export default class CustomTable extends LightningElement {
    @api navListHandler = [];
    @api navListHandler_copy = [];
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

    @track spinner = false;
    @api record;
    @track iconName = 'utility:pin';

    handleClick(event) {
        this.iconName = (this.iconName === 'utility:pin') ? 'utility:pinned' : 'utility:pin';
    }
    handleChange(event) {
        // Get the string of the "value" attribute on the selected option
        this.value = event.detail.value;
    }

    //Boolean tracked variable to indicate if modal is open or not default value is false as modal is closed when page is loaded 
    @track isShowHideColumnsModalOpen = false;
    @track isShuffleColumnsModalOpen = false;
    assessmentrecorddata=[];
    @api recId;
    @api recordType;
    @api objName;
    @api relName;
    @api colList;
    @api isCustomDetailPage;
    @api showProgressBar;
    @api showSurvey;
    @api progressBarValue = 0;
    @api defPageSize=15;
    @track recList=[];
    @track showTable;
    @track accountsId;
    @track recordDetailId;
    @track search;
    @track showRecordDetail;
    @track takeSurvey;
    @track viewSurvey;
    @api customRecordPageCol;
    @api tabsData;
    @track pData = {};
    @track fieldsList;
    @track selectedPageNumber;
    @track pageNumberOptions;
    //handlePageNumberChange
    @track selectedPageSize;
    @track pageSizeOptions;
    @track formattedDate;
    @track createNewsupplierAss = false;
    //handlePageSizeChange
    @track savedResponseMap = new Map();
    @track finalSection;
    @track opt_showCalendar;
    @track assessmentsId;
    @track opt_list;
    @track opt_new;
    @track opt_delete;
    @track opt_newEmp;
    @track opt_rec_csv;
    @track opt_rec_pdf;
    @track selectedItemId;
    @api isChildTable;
    progressBarData = {};
    @track rowDataIdList = [];
    @track objHistoryList = [];
    @api tableLabel;
    @api activeTab = '';
    @api relatedListRecords = [];
    allRecordsList;
    @api objectRecordData=[];
    @track pageSizeOptions = [
        // { label: '5', value: '5' },
        // { label: '10', value: '10' },
        { label: '15', value: '15' },
        { label: '20', value: '20' },
        { label: '25', value: '25' },
        { label: '30', value: '30' }
    ];

    //Start: Show/Hide/Shuffle Columns
    viewColList;
    columnsOptions = [];
    selectedColumnOptions = [];
    requiredColumnsOptions = [];
    //End: Show/Hide/Shuffle Columns


    @wire(getRelatedListRecords, {
        parentRecordId: '$recId',
        relatedListId: '$relName',
        fields: '$fieldsList'
    })
    getRelatedListRecordsList({ error, data }) {
        if (data) {
            //console.clear();
            console.log('getRelatedListRecordsList',data);
            if (typeof this.relatedListRecords != undefined) {
                this.relatedListRecords = JSON.parse(JSON.stringify(data.records));

                this.preparePaginationControlsData();
                let pageSizeDefaultValue = this.pageSizeOptions[0].value;
                let currentPageRecords = this.getPageRecords(this.relatedListRecords, 1, pageSizeDefaultValue);

                this.viewColList = this.colList;
                //this.recList = this.assignData(this.relatedListRecords, this.colList);
                this.recList = this.assignData(currentPageRecords, this.viewColList);
                this.allRecordsList = this.recList;
            }
        }
        else if (error) {
            console.log('Wire Related List data', JSON.stringify(error));
        }
    }

    

    handlePageNumberChange(event) {
        if (!!event) {
            this.selectedPageNumber = event.detail.value;
        }

        this.clearAllFilterTextboxes();
        this.resetAllColumnSortStatusToDefault();

        let currentPageRecords = this.getPageRecords(this.relatedListRecords, this.selectedPageNumber, this.selectedPageSize);
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
    }

    handlePageSizeChange(event) {
        this.clearAllFilterTextboxes();
        this.resetAllColumnSortStatusToDefault();

        this.selectedPageSize = event.detail.value;

        this.preparePaginationControlsData(this.selectedPageSize);

        //console.log(JSON.stringify(this.relatedListRecords));
        let currentPageRecords = this.getPageRecords(this.relatedListRecords, 1, this.selectedPageSize);
        //console.log(JSON.stringify(currentPageRecords));
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
    }

    handlePreviousClick(event) {
        if (!!this.selectedPageNumber) {
            let page = parseInt(this.selectedPageNumber);
            let previousPage = page - 1 ? page - 1 : null;
            if (!!previousPage) {
                this.selectedPageNumber = previousPage.toString();
                this.handlePageNumberChange(null);
            }
        }
    }

    handleNextClick(event) {
        if (!!this.selectedPageSize && !!this.selectedPageNumber) {
            let perPage = parseInt(this.selectedPageSize);
            let page = parseInt(this.selectedPageNumber);

            let totalRecordsCount = this.getTotalRelatedRecordsCount()

            let totalPages = Math.ceil(totalRecordsCount / perPage);
            let nextPage = (totalPages > page) ? page + 1 : null;

            if (!!nextPage) {
                this.selectedPageNumber = nextPage.toString();
                this.handlePageNumberChange(null);
            }
        }
    }

    clearAllFilterTextboxes() {
        let allTextBoxes = this.template.querySelectorAll('[data-filtertextbox]');

        if (!!allTextBoxes && allTextBoxes.length > 0) {
            for (var i = 0; i < allTextBoxes.length; i++) {
                allTextBoxes[i].value = '';
            }
        }
    }

    resetAllColumnSortStatusToDefault() {
        let allSortIcons = this.template.querySelectorAll('[data-sorticon]');

        if (!!allSortIcons && allSortIcons.length > 0) {
            for (var i = 0; i < allSortIcons.length; i++) {
                allSortIcons[i].className = 'las la-angle-down sort-inactive';
            }
        }
    }

    getTotalRelatedRecordsCount() {
        let totalRecordsCount = 0;
        if (!!this.relatedListRecords) {
            totalRecordsCount = this.relatedListRecords.length;
        }
        return totalRecordsCount;
    }

    preparePaginationControlsData(perPage) {
        if (!perPage) {
            perPage = this.pageSizeOptions[0].value;
            this.selectedPageSize = perPage;
        }

        this.pageNumberOptions = [];
        let totalRecordsCount = this.getTotalRelatedRecordsCount();
        let totalPages = Math.ceil(totalRecordsCount / parseInt(perPage));
        if (totalPages > 0) {
            let tempPageOptions = [];
            for (var i = 1; i <= totalPages; i++) {
                tempPageOptions.push({ label: i.toString(), value: i.toString() });
            }

            this.pageNumberOptions = tempPageOptions;
            this.selectedPageNumber = this.pageNumberOptions[0].value;
        }
    }

    getPageRecords(items, page = 1, perPage = 10) {
        const offset = perPage * (page - 1);
        const totalPages = Math.ceil(items.length / perPage);
        const paginatedItems = items.slice(offset, perPage * page);

        // return {
        //     previousPage: page - 1 ? page - 1 : null,
        //     nextPage: (totalPages > page) ? page + 1 : null,
        //     total: items.length,
        //     totalPages: totalPages,
        //     records: paginatedItems
        // };
        return paginatedItems;
    };

    handleExportCSV(event) {
        this.exportAsCSV();
    }

    exportAsCSV() {
        if (!(!!this.recList && this.recList.length > 0)) {
            return;
        }

        let csvHeader = '';
        for (var colIndex = 0; colIndex < this.recList[0].record.length; colIndex++) {
            csvHeader = csvHeader + this.recList[0].record[colIndex].label + ',';
        }

        csvHeader = csvHeader.substring(0, csvHeader.length - 1) + '\n';

        let csvRows = '';
        for (var i = 0; i < this.recList.length; i++) {
            let recordDetails = this.recList[i];
            if (!!recordDetails.record && recordDetails.record.length > 0) {
                let csvRow = '';
                for (var j = 0; j < recordDetails.record.length; j++) {
                    csvRow += recordDetails.record[j].value + ',';
                }
                csvRow = csvRow.substring(0, csvRow.length - 1) + '\n';
                csvRows += csvRow;
            }

        }

        let csvAllRows = csvHeader + csvRows;
        csvAllRows = csvAllRows.replaceAll('undefined', '').replaceAll('null', '');
        var blob = new Blob([csvAllRows], { type: 'text/plain' });
        //var blob = new Blob([csvAllRows], {type:'application/pdf'});
        var url = window.URL.createObjectURL(blob);
        var atag = document.createElement('a');
        atag.setAttribute('href', url);
        atag.setAttribute('download', this.relName.replace('__r', '') + '.csv');
        atag.click();
    }

    assignData(relatedListRecords, colList) {
        var recDataList = [];
        if (typeof this.objName != undefined && this.objName === 'Task') {
            for (var i = 0; i < relatedListRecords.length; i++) {
                var recDetails = {};
                var recArray = [];
                for (var j = 0; j < colList.length; j++) {
                    let recJson = {};
                    recJson.fieldName = colList[j].fieldName;
                    recJson.label = colList[j].label;
                    if (colList[j].fieldName.includes('.')) {
                        if (relatedListRecords[i][colList[j].fieldName.split('.')[0]])
                            recJson.value = relatedListRecords[i][colList[j].fieldName.split('.')[0]][colList[j].fieldName.split('.')[1]];
                        else
                            recJson.value = '';
                    }
                    else {
                        recJson.value = relatedListRecords[i][colList[j].fieldName];
                    }
                    if (colList[j].type === 'date' && recJson.value) {
                        var x = recJson.value.split('T')[0];
                        //recJson.value = x.split('-')[2] + '-' + x.split('-')[1] + '-' + x.split('-')[0];
                        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        recJson.value = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                    }
                    if (colList[j].fieldName === 'Status' && recJson.value) {
                        if (recJson.value === 'Not Started')
                            recJson.classList = 'status-notstarted';
                        else if (recJson.value === 'Completed')
                            recJson.classList = 'status-completed';
                        else if (recJson.value === 'Deferred')
                            recJson.classList = 'status-deferred';
                        else if (recJson.value === 'In Progress')
                            recJson.classList = 'status-inprogress';
                        else if (recJson.value === 'Waiting on someone else')
                            recJson.classList = 'status-waitingonsomeoneelse';
                    }
                    recArray.push(recJson);
                }
                recDetails.id = relatedListRecords[i].Id;

                recDetails.viewButton = true;
                recDetails.takeSurvey = false;
                recDetails.record = recArray;
                recDataList.push(recDetails);
            }
            //console.log('recDataList-->', recDataList);
        }
        else {
            for (var i = 0; i < relatedListRecords.length; i++) {
                var recDetails = {};
                var recArray = [];
                if (relatedListRecords[i] != null) {
                    for (var j = 0; j < colList.length; j++) {
                        if (relatedListRecords[i].fields) {
                            let recJson = {};
                            recJson.fieldName = colList[j].fieldName;
                            recJson.label = colList[j].label;
                            if (colList[j].type === 'date' && relatedListRecords[i].fields[colList[j].fieldName].value) {
                                var x = relatedListRecords[i].fields[colList[j].fieldName].value.split('T')[0];
                                // recJson.value = x.split('-')[2] + '-' + x.split('-')[1] + '-' + x.split('-')[0];
                                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                recJson.value = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
                            }
                            else if (colList[j].type === 'lookup' && typeof relatedListRecords[i].fields != 'undefined' && typeof relatedListRecords[i].fields[colList[j].fieldName.split('.')[0]] != 'undefined') {
                                if (typeof relatedListRecords[i].fields[colList[j].fieldName.split('.')[0]].value != 'undefined' && relatedListRecords[i].fields[colList[j].fieldName.split('.')[0]].value != null) {
                                    recJson.value = relatedListRecords[i].fields[colList[j].fieldName.split('.')[0]].value.fields[colList[j].fieldName.split('.')[1]].value;
                                }
                            }
                            else if (colList[j].type === 'html' && relatedListRecords[i].fields && relatedListRecords[i].fields[colList[j].fieldName].value) {
                                recJson.value = relatedListRecords[i].fields[colList[j].fieldName].value.replaceAll('/servlet/servlet.FileDownload?file', 'https://rhythm-dev1-ed-dev-ed.develop.file.force.com/servlet/servlet.FileDownload?file');
                            }
                            else {
                                recJson.value = relatedListRecords[i].fields[colList[j].fieldName].value;
                            }
                            //Project 'Completed' 'In progress' 'On Hold' 'Open' 'Overdue' null
                            //Employee 'Active' 'Inactive' null
                            if (colList[j].fieldName.includes('Status') && recJson.value) {
                                if (recJson.value.toLowerCase() === 'not started' || recJson.value.toLowerCase() === 'open')
                                    recJson.classList = 'status-notstarted';
                                else if (recJson.value.toLowerCase() === 'completed' || recJson.value.toLowerCase() === 'active' || recJson.value.toLowerCase() === 'submitted')
                                    recJson.classList = 'status-completed';
                                else if (recJson.value.toLowerCase() === 'deferred' || recJson.value.toLowerCase() === 'overdue' || recJson.value.toLowerCase() === 'inactive')
                                    recJson.classList = 'status-deferred';
                                else if (recJson.value.toLowerCase() === 'in progress')
                                    recJson.classList = 'status-inprogress';
                                else if (recJson.value.toLowerCase() === 'waiting on someone else' || recJson.value.toLowerCase() === 'on hold' || recJson.value.toLowerCase() === 'new')
                                    recJson.classList = 'status-waitingonsomeoneelse';
                            }
                            if (colList[j].fieldName === 'Name') {
                                recJson.isHyperlink = true;
                                if (this.objName === 'Rythm__Assessment__c') {
                                    //console.log(relatedListRecords[i].fields['Additional__c'].value);
                                    if (relatedListRecords[i].fields['Additional__c'] && Number(relatedListRecords[i].fields['Additional__c'].value) > 0) {
                                        console.log(relatedListRecords[i].fields['Additional__c'].value);
                                        recJson.flagSymbol = 'action:priority';
                                    }
                                }
                            }
                            if (colList[j].type === 'html') {
                                recJson.isHtml = true;
                                recJson.classList = relatedListRecords[i].id + colList[j].fieldName + 'ContainsHtmlMarkUp';
                            }
                            if (colList[j].fieldName === 'Assesment_Status__c') {
                                if (relatedListRecords[i].fields['Assesment_Status__c'].value === 'Submitted') {
                                    recJson.surveySymbol = 'utility:lock';
                                }
                                else {
                                    recJson.surveySymbol = 'utility:unlock';
                                }
                            }
                            recArray.push(recJson);
                            if (this.showProgressBar === "true") {
                                console.log('I appeared');
                                //colList.push({fieldName:'PercentageCompleted', label:'% Completed', value:0});
                                // recDetails=this.progressBarData[relatedListRecords[i].id]?(this.progressBarData[relatedListRecords[i].id].toString().split('.')[0]+'%'):'0%';
                                if (relatedListRecords[i].fields['Number_of_Questions__c'] && relatedListRecords[i].fields['Number_of_Responses__c'] && relatedListRecords[i].fields['Number_of_Responses__c'].value && relatedListRecords[i].fields['Number_of_Questions__c'].value) {
                                    console.log(relatedListRecords[i].fields['Number_of_Questions__c'].value + ' : ' + relatedListRecords[i].fields['Number_of_Responses__c'].value);
                                    recDetails.progressBarValue = (Number(relatedListRecords[i].fields['Number_of_Responses__c'].value) * 100 / Number(relatedListRecords[i].fields['Number_of_Questions__c'].value)) ? (Number(relatedListRecords[i].fields['Number_of_Responses__c'].value) * 100 / Number(relatedListRecords[i].fields['Number_of_Questions__c'].value)).toString().split('.')[0] : 0;
                                } else
                                    recDetails.progressBarValue = '0';

                                console.log(recDetails);
                            }

                        }
                    }
                }
                recDetails.id = relatedListRecords[i].id;
                recDetails.viewButton = true;
                recDetails.takeSurvey = false;
                recDetails.rowClick = 'viewClickHandler';
                //console.log(JSON.stringify(recDetails));

                if (this.objName === 'Rythm__Assessment__c') {
                    recDetails.rowClick = 'takeSurveyHandler';
                    recDetails.viewButton = false;
                    recDetails.takeSurvey = true;
                    if (relatedListRecords[i].fields['Rythm__Assesment_Status__c'].value === 'Submitted') {
                        recDetails.surveyLabel = 'View Survey';
                        recDetails.surveySymbol = 'utility:lock';
                    }
                    else {
                        recDetails.surveyLabel = 'Take Survey';
                        recDetails.surveySymbol = 'utility:unlock';
                    }
                }
                recDetails.record = recArray;
                recDataList.push(recDetails);
            }
        }
        //console.log(JSON.stringify(recDataList));
        return recDataList;
    }

    sortClickHandler(event) {
        let sortFieldName = event.currentTarget.dataset.id;
        //console.log('event.currentTarget -- ', event.currentTarget);
        //console.log('event.currentTarget.className -- ', event.currentTarget.className);
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
        // alert(sortFieldName);
        this.sortRecordDetailsList(sortFieldName, sortType);

    }

    setAllColumnSortStatusToDefault(activeSortFieldName, sortType, isFirstClick) {
        let allSortIcons = this.template.querySelectorAll('[data-sorticon]');

        if (!!allSortIcons && allSortIcons.length > 0) {
            for (var i = 0; i < allSortIcons.length; i++) {
                let sortIcon = allSortIcons[i];
                if (sortIcon.dataset.id == activeSortFieldName) {
                    if (sortType == 'ASC') {
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

    sortRecordDetailsList(sortFieldName, sortType) {
        this.recList.sort(function (a, b) {

            let getFieldDetailsByName = function (recordDetails, fieldName) {
                let resFieldDetails = null;
                if (!!recordDetails.record && recordDetails.record.length > 0) {
                    for (var k = 0; k < recordDetails.record.length; k++) {
                        let fieldDetails = recordDetails.record[k];
                        if (fieldDetails.fieldName == fieldName) {
                            resFieldDetails = fieldDetails;
                            break;
                        }
                    }
                }

                return resFieldDetails;
            };

            let aFieldDetails = getFieldDetailsByName(a, sortFieldName);
            let bFieldDetails = getFieldDetailsByName(b, sortFieldName);

            let aFieldValue = (!!aFieldDetails.value) ? aFieldDetails.value : '';
            let bFieldValue = (!!bFieldDetails.value) ? bFieldDetails.value : '';

            if (sortType == "ASC") {
                return aFieldValue.localeCompare(bFieldValue);
            }
            else {
                return bFieldValue.localeCompare(aFieldValue);
            }
        });

    }



    viewClickHandler(event) {
        /*
        this.spinner = true;
        this.showTable = false;
        var openChildJson = {};
        openChildJson.recordDetailId = event.currentTarget.dataset.id;
        openChildJson.objName = this.objName;
        openChildJson.recordType = this.recordType;
        openChildJson.isCustomDetailPage = this.isCustomDetailPage;
        openChildJson.isCustomDesignPage = this.isCustomDesignPage;
        openChildJson.customRecordPageCol = this.customRecordPageCol;
        openChildJson.tabsData = this.tabsData;
        openChildJson.isChildRecordPage = this.isChildTable;
        openChildJson.tableLabel = this.tableLabel;

        if (!this.isChildTable) {
            this.showRecordDetail = true;
            this.recordDetailId = event.currentTarget.dataset.id;
            for (var i = 0; i < this.recList.length; i++) {
                if (this.recList[i].id === this.recordDetailId.toString()) {
                    this.customRecordPageCol = this.recList[i].record;
                    break;
                }
            }
            openChildJson.customRecordPageCol = this.customRecordPageCol;
            this.navListHandler.push(openChildJson);
        }
        else {
            var showchilddetailpage = new CustomEvent('showchilddetailpage', {
                detail: openChildJson
            });
            this.dispatchEvent(showchilddetailpage);
        }
        this.spinner = false;


        // this.spinner = true;
        // this.showTable = false;
        // if (!this.isChildTable) {
        //     this.showRecordDetail = true;
        //     this.recordDetailId = event.currentTarget.dataset.id;
        //     for (var i = 0; i < this.recList.length; i++) {
        //         if (this.recList[i].id === this.recordDetailId.toString()) {
        //             this.customRecordPageCol = this.recList[i].record;
        //             break;
        //         }
        //     }
        //     console.log('customRecordPageCol',this.customRecordPageCol);
        // }
        // else {
        //     var showchilddetailpage = new CustomEvent('showchilddetailpage', {
        //         detail: {
        //             recordDetailId: event.currentTarget.dataset.id,
        //             objName: this.objName,
        //             recordType: this.recordType,
        //             isCustomDetailPage: this.isCustomDetailPage,
        //             isCustomDesignPage: this.isCustomDesignPage,
        //             customRecordPageCol: this.customRecordPageCol,
        //             tabsData: this.tabsData,
        //             isChildRecordPage: this.isChildTable,
        //             tableLabel: this.tableLabel
        //         }
        //     });
        //     this.dispatchEvent(showchilddetailpage);
        // }
        // this.spinner = false;
    */
    //this.takeSurvey = true;
    console.log('In view click Handler');
    const rowclick = new CustomEvent('rowclick',{
        detail:{}
    });
    this.dispatchEvent(rowclick);
    }

    takeSurveyHandler(event) {
        this.showTable = false;
        this.takeSurvey = true;
        
        this.recordDetailId = event.currentTarget.dataset.id;
        this.assessmentsId = this.recordDetailId;
        console.log('record',this.recordDetailId);
    }

    backClickHandler(event) {
        this.spinner = true;
        console.log('CustomTable navList', this.navListHandler);
        if (this.navListHandler.length > 1) {
            console.log('in child');
            var backToChildProperties = this.navListHandler.pop();

            this.recordDetailId = this.navListHandler[this.navListHandler.length - 1].recordDetailId;
            this.objName = this.navListHandler[this.navListHandler.length - 1].objName;
            this.recordType = this.navListHandler[this.navListHandler.length - 1].recordType;
            this.isCustomDetailPage = this.navListHandler[this.navListHandler.length - 1].isCustomDetailPage;
            this.isCustomDesignPage = this.navListHandler[this.navListHandler.length - 1].isCustomDesignPage;
            this.customRecordPageCol = this.navListHandler[this.navListHandler.length - 1].customRecordPageCol;
            this.tabsData = this.navListHandler[this.navListHandler.length - 1].tabsData;
            this.isChildTable = this.navListHandler[this.navListHandler.length - 1].isChildRecordPage;
            this.tableLabel = this.navListHandler[this.navListHandler.length - 1].tableLabel;
            console.log('backClickHandler', this.navListHandler);
            var gotoparentTabsetonbackclick = new CustomEvent('getchildnavobjectonbackclick', {
                detail: this.navListHandler
            });
            this.dispatchEvent(gotoparentTabsetonbackclick);
            this.tableLabel = '';
            this.activeTab = backToChildProperties.activeTab;
        }
        else {
            this.takeSurvey = false;
            this.showRecordDetail = false;
            this.showTable = true;
            if (this.objName != 'Rythm__Assessment__c') {
                console.log(this.navListHandler);
                var gotoparentTabsetonbackclick = new CustomEvent('getchildnavobjectonbackclick', {
                    detail: this.navListHandler
                });
                this.dispatchEvent(gotoparentTabsetonbackclick);
                this.tableLabel = this.navListHandler.pop().tableLabel;
            }
            // this.navListHandler = [];
            // this.tableLabel = '';
            //this.activeTab = backToChildProperties.activeTab;
        }
        this.spinner = false;


        // this.spinner = true;
        // console.log('CustomTable navList',this.navListHandler);
        // if (this.navListHandler.length > 0) {
        //     console.log('in child');
        //     var backToChildProperties = this.navListHandler.pop();

        //     this.recordDetailId = backToChildProperties.recordDetailId;
        //     this.objName = backToChildProperties.objName;
        //     this.recordType = backToChildProperties.recordType;
        //     this.isCustomDetailPage = backToChildProperties.isCustomDetailPage;
        //     this.isCustomDesignPage = backToChildProperties.isCustomDesignPage;
        //     this.customRecordPageCol = backToChildProperties.customRecordPageCol;
        //     this.tabsData = backToChildProperties.tabsData;
        //     this.isChildTable = backToChildProperties.isChildRecordPage;
        //     console.log('backClickHandler', backToChildProperties);
        //     var gotoparentTabsetonbackclick = new CustomEvent('getchildnavobjectonbackclick', {
        //         detail: this.navListHandler
        //     });
        //     this.dispatchEvent(gotoparentTabsetonbackclick);
        //     this.tableLabel = '';
        //     this.activeTab = backToChildProperties.activeTab;
        // }
        // else {
        //     //console.log('else');
        //     //console.log(this.recId);
        //     //console.log(this.relName);
        //     //console.log(this.fieldsList);
        //     this.takeSurvey = false;
        //     this.showRecordDetail = false;
        //     this.showTable = true;
        // }
        // this.spinner = false;
    }

    inputChangeHandler(event) {
        let filterDetailsList = this.getAllFilterDetails();

        var newRecList = [];

        if (!!filterDetailsList && filterDetailsList.length > 0
            && !!this.allRecordsList && this.allRecordsList.length > 0) {
            for (var i = 0; i < this.allRecordsList.length; i++) {
                let currentRecord = this.allRecordsList[i];
                //console.log('currentRecord -- ', currentRecord);
                let isRecordMatched = true;
                for (var j = 0; j < filterDetailsList.length; j++) {
                    let filterValue = filterDetailsList[j].filterValue.toUpperCase();
                    let fieldName = filterDetailsList[j].fieldName;

                    //console.log('filterValue -- ', filterValue);
                    //console.log('fieldName -- ', fieldName);

                    //console.log('currentRecord[fieldName] -- ', currentRecord[fieldName]);


                    if (!!currentRecord.record && currentRecord.record.length > 0) {
                        for (var k = 0; k < currentRecord.record.length; k++) {
                            let fieldDetails = currentRecord.record[k];
                            //console.log('fieldDetails==>'+ fieldDetails);
                            if (fieldDetails.fieldName == fieldName) {
                                if (!fieldDetails.value.toUpperCase().includes(filterValue)) {
                                    isRecordMatched = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                //console.log('isRecordMatched -- ', isRecordMatched);

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


    getAllFilterDetails() {
        let filterDetailsList = [];

        let allTextBoxes = this.template.querySelectorAll('[data-filtertextbox]');

        if (!!allTextBoxes && allTextBoxes.length > 0) {
            for (var i = 0; i < allTextBoxes.length; i++) {
                let txtBox = allTextBoxes[i];
                if (txtBox.value != '') {
                    let filterDetail = {};
                    filterDetail.fieldName = txtBox.dataset.id;
                    filterDetail.filterValue = txtBox.value;
                    filterDetailsList.push(filterDetail);
                }
            }
        }

        //console.log('filterDetailsList -- ', filterDetailsList);
        //console.log('allTextBoxes -- ',allTextBoxes);

        return filterDetailsList;
    }

    connectedCallback() {

        this.relatedListRecords = JSON.parse(JSON.stringify(this.objectRecordData));
        this.preparePaginationControlsData();
        let pageSizeDefaultValue = this.pageSizeOptions[0].value;
        let currentPageRecords = this.getPageRecords(this.relatedListRecords, 1, pageSizeDefaultValue);
        this.viewColList = this.colList;
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
        this.accountsId = this.recId;



        console.log('Object Name',this.objName);
        this.opt_showCalendar = (this.objName === 'Task' ? true : false);
        this.opt_list = true;
        this.opt_new = (this.objName === 'Employee__c' ? false : true);
        this.opt_newEmp = (this.objName === 'Employee__c' ? true : false);
        this.opt_rec_csv = (this.objName === 'Rythm__Assessment__c' ? true : false);
        this.opt_rec_pdf = (this.objName === 'Rythm__Assessment__c' ? true : false);
        this.opt_rec_csv = (this.objName === 'Rythm__Assessment__c' ? true : false);
        this.opt_rec_pdf = (this.objName === 'Rythm__Assessment__c' ? true : false);
        console.log('this.objName',this.objName);
        if(this.objName!=undefined && this.objName=='Rythm__Assessment__c')
        {
            
        //     getAssesmentRecords().then(result=>{
        //         console.log('Result>>>>>',result);
        //     for(let i=0;i<result.length;i++)
        //     {
        //        var record = result[i];
        //        var recorddata={}
        //        //console.log('record>>>>>',record);
        //        this.assessmentrecorddata =[];
        //        for(let field in record)
        //        {
        //             var obj ={};
        //             obj.label = field;
        //             obj.value = record[field];

        //             console.log('obj>>>>>>',obj);
        //             this.assessmentrecorddata.push(obj);   
        //        }
        //        recorddata['data'] = this.assessmentrecorddata;
        //        console.log('recorddata',recorddata);
        //        this.recList.push(recorddata);
        //    }
        //         //this.assessmentrecorddata = result;
        //         console.log(' this.recList', this.recList);
        //     }).catch(error=>{
        //         console.log('error',error);
        //     });
        //   console.log('assessmentRecrds',this.assessmentrecorddata);
          


        }
        this.viewColList = this.colList;
        this.showTable = true;
        this.opt_delete = false;
        this.search = {};
        if (!this.recordType) {
            this.recordType = '012000000000000AAA';
        }
        if (this.objName != undefined && this.objName === 'Task') {
            getRelatedTasks({ vendorId: this.recId }).then(result => {
                this.isCustomDetailPage = true;
                this.relatedListRecords = result;
                //console.log('Tasks', JSON.stringify(result));
                this.preparePaginationControlsData();
                //console.log('preparePaginationControlsData');
                let pageSizeDefaultValue = this.pageSizeOptions[0].value;
                //console.log('pageSizeDefaultValue');
                let currentPageRecords = this.getPageRecords(this.relatedListRecords, 1, pageSizeDefaultValue);
                //console.log('currentPageRecords');
                //this.recList = this.assignData(this.relatedListRecords, this.colList);
                this.recList = this.assignData(currentPageRecords, this.viewColList);
                //console.log('recList');
                this.allRecordsList = this.recList;
                //console.log('allRecordsList');
            }).catch(error => {
                this.error = error;
                console.log('Error', this.error);
            })
        }


        if (typeof this.colList != undefined && this.colList != null) {
            this.fieldsList = [];
            for (let i = 0; i < this.colList.length; i++) {
                //console.log(this.colList[i]);
                this.search[this.colList[i]] = '';
                this.fieldsList.push(this.objName + '.' + this.colList[i].fieldName);
            }
            this.prepareColumnsOptions();
        }


    }

    renderedCallback() {
        // console.log('rendered', JSON.stringify(this.tabsData));
        if (this.recList) {
            for (var i = 0; i < this.recList.length; i++) {
                if (this.recList[i].record) {
                    for (var j = 0; j < this.recList[i].record.length; j++) {
                        if (this.recList[i].record[j].isHtml === true) {
                            //console.log(this.recList[i].id + ' : ContainsHtmlMarkUp : '+this.recList[i].record[j].fieldName);
                            if (this.template.querySelectorAll('.' + this.recList[i].id + this.recList[i].record[j].fieldName + 'ContainsHtmlMarkUp').length > 0) {
                                this.template.querySelectorAll('.' + this.recList[i].id + this.recList[i].record[j].fieldName + 'ContainsHtmlMarkUp')[0].innerHTML = this.recList[i].record[j].value;
                            }
                        }
                    }
                }
            }
        }
    }

    // Start: Show/Hide/Shuffle Columns

    //prepares the available columns options and selected columns options for the Show/Hide columns popup
    prepareColumnsOptions() {
        if (!(!!this.colList && this.colList.length > 0)) {
            return;
        }

        let tempColumnsOptions = []
        let tempSelectedColumnOptions = [];

        for (var i = 0; i < this.colList.length; i++) {
            let colDetails = this.colList[i];
            tempColumnsOptions.push({ label: colDetails.label, value: colDetails.fieldName });
            tempSelectedColumnOptions.push(colDetails.fieldName);
        }
        this.columnsOptions = tempColumnsOptions;
        this.selectedColumnOptions = tempSelectedColumnOptions;
    }

    selectedColumnsList = null;
    handleColumnChange(event) {
        // Get the list of the "value" attribute on all the selected options
        this.selectedColumnsList = event.detail.value;
        //alert(`Options selected: ${this.selectedColumnsList}`);
    }

    openShowHideColumnsModal() {

        this.isShowHideColumnsModalOpen = true;
    }
    closeShowHideColumnsModal() {
        this.isShowHideColumnsModalOpen = false;
    }

    openShuffleColumnsModal() {
        this.isShuffleColumnsModalOpen = true;
    }
    closeShuffleColumnsModal() {
        this.isShuffleColumnsModalOpen = false;
    }
    showModalBox() {
        this.isShowModal = true;
    }
    // OpenNewSupplierAssModal() {
    //     alert('hi');
    //     this.selectedItemId = event.target.dataset.id;
    //     this.createNewsupplierAss = true;
    // }
    // OpenNewSupplierAssModal() {
    //     this.createNewsupplierAss = false;
    // }

    saveColumnsDisplaySettings() {
        this.applyShowHideColumns();
        this.selectedColumnOptions = this.selectedColumnsList;
        this.isShowHideColumnsModalOpen = false;
        this.isShuffleColumnsModalOpen = false;

    }

    applyShowHideColumns() {
        //console.log('applyShowHideColumns started');
        this.clearAllFilterTextboxes();
        this.resetAllColumnSortStatusToDefault();

        if (!(!!this.selectedColumnsList && this.selectedColumnsList.length > 0)) {
            return;
        }

        let columnDetailsList = [];

        for (var i = 0; i < this.selectedColumnsList.length; i++) {
            let selectedColumn = this.selectedColumnsList[i];
            //console.log('selectedColumn -- ', selectedColumn);
            for (var j = 0; j < this.colList.length; j++) {
                let colDetails = this.colList[j];
                if (colDetails.fieldName == selectedColumn) {
                    columnDetailsList.push(colDetails);
                    break;
                }
            }
        }

        //console.log('columnsList -- ', columnDetailsList);

        this.viewColList = columnDetailsList;
        let currentPageRecords = this.getPageRecords(this.relatedListRecords, this.selectedPageNumber, this.selectedPageSize);
        this.recList = this.assignData(currentPageRecords, this.viewColList);
        this.allRecordsList = this.recList;
    }

    csvClickHandler(event) {
        var x = event.currentTarget.dataset.id;
        getSupplierAssessmentList({ assessmentId: x }).then(result => {
            var assessmentTemplateId = result[0].Assessment_Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: x }).then(result => {
                    result.forEach(qres => {
                        this.savedResponseMap.set(qres.Questionnaire__c, qres.Response__c);
                    });
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                    //console.log(this.finalSection);
                    //console.log('Download clicked');
                    var str = 'Question,Answer\n';

                    for (const key of this.finalSection.keys()) {
                        str += 'Section: "' + key + '",""\n';
                        for (var i = 0; i < this.finalSection.get(key).length; i++) {
                            str += '"' + this.finalSection.get(key)[i].question + '","' + this.finalSection.get(key)[i].value + '"\n';
                        }
                    }
                    str = str.replaceAll('undefined', '').replaceAll('null', '');
                    var blob = new Blob([str], { type: 'text/plain' });
                    var url = window.URL.createObjectURL(blob);
                    var atag = document.createElement('a');
                    atag.setAttribute('href', url);
                    atag.setAttribute('download', result[0].Assessment__r.Name + '.csv');
                    atag.click();
                }).catch(error => {
                    //console.log('Error' + error);
                })

            }).catch(error => {
                //console.log('Error' + error);
            })
        }).catch(error => {
            //console.log('Error' + error);
        })
    }
    constructWrapper(questionResp, savedResp) {
        var questionMap = new Map();
        questionResp.forEach(qu => {
            var quTemp = {};
            quTemp.questionId = qu.questionId;
            quTemp.question = qu.Question;
            if (questionMap.has(qu.sectionName)) {
                questionMap.get(qu.sectionName).push(quTemp);
            } else {
                var quesList = [];
                quesList.push(quTemp);
                questionMap.set(qu.sectionName, quesList);
            }
            quTemp.value = savedResp.get(quTemp.questionId);
        });
        return questionMap;
    }
    handleExportPDF(event) {
        var tableHtml = '<table><thead><tr>';
        for (var i = 0; i < this.viewColList.length; i++) {
            tableHtml += '<th>' + this.viewColList[i].label + '</th>';
        }
        tableHtml += '</tr></thead><tbody>';
        for (var i = 0; i < this.recList.length; i++) {
            tableHtml += '<tr>';
            for (var j = 0; j < this.recList[i].record.length; j++) {
                if (j == 0) {
                    if (i % 2 === 0)
                        tableHtml += '<td class="oddLeftTd">' + this.recList[i].record[j].value + '</td>';
                    else
                        tableHtml += '<td class="evenLeftTd">' + this.recList[i].record[j].value + '</td>';
                }
                else {
                    tableHtml += '<td>' + this.recList[i].record[j].value + '</td>';
                }
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        //console.log(tableHtml);
        var win = window.open('', '', 'width=' + (window.innerWidth * 0.9) + ',height=' + (window.innerHeight * 0.9) + ',location=no, top=' + (window.innerHeight * 0.1) + ', left=' + (window.innerWidth * 0.1));
        var style = '<style>@media print { * {-webkit-print-color-adjust:exact;}} @page{ margin: 0px;} *{margin: 0px; padding: 0px; height: 0px; font-family: Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif !important;} .headerDiv{width: 100%; height: 56px; padding: 20px; background-color: #03314d;} .headerText{font-size: 40px; color: white; font-weight: bold} .tableDiv{padding: 20px;} table {border-collapse:collapse; font-size: 14px;} table td, th{ padding: 4px;} table tr:nth-child(odd) td {background-color: #F9F9F9;} .oddLeftTd{background-color: #E9E9E9 !important;} .evenLeftTd{background-color: #F1F1F1 !important;} table th{ border: 1px solid #E9E9E9; background-color:#B5BEC58F}</style>';
        win.document.getElementsByTagName('head')[0].innerHTML += style;
        win.document.getElementsByTagName('body')[0].innerHTML += '<div class="headerDiv slds-p-around_small"><span class="headerText">Rhythm</span></div><br/>';
        tableHtml = tableHtml.replaceAll('undefined', '').replaceAll('null', '');
        win.document.getElementsByTagName('body')[0].innerHTML += '<div class="tableDiv slds-p-around_medium">' + tableHtml + '</div>';
        win.print();
        win.close();
        // https://power-drive-9933-dev-ed--c.scratch.vf.force.com/apex/customTablePdf?core.apexpages.request.devconsole=1
        // let win = window.open('https://power-drive-9933-dev-ed--c.scratch.vf.force.com/apex/customTablePdf?core.apexpages.request.devconsole=1', 'loginWindow', 'width=' + (window.innerWidth / 2) + ',height=' + (window.innerHeight / 2) + ',location=no, top=' + (window.innerHeight / 4) + ', left=' + (window.innerWidth / 4));
        // win.focus();
    }
    pdfClickHandler(event) {
        var x = event.currentTarget.dataset.id;
        getSupplierAssessmentList({ assessmentId: x }).then(result => {
            var assessmentTemplateId = result[0].Assessment_Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: x }).then(result => {
                    result.forEach(qres => {
                        this.savedResponseMap.set(qres.Questionnaire__c, qres.Response__c);
                    });
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                    //console.log(this.finalSection);
                    var tableHtml = '<table><thead><tr>';
                    tableHtml += '<th>Section</th><th>Question</th><th>Response</th>';
                    tableHtml += '</tr></thead><tbody>';
                    //console.log(this.finalSection);
                    var count = 0;
                    for (const key of this.finalSection.keys()) {
                        // tableHtml += '<tr><td>Section: ' + key + '</td><td></td></tr>';
                        count += 1;
                        if (count % 2 === 0) {
                            tableHtml += '<tr><td class="evenLeftTd" rowspan=' + this.finalSection.get(key).length + '>' + key + '</td>';
                        }
                        else {
                            tableHtml += '<tr><td class="oddLeftTd" rowspan=' + this.finalSection.get(key).length + '>' + key + '</td>';
                        }
                        // tableHtml += '<tr><td rowspan='+this.finalSection.get(key).length+'>' + key + '</td>';
                        for (var i = 0; i < this.finalSection.get(key).length; i++) {
                            tableHtml += '<td>' + this.finalSection.get(key)[i].question + '</td><td>' + this.finalSection.get(key)[i].value + '</td></tr>';
                        }
                    }
                    tableHtml += '</tbody></table>';
                    //console.log(tableHtml);
                    var win = window.open('', '', 'width=' + (window.innerWidth * 0.9) + ',height=' + (window.innerHeight * 0.9) + ',location=no, top=' + (window.innerHeight * 0.1) + ', left=' + (window.innerWidth * 0.1));
                    var style = '<style>@media print { * {-webkit-print-color-adjust:exact;}}} @page{ margin: 0px;} *{margin: 0px; padding: 0px; height: 0px; font-family: Source Sans Pro, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif !important;} .headerDiv{width: 100%; height: 56px; padding: 20px; background-color: #03314d;} .headerText{font-size: 40px; color: white; font-weight: bold} .tableDiv{padding: 20px;} table {border-collapse:collapse; font-size: 14px;} table td, th{ padding: 4px;} table tr:nth-child(odd) td {background-color: #F9F9F9;} .oddLeftTd{background-color: #E9E9E9 !important;} .evenLeftTd{background-color: #F1F1F1 !important;} table th{ border: 1px solid #E9E9E9; background-color:#B5BEC58F} table { page-break-inside:auto; } tr { page-break-inside:avoid; page-break-after:auto; }</style>';
                    win.document.getElementsByTagName('head')[0].innerHTML += style;
                    win.document.getElementsByTagName('body')[0].innerHTML += '<div class="headerDiv slds-p-around_small"><span class="headerText">Rhythm</span></div><br/>';
                    tableHtml = tableHtml.replaceAll('undefined', '').replaceAll('null', '');
                    win.document.getElementsByTagName('body')[0].innerHTML += '<div class="tableDiv slds-p-around_medium">' + tableHtml + '</div>';
                    win.print();
                    win.close();
                }).catch(error => {
                    console.log('Error' + error);
                })

            }).catch(error => {
                console.log('Error' + error);
            })
        }).catch(error => {
            console.log('Error' + error);
        })
    }


    checkboxChangeHandler(event) {
        //console.log(event.target.checked);
        var dataId = event.currentTarget.dataset.id;
        var value = event.target.checked;
        var cbList = this.template.querySelectorAll('.recCheckbox');
        //console.log('piggy',dataId);
        if (dataId === 'allCheckboxes') {
            //console.log(this.rowDataIdList);
            for (var i = 0; i < cbList.length; i++) {
                // var ele = this.template.querySelectorAll('[data-id="' + cbList[i].dataset.id + '"]')[0];
                this.template.querySelectorAll('.recCheckbox')[i].checked = value;
                //console.log(ele);
                if (value === true)
                    this.rowDataIdList.push(this.template.querySelectorAll('.recCheckbox')[i].dataset.id.toString());
                else
                    this.rowDataIdList.splice(this.rowDataIdList.indexOf(dataId), 1);
            }
            //console.log(JSON.stringify(this.rowDataIdList));
        }
        else {
            if (value === true) {
                //console.log(this.rowDataIdList);
                this.rowDataIdList.push(dataId);
                if (this.rowDataIdList.length === cbList.length)
                    this.template.querySelectorAll('[data-id="allCheckboxes"]')[0].checked = value;
                //console.log(this.rowDataIdList);
            }
            else if (value === false) {
                //console.log(this.rowDataIdList);
                if (this.rowDataIdList.length === cbList.length)
                    this.template.querySelectorAll('[data-id="allCheckboxes"]')[0].checked = value;
                this.rowDataIdList.splice(this.rowDataIdList.indexOf(dataId), 1);
                //console.log(this.rowDataIdList);
            }
            //console.log(JSON.stringify(this.rowDataIdList));
        }
        if (this.rowDataIdList.length > 0)
            this.opt_delete = true;
        else
            this.opt_delete = false;
    }

    deleteHandler(event) {
        deleteRecords({ recIdList: this.rowDataIdList }).then(result => {
            if (result === 'Success') {
                var reclist_dup = this.recList;
                console.log('Deleted Successfully');
                for (var j = 0; j < this.rowDataIdList.length; j++) {
                    //console.log(j);
                    for (var i = 0; i < this.recList.length; i++) {
                        //console.log(i);
                        if (reclist_dup[i].id.toString() === this.rowDataIdList[j].toString()) {
                            //console.log(reclist_dup[i].id.toString());
                            reclist_dup.splice(i, 1);
                            break;
                        }
                    }
                }
                this.recList = reclist_dup;
            }
            else {
                console.log('Deleted Unsuccessful');
            }
        }).catch(error => {
            console.log('Deleted Unsuccessful');
            console.log('deleteRecords Error', JSON.stringify(error));
        });
    }


    assignChildProperties(event) {
        var backToChildProperties = {};
        backToChildProperties.recordDetailId = this.recordDetailId;
        backToChildProperties.objName = this.objName;
        backToChildProperties.recordType = this.recordType;
        backToChildProperties.isCustomDetailPage = this.isCustomDetailPage;
        backToChildProperties.isCustomDesignPage = this.isCustomDesignPage;
        backToChildProperties.customRecordPageCol = this.customRecordPageCol;
        backToChildProperties.tabsData = this.tabsData;
        backToChildProperties.activeTab = event.detail.activeTab;
        backToChildProperties.tableLabel = this.tableLabel;
        backToChildProperties.level = this.navListHandler.length;
        //backToChildProperties.navList = backToChildProperties.navList.push(this.objName);
        // this.navListHandler.push(backToChildProperties);
        // console.log(this.navListHandler);


        this.recordDetailId = event.detail.recordDetailId;
        this.objName = event.detail.objName;
        this.recordType = event.detail.recordType;
        this.isCustomDetailPage = event.detail.isCustomDetailPage;
        this.isCustomDesignPage = event.detail.isCustomDesignPage;
        this.customRecordPageCol = event.detail.customRecordPageCol;
        this.tabsData = event.detail.tabsData;
        this.tableLabel = event.detail.tableLabel;
        this.activeTab = '';
        // console.log('this.activeTab',this.activeTab);
        this.navListHandler.push(event.detail);
        console.log('gotfromchild', this.navListHandler);
        var gotoParentTabset = new CustomEvent("getchildnavobject", {
            detail: this.navListHandler
        });
        this.dispatchEvent(gotoParentTabset);


        //console.log('Parent');
        // var backToChildProperties = {};
        // backToChildProperties.recordDetailId = this.recordDetailId;
        // backToChildProperties.objName = this.objName;
        // backToChildProperties.recordType = this.recordType;
        // backToChildProperties.isCustom = this.isCustom;
        // backToChildProperties.isCustomDesignPage = this.isCustomDesignPage;
        // backToChildProperties.customRecordPageCol = this.customRecordPageCol;
        // backToChildProperties.tabsData = this.tabsData;
        // backToChildProperties.activeTab = event.detail.activeTab;
        // console.log(this.tableLabel);
        // backToChildProperties.tableLabel = this.tableLabel;
        // backToChildProperties.level = this.navListHandler.length;
        // //backToChildProperties.navList = backToChildProperties.navList.push(this.objName);
        // this.navListHandler.push(backToChildProperties);


        // this.recordDetailId = event.detail.recordDetailId;
        // this.objName = event.detail.objName;
        // this.recordType = event.detail.recordType;
        // this.isCustom = event.detail.isCustom;
        // this.isCustomDesignPage = event.detail.isCustomDesignPage;
        // this.customRecordPageCol = event.detail.customRecordPageCol;
        // this.tabsData = event.detail.tabsData;
        // this.tableLabel = event.detail.tableLabel;
        // this.activeTab = '';
        // console.log('gotfromchild', backToChildProperties);
        // // console.log('this.activeTab',this.activeTab);
        // this.navListHandler.push(event.detail);
        // var gotoParentTabset = new CustomEvent("getchildnavobject", {
        //     detail: this.navListHandler
        // });
        // this.dispatchEvent(gotoParentTabset);
        // this.navListHandler.pop();
    }
}