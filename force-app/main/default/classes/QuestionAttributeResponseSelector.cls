/** 
* Class Name        : QuestionAttributeResponseSelector
* Developer         : Sai Koushik Nimmaturi,Reethika Velpula, Sri Kushal Reddy N        
* Created Date      : 
* @description      : QuestionAttributeResponseSelector contains queries related to Response Attribute Object.
* Last Modified Date: 
*/
public with sharing class QuestionAttributeResponseSelector {
	public static SecurityCheckController safe = new SecurityCheckController();
    private static Savepoint sp;

    private static QuestionAttributeResponseSelector selector = null; //private static instance of the class

    /**
    * @description Singleton Design Pattern
    * @return
    */
    public static QuestionAttributeResponseSelector getInstance(){
           if(selector == null){
            selector = new QuestionAttributeResponseSelector();
            }
        return selector;
    }

   /**
    * @description gets all Sections of particular Assessment_Template__c id.
    * @param templateId is a Assessment_Template__c record id.
    * @param sectionName is a characters in section name
    * @return List of Sections record in Assessment_Template__c and containg 'sectionName' characters.
    */
    public List<Sobject> getSections(String templateId, String sectionName){
        sectionName = '\'%'+sectionName+'%\'';
        try{
            String query =  'SELECT Id,Name,Assessment_Template__c'
                            + ' FROM section__c'
                            + ' WHERE Assessment_Template__c=\'' + templateId + '\''
                			+ ' AND Name LIKE ' + sectionName
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY CreatedDate Desc';
            return safe.doQuery(query);
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description gets all Response Attribute Record based on Response_Attribute__c Id
    * @param responseId is a Response_Attribute__c id. 
    * @return List of Response_Attribute__c record.
    */
    public List<SObject> getQuestionResponseAttribute(String responseId){
         try{
            List<SObject> respAttr = [SELECT id,name,Response_value__c,Score__c,Upload_Required__c,preferred_Not_preferred__c,Weight__c
                                      FROM Response_Attribute__c WHERE Id=:responseId WITH SECURITY_ENFORCED
                                      ORDER BY CreatedDate Desc];
            return respAttr;
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
 	 /**
    * @description gets al Response Attribute Records based on  Response_Attribute__c Ids
    * @param respAttrId is a list of Response_Attribute__c id. 
    * @return List of Response_Attribute__c records
    */
    public List<SObject> getQuesRespAttribute(List<String> respAttrId){
        try{
            List<SObject> query =  [SELECT id,Name,Response_value__c,QuestionId__c,preferred_Not_preferred__c,Score__c,
                                    Upload_Required__c,Weight__c
                                    FROM Response_Attribute__c
                            		WHERE Id IN:respAttrId 
                                    WITH SECURITY_ENFORCED];
            return query;
        }
        catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
	
	/**
    * @description gets al Response Attribute Records based on  Question__c Id
    * @param questionlst is a list of Question__c id. 
    * @return List of Response_Attribute__c records
    */
    public List<SObject> getQuestionRespAttributes(List<String> questionlst){
        try{
            List<Response_Attribute__c> respAttList =  [SELECT id,Name,Response_value__c,QuestionId__c,preferred_Not_preferred__c,Score__c,
                                                        Upload_Required__c,Weight__c
                                                        FROM Response_Attribute__c
                                                        WHERE QuestionId__c IN:questionlst 
                                                        WITH SECURITY_ENFORCED];
            return respAttList;
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    

    /**
    * @description gets all Response Attribute Records based on  Question__c Id
    * @param questionIdsMap map of questionids
    * @return List of Response_Attribute__c records
    */
    public List<Response_Attribute__c> getRespAttforQuestion(Map<Id,Id> questionIdsMap){
        List<Response_Attribute__c> resAttList = [SELECT Id,QuestionId__c,Name,
                                    preferred_Not_preferred__c,Response_value__c,
                                    Score__c,Upload_Required__c,Weight__c
                                    FROM Response_Attribute__c
                                    WHERE QuestionId__c IN:questionIdsMap.keySet()
                                    WITH SECURITY_ENFORCED];
        return resAttList;
    }
}