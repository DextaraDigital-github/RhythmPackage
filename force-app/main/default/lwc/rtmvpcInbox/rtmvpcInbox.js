import { LightningElement, track, api } from 'lwc';
import getTaskRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getTaskRelatedRecords';
import getAlertRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getAlertRelatedRecords';
import getIncidentRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getIncidentRelatedRecords';
import getinboxandsuppliertaskslist from '@salesforce/apex/rtmvpcRelatedListsController.getinboxandsuppliertaskslist';
import getSupplierTask from '@salesforce/apex/rtmvpcRelatedListsController.getSupplierTask';
export default class RtmvpcInbox extends LightningElement {
    value = 'new';
    @api vendorId = 'a14DE00000CRco1YAD';
    @track relatedListRecords = [];
    @track parentListRecords = [];
    @track relatedListRecords_copy = [];
    @track displayFields=[];
    @track error;
    @track rec={};
    @track show={'Task':true,'Supplier_Inbox_Categ__c':false,'Supplier_Task__c':false};
    @track spin;

    get options() {
        return [
            { label: 'Newest', value: 'new' },
            { label: 'Oldest', value: 'old' },
        ];
    }

    handleChange(event) {
        this.value = event.detail.value;
    }
    start = 0;
    end = 0;
    selectMode = 'select';

    handleLeftButtonClick(event) {

        var cibtype = this.template.querySelector('[data-id="cibtype"]');
        console.log('cibtype'+cibtype);
        cibtype.classList.toggle('cibshowleft');
    }
    handleRightButtonClick(event) {
        var cibtype = this.template.querySelector('[data-id="cibdisc"]');
        cibtype.classList.toggle('cibshowright');
    }

