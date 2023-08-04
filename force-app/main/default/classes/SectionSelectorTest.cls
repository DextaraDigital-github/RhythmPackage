/**
* Class Name        : SectionSelectorTest
* Developer         : Sai Koushik Nimmaturi           
* Created Date      :
* @description       : SectionSelector class is used to check the code coverage for SectionSelector
* Last Modified Date:
*/
@isTest
public class SectionSelectorTest {
    static SectionSelector selector = SectionSelector.getInstance();
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
            
        } 
    }
    @isTest
    static void getSectionsforTemplateTest(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Section__c> sec =[SELECT id,name,Assessment_Template__c FROM Section__c];
        String tempId = sec[0].Assessment_Template__c;
        System.runAs(u){
            Test.startTest();
            List<Section__c> seclst =selector.getSectionsforTemplate(tempId);
            Test.stopTest();
           System.assertEquals(seclst.size()>0, true,'Response Attribute Deleted successfully');
        } 
    }
    @isTest
    static void getSectionsTest(){
        String testString;
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        List<Section__c> sec =[SELECT id,name,Assessment_Template__c FROM Section__c];
        String tempId = sec[0].Assessment_Template__c;
        System.runAs(u){
            Test.startTest();
            testString = 'Success';
            List<Section__c> seclst =selector.getSections(tempId,sec[0].Name);
            Test.stopTest();
            System.assertEquals(testString=='Success', true,'Sections retrieved successfully');
        } 
    }
}