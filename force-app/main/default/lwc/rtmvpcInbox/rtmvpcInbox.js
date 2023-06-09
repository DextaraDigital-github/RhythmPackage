import { LightningElement, track, api } from 'lwc';

//import hurricanePNG from '@salesforce/resourceUrl/hurricane';
import getRecordsForInbox from '@salesforce/apex/rtmvpcRelatedListsController.getRecordsForInbox';
// import getTaskRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getTaskRelatedRecords';
// import getAlertRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getAlertRelatedRecords';
// import getIncidentRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getIncidentRelatedRecords';
export default class RtmvpcInbox extends LightningElement {
    //hurricanePNG = hurricanePNG;
    value = 'new';
    @api vendorId = 'a14DE00000CRco1YAD';
    @track relatedListRecords = [];
    @track relatedListRecords_copy = [];
    @track displayFields = [];
    @track error;
    @track rec = {};
    @track show = { 'Task': true, 'Alert__c': false, 'Incidents__c': false };
    @track spin;
    @track classlist_read = 'cib-unread';
    @track assessmentId = 'a18DE00000J0o5AYAR';
    @track activeCategory;
    @track showAcceptModal = false;
    get options() {
        return [
            { label: 'Newest', value: 'new' },
            { label: 'Oldest', value: 'old' },
        ];
    }

    openTaskHandler(event) {
        var assessId = event.currentTarget.dataset.id;
        const opentask = new CustomEvent('opentask', {
            detail: {
                assessmentId: assessId,
                category: "Assessments"
            }
        });
        this.dispatchEvent(opentask);
    }
    openAcceptModalHandler() {
        this.showAcceptModal = true;
    }
    closeAcceptModalHandler() {
        this.showAcceptModal = false;
    }
    handleTempActive(event) {
        let buttonId = event.currentTarget.dataset.id;

        // Remove cib-current class from all buttons
        //const buttons = this.template.querySelectorAll('.cib-current');
        const buttons = this.template.querySelectorAll('[data-id^="cib-button"]');
        console.log(buttons);
        buttons.forEach(button => {
            if (typeof button.classList != "undefined" && button.classList.value.includes('cib-current')) {
                console.log(button.classList);
                button.classList.remove('cib-current');
                button.classList += 'cib-read';
            }
        });
        const clickedButton = this.template.querySelectorAll('[data-id="' + buttonId + '"]');
        clickedButton[0].classList.remove('cib-read', 'cib-unread');
        clickedButton[0].classList += 'cib-current';

        const containers = this.template.querySelectorAll('[data-id^="cib-rightsec"]');
        //const containers = this.template.querySelectorAll('.slds-show');
        containers.forEach(container => {
            if (typeof container.classList != "undefined" && container.classList.value.includes('slds-show')) {
                container.classList.remove('slds-show');
                container.classList += 'slds-hide';
            }
        });
        const openContainer = this.template.querySelectorAll('[data-id="cib-rightsec_' + buttonId.split('_')[1] + '"]');
        openContainer[0].classList.remove('slds-hide');
        openContainer[0].classList += 'slds-show';

        // Remove cib-read and cib-unread classes from all buttons
        // buttons.forEach(button => {
        //     button.classList.remove('cib-read', 'cib-unread');
        // });
        // buttons.forEach(button => {
        //     if (button.dataset.id !== buttonId) {
        //         button.classList.add('cib-read');
        //     }
        // });
        // const containers = this.template.querySelectorAll('[data-id^="cib-rightsec"]');
        // containers.forEach(container => {
        //     container.classList.remove('slds-show');
        // });
        // buttonId = buttonId + '';
        // const containerId = buttonId.replace('cib-button', 'cib-rightsec');
        // console.log('containerId', containerId);
        // containers.forEach(container => {
        //     container.classList.add('slds-hide');
        // });
        // // Add slds-hide class to all containers except the corresponding container
        // containers.forEach(container => {
        //     if (container.dataset.id !== containerId) {
        //         container.classList.add('slds-show');
        //         //container.classList.add('slds-show');
        //         this.template.querySelector(containerId).classList.add('slds-show');
        //     }
        // });





        // var x = event.currentTarget.dataset.id;
        // var y = this.template.querySelector('[data-id="'+x+'"]').className;
        // if(x.includes('rightsec_'))
        // {
        //     if(y=='slds-hide')
        //     {
        //         this.template.querySelector('[data-id="'+x+'"]').className ='slds-show';
        //         //this.template.querySelector('[data-id="cib-current"]').className ='slds-show';
        //     }
        //     else if(y=='slds-show')
        //     {
        //         //this.template.querySelector('[data-id="cib-read"]').className ='slds-hide';
        //     }
        // }
        // else
        // {
        //      if(y=='cib-unread')
        //     {
        //         this.template.querySelector('[data-id="'+x+'"]').className ='cib-read';
        //     }
        //     else if(y=='cib-current')
        //     {
        //         this.template.querySelector('[data-id="'+x+'"]').className ='cib-read';
        //     }
        //     else if(y=='cib-unread')
        //     {
        //    this.template.querySelector('[data-id="'+x+'"]').className ='cib-read';
        //    this.template.querySelector('[data-id="'+x+'"]').className ='cib-current';

        //      }
        // }
        // let buttonId = event.target.dataset.id;

        // // Remove cib-current class from all buttons
        // const buttons = this.template.querySelectorAll('[data-id^="cib-button"]');
        // console.log(buttons);
        // buttons.forEach(button => {
        //     button.classList.remove('cib-current');
        // });
        // event.target.classList.add('cib-current');

        // // Remove cib-read and cib-unread classes from all buttons
        // buttons.forEach(button => {
        //     button.classList.remove('cib-read', 'cib-unread');
        // });
        // buttons.forEach(button => {
        //     if (button.dataset.id !== buttonId) {
        //         button.classList.add('cib-read');
        //     }
        // });
        // const containers = this.template.querySelectorAll('[data-id^="cib-rightsec"]');
        // containers.forEach(container => {
        //     container.classList.remove('slds-show');
        // });
        // buttonId = buttonId + '';
        // const containerId = buttonId.replace('cib-button', 'cib-rightsec');
        // console.log('containerId', containerId);
        // containers.forEach(container => {
        //     container.classList.add('slds-hide');
        // });
        // // Add slds-hide class to all containers except the corresponding container
        // containers.forEach(container => {
        //     if (container.dataset.id !== containerId) {
        //         container.classList.add('slds-show');
        //         //container.classList.add('slds-show');
        //         this.template.querySelector(containerId).classList.add('slds-show');
        //     }
        // });


    }
    handleChange(event) {
        this.value = event.detail.value;
    }
    start = 0;
    end = 0;
    selectMode = 'select';

