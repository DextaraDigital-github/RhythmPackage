/**
* Class Name        : EmailTemplateSelectorTest
* Developer         :          
* Created Date      :
* @description       : EmailTemplateSelectorTest class is used to check the code coverage for EmailTemplateSelector
* Last Modified Date:
*/
@isTest
public class EmailTemplateSelectorTest {
    /**
    * @description
    */
    @isTest
    private static void fetchEmailTemplatesTest() {
		String ids= UserInfo.getUserId();
		User u=[select id from user where id=:ids limit 1];
	System.runAs(u) {
        test.startTest();
        try {
            List<String> emailTempFields = new List<String>{'Id', 'Name', 'Subject', 'HtmlValue', 'IsBuilderContent'};
                List<String> childQuery = new List<String>{'(Select Id, ContentDocumentId, ContentDocument.FileType, ContentDocument.Title from ContentDocumentLinks)'};
                    Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>emailTempFields, 'childQuery'=>childQuery};
                        
                        EmailTemplateSelector.fetchEmailTemplates(emailtempParameterMap);
            
            //update the emailtempParameterMap to throw an exception
            
            emailtempParameterMap.put('filter', ' WHERE InvalidField__c = true');
            EmailTemplateSelector.fetchEmailTemplates(emailtempParameterMap);
        }
        catch (AuraHandledException e) {
            //System.assert(e.getMessage().contains('field'), 'field doesn\'t exists');
        }
        test.stopTest();
    }
}
}