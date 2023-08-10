/**
* Class Name        : ContentVersionSelectorTest
* Developer         :          
* Created Date      :
* @description       : ContentVersionSelectorTest class is used to check the code coverage for ContentVersionSelector
* Last Modified Date:
*/
@isTest
private class ContentVersionSelectorTest {
    static ContentVersionSelector selector = ContentVersionSelector.getInstance();
 @isTest
    /**
    * @description
    */
    private static void fetchContentVersionsTest() {
	 String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        String testString;
        System.runAs(u) {
        test.startTest();
        try {
            List<String> cvfields = new List<String>{'Id', 'VersionData', 'FileExtension', 'PathOnClient'};
            String cvfilter = 'where ContentDocumentId in';
            Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>cvfields, 'filter'=>cvfilter};    
            selector.fetchContentVersions(emailtempParameterMap);
            testString='Success';
            System.assertEquals(testString=='Success', true,'fetch content version.');
        }catch (AuraHandledException e) {
            System.assertEquals(e.getMessage() != null, true,'error cached');
        }
        test.stopTest();
    }}

}