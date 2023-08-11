/** 
* Class Name        : AWSS3Controller
* Developer         : Priyanka         
* Created Date      : 11-07-2023
* @description      : AWSS3Controller class is used for awsS3FileOperation Component to perform AWS S3 file operations.
* Last Modified Date: 11-07-2023
*/
public with sharing class AWSS3Controller {  
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;

    static AWSS3Service service = AWSS3Service.getInstance();
    
    /**
* @description get Authentication Data. 
* @return List<s3configuration__mdt>
*/ 
    @AuraEnabled
    public static List<s3configuration__mdt> getAuthenticationData() {
        List<s3configuration__mdt> s3List = new List<s3configuration__mdt>();
        try {
            s3List = s3configuration__mdt.getAll().values();
            return s3List;
        } catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
* @description get Signed Url for download file.
* @param location This is a AWS file url.
* @param file This is the keyUrl of a file. 
* @param expires This is minutes to be expired in. 
* @return Download File URL
*/ 
    @AuraEnabled
    public static String getFileSignedUrl(String location, String file, Integer expires) {
        try {
            String signedURL;
            if(location != null && file != null && expires > 0) {
                signedURL = service.getSignedURL(location, file, expires); 
            }
            return signedURL;
        } catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
* @description upload File from salesforce to S3.
* @param recId This is the record Id.
* @param objectName This is the object name of a record.
* @param pathRecId This is the recordId.
* @param deleteFlag This is the deleteFlag.
* @param userId This is th userId.
* @return flag on uploaded successfully
*/ 
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static Boolean uploadFiles(Id recId, String objectName,Id pathRecId,Boolean deleteFlag, Id userId) {
        Boolean uploadedFlag = false;
        try {
            if(recId != null && objectName != null && userId != null) {
                
                uploadedFlag=service.uploadFiles(recId, objectName, pathRecId, deleteFlag, userId);
            }
            return uploadedFlag;
        } catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
* @description uploadFilestoResponses.
* @param fileResp
* @return Id 
*/ 
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static Response__c createResponseforFileUpload(String fileResp) {
        try{
            Response__c respId;
            Map<String,Object> filemap = (Map<String,Object>) JSON.deserializeUntyped(fileResp);
            if(filemap.size() > 0) {
                respId = service.createResponseforFileUpload(fileResp); 
            }
            return  respId;
        }
        catch(Exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        }
        
    }
    /**
* @description saveActionRecord.
* @param actionResponse
* @return Id 
*/
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static Id saveActionRecord(List<SObject> actionResponse){
        try{
            Id actionRecordId;
            if(actionResponse.size() > 0){
                actionRecordId = service.saveActionRecord(actionResponse);
            }
            return actionRecordId; 
        }catch(exception e){
            String errorMsg = e.getMessage();
            throw new AuraHandledException(errorMsg);
        } 
    }
    /**
* @description Get the details of the Template.
* @param templateId This is a record id of an Template__c.
*@return
*/    
    @AuraEnabled(Cacheable=true)
    public static Boolean getTemplateDetails(String templateId) {
        try {
            Boolean hasStatusNew = true;
            templateId = String.escapeSingleQuotes(templateId);
            if(String.isNotBlank(templateId)) {
                List<Assessment_Template__c> assessmentList=  [SELECT Status__c
                                                                FROM Assessment_Template__c
                                                                WHERE Id= :templateId
                                                                WITH SECURITY_ENFORCED];
                Assessment_Template__c assessmentTemp = (AssessmentList.size()==1)?AssessmentList[0]:null;
                if(assessmentTemp  != null && assessmenttemp.Status__c.equalsIgnoreCase('New')){
                    hasStatusNew = false;
                }
            }
            return hasStatusNew;
        }
        catch(Exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }

    /**
    * @description update Files count.
    * @param responseId This is a record id of an Response.
    * @param filesCount
    */    
    @AuraEnabled
    /* sfge-disable-stack ApexFlsViolationRule */
    public static void updateRespFilesCount(String responseId, Integer filesCount) {
        try {
            if(String.isNotBlank(responseId) && filesCount > 0) {
                service.updateRespFilesCount(responseId, filesCount);
            }
        }
        catch(Exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }

    /**
* @description It is used to throw the exception
*/
    public class SecurityControllerException extends Exception{
    }
}