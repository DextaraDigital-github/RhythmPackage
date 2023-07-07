@isTest
public class QuestionTriggerHandlerTest {
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
        TestDataFactory.createQuestion(1,true,QuestionAttributes);
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
    
    @isTest
    public static void questionDelete() {      
        List<Question__c> quesList = [Select id from Question__c LIMIT 1];
        delete quesList[0];
    }
    @isTest
    public static void questionUpdate() {
        List<Question__c> quesList = [Select id from Question__c LIMIT 1];
        quesList[0].Question__c ='Test Question ?';
        update quesList[0];     
    }
}