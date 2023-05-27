public class AssessmentController {
    @Auraenabled
    Public static void QuestionarieList(){
        //return [Select id,Name,Title__c,Type__c from Questionarie__c];
    }
    
     Public static List<SObject> getAssessmentList(){
        /*List<Supplier_Assessment__c> suppList = [SELECT ID,Project__c, Vendor__c, Assesment_Status__c, 
                    Submission_Date__c, Assessment_Template__c, Start_Date__c, Target_End_Date__c,Assessment_Template__r.Disclosure__c,
                    Frequency__c, Assessment_Type__c FROM Supplier_Assessment__c];
         return suppList;
         */
         return null;
    }
	
    @AuraEnabled(cacheable=true)
     Public static List<SObject> getSupplierAssessmentList(String assessmentId){
         
        //return [select Id, Assessment_Template__c, Assesment_Status__c,Assessment_Template__r.Disclosure__c,Name,CreatedBy.Name,CreatedDate, Survey_Life_Cycle__c from Supplier_Assessment__c where Id=:assessmentId];
        return null;
    }
    @AuraEnabled(cacheable=true)
     Public static List<QuestionWrapper> getQuestionsList(String templateId){
        List<QuestionWrapper> questionListWrapper = new List<QuestionWrapper>();
      /*  List<Questionnaire__c> questionList = [SELECT Id, Name, Question__c, Type__c, OptionValueSet__c,Assessment_Template__c,
                                               section__r.Name,section__r.LastModifiedDate,section__r.LastModifiedBy.Name, Parent_Question__c,(Select Id, Name, Question__c, Type__c, OptionValueSet__c,Parent_Question__c from Questions__r)
                                               FROM Questionnaire__c 
                                               WHERE Assessment_Template__c =:templateId
                                              Order By Section__r.Name ASC,Question__c ASC
                                                 ];
         for(Questionnaire__c question : questionList){
             QuestionWrapper qw = new QuestionWrapper();
             qw.questionId = question.ID;
             qw.Question = question.Question__c;
             qw.Name = question.Name;
             qw.Type = question.Type__c;

             qw.optionValueSet= question.OptionValueSet__c;
             qw.assessmentTemplate = question.Assessment_Template__c;
            
             qw.parentQuestion = question.Parent_Question__c == null?'':question.Parent_Question__c;
             qw.sectionName = question.Section__r.Name;
             qw.lastModifiedDate = question.Section__r.LastModifiedDate;
             qw.lastModifiedBy = question.section__r.LastModifiedBy.Name;
             qw.childquestionList = question.Questions__r;
                     for(Questionnaire__c childQuestion : question.Questions__r){
                         childQuestionWrapper childQues = new childQuestionWrapper();
                         childQues.Question = childQuestion.Question__c;
                         childQues.Name     = childQuestion.Name;
                         childQues.parentQuestion = childQuestion.Parent_Question__c == null?'':childQuestion.Parent_Question__c;
                         childQues.Type = childQuestion.Type__c;
                         List<childQuestionWrapper> chdquesWrap = new List<childQuestionWrapper>();
                         chdquesWrap.add(childQues);
                         qw.childQuestions = chdquesWrap;
                     }
             questionListWrapper.add(qw);
         }
        
         */
         return questionListWrapper; 
         
    }
    @AuraEnabled(cacheable=true)
     Public static List<SObject> getSupplierResponseList(String assessmentId){
        //return [select Id, Questionnaire__c, Assessment__r.Name, Response__c,CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,LastModifiedDate,LastModifiedById from Supplier_Response__c where Assessment__c=:assessmentId];
        return null;
    }
    
    @AuraEnabled(cacheable=true)
    Public static List<SObject> getQuestionsListSectionList(String templateId){
        /*List<Questionnaire__c> questionList = [SELECT Id, Name, Question__c, Type__c, OptionValueSet__c,Assessment_Template__c,
                                               section__r.Name,Parent_Question__c
                                               FROM Questionnaire__c Where section__r.Name <> null
                                              Order By Section__r.Name ASC,Question__c ASC
                                                 ];
                                                 
        return questionList;
        */
        return null;
    }
    
    @AuraEnabled
    Public static void createSupplierResponse(List<SObject> suppResponseList,String vendorId,String assesmentId, Boolean isSubmit){
       /* if(vendorId!=null && assesmentId!=null && String.isNotEmpty(vendorId) && String.isNotEmpty(assesmentId)){
            System.debug('Mani'+suppResponseList);
            List<Supplier_Response__c> suppResList = [SELECT id,Assessment__c,Questionnaire__c,Response__c,Vendor__c from Supplier_Response__c 
            WHERE Assessment__c =:assesmentId and Vendor__c=:vendorId];
            if(suppResList!=null && suppResList.size()>0){
                delete suppResList;
            }
        }
        INSERT suppResponseList;
        
        if(isSubmit==true && assesmentId!=null)
        {
            List<Supplier_Assessment__c> saList=[Select Id, Assesment_Status__c from Supplier_Assessment__c where Id=:assesmentId];
            saList[0].Assesment_Status__c='Submitted';
            update saList;
        }
        */
    }
   
    @AuraEnabled(cacheable=true)
     Public static List<SObject> getAssessmentlist(String assessmentTemplateId2){
        //return [select Id,Disclosure__c from Assessment_Template__c where id=:assessmentTemplateId2];
        return null;
         
    }
	@AuraEnabled
    public static List<Object> getAssesmentRecords()
    {
        List<Rythm__Assessment__c> AssessmentRecords= [select Name,Target_Completion_Date__c,Assesment_Status__c,
                                                       Additional_Requests__c,Customer_Review__c,Number_of_Questions__c,
                                                       Number_of_Responses__c from Assessment__c];
        System.debug('AssessmentRecords'+AssessmentRecords);
        return AssessmentRecords;
    }
    
    public class QuestionWrapper{
        @AuraEnabled
        public Id questionId{get;set;}
        @AuraEnabled
        public String Question{get;set;}
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String parentQuestion{get;set;}
        @AuraEnabled
        public String Type{get;set;}
        @AuraEnabled
        public String sectionName{get;set;}
        @AuraEnabled
        public String conditionalValue{get;set;}
        @AuraEnabled
        public String assessmentTemplate{get;set;}
        @AuraEnabled
        public String optionValueSet{get;set;}
         @AuraEnabled
        public datetime lastModifiedDate{get;set;}
        @AuraEnabled
        public String lastModifiedBy{get;set;}
        @AuraEnabled
        public List<SObject> childquestionList {get;set;}
        @AuraEnabled
        public List<childQuestionWrapper> childQuestions{get;set;}
    }
    public class childQuestionWrapper{
        @AuraEnabled
        public String Question{get;set;}
        @AuraEnabled
        public String Name{get;set;}
        @AuraEnabled
        public String parentQuestion{get;set;}
        @AuraEnabled
        public String Type{get;set;}
    }   
}