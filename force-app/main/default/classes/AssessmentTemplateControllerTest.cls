@IsTest
public class AssessmentTemplateControllerTest {
    @testSetup
    public static void methodName() {
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        System.debug('accts==>'+accts[0].Id);
        Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John'};
            List<Contact> contacts = TestDataFactory.createContacts(1,true,contactAttributes);
        
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        System.debug('templist'+templist[0].Id);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
            List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
        System.debug('seclist'+seclist[0].Id);
        
        Map<String, Object> QuestionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
            'Rhythm__Section__c'=>seclist[0].Id};
                List<Question__c> qstnlist=TestDataFactory.createQuestion(1,true,QuestionAttributes);
        System.debug('qstnlist'+qstnlist[0].Id);
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
                List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
        
        Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
            'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
            'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                List<AccountAssessmentRelation__c> accountasslist=TestDataFactory.createAccountAssessment(1,true,accountassesments);
        System.debug('kkk'+accountasslist);
        
        
        
    }
    @istest
    public static void testgetQuestionsList() {	
        Integer reccount=5;
        List<Rhythm__Assessment_Template__c> templist=[select id from Rhythm__Assessment_Template__c];
        List<Rhythm__Section__c> seclist=[select id,Rhythm__No_of_Questions__c from Rhythm__Section__c];
        List<Rhythm__Question__c> qstnlist=[select id,Rhythm__Section__c from Rhythm__Question__c];
        
        AssessmentTemplateController.getQuestionsLists(templist[0].id);
        AssessmentTemplateController.getRecordsCount(templist[0].id,'Sections');
        AssessmentTemplateController.getRecordsCount(templist[0].id,'Questions');
        AssessmentTemplateController.getTemplateSections(templist[0].id);
        AssessmentTemplateController.updateRecords(seclist);
        AssessmentTemplateController.updateQustnRecords(qstnlist);
        AssessmentTemplateController.getTemplateQuestionList(templist[0].id,reccount);
        AssessmentTemplateController.getSections('\'Test section',templist[0].id);
        AssessmentTemplateController.getSections('',templist[0].id);
        AssessmentTemplateController.questionsCount(seclist[0].id);
        AssessmentTemplateController.sectionsCount(templist[0].id);
        AssessmentTemplateController.getTemplateDetails(templist[0].id);
        templist[0].status__c='Active';
        update templist[0];
        AssessmentTemplateController.getTemplateDetails(templist[0].id);
    }
    
    @istest
    public static void testgetAssessmentRecord() {
       
        AssessmentTemplateController.getTemplateSections('');
        List<Assessment__c> asslist=[select id from Assessment__c];
        List<Account> accts=[select name from Account];      
        List<id> idlist=new List<id>();
        idlist.add(accts[0].id);
        AssessmentTemplateController.deleteRecords(idlist,true);
        
  
    }
    @istest
    public static void exceptioncoverage(){
       Test.startTest();
        try {
            List<Section__c> sections = AssessmentTemplateController.getSections(null, null);
            
            System.assert(false, 'An exception should have been thrown');
        } catch (AuraHandledException e) {
            
           System.assertEquals('Script-thrown exception', e.getMessage());
        }
       try {
            List<Section__c> sections = AssessmentTemplateController.getTemplateSections('invalidTemplateId');
           
            System.assert(false, 'An exception should have been thrown');
        } catch (AuraHandledException e) {
            System.assertEquals('invalid ID field: invalidTemplateId', e.getMessage());
        }
        try {
            List<Question__c> questions = AssessmentTemplateController.getQuestionsLists('invalidTemplateId');
            System.assert(false, 'An exception should have been thrown');
        } catch (AuraHandledException e) {
            System.assertEquals('Script-thrown exception', e.getMessage());
        }
        
        Test.stopTest();
    
    }
}