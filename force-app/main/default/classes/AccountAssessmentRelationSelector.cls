/**
* Class Name         : AccountAssessmentRelationSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 07-07-2023
* @description       : This class is used for returning data related to AccountAssessmentRelation__c object
* Last Modified Date : 
*/
public with sharing class AccountAssessmentRelationSelector {
    public static SecurityCheckController safe = new SecurityCheckController();   //implementing singleton pattern
    
    /**
    * @description Fetches the AccountAssessmentRelation__c records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its AccountAssessmentRelation__c record
    */
    public static Map<Id,AccountAssessmentRelation__c> fetchAccounts(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        if(fields!=null && fields.size()>0)
        {
            filter = (filter==null)?'':filter;  
            String query = 'Select '+String.join(fields,',')+' from AccountAssessmentRelation__c '+filter; //Use SELECT
            try
            {
                List<AccountAssessmentRelation__c> aarList = safe.doQuery(query);
                return new Map<Id,AccountAssessmentRelation__c>(aarList);
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