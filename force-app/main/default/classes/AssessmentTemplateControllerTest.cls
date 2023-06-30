@IsTest
public class AssessmentTemplateControllerTest {
    @testSetup static void setup() {
        Map<String, Object> accAttributes = new Map<String, Object>{'NumberOfEmployees'=>400};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        system.debug('accts '+accts+' '+accts[0].id);
        
        Map<String, Object> contactAttributes = new Map<String, Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com'};
            List<Contact> contacts = TestDataFactory.createContacts(1,true,contactAttributes);
        system.debug('contacts '+contacts);
        
        Map<String, Object> assetattributes = new Map<String, Object>{'AccountId'=>accts[0].Id,'Rhythm__AccountId__c'=>accts[0].Id};
            List<Asset> assets = TestDataFactory.createAsset(1,true,accts[0].Id,assetattributes);
        system.debug('assets '+assets);
        
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Status__c'=>'New'/*,'Rhythm__Name__c'=>'2023 Assessment template'*/};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(assementTemplateattributes);
        system.debug('templist '+templist);        
        
        Map<String, Object> projectattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Asset__c'=>assets[0].Id,
            'Rhythm__Facility__c'=>accts[0].Id,'Name'=>'AC machine'};      
                List<Project__c> projlist=TestDataFactory.createProject(accts[0].id,assets[0].id,true,projectattributes);
        system.debug('projlist '+projlist);
        
        Map<String, Object> projectassignmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Contact__c'=>contacts[0].Id,
            'Rhythm__Project__c'=>projlist[0].Id,'Name'=>'AC machine'};
                List<Project_Assignment__c> Proasslist=TestDataFactory.createProjectassignment(accts[0].id,contacts[0].id,projlist[0].id,null,projectassignmentattributes);
        system.debug('Proasslist '+Proasslist);
        
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
            'Rhythm__Project_Assignment__c'=>Proasslist[0].Id,'Name'=>'Assessment 2023','Rhythm__Asset__c'=>assets[0].Id};
                List<Assessment__c> asslist=TestDataFactory.createAssessment(accts[0].id,assets[0].id,templist[0].id,Proasslist[0].id,assessmentattributes);
        system.debug('asslist '+asslist);
        
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Name'=>'Section1'};
                List<Section__c> seclist=TestDataFactory.createSection(sectionAttributes);
        system.debug('seclist '+seclist);
        
        Map<String, Object> QuestionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Rhythm__Conditional_Response__c'=>'Yes',
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Picklist','Rhythm__Required__c'=>True,
            /* 'Name'=>'Question1',*/'Rhythm__Section__c'=>seclist[0].Id};
                List<Question__c> qstnlist=TestDataFactory.createQuestion(QuestionAttributes);
        system.debug('qstnlist '+qstnlist);
        
        Map<String, Object> responseAttributes = new Map<String, Object>{'Rhythm__Assessment__c'=>asslist[0].Id,'Rhythm__Account__c'=>accts[0].Id,
            'Rhythm__Question__c'=>qstnlist[0].id,'Rhythm__Flag__c'=>true,'Rhythm__Name__c'=>'Response1','Is_Latest_Response__c'=>true,'Files__c'=>'[{"name":"MicrosoftTeams-image (2).png","url":"https://ruby-site-9073-dev-ed.scratch.my.salesforce.com/sfc/servlet.shepherd/document/download/0697i000001548oAAA?operationContext=S1","type":"png"}]'};
                List<Response__c> resplist=TestDataFactory.createResponse(accts[0].id,asslist[0].id,qstnlist[0].id,responseAttributes);
        system.debug('resplist '+resplist); 
    }
    
    @istest
    public static void testgetQuestionsList() {	
        Integer reccount=5;
        List<Assessment_Template__c> templist=[select id from Assessment_Template__c];
        List<Section__c> seclist=[select id from Section__c];
        List<Question__c> qstnlist=[select id from Question__c];
        
        AssessmentTemplateController.getQuestionsLists(templist[0].id);
        AssessmentTemplateController.getRecordsCount(templist[0].id,'Sections');
        AssessmentTemplateController.getRecordsCount(templist[0].id,'Questions');
        AssessmentTemplateController.getTemplateSections(templist[0].id);
        AssessmentTemplateController.updateRecords(seclist);
        AssessmentTemplateController.updateQustnRecords(qstnlist);
        AssessmentTemplateController.getTemplateQuestionList(templist[0].id,reccount);
        AssessmentTemplateController.getSections('Test section',templist[0].id);
        AssessmentTemplateController.getSections('',templist[0].id);
        AssessmentTemplateController.questionsCount(seclist[0].id);
        AssessmentTemplateController.sectionsCount(templist[0].id);
        AssessmentTemplateController.getTemplateDetails(templist[0].id);
    }
    
    @istest
    public static void testgetAssessmentRecord() {
        List<Assessment__c> asslist=[select id from Assessment__c];
        List<Account> accts=[select id from Account];      
        List<id> idlist=new List<id>();
        idlist.add(accts[0].id);
        AssessmentTemplateController.deleteRecords(idlist,true);
        
    }
}