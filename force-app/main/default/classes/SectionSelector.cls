/** 
* Class Name        : SectionSelector
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : SectionSelector contains queries related to Section Object.
* Last Modified Date: 
*/
public with sharing class SectionSelector {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    

    private static SectionSelector selector = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern 
    * @return
    */
    public static SectionSelector getInstance(){
           if(selector == null){
                selector = new SectionSelector();
            }
        return selector;
    }
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

   /**
    * @description To get sections related to template.
    * @param templateId It is template id.
    * @param sectionName Name of the section.
    * @return
    */
    public List<Sobject> getSections(String templateId, String sectionName){
        sectionName = '\'%'+sectionName+'%\'';
        try{
            String query =  'SELECT Id,Name,Assessment_Template__c'
                            + ' FROM section__c'
                            + ' WHERE Assessment_Template__c=\'' + templateId + '\''
                            + ' AND Name LIKE ' + sectionName
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY CreatedDate DESC';
            return safe.doQuery(query);
        }catch(Exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
    }
}