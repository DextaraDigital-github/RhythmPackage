/** 
* Class Name        : SendAssessmentNotificationsBatchTest
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description       : Test class for SendAssessmentNotificationsBatch.
* Last Modified Date: 
*/
@isTest
private with sharing class SendAssessmentNotificationsBatchTest {
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
            TestDataFactory.createQuestion(1,true,questionAttributes);
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10,'Rhythm__Start_Date__c'=>Date.Today(),'Rhythm__End_Date__c'=>Date.Today()+2,'Rhythm__Expiry_Reminder_Before_in_Days__c'=>2};
            List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);

            Map<String,Object> supplierData = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
            'Rhythm__Status__c'=>'Active'};
            TestDataFactory.createSuppliers(1,true,supplierData);
        }
       
    }
    @isTest
    static void notificationBatchTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            SendAssessmentNotificationsBatch b = new SendAssessmentNotificationsBatch();
            Database.executeBatch(b);
            Test.stopTest();
            List<AccountAssessmentRelation__c> assList= [SELECT Id from AccountAssessmentRelation__c];
            
            System.assert(assList.size()>0,true);
        }   
    }
}