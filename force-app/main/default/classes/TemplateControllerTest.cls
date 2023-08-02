/**
* Class Name        : TemplateControllerTest
* Developer         : Sai Koushik Nimmaturi           
* Created Date      :
* @description       : TemplateControllerTest class is used to check the code coverage for TemplateController
* Last Modified Date:
*/
@isTest
public class TemplateControllerTest {
		@testSetup
    static void methodName() {
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
            
            Map<String, Object> childquestionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
                'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
                'Rhythm__Section__c'=>seclist[0].Id,'Rhythm__Parent_Question__c'=>ques[0].Id};
            List<Question__c> ques2 =TestDataFactory.createQuestion(1,true,childquestionAttributes);
            
            
            Map<String, Object> questionResponeMapattr = new Map<String, Object>{'Rhythm__QuestionId__c'=>ques[0].Id,
                'Rhythm__ResponseAttributeId__c'=>resp[0].Id};
            List<Response_Question_Map__c> quesResplst =TestDataFactory.createResponseQuestionMap(1,true,questionResponeMapattr);
            
            
           /* Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
            List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
                'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                    'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
            TestDataFactory.createAccountAssessment(1,true,accountassesments);*/
        }   
    }
    @isTest
    static void cloneTemplateTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Assessment_Template__c> sec =[SELECT id,name,Status__c FROM Assessment_Template__c];
        Assessment_Template__c temp = new Assessment_Template__c();
        temp.Name = sec[0].Name+'_clone';
        temp.Rhythm__Status__c = sec[0].Rhythm__Status__c;
        List<Response_Attribute__c> ques = [SELECT id,QuestionId__c,Response_value__c from Response_Attribute__c];
        Response_Question_Map__c obj = new Response_Question_Map__c();
        obj.Rhythm__QuestionId__c = ques[0].Rhythm__QuestionId__c;
        obj.Rhythm__ResponseAttributeId__c = ques[0].Id;
        List<SObject> lst = new List<SObject>();
        lst.add(obj);
        System.runAs(u){
            Test.startTest();
            List<Sobject> resmap = QuestionAttributeResponseService.createResponseQuestionMap(lst);
            Object seclst =TemplateController.doClone(sec[0].Id,temp);
            Test.stopTest();
           System.assertEquals(seclst!=null, true,'Response Attribute Deleted successfully');
        } 
    }
    @isTest
    static void wrapperTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Assessment_Template__c> sec =[SELECT id,name,Status__c FROM Assessment_Template__c];
        
        System.runAs(u){
            Test.startTest();
            
            TemplateController.ResultWrapper wrapper = new TemplateController.ResultWrapper();
       		wrapper.isSuccess = true;
        	wrapper.message = 'Test Message';
        	wrapper.errorCode = '123';
        	wrapper.recordId = '0010A00000abcde';
            Test.stopTest();
           System.assertEquals(true, wrapper.isSuccess, 'isSuccess should be true');
        } 
    }
    @isTest
    static void fetchQuestionsTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Assessment_Template__c> sec =[SELECT id,name,Status__c FROM Assessment_Template__c];
        map<string,Object> mp = new map<string,object>();
        mp.put('fields',new List<String>{'id','name'});
        mp.put('filter','');
        System.runAs(u){
            Test.startTest();
            Object assessments = TemplateSelector.fetchAssessmentTemplates(mp);
            Test.stopTest();
           System.assertEquals(assessments!=null,true, 'isSuccess should be true');
        } 
    }
    @isTest
    static void getTemplateTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Assessment_Template__c> sec =[SELECT id,name,Status__c FROM Assessment_Template__c];
        System.runAs(u){
            Test.startTest();
            List<Assessment_Template__c> lst = TemplateSelector.getTemplateRecord(sec[0].Id);
            Test.stopTest();
           System.assertEquals(lst.size()>0,true, 'isSuccess should be true');
        } 
    }
}