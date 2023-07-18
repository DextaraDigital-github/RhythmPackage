/** 
* Class Name        : TemplateSelector
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : TemplateSelector contains queries related to Template Object.
* Last Modified Date: 
*/
public with sharing class TemplateSelector {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern

    /**
    * @description To get the template record data.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    public List<Assessment_Template__c> getTemplateRecord(string templateId){
        string query = 'SELECT Id,Status__c'
                    + ' FROM Assessment_Template__c'
                    + ' WHERE Id=\'' + String.escapeSingleQuotes(templateId) + '\''
                    + ' WITH SECURITY_ENFORCED';
        List<Assessment_Template__c>  templateList = safe.doQuery(query);
        return templateList;
    }
}