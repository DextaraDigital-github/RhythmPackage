/*
* Class Name        : AssessmentController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula          
* Created Date      :
* Description       : AssessmentControllerTest class is used to check the code coverage for AssessmentController
* Last Modified Date:
*/

@isTest
public class AssessmentControllerTest
{
    @testSetup
    public static void methodName() {
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Supplier').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier'};
        List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        System.debug('accts==>'+accts[0].Id);
        Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com'};
        List<Contact> contacts = TestDataFactory.createContacts(1,true,contactAttributes);
        Profile portalProfile = [SELECT Id FROM Profile WHERE Name='Customer Community User' Limit 1];
            Map<String,Object> userattributes = new Map<String,Object>{'UserName'=>accts[0].Name,'LastName'=>accts[0].Name,
            'Alias'=>'Testuser','ContactId'=>contacts[0].Id,'ProfileId'=>portalProfile.Id,'EmailEncodingKey'=>'UTF-8',
             'CommunityNickname' => 'test12345',
             'TimeZoneSidKey' => 'America/Los_Angeles',
             'LocaleSidKey' => 'en_US',
             'LanguageLocaleKey' => 'en_US'};
        List<User> users = TestDataFactory.createUser(1,true,userattributes);
        Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
        List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
        System.debug('templist'+templist[0].Id);
        Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
        List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
        System.debug('seclist'+seclist[0].Id);
           
