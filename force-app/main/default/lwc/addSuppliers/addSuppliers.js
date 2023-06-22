import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllSuppliers from '@salesforce/apex/AssessmentController.getAllSuppliers';
import getExistingSuppliers from '@salesforce/apex/AssessmentController.getExistingSuppliersWithSearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class AddSuppliers extends LightningElement {
    @track supplierData;
    @api selectedSupplierData = [];
    @track values;
    availableSuppliersCount = 'Available Suppliers(0)';
    selectedSuppliersCount = 'Selected Suppliers(0)';
    searchKey = '';
    exSearchKey = '';
    @track latestSuppliers;
    @track latestExSuppliers;
    @api existingSuppList=[];
    hasRendered = true;
    @api recordId;

    get existingData(){
        if(this.existingSuppList != undefined && this.existingSuppList.length>0){
            console.log('inside---');
            return JSON.stringify(this.existingSuppList);
        }else{
            return '';
        }
    }
    

    @wire(getExistingSuppliers, { assessmentId: '$recordId',searchKey:'$exSearchKey'})
    existingSuppliers(result) {
        console.log('callingexsuppliers-------->');
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
                this.selectedSuppliersCount = this.selectedSuppliersCount.split('(')[0] + '(' + this.existingSuppList.length + ')';
            }
        } else if (result.error) {
            console.log('eror---->',result.error);
        }
    }

    @wire(getAllSuppliers,{existingData:'$existingData',searchKey:'$searchKey'})
    suppliersList(result){
        this.latestSuppliers = result;
        if (result.data) {
            let tempList = [];
            console.log('SupplierData-------->',JSON.stringify(this.supplierData));
            let retData = JSON.parse(JSON.stringify(result.data));
            for (let supRec of retData){
                tempList.push({
                    "label": supRec.Name,
                    "value": supRec.Id
                });
            }
            this.supplierData = tempList;
            if(this.supplierData.length > 0){
                this.availableSuppliersCount = this.availableSuppliersCount.split('(')[0] + '(' + (this.supplierData.length - this.existingSuppList.length) + ')';
            }
            
        }
        else if (result.error) {
            this.showNotification('Error',result.error.body.message,'error');
            console.log('getAllSuppliers:Error------->',result.error);
        }
    }

    handleChange(event) {
        try{
            console.log('existingSupData-------->',JSON.stringify(this.existingSuppList));
            console.log('EVENTDET-------->',JSON.stringify(event.detail));
            console.log('values-------->',JSON.stringify(event.detail.value));
            let delList = [];
            let eventValues = event.detail.value;
            for(let rec of this.existingSuppList){
                if(eventValues.indexOf(rec) === -1){
                    delList.push(rec);
                }
            }
            console.log('delList-------->',JSON.stringify(delList));
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
                detail : {newSuppliers:[...this.values],existingSupps:[...this.existingSuppList],delList:[...delList]}
              })
            this.dispatchEvent(custEvent);
        }catch(error){
            console.log('addSuppliers:handleChange:error----->',error);
        }
    }

    handleSearch(event){
        try{
            console.log('InTheNewSearch----->');
            console.log('searchname----->',event.target.dataset.id);
            this.searchKey = event.target.value;
            //refreshApex(this.latestSuppliers);
        }catch(error){
            console.log('addSuppliers:handleSearch:error----->',error);
        }
    }
    handleExSearch(event){
        try{
             console.log('searchname----->',event.target.dataset.id);
            console.log('InTheExSearch----->');
            let searchKey = event.target.value;
            this.exSearchKey = searchKey;
            //refreshApex(this.latestExSuppliers);
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