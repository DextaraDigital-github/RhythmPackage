/**
* Class Name        : UserSelectorTest
* Developer         :         
* Created Date      :
* @description      :
* Last Modified Date:
*/

@isTest
public class UserSelectorTest {

 
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
            System.runAs(u){
                
                Map<String, Object> parameterMap = new Map<String, Object>();
                parameterMap.put('fields', new List<String>{'Id', 'Name'});
                parameterMap.put('filter', 'WHERE IsActive = true');
                parameterMap.put('childQuery', new List<String>{'SELECT Id, Name FROM UserRole'});
                
                List<User> testUsers=[select id from User];
                
                
                Test.startTest();
                Map<Id, User> result = UserSelector.fetchUsers(parameterMap);
                Test.stopTest();
                
                System.assertEquals(testUsers.size(), result.size());
                for (User usr : testUsers) {
                    System.assertEquals(usr, result.get(usr.Id));
                }
            }
        }
        catch(Exception e) {
            
        }
    }
}