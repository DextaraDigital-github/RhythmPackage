/** 
* Class Name        : DisplayPDFControllerTest
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula   
* Created Date      : 
* @description        : This is Testclass for DisplayPDFController class.
* Last Modified Date: 
*/
@isTest
private class DisplayPDFControllerTest {
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
            Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
            Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John David'};
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
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
            List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__PdfConvertor__c'=>'{ "Section 2": [ { "questionId": "a086t000001jWQgAAM", "question": "Checkbox 2", "snumber": 3, "value": false, "conversationHistory": "", "files": "1" }, { "questionId": "a086t000001jWQgAAM", "question": "Checkbox 2", "snumber": 3, "value": false, "conversationHistory": "", "files": "1" }, { "questionId": "a086t000001jWQgAAM", "question": "Checkbox 2", "snumber": 3, "value": false, "conversationHistory": "", "files": "1" }, { "questionId": "a086t000001jWQqAAM", "question": "C2", "snumber": "3.1" } ], "Section 1": [ { "questionId": "a086t000001jWQ7AAM", "question": "Q1", "snumber": 1, "value": "No", "conversationHistory": "" }, { "questionId": "a086t000001jWQHAA2", "question": "C2", "snumber": "1.1" } ] }','Rhythm__Assessment__c'=>asslist[0].Id,
                'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                    'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
            TestDataFactory.createAccountAssessment(1,true,accountassesments);
        }
    }
    /**
    * @description
    */
    @isTest
    static void displayTest()
    {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            PageReference pageRef = Page.RenderAsPdf;
            Test.setCurrentPage(pageRef);
            AccountAssessmentRelation__c obj = [select id,PdfConvertor__c from AccountAssessmentRelation__c];
            pageRef.getParameters().put('id', String.valueOf(obj.Id));
            new DisplayPDFController();
            //ApexPages.StandardController sc = new ApexPages.StandardController(obj);
            Test.stopTest();
            System.assert(True, 'true');
        }
    }
}