    handleLeftButtonClick(event) {
        var cibtype = this.template.querySelector('[data-id="cibtype"]');
        cibtype.classList.toggle('cibshowleft');
    }
    handleRightButtonClick(event) {
        var cibtype = this.template.querySelector('[data-id="cibdisc"]');
        cibtype.classList.toggle('cibshowright');
    }

    @track childRecords = [];
    @track childRecords2 = [];
    connectedCallback() {
        this.spin = true;
        this.relatedListRecords = [];
        getRecordsForInbox({}).then(result => {
            this.relatedListRecords = JSON.parse(JSON.stringify(result));
            for (var i = 0; i < this.relatedListRecords.length; i++) {
                this.relatedListRecords[i].unreadCount = 0;
                if (this.relatedListRecords[i].Supplier_Tasks__r) {
                    for (var j = 0; j < this.relatedListRecords[i].Supplier_Tasks__r.length; j++) {
                        this.relatedListRecords[i].Supplier_Tasks__r[j].classList = "cib-unread";
                    }
                    this.relatedListRecords[i].unreadCount = this.relatedListRecords[i].Supplier_Tasks__r.length;
                }
                console.log('Data1' + ' ' + this.relatedListRecords[i].Name, this.relatedListRecords);
                this.relatedListRecords[i].classList = "cib-mtype items";
                this.relatedListRecords[i].totalCount = this.relatedListRecords[i].unreadCount;
            }
            console.log('Data2', this.relatedListRecords);
            this.relatedListRecords[0].classList = "cib-mtype items active";
            this.childRecords = this.relatedListRecords[0].Supplier_Tasks__r;
            this.childRecords2 = this.childRecords;
            console.log('Data3', this.relatedListRecords);
            this.spin = false;
        }).catch(error => {
            console.log('Error', JSON.stringify(error));
        });

    }
    showDataHandler(event) {
        var id = event.currentTarget.dataset.id;
        this.activeCategory = event.currentTarget.dataset.id;
        console.log('RecData', this.relatedListRecords);
        this.dynamicData = false;
        if (event.currentTarget.dataset.id.toString() === this.assessmentId.toString()) {
            this.dynamicData = true;
        }
        for (var i = 0; i < this.relatedListRecords.length; i++) {
            this.relatedListRecords[i].classList = this.relatedListRecords[i].classList.replaceAll('active', '');
            if (this.relatedListRecords[i].Id.toString() === id.toString()) {
                this.relatedListRecords[i].classList += ' active';
                if (this.relatedListRecords[i].Supplier_Tasks__r) {
                    this.childRecords = this.relatedListRecords[i].Supplier_Tasks__r;
                    for (var j = 0; j < this.childRecords.length; j++) {
                        this.childRecords[j].classList = 'cib-unread';
                    }
                    this.childRecords2 = this.childRecords;
                }
                else {
                    this.childRecords = undefined;
                    this.childRecords2 = this.childRecords;
                }
            }
        }
        console.log(this.relatedListRecords);
        console.log(this.childRecords);
        // var objectName = event.currentTarget.dataset.id;
        // var eleList=this.template.querySelectorAll('.items');
        // for(var i=0;i<eleList.length;i++)
        // {
        //     if(eleList[i].dataset.id!=objectName)
        //         eleList[i].className=eleList[i].className.replaceAll('active','');
        // }
        // this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className=this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className+' active';
        // // var items=['Task','Alert__c','Incidents__c'];
        // // this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className=this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className+' active';
        // // for(var i=0;i<items.length;i++)
        // // {
        // //     if(items[i]!=objectName)
        // //         this.template.querySelectorAll('[data-id="'+items[i]+'"]')[0].className=this.template.querySelectorAll('[data-id="'+items[i]+'"]')[0].className.replaceAll('active','');
        // // }
        // if (objectName === 'Task') {
        //     this.spin=true;
        //     this.relatedListRecords=[];
        //     this.show.Alert__c=false;
        //     this.show.Incidents__c=false;
        //     this.show.Task=true;
        //     getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
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
        //         this.displayFields=[{label:'Subject',fieldName:'Subject'},{label:'ProjectName',fieldName:'ProjectName'}];
        //         this.relatedListRecords_copy=this.relatedListRecords;
        //         this.rec=this.relatedListRecords[0];
        //         this.spin=false;
        //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
        //     }).catch(error => {
        //         this.error = error;
        //         console.log('Task Error', this.error);
        //     });
        // }
        // else if (objectName === 'Alert__c') {
        //     this.spin=true;
        //     this.relatedListRecords=[];
        //     this.show.Task=false;
        //     this.show.Incidents__c=false;
        //     this.show.Alert__c=true;
        //     getAlertRelatedRecords({ vendorId: this.vendorId }).then(result => {
        //         this.relatedListRecords = JSON.parse(JSON.stringify(result));
        //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
        //         for (var i = 0; i < this.relatedListRecords.length; i++) {
        //             if(this.relatedListRecords[i].Work_Orders__r)
        //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
        //             else
        //                 this.relatedListRecords[i].ProjectName = "";
        //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
        //             this.relatedListRecords[i].classNamesList = 'cib-unread';
        //             this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
        //         }
        //         this.displayFields=[{label:'Name',fieldName:'Name'},{label:'ProjectName',fieldName:'ProjectName'}];
        //         this.relatedListRecords_copy=this.relatedListRecords;
        //         this.rec=this.relatedListRecords[0];
        //         this.spin=false;
        //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
        //     }).catch(error => {
        //         this.error = error;
        //         console.log('Alerts__c Error', this.error);
        //     });
        // }
        // else if (objectName === 'Incidents__c') {
        //     this.spin=true;
        //     this.relatedListRecords=[];
        //     this.show.Task=false;
        //     this.show.Alert__c=false;
        //     this.show.Incidents__c=true;
        //     getIncidentRelatedRecords({ vendorId: this.vendorId }).then(result => {
        //         this.relatedListRecords = JSON.parse(JSON.stringify(result));
        //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
        //         for (var i = 0; i < this.relatedListRecords.length; i++) {
        //             if(this.relatedListRecords[i].Work_Order_Name__r)
        //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
        //             else
        //                 this.relatedListRecords[i].ProjectName = "";
        //            this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
        //            this.relatedListRecords[i].classNamesList = 'cib-unread';
        //            this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
        //         }
        //         this.displayFields=[{label:'Name',fieldName:'Name'},{label:'ProjectName',fieldName:'ProjectName'}];
        //         this.relatedListRecords_copy=this.relatedListRecords;
        //         this.rec=this.relatedListRecords[0];
        //         this.spin=false;
        //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
        //     }).catch(error => {
        //         this.error = error;
        //         console.log('Incidents__c Error', this.error);
        //     });
        // }
    }

