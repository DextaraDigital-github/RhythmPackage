/**
* Class Name         : ContentVersionSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 12-07-2023
* @description       : This class is used for returning data related to ContentVersion object
* Last Modified Date : 
*/
public with sharing class ContentVersionSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    

    private static ContentVersionSelector selector = null; //private static instance of the class
    /**
    * @description Singleton Design Pattern
    * @return
    */
    public static ContentVersionSelector getInstance(){
           if(selector == null){
                selector = new ContentVersionSelector();
            }
        return selector;
    }

    /**
    * @description Fetches the ContentVersion records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its ContentVersion record
    */
    public Map<Id,ContentVersion> fetchContentVersions(Map<String,Object> parameterMap){
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields != null && !fields.isEmpty()){
            filter = (filter == null)?'':filter;
            String query = 'SELECT ' + String.join(fields,',')+' FROM ContentVersion '+filter;
            try{
                List<ContentVersion> contentVersionList = safe.doQuery(query);
                return new Map<Id,ContentVersion>(contentVersionList);
            }
            catch(Exception e){
                errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'ContentVersionSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while fetching ContentVersion records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchContentVersions';
                errorList.add(errorRec);
                safe.doInsert(errorList);
                throw new AuraHandledException(e.getMessage());   //Throws an exception
            }
        }
        return null;
    }
}