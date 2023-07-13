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
    static void methodName() {
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        System.runAs(custUser) {
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
            List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
            TestDataFactory.createSection(1,true,sectionAttributes);
        }
    }
    /**
    * @description method for update scenerio.
    */
    @istest
    static void testupdate() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();
            List<Rhythm__Section__c> seclist=[select id,Rhythm__No_of_Questions__c from Rhythm__Section__c];
            seclist[0].Name = 'testSection';
            update seclist;
            Test.stopTest();
            System.assert(seclist.size()>0, TRUE);
        }
        
    }
    /**
    * @description method for delete scenerio.
    */
    @isTest
    static void testdelete() {
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
            Test.startTest();     
            List<Rhythm__Section__c> seclist=[select id,Rhythm__No_of_Questions__c from Rhythm__Section__c];
            delete secList[0];
            Test.stopTest();
            System.assert(seclist.size()!=null, TRUE);
        }
    }
    
}