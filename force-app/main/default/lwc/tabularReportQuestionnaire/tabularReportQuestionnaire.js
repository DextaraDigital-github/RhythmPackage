/* 
* Component Name    : TabularReportQuestionnaire
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : This component is used for loading the Sections template based on the sections
* Last Modified Date: 
*/
import { LightningElement, api, track, wire } from 'lwc';
import getQuestionsList from '@salesforce/apex/AssessmentController.getQuestionsList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import { NavigationMixin } from 'lightning/navigation';
export default class TabularReportQuestionnaire extends NavigationMixin(LightningElement) {
    @api recordId;
    @track savedResponseMap = new Map();
    @track responseMap = new Map();
    @api assessment; //record if of an Assessment__c
    @track finalSection = [];
    @api showNextButton;

    connectedCallback() {
        this.showNextButton = JSON.parse(this.showNextButton);
        var assessmentTemplateId;
        console.log('this.assessment',this.assessment);
        /*getSupplierAssessmentList is used to get all the assessment related to 
        particular account */
        getSupplierAssessmentList({ assessmentId: this.assessment }).then(result => {
            console.log('result',result);
            assessmentTemplateId = result[0].Rhythm__Template__c;
            console.log('assessmentTemplateId',assessmentTemplateId);
            /*getQuestionsList is used to get all the Questions related to particular sections related to particular assessment */
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                console.log('getQuestionsList',result);
                /*getQuestionsList is used to get all the Responses for a question related to particular sections and particular assessment */
                getSupplierResponseList({ assessmentId: this.assessment }).then(result => {
                    console.log('result',result);
                    result.forEach(qres => {
                        console.log('qres',qres);
                        if(typeof qres != 'undefined' && typeof qres.Rhythm__Response__c != 'undefined')
                        this.savedResponseMap.set(qres.Rhythm__Question__c, { "Response__c": qres.Rhythm__Response__c, "Flag__c": qres.Rhythm__Flag__c });
                    console.log('qres',qres);
                    });
                    
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                    console.log('final section', this.finalSection);
                }).catch(error => {
                    console.log('getSupplierResponseList Error' + error);
                })
            }).catch(error => {
                console.log('getQuestionsList Error' + error);
            })
        }).catch(error => {
            console.log('getSupplierAssessmentList Error' + error);
        })
    }
    /* constructWrapper is used to construct the wrapper for 
    each and every sections based on assessment*/
    constructWrapper(questionResp, savedResp) {
        var questionMap = new Map();
        var sectionMap = [];
        console.log('questionResp',questionResp);
        questionResp.forEach(qu => {
            console.log('qu',qu);
            var quTemp = {};
            quTemp.question = qu.Rhythm__Question__c;

            // console.log(qu);
            // if(qu.lastModifiedDate!=undefined)
            // {
            //     quTemp.Modifieddate = qu.lastModifiedDate;
            //     var x = quTemp.Modifieddate.split('T')[0];
            //     var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            //     quTemp.Modifieddate = months[Number(x.split('-')[1]) - 1] + '-' + x.split('-')[2] + '-' + x.split('-')[0];
            //     console.log('quTemp.Modifieddate'+ JSON.stringify(quTemp.Modifieddate));
            //     quTemp.Accessedby = qu.lastModifiedBy;
            //     console.log(' quTemp.Accessedby'+ JSON.stringify( quTemp.Accessedby));
            //     questionMap.set('lastModifiedDate', quTemp.Modifieddate);
            //     console.log('questionMapSet', questionMap);
            //     questionMap.set('Accessedby', quTemp.Accessedby);
            // }

            if(savedResp.get(quTemp.question))
            quTemp.value = savedResp.get(quTemp.question).Rhythm__Response__c;
            if(savedResp.get(quTemp.question))
            quTemp.flag = savedResp.get(quTemp.question).Rhythm__Flag__c;
            if (questionMap.has(qu.Rhythm__Section__r.Name)) {
                questionMap.get(qu.Rhythm__Section__r.Name).push(quTemp);
            } else {
                var quesList = [];
                console.log('quTemp',quTemp);
                quesList.push(quTemp);
                questionMap.set(qu.Rhythm__Section__r, quesList);
            }
        });
        var sectioncount = 0;
        var sectionname=[];
        for (const key of questionMap.keys()) {
            var secTemp = {};
            if(!sectionname.includes(key.Name))
            {
            sectionname.push(key.Name);
            secTemp.section = key;
            var count = 0;
            var count_flag = 0;
            for (var i = 0; i < questionMap.get(key).length; i++) {
                count = 0;
                if (questionMap.get(key)[i].value) {
                    count++;
                }
                if (questionMap.get(key)[i].flag===true) {
                    count_flag++;
                }
            }
            if (count_flag > 0)
                secTemp.flagSymbol = "action:priority";
            secTemp.Responses = count + '/' + questionMap.get(key).length;
            secTemp.Percentage = (count * 100 / questionMap.get(key).length).toString().split('.')[0] + '%';
            secTemp.Attachments = 0;
            secTemp.Review = '-';
            secTemp.Comments = '-';
            sectioncount += 1;
            sectionMap.push(secTemp);
            }
        };
        console.log('sectionMap',sectionMap);
        return sectionMap;

    }
    /* handleclick method is used to get the sectionId and send it 
        to the parent component(rtmvpcAssessmentDetail)*/
    handleclick(event) {
        var selectedevent = new CustomEvent('sectionclick', {
            detail: { sectionId : event.currentTarget.dataset.id }
        });
        this.dispatchEvent(selectedevent);
    }
}
