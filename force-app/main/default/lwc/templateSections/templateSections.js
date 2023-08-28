import { LightningElement, api, track, wire } from 'lwc';
import updateSectionList from '@salesforce/apex/AssessmentTemplateController.updateRecords';
import updateQuestionList from '@salesforce/apex/AssessmentTemplateController.updateQustnRecords';//To fetch the updated sequence of sections
import getTemplateSections from '@salesforce/apex/AssessmentTemplateController.getTemplateSections';
import getQuestionsList from '@salesforce/apex/AssessmentTemplateController.getQuestionsLists';
import getSectionRecsCount from '@salesforce/apex/AssessmentTemplateController.getRecordsCount';
import deleteRecords from '@salesforce/apex/AssessmentTemplateController.deleteRecords';
import getTemplateDetail from '@salesforce/apex/AssessmentTemplateController.getTemplateDetail';
import getTemplateDetails from '@salesforce/apex/AssessmentTemplateController.getTemplateDetails';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import CUS_STYLES from '@salesforce/resourceUrl/rtmcpcsldscustomstyles';
import { loadStyle } from 'lightning/platformResourceLoader';

const actions = [
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
];

export default class TemplateSections extends NavigationMixin(LightningElement) {
    @track deletePopupMessage = 'Are you sure you want to delete this Questions?';
    @api objLabel = 'Sections';
    @api recsCount = 0;
    @api recordId;
    @api disableButtons;
    @api objectName = 'Rhythm__Section__c';
    @track selectedRows = [];
    @track actionName = '';
    @track viewQuestions = false;

    sectionColumns = [
        {
            type: 'text', sortable: true,
            fieldName: 'Name',
            label: 'Section Name',

            wrapText: true
        },
        {
            type: 'number', sortable: true,
            fieldName: 'Rhythm__No_of_Questions__c',
            label: 'No of Questions',
            initialWidth: 150
        },
        {
            type: 'number', sortable: true,
            fieldName: 'Rhythm__Section_Sequence_Number__c',
            label: 'Sequence Number',
            initialWidth: 150,
        },
        {
            type: "action", typeAttributes: { rowActions: actions }
        }
    ];
    columns = this.sectionColumns;
    @track expandedRows = [];
    @track sectionList;
    @track tempId;
    @track sectionName;
    @track questionId;
    @track tempStatus;
    @track sectionListData;
    @track questionsList;
    @track selectedSectionName;
    @track showModal = { createModal: false, editModal: false, deleteModal: false };

    @api fieldListforCreation = {
        "Rhythm__Section__c": [
            { label: 'Section Name', fieldName: 'Name', required: true, class: 'slds-col slds-large-size_1-of-1 slds-medium-size_1-of-1 slds-size_1-of-1 slds-p-left_medium slds-p-right_medium' }
            //{label: 'Assessment', fieldName: 'Rhythm__Assessment_Template__c', required: false, class: 'slds-col slds-large-size_1-of-1 slds-medium-size_1-of-1 slds-size_1-of-1 slds-p-left_medium slds-p-right_medium'}
        ]
    };
    @track isReorderModalOpen = false;

    //Start: Reorder Columns
    reorderOptions = [];
    selectedReorderOptions = [];
    selectedReorderValues = [];
    reorderType = '';
    reorderHeaderName = '';
    @track wiredRecsData;

    //End: Reorder Columns

    //Get Template Status Details
    @wire(getTemplateDetail, { templateId: '$recordId' })
    getRecs(result) {
        this.wiredRecsData = result;
        this.disableButtons = result.data;
        if (this.disableButtons === false) {
            this.columns = [...this.sectionColumns].filter(col => col.type !== 'action');
        }
    }

    // Open Create Modal
    handleNew() {
        this.showModal.createModal = true;
    }

    //Save and New Functionality for New Record
    reOpenCreateModal() {
        setTimeout(() => {
            this.handleNew();
        }, 500);
    }

