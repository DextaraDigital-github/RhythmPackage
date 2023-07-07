/* 
* Class Name        : AssessmentTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* Description       : It is used to send the assessment notification to suppliers.
* Last Modified Date: 
*/

public class SendAssessmentNotificationsBatch implements Database.Batchable<sObject> {

    /**
    * @description Start method to query the required records.
    * @return
    */
    public Database.QueryLocator start(Database.BatchableContext bc){
        Date todayDate = Date.Today();
        string query = 'SELECT Id,Name,Assessment__r.Start_Date__c,Assessment__r.End_Date__c,Account__r.Name,Account__c,Assessment__c FROM Assessment_Supplier__c WHERE Status__c= \'Active\' AND Assessment__r.Start_Date__c=:todayDate';
        return Database.getQueryLocator(query);
    }

     /**
    * @description execute method to process the records.
    */
    public void execute(Database.BatchableContext bc, List<Assessment_Supplier__c> scope){
        List<ErrorTransactionLog__c> errorList = new List<ErrorTransactionLog__c>();
        try{
            Configuration__mdt siteData = Configuration__mdt.getInstance('Site_URL');
            List<Messaging.SingleEmailMessage> emailMessagesList = new List<Messaging.SingleEmailMessage>();
            List<AccountAssessmentRelation__c> accountAssessRelnsList = new List<AccountAssessmentRelation__c>();
            for(Assessment_Supplier__c assSuppl:scope){
                AccountAssessmentRelation__c accAssessReln = new AccountAssessmentRelation__c();
                accAssessReln.Name = assSuppl.Account__r.Name;
                accAssessReln.Account__c = assSuppl.Account__c;
                accAssessReln.Assessment__c = assSuppl.Assessment__c;
                if(assSuppl.Assessment__r.Start_Date__c != null){
                    accAssessReln.Start_Date__c = assSuppl.Assessment__r.Start_Date__c;
                }
                if(assSuppl.Assessment__r.End_Date__c != null){
                    accAssessReln.End_Date__c = assSuppl.Assessment__r.End_Date__c;
                }
                accAssessReln.Status__c = 'New';
                accountAssessRelnsList.add(accAssessReln);
            }
            set<Id> successRecordsIdSet = new set<Id>();
            if(accountAssessRelnsList.isEmpty() == false){
                Database.SaveResult[] results = Database.insert(accountAssessRelnsList, false);
                for(Database.SaveResult result : results) {
                    if(result.isSuccess()){
                        successRecordsIdSet.add(result.getId());
                    } else {
                        for(Database.Error error : result.getErrors()) {
                        }
                    }
                }
            }
            if(successRecordsIdSet.isEmpty() == false){
               
                for(AccountAssessmentRelation__c assRelRec:[SELECT Id,Account__r.Name,Account__r.Email__c,Assessment__c FROM AccountAssessmentRelation__c WHERE ID IN:successRecordsIdSet]){
                    if(String.isNotBlank(assRelRec.Account__r.Email__c) && siteData != null){
                        List<String> sendTo = new List<String>();
                        sendTo.add(assRelRec.Account__r.Email__c);
                        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
                        mail.setToAddresses(sendTo);
                        mail.setSubject('Sample Survey');
                        String body = '<html><body>'+
                        '<br><br>'+'Dear '+assRelRec.Account__r.Name+
                        '<br><br>'+'we’d like to complete a short survey.'+
                        '<br><br><a href='+siteData.Site_URL__c+assRelRec.Id+'>Take the survey now.</a>'+
                                        '<br><br>'+'Kind regards,'+
                                        '<br>'+'Rhythm';
                        mail.setHtmlBody(body);
                        emailMessagesList.add(mail);
                    }
                    
                }
            }
            if(emailMessagesList.isEmpty() == false){
                List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emailMessagesList);
                for(Messaging.SendEmailResult result :emailResults) {                                    
                    if(!result.IsSuccess()) {                    
                        List<Messaging.SendEmailError> errors = result.getErrors();
                        if (errors.size() > 0){
                            Messaging.SendEmailError err = errors[0];
                        }                	
                    }
                }
            }
        }catch(exception e){
            ErrorTransactionLog__c errorRec = new ErrorTransactionLog__c();
            errorRec.Class_Name__c = 'SendAssessmentNotificationsBatch';
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
    /**
    * @description execute any post-processing operations.
    */
    public void finish(Database.BatchableContext bc){
        // execute any post-processing operations
    }
}