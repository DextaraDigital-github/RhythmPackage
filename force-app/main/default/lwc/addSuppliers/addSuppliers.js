import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllSuppliers from '@salesforce/apex/AssessmentController.getAllSuppliers';
import getExistingSuppliers from '@salesforce/apex/AssessmentController.getExistingSuppliersWithSearch';
import ges from '@salesforce/apex/AssessmentController.getExistingSuppliersWithSearch';
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
    // @track latestExSuppliers;
    existingSuppList = [];
    @api est = [];
    hasRendered = true;
    @api recordId;
    newAccounts = [];
    delAccounts = [];
    @track hasRendered = true;

    


    // Updates existingData with the already selected Accounts Data
    get existingData() {
        if (this.existingSuppList != undefined && this.existingSuppList.length > 0) {
            console.log('get existingData() : ', JSON.stringify(this.existingSuppList));
            return JSON.stringify(this.existingSuppList);
        } else {
            return '';
        }
    }


    renderedCallback(){
        console.log('InRenderedcallback');
        if (hasRendered) {
            this.fetchExistingSuppliers();
            hasRendered = false;
        }
    }

    fetchExistingSuppliers(){
        ges({ assessmentId:this.recordId, searchKey: '' })
            .then(result => {
                console.log('imperativeexistin----->',JSON.stringify(result));
            })
            .catch(error => {
            });
    }

    // Fetches all the existing/assigned accounts from Apex
    @wire(getExistingSuppliers, { assessmentId: '$recordId', searchKey: '' })
    getExistingSuppliers_wiredData(result) {
        // this.latestExSuppliers = result;
        if (result.data) {
            console.log('existingSuppliers data : ', JSON.stringify(result.data));
            let tempList = [];
            for (let rec of result.data) {
                tempList.push(rec.Rhythm__Account__c);
            }
            if (tempList.length > 0) {
                // this.existingSuppList = tempList;
                // if (!this.renderedExistingSuppliers) {
                //     this.est = JSON.parse(JSON.stringify(this.existingSuppList));
                //     this.renderedExistingSuppliers = true;
                // }
                // this.values = JSON.parse(JSON.stringify(this.existingSuppList));
                this.values = this.existingSuppList = JSON.parse(JSON.stringify(tempList));
                this.countRecords();
                //this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + this.existingSuppList.length + ')';
            }
        } else if (result.error) {
            this.showNotification('Error', result.error.body.message, 'error');
            console.log('existingSuppliers error : ', result.error);
        }
    }

    // Fetches all the available accounts from Apex
    @wire(getAllSuppliers, { existingData: '$existingData', searchKey: '$searchKey', exSearchKey: '$exSearchKey' })
    getAllSuppliers_wiredData(result) {
        this.latestSuppliers = result;
        if (result.data) {
            console.log('getAllSuppliers data : ', JSON.stringify(result.data));
            let tempList = [];
            // let retData = JSON.parse(JSON.stringify(result.data));
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
                console.log('this.supplierData : ' + JSON.stringify(this.supplierData) + ', this.existingSuppList : ' + this.existingSuppList);
                // this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - this.existingSuppList.length) + ')';
            }
            // if (typeof this.values != 'undefined')
            //     this.values = JSON.parse(JSON.stringify(this.values));
            // if (typeof this.supplierData != 'undefined')
            //     this.supplierData = JSON.parse(JSON.stringify(this.supplierData));
            // for (let rec of this.est) {
            //     if (this.values.indexOf(rec) === -1) {
            //         this.delList.push(rec);
            //     }
            // }
            // const custEvent = new CustomEvent('updatedsupliers', {
            //     detail: { newSuppliers: this.values, existingSupps: this.est, delList: this.delList }
            // })
            // this.dispatchEvent(custEvent);
        }
        else if (result.error) {
            this.showNotification('Error', result.error.body.message, 'error');
            console.log('getAllSuppliers error : ', result.error);
        }
    }

    handleChange(event) {
        try {
            console.log('handleChange - START : ', this.existingSuppList);
            let selectedValues = event.detail.value;
            // newAccounts = [];
            // delAccounts = [];
            for (var i = 0; i < this.supplierData.length; i++) {
                if (selectedValues.indexOf(this.supplierData[i].value) != -1 && this.existingSuppList.indexOf(this.supplierData[i].value) === -1) {
                    this.newAccounts.push(this.supplierData[i].value);
                    this.existingSuppList.push(this.supplierData[i].value);
                    if (this.delAccounts.indexOf(this.supplierData[i].value) != -1) {
                        this.delAccounts.splice(this.delAccounts.indexOf(this.supplierData[i].value), 1);
                    }
                }
                else if (selectedValues.indexOf(this.supplierData[i].value) === -1 && this.existingSuppList.indexOf(this.supplierData[i].value) != -1) {
                    this.delAccounts.push(this.supplierData[i].value);
                    this.existingSuppList.splice(this.existingSuppList.indexOf(this.supplierData[i].value), 1);
                    if (this.newAccounts.indexOf(this.supplierData[i].value) != -1) {
                        this.newAccounts.splice(this.newAccounts.indexOf(this.supplierData[i].value), 1);
                    }
                }
            }
            const custEvent = new CustomEvent('updatedsupliers', {
                detail: { newSuppliers: this.newAccounts, existingSupps: this.existingSuppList, delList: this.delAccounts }
            })
            this.dispatchEvent(custEvent);
            this.countRecords();
            console.log('handleChange - END : ', this.existingSuppList);







            //     this.delList = [];
            // this.currentValues = event.detail.value;
            // if (typeof this.est != 'undefined' && this.est.length > 0) {
            //     for (let rec of this.est) {
            //         if (this.values.indexOf(rec) === -1) {
            //             this.delList.push(rec);
            //         }
            //     }
            // }
            // this.values = event.target.value;
            // let selectedSupp = this.values.length > 0 ? this.values.length : 0;
            // this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - selectedSupp) + ')';
            // this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + selectedSupp + ')';
            // for (let rec of this.values) {
            //     if (this.existingSuppList.indexOf(rec) === -1) {
            //         this.existingSuppList.push(rec);
            //     }
            // }
            // this.values = this.existingSuppList;
            // const custEvent = new CustomEvent('updatedsupliers', {
            //     detail: { newSuppliers: this.values, existingSupps: this.est, delList: this.delList }
            // })
            // this.dispatchEvent(custEvent);
        } catch (error) {
            console.log('handleChange error : ', error);
        }
    }

    // Updates the search value to search for account among the available accounts
    handleSearch(event) {
        try {
            console.log('handleSearch : ', event.target.dataset.id);
            this.searchKey = event.target.value;
            //refreshApex(this.latestSuppliers);
        } catch (error) {
            console.log('handleSearch error : ', error);
        }
    }

    // Updates the search value to search for account among the existing/already assigned accounts
    handleExSearch(event) {
        try {
            console.log('handleExSearch : ', event.target.dataset.id);
            this.exSearchKey = event.target.value;
            //refreshApex(this.latestExSuppliers);
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
        if (typeof this.supplierData != 'undefined' && typeof this.existingSuppList != 'undefined') {
            this.supplierData.forEach(accountId => {
                if (this.existingSuppList.indexOf(accountId.value) != -1) {
                    selectedAccounts++;
                }
            });
            this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + selectedAccounts + ')';
            this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - selectedAccounts) + ')';
        }
        console.log('selectedSuppliersCount : ' + selectedAccounts + ', availableSuppliersCount : ' + (this.supplierData.length - selectedAccounts));
    }
}