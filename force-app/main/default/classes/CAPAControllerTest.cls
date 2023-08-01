/**
* Class Name        : CAPAController
* Developer         :        
* Created Date      :
* @description      : CAPAControllerTest class is used to check the code coverage for CAPAController
* Last Modified Date:
*/

@isTest
public class CAPAControllerTest {
       
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
                    List<Response_Attribute__c> resp =TestDataFactory.createResponseAttributes(1,true,respAttributes);
            Map<String, Object> respAttributes2 = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
                'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'No','Rhythm__Score__c'=>5,
                'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
                    List<Response_Attribute__c> resp2 =TestDataFactory.createResponseAttributes(1,true,respAttributes2);
            
            
            
            
            
            
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
                'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
                    List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
                'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                    List<Rhythm__AccountAssessmentRelation__c> accAssessment=TestDataFactory.createAccountAssessment(1,true,accountassesments);
            
            Map<String, Object> actionAttributes =new Map<String, Object>{'Name'=>'test action','Rhythm__Assigned_To__c'=>custUser.id,'Rhythm__Question__c'=>ques[0].id,'Rhythm__AccountAssessment__c'=>accAssessment[0].id};
                List<Action__c> acclist=TestDataFactory.createAction(1,true,actionAttributes);
            
            
        }   
        
    }
     
    /**
* @description
*/
    @istest
    public static void getPicklistValuesTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
			Test.startTest();
            CAPAController.getPicklistValues();
			Test.stopTest();
        }
    }
     
    /**
* @description
*/
    @istest
    public static void saveActionResponseTest() {
        
        try{
            user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
            System.runAs(u){
                List<Action__c> actionList=new List<Action__c>();
                List<ContentDocument> cd=new List<ContentDocument>();
				Test.startTest();
                CAPAController.saveActionResponse(actionList,false);
                CAPAController.saveActionResponse(actionList,true);
                CAPAController.saveActionResponse(null,null);
				Test.stopTest();
            }
        }
        catch(Exception e) {
            
        }
       
    }
    
    
    /**
* @description
*/
    @istest
    public static void deleteActionDataTest() {
        Test.startTest();
        try{
            user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
            System.runAs(u){
                List<Question__c> questionList=[select id from Question__c limit 1];
                List<AccountAssessmentRelation__c> accAssementList=[select id from AccountAssessmentRelation__c limit 1];
                CAPAController.deleteActionData(questionList[0].id,accAssementList[0].id);
                //CAPAController.deleteActionData(accAssementList[0].id,questionList[0].id);
            }
        }catch(Exception e) {
            
        }
        Test.stopTest();
    }
    
    
    /**
* @description
*/
    @istest
    public static void getRecordsListTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            String userName='John';	
			Test.startTest();
            CAPAController.getRecordsList(userName);
			Test.stopTest();
        }
    }
    
    
    /**
* @description
*/
    @istest
    public static void getActionResponseTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Map<String,string> actionResponse=new Map<String,string>();
			Test.startTest();
            CAPAController.getActionResponse(actionResponse);
			Test.stopTest();
        }
    }
    
    
    /**
* @description
*/
    @istest
    public static void getActionRecordsTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            List<AccountAssessmentRelation__c> accAssementList=[select id from AccountAssessmentRelation__c limit 1];
            string accountAssessment=accAssementList[0].id;
			Test.startTest();
            CAPAController.getActionRecords(accountAssessment);
			Test.stopTest();
        }
    }
    
    
    /**
* @description
*/
    @istest
    public static void actionRecords() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
            System.runAs(u){
		Test.startTest();
        CAPAController.actionRecords();
		Test.stopTest();
    }
    }
    
    
    /**
* @description
*/
    @istest
    public static void selectedActionRecordTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            List<Action__c> actionList=[select id from Action__c limit 1];
            string actionId=actionList[0].id;
			Test.startTest();
            CAPAController.selectedActionRecord(actionId);
			Test.stopTest();
        }
    }
    
    
    /**
* @description
*/
    @istest
    public static void sendTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            String subject='';
            String body='';
            User users=[select id from User limit 1];
            List<Id> userList=new List<Id>();
            userList.add(users.id);
			Test.startTest();
            CAPAController.send(subject,body,userList);
			Test.stopTest();
        }
    }
    
    
    /**
* @description
*/
    @istest
    public static void notifyUsersTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Map<string,object> actionData=new Map<string,object>();
            
            String body='Hello World';
            User users=[select id from User limit 1];
            List<Id> userList=new List<Id>();
            userList.add(users.id);
			Test.startTest();
            CAPAController.notifyUsers(actionData,body,userList);
			Test.stopTest();
        }
    }
    
    /**
* @description
*/
    @istest
    public static void getCurrentDateTest() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            CAPASelector.getCurrentDate();
			Test.stopTest();
        }
    }
    
    
}