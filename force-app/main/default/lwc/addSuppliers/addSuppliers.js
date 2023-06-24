import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllSuppliers from '@salesforce/apex/AssessmentController.getAllSuppliers';
import getExistingSuppliers from '@salesforce/apex/AssessmentController.getExistingSuppliersWithSearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class AddSuppliers extends LightningElement {
    renderedExistingSuppliers = false;
    @track supplierData;
    @api selectedSupplierData = [];
    @track currentValues;
    @track values;
    availableSuppliersCount = 'Available Suppliers(0)';
    selectedSuppliersCount = 'Selected Suppliers(0)';
    searchKey = '';
    exSearchKey = '';
    @track latestSuppliers;
    @track latestExSuppliers;
    existingSuppList = [];
    @api est = [];
    hasRendered = true;
    @api recordId;

    get existingData() {
        if (this.existingSuppList != undefined && this.existingSuppList.length > 0) {
            console.log('inside existingData : ', JSON.stringify(this.existingSuppList));
            return JSON.stringify(this.existingSuppList);
        } else {
            return '';
        }
    }

    @wire(getExistingSuppliers, { assessmentId: '$recordId', searchKey: '' })
    existingSuppliers(result) {
        this.latestExSuppliers = result;
        if (result.data) {
            let tempList = [];
            console.log('existingSuppliers data---->', JSON.stringify(result.data));
            for (let rec of result.data) {
                tempList.push(rec.Rhythm__Account__c);
            }
            if (tempList.length > 0) {
                this.existingSuppList = tempList;
                if (!this.renderedExistingSuppliers) {
                    this.est = JSON.parse(JSON.stringify(this.existingSuppList));
                    this.renderedExistingSuppliers = true;
                }
                this.values = this.existingSuppList;
                this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + this.existingSuppList.length + ')';
            }
        } else if (result.error) {
            console.log('eror---->', result.error);
        }
    }
    @wire(getAllSuppliers, { existingData: '$existingData', searchKey: '$searchKey', exSearchKey: '$exSearchKey' })
    suppliersList(result) {
        this.latestSuppliers = result;
        if (result.data) {
            let tempList = [];
            console.log('this.supplierData-------->', JSON.stringify(this.supplierData));
            console.log('this.existingData-------->', JSON.stringify(this.existingData));
            console.log('this.existingSuppList-------->', JSON.stringify(this.existingSuppList));
            console.log('this.values-------->', JSON.stringify(this.values));
            let retData = JSON.parse(JSON.stringify(result.data));
            for (let supRec of retData) {
                tempList.push({
                    "label": supRec.Name,
                    "value": supRec.Id
                });
            }
            this.supplierData = tempList;
            if (this.supplierData.length > 0) {
                this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - this.existingSuppList.length) + ')';
            }
            if (typeof this.values != 'undefined')
                this.values = JSON.parse(JSON.stringify(this.values));
            if (typeof this.supplierData != 'undefined')
                this.supplierData = JSON.parse(JSON.stringify(this.supplierData));
            for (let rec of this.est) {
                if (this.values.indexOf(rec) === -1) {
                    this.delList.push(rec);
                }
            }
            const custEvent = new CustomEvent('updatedsupliers', {
                detail: { newSuppliers: this.values, existingSupps: this.est, delList: this.delList }
            })
            this.dispatchEvent(custEvent);
        }
        else if (result.error) {
            this.showNotification('Error', result.error.body.message, 'error');
            console.log('getAllSuppliers:Error------->', result.error);
        }
    }

    handleChange(event) {
        try {
            this.delList = [];
            this.currentValues = event.detail.value;
            if (typeof this.est != 'undefined' && this.est.length > 0) {
                for (let rec of this.est) {
                    if (this.values.indexOf(rec) === -1) {
                        this.delList.push(rec);
                    }
                }
            }
            console.log('this.delList-------->', JSON.stringify(this.delList));
            this.values = event.target.value;
            let selectedSupp = this.values.length > 0 ? this.values.length : 0;
            this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - selectedSupp) + ')';
            this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + selectedSupp + ')';
            for (let rec of this.values) {
                if (this.existingSuppList.indexOf(rec) === -1) {
                    this.existingSuppList.push(rec);
                }
            }
            this.values = this.existingSuppList;
            console.log('this.estemp-------->', JSON.stringify(this.est));
            console.log('this.supplierData-------->', JSON.stringify(this.supplierData));
            console.log('this.values-------->', JSON.stringify(this.values));
            const custEvent = new CustomEvent('updatedsupliers', {
                detail: { newSuppliers: this.values, existingSupps: this.est, delList: this.delList }
            })
            this.dispatchEvent(custEvent);
        } catch (error) {
            console.log('addSuppliers:handleChange:error----->', error);
        }
    }

    handleSearch(event) {
        try {
            console.log('InTheNewSearch----->');
            console.log('searchname----->', event.target.dataset.id);
            this.searchKey = event.target.value;
            //refreshApex(this.latestSuppliers);
        } catch (error) {
            console.log('addSuppliers:handleSearch:error----->', error);
        }
    }
    handleExSearch(event) {
        try {
            let searchKey = event.target.value;
            console.log('existingSupData2-------->', JSON.stringify(this.existingSuppList));
            console.log('values-------->', JSON.stringify(this.values));
            this.exSearchKey = searchKey;
            //refreshApex(this.latestExSuppliers);
        } catch (error) {
            console.log('addSuppliers:handleSearch:error----->', error);
        }
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}