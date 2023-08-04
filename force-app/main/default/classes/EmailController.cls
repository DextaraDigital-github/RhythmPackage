/**
* Class Name         : EmailController
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for building logic related to Email functionalities
* Last Modified Date : 
*/
public with sharing class EmailController {
     
    static EmailService service = EmailService.getInstance();
    /**
    * @description Fetches the Account records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch AccountAssessmentRelation records
    * @return List of AccountAssessmentRelation records
    */
    @AuraEnabled
    public static List<sObject> fetchAccounts(String parameterMap) {
        return service.fetchAccounts(parameterMap);
    }
    
    /**
    * @description Fetches the EmailTemplate records
    * @return List of Emailtemplate records
    */
    @AuraEnabled
    public static List<sObject> fetchEmailtemplates() {
        return service.fetchEmailTemplates();
    }
    
    /**
    * @description Sends bulk mails to Users related to Primary Contact of the selected Accounts
    * @param parameterMap Contains a JSON of all parameters required to send an email to selected accounts with the selected email template
    */
    @AuraEnabled
    public static void sendEmail(String parameterMap) {
        try{
            service.sendEmail(parameterMap);
        }catch(Exception e){
            string errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
    * @description Fetches the EmailMessage records based on search string and other parameters
    * @param parameterMap It is a stringified JSON of parameters required to fetch EmailMessage records
    * @return List of EmailMessage records
    */
    @AuraEnabled
    public static List<sObject> fetchEmailMessages(String parameterMap) {
        return service.fetchEmailMessages(parameterMap);
    }
}