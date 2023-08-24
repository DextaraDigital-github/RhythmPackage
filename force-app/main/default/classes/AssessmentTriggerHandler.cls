/** 
* Class Name        : AssessmentTriggerHandler
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula           
* Created Date      : 
* @description        : It is used to perform the trigger logic.
* Last Modified Date: 
*/

public with sharing class AssessmentTriggerHandler implements ITriggerHandler{
    public static SecurityCheckController safe = new SecurityCheckController();
    private static Savepoint sp;//prudhvi to work
    public static TriggerFrameworkServiceController serviceController = new TriggerFrameworkServiceController();
    
    /**
    * @description To execute before insert logic
    * @param newList This is the new list of records.  
    */
    public void beforeInsert(List<sObject> newList) {
        getQuestionsCount(newList,null);
    }
    
     /**
    * @description To execute after insert logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterInsert(List<sObject> newList , Map<Id, sObject> newMap) {
      set<Id> templateIds = new set<Id>();
      for(Assessment__c assessment:(List<Assessment__c>)newList){
          if(String.isNotBlank(assessment.Template__c)){
              templateIds.add(assessment.Template__c);
          }
      }
      if(templateIds.isEmpty() == false){
          calculateAssessmentsCount(templateIds);
      }
    }
    
    /**
    * @description To execute before update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeUpdate(List<sObject> newList, Map<Id, sObject> newMap, List<sObject> oldList, Map<Id, sObject> oldMap) {
       
        for(sObject assmt:newMap.values()){
            Decimal supplierCount = (Decimal)assmt.get('Number_of_Invited_Suppliers__c');
            boolean isCriteriaMet = serviceController.checkEntryCriteria(assmt,oldMap.get(assmt.Id),'Assessment_c');
            if(isCriteriaMet && supplierCount > 0){
                assmt.addError('Assessment program in use, cannot be edited.');
            }
        }
        getQuestionsCount(newList, newMap);
    }
    
    /**
    * @description To execute after update logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
      @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterUpdate(List<sObject> newList, Map<Id, sObject> newMap,  List<sObject> oldList, Map<Id, sObject> oldMap) {
      Set<Id> assmentIdSet = new Set<Id>();
      Map<Id, Assessment__c> oldAssmtsMap = (Map<Id, Assessment__c>)oldMap;
      
      for(Assessment__c assmt:(List<Assessment__c>)newList){
        if((assmt.Start_Date__c != oldAssmtsMap.get(assmt.Id).Start_Date__c) && assmt.Start_Date__c == Date.Today()){
          assmentIdSet.add(assmt.Id);
        }
      }
      if(assmentIdSet.isEmpty() == false){
        sendUpdatedAssessments(assmentIdSet,newMap);
      }
      
    }
    
    /**
    * @description To execute before delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void beforeDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
      for(Assessment__c assmt:(List<Assessment__c>)oldMap.values()){
        Decimal supplierCount = (Decimal)assmt.get('Number_of_Invited_Suppliers__c');
        if(supplierCount > 0){
          assmt.addError('Assessment program in use, cannot be deleted.');
        }
      }
    }
     
    /**
    * @description To execute after delete logic
    * @param oldList This is the old list of records.
      @param oldMap This is the old map of records.
    */
    public void afterDelete(List<sObject> oldList , Map<Id, sObject> oldMap) {
      set<Id> templateIds = new set<Id>();
      for(Assessment__c assessment:(List<Assessment__c>)oldList){
          if(String.isNotBlank(assessment.Template__c)){
              templateIds.add(assessment.Template__c);
          }
      }
      if(templateIds.isEmpty() == false){
          calculateAssessmentsCount(templateIds);
      }
    }
    
    /**
    * @description To execute after undelete logic
    * @param newList This is the new list of records.
      @param newMap This is the new map of records.
    */
    public void afterUnDelete(List<sObject> newList, Map<Id, sObject> newMap) {
      set<Id> templateIds = new set<Id>();
      for(Assessment__c assessment:(List<Assessment__c>)newList){
          if(String.isNotBlank(assessment.Template__c)){
              templateIds.add(assessment.Template__c);
          }
      }
      if(templateIds.isEmpty() == false){
          calculateAssessmentsCount(templateIds);
      }
    }

    /**
    * @description To calculate questions count
    * @param newList This is the new list of records.
    * @param newMap This is the new map of records.
    */
    public static void getQuestionsCount(List<sObject> newList,Map<Id, sObject> newMap)
    {
        Map<Id,List<Assessment__c>> templateMap= new Map<Id,List<Assessment__c>>();
        for(Assessment__c assessment:(List<Assessment__c>)newList){
            if(templateMap.containsKey(assessment.Template__c)){
                templateMap.get(assessment.Template__c).add(assessment);
            }else{
            	templateMap.put(assessment.Template__c,new List<Assessment__c>{assessment});
            }
        }
        set<Id> templateIds = templateMap.keySet();
        //Map<String, Object> bindVariables = new Map<String, Object>{'templateIds' => templateIds};
        if ((Schema.sObjectType.Question__c.fields.Id.isAccessible()) && (Schema.sObjectType.Question__c.fields.Assessment_Template__c.isAccessible())) {
            
            AggregateResult[] templateGroup = [SELECT COUNT(Id) quesCount, Assessment_Template__c
                                              FROM Question__c
                                              WITH SECURITY_ENFORCED
                                              GROUP BY Assessment_Template__c
                                              HAVING Assessment_Template__c IN:templateIds];

            //AggregateResult[] templateGroup = safe.doQueryWithBinds(query,bindVariables);
            //AggregateResult[] templateGroup = database.query(query);
            //no need of aggregate query. plain query will resolve this issue.
            for (AggregateResult ar : templateGroup){
                String templateId = (Id)ar.get('Rhythm__Assessment_Template__c');
                for(Assessment__c assessment : templateMap.get(templateId) ){
                    assessment.Number_of_Questions__c = (Integer)ar.get('quesCount');
                    if(newMap!=null){
                        ((Assessment__c)newMap.get(assessment.Id)).Number_of_Questions__c = (Integer)ar.get('quesCount');
                    }
                }
            }
        }
    }

    /**
    * @description To calculate assessments count
    * @param templateIds This is the set of ids.
    */
    public static void calculateAssessmentsCount(set<Id> templateIds){
        List<Assessment_Template__c> templateList = new List<Assessment_Template__c>();
        for(Assessment_Template__c tmp:[SELECT Id,(SELECT Id FROM Assessments__r) FROM Assessment_Template__c WHERE ID IN:templateIds WITH SECURITY_ENFORCED]){
            tmp.Number_of_Assessments__c = tmp.Assessments__r.size();
            templateList.add(tmp);
        }
        if (sp == null){
            sp = Database.setSavepoint();
        }
        if(templateList.isEmpty() == false){
            Database.SaveResult[] saveResult = safe.doUpdate(templateList);
            List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
            if(errorList.size()>0){
                Database.rollback(sp);
                throw new SecurityControllerException(String.join( errorList, ', ' ));
            }
        }
    }

    /**
    * @description To send assessment emails
    * @param assmentIdSet This is the set of ids.
    * @param newMap This is the new map of records.
    */
    public static void sendUpdatedAssessments(Set<Id> assmentIdSet,Map<Id, sObject> newMap){
      try{
        Map<Id, Assessment__c> assmtMap = (Map<Id, Assessment__c>)newMap;
        List<AccountAssessmentRelation__c> accountAssessRelnsList = new List<AccountAssessmentRelation__c>();
        for(Assessment_Supplier__c assSup:[SELECT Id,Account__r.Name,Account__c,Assessment__c,Status__c FROM Assessment_Supplier__c WHERE Assessment__c IN:assmentIdSet WITH SECURITY_ENFORCED]){
          AccountAssessmentRelation__c accAssessReln = new AccountAssessmentRelation__c();

          accAssessReln.Name = assSup.Account__r.Name;
          accAssessReln.Account__c = assSup.Account__c;
          accAssessReln.Assessment__c =assSup.Assessment__c;
          accAssessReln.Start_Date__c = assmtMap.get(assSup.Assessment__c).Start_Date__c;
          if(assmtMap.get(assSup.Assessment__c).End_Date__c != null){
              accAssessReln.End_Date__c = assmtMap.get(assSup.Assessment__c).End_Date__c;
          }
          accAssessReln.Status__c = 'New';
          accountAssessRelnsList.add(accAssessReln);
        }
        Set<Id> successRecordsIdSet = new Set<Id>();
        List<String> errorsList = new List<String>();
        if(accountAssessRelnsList.isEmpty() == false){
            Database.SaveResult[] results = safe.doInsert(accountAssessRelnsList);
            errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
            for(Database.SaveResult result : results){
                if(result.isSuccess()){
                    successRecordsIdSet.add(result.getId());
                }
            }
        }
        if(errorsList.size()>0){
          Database.rollback(sp);
          throw new SecurityControllerException(String.join(errorsList, ', ' ));
        }
        if(successRecordsIdSet.isEmpty() == false){
          AssessmentController.sendEmails(successRecordsIdSet,'');
        }
      }catch(Exception e){
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