public class CAPAService {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    public static Map<string,List<string>> getPicklistValues()
    { 
        try{
            Map<String, List<string>> values = new Map<String,List<string>>{};
                List<string> picklistField=new List<string>{'Rhythm__Related_module__c','Rhythm__Priority__c','Rhythm__Status__c'};
                List<Schema.DescribeSobjectResult> results = Schema.describeSObjects(new List<String>{'Rhythm__Action__c'}); 
                for(Schema.DescribeSobjectResult res : results) {
                    for(string picklistdata:picklistField){
                        List<string>l=new List<string> ();
                        for (Schema.PicklistEntry entry : res.fields.getMap().get(picklistdata).getDescribe().getPicklistValues()) {
                            if (entry.isActive()) {
                                l.add(entry.getValue());
                            }
                        }
                        values.put(picklistdata,l);
                    }
                }
            return values;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    public static void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
        try{
            List<String> errorsList = new List<String>();
            if(isUpdate == false){
                Database.SaveResult[] results = safe.doInsert(actionResponse);
                errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            }
            else{
                Database.SaveResult[] saveResult = safe.doUpdate(actionResponse);
                errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
            }
            if(errorsList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorsList, ', ' ));
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        
    }
    public static List<Action__c> deleteActionData(string questionId, string accountAssessmentId)
    {
        
        List<Action__c> deleteData=CAPASelector.deleteActionData(questionId,accountAssessmentId);
        try{
            if(deleteData.isEmpty() == false){
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteData);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            return deleteData;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        
        
    }
    
     public static List<user> getRecordsList(string userName){
       List<user> userData= CAPASelector.getRecordsList(userName);
         return userData;
    }
    
     public static List<Action__c> getActionResponse(Map<String,string> actionResponse){
        
        List<Action__c> actionItemData=CAPASelector.getActionResponse(actionResponse);
          return actionItemData;
        
    }
    
    public static List<Action__c> getActionRecords(string accountAssessment){
        
         List<Action__c> actionRecords=CAPASelector.getActionRecords(accountAssessment);
        return actionRecords;
        
    }
    
     public static List<Action__c> actionRecords(){
        
        List<Action__c> actionItemRecords= CAPASelector.actionRecords();
          return actionItemRecords;
        
    }
    
    public static List<Action__c> selectedActionRecord(string actionid){
        
        List<Action__c> selectedActionRecord= CAPASelector.selectedActionRecord(actionid);
        return selectedActionRecord;
        
    }
    
     public static void send(String subject, String body, List<Id> userList){
        
         List<Messaging.SendEmailResult> mailInfo=SendEmail.send(subject,body,userList);
         System.debug('email'+mailInfo);
        
       
    }
    public static void notifyUsers(Map<string,object> actionData, String body, List<Id> userList){
        Object targetId=CAPASelector.notifyUsers();
        actionData.put('targetId',targetId);
        Set<string>userdata=new set<string>();
        for(Id userid:userList){
            userdata.add((String)userid);
            
        }      
         SendEmail.notifyUsers(actionData,body,userdata);
              
    }
    
    /**
* @description It is used to throw the exception
*/
    public class SecurityControllerException extends Exception{
    }    
    
}