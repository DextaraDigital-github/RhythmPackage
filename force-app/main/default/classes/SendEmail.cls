/**
* Class Name         : SendEmailBatch
* Developer          : Sri Kushal Reddy N           
* Created Date       : 26-07-2023
* @description       : This class is used for sending mails to limited list of Users
* Last Modified Date : 
*/
public with sharing class SendEmail {
    public static SecurityCheckController safe = new SecurityCheckController();  //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
    /**
    * @description Sends an email to a list of users with a custom subject and body
    * @param subject Contains subject of the email
    * @param body Contains body of the email
    * @param userList Contains a list of users to whom the emails should be sent
    * @return List of Messaging.SendEmailResult (contains status of the sent emails)
    */
    public static List<Messaging.SendEmailResult> send(String subject, String body, List<Id> userList) {
        if(subject != null && String.isNotBlank(subject) && body != null && String.isNotBlank(body) && userList !=null && !userList.isEmpty()) {
            List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            for(Id userId:userList) {
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setSubject(subject);
                email.setHtmlBody(body);
                email.setTreatTargetObjectAsRecipient(true);
                email.setTargetObjectId(userId);
                email.setSaveAsActivity(false);
                emailList.add(email);
            }
            try {
            	return Messaging.sendEmail(emailList);
            }
            catch(Exception e) {
				errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'UserSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while creating User records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchUsers';
                errorList.add(errorRec);
                safe.doInsert(errorList);
                throw new AuraHandledException(e.getMessage());   //Throws an exception                
            }
        }
        return null;
    }
     
     public static void notifyUsers(Map<string,object> actionData, String body, Set<String> recipientsIds) {
        Messaging.CustomNotification notification = new Messaging.CustomNotification();
         string subject=(String)actionData.get('Name');
         string recordid=(string)actionData.get('Id');
        notification.setTitle(subject);
        notification.setBody(body);
         notification.setNotificationTypeId('0ML7e000000L4wFGAS');
         notification.setTargetId(recordid);
        try {
            notification.send(recipientsIds);
        }
        catch (Exception e) {
            System.debug('Problem sending notification: ' + e.getMessage());
        }
    }
    
    /**
    * @description Sends an email to a list of users using an email template
    * @param templateId Contains Id of the email template which should be used to send the email
    * @param userList Contains a list of users to whom the emails should be sent
    * @return List of Messaging.SendEmailResult (contains status of the sent emails)
    */
    public static List<Messaging.SendEmailResult> send(Id templateId, List<Id> userList) {
        if(templateId != null && String.isNotBlank(String.valueOf(templateId)) && userList !=null && !userList.isEmpty()) {
            List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            for(Id userId:userList) {
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setTemplateId(templateId);
                email.setTreatTargetObjectAsRecipient(true);
                email.setTargetObjectId(userId);
                emailList.add(email);
            }
            try {
            	return Messaging.sendEmail(emailList);
            }
            catch(Exception e) {
				errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'UserSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while creating User records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchUsers';
                errorList.add(errorRec);
                safe.doInsert(errorList);
                throw new AuraHandledException(e.getMessage());   //Throws an exception                
            }
        }
        return null;
    }
}