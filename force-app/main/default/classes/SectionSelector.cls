/** 
* Class Name        : SectionSelector
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : SectionSelector contains queries related to Section Object.
* Last Modified Date: 
*/
public with sharing class SectionSelector {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    
    /**
    * @description To get all the sections related to a template.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    public List<Section__c> getSectionsforTemplate(string templateId){
        string query = 'SELECT Id,Name,Assessment_Template__c,Section_Sequence_Number__c,'
                    +  '(SELECT Id,Name,Question__c,Assessment_Template__c,Question_Type__c,'
                    +  'Conditional_Response__c,HelpText__c,OptionValueSet__c,Parent_Question__c,'
                    +  'Question_Sequence_Number__c,Required__c,Requires_File_Upload__c,Section__c'
                    + ' FROM Questions__r WHERE Parent_Question__c = null ORDER BY CreatedDate ASC)'
                    + ' FROM Section__c'
                    + ' WHERE Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) + '\''
                    + ' WITH SECURITY_ENFORCED';
        List<Section__c>  sectionsList = safe.doQuery(query);
        return sectionsList;
    }
        @AuraEnabled
    public static List<Sobject> getSections(String templateId, String sectionName)
    {
        sectionName = '\'%'+sectionName+'%\'';
        System.debug('templateId : '+templateId +'  sectionName : '+sectionName);
        try{
            List<Sobject> sections = [SELECT id,name,Assessment_Template__c FROM section__c WHERE  Assessment_Template__c =:templateId
                                  AND name LIKE :sectionName WITH SECURITY_ENFORCED ORDER BY CreatedDate Desc];
            //return safe.doQuery(query);
            return sections;
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
        /*List<Sobject> sections = [SELECT id,name,Assessment_Template__c FROM section__c WHERE  Assessment_Template__c =:templateId
                                  AND name LIKE :sectionName];
        
        return sections;*/
    }
}