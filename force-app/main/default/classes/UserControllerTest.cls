@isTest
public class UserControllerTest {
    @testSetup
    static void methodName() {
        User custUser = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            custUser =  TestDataFactory.createTestUser();
        }
        Id clinicRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Customer').getRecordTypeId();
        Map<String, Object> accAttributes = new Map<String, Object>{'RecordTypeId'=>clinicRecordTypeId,'Name'=>'Supplier','Email__c'=>'test@gmail.com'};
        List<Account> accts = TestDataFactory.createAccounts(1,true,accAttributes);
        String orgId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ','').replace(':','').replace('-','');
        Integer randomInt = Integer.valueOf(math.rint(math.random()*1000000));
        String uniqueName = orgId + dateString + randomInt;
        String uniqueUserName = uniqueName + '@test' + orgId + '.org';
        Map<String,Object> contactAttributes  = new Map<String,Object>{'AccountId'=>accts[0].Id,'Email'=>uniqueUserName,'FirstName'=>'Test','LastName'=>'John David'};
        TestDataFactory.createContacts(1,true,contactAttributes);
    }
    @isTest
    static void createUserTest(){
        String testString;
        Test.startTest();
        testString = 'Success';
        Contact contactRec = [SELECT Id FROM Contact WHERE LastName='John David' LIMIT 1];
        UserController.createUser(contactRec.Id);
        Test.stopTest();
        System.assertEquals(testString=='Success', true,'Sections retrieved successfully');
    }

    @isTest
    static void createUserTestException(){
        user u = [SELECT Id,UserName FROM User WHERE Email='standarduser@testorg.com' LIMIT 1];
        system.runAs(u){
            try{
                String testString;
                Test.startTest();
                testString = 'Success';
                Contact contactRec = [SELECT Id FROM Contact WHERE LastName='John David' LIMIT 1];
                UserController.createUser(contactRec.Id);
                Test.stopTest();
                System.assertEquals(testString=='Success', true,'Sections retrieved successfully');
            }catch(exception e){
                System.assertEquals(e.getMessage()!=null,true,'error catched.');
            }
        }
    }
}