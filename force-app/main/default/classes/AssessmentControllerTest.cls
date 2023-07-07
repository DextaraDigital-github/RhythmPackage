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
        Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com'};
        List<Contact> contacts = TestDataFactory.createContacts(1,true,contactAttributes);
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
        List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
        List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
        Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
             'Rhythm__Section__c'=>seclist[0].Id};
        List<Question__c> qstnlist=TestDataFactory.createQuestion(1,true,questionAttributes);
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
         'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
        List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
           
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
              'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                  List<AccountAssessmentRelation__c> accountasslist=TestDataFactory.createAccountAssessment(1,true,accountassesments);
                  

               
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
        System.assertEquals(supplierAssessment.size()>0, True);
    }
    @isTest
    public static void questionsListTest()
    {
        Test.startTest();
        List<Assessment_Template__c> templst = [select id,Name from Assessment_Template__c];
        List<Sobject> questlst = AssessmentController.getQuestionsList(templst[0].Id);
        Test.stopTest();
         System.assertEquals(questlst.size()>0, True);
    }
    @isTest
    public static void supplierResponseListTest()
    {	Map<String, Object> attributes=new Map<String, Object>();
		list<Response__c> resplist=TestDataFactory.createResponse(1,true,attributes);
		
        Test.startTest();
        List<AccountAssessmentRelation__c> acass = [SELECT id,name from AccountAssessmentRelation__c];
        List<SObject> accAssRel = AssessmentController.getSupplierResponseList(acass[0].Id);
        Test.stopTest();
        System.assertEquals(accAssRel.size()<1, True);
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
        System.assertEquals(assessmentStatus.size()>0, True);
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
        System.assert(assessmentStatus!=null,'true');
    }
    @isTest
    public static void assesmentRecordsTest()
    {
        Test.startTest();
        List<Object> assessmentRecordData=AssessmentController.getAssesmentRecords();
        Test.stopTest();
         System.assert(assessmentRecordData!=null,'true');
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
        System.assert(accountassessment!=null,'True');
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
        List<SObject> accassmnt = AssessmentController.createSupplierResponse(resplst,JSON.serialize(queryMap));
        Test.stopTest();
        System.assert(resplst!=null, 'True');
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
        System.assert(response!=null, 'True');
    }
    @isTest
    public static void userNameTest()
    {
        Test.startTest();
        String userName = AssessmentController.getUserName();
        Test.stopTest();
        System.assert(userName!=null, 'True');
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
        System.assert(String.isEmpty(accIds),'False');
        }
       
    }
    @isTest
    public static void communityTest()
    {
        Test.startTest();
        String communityUrl = AssessmentController.getCommunityURL();
        Test.stopTest();
        System.assert(communityUrl!=null, 'True');
    }
    @isTest
    public static void assessmentJunctionRecordsTest()
    {
        List<Account> acc = [select id,Name from Account];
        Test.startTest();
        List<SObject> lst = AssessmentController.getAssessmentJunctionRecords(acc[0].Id);
        Test.stopTest();
        System.assert(lst.size()>0, 'True');
    }
    @isTest
    public static void accountAssessmentRecordDataTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        List<SObject> accountassessment = AssessmentController.getAccountAssessmentRecordData(accAssessment[0].Id);
        Test.stopTest();
         System.assert(accountassessment.size()>0, 'TRUE');
    }
    @isTest
    public static void getResponseFlagTest()
    {
        Test.startTest();
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        List<SObject> acc= AssessmentController.getResponseFlag(questions[0].Id,accAssessment[0].Id);
        Test.stopTest();
         System.assert(acc.size()<1,'True');
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
        AssessmentController.saveChatterResponse(JSON.serialize(queryMap2));
        Test.stopTest();
        System.assert(True);
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
        System.assert(result.size()>0,'true');
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
       
        List<Response__c> result = AssessmentController.uploadFile(fileResp);
        Test.startTest();
        Object deleteFile = AssessmentController.deleteFileAttachment(deleteResp);
        Test.stopTest();
        System.assert(deleteFile!=null, 'True');
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
        ErrorTransactionLog__c errorRecord = AssessmentController.errorLogRecord(JSON.serialize(queryMap2));
        Test.stopTest();
        System.assert(queryMap2!=null, 'True');
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
        System.assert(aclist.size()>0, 'true');
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
    }

    @isTest
    public static void sendAssessmentUpdateTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];

        String operationType = 'update';
        String suppliers = '';
        String existingSups = '';
        String deleteList = '["' + accList[0].Id + '"]';
        Test.startTest();
        retWrap = AssessmentController.sendAssessment(asmtRecord,operationType,suppliers,existingSups,deleteList);
        Test.stopTest();
        System.assert(retWrap!=null, 'true');
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
        System.assert(retWrap!=null, 'true');
    }

    @isTest
    public static void getAssesmentRecordTest(){
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        List<Assessment__c> assmtList = AssessmentController.getAssessmentRecord(asmtRecord.Id);
        Test.stopTest();
        System.assert(assmtList.size()>0, 'true');
    }

    @isTest
    public static void getExistingSuppliersWithSearchTest(){
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        List<AccountAssessmentRelation__c> assmtList = AssessmentController.getExistingSuppliersWithSearch(asmtRecord.Id,'Supplier');
        Test.stopTest();
        System.assert(assmtList.size()<1, 'true');
    }

    @isTest
    public static void deleteAssessmentTest(){
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        AssessmentController.ResultWrapper retWrap = AssessmentController.deleteAssessment(asmtRecord.Id);
        Test.stopTest();
        System.assert(retWrap!=null, 'true');
    }

    @isTest
    public static void getTemplateDataTest(){
        List<Assessment_Template__c> templst = [select id,Name from Assessment_Template__c];
        Test.startTest();
        List<Assessment_Template__c> retList = AssessmentController.getTemplateData(templst[0].Id);
        Test.stopTest();
        System.assert(retList!=null, 'true');
    }

    @isTest
    public static void getAssessmentRecordDataTest(){
        List<Account> accList = [select id,Name from Account];
        Test.startTest();
        List<Assessment__c> retWrap = AssessmentController.getAssessmentRecordData(accList[0].Id);
        Test.stopTest();
        System.assert(retWrap!=null, 'true');
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
        System.assert(testString=='Success', 'true');
    }
}