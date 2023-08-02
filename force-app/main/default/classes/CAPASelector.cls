public with sharing class CAPASelector {

    private static CAPASelector selector = null; //private static instance of the class
    /**
    * @description Singleton Design Pattern 
    */
    public static CAPASelector getInstance(){
           if(selector == null){
                selector = new CAPASelector();
            }
        return selector;
    }

    // RED FOR NO COMMENTS
    public List<user> getRecordsList(string userName){
        return [SELECT Name from user WHERE Name LIKE : userName WITH SECURITY_ENFORCED];
    }
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

    public List<Action__c> getActionRecords(string accountAssessment){
        return [SELECT Question__c 
                FROM Action__c 
                WHERE AccountAssessment__c=:accountAssessment 
                WITH SECURITY_ENFORCED];
    }
    public List<Action__c> deleteActionData(string questionId,string accountAssessmentId){
        return  [SELECT Question__c,Assigned_To__c,Name 
                FROM Action__c 
                WHERE Question__c=:questionId 
                AND AccountAssessment__c=:accountAssessmentId
                WITH SECURITY_ENFORCED];
    }

    public List<Action__c> actionRecords(){
        String userId = userinfo.getuserid();
        return [SELECT Name,Due_Date__c,Related_Record__c,Ownership__r.Name,Status__c,OwnershipName__c,
                Priority__c,Assigned_To__r.Name,Flag_Status__c 
                FROM Action__c 
                WHERE Assigned_To__c=:userId
                WITH SECURITY_ENFORCED];
    }

    public List<Action__c> selectedActionRecord(string actionid){
        return [SELECT Name,Action_Item_Description__c,Due_Date__c,CreatedBy.Name,Flag_Status__c,Comments__c,
                Related_module__c,Related_Record__c,Related_Record__r.Name,Supplier__r.Name,OwnershipName__c,Priority__c,Status__c,created__c,
                Ownership__c,Ownership__r.Name,Assigned_To__c,Assigned_To__r.Name 
                FROM Action__c 
                WHERE Id=:actionid
                WITH SECURITY_ENFORCED];
    }

    // RED FLAG FOR SEC ENFORCED
    public Object notifyUsers(){
        customNotificationType custom= [SELECT Id 
                                        FROM customNotificationType 
                                        WHERE DeveloperName = 'Action_Notification'];
        return custom.Id;
    }

    // MOVED DATE METHOD TO Controller

}