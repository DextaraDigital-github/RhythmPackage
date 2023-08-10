public with sharing class CAPAService {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;

    private static CAPAService service = null; //private static instance of the class
    static CAPASelector selector = CAPASelector.getInstance();
    /**
    * @description Singleton Design Pattern 
    */
    public static CAPAService getInstance(){
           if(service == null){
                service = new CAPAService();
            }
        return service;
    }

    // RED FOR NO COMMENTS
    public Map<string,List<string>> getPicklistValues(){
        try{
            if ((!Schema.sObjectType.Action__c.isAccessible())
                || (!Schema.sObjectType.Action__c.fields.Related_module__c.isAccessible())
                || (!Schema.sObjectType.Action__c.fields.Priority__c.isAccessible())
                || (!Schema.sObjectType.Action__c.fields.Status__c.isAccessible())) {
                return null;
            }
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

    public void saveActionResponse(List<SObject> actionResponse, Boolean isUpdate){
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

    public List<Action__c> deleteActionData(string questionId, string accountAssessmentId){
        List<Action__c> deleteData=selector.deleteActionData(questionId,accountAssessmentId);
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
    
    public List<user> getRecordsList(string userName){
       List<user> userData= selector.getRecordsList(userName);
        return userData;
    }
    
    public List<Action__c> getActionResponse(Map<String,string> actionResponse){
        List<Action__c> actionItemData = selector.getActionResponse(actionResponse);
        return actionItemData;
    }
    
    public List<Action__c> getActionRecords(string accountAssessment){
        List<Action__c> actionRecords = selector.getActionRecords(accountAssessment);
        return actionRecords;
    }
    
     public List<Action__c> actionRecords(){
        List<Action__c> actionItemRecords = selector.actionRecords();
        return actionItemRecords;
    }
    
    public List<Action__c> selectedActionRecord(string actionid){
        List<Action__c> selectedActionRecord= selector.selectedActionRecord(actionid);
        return selectedActionRecord;
    }

    public void send(String subject, String body, List<Id> userList){
        List<Messaging.SendEmailResult> mailInfo = SendEmail.send(subject,body,userList);
    }

    public void notifyUsers(Map<string,object> actionData, String body, List<Id> userList){
        Object targetId = selector.notifyUsers();
        actionData.put('targetId',targetId);
        Set<string>userdata=new set<string>();
        for(Id userid:userList){
            userdata.add((String)userid);
        }      
        SendEmail.notifyUsers(actionData,body,userdata);  
    }
     
    public List<Action__c> deleteCapa(Map<string,object> deletedata){
        List<Object> lst = (List<Object>)deletedata.get('capaquestionId');
        System.debug('lst'+lst);
        List<string> questionId= new List<String>();
        for(Integer i=0;i<lst.size();i++){
         questionId.add(String.valueOf(lst[i]));   
        }
         string accountAssessmentid=(string)deletedata.get('accountassessmentId');
        List<Action__c> deleteDataContent=selector.deleteCapa(questionId,accountAssessmentid);
        System.debug('deleteDataContent koushik'+deleteDataContent);
        try{
            if(deleteDataContent.isEmpty() == false){
                
                List<Database.DeleteResult> deleteResult = safe.doDelete(deleteDataContent);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
            return deleteDataContent;
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
    
    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
}