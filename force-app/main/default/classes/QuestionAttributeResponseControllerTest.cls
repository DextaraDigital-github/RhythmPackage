/**
* Class Name        : QuestionAttributeResponseControllerTest
* Developer         : Sai Koushik Nimmaturi           
* Created Date      :
* @description       : QuestionAttributeResponseControllerTest class is used to check the code coverage for QuestionAttributeResponseController
* Last Modified Date:
*/
@isTest
public class QuestionAttributeResponseControllerTest {
    
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
            /*Map<String, Object> respAttributes2 = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
                'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'No','Rhythm__Score__c'=>5,
                'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
            List<Question__c> resp2 =TestDataFactory.createResponseAttributes(1,true,respAttributes2);*/
            
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
    static void createResponseAttributesTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Map<String, Object> respAttributes = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
                'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'Yes','Rhythm__Score__c'=>5,
                'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
        Response_Attribute__c quesAtr = new Response_Attribute__c();
        quesAtr.preferred_Not_preferred__c ='Preferred';
        quesAtr.QuestionId__c = ques[0].Id;
        quesAtr.Response_value__c ='Yes';
        quesAtr.Score__c =5;
        quesAtr.Upload_Required__c ='Yes';
        quesAtr.Weight__c=10;
        List<Sobject> responseAttrlst = new List<SObject>();
        responseAttrlst.add(quesAtr);
        System.runAs(u){
           Test.startTest();
           List<SObject> qType = QuestionAttributeResponseController.createResponseAttributes(responseAttrlst);
           Test.stopTest();
           System.assertEquals(qType.size()>0, true,'Response Attribute Updated successfully');
        }
    }
    @isTest
    static void updateResponseAttributesTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        List<Response_Attribute__c> responseAttrlst = [SELECT id,preferred_Not_preferred__c,QuestionId__c,Response_value__c,
                                        Score__c,Upload_Required__c FROM Response_Attribute__c];
        System.runAs(u){
           Test.startTest();
            responseAttrlst[0].Rhythm__Score__c =8;
           //List<SObject> qType = QuestionAttributeResponseController.createResponseAttributes(responseAttrlst);
            List<SObject> respType = QuestionAttributeResponseController.updateResponseAttributes(responseAttrlst);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Updated successfully');
        }
    }
    @isTest
    static void deleteResponseAttributeTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Response_Attribute__c> responseAttrlst = [SELECT id,preferred_Not_preferred__c,QuestionId__c,Response_value__c,
                                        Score__c,Upload_Required__c FROM Response_Attribute__c];
        System.runAs(u){
           Test.startTest();
          
            List<SObject> respType = QuestionAttributeResponseController.deleteResponseAttribute(responseAttrlst[0].Id);
            List<SObject> respType1 = QuestionAttributeResponseController.deleteResponseAttribute(null);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Deleted successfully');
        }
    }
     @isTest
    static void deleteQuesRespAttributeTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        List<String> quesLst = new List<String>();
        quesLst.add(ques[0].Id);
        System.runAs(u){
           Test.startTest();
            List<SObject> respType = QuestionAttributeResponseController.deleteQuesRespAttribute(quesLst);
             //List<SObject> respType1 = QuestionAttributeResponseController.deleteQuesRespAttribute();
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Deleted successfully');
        }
    }
    @isTest
    static void getQuesRespAttributeTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Response_Attribute__c> responseAttrlst = [SELECT id,preferred_Not_preferred__c,QuestionId__c,Response_value__c,
                                        Score__c,Upload_Required__c FROM Response_Attribute__c];
        List<String> resplst = new List<String>();
        resplst.add(responseAttrlst[0].Id);
        System.runAs(u){
           Test.startTest();
            List<SObject> respType = QuestionAttributeResponseController.getQuesRespAttribute(resplst);
            //List<SObject> respType1 = QuestionAttributeResponseController.getQuesRespAttribute(null);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Fetched successfully');
        }
    }
    @isTest
    static void getQuestionRespAttributesTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        List<String> quesLst = new List<String>();
        quesLst.add(ques[0].Id);
        System.runAs(u){
           Test.startTest();
            List<SObject> respType = QuestionAttributeResponseController.getQuestionRespAttributes(quesLst);
            //List<SObject> respType1 = QuestionAttributeResponseController.getQuestionRespAttributes(null);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Deleted successfully');
        }
    }
    @isTest
    static void getSectionsTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        System.runAs(u){
           Test.startTest();
            List<SObject> respType = QuestionAttributeResponseSelector.getSections(ques[0].Assessment_Template__c,'s');
           Test.stopTest();
           System.assertEquals(respType!=null, true,'Response Attribute Deleted successfully');
        }
    }
    @isTest
    static void createResponseQuestionMapTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Response_Attribute__c> ques = [SELECT id,QuestionId__c,Response_value__c from Response_Attribute__c];
        Response_Question_Map__c obj = new Response_Question_Map__c();
        obj.Rhythm__QuestionId__c = ques[0].Rhythm__QuestionId__c;
        obj.Rhythm__ResponseAttributeId__c = ques[0].Id;
        List<SObject> lst = new List<SObject>();
        lst.add(obj);
        List<String> queslst = new List<String>();
        queslst.add(ques[0].Rhythm__QuestionId__c);
        System.runAs(u){
            Test.startTest();
            List<Sobject> resmap = QuestionAttributeResponseService.createResponseQuestionMap(lst);
            List<SObject> getresmap = QuestionAttributeResponseSelector.getQuestionResponseMap(queslst);
            //List<SObject> getresmap1 = QuestionAttributeResponseSelector.getQuestionResponseMap(null);
            Test.stopTest();
             System.assertEquals(resmap!=null, true,'Response Question Map Created successfully');
        }
    }
	 @isTest
    static void getRespAttforQuestionTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Map<Id,Id> quesmap = new Map<Id,Id>();
        quesmap.put(ques[0].Id,ques[0].Id);
        System.runAs(u){
           Test.startTest();
            List<SObject> respType = QuestionAttributeResponseSelector.getRespAttforQuestion(quesmap);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Deleted successfully');
        }
    }
	
}