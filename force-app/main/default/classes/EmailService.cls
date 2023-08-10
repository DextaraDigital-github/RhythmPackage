/**
* Class Name         : EmailService
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for building complex logic related to Email functionalities
* Last Modified Date : 
*/
public with sharing class EmailService {
    public static SecurityCheckController safe = new SecurityCheckController();   //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
    static EmailTemplateSelector selector = EmailTemplateSelector.getInstance();
    static AccountAssessmentRelationSelector accAssselector = AccountAssessmentRelationSelector.getInstance();
    static UserSelector usSelector = UserSelector.getInstance();
    private static EmailService service = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern
    * @return
    */
    public static EmailService getInstance() {
           if(service == null) {
                service = new EmailService();
            }
        return service;
    }
    
    /**
    * @description Fetches the Account records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch AccountAssessmentRelation records
    * @return List of AccountAssessmentRelation records
    */
    public List<sObject> fetchAccounts(String parameterMap) {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        String assessmentId = (String)newParameterMap.get('assessmentId');
        
        List<String> accFields = new List<String>{'Account__c', 'Account__r.Name'};
        String accFilter = ' WHERE Assessment__c = \'' + String.escapeSingleQuotes(assessmentId) + '\' ';
        Map<String,Object> accParameterMap = new Map<String,Object>{'fields'=>accFields, 'filter'=>accFilter};
        Map<Id,AccountAssessmentRelation__c> aarMap = accAssselector.fetchAccounts(accParameterMap);
        if(aarMap != null) {
            List<AccountAssessmentRelation__c> aarList = aarMap.values();
        	if(aarList != null) {
            	return aarList;
            }
        }
        return null;
    }
    
    /**
    * @description Fetches the Emailtemplate records
    * @return List of Emailtemplate records
    */
    public List<sObject> fetchEmailtemplates() {
        List<String> emailTempFields = new List<String>{'Id', 'Name', 'Subject', 'HtmlValue', 'IsBuilderContent'};
        List<String> childQuery = new List<String>{'(SELECT Id, ContentDocumentId, ContentDocument.FileType, ContentDocument.Title FROM ContentDocumentLinks)'};
        Map<String,Object> emailtempParameterMap = new Map<String,Object>{'fields'=>emailTempFields, 'childQuery'=>childQuery};
        Map<Id,EmailTemplate> emailTemplateMap = selector.fetchEmailTemplates(emailtempParameterMap);
        if(emailTemplateMap != null) {
            List<EmailTemplate> emailTemplateList = emailTemplateMap.values();
        	if(emailTemplateList != null) {
            	return emailTemplateList;
            }
        }
        return null;
    }
    
    /**
    * @description Sends bulk mails to Users related to Primary Contact of the selected Accounts
    * @param parameterMap Contains a JSON of all parameters required to send an email to selected accounts with the selected email template
    */
    public void sendEmail(String parameterMap) {
        try {
            Database.executeBatch(new sendEmailBatch(parameterMap),95);
        }
        catch(Exception e) {
            errorList = new List<ErrorTransactionLog__c>();
            errorRec = new ErrorTransactionLog__c();
            errorRec.Class_Name__c = 'EmailService';
            errorRec.Error_Stack_Trace__c = e.getStackTraceString();
            errorRec.Name = 'Error from EmailService>>SendEmailBatch';
            errorRec.LWC_Component_Name__c = '';
            errorRec.Method_Name__c = 'sendEmail';
            errorList.add(errorRec);
            safe.doInsert(errorList);
            throw new AuraHandledException(e.getMessage());   //Throws an exception
        }
    }
    
    /**
    * @description Fetches the EmailMessage records along with the Users based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch EmailMessage records
    * @return List of User records
    */
    public List<sObject> fetchEmailMessages(String parameterMap) {
        Map<String,Object> newParameterMap = (Map<String,Object>)JSON.deserializeUntyped(parameterMap);
        String assessmentId = (String)newParameterMap.get('assessmentId');
        
        List<String> userFields = new List<String>{'Id', 'Email', 'Contact.AccountId', 'Contact.Account.Name'};
        String userFilter=' WHERE Id IN (SELECT RelationId FROM EmailMessageRelation WHERE EmailMessage.RelatedToId = \''+String.escapeSingleQuotes(assessmentId)+'\' AND RelationType = \'ToAddress\') ';
        List<String> childQuery = new List<String>{' (SELECT Id, EmailMessageId, EmailMessage.FromName, EmailMessage.FromAddress, EmailMessage.CreatedDate, EmailMessage.Subject, EmailMessage.HtmlBody, EmailMessage.EmailTemplate.Name, EmailMessage.RelatedTo.Name, EmailMessage.Failed_Recipients__c FROM EmailMessageRelations WHERE EmailMessage.RelatedToId = \''+String.escapeSingleQuotes(assessmentId)+'\' AND RelationType = \'ToAddress\' ORDER BY EmailMessage.CreatedDate DESC) '};
        Map<String,Object> emParameterMap = new Map<String,Object>{'fields'=>userFields, 'filter'=>userFilter, 'childQuery'=>childQuery};
        Map<Id,User> userMap = usSelector.fetchUsers(emParameterMap);
        if(userMap != null) {
            List<User> userList = userMap.values();
        	if(userList != null) {
            	return userList;
            }
        }
        return null;
    }
}