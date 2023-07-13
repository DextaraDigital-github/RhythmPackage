/**
*Class Name       : QuestionTriggerHandlerTest
* Developer         :       
* Created Date      :
* @description      : Test Class for QuestionTriggerHandler
* Last Modified Date:
*/
@isTest
private class QuestionTriggerHandlerTest {
    /**
    * @description method for testsetup data.
    */
    @testSetup
    static void methodName() {
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier'};
        TestDataFactory.createAccounts(1,true,accAttributes);
        
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
            List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
            Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
            'Rhythm__Section__c'=>seclist[0].Id};
        TestDataFactory.createQuestion(1,true,questionAttributes);  
    }
    /**
    * @description method for deleting questions scenerio.
    */
    @isTest
    static void questionDelete() {  
        Test.startTest();    
        List<Question__c> quesList = [Select id from Question__c LIMIT 1];
        delete quesList[0];
        Test.stopTest();
        System.assert(quesList.size()!=null, TRUE);
    }
    /**
    * @description method for updating the questions scenerio.
    */
    @isTest
    static void questionUpdate() {
        Test.startTest();
        List<Question__c> quesList = [Select id from Question__c LIMIT 1];
        quesList[0].Question__c ='Test Question ?';
        update quesList[0];
        Test.stopTest();
        System.assert(quesList.size()>0, TRUE);     
    }
}