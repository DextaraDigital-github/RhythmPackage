/** 
* Class Name        : TemplateController
* Developer         : Sai Koushik Nimmaturi and Reethika Velpula        
* Created Date      : 
* @description       : TemplateController class contains the logic related to Template Object.
* Last Modified Date: 
*/
public with sharing class TemplateController {

    /**
    * @description clone template and its related records.
    * @param templateId This is a record id of an Template.
    * @return 
    */
    @AuraEnabled
    public static ResultWrapper doClone(string templateId,SObject templateRecord){
        try{
            TemplateService ts = new TemplateService();
            ResultWrapper resWrap = ts.cloneTemplate(templateId,templateRecord);
            return resWrap;
        }catch(exception e){
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