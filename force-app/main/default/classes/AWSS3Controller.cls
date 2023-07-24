/** 
* Class Name        : AWSS3Controller
* Developer         : Priyanka         
* Created Date      : 11-07-2023
* @description      : AWSS3Controller class is used for awsS3FileOperation Component to perform AWS S3 file operations.
* Last Modified Date: 11-07-2023
*/
public with sharing class AWSS3Controller {  
      
    
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
                signedURL = AWSS3Service.getSignedURL(location, file, expires); 
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
* @return flag on uploaded successfully
*/ 
    @AuraEnabled
    public static Boolean uploadFiles(Id recId, String objectName) {
        Boolean uploadedFlag = false;
        try {
            if(recId != null && objectName != null) {
                 
                uploadedFlag=AWSS3Service.uploadFiles(recId, objectName);
            }
            return uploadedFlag;
        } catch(exception e) {
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