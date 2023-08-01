/**
* Class Name        : EmailServiceTest
* Developer         :           
* Created Date      :
* @description       : EmailServiceTest class is used to check the code coverage for EmailService
* Last Modified Date:
*/
@isTest
private class EmailServiceTest {
    /**
* @description
*/
    @testSetup
    private static void testData() {
        
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        System.runAs(custUser) {
            Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Customer').getRecordTypeId();
            Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
                List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
            Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>'test123@gmail.com','LastName'=>'John David'};
                TestDataFactory.createContacts(1,true,contactAttributes);
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template'};
                List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(1,true,assementTemplateattributes);
            Map<String, Object> sectionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,'Name'=>'Section1'};
                List<Section__c> seclist=TestDataFactory.createSection(1,true,sectionAttributes);
            Map<String, Object> questionAttributes = new Map<String, Object>{'Rhythm__Assessment_Template__c'=>templist[0].Id,
                'Rhythm__Question__c'=>'What is the feedback for service?','Rhythm__Question_Type__c'=>'Picklist','Rhythm__Required__c'=>True,
                'Rhythm__Section__c'=>seclist[0].Id,'Rhythm__OptionValueSet__c'=>'Yes\r\nNo'};
                    List<Question__c> ques =TestDataFactory.createQuestion(1,true,questionAttributes);
            
            Map<String, Object> respAttributes = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
                'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'Yes','Rhythm__Score__c'=>5,
                'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
                    List<Response_Attribute__c> resp =TestDataFactory.createResponseAttributes(1,true,respAttributes);
            Map<String, Object> respAttributes2 = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
                'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'No','Rhythm__Score__c'=>5,
                'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
                    List<Response_Attribute__c> resp2 =TestDataFactory.createResponseAttributes(1,true,respAttributes2);
            
            
            
            
            
            
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
                'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
                    List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
                'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
                'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
                    List<Rhythm__AccountAssessmentRelation__c> accAssessment=TestDataFactory.createAccountAssessment(1,true,accountassesments);
            
            Map<String, Object> actionAttributes =new Map<String, Object>{'Name'=>'test action','Rhythm__Assigned_To__c'=>custUser.id,'Rhythm__Question__c'=>ques[0].id,'Rhythm__AccountAssessment__c'=>accAssessment[0].id};
                List<Action__c> acclist=TestDataFactory.createAction(1,true,actionAttributes);
            

