/** 
* Class Name        : UserController
* Developer         : Prudhvi 
* Created Date      : 
* @description       : UserController contains the processing logic related to User Object.
* Last Modified Date: 
*/

public with sharing class UserController {
    static UserService service = UserService.getInstance();

    /**
    * @description To create the user for a contact
    * @param contactId This is a contact id.
    * @return
    */
    @AuraEnabled
    public static ResultWrapper createUser(string contactId){
        try {
            ResultWrapper resWrap = service.createUser(contactId);
            return resWrap;
        }catch (Exception e) {
            string errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }

    /**
    * @description It is used to store the response from server
    */
    public class ResultWrapper{
        /**
        * @description It is a variable isSuccess
        */
        @AuraEnabled public boolean isSuccess;
        /**
        * @description It is a variable message
        */
        @AuraEnabled public string message;
        /**
        * @description It is a variable errorCode
        */
        @AuraEnabled public string errorCode;
        /**
        * @description It is a variable recordId
        */
        @AuraEnabled public string recordId;
    }
}