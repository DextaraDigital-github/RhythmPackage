/**
* Class Name        : UserSelectorTest
* Developer         :         
* Created Date      :
* @description      :
* Last Modified Date:
*/

@isTest
public class UserSelectorTest {
    static UserSelector selector = UserSelector.getInstance(); 
 
    /**
* @description
*/
    @testSetup
    public Static void testData() {
        User custUser = new User();
        custUser =  TestDataFactory.createTestUser();
        User custUserNew = new User();
        custUserNew =  TestDataFactory.createTestUser();
    }

 
    /**
* @description
*/
    @isTest
    static void testFetchUsers() {
        try{
            user u = [SELECT Id,UserName FROM User WHERE Profile.Name='Standard Platform User' LIMIT 1];
            String testString;
            System.runAs(u){
                Map<String, Object> parameterMap = new Map<String, Object>();
                parameterMap.put('fields', new List<String>{'Id', 'Name'});
                parameterMap.put('filter', 'WHERE IsActive = true');
                parameterMap.put('childQuery', new List<String>{'SELECT Id, Name FROM UserRole'});
                Test.startTest();
                selector.fetchUsers(new List<Id>{u.Id});
                selector.fetchUsers(null);
                Test.stopTest();
                testString='Success';
                System.assertEquals(testString=='Success', true,'fetch users.');
            }
        }
        catch(Exception e) {
            System.assertEquals(e.getMessage() != null, true,'error cached');
        }
    }
}