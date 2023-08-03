/** 
* Class Name        : AssessmentTemplateController
* Developer         : Priyanka         
* Created Date      : 
* @description        : AssessmentTemplateController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Sections,Questions.
* Last Modified Date: 23-06-2023
*/
public with sharing class AssessmentTemplateController {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work

/**
* @description get Section Records for LookupField.
* @param sectionName This is a name of the section.
* @param templateId This is a record id of an Template__c. 
* @return
*/    
    @AuraEnabled(cacheable=true)
    public static List<Section__c> getSections(String sectionName, string templateId) {
        List<Section__c> secList = new List<Section__c>();
        try{
            templateId = String.escapeSingleQuotes(templateId);
            if(string.isNotBlank(sectionName)) {
                String secName ='%'+ sectionName +'%';
                secList = [SELECT Id,Name
                            FROM Section__c
                            WHERE Assessment_Template__c = :templateId
                            AND Name LIKE :secName
                            WITH SECURITY_ENFORCED];
            }else {
                secList = [SELECT Id,Name
                            FROM Section__c
                            WHERE Assessment_Template__c = :templateId
                            WITH SECURITY_ENFORCED];
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return secList;
    }

/**
* @description Get the details of the Template.
* @param templateId This is a record id of an Template__c.
*@return
*/    
    @AuraEnabled(Cacheable=true)
    public static Boolean getTemplateDetails(String templateId) {
        try {
            Boolean hasStatusNew = false;
            templateId = String.escapeSingleQuotes(templateId);
            if(String.isNotBlank(templateId)) {
                List<Assessment_Template__c> assessmentList=  [SELECT Status__c
                                                                FROM Assessment_Template__c
                                                                WHERE Id= :templateId
                                                                WITH SECURITY_ENFORCED];
                Assessment_Template__c assessmentTemp = (AssessmentList.size()==1)?AssessmentList[0]:null;
                if(assessmentTemp  != null && assessmenttemp.Status__c.equalsIgnoreCase('New')){
                    hasStatusNew = true;
                }
            }
            return hasStatusNew;
        }
        catch(Exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }

/**
* @description getRecordsCount method is used to get the count of Records to particular Assessment Template.
* @param templateId This is a record id of an Template__c.
* @param objName This is a name of the object Section.
*@return
*/    

    @AuraEnabled
    public static Integer getRecordsCount(String templateId, String objName) {
        try {
            Integer totalRecsCount = 0;
            templateId = String.escapeSingleQuotes(templateId);
            if(String.isNotBlank(templateId)) {
                if(objName.equalsIgnoreCase('Sections')){
                    List<Section__c> sectionList = [SELECT Id
                                                    FROM Section__c
                                                    WHERE Assessment_Template__c = :templateId
                                                    WITH SECURITY_ENFORCED];

                    totalRecsCount = sectionList.size();
                }else if(objName.equalsIgnoreCase('Questions')){
                    List<Question__c> questionList = [SELECT Id
                                                    FROM Question__c
                                                    WHERE Assessment_Template__c = :templateId
                                                    AND Section__c != NULL
                                                    WITH SECURITY_ENFORCED];
                    totalRecsCount = questionList.size();
                }
            }
            return totalRecsCount;
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
/**
* @description getTemplateSections method is used to get all the Sections related to particular Assessment Template.
* @param templateId This is a record id of an Template__c.
* @return
*/   
    @AuraEnabled
    public static List<Section__c> getTemplateSections(String templateId) {
        try {
            templateId = String.escapeSingleQuotes(templateId);
            if(String.isNotBlank(templateId)) {
                List<Section__c> sectionList = [SELECT Id, Name,Section_Sequence_Number__c,
                                Parent_Section__c, Root_Section__c, Assessment_Template__c,
                                Assessment_Template_Version__c, No_of_Questions__c, Historical_Id__c,
                                Cloned_Record_Id__c, Assessment_Template__r.Status__c,
                                (select Id, Rhythm__Question__c, Section__c from Questions__r)
                                FROM Section__c
                                WHERE Assessment_Template__c = :templateId
                                WITH SECURITY_ENFORCED
                                ORDER BY Section_Sequence_Number__c ASC];
                return sectionList;
            }
        }
        catch(exception e) {
            string errorMsg = e.getMessage();
            AuraHandledException auraEx = new AuraHandledException(errorMsg);
            auraEx.setMessage(errorMsg);
            throw auraEx;
        }
        return null;
    }
/**
* @description getQuestionsLists method is used to get all the questions.
* @param templateId This is a record id of an Template__c.
* @return
*/   
    
    @AuraEnabled
    public static List<Question__c> getQuestionsLists(String templateId) {
        try {
            templateId = String.escapeSingleQuotes(templateId) ;
            if(String.isNotBlank(templateId)) {
                List<Question__c> questionList = [SELECT Id,Rhythm__Question__c,Section__c,Parent_Question__c
                                FROM Question__c
                                WHERE Assessment_Template__c= :templateId
                                AND Section__c != NULL
                                WITH SECURITY_ENFORCED
                                ORDER BY Question_Sequence_Number__c ASC];
                return questionList;
            }
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return null;
    }
    
/**
* @description getTemplateQuestionList method is used to get all the questions related to template.
* @param templateId This is a record id of an Template__c.
* @param recslimit This is a count of record limit to query.
* @return
*/    
    
    @AuraEnabled
    public static List<Question__c> getTemplateQuestionList(String templateId, Integer recslimit) {
        try { 
            templateId = String.escapeSingleQuotes(templateId);
            if(string.isNotBlank(templateId)) {
                List<Question__c> questionList =  [SELECT Id, Name, Section__c,Question_Sequence_Number__c,
                                                    OptionValueSet__c, Question_Type__c, Question__c,
                                                    Assessment_Template__c, Section__r.Name,
                                                    Rhythm__Assessment_Template__r.Rhythm__Status__c
                                                    FROM Question__c
                                                    WHERE Assessment_Template__c = :templateId
                                                    AND Section__c != NULL
                                                    WITH SECURITY_ENFORCED
                                                    ORDER BY Section__r.Section_Sequence_Number__c ASC, Question_Sequence_Number__c ASC
                                                    LIMIT :recslimit];
                return questionList;
            }
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return null;
    }
/**
* @description updateQustnRecords method is used to update section list.
* @param qstnList This is a list of questions data to perform update operation.
*/   
    @AuraEnabled 
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void updateQustnRecords(list<Question__c> qstnList) {
        try{
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(qstnList.isEmpty() == false) {
                Database.SaveResult[] saveResult = safe.doUpdate(qstnList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
/**
* @description updateRecords method is used to update section list.
* @param secList This is a list of sections data to perform update operation.
*/    
   
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void updateRecords(List<Section__c> secList) {
        try{
            if(sp == null){
                sp = Database.setSavepoint();
            }
            if(secList.isEmpty() == false) {
                Database.SaveResult[] saveResult = safe.doUpdate(secList);
                List<String> errorList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }

/**
* @description deleteRecords method is used to delete the records.
* @param recIdList This is a list of the section Id.
* @param delchildobjrecs This is a boolean value to delete the records or not.  
* @return
*/
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static String deleteRecords(List<Id> recIdList, Boolean delchildobjrecs) {
        String status = 'Success';
        try {
            if(recIdList.size()>0) {
                Database.DeleteResult[] drchildList;
                List<Question__c> questionList = new List<Question__c>();
                if(delchildobjrecs==true) {
                    questionList = [SELECT Id
                                    FROM Question__c
                                    WHERE section__c IN :recIdList
                                    WITH SECURITY_ENFORCED];
                    
                }
                if(questionList.isEmpty() == false) {
                    drchildList=safe.doDelete(questionList);
                }
                else {
                    questionList = [SELECT Id from Question__c where Id IN:recIdList];
                    
                }
                if(questionList.isEmpty() == false) {
                    drchildList=safe.doDelete(questionList);
                }  
                If(recIdList.isEmpty() == false){
                    List<Section__c> deleteList = [SELECT Id FROM Section__c WHERE ID IN:recIdList 
                                                    WITH SECURITY_ENFORCED];
                    drchildList = safe.doDelete(deleteList);
                }
                
                if(drchildList != null) {
                for(Database.DeleteResult dr:drchildList) {
                    if(!dr.isSuccess()) {
                        for(Database.Error de:dr.getErrors()) {
                            status='Error Status Code: '+de.getStatusCode()+' || '+de.getMessage()+' || Error Source:'+de.getFields();
                        }
                    }
                }
                }
            }
        }
        catch(Exception e) {
            status = e.getMessage();
        }
        return status;
    }

/**
* @description Get Questions Count.
* @param sectionId This is a record id of an Section__c. 
* @return
*/    
    @AuraEnabled
    public static Object questionsCount(Id sectionId){
        if ((!Schema.sObjectType.Question__c.fields.Id.isAccessible()) || (!Schema.sObjectType.Question__c.fields.Section__c.isAccessible())) {
            return 0;
        }
        
        try{
            List<Question__c> queRecordsList = [SELECT Id FROM Question__c WHERE Section__c=:sectionId WITH SECURITY_ENFORCED];
            return queRecordsList.size();
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
 
/**
* @description Get Sections Count.
* @param templateId This is a record id of an Template__c.
* @return
*/
    @AuraEnabled
    public static Object sectionsCount(Id templateId) {
        if ((!Schema.sObjectType.Section__c.fields.Id.isAccessible()) || (!Schema.sObjectType.Section__c.fields.Assessment_Template__c.isAccessible())) {
            return 0;
        }
        
        try{
            List<Section__c> sectionList = [SELECT Id FROM Section__c WHERE Assessment_Template__c=:templateId WITH SECURITY_ENFORCED];
            return sectionList.size();
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
/**
  * @description It is used to throw the exception.
*/
    public class SecurityControllerException extends Exception{
            
    }
}