    connectedCallback() {
        this.spin=true;
        this.parentListRecords=[];
        console.log('Connected Call Back');
        console.log('RecordId:'+this.recordId);


          getinboxandsuppliertaskslist().then(result =>{
                 this.parentListRecords = JSON.parse(JSON.stringify(result));
                 for(var i = 0; i < this.parentListRecords.length; i++){
                     console.log('this.relatedListRecords[i].Description__C'+ this.parentListRecords[i].Description__C);
                    
                    this.parentListRecords[i].Id = this.parentListRecords[i].Id;
                    this.parentListRecords[i].Name = this.parentListRecords[i].Name;
                    //this.parentListRecords[i].Description = this.parentListRecords[i].Description__C;
                    this.parentListRecords[i].Count = this.parentListRecords[i].Count;
    //                     this.relatedListRecords[i].ProjectName = "";
    //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
    //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
    //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
    //             }
                //this.displayFields=[{label:'Subject',fieldName:'Name'},{label:'Name',fieldName:'Name'}];
                // this.relatedListRecords_copy=this.relatedListRecords;
                // this.rec=this.relatedListRecords[0];
                this.spin=false;
 
                 }
             })

        // getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
        //         this.relatedListRecords = JSON.parse(JSON.stringify(result));
        //         for (var i = 0; i < this.relatedListRecords.length; i++) {
        //             if(this.relatedListRecords[i].What)
        //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].What.Name;
        //             else
        //                 this.relatedListRecords[i].ProjectName = "";
        //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
        //             this.relatedListRecords[i].classNamesList = 'cib-unread';
        //             this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
        //         }
        //         this.displayFields=[{label:'Subject',fieldName:'Subject'},{label:'ProjectName',fieldName:'ProjectName'}]
        //         this.relatedListRecords_copy=this.relatedListRecords;
        //         this.rec=this.relatedListRecords[0];
        //         this.spin=false;
        //         console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
        //     }).catch(error => {
        //         this.error = error;
        //         console.log('Error', this.error);
        //     })
    }
    showDataHandler(event) {
      
      console.log('event:'+event);
    //   if(this.show.PROJECTS===false && this.show.COMPLIANCE===false && this.show.ASSESSMENTS===false && this.show.RFPs===false && this.CONTRACTS ===false ){
    //  this.show.GENERAL_ANNOUNCEMENTS=true;
    //  this.spin=true;
    //  console.log('this.show==>'+ JSON.stringify(this.show));
    //   }
        // else if(this.show.GENERAL_ANNOUNCEMENTS===false && this.show.COMPLIANCE===false && this.show.ASSESSMENTS===false && this.show.RFPs===false && this.CONTRACTS ===false){
        //   this.show.PROJECTS = true;
        //   console.log('this.show2==>'+ JSON.stringify(this.show));

        // }
        // else if (this.show.GENERAL_ANNOUNCEMENTS===false && this.show.PROJECTS===false && this.show.ASSESSMENTS===false && this.show.RFPs===false && this.CONTRACTS ===false){
        //  this.COMPLIANCE=true;
        // }

    
this.relatedListRecords=[];
        var parentId = event.currentTarget.dataset.id;
        
        getSupplierTask({recordId:parentId}).then(result =>{
            console.log('result'+result);
                 this.relatedListRecords = JSON.parse(JSON.stringify(result));
                 for(var i = 0; i < this.relatedListRecords.length; i++){
                     console.log('this.relatedListRecords[i].Description__C'+ this.relatedListRecords[i].Description__c);   
                    this.relatedListRecords[i].Id = this.relatedListRecords[i].Id;
                    this.relatedListRecords[i].Name = this.relatedListRecords[i].Name;
                    this.relatedListRecords[i].Description = this.relatedListRecords[i].Description__c;
    //                     this.relatedListRecords[i].ProjectName = "";
    //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
    //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
    //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
    //             }
                //this.displayFields=[{label:'Subject',fieldName:'Name'},{label:'Name',fieldName:'Name'}];
                // this.relatedListRecords_copy=this.relatedListRecords;
                // this.rec=this.relatedListRecords[0];
                this.spin=false;
 
                 }
             })

    //     console.log('objectName'+objectName);
    //     var eleList=this.template.querySelectorAll('.items');
    //     console.log('eleList==>'+JSON.stringify(eleList));
    //     for(var i=0;i<eleList.length;i++)
    //     {
    //         if(eleList[i].dataset.id!=objectName)
    //             eleList[i].className=eleList[i].className.replaceAll('active','');
    //     }
    //     this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className=this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className+' active';
    //      var items=['Supplier_Inbox_Categ__c','Supplier_Task__c','Incidents__c'];
    //      this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className=this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className+' active';
    //      for(var i=0;i<items.length;i++)
    //      {
    //         if(items[i]!=objectName)
    //             this.template.querySelectorAll('[data-id="'+items[i]+'"]')[0].className=this.template.querySelectorAll('[data-id="'+items[i]+'"]')[0].className.replaceAll('active','');
    //      }
    //      if(objectName === 'Supplier_Inbox_Categ__c')
    //      {
    //          this.spin=true;
    //          this.Supplier_Task__c = false;
    //          this.Supplier_Inbox_Categ__c = true;
    //          this.relatedListRecords=[];
    //          getinboxandsuppliertaskslist({recordId:this.recordId}).then(result =>{
    //              this.relatedListRecords = JSON.parse(JSON.stringify(result));
    //              for(var i = 0; i < this.relatedListRecords.length; i++){
    //                  console.log(this.relatedListRecords[i].Name);
    //                  //console.log(this.relatedListRecords[i].Id);
                    
    //                 //this.relatedListRecords[i].Id = this.relatedListRecords[i].Id;
    //                 this.relatedListRecords[i].Name = this.relatedListRecords[i].Name;
    // //                     this.relatedListRecords[i].ProjectName = "";
    // //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
    // //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
    // //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
    // //             }
    //             this.displayFields=[{label:'Subject',fieldName:'Name'},{label:'Name',fieldName:'Name'}];
    //             this.relatedListRecords_copy=this.relatedListRecords;
    //             this.rec=this.relatedListRecords[0];
    //             this.spin=false;
 
    //              }
    //          })

    //      }
    }
    //     if (objectName === 'Task') {
    //         this.spin=true;
    //         this.relatedListRecords=[];
    //         this.show.Alert__c=false;
    //         this.show.Incidents__c=false;
    //         this.show.Task=true;
    //         getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
    //             this.relatedListRecords = JSON.parse(JSON.stringify(result));
    //             for (var i = 0; i < this.relatedListRecords.length; i++) {
    //                 if(this.relatedListRecords[i].What)
    //                     this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].What.Name;
    //                 else
    //                     this.relatedListRecords[i].ProjectName = "";
    //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
    //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
    //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
    //             }
    //             this.displayFields=[{label:'Subject',fieldName:'Subject'},{label:'ProjectName',fieldName:'ProjectName'}];
    //             this.relatedListRecords_copy=this.relatedListRecords;
    //             this.rec=this.relatedListRecords[0];
    //             this.spin=false;
    //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
    //         }).catch(error => {
    //             this.error = error;
    //             console.log('Task Error', this.error);
    //         });
    //     }
    //     else if (objectName === 'Alert__c') {
    //         this.spin=true;
    //         this.relatedListRecords=[];
    //         this.show.Task=false;
    //         this.show.Incidents__c=false;
    //         this.show.Alert__c=true;
    //         getAlertRelatedRecords({ vendorId: this.vendorId }).then(result => {
    //             this.relatedListRecords = JSON.parse(JSON.stringify(result));
    //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
    //             for (var i = 0; i < this.relatedListRecords.length; i++) {
    //                 if(this.relatedListRecords[i].Work_Orders__r)
    //                     this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
    //                 else
    //                     this.relatedListRecords[i].ProjectName = "";
    //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
    //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
    //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
    //             }
    //             this.displayFields=[{label:'Name',fieldName:'Name'},{label:'ProjectName',fieldName:'ProjectName'}];
    //             this.relatedListRecords_copy=this.relatedListRecords;
    //             this.rec=this.relatedListRecords[0];
    //             this.spin=false;
    //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
    //         }).catch(error => {
    //             this.error = error;
    //             console.log('Alerts__c Error', this.error);
    //         });
    //     }
    //     else if (objectName === 'Incidents__c') {
    //         this.spin=true;
    //         this.relatedListRecords=[];
    //         this.show.Task=false;
    //         this.show.Alert__c=false;
    //         this.show.Incidents__c=true;
    //         getIncidentRelatedRecords({ vendorId: this.vendorId }).then(result => {
    //             this.relatedListRecords = JSON.parse(JSON.stringify(result));
    //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
    //             for (var i = 0; i < this.relatedListRecords.length; i++) {
    //                 if(this.relatedListRecords[i].Work_Order_Name__r)
    //                     this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
    //                 else
    //                     this.relatedListRecords[i].ProjectName = "";
    //                this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
    //                this.relatedListRecords[i].classNamesList = 'cib-unread';
    //                this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
    //             }
    //             this.displayFields=[{label:'Name',fieldName:'Name'},{label:'ProjectName',fieldName:'ProjectName'}];
    //             this.relatedListRecords_copy=this.relatedListRecords;
    //             this.rec=this.relatedListRecords[0];
    //             this.spin=false;
    //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
    //         }).catch(error => {
    //             this.error = error;
    //             console.log('Incidents__c Error', this.error);
    //         });
    //     }
    // }

