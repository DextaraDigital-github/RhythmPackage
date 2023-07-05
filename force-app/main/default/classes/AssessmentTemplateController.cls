/* 
* Class Name        : AssessmentTemplateController
* Developer         : Priyanka         
* Created Date      : 
* Description       : AssessmentTemplateController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Sections,Questions.
* Last Modified Date: 23-06-2023
*/
public with sharing class AssessmentTemplateController {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work
    
    //get Section Records for LookupField
    @AuraEnabled(cacheable=true)
    public static List<Section__c> getSections(String sectionName, string templateId) {
        try{
            List<Section__c> secList =new List<Section__c>();
            if(string.isNotBlank(sectionName)) {
                String secName ='%'+ sectionName +'%';
                string query = 'SELECT Id,Name'
                                +' FROM Section__c'
                                +' WHERE Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) + '\''
                                +' AND Name LIKE \'' + String.escapeSingleQuotes(secName) + '\'';
                return safe.doQuery(query);
            }else {
                string query = 'SELECT Id,Name'
                            +' FROM Section__c'
                            +' WHERE Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) + '\'';
                return safe.doQuery(query);
            }
            
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    //Get Template Details
    @AuraEnabled(Cacheable=true)
    public static Boolean getTemplateDetails(String templateId) {
        try {
            boolean hasStatusNew = false;
            if(string.isNotBlank(templateId)) {
                string query = 'Select Status__c'
                            + ' FROM Assessment_Template__c'
                            + ' WHERE Id= \'' + String.escapeSingleQuotes(templateId) + '\''
                            + ' LIMIT 1';

                List<Assessment_Template__c> assessmentList= safe.doQuery(query);
                Assessment_Template__c assessmentTemp = (AssessmentList.size()==1)?AssessmentList[0]:null;
                if(assessmentTemp  != null ) {
                    if(assessmenttemp.Status__c == 'New')
                        hasStatusNew = true;
                    else
                        hasStatusNew = false;
                }
            }
            return hasStatusNew;
        }
        catch(Exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /* getRecordsCount method is used to get the count of Records to particular Assessment Template */
    @AuraEnabled
    public static Integer getRecordsCount(String templateId, String objName) {
        try {
            integer totalRecsCount = 0;
            if(string.isNotBlank(templateId)) {
                if(objName.equalsIgnoreCase('Sections')){
                    string query = 'SELECT Id'
                                +' FROM Section__c'
                                +' WHERE Assessment_Template__c = \'' + String.escapeSingleQuotes(templateId) + '\'';
                    List<Section__c> sectionList = safe.doQuery(query);
                    totalRecsCount=sectionList.size();
                }
                else if(objName.equalsIgnoreCase('Questions')) {
                    string query = 'SELECT Id'
                                 + ' FROM Question__c'
                                 + ' WHERE Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) + '\''
                                 + ' AND Section__c != NULL';
                    List<Question__c> sectionList = safe.doQuery(query);
                    totalRecsCount=sectionList.size();
                }
            }
            return totalRecsCount;
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    
    /* getTemplateSections method is used to get all the Sections related to particular Assessment Template */
    @AuraEnabled
    public static List<Section__c> getTemplateSections(String templateId) {
        try {
            if(string.isNotBlank(templateId)) {
                string query = 'SELECT Id, Name,Section_Sequence_Number__c,'
                             + 'Parent_Section__c, Root_Section__c, Assessment_Template__c,'
                             + 'Assessment_Template_Version__c, No_of_Questions__c, Historical_Id__c,'
                             + 'Cloned_Record_Id__c, Assessment_Template__r.Status__c,'
                             + '(select Id, Rhythm__Question__c, Section__c from Questions__r)' 
                             + 'FROM Section__c'
                             + 'WHERE Assessment_Template__c = \'' + String.escapeSingleQuotes(templateId) + '\''
                             + 'ORDER BY Section_Sequence_Number__c ASC';
                return safe.doQuery(query);
            }
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return null;
    }
    
    /* getQuestionsLists method is used to get all the questions */
    @AuraEnabled
    public static List<Question__c> getQuestionsLists(String templateId) {
        try {
            if(string.isNotBlank(templateId)) {
                string query = 'SELECT Id,Rhythm__Question__c, Section__c'
                             + ' FROM Question__c'
                             + ' WHERE Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) + '\''
                             + ' AND Section__c != NULL'
                             + ' ORDER BY Question_Sequence_Number__c ASC';
                return safe.doQuery(query);
            }
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return null;
    }
    
    
    /* getTemplateQuestionList method is used to get all the questions related to template */
    @AuraEnabled
    public static List<Question__c> getTemplateQuestionList(String templateId, Integer recslimit) {
        try { 
            if(string.isNotBlank(templateId)) {
                String query =   'SELECT Id, Name, Section__c,Question_Sequence_Number__c,'
                                +'OptionValueSet__c, Question_Type__c, Question__c,'
                                +'Assessment_Template__c, Section__r.Name,'
                                +'Rhythm__Assessment_Template__r.Rhythm__Status__c'
                                +' FROM Question__c'
                                +' WHERE Assessment_Template__c = \'' + String.escapeSingleQuotes(templateId) + '\''
                                +' AND Section__c != NULL' 
                                +' ORDER BY Section__r.Section_Sequence_Number__c ASC, Question_Sequence_Number__c ASC'
                                +' LIMIT '+recslimit;
                return safe.doQuery(query);
            }
        }
        catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
        return null;
    }
    
    /* updateQustnRecords method is used to update section list */
    @AuraEnabled 
    public static void updateQustnRecords(list<Question__c> qstnList) {
        try{
            if (sp == null) sp = Database.setSavepoint();
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
    
    /* updateRecords method is used to update section list */
    @AuraEnabled
    public static void updateRecords(list<Section__c> secList) {
        try{
            if (sp == null) sp = Database.setSavepoint();
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
    
    /* deleteRecords method is used to delete the records */
    @AuraEnabled
    public static String deleteRecords(List<Id> recIdList, Boolean delchildobjrecs) {
        String status = 'Success';
        try {
            if(recIdList.size()>0) {
                Database.DeleteResult[] drchildList;
                if(delchildobjrecs==true) {
                    string queQuery = 'SELECT Id'
                                    +' FROM Question__c'
                                    +' WHERE section__c IN:recIdList';
                    Map<String, Object> bindVariables = new Map<String, Object>{'recIdList' => recIdList};
                    List<Question__c> questionList = safe.doQueryWithBinds(queQuery,bindVariables);

                    string queSubQuery = 'SELECT Id'
                                    +' FROM Question__c'
                                    +' WHERE Id IN:recIdList';
                    
                    List<Question__c> subquestionList = safe.doQueryWithBinds(queSubQuery,bindVariables);
                    if(questionList.isEmpty() == false) {
                        drchildList=safe.doDelete(questionList);
                    }
                }
                Database.DeleteResult[] drList=Database.delete(recIdList,true);
                for(Database.DeleteResult dr:drchildList) {
                    if(!dr.isSuccess()) {
                        for(Database.Error de:dr.getErrors()) {
                            status='Error Status Code: '+de.getStatusCode()+' || '+de.getMessage()+' || Error Source:'+de.getFields();
                        }
                    }
                }
            }
        }
        catch(Exception e) {
            System.debug('Exception e=='+e.getmessage());
        }
        return status;
    }
    
    //Get Questions Count
    @AuraEnabled
    public static Object questionsCount(Id sectionId)
    {
        try{
            string query = 'SELECT COUNT(ID) q'
                         + ' FROM Question__c'
                         + ' WHERE Section__c=\'' + String.escapeSingleQuotes(sectionId) + '\'';
            List<AggregateResult> s = safe.doQuery(query);
            return s[0].get('q');
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    //Get Sections Count
    @AuraEnabled
    public static Object sectionsCount(Id templateId)
    {
        try{
            string query = 'SELECT count(Id) s'
                         + ' FROM Section__c'
                         + ' WHERE Assessment_Template__c =\'' + String.escapeSingleQuotes(templateId) + '\'';
            List<AggregateResult> s = safe.doQuery(query);
            return s[0].get('s');
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
       /**
    * It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
            
    }
}