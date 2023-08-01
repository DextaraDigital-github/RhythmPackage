/** 
* Class Name         : TemplateSelector
* Developers         : Sai Koushik Nimmaturi, Reethika Velpula, Sri Kushal Reddy N
* Created Date       : 
* @description       : TemplateSelector contains queries related to Template Object.
* Last Modified Date : 
*/
public with sharing class TemplateSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
    /**
    * @description Fetches the Assessment_Template__c records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its Assessment_Template__c record
    */
    public static Map<Id,Assessment_Template__c> fetchAssessmentTemplates(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields != null && !fields.isEmpty())
        {
            filter = (filter == null)?'':filter;
            String query = 'SELECT ' + String.join(fields,',')+' FROM Assessment_Template__c '+filter;
            try
            {
                List<Assessment_Template__c> templateList = safe.doQuery(query);
                return new Map<Id,Assessment_Template__c>(templateList);
            }
            catch(Exception e)
            {
                errorList = new List<ErrorTransactionLog__c>();
            	errorRec = new ErrorTransactionLog__c();
                errorRec.Class_Name__c = 'TemplateSelector';
                errorRec.Error_Stack_Trace__c = e.getStackTraceString();
                errorRec.Name = 'Error while fetching Assessment_Template__c records';
                errorRec.LWC_Component_Name__c = '';
                errorRec.Method_Name__c = 'fetchAssessmentTemplates';
                errorList.add(errorRec);
                safe.doInsert(errorList);
                throw new AuraHandledException(e.getMessage());   //Throws an exception
            }
        }
        return null;
    }

    /**
    * @description To get the template record data.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    @AuraEnabled
    public static List<Assessment_Template__c> getTemplateRecord(string templateId){
        templateId = String.escapeSingleQuotes(templateId);
        List<Assessment_Template__c> templateList = [SELECT Id,Status__c
                                                    FROM Assessment_Template__c
                                                    WHERE Id=:templateId
                                                    WITH SECURITY_ENFORCED];
        return templateList;
    }
}