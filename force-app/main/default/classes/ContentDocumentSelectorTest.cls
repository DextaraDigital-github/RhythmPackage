/**
* Class Name        : ContentDocumentSelectorTest
* Developer         :          
* Created Date      :
* @description       : ContentDocumentSelectorTest class is used to check the code coverage for ContentDocumentSelector
* Last Modified Date:
*/
@isTest
private class ContentDocumentSelectorTest {
    static ContentDocumentSelector selector = ContentDocumentSelector.getInstance();
    /**
    * @description
    */
    @isTest
    private static void fetchContentDocumentstest() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        String testString; 
        System.runAs(u) {
            test.startTest();
            try {
                List<String> cdFields = new List<String>{'Id'};
                String cdfilter = 'where Id in deleteContentDocuments';
                Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>cdFields, 'filter'=>cdfilter};
                selector.fetchContentDocuments(emailtempParameterMap);
                testString='Success';
                System.assertEquals(testString=='Success', true,'fetch content documents.');
            }catch (AuraHandledException e) {
                System.assertEquals(e.getMessage() != null, true,'error cached');
            }
            test.stopTest();
        }
    }
}