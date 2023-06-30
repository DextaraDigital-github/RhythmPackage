/* 
* Class Name        : AssessmentTemplateController
* Developer         : Priyanka         
* Created Date      : 
* Description       : AssessmentTemplateController class is used for SOQl on Question__c,Section__c,Assessment_Template__c and DML operations on the objects Sections,Questions.
* Last Modified Date: 23-06-2023
*/
public with sharing class AssessmentTemplateController {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    
    //get Section Records for LookupField
    @AuraEnabled(cacheable=true)
    public static List<Section__c> getSections(String sectionName, string templateId) {
        List<Section__c> secList =new List<Section__c>();
        if(sectionName !='') {
            String secName ='%'+ sectionName +'%';
            secList =[select Id,Name from Section__c where Assessment_Template__c=:templateId AND Name LIKE :secName ];
        }
        else {
            secList =[select Id,Name from Section__c where Assessment_Template__c=:templateId ];
        }
        return secList; 
    }
    
    //Get Template Details
    @AuraEnabled(Cacheable=true)
    Public static Boolean getTemplateDetails(String templateId) {
        boolean hasStatusNew = false;
        try {
            
            if(templateId != null) {
                List<Assessment_Template__c> AssessmentList= [Select Status__c from Assessment_Template__c where ID=:templateId LIMIT 1];
                Assessment_Template__c assessmenttemp=(AssessmentList.size()==1)?AssessmentList[0]:null;
                if(assessmenttemp  !=null ) {
                    if(assessmenttemp.Status__c == 'New')
                        hasStatusNew = true;
                    else
                        hasStatusNew = false;
                }
            }
        }
        catch(Exception e) {
            System.debug('Exception e=='+e.getmessage()); 
        }
        return hasStatusNew;
    }
    
    /* getRecordsCount method is used to get the count of Records to particular Assessment Template */
    @AuraEnabled
    Public static Integer getRecordsCount(String templateId, String objName) {
        Integer totalRecsCount = 0;
        try {
            if(templateId!=null) {
                if(objName=='Sections') {
                    List<Section__c> sectionList=[select Id  from Section__c where Assessment_Template__c =: templateId ];
                    totalRecsCount=sectionList.size();
                }
                else if(objName=='Questions') {
                    List<Question__c> sectionList=[select Id  from Question__c where Assessment_Template__c =: templateId AND Section__c!=null];
                    totalRecsCount=sectionList.size();
                }
            }
        } 
        catch(Exception e) {
            System.debug('Exception e=='+e.getmessage());
        }
        return totalRecsCount;
    }
    
    
    /* getTemplateSections method is used to get all the Sections related to particular Assessment Template */
    @AuraEnabled
    Public static List<Section__c> getTemplateSections(String templateId) {
        try {
            if(templateId!=null) {
                String query = 'Select Id, Name,Section_Sequence_Number__c, Parent_Section__c, Root_Section__c, Assessment_Template__c, Assessment_Template_Version__c, No_of_Questions__c, Historical_Id__c, Cloned_Record_Id__c, Assessment_Template__r.Status__c,(select Id, Rhythm__Question__c, Section__c from Questions__r) from Section__c where Assessment_Template__c = \'' + templateId + '\' order by Section_Sequence_Number__c ASC';
                return safe.doQuery(query);
            } 
        }
        catch(Exception e) {
            System.debug('getTemplateSections Exception : '+e.getmessage());
        }
        return null;
    }
    
    /* getQuestionsLists method is used to get all the questions */
    @AuraEnabled
    Public static List<Question__c> getQuestionsLists(String templateId) {
        try {
            if(templateId!=null) {
                return [select Id, Rhythm__Question__c, Section__c from Question__c where Assessment_Template__c =:templateId AND Section__c!=null order by Question_Sequence_Number__c ASC];
            }
        }
        catch(Exception e) {
            System.debug('Exception e=='+e.getmessage());
        }
        return null;
    }
    
    
    /* getTemplateQuestionList method is used to get all the questions related to template */
    @AuraEnabled
    Public static List<Question__c> getTemplateQuestionList(String templateId, Integer recslimit) {
        try { 
            if(templateId!=null) {
                String query='Select Id, Name, Section__c,Question_Sequence_Number__c, OptionValueSet__c, Question_Type__c, Question__c, Assessment_Template__c, Section__r.Name, Rhythm__Assessment_Template__r.Rhythm__Status__c from Question__c where Assessment_Template__c = \'' + templateId + '\' AND Section__c!=null order by Section__r.Section_Sequence_Number__c ASC, Question_Sequence_Number__c ASC LIMIT '+recslimit;
                return safe.doQuery(query);
            }
        }
        catch(Exception e) {
            System.debug('Exception e=='+e.getmessage()); 
        }
        return null;
    }
    
    /* updateQustnRecords method is used to update section list */
    @AuraEnabled 
    public static void updateQustnRecords(list<Question__c> qstnList) {
        if(qstnList.size() > 0) {
            update qstnList;
        }
    }
    
    /* updateRecords method is used to update section list */
    @AuraEnabled
    public static void updateRecords(list<Section__c> secList) {
        if(secList.size() > 0) {
            update secList;
        }
    }
    
    /* deleteRecords method is used to delete the records */
    @AuraEnabled
    public static String deleteRecords(List<Id> recIdList, Boolean delchildobjrecs) {
        String status = 'Success';
        try {
            if(recIdList.size()>0) {
                Database.DeleteResult[] drchildList;
                if(delchildobjrecs==true) {
                    List<Question__c> questionList=[SELECT Id from Question__c where section__c IN:recIdList];
                    List<Question__c> subquestionList=[SELECT Id from Question__c where Id IN:recIdList];
                    if(questionList.size() > 0) {  
                       /* for(Question__c ques: subquestionList) {
                            if(recIdList.contains(ques.Id)) {
                                recIdList.remove(recIdList.indexof(ques.Id));
                            } 
                        }
                        if(subquestionList.size() > 0) {  
                            drchildList=safe.doDelete(subquestionList);
                        }*/
                        drchildList=safe.doDelete(questionList);
                    }
                }
                Database.DeleteResult[] drList=Database.delete(recIdList,true);
                for(Database.DeleteResult dr:drchildList) {
                    if(!dr.isSuccess()) {
                        for(Database.Error de:dr.getErrors()) {
                            status='Error Status Code: '+de.getStatusCode()+' || '+de.getMessage()+' || Error Source:'+de.getFields();
                        }
                    }
                }
            }
        }
        catch(Exception e) {
            System.debug('Exception e=='+e.getmessage());
        }
        return status;
    }
    
    //Get Questions Count
    @AuraEnabled
    public static Object questionsCount(Id sectionId)
    {
        List<AggregateResult> s=[select count(Id) q from Rhythm__Question__c where Rhythm__Section__c = :sectionId];
        return s[0].get('q');
    }
    
    //Get Sections Count
    @AuraEnabled
    public static Object sectionsCount(Id templateId)
    {
        List<AggregateResult> s=[select count(Id) s from Rhythm__Section__c where Assessment_Template__c = :templateId];
        return s[0].get('s');
    }
}