/**
* Class Name        : AWSS3ControllerTest
* Developer         :          
* Created Date      :
* @description       : AWSS3ControllerTest class is used to check the code coverage for AWSS3Controller
* Last Modified Date:
*/
@isTest
private class AWSS3ControllerTest {

    /**
* @description
*/
    @testSetup
    private static void testsetup(){
User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        System.runAs(custUser) {
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        ContentVersion testContentVersion = new ContentVersion();
        testContentVersion.Title = 'Test Document';
        testContentVersion.PathOnClient = 'test_document.pdf'; 
        testContentVersion.VersionData = Blob.valueOf('Sample file data'); 
        insert testContentVersion;
        
        ContentDocument testContentDocument = new ContentDocument();
        testContentDocument.Id = testContentVersion.ContentDocumentId; 
        ContentDocumentLink testContentDocumentLink = new ContentDocumentLink();
        testContentDocumentLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id][0].ContentDocumentId;
        testContentDocumentLink.LinkedEntityId = accts[0].Id;
        insert testContentDocumentLink;
        System.debug('testContentDocumentLink='+testContentDocumentLink);

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
            
            
            
            
            
            
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
                'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
                    List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
                'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                    List<Rhythm__AccountAssessmentRelation__c> accAssessment=TestDataFactory.createAccountAssessment(1,true,accountassesments);
            
            Map<String, Object> actionAttributes =new Map<String, Object>{'Name'=>'test action','Rhythm__Assigned_To__c'=>custUser.id,'Rhythm__Question__c'=>ques[0].id,'Rhythm__AccountAssessment__c'=>accAssessment[0].id};
                List<Action__c> acclist=TestDataFactory.createAction(1,true,actionAttributes);
    }
}

    /**
* @description
*/
    @isTest
    private static void testGetAuthenticationData() {
 		String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
        Rhythm__S3Configuration__mdt config1 = new Rhythm__S3Configuration__mdt();
        config1.Rhythm__Value__c = 'Config1';
        Rhythm__S3Configuration__mdt config2 = new Rhythm__S3Configuration__mdt();
        config2.Rhythm__Value__c = 'Config2';
        
        Test.startTest();
        List<s3configuration__mdt> result = AWSS3Controller.getAuthenticationData();
        Test.stopTest();
        System.assertEquals(6, result.size(), 'Incorrect number of records returned');
    }
}

    /**
* @description
*/
    @isTest
    private  static void testGetFileSignedUrl() {
         String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {

        Test.startTest();
        String result = AWSS3Controller.getFileSignedUrl('location', 'file', 60);
        Test.stopTest();
        
    }
}

    /**
* @description
*/
    @isTest
    private  static void testUploadFiles() {
         String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {

        List<Account> acc = [Select Id,Name from Account];
        Test.startTest();
        Boolean result = AWSS3Controller.uploadFiles(acc[0].Id, 'Account');
        Test.stopTest();
        
        System.assertEquals(1,acc.size());
    }
}

/**
* @description
*/
    @isTest
    private  static void saveActionRecordTest() {
         String ids= UserInfo.getUserId();
        //User u=[select id from user where id=:ids limit 1];
		List<Action__c> actionResponse=[Select id,Question__c,AccountAssessment__c from Action__c limit 1];
        Action__c act = new Action__c();
        act.Question__c = actionResponse[0].Rhythm__Question__c;
        act.AccountAssessment__c = null ;
        List<Action__c> lst = new List<Action__c>();
        lst.add(act);
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
		Test.startTest();
        AWSS3Controller.saveActionRecord(lst);
        Test.stopTest();
       
    }
}
    @isTest
    private  static void saveActionRecordTest2() {
         String ids= UserInfo.getUserId();
        //User u=[select id from user where id=:ids limit 1];
		List<Action__c> actionResponse=[Select id,Question__c,AccountAssessment__c from Action__c limit 1];
        Action__c act = new Action__c();
        act.Question__c = actionResponse[0].Rhythm__Question__c;
        act.AccountAssessment__c = actionResponse[0].Rhythm__AccountAssessment__c;
        List<Action__c> lst = new List<Action__c>();
        lst.add(act);
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
		Test.startTest();
        AWSS3Controller.saveActionRecord(lst);
        Test.stopTest();
       
    }
}
        @isTest
    private  static void saveActionRecordTest3() {
         String ids= UserInfo.getUserId();
        //User u=[select id from user where id=:ids limit 1];
		List<Action__c> actionResponse=[Select id,Question__c,AccountAssessment__c from Action__c limit 1];
        Action__c act = new Action__c();
        act.Question__c = null;
        act.AccountAssessment__c = null;
        List<Action__c> lst = new List<Action__c>();
        lst.add(act);
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        System.runAs(u){
		Test.startTest();
        AWSS3Controller.saveActionRecord(lst);
        Test.stopTest();
       
    }
}

}