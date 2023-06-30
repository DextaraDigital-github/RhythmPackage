public class AssessmentExpiryNotificationBatch implements Database.Batchable<sObject> {

    public Database.QueryLocator start(Database.BatchableContext bc){
        Date todayDate = Date.Today();
        string query = 'SELECT Id,Name,Account__r.Name,Account__r.Email__c FROM AccountAssessmentRelation__c WHERE Status__c != \'Submitted\' AND Assessment__r.Expiry_Reminder_Date__c=:todayDate';
        return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext bc, List<AccountAssessmentRelation__c> scope){
        List<ErrorTransactionLog__c> errorList = new List<ErrorTransactionLog__c>();
        List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
        try{
            for(AccountAssessmentRelation__c assRelRec:scope){
                List<String> sendTo = new List<String>();
                 if(String.isNotBlank(assRelRec.Account__r.Email__c)){
                    sendTo.add(assRelRec.Account__r.Email__c);
                 	Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                    mail.setToAddresses(sendTo);
                    mail.setSubject('Sample Survey - Reminder');
                    String body = '<html><body>'+
                    '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                    '<br><br>'+'Assessmet is going to end soon, we’d like to complete a short survey.'+
                    '<br><br><a href='+System.Label.Supplier_Portal_URL+assRelRec.Id+'>Take the survey now.</a>'+
                                    '<br><br>'+'Kind regards,'+
                                    '<br>'+'Rhythm';
                    mail.setHtmlBody(body);
                    emailMessagesList.add(mail);
                }
                
            }
            if(emailMessagesList.isEmpty() == false){
                Messaging.sendEmail(emailMessagesList);
            }
        }catch(exception e){
            ErrorTransactionLog__c errorRec = new ErrorTransactionLog__c();
            errorRec.Class_Name__c = 'AssessmentExpiryNotificationBatch';
            errorRec.Error_Stack_Trace__c = e.getStackTraceString();
            errorRec.Name = 'Error Record';
            errorRec.LWC_Component_Name__c = '';
            errorRec.Method_Name__c = 'ExecuteMethod';
            errorList.add(errorRec);
        }
        if(errorList.isEmpty() == false){
            Database.SaveResult[] results = Database.insert(errorList, false);
        }
    }
    public void finish(Database.BatchableContext bc){
        // execute any post-processing operations
    }
}