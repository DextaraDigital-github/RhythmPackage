import { LightningElement, api, track, wire } from 'lwc';
import updateSectionList from '@salesforce/apex/AssessmentTemplateController.updateRecords';
import updateQuestionList from '@salesforce/apex/AssessmentTemplateController.updateQustnRecords';//To fetch the updated sequence of sections
import getTemplateSections from '@salesforce/apex/AssessmentTemplateController.getTemplateSections';
import getQuestionsList from '@salesforce/apex/AssessmentTemplateController.getQuestionsLists';
import getSectionRecsCount from '@salesforce/apex/AssessmentTemplateController.getRecordsCount';
import deleteRecords from '@salesforce/apex/AssessmentTemplateController.deleteRecords';
import getTemplateDetails from '@salesforce/apex/AssessmentTemplateController.getTemplateDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
const actions = [
    { label: 'View', name: 'view' },
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

    sectionColumns = [
        {
            type: 'text', sortable: true,
            fieldName: 'Name',
            label: 'Section Name',
        },
        {
            type: 'number', sortable: true,
            fieldName: 'Rhythm__No_of_Questions__c',
            label: 'No of Questions',
            initialWidth: 170
        },
        {
            type: 'number', sortable: true,
            fieldName: 'Rhythm__Section_Sequence_Number__c',
            label: 'Sequence Number',
            initialWidth: 170,
        },
        {
            type: "action", typeAttributes: { rowActions: actions }
        }
    ];
    columns = this.sectionColumns;
    @track expandedRows = [];
    @track sectionList;
    @track sectionListData;
    @track questionsList;
    @track showModal = { createModal: false, editModal: false, deleteModal: false };

    @api fieldListforCreation = {
        "Rhythm__Section__c": [
            { label: 'Section Name', fieldName: 'Name', required: true, class: 'slds-col slds-large-size_1-of-1 slds-medium-size_1-of-1 slds-size_1-of-1 slds-p-left_medium slds-p-right_medium' }
        ]
    };
    @track isReorderModalOpen = false;

    //Start: Reorder Columns
    reorderOptions = [];
    selectedReorderOptions = [];
    selectedReorderValues = [];
    reorderType = '';
    reorderHeaderName = '';
    //End: Reorder Columns

    //Get Template Status Details
    @wire(getTemplateDetails, { templateId: '$recordId' })
    getRecs(result) {
        this.disableButtons = result.data;
        if (this.disableButtons === false) {
            this.columns = [...this.sectionColumns].filter(col => col.type !== 'action');
        }
    }

    // Open Create Modal
    handlenew() {
        this.showModal.createModal = true;
    }

    //Save and New Functionality for New Record
    reOpenCreateModal() {
        // this.showModal.createModal = false;
        // this.showModal.createModal = true;
        setTimeout(() => {
            this.handlenew();
        }, 500);
    }

    //Save the record and Open new reocrd creation
    handleSaveNew() {
        this.handlenew();
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
    }

    //Record View and Eit actions
    handleRowActions(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: this.objectName,
                        actionName: 'edit'
                    }
                });
                break;
            case 'delete':
                this.selectedRows = [];
                this.selectedRows.push(row.Id);
                this.handleDelete(event);
                break;
            default:
        }
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
        if (selRows === null || typeof selRows === 'undefined' || (selRows !== null && selRows.length === 0)) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please Select a Section',
                    variant: 'error'
                })
            );
            return;
        }
        else if (selRows.length > 1) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please Select Only one Section',
                    variant: 'error'
                })
            );
            return;
        }
        else if (selRows.length === 1) {
            if(this.sectionListData && typeof this.sectionListData !== 'undefined')
             this.sectionListData.forEach(section => {
                if (section.Id === selRows[0].Id) {
                    if (section._children !== null && section._children.length > 0) {
                        sectionQuestions = section._children;
                        if(sectionQuestions && sectionQuestions !== 'undefined'){
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
                                message: 'Please Select the Section which have atleast 1 Question',
                                variant: 'error'
                            })
                        );
                        return;
                    }
                }
            });
        }
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
        updateQuestionList({ qstnList: questionlist }).then(result => {
            console.log('sucessfully created Response result===>' + result);
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
            console.log('Error' + error);
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
        updateSectionList({ secList: sectionList }).then(result => {
            console.log('sucessfully created Response result===>' + result);
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
            console.log('Error' + error);
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
        this.deletePopupMessage = 'Are you sure you want to delete this Questions?'
         /* var selRows = this.template.querySelector("lightning-tree-grid").getSelectedRows();
         console.log('Selected rows ---' + JSON.parse(JSON.stringify(this.selectedRows)));
         var selIds;
         this.sectionListData && this.sectionListData.forEach(rec => {
             selIds = selRows.find(row => row.id === rec.Id);
         });
         if (selIds === null || selIds === undefined(selIds !== null && selIds.length > 0)) {
             this.deletePopupMessage = 'Are you sure you want to delete this Questions?';
         }
         selRows && selRows.forEach(row => {
             this.selectedRows.push(row.Id);
         });*/
        console.log(this.selectedRows);
        if (this.selectedRows.length !== 0) {
            if(this.sectionListData && typeof this.sectionListData !== 'undefined'){
                this.sectionListData.forEach(rec => {
                    if (this.selectedRows[0] === rec.Id) {
                        this.deletePopupMessage = 'Are you sure you want to delete this Section and Questions?';
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
        console.log(this.selectedRows);
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
                console.log('Deleted Unsuccessful');
            }
        }).catch(error => {
            console.log('Deleted Unsuccessful');
            console.log('deleteRecords Error', JSON.stringify(error));
        });
    }
    //Delete Functionality Ends

    // To Get Refresh the Records Data
    handleRefresh() {
        this.tempRecsLimit = this.recsLimit;
        getQuestionsList({ templateId: this.recordId }).then(data => {
            this.questionsList = JSON.parse(JSON.stringify(data));
            getSectionRecsCount({ templateId: this.recordId, objName: this.tableLabel }).then(secData => {
                this.totalRecsCount = secData;
                this.handleSectionsData(JSON.parse(JSON.stringify(secData)));
            }).catch(error => {
                console.log('Error' + error);
            });
        }).catch(error => {
            console.log('Error' + error);
        });
    }

    connectedCallback() {
        this.handleRefresh();
    }

    //getting section records 
    handleSectionsData() {
        getTemplateSections({ templateId: this.recordId }).then(result => {
            this.sectionList = JSON.parse(JSON.stringify(result));
            this.prepareSectionsQuestionaire();
        }).catch(error => {
            console.log('Error' + error);
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
            if(this.questionsList && typeof this.questionsList !== 'undefined'){
                this.questionsList.forEach(question => {
                    if (section.Id.toString() === question.Rhythm__Section__c.toString()) {
                        let questionJson = {};
                        questionJson.Id = question.Id;
                        questionJson.Name = question.Rhythm__Question__c;
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
        console.log('this.sectionListData -- ', this.sectionListData);
    }

    //record form onsuccess
    handleSuccess() {
        this.handleSectionsData();
    }
}