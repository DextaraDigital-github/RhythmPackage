/**
* Class Name         : UserSelector
* Developer          : Sri Kushal Reddy N           
* Created Date       : 11-07-2023
* @description       : This class is used for returning data related to User object
* Last Modified Date : 
*/
public with sharing class UserSelector {
    public static SecurityCheckController safe = new SecurityCheckController();  //implementing singleton pattern
    
    /**
    * @description Fetches the User records w.r.t fields, filter, child queries, etc.
    * @param parameterMap It is a Map of all parameters like fields, filter, child queries, etc.
    * @return Map of Id and its User record
    */
    public static Map<Id,User> fetchUsers(Map<String,Object> parameterMap)
    {
        List<String> fields = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('fields')), List<String>.class);
        String filter = (String)parameterMap.get('filter');
        List<String> childQuery = (List<String>)JSON.deserialize(JSON.serialize(parameterMap.get('childQuery')),List<String>.class);
        if(!fields.isEmpty())
        {
            filter = (filter==null)?'':filter;
            String childQry = (childQuery.isEmpty()?'':', '+String.join(childQuery, ', '));
            String query = 'SELECT '+String.join(fields,',')+childQry+' FROM User '+filter;
            try
            {
                List<User> userList = safe.doQuery(query);
                return new Map<Id,User>(userList);
            }
            catch(Exception e)
            {}
        }
        return null;
    }
}