    openChatHandler(event)
    {
        var recId=event.currentTarget.dataset.id;
        for(var i=0;i<this.relatedListRecords.length;i++)
        {
            if(this.relatedListRecords[i].Id===recId)
            {
                this.rec=this.relatedListRecords[i];
                this.relatedListRecords[i].classNamesList = 'cib-read';
            }
        }
    }

    searchInputChangeHandler(event)
    {
        this.relatedListRecords=[];
        var search=event.target.value;
        for(var i=0;i<this.relatedListRecords_copy.length;i++)
        {
            for(var j=0;j<this.displayFields.length;j++)
            {
                if(JSON.stringify(this.relatedListRecords_copy[i][this.displayFields[j].fieldName]).toLowerCase().includes(search.toLowerCase()))
                {
                    this.relatedListRecords.push(this.relatedListRecords_copy[i]);
                    break;
                }
            }
        }
    }
}



// import { LightningElement, track, api, wire } from 'lwc';
// import getTaskRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getTaskRelatedRecords';
// import getAlertRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getAlertRelatedRecords';
// import getIncidentRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getIncidentRelatedRecords';
// export default class RtmvpcInbox extends LightningElement {
//     value = 'new';
//     @api vendorId = 'a0h5i000004oqZEAAY';
//     @track relatedListRecords = [];
//     @track relatedListRecords_copy = [];
//     @track displayFields = [];
//     @track error;
//     @track rec = {};
//     @track show = { 'Task': true, 'Alert__c': false, 'Incidents__c': false };
//     @track spin;
//     relatedRecordsJson = {};

