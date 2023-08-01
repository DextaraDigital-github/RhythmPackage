/**
* Class Name        : ContentVersionSelectorTest
* Developer         :          
* Created Date      :
* @description       : ContentVersionSelectorTest class is used to check the code coverage for ContentVersionSelector
* Last Modified Date:
*/
@isTest
private class ContentVersionSelectorTest {
 @isTest
    /**
    * @description
    */
    private static void fetchContentVersionsTest() {
	 String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
        test.startTest();
        try {
            List<String> cvfields = new List<String>{'Id', 'VersionData', 'FileExtension', 'PathOnClient'};
                String cvfilter = 'where ContentDocumentId in';
                    Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>cvfields, 'filter'=>cvfilter};
                        
                        ContentVersionSelector.fetchContentVersions(emailtempParameterMap);
            
            
       
        }
        catch (AuraHandledException e) {
            //System.assert(e.getMessage().contains('field'), 'field doesn\'t exists');
        }
        test.stopTest();
    }}

}