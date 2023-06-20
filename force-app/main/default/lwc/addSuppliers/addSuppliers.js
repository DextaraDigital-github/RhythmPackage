import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllSuppliers from '@salesforce/apex/AssessmentController.getAllSuppliers';
import getExistingSuppliers from '@salesforce/apex/AssessmentController.getExistingSuppliersWithSearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class AddSuppliers extends LightningElement {
    @track supplierData;
    @api selectedSupplierData = [];
    @track values;
    @track availableSuppliersCount = 'Available Suppliers(0)';
    @track selectedSuppliersCount = 'Selected Suppliers(0)';
    searchKey = '';
    exSearchKey = '';
    @track latestSuppliers;
    @track latestExSuppliers;
    @api existingSuppList=[];
    hasRendered = true;
    @api recordId;
    testVal;

    get idValue(){
        if(this.recordId != undefined && this.recordId.length>0){
            this.testVal = this.recordId
          }
          return this.testVal;
    }
    @wire(getAllSuppliers,{searchKey:'$searchKey'})
    suppliersList(result){
        console.log('SLISt------>',this.idValue);
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
            this.showNotification('Error',result.error.body.message,'error');
            console.log('getAllSuppliers:Error------->',result.error);
        }
    }

    @wire(getExistingSuppliers, { assessmentId: '$idValue',searchKey:'$exSearchKey'})
    existingSuppliers(result) {
        this.latestExSuppliers = result;
        if (result.data) {
            let tempList=[];
            console.log('existingSuppliers---->',JSON.stringify(result.data));
            for(let rec of result.data){
                tempList.push(rec.Rhythm__Account__c);
            }
            if(tempList.length > 0){
                this.existingSuppList = tempList;
                this.values = [...this.existingSuppList];
            }
        } else if (result.error) {
            console.log('eror---->',result.error);
        }
    }

    handleChange(event) {
        try{
            console.log('existingSupData-------->',JSON.stringify(this.existingSuppList));
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
                detail : {newSuppliers:[...this.values],existingSupps:[...this.existingSuppList]}
              })
            this.dispatchEvent(custEvent);
        }catch(error){
            console.log('addSuppliers:handleChange:error----->',error);
        }
    }

    handleSearch(event){
        try{
            let searchKey = event.target.value;
            this.searchKey = searchKey;
            refreshApex(this.latestSuppliers);
        }catch(error){
            console.log('addSuppliers:handleSearch:error----->',error);
        }
    }
    handleExSearch(event){
        try{
            let searchKey = event.target.value;
            this.exSearchKey = searchKey;
            refreshApex(this.latestExSuppliers);
        }catch(error){
            console.log('addSuppliers:handleSearch:error----->',error);
        }
    }

    showNotification(title,message,variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}