    openChatHandler(event) {
        var id = event.currentTarget.dataset.id;
        this.activeCategory = event.currentTarget.dataset.id;
        console.log('RecData', this.relatedListRecords);
        this.dynamicData = false;
        for (var i = 0; i < this.relatedListRecords.length; i++) {
            this.relatedListRecords[i].classList = this.relatedListRecords[i].classList.replaceAll('active', '');
            if (this.relatedListRecords[i].Id.toString() === id.toString()) {
                this.relatedListRecords[i].classList += ' active';
                if (this.relatedListRecords[i].Supplier_Tasks__r) {
                    this.childRecords = this.relatedListRecords[i].Supplier_Tasks__r;
                    for (var j = 0; j < this.childRecords.length; j++) {
                        this.childRecords[j].classList = 'cib-unread';
                    }
                    this.childRecords2 = this.childRecords;
                }
                else {
                    this.childRecords = undefined;
                    this.childRecords2 = this.childRecords;
                }
            }
        }
        console.log(this.relatedListRecords);
        console.log(this.childRecords);
        //Delete above code
        var recId = event.currentTarget.dataset.id;
        console.log(this.childRecords);
        for (var i = 0; i < this.childRecords.length; i++) {
            if (this.childRecords[i].Id.toString() === recId.toString()) {
                this.childRecords[i].classList = 'cib-read';
                for (var i = 0; i < this.relatedListRecords.length; i++) {
                    if (this.relatedListRecords[i].Supplier_Tasks__r) {
                        for (var j = 0; j < this.relatedListRecords[i].Supplier_Tasks__r.length; j++) {
                            if (this.relatedListRecords[i].Supplier_Tasks__r[j].Id === recId && this.relatedListRecords[i].unreadCount > 0) {
                                this.relatedListRecords[i].unreadCount -= 1;
                                if (typeof this.relatedListRecords[i].Supplier_Tasks__r[j].Assessment__c != 'undefined' && this.relatedListRecords[i].Supplier_Tasks__r[j].Assessment__c != 'null') {
                                    var supAssmntId = this.relatedListRecords[i].Supplier_Tasks__r[j].Assessment__c;
                                    const opentask = new CustomEvent('opentask', {
                                        detail: {
                                            categoryId: this.activeCategory,
                                            taskId: recId,
                                            assessmentId: supAssmntId,
                                            category: "Assessments"
                                        }
                                    });
                                    this.dispatchEvent(opentask);
                                }
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
        var cibtype = this.template.querySelector('[data-id="cibdisc"]');
        cibtype.classList.toggle('cibshowright');
    }

    searchInputChangeHandler(event) {
        var childRecords_copy = this.childRecords2;
        this.childRecords = [];
        var fields = ['CreatedDate', 'Name', 'Description__c'];
        var search = event.target.value;
        for (var i = 0; i < childRecords_copy.length; i++) {
            for (var j = 0; j < fields.length; j++) {
                if (childRecords_copy[i][fields[j]].toLowerCase().includes(search.toLowerCase())) {
                    this.childRecords.push(childRecords_copy[i]);
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









// import { LightningElement, track, api } from 'lwc';
// import getTaskRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getTaskRelatedRecords';
// import getAlertRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getAlertRelatedRecords';
// import getIncidentRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getIncidentRelatedRecords';
// import getinboxandsuppliertaskslist from '@salesforce/apex/rtmvpcRelatedListsController.getinboxandsuppliertaskslist';
// import getSupplierTask from '@salesforce/apex/rtmvpcRelatedListsController.getSupplierTask';
// export default class RtmvpcInbox extends LightningElement {
//     value = 'new';
//     @api vendorId = 'a14DE00000CRco1YAD';
//     @track relatedListRecords = [];
//     @track parentListRecords = [];
//     @track relatedListRecords_copy = [];
//     @track displayFields=[];
//     @track error;
//     @track rec={};
//     @track show={'Task':true,'Supplier_Inbox_Categ__c':false,'Supplier_Task__c':false};
//     @track spin;

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
//         console.log('cibtype'+cibtype);
//         cibtype.classList.toggle('cibshowleft');
//     }
//     handleRightButtonClick(event) {
//         var cibtype = this.template.querySelector('[data-id="cibdisc"]');
//         cibtype.classList.toggle('cibshowright');
//     }

//     connectedCallback() {
//         this.spin=true;
//         this.parentListRecords=[];
//         console.log('Connected Call Back');
//         console.log('RecordId:'+this.recordId);




//           getinboxandsuppliertaskslist().then(result =>{
//                  this.parentListRecords = JSON.parse(JSON.stringify(result));
//                  for(var i = 0; i < this.parentListRecords.length; i++){
//                      console.log('this.relatedListRecords[i].Description__C'+ this.parentListRecords[i].Description__C);

//                     this.parentListRecords[i].Id = this.parentListRecords[i].Id;
//                     this.parentListRecords[i].Name = this.parentListRecords[i].Name;
//                     //this.parentListRecords[i].Description = this.parentListRecords[i].Description__C;
//                     this.parentListRecords[i].Count = this.parentListRecords[i].Count;
//     //                     this.relatedListRecords[i].ProjectName = "";
//     //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //             }
//                 //this.displayFields=[{label:'Subject',fieldName:'Name'},{label:'Name',fieldName:'Name'}];
//                 // this.relatedListRecords_copy=this.relatedListRecords;
//                 // this.rec=this.relatedListRecords[0];
//                 this.spin=false;

//                  }
//              })

//         // getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
//         //         this.relatedListRecords = JSON.parse(JSON.stringify(result));
//         //         for (var i = 0; i < this.relatedListRecords.length; i++) {
//         //             if(this.relatedListRecords[i].What)
//         //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].What.Name;
//         //             else
//         //                 this.relatedListRecords[i].ProjectName = "";
//         //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//         //             this.relatedListRecords[i].classNamesList = 'cib-unread';
//         //             this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//         //         }
//         //         this.displayFields=[{label:'Subject',fieldName:'Subject'},{label:'ProjectName',fieldName:'ProjectName'}]
//         //         this.relatedListRecords_copy=this.relatedListRecords;
//         //         this.rec=this.relatedListRecords[0];
//         //         this.spin=false;
//         //         console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//         //     }).catch(error => {
//         //         this.error = error;
//         //         console.log('Error', this.error);
//         //     })
//     }
//     showDataHandler(event) {

//       console.log('event:'+event);
//     //   if(this.show.PROJECTS===false && this.show.COMPLIANCE===false && this.show.ASSESSMENTS===false && this.show.RFPs===false && this.CONTRACTS ===false ){
//     //  this.show.GENERAL_ANNOUNCEMENTS=true;
//     //  this.spin=true;
//     //  console.log('this.show==>'+ JSON.stringify(this.show));
//     //   }
//         // else if(this.show.GENERAL_ANNOUNCEMENTS===false && this.show.COMPLIANCE===false && this.show.ASSESSMENTS===false && this.show.RFPs===false && this.CONTRACTS ===false){
//         //   this.show.PROJECTS = true;
//         //   console.log('this.show2==>'+ JSON.stringify(this.show));

//         // }
//         // else if (this.show.GENERAL_ANNOUNCEMENTS===false && this.show.PROJECTS===false && this.show.ASSESSMENTS===false && this.show.RFPs===false && this.CONTRACTS ===false){
//         //  this.COMPLIANCE=true;
//         // }


// this.relatedListRecords=[];
//         var parentId = event.currentTarget.dataset.id;

//         getSupplierTask({recordId:parentId}).then(result =>{
//             console.log('result'+result);
//                  this.relatedListRecords = JSON.parse(JSON.stringify(result));
//                  for(var i = 0; i < this.relatedListRecords.length; i++){
//                      console.log('this.relatedListRecords[i].Description__C'+ this.relatedListRecords[i].Description__c);   
//                     this.relatedListRecords[i].Id = this.relatedListRecords[i].Id;
//                     this.relatedListRecords[i].Name = this.relatedListRecords[i].Name;
//                     this.relatedListRecords[i].Description = this.relatedListRecords[i].Description__c;
//     //                     this.relatedListRecords[i].ProjectName = "";
//     //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //             }
//                 //this.displayFields=[{label:'Subject',fieldName:'Name'},{label:'Name',fieldName:'Name'}];
//                 // this.relatedListRecords_copy=this.relatedListRecords;
//                 // this.rec=this.relatedListRecords[0];
//                 this.spin=false;

//                  }
//              })

//     //     console.log('objectName'+objectName);
//     //     var eleList=this.template.querySelectorAll('.items');
//     //     console.log('eleList==>'+JSON.stringify(eleList));
//     //     for(var i=0;i<eleList.length;i++)
//     //     {
//     //         if(eleList[i].dataset.id!=objectName)
//     //             eleList[i].className=eleList[i].className.replaceAll('active','');
//     //     }
//     //     this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className=this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className+' active';
//     //      var items=['Supplier_Inbox_Categ__c','Supplier_Task__c','Incidents__c'];
//     //      this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className=this.template.querySelectorAll('[data-id="'+objectName+'"]')[0].className+' active';
//     //      for(var i=0;i<items.length;i++)
//     //      {
//     //         if(items[i]!=objectName)
//     //             this.template.querySelectorAll('[data-id="'+items[i]+'"]')[0].className=this.template.querySelectorAll('[data-id="'+items[i]+'"]')[0].className.replaceAll('active','');
//     //      }
//     //      if(objectName === 'Supplier_Inbox_Categ__c')
//     //      {
//     //          this.spin=true;
//     //          this.Supplier_Task__c = false;
//     //          this.Supplier_Inbox_Categ__c = true;
//     //          this.relatedListRecords=[];
//     //          getinboxandsuppliertaskslist({recordId:this.recordId}).then(result =>{
//     //              this.relatedListRecords = JSON.parse(JSON.stringify(result));
//     //              for(var i = 0; i < this.relatedListRecords.length; i++){
//     //                  console.log(this.relatedListRecords[i].Name);
//     //                  //console.log(this.relatedListRecords[i].Id);

//     //                 //this.relatedListRecords[i].Id = this.relatedListRecords[i].Id;
//     //                 this.relatedListRecords[i].Name = this.relatedListRecords[i].Name;
//     // //                     this.relatedListRecords[i].ProjectName = "";
//     // //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     // //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
//     // //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//     // //             }
//     //             this.displayFields=[{label:'Subject',fieldName:'Name'},{label:'Name',fieldName:'Name'}];
//     //             this.relatedListRecords_copy=this.relatedListRecords;
//     //             this.rec=this.relatedListRecords[0];
//     //             this.spin=false;

//     //              }
//     //          })

//     //      }
//     }
//     //     if (objectName === 'Task') {
//     //         this.spin=true;
//     //         this.relatedListRecords=[];
//     //         this.show.Alert__c=false;
//     //         this.show.Incidents__c=false;
//     //         this.show.Task=true;
//     //         getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
//     //             this.relatedListRecords = JSON.parse(JSON.stringify(result));
//     //             for (var i = 0; i < this.relatedListRecords.length; i++) {
//     //                 if(this.relatedListRecords[i].What)
//     //                     this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].What.Name;
//     //                 else
//     //                     this.relatedListRecords[i].ProjectName = "";
//     //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //             }
//     //             this.displayFields=[{label:'Subject',fieldName:'Subject'},{label:'ProjectName',fieldName:'ProjectName'}];
//     //             this.relatedListRecords_copy=this.relatedListRecords;
//     //             this.rec=this.relatedListRecords[0];
//     //             this.spin=false;
//     //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //         }).catch(error => {
//     //             this.error = error;
//     //             console.log('Task Error', this.error);
//     //         });
//     //     }
//     //     else if (objectName === 'Alert__c') {
//     //         this.spin=true;
//     //         this.relatedListRecords=[];
//     //         this.show.Task=false;
//     //         this.show.Incidents__c=false;
//     //         this.show.Alert__c=true;
//     //         getAlertRelatedRecords({ vendorId: this.vendorId }).then(result => {
//     //             this.relatedListRecords = JSON.parse(JSON.stringify(result));
//     //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //             for (var i = 0; i < this.relatedListRecords.length; i++) {
//     //                 if(this.relatedListRecords[i].Work_Orders__r)
//     //                     this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
//     //                 else
//     //                     this.relatedListRecords[i].ProjectName = "";
//     //                 this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //                 this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //                 this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //             }
//     //             this.displayFields=[{label:'Name',fieldName:'Name'},{label:'ProjectName',fieldName:'ProjectName'}];
//     //             this.relatedListRecords_copy=this.relatedListRecords;
//     //             this.rec=this.relatedListRecords[0];
//     //             this.spin=false;
//     //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //         }).catch(error => {
//     //             this.error = error;
//     //             console.log('Alerts__c Error', this.error);
//     //         });
//     //     }
//     //     else if (objectName === 'Incidents__c') {
//     //         this.spin=true;
//     //         this.relatedListRecords=[];
//     //         this.show.Task=false;
//     //         this.show.Alert__c=false;
//     //         this.show.Incidents__c=true;
//     //         getIncidentRelatedRecords({ vendorId: this.vendorId }).then(result => {
//     //             this.relatedListRecords = JSON.parse(JSON.stringify(result));
//     //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //             for (var i = 0; i < this.relatedListRecords.length; i++) {
//     //                 if(this.relatedListRecords[i].Work_Order_Name__r)
//     //                     this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
//     //                 else
//     //                     this.relatedListRecords[i].ProjectName = "";
//     //                this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
//     //                this.relatedListRecords[i].classNamesList = 'cib-unread';
//     //                this.relatedListRecords[i].CreatedDate=this.relatedListRecords[i].CreatedDate.split('T')[0];
//     //             }
//     //             this.displayFields=[{label:'Name',fieldName:'Name'},{label:'ProjectName',fieldName:'ProjectName'}];
//     //             this.relatedListRecords_copy=this.relatedListRecords;
//     //             this.rec=this.relatedListRecords[0];
//     //             this.spin=false;
//     //             //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
//     //         }).catch(error => {
//     //             this.error = error;
//     //             console.log('Incidents__c Error', this.error);
//     //         });
//     //     }
//     // }

//     openChatHandler(event)
//     {
//         var recId=event.currentTarget.dataset.id;
//         for(var i=0;i<this.relatedListRecords.length;i++)
//         {
//             if(this.relatedListRecords[i].Id===recId)
//             {
//                 this.rec=this.relatedListRecords[i];
//                 this.relatedListRecords[i].classNamesList = 'cib-read';
//             }
//         }
//     }

//     searchInputChangeHandler(event)
//     {
//         this.relatedListRecords=[];
//         var search=event.target.value;
//         for(var i=0;i<this.relatedListRecords_copy.length;i++)
//         {
//             for(var j=0;j<this.displayFields.length;j++)
//             {
//                 if(JSON.stringify(this.relatedListRecords_copy[i][this.displayFields[j].fieldName]).toLowerCase().includes(search.toLowerCase()))
//                 {
//                     this.relatedListRecords.push(this.relatedListRecords_copy[i]);
//                     break;
//                 }
//             }
//         }
//     }
// }



// // import { LightningElement, track, api, wire } from 'lwc';
// // import getTaskRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getTaskRelatedRecords';
// // import getAlertRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getAlertRelatedRecords';
// // import getIncidentRelatedRecords from '@salesforce/apex/rtmvpcRelatedListsController.getIncidentRelatedRecords';
// // export default class RtmvpcInbox extends LightningElement {
// //     value = 'new';
// //     @api vendorId = 'a0h5i000004oqZEAAY';
// //     @track relatedListRecords = [];
// //     @track relatedListRecords_copy = [];
// //     @track displayFields = [];
// //     @track error;
// //     @track rec = {};
// //     @track show = { 'Task': true, 'Alert__c': false, 'Incidents__c': false };
// //     @track spin;
// //     relatedRecordsJson = {};

// //     get options() {
// //         return [
// //             { label: 'Newest', value: 'new' },
// //             { label: 'Oldest', value: 'old' },
// //         ];
// //     }

// //     handleChange(event) {
// //         this.value = event.detail.value;
// //     }
// //     start = 0;
// //     end = 0;
// //     selectMode = 'select';

// //     handleLeftButtonClick(event) {
// //         var cibtype = this.template.querySelector('[data-id="cibtype"]');
// //         cibtype.classList.toggle('cibshowleft');
// //     }
// //     handleRightButtonClick(event) {
// //         var cibtype = this.template.querySelector('[data-id="cibdisc"]');
// //         cibtype.classList.toggle('cibshowright');
// //     }


// //     @wire(getTaskRelatedRecords, { vendorId: '$vendorId' })
// //     getTaskRelatedRecords_wiredData({ error, data }) {
// //         if (data) {
// //             var resultRec = data;
// //             for (var i = 0; i < resultRec.length; i++) {
// //                 if (resultRec[i].What)
// //                     resultRec[i]["ProjectName"] = resultRec[i].What.Name;
// //                 else
// //                     resultRec[i].ProjectName = "";
// //                 resultRec[i].OwnerName = resultRec[i].Owner.Name;
// //                 resultRec[i].classNamesList = 'cib-unread';
// //                 resultRec[i].CreatedDate = resultRec[i].CreatedDate.split('T')[0];
// //             }
// //             this.relatedRecordsJson.Task=resultRec;
// //             this.relatedRecordsJson.displayFields=[{ label: 'Subject', fieldName: 'Subject' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
// //             // this.displayFields = [{ label: 'Subject', fieldName: 'Subject' }, { label: 'ProjectName', fieldName: 'ProjectName' }]
// //             // this.relatedListRecords_copy = this.relatedListRecords;
// //             // this.rec = this.relatedListRecords[0];
// //             // this.spin = false;
// //         } else if (error) {
// //             console.error('Error:', error);
// //         }
// //     }
// //     // @wire(getAlertRelatedRecords, { vendorId: '$vendorId' })
// //     // getAlertRelatedRecords_wiredData({ error, data }) {
// //     //     if (data) {
// //     //         this.relatedListRecords = JSON.parse(JSON.stringify(result));
// //     //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //     //         for (var i = 0; i < this.relatedListRecords.length; i++) {
// //     //             if (this.relatedListRecords[i].Work_Orders__r)
// //     //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
// //     //             else
// //     //                 this.relatedListRecords[i].ProjectName = "";
// //     //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
// //     //             this.relatedListRecords[i].classNamesList = 'cib-unread';
// //     //             this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
// //     //         }
// //     //         this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
// //     //         this.relatedListRecords_copy = this.relatedListRecords;
// //     //         this.rec = this.relatedListRecords[0];
// //     //         this.spin = false;
// //     //     } else if (error) {
// //     //         console.error('Error:', error);
// //     //     }
// //     // }
// //     // @wire(getIncidentRelatedRecords, { vendorId: '$vendorId' })
// //     // getIncidentRelatedRecords_wiredData({ error, data }) {
// //     //     if (data) {
// //     //         this.relatedListRecords = result;
// //     //         //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //     //         for (var i = 0; i < this.relatedListRecords.length; i++) {
// //     //             if (this.relatedListRecords[i].Work_Order_Name__r)
// //     //                 this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
// //     //             else
// //     //                 this.relatedListRecords[i].ProjectName = "";
// //     //             this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
// //     //             this.relatedListRecords[i].classNamesList = 'cib-unread';
// //     //             this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
// //     //         }
// //     //         this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
// //     //         this.relatedListRecords_copy = this.relatedListRecords;
// //     //         this.rec = this.relatedListRecords[0];
// //     //         this.spin = false;
// //     //     } else if (error) {
// //     //         console.error('Error:', error);
// //     //     }
// //     // }

// //     connectedCallback() {
// //         this.spin=true;
// //         this.relatedListRecords=this.relatedRecordsJson.Task;
// //         this.spin=false;
// //     }
// //     showDataHandler(event) {
// //         var objectName = event.currentTarget.dataset.id;
// //         if (objectName === 'Task') {
// //             this.spin = true;
// //             this.relatedListRecords = [];
// //             this.show.Alert__c = false;
// //             this.show.Incidents__c = false;
// //             this.show.Task = true;
// //             getTaskRelatedRecords({ vendorId: this.vendorId }).then(result => {
// //                 this.relatedListRecords = result;
// //                 for (var i = 0; i < this.relatedListRecords.length; i++) {
// //                     if (this.relatedListRecords[i].What)
// //                         this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].What.Name;
// //                     else
// //                         this.relatedListRecords[i].ProjectName = "";
// //                     this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
// //                     this.relatedListRecords[i].classNamesList = 'cib-unread';
// //                     this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
// //                 }
// //                 this.displayFields = [{ label: 'Subject', fieldName: 'Subject' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
// //                 this.relatedListRecords_copy = this.relatedListRecords;
// //                 this.rec = this.relatedListRecords[0];
// //                 this.spin = false;
// //                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //             }).catch(error => {
// //                 this.error = error;
// //                 console.log('Task Error', this.error);
// //             });
// //         }
// //         else if (objectName === 'Alert__c') {
// //             this.spin = true;
// //             this.relatedListRecords = [];
// //             this.show.Task = false;
// //             this.show.Incidents__c = false;
// //             this.show.Alert__c = true;
// //             getAlertRelatedRecords({ vendorId: this.vendorId }).then(result => {
// //                 this.relatedListRecords = JSON.parse(JSON.stringify(result));
// //                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //                 for (var i = 0; i < this.relatedListRecords.length; i++) {
// //                     if (this.relatedListRecords[i].Work_Orders__r)
// //                         this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Orders__r.Name;
// //                     else
// //                         this.relatedListRecords[i].ProjectName = "";
// //                     this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
// //                     this.relatedListRecords[i].classNamesList = 'cib-unread';
// //                     this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
// //                 }
// //                 this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
// //                 this.relatedListRecords_copy = this.relatedListRecords;
// //                 this.rec = this.relatedListRecords[0];
// //                 this.spin = false;
// //                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //             }).catch(error => {
// //                 this.error = error;
// //                 console.log('Alerts__c Error', this.error);
// //             });
// //         }
// //         else if (objectName === 'Incidents__c') {
// //             this.spin = true;
// //             this.relatedListRecords = [];
// //             this.show.Task = false;
// //             this.show.Alert__c = false;
// //             this.show.Incidents__c = true;
// //             getIncidentRelatedRecords({ vendorId: this.vendorId }).then(result => {
// //                 this.relatedListRecords = result;
// //                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //                 for (var i = 0; i < this.relatedListRecords.length; i++) {
// //                     if (this.relatedListRecords[i].Work_Order_Name__r)
// //                         this.relatedListRecords[i].ProjectName = this.relatedListRecords[i].Work_Order_Name__r.Name;
// //                     else
// //                         this.relatedListRecords[i].ProjectName = "";
// //                     this.relatedListRecords[i].OwnerName = this.relatedListRecords[i].Owner.Name;
// //                     this.relatedListRecords[i].classNamesList = 'cib-unread';
// //                     this.relatedListRecords[i].CreatedDate = this.relatedListRecords[i].CreatedDate.split('T')[0];
// //                 }
// //                 this.displayFields = [{ label: 'Name', fieldName: 'Name' }, { label: 'ProjectName', fieldName: 'ProjectName' }];
// //                 this.relatedListRecords_copy = this.relatedListRecords;
// //                 this.rec = this.relatedListRecords[0];
// //                 this.spin = false;
// //                 //console.log(objectName + ' Data', JSON.stringify(this.relatedListRecords));
// //             }).catch(error => {
// //                 this.error = error;
// //                 console.log('Incidents__c Error', this.error);
// //             });
// //         }
// //     }

// //     openChatHandler(event) {
// //         var recId = event.currentTarget.dataset.id;
// //         for (var i = 0; i < this.relatedListRecords.length; i++) {
// //             if (this.relatedListRecords[i].Id === recId) {
// //                 this.rec = this.relatedListRecords[i];
// //                 this.relatedListRecords[i].classNamesList = 'cib-read';
// //             }
// //         }
// //     }

// //     searchInputChangeHandler(event) {
// //         //this.relatedListRecords_copy=this.relatedListRecords;
// //         this.relatedListRecords = [];
// //         var search = event.target.value;
// //         for (var i = 0; i < this.relatedListRecords_copy.length; i++) {
// //             for (var j = 0; j < this.displayFields.length; j++) {
// //                 if (JSON.stringify(this.relatedListRecords_copy[i][this.displayFields[j].fieldName]).toLowerCase().includes(search.toLowerCase())) {
// //                     this.relatedListRecords.push(this.relatedListRecords_copy[i]);
// //                     break;
// //                 }
// //             }
// //         }
// //     }
// // }