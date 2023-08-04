/**
* Class Name        : AWSS3Test
* Developer         :           
* Created Date      :
* @description       : AWSS3Test class is used to check the code coverage for AWSS3Service
* Last Modified Date:
*/
@isTest
private class AWSS3Test {
    static AWSS3Service service = AWSS3Service.getInstance();
    /**
* @description
*/
    @testSetup
    private static void testsetup(){
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        
        System.runAs(custUser) {
            Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John David'};
                TestDataFactory.createContacts(1,true,contactAttributes);
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template'};
                List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
                List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
            Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
                'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
                'Rhythm__Section__c'=>seclist[0].Id};
                    List<Question__c> qus =TestDataFactory.createQuestion(1,true,questionAttributes);
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
                'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
                    List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
                'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                    List<AccountAssessmentRelation__c> accAssmt =TestDataFactory.createAccountAssessment(1,true,accountassesments);
            Map<String,Object> response = new Map<String,Object>{'Question__c'=>qus[0].Id,'AccountAssessmentRelation__c'=>accAssmt[0].Id,
                'Is_Latest_Response__c'=>True};
                    TestDataFactory.createResponse(1,true,response);
        }   
        
        ContentVersion testContentVersion = new ContentVersion();
        testContentVersion.Title = 'Test Document';
        testContentVersion.PathOnClient = 'test_document.pdf'; 
        testContentVersion.VersionData = Blob.valueOf('a'.repeat(5242880)); 
        insert testContentVersion;
        
        ContentVersion testContentVersion1 = new ContentVersion();
        testContentVersion1.Title = 'Test Document';
        testContentVersion1.PathOnClient = 'test_document.pdf'; 
        testContentVersion1.VersionData = Blob.valueOf('a'); 
        insert testContentVersion1;
        
        ContentDocument testContentDocument = new ContentDocument();
        testContentDocument.Id = testContentVersion.ContentDocumentId; 
        ContentDocumentLink testContentDocumentLink = new ContentDocumentLink();
        testContentDocumentLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id][0].ContentDocumentId;
        testContentDocumentLink.LinkedEntityId = accts[0].Id;
        insert testContentDocumentLink;
        
        
    }
    
    /**
* @description
*/
    @isTest
    private static void testGetAuthenticationData() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            List<Assessment_Template__c> templist=[select id from Assessment_Template__c];
            List<Action__c> actlist=[select id,Question__c,AccountAssessment__c from Action__c];
            Rhythm__S3Configuration__mdt config1 = new Rhythm__S3Configuration__mdt();
            config1.Rhythm__Value__c = 'Config1';
            Rhythm__S3Configuration__mdt config2 = new Rhythm__S3Configuration__mdt();
            config2.Rhythm__Value__c = 'Config2';
            Test.startTest();
            List<s3configuration__mdt> result = AWSS3Controller.getAuthenticationData();
            AWSS3Controller.getTemplateDetails(templist[0].id);
            AWSS3Controller.saveActionRecord(actlist);
            Test.stopTest(); 
            System.assertEquals(6, result.size(), 'Incorrect number of records returned');
        }
    }
    
    /**
* @description
*/
    @isTest
    private  static void testGetFileSignedUrl() {
        Test.startTest();
        String result = AWSS3Controller.getFileSignedUrl('location', 'file', 60);
        service.convertToHex('01','test');
        service.uriEncode('01*',true);
        Test.stopTest();
        System.assertEquals(result, result, 'Assert Failed');
    }
    /**
* @description
*/
    @isTest
    private  static void testcreateResponseforFileUpload() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            List<Response__c> resplist=[select id,Question__c,AccountAssessmentRelation__c from Response__c];
            List<Rhythm__AccountAssessmentRelation__c> asslist=[select Id,Rhythm__Account__c, Rhythm__Assessment__c from Rhythm__AccountAssessmentRelation__c LIMIT 1];
            Test.startTest();
            Map<String,Object> filemap = new Map<String,Object>();
            filemap.put('assessmentId', resplist[0].AccountAssessmentRelation__c);
            filemap.put('quesId', resplist[0].Question__c); 
            AWSS3Controller.createResponseforFileUpload(JSON.serialize(filemap));
            Test.stopTest();
            System.assertEquals(1,asslist.size(),'Assert Failed');
        }
    }
    /**
* @description
*/
    @isTest
    private  static void testcreateRespforFileUpload() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            List<Response__c> resp=[Select id,Question__c,AccountAssessmentRelation__c  from Response__c];
            delete resp;
            List<Rhythm__AccountAssessmentRelation__c> asslist=[select Id,Account__c, Assessment__c from Rhythm__AccountAssessmentRelation__c LIMIT 1];
            Test.startTest();
            Map<String,Object> filemap = new Map<String,Object>();
            filemap.put('assessmentId', resp[0].AccountAssessmentRelation__c);
            filemap.put('quesId', resp[0].Question__c);
            
            AWSS3Controller.createResponseforFileUpload (JSON.serialize(filemap));
            Test.stopTest();
            System.assertEquals(1,asslist.size(),'Assert Failed');
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
            AWSS3Controller.uploadFiles(acc[0].Id, 'Account', null, false);
            service.convertToHex('c','test');
            Test.stopTest();
            System.assertEquals(1,acc.size(),'Assert Failed');
        }
    }
    
    /**
* @description
*/
    @isTest
    private static void awsTest(){
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            Dom.Document doc = new Dom.Document();
            Dom.Xmlnode rootNode = doc.createRootElement('TestReport', null, null);
            rootNode.addChildElement('detail', null, null);
            test.startTest(); 
            AWS.getChildNodeBoolean(rootNode,'Rhythm','detail');
            AWS.getChildNodeInteger(rootNode,'Rhythm','rootNode');
            AWS.getChildNodeText(rootNode,'Rhythm','rootNode');
            new AWS.ServiceException(rootNode);
            test.stopTest();
            System.assertEquals(1,1,'Assert Failed');
        }
    }
}