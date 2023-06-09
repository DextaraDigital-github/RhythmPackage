/* Class Name   : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : AssessmentControllerTest class is used to check the code coverage for AssessmentController
* Last Modified Date: 
*/

@isTest
public class AssessmentControllerTest 
{
@istest
	public static void testgetSupplierAssessmentList()
 {	
        Map<String, Object> accAttributes = new Map<String, Object>{'Name'=>'Test Account',  'NumberOfEmployees'=>'400'};
         List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
		//List<Account> acclist=TestDataFactory.createAccounts(1,true,attributes);
		Map<String, Object> contactAttributes = new Map<String, Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com'};
         List<Contact> contacts = TestDataFactory.createContacts(1,true,contactAttributes);
		//List<Contact> conlist=TestDataFactory.createContacts(1,true,attributes);
		Map<String, Object> assetattributes = new Map<String, Object>{'AccountId'=>accts[0].Id,'Rythm__AccountId__c'=>accts[0].Id};
         List<Asset> assets = TestDataFactory.createAsset(1,true,accts[0].Id,assetattributes);
		//List<Asset> astlist=TestDataFactory.createAsset(1,true,accts[0].id,attributes);
		//
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rythm__Name__c'=>'2023 Assessment template'};
		List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(assementTemplateattributes);
        
         Map<String, Object> projectattributes = new Map<String, Object>{'Rythm__Account__c'=>accts[0].Id,'Rythm__Asset__c'=>assets[0].Id,
             'Rythm__Facility__c'=>accts[0].Id,'Name'=>'AC machine'};
        
		List<Project__c> projlist=TestDataFactory.createProject(accts[0].id,assets[0].id,true,projectattributes);
        Map<String, Object> projectassignmentattributes = new Map<String, Object>{'Rythm__Account__c'=>accts[0].Id,'Rythm__Contact__c'=>contacts[0].Id,
             'Rythm__Project__c'=>projlist[0].Id,'Name'=>'AC machine'};
		List<Project_Assignment__c> Proasslist=TestDataFactory.createProjectassignment(accts[0].id,contacts[0].id,projlist[0].id,null,projectassignmentattributes);
		
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
             'Rythm__Project_Assignment__c'=>Proasslist[0].Id,'Name'=>'Assessment 2023','Rythm__Asset__c'=>assets[0].Id};
        List<Assessment__c> asslist=TestDataFactory.createAssessment(accts[0].id,assets[0].id,templist[0].id,Proasslist[0].id,assessmentattributes);
        
         Map<String, Object> sectionAttributes = new Map<String, Object>{'Rythm__Assessment_Template__c'=>templist[0].Id,
             'Name'=>'Section1'};
		List<Section__c> seclist=TestDataFactory.createSection(sectionAttributes);
        Map<String, Object> QuestionAttributes = new Map<String, Object>{'Rythm__Assessment_Template__c'=>templist[0].Id,'Rythm__Conditional_Response__c'=>'Yes',
            'Rythm__Question__c'=>'What is the feedback for service?','Rythm__Question_Type__c'=>'Picklist','Rythm__Required__c'=>'True',
             'Name'=>'Question1','Rythm__Section__c'=>seclist[0].Id};
		List<Question__c> qstnlist=TestDataFactory.createQuestion(QuestionAttributes);
      
        Map<String, Object> responseAttributes = new Map<String, Object>{'Rythm__Assessment__c'=>asslist[0].Id,'Rythm__Account__c'=>accts[0].Id,
            'Rythm__Question__c'=>qstnlist[0].id,'Rythm__Flag__c'=>true,'Rythm__Name__c'=>'Response1'};
		//List<Rythm__Assessment_Template_Junction__c> atjlist=TestDataFactory.createATJunction(templist[0].id,seclist[0].id,qstnlist[0].id,attributes);
		List<Response__c> resplist=TestDataFactory.createResponse(accts[0].id,asslist[0].id,qstnlist[0].id,responseAttributes);
		AssessmentController.QuestionarieList();
		AssessmentController.getAssessmentList();
		AssessmentController.getSupplierAssessmentList(asslist[0].id);
		AssessmentController.getQuestionsList(templist[0].id);
		AssessmentController.getSupplierResponseList(asslist[0].id);  
		AssessmentController.getQuestionsListSectionList(templist[0].id);
        List<Object> supplierResponseList = new List<Object>();
        Map<String,Object> mp = new Map<String,Object>();
        mp.put('Assessment__c',asslist[0].Id);
        mp.put('Rythm__Question__c',qstnlist[0].id);
        mp.put('Rythm__Vendor__c',accts[0].Id);
        mp.put('Rythm__Response__c',resplist[0].Id);
        supplierResponseList.add(mp);
		//AssessmentController.createSupplierResponse(resplist,accts[0].Id,asslist[0].Id,true);
		AssessmentController.getAssessmentlist(templist[0].id);
		AssessmentController.getAssesmentRecords();
		AssessmentController.getResponseList(asslist[0].id,qstnlist[0].id);
		AssessmentController.getUserName();
		AssessmentController.errorLogRecord('samplecustomtable','sample','samplehandler','list index out of bounds');
     	
		String coversationString='{"Customer":"hi","Supplier":"Hello"}';
		AssessmentController.saveChatterResponse(coversationString,asslist[0].id,qstnlist[0].id);
        AssessmentController.createSupplierResponse(resplist,accts[0].Id,asslist[0].Id,true);
        string fileBlob='image/png;base64,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';
        AssessmentController.uploadFile(resplist[0].Id,fileBlob,'sample file',qstnlist[0].id,asslist[0].Id);
        AssessmentController.uploadFile(null,fileBlob,'sample file',qstnlist[0].id,asslist[0].Id);
        AssessmentController.deleteFileAttachment(qstnlist[0].id,'sample file');        
        AssessmentController.QuestionWrapper questionData=new AssessmentController.QuestionWrapper();
        questionData.questionId=qstnlist[0].id;
         questionData.Question='Question 1';
         questionData.Name='Sample';
         questionData.parentQuestion='sample';
        questionData.Type='text';
        questionData.sectionName=(string)sectionAttributes.get('Name');
         questionData.conditionalValue='yes';
         questionData.assessmentTemplate=templist[0].id;
        questionData.optionValueSet='yes';
         questionData.lastModifiedDate=date.newInstance(2023, 06, 08);
         questionData.lastModifiedBy='varma';
         questionData.optionValueSet='yes';
	
    }

}