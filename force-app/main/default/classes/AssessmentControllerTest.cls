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
		List<Rythm__Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(assementTemplateattributes);
        
         Map<String, Object> projectattributes = new Map<String, Object>{'Rythm__Account__c'=>accts[0].Id,'Rythm__Asset__c'=>assets[0].Id,
             'Rythm__Facility__c'=>accts[0].Id,'Name'=>'AC machine'};
        
		List<Rythm__Project__c> projlist=TestDataFactory.createProject(accts[0].id,assets[0].id,true,projectattributes);
        Map<String, Object> projectassignmentattributes = new Map<String, Object>{'Rythm__Account__c'=>accts[0].Id,'Rythm__Contact__c'=>contacts[0].Id,
             'Rythm__Project__c'=>projlist[0].Id,'Name'=>'AC machine'};
		List<Rythm__Project_Assignment__c> Proasslist=TestDataFactory.createProjectassignment(accts[0].id,contacts[0].id,projlist[0].id,null,projectassignmentattributes);
		
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rythm__Account__c'=>accts[0].Id,'Rythm__Assessment_Template__c'=>templist[0].Id,
             'Rythm__Project_Assignment__c'=>Proasslist[0].Id,'Name'=>'Assessment 2023','Rythm__Asset__c'=>assets[0].Id};
        List<Rythm__Assessment__c> asslist=TestDataFactory.createAssessment(accts[0].id,assets[0].id,templist[0].id,Proasslist[0].id,assessmentattributes);
        
         Map<String, Object> sectionAttributes = new Map<String, Object>{'Rythm__Assessment_Template__c'=>templist[0].Id,
             'Name'=>'Section1'};
		List<Rythm__Section__c> seclist=TestDataFactory.createSection(sectionAttributes);
        Map<String, Object> QuestionAttributes = new Map<String, Object>{'Rythm__Assessment_Template__c'=>templist[0].Id,'Rythm__Conditional_Response__c'=>'Yes',
            'Rythm__Question__c'=>'What is the feedback for service?','Rythm__Question_Type__c'=>'Picklist','Rythm__Required__c'=>'True',
             'Name'=>'Question1','Rythm__Section__c'=>seclist[0].Id};
		List<Rythm__Question__c> qstnlist=TestDataFactory.createQuestion(QuestionAttributes);
      
        Map<String, Object> responseAttributes = new Map<String, Object>{'Rythm__Assessment__c'=>asslist[0].Id,'Rythm__Account__c'=>accts[0].Id,
            'Rythm__Question__c'=>qstnlist[0].id,'Rythm__Flag__c'=>true,'Rythm__Name__c'=>'Response1'};
		//List<Rythm__Assessment_Template_Junction__c> atjlist=TestDataFactory.createATJunction(templist[0].id,seclist[0].id,qstnlist[0].id,attributes);
		List<Rythm__Response__c> resplist=TestDataFactory.createResponse(accts[0].id,asslist[0].id,qstnlist[0].id,responseAttributes);
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
		
    }

}