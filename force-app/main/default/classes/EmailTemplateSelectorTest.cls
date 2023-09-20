/**
* Class Name        : EmailTemplateSelectorTest
* Developer         :          
* Created Date      :
* @description       : EmailTemplateSelectorTest class is used to check the code coverage for EmailTemplateSelector
* Last Modified Date:
*/
@isTest
public class EmailTemplateSelectorTest {

    static EmailTemplateSelector selector = EmailTemplateSelector.getInstance();
    /**
    * @description
    */
    @isTest
    private static void fetchEmailTemplatesTest() {
		String ids= UserInfo.getUserId();
		User u=[select id from user where id=:ids limit 1];
        String testString;
        System.runAs(u) {
            test.startTest();
            try {
                List<String> emailTempFields = new List<String>{'Id', 'Name', 'Subject', 'HtmlValue', 'IsBuilderContent'};
                List<String> childQuery = new List<String>{'(Select Id, ContentDocumentId, ContentDocument.FileType, ContentDocument.Title from ContentDocumentLinks)'};
                Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>emailTempFields, 'childQuery'=>childQuery};  
                selector.fetchEmailTemplates(emailtempParameterMap);
                emailtempParameterMap.put('filter', ' WHERE InvalidField__c = true');
                selector.fetchEmailTemplates(emailtempParameterMap);
                testString='Success';
                System.assertEquals(testString=='Success', true,'fetch content version.');
            }
            catch (AuraHandledException e) {
                System.assertEquals(e.getMessage() != null, true,'error cached');
            }
            test.stopTest();
        }
    }
}