/**
* Class Name         : ContentVersionSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 12-07-2023
* @description       : This class is used for returning data related to ContentVersion object
* Last Modified Date : 
*/
public with sharing class ContentVersionSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //implementing singleton pattern
    
    /**
    * @description Fetches the ContentVersion records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its ContentVersion record
    */
    public static Map<Id,ContentVersion> fetchContentVersions(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields!=null && fields.size()>0)
        {
            filter = (filter==null)?'':filter;
            String query = 'Select '+String.join(fields,',')+' from ContentVersion '+filter;
            try
            {
                List<ContentVersion> contentVersionList = safe.doQuery(query);
                return new Map<Id,ContentVersion>(contentVersionList);
            }
            catch(Exception e)
            {
                String errorMsg = e.getMessage();
            	throw new AuraHandledException(errorMsg);
            }
        }
        return null;
    }
}