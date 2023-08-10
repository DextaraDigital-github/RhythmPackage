/** 
* Class Name        : UserService
* Developer         : Prudhvi 
* Created Date      : 
* @description       : UserService contains the processing logic related to User Object.
* Last Modified Date: 
*/

public with sharing class UserService {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp; // To rollback
    private static UserService service = null; //private static instance of the class
    
    /**
    * @description Singleton Design Pattern
     * @return
    */
    public static UserService getInstance(){
           if(service == null){
            service = new UserService();
            }
        return service;
    }

    /**
    * @description To create the user for a contact
    * @param contactId This is a contact id.
    * @return
    */
    public UserController.ResultWrapper createUser(string contactId){
        UserController.ResultWrapper resWrap = new UserController.ResultWrapper();
        try{
            List<User> userList = new List<User>();
            string userId = '';
            Id standardPlatformProfileId =  [SELECT Id 
                                            FROM Profile 
                                            WHERE Name = 'Standard Platform User'
                                            WITH SECURITY_ENFORCED 
                                            LIMIT 1].Id;
            Contact contactRecord = [SELECT Id,AccountId,FirstName,LastName,Email
                                    FROM Contact 
                                    WHERE Id=:contactId
                                    WITH SECURITY_ENFORCED
                                    LIMIT 1];
            string fName = '';
            string aliasName = '';
            if(String.isNotBlank(contactRecord.FirstName)){
                fName = contactRecord.FirstName.substring(0,1);
            }
            if(String.isNotBlank(fName)){
                aliasName = fName+contactRecord.LastName.substring(0,3);
            }else{
                aliasName = fName+contactRecord.LastName.substring(0,4);
            }
            User userRecord = new User();
            userRecord.Username = contactRecord.Email;
            userRecord.FirstName = fName;
            userRecord.LastName = contactRecord.LastName;
            userRecord.Alias = aliasName;
            userRecord.Email = contactRecord.Email;
            userRecord.TimeZoneSidKey = 'America/New_York';
            userRecord.LocaleSidKey = 'en_US';
            userRecord.EmailEncodingKey = 'ISO-8859-1';
            userRecord.ProfileId = standardPlatformProfileId;
            userRecord.LanguageLocaleKey = 'en_US';
            userList.add(userRecord);
            if (sp == null){
                sp = Database.setSavepoint();
            }
            if(userList.isEmpty() == false){
                Database.SaveResult[] saveResult = safe.doInsert(userList);
                List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                if(errorsList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join(errorsList, ', ' ));
                }else{
                    userId = userList[0].Id;
                }
            }
            if(string.isNotBlank(userId)){
                set<Id> usersId = new set<Id>{userId};
                assignPermissionSetToUsers(usersId);
                List<AccountTeamMember> teamsList = new List<AccountTeamMember>();
                AccountTeamMember teamMem =new AccountTeamMember();
                teamMem.AccountId = contactRecord.accountId;
                teamMem.UserId = userId;
                teamsList.add(teamMem);
                if (sp == null){
                    sp = Database.setSavepoint();
                }
                if(teamsList.isEmpty() == false){
                    Database.SaveResult[] saveResult = safe.doInsert(teamsList);
                    List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(saveResult);
                    if(errorsList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join(errorsList, ', ' ));
                    }
                }
            }
            resWrap.isSuccess = true;
            resWrap.recordId = '';
            resWrap.message = '';
            resWrap.errorCode = '';
        }catch(Exception e){
            resWrap.isSuccess = false;
            resWrap.recordId = '';
            resWrap.errorCode = '';
            resWrap.message = e.getMessage();
        }
        return resWrap;
    }

    /**
    * @description AssignPermissionSetToUsers method is used to assign permission sets.
    * @param usersId set of userids.
    */
    @future
    public static void assignPermissionSetToUsers (Set<Id> usersId) {
        List<PermissionSetAssignment> permissionSetList = new List<PermissionSetAssignment>();
        List<PermissionSet> permissionstobeassigned = [SELECT Id, Label FROM PermissionSet WHERE Name IN ('Customer_Access','Additional_Access') WITH SECURITY_ENFORCED];
        for (User u : [Select Id, Name FROM User Where Id IN : usersId WITH SECURITY_ENFORCED]){
            for(PermissionSet ps : permissionstobeassigned){
                PermissionSetAssignment psa = new PermissionSetAssignment ();
                    psa.PermissionSetId = ps.Id; 
                    psa.AssigneeId = u.Id;
                permissionSetList.add(psa);
            }
        }

        Savepoint sp = Database.setSavepoint();
        Database.UpsertResult[] srList1 = safe.doUpsert(permissionSetList);
        List<String> errorList = SecurityCheckController.safeClassExceptionHandlerUpsert(srList1);
        if(errorList.size()>0){
            Database.rollback(sp);
            throw new SecurityControllerException(String.join( errorList, ', ' ));
        }
    }

    /**
    * @description It is used to throw the exception
    */
    public class SecurityControllerException extends Exception{
    }
}