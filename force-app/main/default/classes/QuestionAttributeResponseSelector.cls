public class QuestionAttributeResponseSelector {
	public static SecurityCheckController safe = new SecurityCheckController();
    private static Savepoint sp;
    @AuraEnabled
    public static List<Sobject> getSections(String templateId, String sectionName)
    {
        sectionName = '\'%'+sectionName+'%\'';
        System.debug('templateId : '+templateId +'  sectionName : '+sectionName);
        try{
            String query =  'SELECT Id,Name,Assessment_Template__c'
                            + ' FROM section__c'
                            + ' WHERE Assessment_Template__c=\'' + templateId + '\''
                			+ ' AND Name LIKE ' + sectionName
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY CreatedDate Desc';
            return safe.doQuery(query);
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
    @AuraEnabled
    public static List<SObject> getQuestions(String templateId)
    {
         try{
            String query =  'SELECT id,name,Section__c,Section__r.Name,Assessment_Template__c,SectionName__c,Question__c,Question_Sequence_Number__c,Question_Type__c,OptionValueSet__c,Parent_Question__c,Conditional_Response__c'
                            + ' FROM Question__c'
                            + ' WHERE Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) + '\''
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY Question_Sequence_Number__c';
            return safe.doQuery(query);
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
        /*List<SObject> questionslst =[SELECT id,name,Section__c,Section__r.Name,SectionName__c, Question__c,Question_Type__c,OptionValueSet__c FROM 
                                 Question__c WHERE Assessment_Template__c =:templateId];
        return questionslst;*/
    }
    @AuraEnabled
    public static List<SObject> getQuestionsData(String questionId, String templateId)
    {
        try{
            String query =  'SELECT id,name,Section__c,Section__r.Name,SectionName__c,HelpText__c,Requires_File_Upload__c,Required__c,Question__c,Question_Type__c,OptionValueSet__c'
                            + ' FROM Question__c'
                            + ' WHERE id=\'' + String.escapeSingleQuotes(questionId) + '\''
                			+ ' AND Assessment_Template__c=\'' + String.escapeSingleQuotes(templateId) +'\''
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY CreatedDate Desc';
            return safe.doQuery(query);
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
        /*List<SObject> questionslst =[SELECT id,name,Section__c,Section__r.Name,SectionName__c,HelpText__c,Requires_File_Upload__c,Required__c,
                                     Question__c,Question_Type__c,OptionValueSet__c FROM 
                                 	 Question__c WHERE id=:questionId AND Assessment_Template__c =:templateId];
        return questionslst;*/
    }
    @AuraEnabled
    public static List<SObject> getResponseAttributes(String questionId)
    {
        System.debug('questionId'+questionId);
         try{
            String query =  'SELECT id,name,Response_value__c,Score__c,Upload_Required__c,preferred_Not_preferred__c,Weight__c'
                            + ' FROM Response_Attribute__c'
                            + ' WHERE QuestionId__c=\'' + String.escapeSingleQuotes(questionId) + '\''
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY CreatedDate Desc';
             System.debug(safe.doQuery(query));
            return safe.doQuery(query);
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
        /*List<SObject> questionslst =[SELECT id,name,Response_value__c,Score__c,Upload_Required__c,preferred_Not_preferred__c,Weight__c FROM 
                                 	 Response_Attribute__c WHERE QuestionId__c=:questionId ];
        return questionslst;*/
    }
    @AuraEnabled
    public static List<SObject> getQuestionResponseAttribute(String responseId)
    {
         try{
            String query =  'SELECT id,name,Response_value__c,Score__c,Upload_Required__c,preferred_Not_preferred__c,Weight__c'
                            + ' FROM Response_Attribute__c'
                            + ' WHERE Id=\'' + String.escapeSingleQuotes(responseId) + '\''
                            + ' WITH SECURITY_ENFORCED'
                            + ' ORDER BY CreatedDate Desc';
            return safe.doQuery(query);
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
    }
    @AuraEnabled
    public static List<SObject> getQuestionResponseMap(List<String> quesId)
    {
        try{
            List<SObject> query =  [SELECT id,Name,QuestionId__c,ResponseAttributeId__c 
                                    FROM Response_Question_Map__c
                            		WHERE QuestionId__c IN:quesId 
                                    WITH SECURITY_ENFORCED];
            //return safe.doQuery(query);
            return query;
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
    }
    @AuraEnabled
    public static List<SObject> getQuesRespAttribute(List<String> respAttrId)
    {
        try{
            List<SObject> query =  [SELECT id,Name,Response_value__c,QuestionId__c,preferred_Not_preferred__c,Score__c,
                                    Upload_Required__c,Weight__c
                                    FROM Response_Attribute__c
                            		WHERE Id IN:respAttrId 
                                    WITH SECURITY_ENFORCED];
            //return safe.doQuery(query);
            return query;
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
    }
    @AuraEnabled
        public static List<SObject> getChildQuestions(String questionId,String templateId)
    {
        try{
            List<SObject> query =  [SELECT id,Name,Question__c,Section__c,Parent_Question__c,Assessment_Template__c
                                    FROM Question__c
                            		WHERE Parent_Question__c =:questionId AND Assessment_Template__c =:templateId
                                    WITH SECURITY_ENFORCED];
            //return safe.doQuery(query);
            return query;
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
    }
    @AuraEnabled
    public static List<SObject> getQuestionRespAttributes(List<String> questionlst)
    {
        try{
            List<SObject> query =  [SELECT id,Name,Response_value__c,QuestionId__c,preferred_Not_preferred__c,Score__c,
                                    Upload_Required__c,Weight__c
                                    FROM Response_Attribute__c
                            		WHERE QuestionId__c IN:questionlst 
                                    WITH SECURITY_ENFORCED];
            //return safe.doQuery(query);
            System.debug(query);
            return query;
            
        }
        catch(Exception e)
        {
            String errorMsg = e.getMessage();
            System.debug('errorMsg'+errorMsg);
            throw new AuraHandledException(errorMsg);
        }
    }

    @AuraEnabled
    public static List<Response_Attribute__c> getRespAttforQuestion(Map<Id,Id> questionIdsMap){
        List<Response_Attribute__c> resAttList = [SELECT Id,QuestionId__c,Name,
                                    preferred_Not_preferred__c,Response_value__c,
                                    Score__c,Upload_Required__c,Weight__c
                                    FROM Response_Attribute__c
                                    WHERE QuestionId__c IN:questionIdsMap.keySet()
                                    WITH SECURITY_ENFORCED];
        return resAttList;
    }
}