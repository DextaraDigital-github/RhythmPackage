public class CAPASelector {
    /* public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
     private static Savepoint sp;*/
    
    public static List<user> getRecordsList(string userName)
    {
        /*userName='\'%'+userName+'%\'';
        String query =  'SELECT Name FROM user'
                        +' WHERE Name LIKE'+userName
                        +' WITH SECURITY_ENFORCED';
        return safe.doQuery(query);*/
        return [SELECT Name from user WHERE Name LIKE : userName WITH SECURITY_ENFORCED];
    }
    public static List<Action__c> getActionResponse(Map<String,string> actionResponse)
    {
        string questionId=actionResponse.get('Rhythm__Question__c');
        string accountAssessmentId=actionResponse.get('Rhythm__AccountAssessment__c');
        System.debug('kkkk'+questionId+''+accountAssessmentId);
        /*String query = 'SELECT Name,Action_Item_Description__c,Due_Date__c,Supplier__c,'
                     + 'Comments__c,Related_module__c,Related_Record__c,Ownership__r.Name,'
             		 + 'Priority__c,Status__c,Ownership__c,Assigned_To__c,Assigned_To__r.Name'
            		 + ' FROM Action__c'
                     +' WHERE Question__c=\'' + String.escapeSingleQuotes(questionId) + '\''
                     + ' AND AccountAssessment__c=\'' + String.escapeSingleQuotes(accountAssessmentId) + '\''
             		 + ' WITH SECURITY_ENFORCED';
        return safe.doQuery(query);*/
        return [SELECT Name,Action_Item_Description__c,Due_Date__c,Supplier__c,Comments__c,Related_module__c,OwnershipName__c,
                Related_Record__c,Ownership__r.Name,Priority__c,Status__c,Ownership__c,Assigned_To__c,Assigned_To__r.Name
                FROM Action__c WHERE Question__c=:questionId AND AccountAssessment__c=:accountAssessmentId
                WITH SECURITY_ENFORCED];
        
    }
    public static List<Action__c> getActionRecords(string accountAssessment)
    {
        
       /* String query =  'SELECT Question__c FROM Action__c'
            			+' WHERE AccountAssessment__c=\'' + String.escapeSingleQuotes(accountAssessment) + '\''
                        +' WITH SECURITY_ENFORCED';
        return safe.doQuery(query); */
        return [SELECT Question__c FROM Action__c WHERE AccountAssessment__c=:accountAssessment WITH SECURITY_ENFORCED];
    }
    public static List<Action__c> deleteActionData(string questionId,string accountAssessmentId)
    {
        
        /*String query =  'SELECT Question__c FROM Action__c'
             			+' WHERE Question__c=\'' + String.escapeSingleQuotes(questionId) + '\''
            			+ ' AND AccountAssessment__c=\'' + String.escapeSingleQuotes(accountAssessmentId) + '\''
                        +' WITH SECURITY_ENFORCED';
        return safe.doQuery(query); */
        return [SELECT Question__c FROM Action__c WHERE Question__c=:questionId AND AccountAssessment__c=:accountAssessmentId
                WITH SECURITY_ENFORCED];
    }
     public static List<Action__c> actionRecords()
    {
        String userId = userinfo.getuserid();
            /*userinfo.getuserid();*/
        /*String query =  'SELECT Name,Due_Date__c,'
                     + 'Related_Record__c,Ownership__r.Name,Status__c,OwnershipName__c,'
             		 + 'Priority__c,Assigned_To__r.Name,Flag_Status__c'
            		 + ' FROM Action__c'
            		 + ' WHERE Assigned_To__c=\'' + String.escapeSingleQuotes(userId) + '\''
                     + ' WITH SECURITY_ENFORCED';
        return safe.doQuery(query);*/
        return [SELECT Name,Due_Date__c,Related_Record__c,Ownership__r.Name,Status__c,OwnershipName__c,
                Priority__c,Assigned_To__r.Name,Flag_Status__c FROM Action__c WHERE Assigned_To__c=:userId
                WITH SECURITY_ENFORCED];
    }
     public static List<Action__c> selectedActionRecord(string actionid)
    {
        /*String query ='SELECT Name,Action_Item_Description__c,Due_Date__c,CreatedBy.Name,Flag_Status__c,'
                     + 'Comments__c,Related_module__c,Related_Record__c,Supplier__r.Name,OwnershipName__c,'
             		 + 'Priority__c,Status__c,Ownership__c,Ownership__r.Name,Assigned_To__c,Assigned_To__r.Name'
            		 + ' FROM Action__c'
                     + ' WHERE Id=\'' + String.escapeSingleQuotes(actionid) + '\''
             		 + ' WITH SECURITY_ENFORCED';
        return safe.doQuery(query);*/
        return [SELECT Name,Action_Item_Description__c,Due_Date__c,CreatedBy.Name,Flag_Status__c,Comments__c,
                Related_module__c,Related_Record__c,Supplier__r.Name,OwnershipName__c,Priority__c,Status__c,created__c,
                Ownership__c,Ownership__r.Name,Assigned_To__c,Assigned_To__r.Name FROM Action__c WHERE Id=:actionid
                WITH SECURITY_ENFORCED];
    }
   @AuraEnabled
    public static Date getCurrentDate(){
        return System.today();
    }

}