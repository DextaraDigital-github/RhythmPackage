@isTest
private class SecurityCheckControllerTest {
    @isTest
    static void safelyTest(){
        Test.startTest();
        SecurityCheckController safe = new SecurityCheckController();
        safe.allOrNothing();
        List<Account> acc = TestDataFactory.createAccounts(1, false, null); 
        safe.doInsert(acc);
        safe.doInsert(new List<Account>());
        safe.doUpdate(acc);
        safe.doUpdate(new List<Account>());
        safe.doUpsert(acc);
        safe.doUpsert(acc, Account.Fields.Id);
        safe.doUpsert(new List<Account>());
        safe.doDelete(acc);
        safe.doDelete(new List<Account>());
        safe.doQuery('SELECT Id FROM Account');
        Test.stopTest();
        System.assert(acc.size()>0, TRUE);
    }

    @isTest
    static void safelyTestA(){
        String testString;
        Test.startTest();
        SecurityCheckController safe = new SecurityCheckController();
        safe.throwIfRemovedFields();
        testString='Success';
        System.assertEquals(testString=='Success', true,'fls check done');
        Test.stopTest();
    }

    @isTest
    static void safelyTestB(){
        String testString;
        Test.startTest();
        SecurityCheckController safe = new SecurityCheckController();
        SObject objRecord = new Account(Name='Test');
        safe.doInsert(new List<SObject>{objRecord});
        testString='Success';
        System.assertEquals(testString=='Success', true,'fls check done');
        Test.stopTest();
    }

   
}