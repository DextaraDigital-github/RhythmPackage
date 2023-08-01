/**
* Class Name        : QuestionControllerTest
* Developer         : Sai Koushik Nimmaturi           
* Created Date      :
* @description       : QuestionControllerTest class is used to check the code coverage for QuestionController
* Last Modified Date:
*/
@isTest
public class QuestionControllerTest {
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
    static void getQuestionTypeValuesTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
           Test.startTest();
           List<String> qType = QuestionController.getQuestionTypeValues();
             Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question Type values fetched successfully');  
        }
    }
    @isTest
    static void createQuestionsTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Question__c quesAtr = new Question__c();
        quesAtr.Assessment_Template__c = ques[0].Assessment_Template__c;
        quesAtr.Section__c = ques[0].Rhythm__Section__c;
        quesAtr.Question__c =' Test Question';
        quesAtr.Question_Type__c ='Text';
        List<Sobject> questionlst = new List<SObject>();
        questionlst.add(quesAtr);
        System.runAs(u){
           Test.startTest();
           List<SObject> qType = QuestionController.createQuestions(ques,True);
           List<SObject> qType1 = QuestionController.createQuestions(questionlst,false);
           Test.stopTest();
           System.assertEquals(qType.size()>0, true,'Question Updated successfully');
           System.assertEquals(qType1.size()>0, true,'Question created successfully');  
        }
    }
    @isTest
    static void deleteQuestionsTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        System.runAs(u){
            Test.startTest();
            List<SObject> qType = QuestionController.deleteQuestion(ques[0].Id,ques[0].Assessment_Template__c);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
     @isTest
    static void deleteChildQuestionsTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Question__c quesAtr = new Question__c();
        quesAtr.Assessment_Template__c = ques[0].Assessment_Template__c;
        quesAtr.Section__c = ques[0].Rhythm__Section__c;
        quesAtr.Question__c =' Test Question';
        quesAtr.Question_Type__c ='Text';
        quesAtr.Rhythm__Parent_Question__c = ques[0].Id;
        List<Sobject> questionlst = new List<SObject>();
        questionlst.add(quesAtr);
        System.runAs(u){
            Test.startTest();
            List<SObject> qType1 = QuestionController.createQuestions(questionlst,false);
            List<SObject> qType = QuestionController.deleteQuestion(ques[0].Id,ques[0].Assessment_Template__c);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
      @isTest
    static void getQuestionsTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        System.runAs(u){
            Test.startTest();
            List<SObject> qType = QuestionController.getQuestions(ques[0].Assessment_Template__c);
            Test.stopTest();
             System.assertEquals(qType.size()>0, true,'Question deleted successfully');
        }
    }
    @isTest
    static void getChildQuestionsTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Question__c quesAtr = new Question__c();
        quesAtr.Assessment_Template__c = ques[0].Assessment_Template__c;
        quesAtr.Section__c = ques[0].Rhythm__Section__c;
        quesAtr.Question__c =' Test Question';
        quesAtr.Question_Type__c ='Text';
        quesAtr.Rhythm__Parent_Question__c = ques[0].Id;
        List<Sobject> questionlst = new List<SObject>();
        questionlst.add(quesAtr);
        System.runAs(u){
            Test.startTest();
            List<SObject> qType1 = QuestionController.createQuestions(questionlst,false);
            List<SObject> qType = QuestionController.getChildQuestions(ques[0].Id,ques[0].Assessment_Template__c);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
    @isTest
    static void getQuestionsDataTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        System.runAs(u){
            Test.startTest();
            List<SObject> qType = QuestionController.getQuestionsData(ques[0].Id,ques[0].Assessment_Template__c);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
        @isTest
    static void fetchQuestionsTest()
    {
       user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Question__c quesAtr = new Question__c();
        quesAtr.Assessment_Template__c = ques[0].Assessment_Template__c;
        quesAtr.Section__c = ques[0].Rhythm__Section__c;
        quesAtr.Question__c =' Test Question';
        quesAtr.Question_Type__c ='Text';
        quesAtr.Rhythm__Parent_Question__c = ques[0].Id;
        List<Sobject> questionlst = new List<SObject>();
        questionlst.add(quesAtr);
        
        System.runAs(u){
            Test.startTest();
            List<SObject> qType1 = QuestionController.createQuestions(questionlst,false);
            Map<String,Object> mp = new Map<String,Object>();
        	mp.put('assessmentId',ques[0].Id);
        	
            List<SObject> qType = QuestionController.fetchQuestions(JSON.serialize(mp));
            //List<SObject> qType2 = QuestionController.fetchQuestions(null);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
    @isTest
    static void updateQuestionsSequenceTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Question__c quesAtr = new Question__c();
        quesAtr.Assessment_Template__c = ques[0].Assessment_Template__c;
        quesAtr.Section__c = ques[0].Rhythm__Section__c;
        quesAtr.Question__c =' Test Question';
        quesAtr.Question_Type__c ='Text';
        quesAtr.Rhythm__Parent_Question__c = ques[0].Id;
        List<Sobject> questionlst = new List<SObject>();
        questionlst.add(quesAtr);
        
        System.runAs(u){
            Test.startTest();
            List<SObject> qType1 = QuestionController.createQuestions(questionlst,false);
            Map<String,Object> mp = new Map<String,Object>();
        	mp.put('questionIdList',new List<String>{qType1[0].Id});
        	mp.put('questionId',ques[0].Id);
            List<SObject> qType = QuestionController.updateQuestionsSequence(JSON.serialize(mp));
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
     @isTest
    static void getSubQuestionsTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        Question__c quesAtr = new Question__c();
        quesAtr.Assessment_Template__c = ques[0].Assessment_Template__c;
        quesAtr.Section__c = ques[0].Rhythm__Section__c;
        quesAtr.Question__c =' Test Question';
        quesAtr.Question_Type__c ='Text';
        quesAtr.Rhythm__Parent_Question__c = ques[0].Id;
        List<Sobject> questionlst = new List<SObject>();
        questionlst.add(quesAtr);
        System.runAs(u){
            Test.startTest();
            List<SObject> qType1 = QuestionController.createQuestions(questionlst,false);
            set<Id> st = new set<Id>();
            st.add(ques[0].Id);
            List<SObject> qType = QuestionSelector.getSubQuestions(st);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }
}