//     get options() {
//         return [
//             { label: 'Newest', value: 'new' },
//             { label: 'Oldest', value: 'old' },
//         ];
//     }

//     handleChange(event) {
//         this.value = event.detail.value;
//     }
//     start = 0;
//     end = 0;
//     selectMode = 'select';

//     handleLeftButtonClick(event) {
//         var cibtype = this.template.querySelector('[data-id="cibtype"]');
//         cibtype.classList.toggle('cibshowleft');
//     }
//     handleRightButtonClick(event) {
//         var cibtype = this.template.querySelector('[data-id="cibdisc"]');
//         cibtype.classList.toggle('cibshowright');
//     }


//     @wire(getTaskRelatedRecords, { vendorId: '$vendorId' })
//     getTaskRelatedRecords_wiredData({ error, data }) {
//         if (data) {
//             var resultRec = data;
//             for (var i = 0; i < resultRec.length; i++) {
//                 if (resultRec[i].What)
//                     resultRec[i]["ProjectName"] = resultRec[i].What.Name;
//                 else
//                     resultRec[i].ProjectName = "";
//                 resultRec[i].OwnerName = resultRec[i].Owner.Name;
//                 resultRec[i].classNamesList = 'cib-unread';
//                 resultRec[i].CreatedDate = resultRec[i].CreatedDate.split('T')[0];
//             }
//             this.relatedRecordsJson.Task=resultRec;
//             this.relatedRecordsJson.displayFields=[{ label: 'Subject', fieldName: 'Subject' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
//             // this.displayFields = [{ label: 'Subject', fieldName: 'Subject' }, { label: 'ProjectName', fieldName: 'ProjectName' }]
//             // this.relatedListRecords_copy = this.relatedListRecords;
//             // this.rec = this.relatedListRecords[0];
//             // this.spin = false;
//         } else if (error) {
//             console.error('Error:', error);
//         }
//     }
//     // @wire(getAlertRelatedRecords, { vendorId: '$vendorId' })
//     // getAlertRelatedRecords_wiredData({ error, data }) {
//     //     if (data) {
//     //         this.relatedListRecords = JSON.parse(JSON.stringify(result));
//     //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //         for (var i = 0; i < this.relatedListRecords.length; i++) {
//     //             if (this.relatedListRecords[i].Work_Orders__r)
//     //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
//     //             else
//     //                 this.relatedListRecords[i].ProjectName = "";
//     //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //             this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //             this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //         }
//     //         this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
//     //         this.relatedListRecords_copy = this.relatedListRecords;
//     //         this.rec = this.relatedListRecords[0];
//     //         this.spin = false;
//     //     } else if (error) {
//     //         console.error('Error:', error);
//     //     }
//     // }
//     // @wire(getIncidentRelatedRecords, { vendorId: '$vendorId' })
//     // getIncidentRelatedRecords_wiredData({ error, data }) {
//     //     if (data) {
//     //         this.relatedListRecords = result;
//     //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //         for (var i = 0; i < this.relatedListRecords.length; i++) {
//     //             if (this.relatedListRecords[i].Work_Order_Name__r)
//     //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
//     //             else
//     //                 this.relatedListRecords[i].ProjectName = "";
//     //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //             this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //             this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //         }
//     //         this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
//     //         this.relatedListRecords_copy = this.relatedListRecords;
//     //         this.rec = this.relatedListRecords[0];
//     //         this.spin = false;
//     //     } else if (error) {
//     //         console.error('Error:', error);
//     //     }
//     // }

