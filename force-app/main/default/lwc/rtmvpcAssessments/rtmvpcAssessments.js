import { LightningElement, api,wire,track } from 'lwc';
import getSupplierAssessmentList from '@salesforce/apex/AssessmentController.getSupplierAssessmentList';
import getSupplierResponseList from '@salesforce/apex/AssessmentController.getSupplierResponseList';
import getAccountId from '@salesforce/apex/AssessmentController.getAccountId';
import getAssessmentJunctionRecords from '@salesforce/apex/AssessmentController.getAssessmentJunctionRecords';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
export default class RtmvpcAssessments extends LightningElement {
    
@api parentId='0017i00001QBzehAAD';
//@track parentId;
@track recList= [];
//@track accId='0017i00001QBzehAAD';
@track accId;
@track pageSize = 15;
@track showgrid= false;
@track showsurvey = false;
@track relName='Rhythm__Assessments__r';
@track fieldsList=[];
@track objName='Rhythm__Assessment__c';
@api tablefieldList =  [
        { label: 'Assessment Name', fieldName: 'Name' },
        { label: 'Target Completion Date', fieldName: 'Rhythm__Target_Completion_Date__c',type:'date' },
        { label: 'Assessment Status', fieldName: 'Rhythm__Status__c'},
        { label: '#Additional Requests',fieldName:'Rhythm__Additional_Requests__c'},
        { label: 'Customer Review Status', fieldName: 'Rhythm__Customer_Review__c'},
        // { label: '# Number of Questions', fieldName:'Rhythm__Number_of_Questions__c'},
        // { label: '# Number of Responses', fieldName:'Rhythm__Number_of_Suppliers_responded_back__c'}
        ];

    connectedCallback(){
        this.fieldsList = [];
        for (let i = 0; i < this.tablefieldList.length; i++) {
            this.fieldsList.push(this.objName + '.' + this.tablefieldList[i].fieldName);
        }
        // getAssessmentJunctionRecords({ accountId: this.accId}).then(result=>{
        //       this.recList = result;
        //       console.log('result',result);
        //     this.showgrid=true;
        //  });
         getAccountId({}).then((result) => {

         this.accId = result;
         this.fetchingRecords();
      });    
        
    }
    fetchingRecords()
    {
        console.log('this.accId',this.accId);
         getAssessmentJunctionRecords({ accountId: this.accId}).then(result=>{
              this.recList = result;
              console.log('result',result);
            this.showgrid=true;
         });
    }
//    @wire(getRelatedListRecords, {
//         parentRecordId: '$parentId',
//         relatedListId: '$relName',
//         fields: '$fieldsList'
//     })
//     getRelatedListRecordsList({ error, data }) {
//         if (data) {
//             console.log('getRelatedListRecordsList',data);
//             this.recList = JSON.parse(JSON.stringify(data.records));
//             this.showgrid=true;
//         }
//         else if (error) {
//             console.log('Wire Related List data', JSON.stringify(error));
//             this.showgrid=true;
//         }
 //   }

    csvClickHandler(event) {
        var x = event.currentTarget.dataset.id;
        getSupplierAssessmentList({ assessmentId: x }).then(result => {
            var assessmentTemplateId = result[0].Assessment_Template__c;
            getQuestionsList({ templateId: assessmentTemplateId }).then(result => {
                var resultMap = result;
                getSupplierResponseList({ assessmentId: x }).then(result => {
                    result.forEach(qres => {
                        this.savedResponseMap.set(qres.Questionnaire__c, qres.Response__c);
                    });
                    this.finalSection = this.constructWrapper(resultMap, this.savedResponseMap);
                    //console.log(this.finalSection);
                    //console.log('Download clicked');
                    var str = 'Question,Answer\n';

                    for (const key of this.finalSection.keys()) {
                        str += 'Section: "' + key + '",""\n';
                        for (var i = 0; i < this.finalSection.get(key).length; i++) {
                            str += '"' + this.finalSection.get(key)[i].question + '","' + this.finalSection.get(key)[i].value + '"\n';
                        }
                    }
                    str = str.replaceAll('undefined', '').replaceAll('null', '');
                    var blob = new Blob([str], { type: 'text/plain' });
                    var url = window.URL.createObjectURL(blob);
                    var atag = document.createElement('a');
                    atag.setAttribute('href', url);
                    atag.setAttribute('download', result[0].Assessment__r.Name + '.csv');
                    atag.click();
                }).catch(error => {
                    //console.log('Error' + error);
                })

            }).catch(error => {
                //console.log('Error' + error);
            })
        }).catch(error => {
            //console.log('Error' + error);
        })
    }

    openSurveyHandler(event)
    {
        this.showsurvey = true;
    }
}