    //Save the record and Open new reocrd creation
    handleSaveNew() {
        this.handleNew();
    }

    // Close Create Modal
    closeCreateModal() {
        this.showModal.createModal = false;
        this.handleRefresh();
    }

    // Open Update Modal
    handleUpdate(event) {
        this.showModal.editModal = true;
        this.selectedRecordId = event.detail.recordId;
    }

    // Close Edit Modal
    closeEditModal() {
        this.showModal.editModal = false;
        this.handleRefresh();
    }
    handleCancel(event) {
        if (typeof event.detail !== 'undefined') {
            this.viewQuestions = false;
            this.handleRefresh();
        }
    }
    handlesave(event) {
        if (typeof event.detail !== 'undefined' && event.detail!==null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Reordered Sections Successfully',
                    variant: 'success'
                })
            );
        }

        this.viewQuestions = false;
        this.handleRefresh();
    }
    //Record View and Eit actions
    handleRowActions(event) {
        const actionName = this.actionName;
        const row = this.row;
        this.questionId = row.Id;
        this.sectionName = row.sectionName;
        let bool = false;
        if (typeof row.Rhythm__No_of_Questions__c !== 'undefined') {
            bool = true;
        }
        switch (actionName) {
            case 'view':
                this.viewQuestions = true;
                break;
            case 'edit':
                if (bool) {

                    this.selectedSectionName = row.sectionName;
                    this.selectedRecordId = row.Id;
                    this.showModal.editModal = true;
                }
                else {
                    this.viewQuestions = true;
                }

                break;
            case 'delete':
                this.selectedRows = [];
                this.selectedRows.push(row.Id);
                this.handleDelete(event);
                break;
            default:
        }
        this.handleRefresh();
    }

    //Reorder Functionality Starts

    // Handles the columns which are moved between Available and Selected values in the duallistbox
    handleOrderChange(event) {
        // Get the list of the "value" attribute on all the selected options
        this.selectedReorderValues = event.detail.value;
    }

    saveReorder() {
        if (this.reorderType === 'Section') {
            this.handleSequenceUpdate(this.selectedReorderValues);
        }
        else if (this.reorderType === 'Question') {
            this.handleQuestionSequence(this.selectedReorderValues);
        }
    }

    // Open the modal with section reordering feature
    handleReorderQuestions() {
        this.selectedReorderValues = [];
        this.reorderType = '';
        let tempOptions = [];
        let tempIds = [];
        let sectionQuestions = [];
        this.reorderHeaderName = 'Reorder Questions';
        let selRows = this.template.querySelector("lightning-tree-grid").getSelectedRows();
        let isreturn = false;
        if ((selRows === null || typeof selRows === 'undefined' || (selRows !== null && selRows.length === 0))
            && !isreturn) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please Select a Section',
                    variant: 'error'
                })
            );
            isreturn = true;
        }
        else if (selRows.length > 1 && !isreturn) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Select only one Section to change the Question sequence',
                    variant: 'error'
                })
            );
            isreturn = true;
        }
        else if (selRows.length === 1 && !isreturn) {
            if (this.sectionListData && typeof this.sectionListData !== 'undefined')
                this.sectionListData.forEach(section => {
                    if (section.Id === selRows[0].Id) {
                        if (section._children !== null && section._children.length > 0) {
                            sectionQuestions = section._children;
                            if (sectionQuestions && sectionQuestions !== 'undefined') {
                                sectionQuestions.forEach(question => {
                                    tempOptions.push({ label: question.Name, value: question.Id });
                                    tempIds.push(question.Id);
                                })
                            }
                            this.reorderOptions = tempOptions;
                            this.selectedReorderOptions = tempIds;
                            this.reorderType = 'Question';
                            this.isReorderModalOpen = true;
                        }
                        else {
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Error',
                                    message: 'Select a Section with more than 1 Question',
                                    variant: 'error'
                                })
                            );
                            isreturn = true;
                        }
                    }
                });
        }
        return isreturn;
    }

    // Open the modal with section reordering feature
    handleReorderSections() {
        this.reorderHeaderName = 'Reorder Sections';
        this.reorderType = 'Section';
        this.prepareSectionReorderOptions();
        this.isReorderModalOpen = true;
    }

    // Closes the modal with section reordering feature
    closeReorderSectionModal() {
        this.isReorderModalOpen = false;
        this.selectedReorderValues = [];
        this.reorderType = '';
    }

    //Update Question Sequence
    handleQuestionSequence(questionRecIds) {
        let questionlist = [];
        for (let i = 0; i < questionRecIds.length; i++) {
            let response = { 'sobjectType': 'Rhythm__Question__c' };
            response.Id = questionRecIds[i];
            response.Rhythm__Question_Sequence_Number__c = i + 1;
            questionlist.push(response);
        }
        updateQuestionList({ qstnList: questionlist }).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Reordered Questions Successfully',
                    variant: 'success'
                })
            );
            this.closeReorderSectionModal();
            this.handleRefresh();
        }).catch(error => {
            //console.log(error);
        });
    }

    //Update Section Sequence
    handleSequenceUpdate(sectionRecIds) {
        let sectionList = [];
        for (let i = 0; i < sectionRecIds.length; i++) {
            let response = { 'sobjectType': 'Rhythm__Section__c' };
            response.Id = sectionRecIds[i];
            response.Rhythm__Section_Sequence_Number__c = i + 1;
            sectionList.push(response);
        }
        updateSectionList({ secList: sectionList }).then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Reordered Sections Successfully',
                    variant: 'success'
                })
            );
            this.closeReorderSectionModal();
            this.handleRefresh();
        }).catch(error => {
            //console.log('Error' + error);
        });
    }

    //preparing Section Reorder Options
    prepareSectionReorderOptions() {
        var tempSectionOptions = [];
        var tempSectionIds = [];
        if (!!this.sectionList && this.sectionList.length > 0) {
            this.sectionList.forEach(section => {
                tempSectionOptions.push({ label: section.Name, value: section.Id });
                tempSectionIds.push(section.Id);
            });
            this.reorderOptions = tempSectionOptions;
            this.selectedReorderOptions = tempSectionIds;
        }
    }
    //Reorder Functionality Ends


    //Delete Functionality Starts
    // Close Delete Modal
    closeDeleteModal() {
        this.showModal.deleteModal = false;
    }

    // checks if selected atleast one record to delete
    handleDelete() {
        this.deletePopupMessage = 'Are you sure you want to delete this Questions?';
        if (this.selectedRows.length !== 0) {
            if (this.sectionListData && typeof this.sectionListData !== 'undefined') {
                this.sectionListData.forEach(rec => {
                    if (this.selectedRows[0] === rec.Id ) {
                        if(rec["_children"] != null) {
                        this.deletePopupMessage = 'Are you sure you want to delete the Section and Quetions in it?';
                        }
                        else {
                           this.deletePopupMessage = 'Are you sure you want to delete the Section?';
                        }
                    }
                });
            }
            this.showModal.deleteModal = true;
        }
        else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No Records are selected',
                    message: 'Select Records',
                    variant: 'error'
                })
            );
        }
    }

    // Delete selected Records
    deleteRecordsHandler() {
        deleteRecords({ recIdList: this.selectedRows, delchildobjrecs: true }).then(result => {
            if (result.toString() === 'Success') {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record(s) deleted',
                        variant: 'success'
                    })
                );
                this.showModal.deleteModal = false;
                this.handleRefresh();
            }
            else {
                this.showModal.deleteModal = false;
                this.handleRefresh();
            }
        }).catch(error => {
            //console.log(error);
        });
    }
    //Delete Functionality Ends

    // To Get Refresh the Records Data
    handleRefresh() {
        refreshApex(this.wiredRecsData);
        this.tempRecsLimit = this.recsLimit;
        getQuestionsList({ templateId: this.recordId }).then(data => {
            console.log('data>>>', data);
            let questionData = JSON.parse(JSON.stringify(data));
            if (data.length > 0) {
                if (typeof data[0].Rhythm__Assessment_Template__r !== 'undefined') {
                    this.tempStatus = data[0].Rhythm__Assessment_Template__r.Rhythm__Status__c;
                    this.tempid = data[0].Rhythm__Assessment_Template__r.Id;
                }
            }
            console.log('questionData', questionData);
            let parent = questionData.filter(res => typeof res.Rhythm__Parent_Question__c === 'undefined');
            this.questionsList = parent;
            getSectionRecsCount({ templateId: this.recordId, objName: this.objLabel }).then(secData => {
                this.totalRecsCount = secData;
                this.recsCount = secData;
                this.handleSectionsData(JSON.parse(JSON.stringify(secData)));
            }).catch(error => {
                console.log(error);
            });

        }).catch(error => {
            console.log(error);
        });
    }

    connectedCallback() {
        this.handleRefresh();

        Promise.all([
            loadStyle(this, CUS_STYLES),
        ]).then(() => {
        })
            .catch(error => {
            });
    }

    //getting section records 
    handleSectionsData() {
        getTemplateSections({ templateId: this.recordId }).then(result => {
            this.sectionList = JSON.parse(JSON.stringify(result));
            this.prepareSectionsQuestionaire();
        }).catch(error => {
            //console.log('Error' + error);
        });
    }

    //Mapping Sections and Questions JSON
    prepareSectionsQuestionaire() {
        if (!this.sectionList) {
            return;
        }
        this.sectionListData = [];
        this.sectionList.forEach(section => {
            var tempqueslist = [];
            if (this.questionsList && typeof this.questionsList !== 'undefined') {
                this.questionsList.forEach(question => {
                    if (section.Id.toString() === question.Rhythm__Section__c.toString()) {
                        let questionJson = {};
                        questionJson.Id = question.Id;
                        questionJson.Name = question.Rhythm__Question__c;
                        questionJson.sectionName = section.Name;
                        tempqueslist.push(questionJson);
                    }
                });
            }
            if (tempqueslist && tempqueslist.length > 0) {
                section._children = tempqueslist;
            }
        });
        if (this.sectionList && this.sectionList.length > 0) {
            this.recsCount = this.sectionList.length;
        }
        this.sectionListData = JSON.parse(JSON.stringify(this.sectionList));
        console.log('this.sectionListData', this.sectionListData);
    }

    //record form onsuccess
    handleSuccess() {
        this.handleSectionsData();
    }

    handleGetTemplate(event) {
        this.actionName = event.currentTarget.dataset.name;
        this.handleTemplateDetails();
    }
    handleGetTemplateDetails(event) {
        this.actionName = event.detail.action.name;
        this.row = event.detail.row;
        this.handleTemplateDetails();
    }

    handleTemplateDetails() {
        getTemplateDetails({ templateId: this.recordId }).then(result => {
            this.disableButtons = result;
            console.log('result', result);
            if (this.disableButtons === false) {
                this.columns = [...this.sectionColumns].filter(col => col.type !== 'action');
                if (this.actionName != '') {
                    location.reload();
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Template status is changed to active, further changes cannot be made to it.',
                            variant: 'error'
                        })
                    );
                }
            }
            else if (this.actionName != '') {
                if (this.actionName === 'New') {
                    this.handleNew();
                }
                else if (this.actionName === 'Reorder Section') {
                    this.handleReorderSections();
                }
                else if (this.actionName === 'Reorder Question') {
                    this.handleReorderQuestions();
                }
                else if (this.actionName === 'view' || this.actionName === 'edit' || this.actionName === 'delete') {
                    this.handleRowActions();
                }
            }
        }).catch(error => {
            //console.log('Error' + error);
        });
    }
}