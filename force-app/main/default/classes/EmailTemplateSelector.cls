/**
* Class Name         : EmailTemplateSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for returning data related to EmailTemplate object
* Last Modified Date : 
*/
public with sharing class EmailTemplateSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //implementing singleton pattern
    
    /**
    * @description Fetches the EmailTemplate records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its EmailTemplate record
    */
    public static Map<Id,EmailTemplate> fetchEmailTemplates(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        List<String> childQuery = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('childQuery')), List<String>.class);
        if(fields!=null && fields.size()>0)
        {
            filter = (filter==null)?'':filter;
            String childQry = (childQuery!=null && childQuery.size()>0)?(' , '+String.join(childQuery,',')+' '):'';
            String query = 'Select '+String.join(fields,',')+childQry+' from EmailTemplate '+filter; // USE FROM
            try
            {
                List<EmailTemplate> emailTempList = safe.doQuery(query);
                return new Map<Id,EmailTemplate>(emailTempList);
            }
            catch(Exception e)
            {
                String errorMsg = e.getMessage();  // INSERT ERROR LOGS. REF: AssessmentExpiryNotificationBatch
            	throw new AuraHandledException(errorMsg);
            }
        }
        return null;
    }
}