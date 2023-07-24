/**
* Class Name         : EmailService
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for building complex logic related to Email functionalities
* Last Modified Date : 
*/
public with sharing class EmailService {
    
    /**
    * @description Fetches the Account records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch AccountAssessmentRelation records
    * @return List of AccountAssessmentRelation records
    */
    public static List<sObject> fetchAccounts(String parameterMap)
    {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        String assessmentId = (String)newParameterMap.get('assessmentId');
        String searchKey = (newParameterMap.get('searchKey')==null)?'':(String)newParameterMap.get('searchKey');
        
        List<String> accFields = new List<String>{'Account__c', 'Account__r.Name'};
        String accFilter = 'where Assessment__c = \''+assessmentId+'\' AND Account__r.Name like \'%'+searchKey+'%\''; // use string.escapeSingleQuotes()
        Map<String,Object> accParameterMap = new Map<String,Object>{'fields'=>accFields, 'filter'=>accFilter};
        return AccountAssessmentRelationSelector.fetchAccounts(accParameterMap).values();
    }
    
    /**
    * @description Fetches the Emailtemplate records
    * @return List of Emailtemplate records
    */
    public static List<sObject> fetchEmailtemplates()
    {
        List<String> emailTempFields = new List<String>{'Id', 'Name', 'Subject', 'HtmlValue', 'IsBuilderContent'};
        List<String> childQuery = new List<String>{'(Select Id, ContentDocumentId, ContentDocument.FileType, ContentDocument.Title from ContentDocumentLinks)'};
        Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>emailTempFields, 'childQuery'=>childQuery};
        return EmailTemplateSelector.fetchEmailTemplates(emailtempParameterMap).values();
    }
    
    /**
    * @description Sends bulk mails to Users related to Primary Contact of the selected Accounts
    * @param parameterMap Contains a JSON of all parameters required to send an email to selected accounts with the selected email template
    */
    public static void sendEmail(String parameterMap)
    {
        try
        {
            Map<String,Object> newParameterMap = (Map<String,Object>)json.deserializeUntyped(parameterMap);
        	Database.executeBatch(new sendEmailBatch(newParameterMap),95);
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description Fetches the User along with their EmailMessage records along with the Users based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch User records
    * @return List of User records
    */
    public static List<sObject> fetchEmailMessages(String parameterMap)
    {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        String assessmentId = (String)newParameterMap.get('assessmentId');
        
        List<String> userFields = new List<String>{'Id', 'Contact.AccountId', 'Contact.Account.Name'};
        String userFilter=' WHERE Id IN (SELECT RelationId FROM EmailMessageRelation WHERE EmailMessage.RelatedToId = \''+String.escapeSingleQuotes(assessmentId)+'\' AND RelationType = \'ToAddress\') ';
        List<String> childQuery = new List<String>{' (SELECT Id, EmailMessageId, EmailMessage.FromName, EmailMessage.CreatedDate, EmailMessage.Subject, EmailMessage.HtmlBody, EmailMessage.EmailTemplate.Name FROM EmailMessageRelations WHERE EmailMessage.RelatedToId = \''+String.escapeSingleQuotes(assessmentId)+'\' AND RelationType = \'ToAddress\') '};
        Map<String,Object> emParameterMap = new Map<String,Object>{'fields'=>userFields, 'filter'=>userFilter, 'childQuery'=>childQuery};
        return UserSelector.fetchUsers(emParameterMap).values();
    }
}