//     connectedCallback() {
//         this.spin=true;
//         this.relatedListRecords=this.relatedRecordsJson.Task;
//         this.spin=false;
//     }
//     showDataHandler(event) {
//         var objectName = event.currentTarget.dataset.id;
//         if (objectName === 'Task') {
//             this.spin = true;
//             this.relatedListRecords = [];
//             this.show.Alert__c = false;
//             this.show.Incidents__c = false;
//             this.show.Task = true;
//             getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
//                 this.relatedListRecords = result;
//                 for (var i = 0; i < this.relatedListRecords.length; i++) {
//                     if (this.relatedListRecords[i].What)
//                         this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].What.Name;
//                     else
//                         this.relatedListRecords[i].ProjectName = "";
//                     this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//                     this.relatedListRecords[i].classNamesList = 'cib-unread';
//                     this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
//                 }
//                 this.displayFields = [{ label: 'Subject', fieldName: 'Subject' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
//                 this.relatedListRecords_copy = this.relatedListRecords;
//                 this.rec = this.relatedListRecords[0];
//                 this.spin = false;
//                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//             }).catch(error => {
//                 this.error = error;
//                 console.log('Task Error', this.error);
//             });
//         }
//         else if (objectName === 'Alert__c') {
//             this.spin = true;
//             this.relatedListRecords = [];
//             this.show.Task = false;
//             this.show.Incidents__c = false;
//             this.show.Alert__c = true;
//             getAlertRelatedRecords({ vendorId: this.vendorId }).then(result => {
//                 this.relatedListRecords = JSON.parse(JSON.stringify(result));
//                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//                 for (var i = 0; i < this.relatedListRecords.length; i++) {
//                     if (this.relatedListRecords[i].Work_Orders__r)
//                         this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
//                     else
//                         this.relatedListRecords[i].ProjectName = "";
//                     this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//                     this.relatedListRecords[i].classNamesList = 'cib-unread';
//                     this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
//                 }
//                 this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
//                 this.relatedListRecords_copy = this.relatedListRecords;
//                 this.rec = this.relatedListRecords[0];
//                 this.spin = false;
//                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//             }).catch(error => {
//                 this.error = error;
//                 console.log('Alerts__c Error', this.error);
//             });
//         }
//         else if (objectName === 'Incidents__c') {
//             this.spin = true;
//             this.relatedListRecords = [];
//             this.show.Task = false;
//             this.show.Alert__c = false;
//             this.show.Incidents__c = true;
//             getIncidentRelatedRecords({ vendorId: this.vendorId }).then(result => {
//                 this.relatedListRecords = result;
//                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//                 for (var i = 0; i < this.relatedListRecords.length; i++) {
//                     if (this.relatedListRecords[i].Work_Order_Name__r)
//                         this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
//                     else
//                         this.relatedListRecords[i].ProjectName = "";
//                     this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//                     this.relatedListRecords[i].classNamesList = 'cib-unread';
//                     this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
//                 }
//                 this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
//                 this.relatedListRecords_copy = this.relatedListRecords;
//                 this.rec = this.relatedListRecords[0];
//                 this.spin = false;
//                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//             }).catch(error => {
//                 this.error = error;
//                 console.log('Incidents__c Error', this.error);
//             });
//         }
//     }

//     openChatHandler(event) {
//         var recId = event.currentTarget.dataset.id;
//         for (var i = 0; i < this.relatedListRecords.length; i++) {
//             if (this.relatedListRecords[i].Id === recId) {
//                 this.rec = this.relatedListRecords[i];
//                 this.relatedListRecords[i].classNamesList = 'cib-read';
//             }
//         }
//     }

//     searchInputChangeHandler(event) {
//         //this.relatedListRecords_copy=this.relatedListRecords;
//         this.relatedListRecords = [];
//         var search = event.target.value;
//         for (var i = 0; i < this.relatedListRecords_copy.length; i++) {
//             for (var j = 0; j < this.displayFields.length; j++) {
//                 if (JSON.stringify(this.relatedListRecords_copy[i][this.displayFields[j].fieldName]).toLowerCase().includes(search.toLowerCase())) {
//                     this.relatedListRecords.push(this.relatedListRecords_copy[i]);
//                     break;
//                 }
//             }
//         }
//     }
// }