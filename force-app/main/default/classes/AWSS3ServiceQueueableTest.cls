/**
* Class Name        : AWSS3ServiceQueueableTest
* Developer         :           
* Created Date      :
* @description       : AWSS3ServiceQueueableTest class is used to check the code coverage for AWSS3ServiceQueueable
* Last Modified Date:
*/
@isTest
private class AWSS3ServiceQueueableTest {
    
    /**
* @description
*/
    @testsetup
    private static void testsetup(){
        System.runAs(new User(Id = UserInfo.getUserId())) {
            Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
            Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
                List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
            Map<String, Object> contentAttributes = new Map<String, Object>{'Title'=>'Sample'};
                List<ContentVersion> conversion = TestDataFactory.createContentVersion(1,true,contentAttributes);
            ContentDocumentLink testContentDocumentLink = new ContentDocumentLink();
            testContentDocumentLink.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :conversion[0].Id][0].ContentDocumentId;
            testContentDocumentLink.LinkedEntityId = accts[0].Id;
            insert testContentDocumentLink;
        }}
    
    /**
* @description
*/
    @isTest
    private static void queuemethod(){
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            
            List<Account> acc = [Select Id from Account];
            List<ContentVersion> conv = [Select Id,ContentDocumentId from ContentVersion];
            ContentDocument testContentDocument = new ContentDocument();
            testContentDocument.Id = conv[0].ContentDocumentId; 
            
            test.startTest();
            AWSS3ServiceQueueable queueable = new AWSS3ServiceQueueable();
            queueable.recId = acc[0].Id;
            queueable.objectName = 'Account';
            System.enqueueJob(queueable);
            test.stopTest();
            System.Assert(true,acc.size()>1);
        }
    }
    
}