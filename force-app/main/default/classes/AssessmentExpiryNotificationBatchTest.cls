/** 
* Class Name        : AssessmentExpiryNotificationBatchTest
* Developer         : Prudhvi   
* Created Date      : 
* @description       : It is testclass for AssessmentExpiryNotificationBatch.
* Last Modified Date: 
*/
@isTest
public with sharing class AssessmentExpiryNotificationBatchTest {
    /**
    * @description method for testsetup data.
    */
    @testSetup
    public static void methodName() {
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Rhythm__Email__c'=>'test@gmail.com'};
        List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        System.debug('accts==>'+accts[0].Id);
        Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com'};
        List<Contact> contacts = TestDataFactory.createContacts(1,true,contactAttributes);
        Profile portalProfile = [SELECT Id FROM Profile WHERE Name='Customer Community User' Limit 1];
        Map<String,Object> userattributes = new Map<String,Object>{'UserName'=>accts[0].Name,'LastName'=>accts[0].Name,
        'Alias'=>'Testuser','ContactId'=>contacts[0].Id,'ProfileId'=>portalProfile.Id,'EmailEncodingKey'=>'UTF-8',
        'CommunityNickname' => 'test12345',
        'TimeZoneSidKey' => 'America/Los_Angeles',
        'LocaleSidKey' => 'en_US',
        'LanguageLocaleKey' => 'en_US'};
        List<User> users = TestDataFactory.createUser(1,true,userattributes);
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
        List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        System.debug('templist'+templist[0].Id);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
        List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
        System.debug('seclist'+seclist[0].Id);

        Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
        'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
        'Rhythm__Section__c'=>seclist[0].Id};
        List<Question__c> qstnlist=TestDataFactory.createQuestion(1,true,questionAttributes);
        System.debug('qstnlist'+qstnlist[0].Id);
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
        'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10,'Rhythm__Start_Date__c'=>Date.Today(),'Rhythm__End_Date__c'=>Date.Today()+2,'Rhythm__Expiry_Reminder_Before_in_Days__c'=>2};
        List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);

        Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
        'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
        'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
        List<AccountAssessmentRelation__c> accountasslist=TestDataFactory.createAccountAssessment(1,true,accountassesments);
        System.debug('kkk'+accountasslist);
        Map<String, Object> responseattributes = new Map<String, Object>{'Rhythm__AccountAssessmentRelation__c'=>accountasslist[0].Id,
        'Rhythm__Question__c'=>qstnlist[0].id,'Rhythm__Flag__c'=>true,'Rhythm__Is_Latest_Response__c'=>True};
        List<Response__c> resplist=TestDataFactory.createResponse(1,true,responseattributes);     
    }
    /**
    * @description method for coverage AssessmentExpiryNotificationBatch.
    */
    @isTest
    public static void expiryBatchTest()
    {
        Test.startTest();
        AssessmentExpiryNotificationBatch b = new AssessmentExpiryNotificationBatch();
        Database.executeBatch(b);
        Test.stopTest();
         integer  count = [select count() from AccountAssessmentRelation__c where Status__c!='Submitted' AND Assessment__r.Expiry_Reminder_Date__c!= null AND Assessment__r.Expiry_Reminder_Date__c=:Date.today()];
        System.assert(count>0,'true');
    }
}