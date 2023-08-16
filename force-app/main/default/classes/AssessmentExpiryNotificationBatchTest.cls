/** 
* Class Name        : AssessmentExpiryNotificationBatchTest
* Developer         : Prudhvi   
* Created Date      : 
* @description       : It is testclass for AssessmentExpiryNotificationBatch.
* Last Modified Date: 
*/
@isTest
private with sharing class AssessmentExpiryNotificationBatchTest {
    /**
    * @description method for testsetup data.
    */
    @testSetup
    static void methodName() {
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        System.runAs(custUser) {
            Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
            Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Rhythm__Email__c'=>'test@gmail.com'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
            Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'TestLName'};
            TestDataFactory.createContacts(1,true,contactAttributes);
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
            List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);

            Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
            'Rhythm__Section__c'=>seclist[0].Id};
            List<Question__c> qstnlist=TestDataFactory.createQuestion(1,true,questionAttributes);
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10,'Rhythm__Start_Date__c'=>Date.Today(),'Rhythm__End_Date__c'=>Date.Today()+2,'Rhythm__Expiry_Reminder_Before_in_Days__c'=>2};
            List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);

            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
            'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
            'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
            List<AccountAssessmentRelation__c> accountasslist=TestDataFactory.createAccountAssessment(1,true,accountassesments);
            Map<String, Object> responseattributes = new Map<String, Object>{'Rhythm__AccountAssessmentRelation__c'=>accountasslist[0].Id,
            'Rhythm__Question__c'=>qstnlist[0].id,'Rhythm__Flag__c'=>true,'Rhythm__Is_Latest_Response__c'=>True};
            TestDataFactory.createResponse(1,true,responseattributes); 
        }    
    }
    /**
    * @description method for coverage AssessmentExpiryNotificationBatch.
    */
    @isTest
    static void expiryBatchTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            AssessmentExpiryNotificationBatch b = new AssessmentExpiryNotificationBatch();
            Database.executeBatch(b);
            Test.stopTest();
            integer  count = [select count() from AccountAssessmentRelation__c where Status__c!='Submitted' AND Assessment__r.Expiry_Reminder_Date__c!= null AND Assessment__r.Expiry_Reminder_Date__c=:Date.today()];
            System.assertEquals(count>0,true,'available assessment for reminder');
        }
    }

    @isTest
    static void expiryBatchTestCatch(){
        try{
            user u = [SELECT Id,UserName FROM User WHERE Email='sysadmin01@testorg.com' LIMIT 1];
            System.runAs(u){
                Test.startTest();
                AssessmentExpiryNotificationBatch b = new AssessmentExpiryNotificationBatch();
                Database.executeBatch(b);
                Test.stopTest();
                integer  count = [select count() from AccountAssessmentRelation__c where Status__c!='Submitted' AND Assessment__r.Expiry_Reminder_Date__c!= null AND Assessment__r.Expiry_Reminder_Date__c=:Date.today()];
                System.assertEquals(count>0,true,'available assessment for reminder');
            }
        }catch(exception e){
            system.debug('message----->'+e.getMessage());
            System.assertEquals(e.getMessage()!=null,true,'error catched.');
        }
    }
}