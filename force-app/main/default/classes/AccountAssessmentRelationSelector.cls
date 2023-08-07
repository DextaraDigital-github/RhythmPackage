/**
* Class Name         : AccountAssessmentRelationSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for returning data related to AccountAssessmentRelation__c object
* Last Modified Date : 
*/
public with sharing class AccountAssessmentRelationSelector {
    public static SecurityCheckController safe = new SecurityCheckController();   //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    private static AccountAssessmentRelationSelector selector = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern
    * @return
    */
    public static AccountAssessmentRelationSelector getInstance(){
           if(selector == null){
                selector = new AccountAssessmentRelationSelector();
            }
        return selector;
    }
    
    /**
    * @description Fetches the AccountAssessmentRelation__c records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its AccountAssessmentRelation__c record
    */
    public Map<Id,AccountAssessmentRelation__c> fetchAccounts(Map<String,Object> parameterMap) {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields!=null && !fields.isEmpty()) {
            filter = (filter == null)?'':filter;  
            String query = 'SELECT ' + String.join(fields,',') + ' FROM AccountAssessmentRelation__c ' + filter;
            try {
                List<AccountAssessmentRelation__c> aarList = safe.doQuery(query);
                return new Map<Id,AccountAssessmentRelation__c>(aarList);
            }
            catch(Exception e) {
                errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'AccountAssessmentRelationSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while fetching AccountAssessmentRelation__c records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchAccounts';
                errorList.add(errorRec);
                safe.doInsert(errorList);
                throw new AuraHandledException(e.getMessage());   //Throws an exception
            }
        }
        return null;
    }
}