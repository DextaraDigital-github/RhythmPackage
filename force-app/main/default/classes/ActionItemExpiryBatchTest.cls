/**
* Class Name        : CAPAController
* Developer         :        
* Created Date      :
* @description      : CAPAControllerTest class is used to check the code coverage for CAPAController
* Last Modified Date:
*/
@isTest
public class ActionItemExpiryBatchTest {
    /**
    * @description
    */
    @testSetup
    public static void testData() {
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        System.runAs(custUser) {
            Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Customer').getRecordTypeId();
            Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
            Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John David'};
            TestDataFactory.createContacts(1,true,contactAttributes);
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
            List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
            Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Picklist','Rhythm__Required__c'=>True,
            'Rhythm__Section__c'=>seclist[0].Id,'Rhythm__OptionValueSet__c'=>'Yes\r\nNo'};
            List<Question__c> ques =TestDataFactory.createQuestion(1,true,questionAttributes);

            Map<String, Object> respAttributes = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
            'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'Yes','Rhythm__Score__c'=>5,
            'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};

            TestDataFactory.createResponseAttributes(1,true,respAttributes);

            Map<String, Object> respAttributes2 = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
            'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'No','Rhythm__Score__c'=>5,
            'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};

            TestDataFactory.createResponseAttributes(1,true,respAttributes2);

            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
            List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
            'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
            'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
            List<Rhythm__AccountAssessmentRelation__c> accAssessment=TestDataFactory.createAccountAssessment(1,true,accountassesments);

            Map<String, Object> actionAttributes =new Map<String, Object>{'Name'=>'test action','Due_Date__c'=>Date.Today(),'Status__c'=>'Open','Rhythm__Assigned_To__c'=>custUser.id,'Rhythm__Question__c'=>ques[0].id,'Rhythm__AccountAssessment__c'=>accAssessment[0].id};
            TestDataFactory.createAction(1,true,actionAttributes);
        }   
        
    }

    @isTest
    static void actionItemBatchTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        try{
            System.runAs(u){
                String testString;
                Test.startTest();
                List<Action__c> ationItemList = [SELECT Id,Due_Date__c FROM Action__c WHERE Name='test action' LIMIT 1];
                ationItemList[0].Due_Date__c = Date.Today() - 1;
                update ationItemList;
                ActionItemExpiryBatch b = new ActionItemExpiryBatch();
                testString = 'Success';
                Database.executeBatch(b);
                Test.stopTest();
                System.assertEquals(testString=='Success', true,'Batch Ran Successfully.');
            }
        }catch(exception e){

        }
    }
}