        Map<String, Object> QuestionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
            'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Text','Rhythm__Required__c'=>True,
             'Rhythm__Section__c'=>seclist[0].Id};
        List<Question__c> qstnlist=TestDataFactory.createQuestion(1,true,QuestionAttributes);
               System.debug('qstnlist'+qstnlist[0].Id);
        Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
         'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
        List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
           
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
              'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                  List<AccountAssessmentRelation__c> accountasslist=TestDataFactory.createAccountAssessment(1,true,accountassesments);
                   System.debug('kkk'+accountasslist);
         Map<String, Object> responseattributes = new Map<String, Object>{'Rhythm__AccountAssessmentRelation__c'=>accountasslist[0].Id,
             'Rhythm__Question__c'=>qstnlist[0].id,'Rhythm__Flag__c'=>true,'Rhythm__Is_Latest_Response__c'=>True};
       List<Response__c> resplist=TestDataFactory.createResponse(1,true,responseattributes);

               
    }
    @isTest
    public static void AssessmentTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> accAssessment=[select Id,Name,Status__c from AccountAssessmentRelation__c];
        List<Sobject> supplierAssessment = AssessmentController.getSupplierAssessmentList(accAssessment[0].Id);
        Test.stopTest();
        System.assertEquals(supplierAssessment.size()>0, True);
    }
    @isTest
    public static void QuestionsListTest()
    {
        Test.startTest();
        List<Assessment_Template__c> templst = [select id,Name from Assessment_Template__c];
        List<Sobject> questlst = AssessmentController.getQuestionsList(templst[0].Id);
        Test.stopTest();
         System.assertEquals(questlst.size()>0, True);
    }
    @isTest
    public static void SupplierResponseListTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> acass = [SELECT id,name from AccountAssessmentRelation__c];
        System.debug('acass'+acass);
        List<SObject> accAssRel = AssessmentController.getSupplierResponseList(acass[0].Id);
        Test.stopTest();
        System.assertEquals(accAssRel.size()>0, True);
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
        System.debug('getAssessmentStatusTest'+assessment);
        FieldHistoryTracking__c historyTrack = new FieldHistoryTracking__c();
        historyTrack.object_Record_Id__c = assessment[0].Id;
        historyTrack.Rhythm__Activity_User__c ='David Miller';
        historyTrack.Rhythm__Object_Field_Value__c ='Submitted';
        historyTrack.Rhythm__Object_Name__c ='Rhythm__AccountAssessmentRelation__c';
        historyTrack.Object_Field_Name__c ='Rhythm__Status__c';
        INSERT historyTrack;
        List<Sobject> assessmentStatus = AssessmentController.getAssessmentStatus(assessment[0].Id,'Rhythm__AccountAssessmentRelation__c');
        Test.stopTest();
        System.assertEquals(assessmentStatus.size()>0, True);
    }
    @isTest
    public static void AssesmentRecordsTest()
    {
        Test.startTest();
        List<Object> assessmentRecordData=AssessmentController.getAssesmentRecords();
        Test.stopTest();
        System.assertEquals(assessmentRecordData.size()>0, TRUE);
    }
    @isTest
    public static void AccountAssesmentRecordsTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> acs =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        String accId = (String)acs[0].get('Rhythm__Account__c');
        String assessmentId =(String)acs[0].get('Rhythm__Assessment__c');
        List<Object> accountassessment = AssessmentController.getAccountAssesmentRecords(accId,assessmentId);
        Test.stopTest();
        System.assertEquals(accountassessment.size()>0, True);
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
        //List<SObject> accassmnt = AssessmentController.createSupplierResponse(resplst,JSON.serialize(queryMap));
        Test.stopTest();
        //System.assertEquals(accassmnt.size()>0, True);
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
        System.assertEquals(response.size()>0, True);
    }
    @isTest
    public static void userNameTest()
    {
        Test.startTest();
        String userName = AssessmentController.getUserName();
        Test.stopTest();
        System.assertEquals(userName!=null, True);
    }
    @isTest
    public static void AccountIdTest()
    {
        Test.startTest();
        String AccId =AssessmentController.getAccountId();
        List<User> strAccId = [SELECT Contact.AccountId FROM User WHERE id=:userinfo.getuserid()];
        Test.stopTest();
        if(strAccId[0].Contact.AccountId !=null)
        {
        System.assertEquals(String.isEmpty(AccId),False);
        }
       
    }
    @isTest
    public static void communityTest()
    {
        Test.startTest();
        String CommunityUrl = AssessmentController.getCommunityURL();
        Test.stopTest();
        System.assertEquals(CommunityUrl!=null, True);
    }
    @isTest
    public static void AssessmentJunctionRecordsTest()
    {
        List<Account> acc = [select id,Name from Account];
        Test.startTest();
        List<SObject> lst = AssessmentController.getAssessmentJunctionRecords(acc[0].Id);
        Test.stopTest();
        System.assertEquals(lst.size()>0, True);
    }
    @isTest
    public static void AccountAssessmentRecordDataTest()
    {
        Test.startTest();
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        List<SObject> accountassessment = AssessmentController.getAccountAssessmentRecordData(accAssessment[0].Id);
        Test.stopTest();
         System.assertEquals(accountassessment.size()>0, TRUE);
    }
    @isTest
    public static void getResponseFlagTest()
    {
        Test.startTest();
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        List<SObject> acc= AssessmentController.getResponseFlag(questions[0].Id,accAssessment[0].Id);
        Test.stopTest();
         System.assertEquals(acc.size()>0,True);
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
        //String chatter = AssessmentController.saveChatterResponse(JSON.serialize(queryMap2));
        Test.stopTest();
        //System.assertEquals(chatter!=null, True);
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
        System.assertEquals(1, result.size());
    }
    @isTest
    public static void deleteFileTest()
    {
        List<Question__c> questions=[select Id,Name,Assessment_Template__c from Question__c ];
        List<AccountAssessmentRelation__c> accAssessment =[SELECT Id,Account__c,Assessment__c from AccountAssessmentRelation__c];
        String fileResp = '{"quesId":"'+questions[0].Id+'","assessmentId":"'+accAssessment[0].Id+'","name":"test.txt","fileBlob":"data:text/plain;base64,dGVzdCBmaWxl"}';
        String deleteResp = '{"questionId":"'+questions[0].Id+'","accountAssessmentId":"'+accAssessment[0].Id+'","name":"test.txt","fileBlob":"data:text/plain;base64,dGVzdCBmaWxl"}';
        ContentVersion cv = new ContentVersion();
        cv.VersionData = EncodingUtil.base64Decode('dGVzdCBmaWxl');
        cv.PathOnClient = 'test.txt';
        insert cv;
       
        List<Response__c> result = AssessmentController.uploadFile(fileResp);
        Test.startTest();
        Object deleteFile = AssessmentController.deleteFileAttachment(deleteResp);
        Test.stopTest();
        System.assertEquals(deleteFile!=null, True);
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
        //ErrorTransactionLog__c errorRecord = AssessmentController.errorLogRecord(JSON.serialize(queryMap2));
        Test.stopTest();
        //System.assertEquals(errorRecord!=null, True);
    }
    @isTest
    public static void getAllSupplTest(){
        List<Account> accList = [select id,Name from Account];
        String exData = '["' + accList[0].Id + '"]';
        String searchKey = 'Supplier';
        String exSearchKey = '';
        Test.startTest();
        List<Account> testAccList = AssessmentController.getAllSuppliers(exData,searchKey,exSearchKey);
        Test.stopTest();
    }
    @isTest
    public static AssessmentController.ResultWrapper sendAssessmentTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<Assessment_Template__c> tempList = [SELECT Id FROM Assessment_Template__c];
        //List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        //SObject asmtRecord = assmentList[0];
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
        return retWrap;
    }

    @isTest
    public static AssessmentController.ResultWrapper sendAssessmentUpdateTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<Assessment_Template__c> tempList = [SELECT Id FROM Assessment_Template__c];
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];

        String operationType = 'update';
        String suppliers = '';
        String existingSups = '';
        String deleteList = '["' + accList[0].Id + '"]';
        Test.startTest();
        retWrap = AssessmentController.sendAssessment(asmtRecord,operationType,suppliers,existingSups,deleteList);
        Test.stopTest();
        return retWrap;
    }
    @isTest
    public static AssessmentController.ResultWrapper addSuppliersTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<Account> accList = [select id,Name from Account];
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];

        String suppliers = '["' + accList[0].Id + '"]';
        Test.startTest();
        retWrap = AssessmentController.addSuppliers(asmtRecord.Id,suppliers);
        Test.stopTest();
        return retWrap;
    }

    @isTest
    public static void updateAssessmentSuppliersTest(){
        AssessmentController.ResultWrapper retWrap = new AssessmentController.ResultWrapper();
        List<SObject> assmentList = [select id,Start_Date__c,End_Date__c,Template__c from Assessment__c];
        SObject asmtRecord = assmentList[0];
        Test.startTest();
        retWrap = AssessmentController.updateAssessmentSuppliers(asmtRecord.Id);
        Test.stopTest();
    }


}