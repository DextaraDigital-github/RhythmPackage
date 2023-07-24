/**
* Class Name         : ContentDocumentSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 12-07-2023
* @description       : This class is used for returning data related to ContentDocument object
* Last Modified Date : 
*/
public with sharing class ContentDocumentSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //implementing singleton pattern
    
    /**
    * @description Fetches the ContentDocument records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its ContentDocument record
    */
    public static Map<Id,ContentDocument> fetchContentDocuments(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields!=null && fields.size()>0)
        {
            filter = (filter==null)?'':filter;
            String query = 'Select '+String.join(fields,',')+' from ContentDocument '+filter;
            try
            {
                List<ContentDocument> contentDocumentList = safe.doQuery(query);
                return new Map<Id,ContentDocument>(contentDocumentList);
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