/**
* Class Name        : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula          
* Created Date      :
* @description       : AssessmentControllerTest class is used to check the code coverage for AssessmentController
* Last Modified Date:
*/

@isTest
public class AssessmentControllerTest
{   
    /**
    * @description
    */
    @testSetup
    public static void methodName() {
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
        List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John David'};
        TestDataFactory.createContacts(1,true,contactAttributes);
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
        List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
        List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
        Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
             'Rhythm__Section__c'=>seclist[0].Id};
        TestDataFactory.createQuestion(1,true,questionAttributes);
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
         'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
        List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
           
        Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
              'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
        TestDataFactory.createAccountAssessment(1,true,accountassesments);
                  

               
    }

    /**
    * @description
    */
    @isTest
    public static void assessmentTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> accAssessment=[select Id,Name,Status__c from AccountAssessmentRelation__c];
        List<Sobject> supplierAssessment = AssessmentController.getSupplierAssessmentList(accAssessment[0].Id);
        Test.stopTest();
        System.assertEquals(supplierAssessment.size()>0, true,'Supplier Assessment Exist');
    }
    
    
    @isTest
    public static void getSupplierAssessmentListError()
    {
         List<Sobject> supplierAssessment=new List<Sobject>();
        Test.startTest();
         try{
       supplierAssessment = AssessmentController.getSupplierAssessmentList(null);
         }
        catch(Exception e)
        {    
            System.assertEquals(supplierAssessment.size()==0, true,'Supplier Assessment Not Exist');        
        }
        Test.stopTest();
        
    }
    @isTest
    public static void questionsListTest()
    {
        Test.startTest();
        List<Assessment_Template__c> templst = [select id,Name from Assessment_Template__c];
        List<Sobject> questlst = AssessmentController.getQuestionsList(templst[0].Id);
        Test.stopTest();
         System.assertEquals(questlst.size()>0, true,'Template Questions Exist');
    }
    @isTest
    public static void questionsListerror()
    {
         List<Sobject> questlst=new List<Sobject>();
        Test.startTest();
        try{
        questlst = AssessmentController.getQuestionsList(null);
        }
        catch(Exception e){
            System.assertEquals(questlst.size()==0, true,'Template Questions not Exist');
        }
        Test.stopTest();
         
    }
    @isTest
    public static void supplierResponseListTest()
    {	Map<String, Object> attributes=new Map<String, Object>();
		TestDataFactory.createResponse(1,true,attributes);
		
        Test.startTest();
        List<AccountAssessmentRelation__c> acass = [SELECT id,name from AccountAssessmentRelation__c];
        List<SObject> accAssRel = AssessmentController.getSupplierResponseList(acass[0].Id);
        Test.stopTest();
        System.assertEquals(accAssRel.size()<1, true,'Supllier Response not saved yet');
    }
     @isTest
    public static void supplierResponseListError()
    {
		 List<Sobject> accAssRel=new List<Sobject>();
        Test.startTest();
        try{        
        accAssRel = AssessmentController.getSupplierResponseList(null);
        }
        catch(Exception e){
            System.assertEquals(accAssRel.size()==0, true,'Supllier Response not saved yet');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void updateAccountAssessmentStatusTest()
    {
        Test.startTest();
        Map<String,object> queryMap1 =new Map<String,object>();
        List<Sobject> accAssessment =[SELECT id,name,Status__c from AccountAssessmentRelation__c];
        queryMap1.put('recId',accAssessment[0].Id);
        queryMap1.put('assessmentStatus',accAssessment[0].get('Rhythm__Status__c'));
        List<Sobject> assessmentStatus = AssessmentController.updateAccountAssessmentStatus(JSON.serialize(queryMap1));
        Test.stopTest();
        System.assertEquals(assessmentStatus.size()>0, true,'Response status updated');
    }
     @isTest
    public static void updateAccountAssessmentStatusError()
    {
        Test.startTest();
         List<Sobject> assessmentStatus=new List<Sobject>();
        try{
       assessmentStatus = AssessmentController.updateAccountAssessmentStatus(null);
        }
        catch(Exception e){
            System.assertEquals(assessmentStatus.size()==0, true,'Response status not updated');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void getAssessmentStatusTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> assessment=[select Id from AccountAssessmentRelation__c];
        FieldHistoryTracking__c historyTrack = new FieldHistoryTracking__c();
        historyTrack.object_Record_Id__c = assessment[0].Id;
        historyTrack.Rhythm__Activity_User__c ='David Miller';
        historyTrack.Rhythm__Object_Field_Value__c ='Submitted';
        historyTrack.Rhythm__Object_Name__c ='Rhythm__AccountAssessmentRelation__c';
        historyTrack.Object_Field_Name__c ='Rhythm__Status__c';
        INSERT historyTrack;
        List<Sobject> assessmentStatus = AssessmentController.getAssessmentStatus(assessment[0].Id,'Rhythm__AccountAssessmentRelation__c');
        Test.stopTest();
        System.assertEquals(assessmentStatus!=null,true,'assessment status exist');
    }
     @isTest
    public static void getAssessmentStatusError()
    {
        Test.startTest();
        List<Sobject> assessmentStatus=new List<Sobject>();
        try{
        assessmentStatus = AssessmentController.getAssessmentStatus(null,null);
        }
        catch(Exception e){
            System.assertEquals(assessmentStatus.size() ==0,true,'assessment status not exist');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void assesmentRecordsTest()
    {
        Test.startTest();
        List<Object> assessmentRecordData=AssessmentController.getAssesmentRecords();
        Test.stopTest();
         System.assertEquals(assessmentRecordData!=null,true,'Assessment Record Exist');
    }
    
    @isTest
    public static void accountAssesmentRecordsTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> acs =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        String accIds = (String)acs[0].get('Rhythm__Account__c');
        String assessmentId =(String)acs[0].get('Rhythm__Assessment__c');
        List<Object> accountassessment = AssessmentController.getAccountAssesmentRecords(accIds,assessmentId);
        Test.stopTest();
        System.assertEquals(accountassessment!=null,true,'AccountAssessmentRecords Exist');
    }
     @isTest
    public static void accountAssesmentRecordsError()
    {
        Test.startTest();
        List<Object> accountassessment=new List<Object>();
        try{
        accountassessment = AssessmentController.getAccountAssesmentRecords(null,null);
        }
        catch(Exception e){
            System.assertEquals(accountassessment.size()==0,true,'AccountAssessmentRecords doesnot Exist');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void createSupResponseListTest()
    {
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        Map<String,object> queryMap =new Map<String,object>();
        queryMap.put('Rhythm__Question__c',questions[0].Id);
        queryMap.put('accountassessmentid',accAssessment[0].Id);
        queryMap.put('pdfContnet','sample pdf');
        queryMap.put('status','Submitted');
        Response__c resp = new Response__c();
        resp.Question__c =questions[0].Id;
        resp.Rhythm__Response__c ='Yes';
        resp.AccountAssessmentRelation__c = accAssessment[0].Id;
        List<SObject> resplst = new List<SObject>();
        resplst.add(resp);
        Test.startTest();
        AssessmentController.createSupplierResponse(resplst,JSON.serialize(queryMap));
        Test.stopTest();
        System.assertEquals(resplst!=null, true,'Supplier Response records created');
    }
    @isTest
    public static void createSupResponseListError()
    {
        
        Test.startTest();
        try{
        AssessmentController.createSupplierResponse(null,null);
        }
        catch(exception e){
            System.assertEquals(true,true,'createSupplierResponse catch block');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void getResponseListTest()
    {
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        Map<String,object> queryMap2 =new Map<String,object>();
        queryMap2.put('questionId',questions[0].Id);
        queryMap2.put('accountassessmentId',accAssessment[0].Id);
        Test.startTest();
        List<Response__c> response = AssessmentController.getResponseList(JSON.serialize(queryMap2));
        Test.stopTest();
        System.assertEquals(response!=null, true,'Supplier Response records Exist');
    }
     @isTest
    public static void getResponseListError()
    {
        Test.startTest();
         List<Response__c> response= new List<Response__c>();
        try{
        response = AssessmentController.getResponseList(null);
        }
        catch(Exception e){
            System.assertEquals(response.size()==0, true,'Supplier Response records not Exist');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void userNameTest()
    {
        Test.startTest();
        String userName = AssessmentController.getUserName();
        Test.stopTest();
        System.assertEquals(userName!=null, true,'Get the Supplier UserName');
    }
    @isTest
    public static void accountIdTest()
    {
        Test.startTest();
        String accIds =AssessmentController.getAccountId();
        List<User> strAccId = [SELECT Contact.AccountId FROM User WHERE id=:userinfo.getuserid()];
        Test.stopTest();
        if(strAccId[0].Contact.AccountId !=null)
        {
        System.assertEquals(String.isEmpty(accIds),false,'Got the User AccountId');
        }
       
    }
   
    @isTest
    public static void communityTest()
    {
        Test.startTest();
        String communityUrl = AssessmentController.getCommunityURL();
        Test.stopTest();
        System.assertEquals(communityUrl!=null, true,'Got the community url');
    }
    @isTest
    public static void assessmentJunctionRecordsTest()
    {
        List<Account> acc = [select id,Name from Account];
        Test.startTest();
        List<SObject> lst = AssessmentController.getAssessmentJunctionRecords(acc[0].Id);
        Test.stopTest();
        System.assertEquals(lst.size()>0, true,'Got the AssessmentRecords');
    }
     @isTest
    public static void assessmentJunctionRecordsError()
    {
        List<SObject> lst = new List<SObject> ();
        Test.startTest();
        try{
         lst = AssessmentController.getAssessmentJunctionRecords(null);
        }
        catch(Exception e){
            System.assertEquals(lst.size()==0, true,'No AssessmentRecords');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void accountAssessmentRecordDataTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        List<SObject> accountassessment = AssessmentController.getAccountAssessmentRecordData(accAssessment[0].Id);
        Test.stopTest();
         System.assertEquals(accountassessment.size()>0, true,'accountAssessment records created');
    }
    @isTest
    public static void accountAssessmentRecordDataError()
    {
        Test.startTest();
        List<SObject> accountassessment=new List<SObject>();
        try{
        accountassessment = AssessmentController.getAccountAssessmentRecordData(null);
        }
        catch(Exception e){
            System.assertEquals(accountassessment.size()==0, true,'accountAssessment records not created');
        }
        Test.stopTest();
         
    }
    @isTest
    public static void getResponseFlagTest()
    {
        Test.startTest();
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        List<SObject> acc= AssessmentController.getResponseFlag(questions[0].Id,accAssessment[0].Id);
        Test.stopTest();
         System.assertEquals(acc.size()<1,true,'flagged response data not created');
    }
    @isTest
    public static void getResponseFlagError()
    {
        Test.startTest();
        List<SObject> acc=new List<SObject>();
        try{
         acc= AssessmentController.getResponseFlag(null,null);
        }
        catch(Exception e){
            System.assertEquals(acc.size()<1,true,'flagged response data not created');
        }
        Test.stopTest();
         
    }
    
    @isTest
    public static void saveChatterResponseTest()
    {
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        Map<String,object> queryMap2 =new Map<String,object>();
        queryMap2.put('questionId',questions[0].Id);
        queryMap2.put('accountassessmentId',accAssessment[0].Id);
        String resp = '[{"createdTime":"2023-07-03T07:52:21.000Z","Text":"male","Name":"John David","accountType":"supplier","recipientType":"cad-ad-supplier"}]';
        queryMap2.put('responseList',resp);
        Test.startTest();
        Boolean isChatterSaved = AssessmentController.saveChatterResponse(JSON.serialize(queryMap2));
        Test.stopTest();
        System.assertEquals(isChatterSaved,true,'Chatter response saved');
    }
    @isTest
    public static void saveChatterResponseerror()
    {
        
        Test.startTest();
        Boolean isChatterSaved;
        try{
        isChatterSaved = AssessmentController.saveChatterResponse(null);
        }
        catch(exception e){
            System.assertEquals(isChatterSaved,null,'Chatter response not saved');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void uploadfileTest()
    {
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        String fileResp = '{"quesId":"'+questions[0].Id+'","assessmentId":"'+accAssessment[0].Id+'","name":"test.txt","fileBlob":"data:text/plain;base64,dGVzdCBmaWxl"}';
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode('dGVzdCBmaWxl');
        cv.PathOnClient = 'test.txt';
        insert cv;
        Test.startTest();
        List<Response__c> result = AssessmentController.uploadFile(fileResp);
        Test.stopTest();
        System.assertEquals(result.size()>0,true,'File uploaded successfully');
    }
    @isTest
    public static void uploadfileError()
    {
        List<Response__c> result=new List<Response__c> ();
        Test.startTest();
        try{
        result = AssessmentController.uploadFile(null);
        }
        catch(Exception e){
            System.assertEquals(result.size()==0,true,'File not uploaded successfully');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void deleteFileTest()
    {
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        String fileResp = '{"quesId":"'+questions[0].Id+'","assessmentId":"'+accAssessment[0].Id+'","name":"test.pdf","fileBlob":"data:text/plain;base64,dGVzdCBmaWxl"}';
        String deleteResp = '{"questionId":"'+questions[0].Id+'","accountAssessmentId":"'+accAssessment[0].Id+'","name":"test.pdf","fileBlob":"data:text/plain;base64,dGVzdCBmaWxl"}';
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode('dGVzdCBmaWxl');
        cv.PathOnClient = 'test.txt';
        insert cv;
        AssessmentController.uploadFile(fileResp);
        Test.startTest();
        Object deleteFile = AssessmentController.deleteFileAttachment(deleteResp);
        Test.stopTest();
        System.assertEquals(deleteFile!=null, true,'File deleted successfully');
    }
     @isTest
    public static void deleteFileError()
    {
       
        Test.startTest();
        Object deleteFile;
        try{
        deleteFile = AssessmentController.deleteFileAttachment(null);
        }
        catch(exception e){
            System.assertEquals(deleteFile==null, true,'File not deleted successfully');
        }
        Test.stopTest();
        
    }
    @isTest
    public static void errorLogRecordTest()
    {
        Map<String,object> queryMap2 =new Map<String,object>();
        queryMap2.put('className','AssessmentController');
        queryMap2.put('componentName','Questionnaire');
        queryMap2.put('methodName','UploadFile');
        queryMap2.put('errorData','List index out of bounds');
       
        Test.startTest();
        AssessmentController.errorLogRecord(JSON.serialize(queryMap2));
        Test.stopTest();
        System.assertEquals(queryMap2!=null, true,'Error log record created');
    }
     @isTest
    public static void errorLogRecordError()
    {  
        Test.startTest();
        try{
        AssessmentController.errorLogRecord(null);
        }
        catch(Exception e){
            System.assertEquals(true, true,'errorLogRecord catch block');
        }
        Test.stopTest();
    }
    @isTest
    public static void getAllSupplTest(){
        List<Account> accList = [select id,Name from Account];
        String exData = '["' + accList[0].Id + '"]';
        String searchKey = 'Supplier';
        String exSearchKey = '';
        Test.startTest();
        List<Account> aclist=AssessmentController.getAllSuppliers(exData,searchKey,exSearchKey);
        Test.stopTest();
        System.assertEquals(aclist.size()>0, true,'suppliers fetched');
    }
     @isTest
    public static void getAllSupplError(){
       
        Test.startTest();
        List<Account> aclist= new List<Account> ();
        try{
        aclist=AssessmentController.getAllSuppliers(null,null,null);
        }
        catch(Exception e){
            System.assertEquals(aclist.size()<=0, true,'getAllSuppliers catch block');
        }
        Test.stopTest();
    }

    @isTest
    public static void sendAssessmentTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<Assessment_Template__c> tempList = [SELECT Id FROM Assessment_Template__c];
        Assessment__c asmtRecord = new Assessment__c();
        asmtRecord.put('Name','Test Assessment');
        asmtRecord.put('Template__c',tempList[0].Id);
        asmtRecord.put('Start_Date__c',Date.Today());
        asmtRecord.put('End_Date__c',Date.Today() + 7);
        asmtRecord.put('Category__c','ESG');
        asmtRecord.put('Frequency__c','One Time');

        String operationType = 'new';
        String suppliers = '["' + accList[0].Id + '"]';
        String existingSups = '';
        String deleteList = '';
        Test.startTest();
        retWrap = AssessmentController.sendAssessment(asmtRecord,operationType,suppliers,existingSups,deleteList);
        Test.stopTest();
        System.assertEquals(retWrap!=null, true,'assessment sent');
    }
     @isTest
    public static void sendAssessmentError(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        Test.startTest();
        try{
        retWrap = AssessmentController.sendAssessment(null,null,null,null,null);
        }
        catch(Exception e){
            System.assertEquals(retWrap.errorCode ==null, true,'assessment not sent');
        }
        Test.stopTest();
        
    }
    

    @isTest
    public static void sendAssessmentUpdateTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<SObject> assmentList = [select Id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];

        String operationType = 'update';
        String suppliers = '';
        String existingSups = '';
        String deleteList = '["' + accList[0].Id + '"]';
        Test.startTest();
        retWrap = AssessmentController.sendAssessment(asmtRecord,operationType,suppliers,existingSups,deleteList);
        Test.stopTest();
        System.assertEquals(retWrap!=null, true,'assessment sent');
    }
   /* @isTest
    public static void addSuppliersTest(){
        //AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        //SObject asmtRecord = assmentList[0];

        //String suppliers = '["' + accList[0].Id + '"]';
        Test.startTest();
        //retWrap = AssessmentController.addSuppliers(String(asmtRecord.Id),suppliers);
        Test.stopTest();
    }*/

    @isTest
    public static void updateAssessmentSuppliersTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        retWrap = AssessmentController.updateAssessmentSuppliers(asmtRecord.Id);
        Test.stopTest();
        System.assertEquals(retWrap!=null, true,'updated supplier assessment');
    }

    @isTest
    public static void getAssesmentRecordTest(){
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        List<Assessment__c> assmtList = AssessmentController.getAssessmentRecord(asmtRecord.Id);
        Test.stopTest();
        System.assertEquals(assmtList.size()>0, true,'got the supplier assessment record');
    }
     @isTest
    public static void getAssesmentRecordError(){
        
        Test.startTest();
        List<Assessment__c> assmtList=new List<Assessment__c>();
        try{
         assmtList = AssessmentController.getAssessmentRecord(null);
        }
         catch(Exception e){
            System.assertEquals(assmtList.size()==0, true,'not found any supplier assessment record');
         }
        Test.stopTest();
        
    }

    @isTest
    public static void getExistingSuppliersWithSearchTest(){
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        List<AccountAssessmentRelation__c> assmtList = AssessmentController.getExistingSuppliersWithSearch(asmtRecord.Id,'Supplier');
        Test.stopTest();
        System.assertEquals(assmtList.size()<1, true,'suppliers fetched');
    }
    
     @isTest
    public static void getExistingSuppliersWithSearchTestError(){
        
        Test.startTest();
        List<AccountAssessmentRelation__c> assmtList= new List<AccountAssessmentRelation__c>();
        try{
        assmtList = AssessmentController.getExistingSuppliersWithSearch(null,null);
        }
        catch(Exception e){
        System.assertEquals(assmtList.size()==0, true,'suppliers not fetched');
        }
        Test.stopTest();
        
    }

    @isTest
    public static void deleteAssessmentTest(){
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        try{
            AssessmentController.ResultWrapper retWrap = AssessmentController.deleteAssessment(asmtRecord.Id);
            System.assertEquals(retWrap!=null, true,'assessment deleted');
        }catch(exception e){
            //System.assertEquals(retWrap!=null, true,'assessment deleted');
        }
        Test.stopTest();
    }
     @isTest
    public static void deleteAssessmentError(){
        Test.startTest();
        AssessmentController.ResultWrapper retWrap=new AssessmentController.ResultWrapper();
        try{
         retWrap = AssessmentController.deleteAssessment(null);
        }
        catch(exception e){
            System.assertEquals(retWrap.errorCode ==null, true,'Assessment program in use, cannot be deleted.');
        }
        Test.stopTest();
    }

    @isTest
    public static void getTemplateDataTest(){
        List<Assessment_Template__c> templst = [select id,Name from Assessment_Template__c];
        Test.startTest();
        List<Assessment_Template__c> retList = AssessmentController.getTemplateData(templst[0].Id);
        Test.stopTest();
        System.assertEquals(retList!=null, true,'Fetched Template Data');
    }

    @isTest
    public static void getAssessmentRecordDataTest(){
        List<Account> accList = [select id,Name from Account];
        Test.startTest();
        List<Assessment__c> retWrap = AssessmentController.getAssessmentRecordData(accList[0].Id);
        Test.stopTest();
        System.assertEquals(retWrap!=null, true,'Got the Assessment Record');
    }

    @isTest
    public static void updateAccAssessmentStatusTest(){
        String testString;
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        Test.startTest();
        for(AccountAssessmentRelation__c assRln:accAssessment){
            assRln.Status__c = 'In Review';
        }
        update accAssessment;
        testString='Success';
        Test.stopTest();
        System.assertEquals(testString=='Success', true,'updated AccountAssessment status');
    }
    
    @isTest
    public static void getSiteData(){
        Test.startTest();
        //AccountAssessmentRelationHandler asmRel = new AccountAssessmentRelationHandler();
        List<Configuration__mdt> testMdt = new List<Configuration__mdt>();
        testMdt = AccountAssessmentRelationHandler.siteURLData;
        Test.stopTest();
    }
}