import { LightningElement, wire, api, track } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import getRelatedTasks from '@salesforce/apex/rtmvpcRelatedListsController.getRelatedTasks';

// let columns = [];
export default class RtmvpcRelatedLists extends LightningElement {
    @api recId;
    @api fieldvalue;
    @api objName;
    @api relName;
    @api fieldsList;

    @track relatedListRecords;
    @track error;

    @track columnsList;
    @track recDataList;
    //@api relRecId;

    @wire(getRelatedListRecords, {
        parentRecordId: '$recId',
        relatedListId: '$relName',
        fields: '$fieldsList'
    })
    getRelatedListRecordsList({ error, data }) {
        if (data) {
            this.relatedListRecords = data.records;
            //console.log('Records', data.records);
            console.log('Related List Records', JSON.stringify(this.relatedListRecords));
            this.error = undefined;
            if (typeof relatedListRecords != undefined) {
                // this.recDataList = [];
                // for (var i = 0; i < this.relatedListRecords.length; i++) {
                //     var rec = '';
                //     for (var j = 0; j < this.fieldvalue.length; j++) {
                //         console.log('{ "' + this.fieldvalue[j].fieldName + '" : "' + this.relatedListRecords[i]['fields'][this.fieldvalue[j].fieldName]['value'] + '" }');
                //         rec += '"' + this.fieldvalue[j].fieldName + '" : "' + this.relatedListRecords[i]['fields'][this.fieldvalue[j].fieldName]['value'] + '",';
                //         if (this.fieldvalue[j].fieldName === 'Name') {
                //             rec += '"NameUrl" : "/' + this.relatedListRecords[i].id + '",';
                //         }
                //     }
                //     console.log(rec);
                //     this.recDataList.push(JSON.parse('{' + rec.substring(0, rec.length - 1) + '}'));
                //     console.log(this.recDataList);
                // }
                this.recDataList = this.assignData(this.relatedListRecords, this.fieldvalue);
            }
            // console.log(JSON.stringify(this.recDataList));
            // console.log('this.columns', this.columnsList);
        }
        else if (error) {
            this.error = error;
            console.log('Error', this.error);
        }
    }

    assignData(relatedListRecords, fieldvalue) {
        var recDataList = [];
        for (var i = 0; i < relatedListRecords.length; i++) {
            var rec = '';
            for (var j = 0; j < fieldvalue.length; j++) {
                console.log('{ "' + fieldvalue[j].fieldName + '" : "' + relatedListRecords[i]['fields'][fieldvalue[j].fieldName]['value'] + '" }');
                rec += '"' + fieldvalue[j].fieldName + '" : "' + relatedListRecords[i]['fields'][fieldvalue[j].fieldName]['value'] + '",';
                if (fieldvalue[j].fieldName === 'Name') {
                    rec += '"NameUrl" : "/' + relatedListRecords[i].id + '",';
                }
            }
            rec=rec.replaceAll('null',' ');
            console.log(rec);
            recDataList.push(JSON.parse('{' + rec.substring(0, rec.length - 1) + '}'));
            console.log(recDataList);
        }
        return recDataList;
    }



    openRecordHandler(event) {
        console.log('Clicked ' + event.target.dataset.id);
        var relList = this.template.querySelectorAll('.relatedListRecords')[0];
        var rec = this.template.querySelectorAll('.recordDetail')[0];
        relList.style.display = 'none';
        rec.style.display = 'block';
        this.relRecId = event.target.dataset.id;
        console.log(relList.style.display + ', ' + rec.style.display + ', ' + this.relRecId);
    }
    backHandler(event) {
        console.log('Clicked');
        var relList = this.template.querySelectorAll('.relatedListRecords')[0];
        var rec = this.template.querySelectorAll('.recordDetail')[0];
        rec.style.display = 'none';
        relList.style.display = 'block';
        console.log(relList.style.display + ', ' + rec.style.display + ', ' + this.relRecId);
    }



    connectedCallback() {
        /*this.recId='a0h5i000004oqZEAAY';
        this.objName='Alert__c';
        this.relName='Alerts1__r';*/
        if (this.objName === 'Task') {
            getRelatedTasks({ vendorId: this.recId }).then(result => {
                this.recDataList = result;
            }).catch(error => {
                this.error = error;
                console.log('Error', this.error);
            })
        }
        this.fieldsList = [];
        this.columnsList = [];
        console.log('this.fieldvalue', JSON.stringify(this.fieldvalue));
        if (typeof this.fieldvalue != undefined) {
            this.columnsList = [];
            for (let i = 0; i < this.fieldvalue.length; i++) {
                console.log(this.fieldvalue[i]);
                this.fieldsList.push(this.objName + '.' + this.fieldvalue[i].fieldName);
                if (this.fieldvalue[i].fieldName === 'Name') {
                    this.columnsList.push(JSON.parse('{"label": "Name", "fieldName": "NameUrl", "type": "url", "typeAttributes":{"label": { "fieldName": "Name" }, "target": "_blank"}}'));
                }
                else {
                    this.columnsList.push(this.fieldvalue[i]);
                }
            }
        }
        // console.log('fieldslist', JSON.stringify(this.fieldsList));
        // console.log('columnsList', JSON.stringify(this.columnsList));
    }
}