           /* Map<String, Object> assetattributes = new Map<String, Object>{'AccountId'=>accts[0].Id,'Rhythm__AccountId__c'=>accts[0].Id};
                List<Asset> assets = TestDataFactory.createAsset(1,true,accts[0].Id,assetattributes);
            
            Map<String, Object> assementTemplateattributes = new Map<String, Object>{'Name'=>'2023 Assessment template','Rhythm__Name__c'=>'2023 Assessment template'};
                List<Assessment_Template__c> templist=TestDataFactory.createAssessmentTemp(assementTemplateattributes);
            
            Map<String, Object> projectattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Asset__c'=>assets[0].Id,
                'Rhythm__Facility__c'=>accts[0].Id,'Name'=>'AC machine'};
                    
                    List<Project__c> projlist=TestDataFactory.createProject(accts[0].id,assets[0].id,true,projectattributes);
            Map<String, Object> projectassignmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Contact__c'=>contacts[0].Id,
                'Rhythm__Project__c'=>projlist[0].Id,'Name'=>'AC machine'};
                    List<Project_Assignment__c> Proasslist=TestDataFactory.createProjectassignment(accts[0].id,contacts[0].id,projlist[0].id,null,projectassignmentattributes);
            
            Map<String, Object> assessmentattributes = new Map<String, Object>{'Rhythm__Account__c'=>accts[0].Id,'Template__c'=>templist[0].Id,
                'Rhythm__Project_Assignment__c'=>Proasslist[0].Id,'Name'=>'Assessment 2023','Rhythm__Asset__c'=>assets[0].Id};
                    List<Assessment__c> asslist=TestDataFactory.createAssessment(accts[0].id,assets[0].id,templist[0].id,Proasslist[0].id,assessmentattributes);*/
            
        }}
    /**
* @description
*/
    @isTest
    private static void fetchEmailtemplatesTest() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            Test.startTest();
            EmailService.fetchEmailtemplates();
            Test.stopTest(); 
        }
    }

	   /**
* @description
*/
    @isTest
    private static void fetchEmailMessagesTest() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
		List<Assessment__c> aslist = [Select Id from Assessment__c];
        List<Account> acc = [Select Id from Account];
        system.debug('aslist'+aslist);
        Map<String,Id> parmap = new Map<String,Id>{'assessmentId'=>aslist[0].Id};
        Map<String,Object> parmap1 = new Map<String,Object>{'selectedAccounts'=>acc};  
        String str = JSON.serialize(parmap);
        String str1 = JSON.serialize(parmap1);
        System.runAs(u) {
            Test.startTest();
            EmailService.fetchEmailMessages(str);
            Test.stopTest(); 
        }
    }

    /**
* @description
*/
    @isTest
    private static void sendEmailTest() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            Test.startTest();
            try {
                List<Account> accountList=[select id from Account limit 1];
                List<String> accountIds = new List<String>();
                for (Account acc : accountList) {
                    accountIds.add(acc.Id);
                }
                String selectedAccounts = JSON.serialize(accountIds);
                
                Assessment_Template__c templates=[select id from Assessment_Template__c];
                List<Assessment__c> assessmentList=[select id from Assessment__c];
                
                Map<String, Object> paramMap = new Map<String, Object>();
                paramMap.put('assessmentId', assessmentList[0].Id);
                paramMap.put('subject', 'Testing mails');
                paramMap.put('body', 'Hello');
                paramMap.put('isBuilderContent', false);
                paramMap.put('selectedAccounts', accountIds);
                paramMap.put('templateId', templates.Id);
                paramMap.put('hasCustomAttachments', false);
                paramMap.put('hasCustomContents', false);
                paramMap.put('attachmentsData', new Map<String, Object>{
                    'attachments'=> new List<Object>(),
                        'contentDocuments'=> new List<Object>(),
                        'customContentDocuments'=> new List<Object>(),
                        'standardContentDocuments'=> new List<Object>(),
                        'deleteContentDocuments'=> new List<Object>()
                        });
                
                String parameterMap = JSON.serialize(paramMap);
                
                EmailService.sendEmail(parameterMap);
                
                String emails='{"assessmentId":"'+assessmentList[0].id+'","subject":"Testing mails","body":"Hello","isBuilderContent":false,"selectedAccounts":'+selectedAccounts+',"templateId":"'+templates.id+'","hasCustomAttachments":"false","hasCustomContents":"false","attachmentsData":{"attachments":[],"contentDocuments":[],"customContentDocuments":[],"standardContentDocuments":[],"deleteContentDocuments":[]}}';
                String paramMaps=JSON.serialize(emails);
                system.debug('emails -->'+emails);
                system.debug('Params -->'+paramMaps);
                EmailService.sendEmail(emails);
            }
            catch(Exception e) {
                
            }
            test.stopTest();
        }}
    /**
* @description
*/
    @IsTest
    private static void testFetchAccounts() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        System.runAs(u) {
            List<Assessment__c> assessmentList=[select id from Assessment__c];
            
            List<Account> accountList=[select id from Account limit 1];
            
            Map<String, Object> parameterMap = new Map<String, Object>();
            parameterMap.put('assessmentId', assessmentList[0].Id);
            parameterMap.put('searchKey', 'Test');
            
            String parameterMapJson = JSON.serialize(parameterMap);
            Test.startTest();
            List<sObject> accounts = EmailService.fetchAccounts(parameterMapJson);
            Test.stopTest();
        }}
    
    
    
}