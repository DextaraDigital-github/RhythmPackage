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
    private static UserSelector selector = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern 
    * @return 
    */
    public static UserSelector getInstance(){
        if(selector == null){
            selector = new UserSelector();
        }
        return selector;
    }
    
    /**
    * @description Fetches the User records w.r.t fields, filter, child queries, etc.
    * @param userIds It is a List of all recordId's.
    * @return Map of Id and its User record
    */
    public Map<Id,User> fetchUsers(List<String> userIds){
            try{
                List<User> userList = [SELECT Id, Email, Contact.AccountId, Contact.Account.Name FROM USER where Id IN :userIds WITH SECURITY_ENFORCED];
                return new Map<Id,User>(userList);
            }catch(Exception e){
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
}