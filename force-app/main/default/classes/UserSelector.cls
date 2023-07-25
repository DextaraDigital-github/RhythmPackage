/**
* Class Name         : UserSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 11-07-2023
* @description       : This class is used for returning data related to User object
* Last Modified Date : 
*/
public with sharing class UserSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
    /**
    * @description Fetches the User records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its User record
    */
    public static Map<Id,User> fetchUsers(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        List<String> childQuery = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('childQuery')),List<String>.class);
        if(fields != null && !fields.isEmpty())
        {
            filter = (filter == null)?'':filter;
            String childQry = (childQuery !=  null && !childQuery.isEmpty())?(' , ' + String.join(childQuery, ', ')):'';
            String query = 'SELECT ' + String.join(fields,',') + childQry + ' FROM User ' + filter;
            try
            {
                List<User> userList = safe.doQuery(query);
                return new Map<Id,User>(userList);
            }
            catch(Exception e)
            {
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