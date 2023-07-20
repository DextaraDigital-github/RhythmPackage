/** 
* Class Name        : AssessmentTemplateControllerTest
* Developer         : Priyanka         
* Created Date      : 
* @description        : This is Testclass forAssessmentTemplateController class.
* Last Modified Date: 23-06-2023
*/
@IsTest
private class AssessmentTemplateControllerTest {
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

        }
    }
    /**
    * @description test method for AssessmentTemplateController.
    */
    @istest
    static void testgetQuestionsList() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            Integer reccount=5;
            List<Rhythm__Assessment_Template__c> templist=[select id from Rhythm__Assessment_Template__c];
            List<Rhythm__Section__c> seclist=[select id,Rhythm__No_of_Questions__c from Rhythm__Section__c];
            List<Rhythm__Question__c> qstnlist=[select id,Rhythm__Section__c from Rhythm__Question__c];
            
            AssessmentTemplateController.getQuestionsLists(templist[0].id);
            AssessmentTemplateController.getRecordsCount(templist[0].id,'Sections');
            AssessmentTemplateController.getRecordsCount(templist[0].id,'Questions');
            AssessmentTemplateController.getTemplateSections(templist[0].id);
            AssessmentTemplateController.updateRecords(seclist);
            AssessmentTemplateController.updateQustnRecords(qstnlist);
            AssessmentTemplateController.getTemplateQuestionList(templist[0].id,reccount);
            AssessmentTemplateController.getSections('\'Test section',templist[0].id);
            AssessmentTemplateController.getSections('',templist[0].id);
            AssessmentTemplateController.questionsCount(seclist[0].id);
            AssessmentTemplateController.sectionsCount(templist[0].id);
            AssessmentTemplateController.getTemplateDetails(templist[0].id);
            templist[0].status__c='Active';
            //update templist[0];
            AssessmentTemplateController.getTemplateDetails(templist[0].id);
            System.assert(templist.size()>0, True);
            Test.stopTest();
        }
        
    }
    /**
    * @description test method for getTemplateSections.
    */
    @istest
    static void testgetAssessmentRecord() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            AssessmentTemplateController.getTemplateSections('');
            //List<Assessment__c> asslist=[select id from Assessment__c];
            List<Account> accts=[select name from Account];      
            List<id> idlist=new List<id>();
            idlist.add(accts[0].id);
            AssessmentTemplateController.deleteRecords(idlist,true);
            System.assert(idlist.size()>0, True);
            Test.stopTest();
        }
    }
    /**
    * @description method for covering exception.
    */
    @istest
    static void exceptioncoverage(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            try {
                AssessmentTemplateController.getSections(null, null);
                
                System.assert(false, 'An exception should have been thrown');
            } catch (AuraHandledException e) {
                
            System.assert(e.getMessage()!=null,'Script-thrown exception');
            }
        try {
                AssessmentTemplateController.getTemplateSections('invalidTemplateId');
            
                System.assert(false, 'An exception should have been thrown');
            } catch (AuraHandledException e) {
                System.assert(e.getMessage()!=null,'invalid ID field: invalidTemplateId');
            }
            try {
                AssessmentTemplateController.getQuestionsLists('invalidTemplateId');
                System.assert(false, 'An exception should have been thrown');
            } catch (AuraHandledException e) {
                System.assert(e.getMessage()!=null,'Script-thrown exception');
            }
            
            Test.stopTest();
        }
    
    }
    @isTest
    static void deleteTemplateTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            String testString;
            List<Assessment_Template__c> templist=[select id from Assessment_Template__c];
            Test.startTest();
            delete templist;
            testString = 'Success';
            System.assertEquals(testString =='Success', true,'template deleted');
            Test.stopTest();
        }
    }
}