import { LightningElement, api, track } from 'lwc';
import getInsuranceRecordTypeId from '@salesforce/apex/rtmvpcRelatedListsController.getRecordTypeId';
export default class RtmvpcRecordDetailsView extends LightningElement {

    @api recordId;
    @track uiPageLayoutView;
    @api objectName;
    @api recordType;
    @api isCustomDetailPage;
    @api isCustomDesignPage;
    @api fieldList;
    @api tabsData;
    @api isChildRecordPage;
    @track activeSections;
    @api activeTab;
    @api activeTabtwo;

    connectedCallback() {
        if (this.isCustomDesignPage)
            this.isCustomDesignPage = JSON.parse(this.isCustomDesignPage);

        console.log(this.isCustomDetailPage);

        // console.log('tabsdatachild', this.tabsData);
        //console.log('Redirected');
        //console.log('objectName -- ', this.objectName);
        //console.log('recordType -- ', this.recordType);
        //console.log('recordId -- ', this.recordId);
        console.log('fieldList -- ', this.fieldList);
        //console.log('event.detail.layouts', event.detail);
        console.log(JSON.stringify(this.tabsData));

        var td;
        if (this.tabsData) {
            td = JSON.parse(JSON.stringify(this.tabsData));
        }
        if (td) {
            for (var i = 0; i < td.length; i++) {
                if (td[i].childObjects) {
                    for (var j = 0; j < td[i].childObjects.length; j++) {
                        //console.log('childme', JSON.stringify(td[i].childObjects));
                        if (td[i].childObjects.length < 2) {
                            //console.log('childme2', JSON.stringify(td[i].childObjects[j]));
                            td[i].childObjects[j].hideLabel = false;
                            td[i].childObjects[j].hideLabel = true;
                        }
                    }
                }
            }
        }
        this.tabsData = td;

    }

    handleRecordViewFormLoad(event) {
        this.activeSections = [];
        if (this.objectName == 'Insurance__c') {
            getInsuranceRecordTypeId({ recordId: this.recordId }).then(result => {
                this.recordType = result;
                this.uiPageLayoutView = event.detail.layouts[this.objectName][this.recordType].Full.View;
                // console.log(this.uiPageLayoutView);

                if (this.isCustomDesignPage) {
                    this.activeSections = [Risk_Assessment_Questionnaire, Risk_Assessment_Approval];
                }
                else {
                    for (var i = 0; i < this.uiPageLayoutView.sections.length; i++) {
                        this.activeSections.push(this.uiPageLayoutView.sections[i].heading);
                    }
                }
                console.log('Result===>' + result);

            }).catch(error => {
                console.log('Error' + error);
            })
        }

        //console.log('Redirected');
        //console.log('objectName -- ', this.objectName);
        //console.log('recordType -- ', this.recordType);
        //console.log('recordId -- ', this.recordId);
        //console.log('event.detail.layouts', event.detail);
        // console.log('event.detail.layouts',(event.detail.layouts[this.objectName])[this.selectedRecordType]);
        else {

            this.uiPageLayoutView = event.detail.layouts[this.objectName][this.recordType].Full.View;
            // console.log(this.uiPageLayoutView);

            if (this.isCustomDesignPage) {
                this.activeSections = [Risk_Assessment_Questionnaire, Risk_Assessment_Approval];
            }
            else {
                for (var i = 0; i < this.uiPageLayoutView.sections.length; i++) {
                    this.activeSections.push(this.uiPageLayoutView.sections[i].heading);
                }
            }
        }
    }

    changeRecordPageView(event) {
        var x = event.detail;
        x.activeTab = this.activeTab;
        var goToParentCustomTablePage = new CustomEvent('getdetailpagedetails', {
            detail: x
        });
        console.log('add activetab', goToParentCustomTablePage);
        this.dispatchEvent(goToParentCustomTablePage);
    }

    tabActiveHandler(event) {
        console.log(this.activeTab);
        this.activeTab = event.target.value;

        console.log(this.activeTab);
    }

    renderedCallback() {
        // console.log('child rendered',JSON.stringify(this.tabsData));
        if (this.isCustomDesignPage)
            this.isCustomDesignPage = JSON.parse(this.isCustomDesignPage);
        // = this.activeTabtwo;
        if (this.template.querySelector('lightning-tabset')) {
            this.template.querySelector('lightning-tabset').activeTabValue = this.activeTabtwo;
        }
        // console.log('tabset',JSON.stringify(this.template.querySelectorAll('lightning-tabset')[0]));
    }
}