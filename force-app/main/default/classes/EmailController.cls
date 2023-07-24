/**
* Class Name         : EmailController
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for building logic related to Email functionalities
* Last Modified Date : 
*/
public with sharing class EmailController {
     
    /**
    * @description Fetches the Account records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch AccountAssessmentRelation records
    * @return List of AccountAssessmentRelation records
    */
    @AuraEnabled
    public static List<sObject> fetchAccounts(String parameterMap)
    {
        return EmailService.fetchAccounts(parameterMap);
    }
    
    /**
    * @description Fetches the EmailTemplate records
    * @return List of Emailtemplate records
    */
    @AuraEnabled
    public static List<EmailTemplate> fetchEmailtemplates()
    {
        return EmailService.fetchEmailTemplates();
    }
    
    /**
    * @description Sends bulk mails to Users related to Primary Contact of the selected Accounts
    * @param parameterMap Contains a JSON of all parameters required to send an email to selected accounts with the selected email template
    */
    @AuraEnabled
    public static void sendEmail(String parameterMap)
    {
        EmailService.sendEmail(parameterMap);
    }
    
    /**
    * @description Fetches the User records along with their Email Messages based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch User records
    * @return List of User records
    */
    @AuraEnabled
    public static List<sObject> fetchEmailMessages(String parameterMap)
    {
        return EmailService.fetchEmailMessages(parameterMap);
    }
}