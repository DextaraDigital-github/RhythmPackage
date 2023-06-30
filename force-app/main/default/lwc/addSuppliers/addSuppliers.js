import { LightningElement, wire, track, api } from 'lwc';
import getAllSuppliers from '@salesforce/apex/AssessmentController.getAllSuppliers';
import getExistingSuppliers from '@salesforce/apex/AssessmentController.getExistingSuppliersWithSearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AddSuppliers extends LightningElement {
    renderedAllSuppliers = false;
    @track supplierData;
    @api selectedSupplierData = [];
    @track currentValues;
    @track values = [];
    availableSuppliersCount = 'Available Suppliers(0)';
    selectedSuppliersCount = 'Selected Suppliers(0)';
    searchKey = '';
    exSearchKey = '';
    @track latestSuppliers;
    existingSuppList = [];
    @api est = [];
    hasRendered = true;
    @api recordId;
    newAccounts = [];
    delAccounts = [];
    hasRendered = true;

    connectedCallback() {
        console.log('childConnectedCallBack------>',this.recordId);
        if(this.recordId != undefined){
            this.fetchExistingSuppliers();
        }
    }

    fetchExistingSuppliers(){
        getExistingSuppliers({ assessmentId:this.recordId, searchKey: '' })
            .then(result => {
                console.log('RESULT---->',JSON.stringify(result));
                if(result){
                    let tempList = [];
                    for (let rec of result) {
                        tempList.push(rec.Rhythm__Account__c);
                    }
                    if(tempList.length > 0) {
                        this.existingSuppList = JSON.parse(JSON.stringify(tempList));
                    }
                    console.log('addSuppExData---->',JSON.stringify(this.existingSuppList));
                }
            })
            .catch(error => {
                console.log('ERROR---->',error);
                this.showNotification('Error', error.body.message, 'error');
            });
    }

    // Updates existingData with the already selected Accounts Data
    get existingData() {
        let suppList = '';
        if (this.existingSuppList !== undefined && this.existingSuppList.length > 0) {
            suppList = JSON.stringify(this.existingSuppList);
        } 
        return suppList;
    }

    
    // Fetches all the available accounts from Apex
    @wire(getAllSuppliers, { existingData: '$existingData', searchKey: '$searchKey', exSearchKey: '$exSearchKey' })
    getAllSuppliers_wiredData(result) {
        this.latestSuppliers = result;
        if (result.data) {
            let tempList = [];
            for (let supRec of result.data) {
                tempList.push({
                    "label": supRec.Name,
                    "value": supRec.Id
                });
            }
            this.values = JSON.parse(JSON.stringify(this.existingSuppList));
            if (tempList.length > 0) {
                this.supplierData = JSON.parse(JSON.stringify(tempList));
                if (!this.renderedAllSuppliers) {
                    this.countRecords();
                    this.renderedAllSuppliers = true;
                }
            }
        }
        else if (result.error) {
            this.showNotification('Error', result.error.body.message, 'error');
        }
    }

    handleChange(event) {
        try {
            console.log('handleChange - START : ', this.existingSuppList);
            let selectedValues = event.detail.value;
                if(this.supplierData && this.supplierData.length > 0){
                    this.supplierData.forEach( suppData => {
                        if (selectedValues.indexOf(suppData.value) !== -1 && this.existingSuppList.indexOf(suppData.value) === -1) {
                            this.newAccounts.push(suppData.value);
                            this.existingSuppList.push(suppData.value);
                            console.log('here 1');
                            if (this.delAccounts.indexOf(suppData.value) !== -1) {
                                this.delAccounts.splice(this.delAccounts.indexOf(suppData.value), 1);
                            }
                             console.log('here 2');
                        }
                        else if (selectedValues.indexOf(suppData.value) === -1 && this.existingSuppList.indexOf(suppData.value) !== -1) {
                            this.delAccounts.push(suppData.value);
                            this.existingSuppList.splice(this.existingSuppList.indexOf(suppData.value), 1);
                            if (this.newAccounts.indexOf(suppData.value) !== -1) {
                                this.newAccounts.splice(this.newAccounts.indexOf(suppData.value), 1);
                            }
                        }
                    })
            }
            const custEvent = new CustomEvent('updatedsupliers', {
                detail: { newSuppliers: this.newAccounts, existingSupps: this.existingSuppList, delList: this.delAccounts }
            })
            this.dispatchEvent(custEvent);
            this.countRecords();
            console.log('handleChange - END : ', this.existingSuppList);
        } catch (error) {
            console.log('handleChange error : ', error);
        }
    }

    // Updates the search value to search for account among the available accounts
    handleSearch(event) {
        try {
            this.searchKey = event.target.value;
        } catch (error) {
            console.log('handleSearch error : ', error);
        }
    }

    // Updates the search value to search for account among the existing/already assigned accounts
    handleExSearch(event) {
        try {
            this.exSearchKey = event.target.value;
        } catch (error) {
            console.log('handleExSearch error : ', error);
        }
    }

    // Displays status/error as a toast message
    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    countRecords() {
        var selectedAccounts = 0;
        if (typeof this.supplierData !== 'undefined' && typeof this.existingSuppList !== 'undefined') {
            this.supplierData.forEach(accountId => {
                if (this.existingSuppList.indexOf(accountId.value) !== -1) {
                    selectedAccounts++;
                }
            });
            this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + selectedAccounts + ')';
            this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - selectedAccounts) + ')';
        }
        console.log('selectedSuppliersCount : ' + selectedAccounts + ', availableSuppliersCount : ' + (this.supplierData.length - selectedAccounts));
    }
}