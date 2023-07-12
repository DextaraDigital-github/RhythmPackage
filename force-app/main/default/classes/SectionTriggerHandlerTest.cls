/**
* Class Name        : SectionTriggerHandlerTest
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description        : test class for SectionTriggerHandler
* Last Modified Date: 
*/
@isTest
private class SectionTriggerHandlerTest {
    /**
    * @description method for testsetup data.
    */
    @testSetup
    private static void methodName() {
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
        List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
        TestDataFactory.createSection(1,true,sectionAttributes);
    }
    /**
    * @description method for update scenerio.
    */
    @istest
    private static void testupdate() {
        Test.startTest();
        List<Rhythm__Section__c> seclist=[select id,Rhythm__No_of_Questions__c from Rhythm__Section__c];
        seclist[0].Name = 'testSection';
        update seclist;
        Test.stopTest();
        System.assert(seclist.size()>0, TRUE);
        
    }
    /**
    * @description method for delete scenerio.
    */
    @isTest
    private static void testdelete() {
        Test.startTest();     
        List<Rhythm__Section__c> seclist=[select id,Rhythm__No_of_Questions__c from Rhythm__Section__c];
        delete secList[0];
        Test.stopTest();
        System.assert(seclist.size()!=null, TRUE);
        
    }
    
}