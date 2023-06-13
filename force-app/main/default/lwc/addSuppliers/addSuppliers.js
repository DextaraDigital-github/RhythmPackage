import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllSuppliers from '@salesforce/apex/AssessmentController.getAllSuppliers';

export default class AddSuppliers extends LightningElement {
    @track supplierData;
    @api selectedSupplierData = [];
    @track values;
    @track availableSuppliersCount = 'Available Suppliers(0)';
    @track selectedSuppliersCount = 'Selected Suppliers(0)';
    searchKey = '';
    @track latestSuppliers;

    @wire(getAllSuppliers,{searchKey:'$searchKey'})
    suppliersList(result){
        this.latestSuppliers = result;
        if (result.data) {
            let tempList = [];
            console.log('SupplierData-------->',JSON.stringify(this.supplierData));
            this.supplierData = JSON.parse(JSON.stringify(result.data));
            for (let supRec of this.supplierData){
                tempList.push({
                    "label": supRec.Name,
                    "value": supRec.Id
                });
            }
            this.supplierData = tempList;
            this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + this.supplierData.length + ')';
        }
        else if (result.error) {
            console.log('getAllSuppliers:Error------->',result.error);
        }
    }

    handleChange(event) {
        try{
            this.values = event.target.value;
            this.selectedSupplierData = [];
            for (var i = 0; i < this.supplierData.length; i++) {
                if (this.values.includes(this.supplierData[i].value.toString())) {
                    this.selectedSupplierData.push({ Id: this.supplierData[i].value, Name: this.supplierData[i].label });
                }
            }
            let selectedSupp = this.values.length > 0 ? this.values.length : 0;
            this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - selectedSupp) + ')';
            this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + selectedSupp + ')';
            const custEvent = new CustomEvent('updatedsupliers', {
                detail : [...this.values]
              })
            this.dispatchEvent(custEvent);
        }catch(error){
            console.log('addSuppliers:handleChange:error----->',error);
        }
    }

    handleSearch(event){
        try{
            const searchKey = event.target.value;
            this.searchKey = searchKey;
            refreshApex(this.latestSuppliers);
        }catch(error){
            console.log('addSuppliers:handleSearch:error----->',error);
        }
    }
}