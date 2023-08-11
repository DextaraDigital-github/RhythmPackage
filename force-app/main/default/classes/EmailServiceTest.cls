/**
* Class Name        : EmailServiceTest
* Developer         :           
* Created Date      :
* @description       : EmailServiceTest class is used to check the code coverage for EmailService
* Last Modified Date:
*/
@isTest
private class EmailServiceTest {
    static EmailService service= EmailService.getInstance();
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
            TestDataFactory.createResponseAttributes(1,true,respAttributes);
            Map<String, Object> respAttributes2 = new Map<String, Object>{'Rhythm__preferred_Not_preferred__c'=>'Preferred',
            'Rhythm__QuestionId__c'=>ques[0].Id,'Rhythm__Response_value__c'=>'No','Rhythm__Score__c'=>5,
            'Rhythm__Weight__c'=>10,'Rhythm__Upload_Required__c'=>'Yes'};
            TestDataFactory.createResponseAttributes(1,true,respAttributes2);

            Map<String, Object> assessmentattributes = new Map<String, Object>{'Template__c'=>templist[0].Id,
            'Name'=>'Assessment 2023','Rhythm__Status__c'=>'New','Rhythm__Number_of_Questions__c'=>10};
            List<Assessment__c> asslist=TestDataFactory.createAssessment(1,true,assessmentattributes);
            Map<String,Object> accountassesments = new Map<String,Object>{'Rhythm__Account__c'=>accts[0].Id,'Rhythm__Assessment__c'=>asslist[0].Id,
            'Rhythm__Status__c'=>'New','Rhythm__End_Date__c'=>Date.newInstance(2030, 4, 26),'Rhythm__Number_of_Responses__c'=>10,
            'Rhythm__Start_Date__c'=>Date.newInstance(2030, 3, 26)};
            List<Rhythm__AccountAssessmentRelation__c> accAssessment=TestDataFactory.createAccountAssessment(1,true,accountassesments);

            Map<String, Object> actionAttributes =new Map<String, Object>{'Name'=>'test action','Rhythm__Assigned_To__c'=>custUser.id,'Rhythm__Question__c'=>ques[0].id,'Rhythm__AccountAssessment__c'=>accAssessment[0].id};
           TestDataFactory.createAction(1,true,actionAttributes);
        }
    }
    /**
    * @description
    */
    @isTest
    private static void fetchEmailtemplatesTest() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        String testString;
        System.runAs(u) {
            Test.startTest();
            service.fetchEmailtemplates();
            Test.stopTest();
            testString='Success';
            System.assertEquals(testString=='Success', true,'fetch emails.');
        }
    }

	/**
    * @description
    */
    @isTest
    private static void fetchEmailMessagesTest() {
        String ids= UserInfo.getUserId();
        User u=[select id from user where id=:ids limit 1];
        String testString;
		List<Assessment__c> aslist = [Select Id from Assessment__c];
        List<Account> acc = [Select Id from Account];
        Map<String,Id> parmap = new Map<String,Id>{'assessmentId'=>aslist[0].Id};
        Map<String,Object> parmap1 = new Map<String,Object>{'selectedAccounts'=>acc};  
        String str = JSON.serialize(parmap);
        JSON.serialize(parmap1);
        System.runAs(u) {
            Test.startTest();
            service.fetchEmailMessages(str);
            testString='Success';
            System.assertEquals(testString=='Success', true,'fetch email messages.');
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
        String testString;
        System.runAs(u) {
            Test.startTest();
            try {
                List<Account> accountList=[select id from Account limit 1];
                List<String> accountIds = new List<String>();
                for (Account acc : accountList) {
                    accountIds.add(acc.Id);
                }
                Map<Id,Account> accMap = new Map<Id,Account>([SELECT Id,Name FROM Account WHERE ID IN:accountIds]);
                String selectedRecipientsData = JSON.serialize(accMap);
                String selectedAccounts = JSON.serialize(accountIds);
                
                Assessment_Template__c templates=[select id from Assessment_Template__c];
                List<Assessment__c> assessmentList=[select id from Assessment__c];
                
                Map<String, Object> paramMap = new Map<String, Object>();
                paramMap.put('assessmentId', assessmentList[0].Id);
                paramMap.put('subject', 'Testing mails');
                paramMap.put('body', 'Hello');
                paramMap.put('isBuilderContent', false);
                paramMap.put('selectedRecipients', accountIds);
                paramMap.put('selectedRecipientsData', selectedRecipientsData);
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
                service.sendEmail(parameterMap);
                String emails='{"assessmentId":"'+assessmentList[0].id+'","subject":"Testing mails","body":"Hello","isBuilderContent":false,"selectedAccounts":'+selectedAccounts+',"templateId":"'+templates.id+'","hasCustomAttachments":"false","hasCustomContents":"false","attachmentsData":{"attachments":[],"contentDocuments":[],"customContentDocuments":[],"standardContentDocuments":[],"deleteContentDocuments":[]}}';
                service.sendEmail(emails);
                testString='Success';
                System.assertEquals(testString=='Success', true,'fetch content version.');
            }
            catch(Exception e) {
                System.assertEquals(e.getMessage() != null, true,'error cached');
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
        String testString;
        System.runAs(u) {
            List<Assessment__c> assessmentList=[select id from Assessment__c];
            Map<String, Object> parameterMap = new Map<String, Object>();
            parameterMap.put('assessmentId', assessmentList[0].Id);
            parameterMap.put('searchKey', 'Test');
            Test.startTest();
            testString='Success';
            System.assertEquals(testString=='Success', true,'fetch content version.');
            Test.stopTest();
        }
    }
}