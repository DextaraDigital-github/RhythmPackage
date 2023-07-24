/**
* Class Name        : AWSS3Test
* Developer         :           
* Created Date      :
* @description       : AWSS3Test class is used to check the code coverage for AWSS3Service
* Last Modified Date:
*/
@isTest
private class AWSS3Test {
    /**
* @description
*/
    @testSetup
    private static void testsetup(){
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
            List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
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
        System.debug('testContentDocumentLink='+testContentDocumentLink);
        
    }
    
    /**
* @description
*/
    @isTest
    private static void testGetAuthenticationData() {
        Rhythm__S3Configuration__mdt config1 = new Rhythm__S3Configuration__mdt();
        config1.Rhythm__Value__c = 'Config1';
        Rhythm__S3Configuration__mdt config2 = new Rhythm__S3Configuration__mdt();
        config2.Rhythm__Value__c = 'Config2';
        AWSS3Service aws=new AWSS3Service();
        Test.startTest();
        List<s3configuration__mdt> result = AWSS3Controller.getAuthenticationData();
        Test.stopTest(); 
        System.assertEquals(6, result.size(), 'Incorrect number of records returned');
    }
    
    /**
* @description
*/
    @isTest
    private  static void testGetFileSignedUrl() {   
        Test.startTest();
        String result = AWSS3Controller.getFileSignedUrl('location', 'file', 60);
        String res=AWSS3Service.convertToHex('01','test');
        String resEncode=AWSS3Service.uriEncode('01*',true);
        Test.stopTest();
    }
    
    /**
* @description
*/
    @isTest
    private  static void testUploadFiles() {
        List<Account> acc = [Select Id,Name from Account];
        Test.startTest();
        Boolean result = AWSS3Controller.uploadFiles(acc[0].Id, 'Account');
        String res=AWSS3Service.convertToHex('c','test');
        Test.stopTest();
        System.assertEquals(1,acc.size());
    }
    
    /**
* @description
*/
    private static testmethod void awsTest(){
        Dom.Document doc = new Dom.Document();
        Dom.Xmlnode rootNode = doc.createRootElement('TestReport', null, null);
        Dom.Xmlnode childNode = rootNode.addChildElement('detail', null, null);
        test.startTest(); 
        AWS.getChildNodeBoolean(rootNode,'Rhythm','detail');
        AWS.getChildNodeInteger(rootNode,'Rhythm','rootNode');
        AWS.getChildNodeText(rootNode,'Rhythm','rootNode');
        AWS.ServiceException ai = new AWS.ServiceException(rootNode);
        test.stopTest();
    }
}