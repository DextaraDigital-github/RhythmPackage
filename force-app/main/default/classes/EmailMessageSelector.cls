/**
* Class Name         : EmailMessageSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 23-08-2023
* @description       : This class is used for returning data related to EmailMessage object
* Last Modified Date : 
*/
public with sharing class EmailMessageSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    private static EmailMessageSelector selector = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern 
    */
    public static EmailMessageSelector getInstance() {
        if(selector == null) {
            selector = new EmailMessageSelector();
        }
        return selector;
    }
    
    /**
    * @description Fetches the EmailMessage records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its User record
    */
    public Map<Id,EmailMessage> fetchEmailMessages(Map<String,Object> parameterMap) {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        List<String> childQuery = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('childQuery')),List<String>.class);
        if(fields != null && !fields.isEmpty()) {
            filter = (filter == null)?'':filter;
            String childQry = (childQuery !=  null && !childQuery.isEmpty())?(' , ' + String.join(childQuery, ', ')):'';
            String query = 'SELECT ' + String.join(fields,',') + childQry + ' FROM EmailMessage ' + filter;
            try {
                List<EmailMessage> emList = safe.doQuery(query);
                for(EmailMessage em:emList) {
                	SYstem.debug(em.EmailMessageRelations);
                }
                return new Map<Id,EmailMessage>(emList);
            }
            catch(Exception e) {
                errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'EmailMessageSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while creating EmailMessage records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchEmailMessages';
                errorList.add(errorRec);
                safe.doInsert(errorList);
                throw new AuraHandledException(e.getMessage());   //Throws an exception
            }
        }
        return null;
    }
}