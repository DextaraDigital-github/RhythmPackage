public with sharing class CAPASelector {

    private static CAPASelector selector = null; //private static instance of the class
    /**
    * @description Singleton Design Pattern 
    * @return
    */
    public static CAPASelector getInstance(){
           if(selector == null){
                selector = new CAPASelector();
            }
        return selector;
    }

    /**
    * @description To get the action records related to particular user.
    * @param userName logged in user's username.
    * @return
    */
    public List<user> getRecordsList(string userName){
        return [SELECT Name from user WHERE Name LIKE : userName WITH SECURITY_ENFORCED];
    }

    /**
    * @description To get the action records related to a question and response record.
    * @param actionResponse Map with action related data.
    * @return
    */
    public List<Action__c> getActionResponse(Map<String,string> actionResponse){
        string questionId=actionResponse.get('Rhythm__Question__c');
        string accountAssessmentId=actionResponse.get('Rhythm__AccountAssessment__c');
        return [SELECT Name,Action_Item_Description__c,Due_Date__c,Supplier__c,Comments__c,Related_module__c,OwnershipName__c,
                Related_Record__c,Ownership__r.Name,Priority__c,Status__c,Ownership__c,Assigned_To__c,Assigned_To__r.Name
                FROM Action__c 
                WHERE Question__c=:questionId 
                AND AccountAssessment__c=:accountAssessmentId
                WITH SECURITY_ENFORCED];
        
    }

     /**
    * @description To get the action records related to a response record.
    * @param accountAssessment response data.
    * @return
    */
    public List<Action__c> getActionRecords(string accountAssessment){
        return [SELECT Question__c 
                FROM Action__c 
                WHERE AccountAssessment__c=:accountAssessment 
                WITH SECURITY_ENFORCED];
    }

     /**
    * @description To delete the action records related to a question and response record.
    * @param questionId question record id.
    * @param accountAssessmentId response record id.
    * @return
    */
    public List<Action__c> deleteActionData(string questionId,string accountAssessmentId){
        return  [SELECT Question__c,Assigned_To__c,Name 
                FROM Action__c 
                WHERE Question__c=:questionId 
                AND AccountAssessment__c=:accountAssessmentId
                WITH SECURITY_ENFORCED];
    }

     /**
    * @description To get the action records.
    * @return
    */
    public List<Action__c> actionRecords(){
        String userId = userinfo.getuserid();
        return [SELECT Name,Due_Date__c,Related_Record__c,Related_Record__r.Name,Ownership__r.Name,Status__c,OwnershipName__c,
                Priority__c,Assigned_To__r.Name,Flag_Status__c 
                FROM Action__c 
                WHERE Assigned_To__c=:userId
                WITH SECURITY_ENFORCED
               ORDER BY CreatedDate DESC];
    }

     /**
    * @description To get the selected action record.
    * @param actionid action record id.
    * @return
    */
    public List<Action__c> selectedActionRecord(string actionid){
        return [SELECT Name,Action_Item_Description__c,Due_Date__c,CreatedBy.Name,Flag_Status__c,Comments__c,
                Related_module__c,Related_Record__c,Related_Record__r.Name,Supplier__r.Name,OwnershipName__c,Priority__c,Status__c,created__c,
                Ownership__c,Ownership__r.Name,Assigned_To__c,Assigned_To__r.Name 
                FROM Action__c 
                WHERE Id=:actionid
                WITH SECURITY_ENFORCED];
    }

    /**
    * @description To delete the existing CAPA.
    * @param deletedata data needs to be deleted.
    */
    public List<Action__c> deleteCapa(List<String> questionId, String accountAssessmentid ){
        List<Action__c> lst=  [SELECT Question__c,Assigned_To__c,Name 
                                FROM Action__c 
                                WHERE Question__c IN : questionId
                                AND AccountAssessment__c=: accountAssessmentid
                                WITH SECURITY_ENFORCED];
         return lst;
    }

     /**
    * @description To notify the user for CAPA.
    * @return
    */
    public Object notifyUsers(){
        customNotificationType custom= [SELECT Id 
                                        FROM customNotificationType 
                                        WHERE DeveloperName = 'Action_Notification'
                                        WITH SECURITY_ENFORCED];
        return custom.Id;
    }

}