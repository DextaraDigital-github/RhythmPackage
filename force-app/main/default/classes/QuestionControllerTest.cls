/**
* Class Name        : QuestionControllerTest
* Developer         : Sai Koushik Nimmaturi           
* Created Date      :
* @description       : QuestionControllerTest class is used to check the code coverage for QuestionController
* Last Modified Date:
*/
@isTest
public class QuestionControllerTest {
    static QuestionSelector selector = QuestionSelector.getInstance();
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
            TestDataFactory.createResponseAttributes(1,true,respAttributes);
            Map<String, Object> respAttributes2 = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
            'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'No','Rhythm__Score__c'=>5,
            'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
            TestDataFactory.createResponseAttributes(1,true,respAttributes2);
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
            QuestionController.createQuestions(questionlst,false);
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
            QuestionController.createQuestions(questionlst,false);
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
            QuestionController.createQuestions(questionlst,false);
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
            QuestionController.createQuestions(questionlst,false);
            set<Id> st = new set<Id>();
            st.add(ques[0].Id);
            List<SObject> qType = selector.getSubQuestions(st);
            Test.stopTest();
            System.assertEquals(qType.size()>0, true,'Question deleted successfully'); 
        }
    }

    @isTest
    static void createResponseAttributesTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
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
           List<SObject> qType = QuestionController.createResponseAttributes(responseAttrlst);
           Test.stopTest();
           System.assertEquals(qType.size()>0, true,'Response Attribute Updated successfully');
        }
    }
    @isTest
    static void updateResponseAttributesTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Response_Attribute__c> responseAttrlst = [SELECT id,preferred_Not_preferred__c,QuestionId__c,Response_value__c,
                                        Score__c,Upload_Required__c FROM Response_Attribute__c];
        System.runAs(u){
           Test.startTest();
            responseAttrlst[0].Rhythm__Score__c =8;
            List<SObject> respType = QuestionController.updateResponseAttributes(responseAttrlst);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Updated successfully');
        }
    }
    @isTest
    static void deleteResponseAttributeTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        List<String> quesLst = new List<String>();
        quesLst.add(ques[0].Id);
        System.runAs(u){
           Test.startTest();
          
            List<SObject> respType = QuestionController.deleteQuesRespAttribute(quesLst);
            QuestionAttributeResponseController.deleteResponseAttribute(null);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Deleted successfully');
        }
    }
     @isTest
    static void deleteQuesRespAttributeTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Question__c> ques = [SELECT id,Assessment_Template__c,Section__c from Question__c];
        List<String> quesLst = new List<String>();
        quesLst.add(ques[0].Id);
        System.runAs(u){
           Test.startTest();
            List<SObject> respType = QuestionAttributeResponseController.deleteQuesRespAttribute(quesLst);
           Test.stopTest();
           System.assertEquals(respType.size()>0, true,'Response Attribute Deleted successfully');
        }
    }
}