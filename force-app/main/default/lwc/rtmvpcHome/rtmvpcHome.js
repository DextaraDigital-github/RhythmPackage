import { LightningElement, wire, track, api } from 'lwc';
import getRelatedListRecordsCount from '@salesforce/apex/rtmvpcRelatedListsController.getRelatedListRecordsCount';

export default class RtmvpcHome extends LightningElement {
    @track count={};
    @api parentId='a14DE00000CRco1YAD';

    //'[Alerts1__r,Events__r,Activities__r,Work_Orders__r]'
    @wire(getRelatedListRecordsCount,{ vendorId: '$parentId' })
    getRelatedListRecordsCount_wiredData({error,data}){
        if(data)
        {
            this.count=data;
            console.log('Count-->',this.count);
        }
        else if(error)
        {
            console.log('Error-->',error);
        }
    }
}