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
        /*List<SObject> SupplierAssessment= [SELECT id,Assessment_Template__c, Assesment_Status__c,Assessment_Template__r.Disclosure__c,Name,CreatedBy.Name,CreatedDate from Assessment__c  where Id=:assessmentId];
         System.debug('SupplierAssessment'+SupplierAssessment);*/ // commented by koushik
         List<Sobject> getAssementTemplate = [select id,name,Rythm__Assessment_Template__c from Rythm__Assessment__c where id =:assessmentId];
         System.debug('getAssementTemplate'+getAssementTemplate);
         List<Id> templateId = new List<Id>();
         for(Sobject assessmenttemplate :getAssementTemplate)
         {
             Id assessmentTempId = (ID)assessmenttemplate.get('Rythm__Assessment_Template__c');
             templateId.add(assessmentTempId);
         }
         List<Sobject> getSectionsdata=[select id,name,Rythm__Assessment_Template__c,Rythm__Assessment_Template__r.Rythm__Disclosure__c,Rythm__Assesment_Status__c from Rythm__Assessment__c where Rythm__Assessment_Template__c IN :templateId];
         System.debug('getSectionsdata'+getSectionsdata);
         return getSectionsdata;
       
    }

    @AuraEnabled(cacheable=true)
     Public static List<SObject> getQuestionsList(String templateId){
        List<QuestionWrapper> questionListWrapper = new List<QuestionWrapper>();
         List<Question__c> questionList = [select id,name,Rythm__Section__c,Rythm__Question_Type__c,
                                           Rythm__Conditional_Response__c,Rythm__OptionValueSet__c,Rythm__Question__c,
                                           Rythm__Parent_Question__c,Rythm__HelpText__c,Rythm__Section__r.Name,Rythm__Section__r.Id,
                                           Rythm__Assessment_Template__c,(select Rythm__Flag__c from Rythm__Responses__r) from Rythm__Question__c where Assessment_Template__c =:templateId];
       /* List<Questionnaire__c> questionList = [SELECT Id, Name, Question__c, Type__c, OptionValueSet__c,Assessment_Template__c,
                                               section__r.Name,section__r.LastModifiedDate,section__r.LastModifiedBy.Name, Parent_Question__c,(Select Id, Name, Question__c, Type__c, OptionValueSet__c,Parent_Question__c from Questions__r)
                                               FROM Questionnaire__c 
                                               WHERE Assessment_Template__c =:templateId
                                               Order By Section__r.Name ASC,Question__c ASC
                                            ];
        */
         /** sridhar comment  below**/
       /* List<Assessment_Template_Junction__c> questionList = [select Id,Assessment_Template__c, Question__c,Question__r.Parent_Question__c,Question__r.Question__c,Question__r.Required__c,Question__r.Question_Type__c,Question__r.OptionValueSet__c,Question__r.Conditional_Response__c,Question__r.HelpText__c,
        Section__c,Section__r.Name,
        Section__r.Parent_Section__c,Section__r.Root_Section__c from Assessment_Template_Junction__c where Assessment_Template__c=:templateId];
         System.debug('questionList'+questionList);
         for(Assessment_Template_Junction__c ac:questionList)
         {
              System.debug('ac @@'+ac);
         }
        return questionList;
*/
         return questionList;
        /*
        
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
        
         
         return questionListWrapper; */
         
    }
    @AuraEnabled(cacheable=true)
     Public static List<SObject> getSupplierResponseList(String assessmentId){
        List<Sobject> SupplierResponseList=  [select Id, Question__c, Assessment__r.Name, Response__c,CreatedBy.Name,CreatedDate, Flag__c, Conversation_History__c,LastModifiedDate,LastModifiedById from Response__c where Assessment__c=:assessmentId];
        System.debug('SupplierResponseList'+SupplierResponseList);
         return SupplierResponseList;
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
        List<Response__c> responseList = new List<Response__c>();
         System.debug('suppResponseList'+suppResponseList);
        for(Integer i=0;i<suppResponseList.size();i++)
        {
            Response__c response = new Response__c();
            response.Rythm__Assessment__c = (Id)suppResponseList[i].get('Assessment__c');
            response.Rythm__Question__c =(Id)suppResponseList[i].get('Rythm__Question__c');
            response.Rythm__Account__c = (Id)suppResponseList[i].get('Rythm__Account__c');
            response.Rythm__Response__c = (String)suppResponseList[i].get('Rythm__Response__c');
            responseList.add(response);
        }
        insert responseList;
        if(isSubmit)
        {
            	List<Rythm__Assessment__c> at=[select id,name,Rythm__Assesment_Status__c from Rythm__Assessment__c where id=:assesmentId];
                at[0].Rythm__Assesment_Status__c ='Submitted';
            	update at;
        }
        System.debug('Response inserted succes'+responseList);
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
        List<Assessment__c> AssessmentRecords= [select Name,Target_Completion_Date__c,Assesment_Status__c,
                                                       Additional_Requests__c,Customer_Review__c,Number_of_Questions__c,
                                                       Number_of_Responses__c from Assessment__c];
        System.debug('AssessmentRecords'+AssessmentRecords);
        return AssessmentRecords;
    }
   @AuraEnabled
    public static List<Rythm__Response__c> getResponseList(string assessmentId,string questionId)
    {
        List<Rythm__Response__c> responseRecords=[select Rythm__Conversation_History__c,createdDate	from Rythm__Response__c where Rythm__Assessment__c =:assessmentId AND Rythm__Question__c=:questionId];
      
        return responseRecords;
    }
       @AuraEnabled
    public static string getUserName()
    {
        string userName=UserInfo.getName();
        return userName;
    }
      @AuraEnabled
    public static void saveChatterResponse(string responseList,string assessmentId,string questionId)
    {
               List<Rythm__Response__c> responseRecords=[select Rythm__Conversation_History__c,createdDate	from Rythm__Response__c where Rythm__Assessment__c =:assessmentId AND Rythm__Question__c=:questionId];
             responseRecords[0].Rythm__Conversation_History__c=responseList;
             update responseRecords;

    }
     @AuraEnabled
    public static void errorLogRecord(string componentName,string methodName,string className,string errorData)
    {
        System.debug('hhhh');
        Rythm__ErrorTransactionLog__c errorRecord=new Rythm__ErrorTransactionLog__c();
        errorRecord.Rythm__Class_Name__c=className;
        errorRecord.Rythm__LWC_Component_Name__c=componentName;
        errorRecord.Rythm__Method_Name__c=methodName;
        errorRecord.Rythm__Error_Stack_Trace__c=errorData;
        insert errorRecord;
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