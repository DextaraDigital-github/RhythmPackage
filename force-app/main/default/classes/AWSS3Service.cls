/** 
* Class Name        : AWSS3Service
* Developer         : Priyanka         
* Created Date      : 11-07-2023
* @description      : AWSS3Service class is used as Service Class to perform AWS S3 file operations.
* Last Modified Date: 11-07-2023
*/
public with sharing class AWSS3Service extends AWS {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    
    public String fileName;
    public String folderName;
    public Blob fileBody;
    public String contentType;
    public Id recordId;
    public HttpResponse res;
    public ContentVersion versionData;
    public static HttpRequest req;
    
    /**
* @description init method used for initialize the AWS signature and upload file.
*/ 
    public override void init() {
        Map<String, String> s3Map = new Map<String, String>();
        List<s3configuration__mdt> s3List = s3configuration__mdt.getAll().values();
        if(s3List.size() > 0) {
            for(s3configuration__mdt s3:s3List) {
                s3Map.put(s3.Label,s3.Value__c);
            }
            if(s3Map.size() > 0) {
                service = s3Map.get('service'); 
                region = s3Map.get('region');        
                createSigningKey(s3Map.get('secretKey'));
                accessKey = s3Map.get('accessKey');
                endpoint = new Url(s3Map.get('endpoint'));
            }
            // this is not required but if you want to upload file to specific folder then create a folder inside S3 bucket 
            // and then put the name inside Folder
            contType = '.'+contentType;
            if(String.isBlank(folderName)) {
                resource = +this.fileName+'.'+contentType;
            }else{
                resource = this.folderName+'/'+this.fileName+'.'+contentType;
            }
            method = HttpMethod.XPUT;
            payload = this.fileBody;
            If(!Test.isRunningTest()){
                // Call this method from Abstract Class "AWS"
                req = createRequest();
                try {
                    // Send the Request and get the response
                    res = (new Http()).send(req);
                }catch(System.CalloutException ex) {
                    String errorMsg = ex.getMessage();
                    throw new AuraHandledException(ErrorMsg);
                }
            }
            else {
                HttpResponse response;
                createRequest();
                response = new HttpResponse();
                response.setHeader('Content-type', 'application/json');
                response.setBody('');
                response.setStatusCode(200);
            }
        }
    }
    
    /**
* @description get Signed Url for download file.
* @param location This is a AWS file url.
* @param file This is the keyUrl of a file. 
* @param expires This is minutes to be expired in. 
* @return Download File URL
*/
    public static String getSignedURL(String location, String file, Integer expires) {
        String accessKey;
        String secretKey;
        String bucketName;
        String bucketRegion;
        Map<String, String> s3Map = new Map<String, String>();
        try {
            list<s3configuration__mdt> s3List = s3configuration__mdt.getAll().values();
            for(s3configuration__mdt s3:s3List) {
                s3Map.put(s3.Label,s3.Value__c);
            }
            if(s3Map.size() > 0) {
                bucketName = s3Map.get('s3bucket'); 
                bucketRegion = s3Map.get('region');        
                secretKey=(s3Map.get('secretKey'));
                accessKey = s3Map.get('accessKey');
                
            }
            Datetime currentDateTime = Datetime.now();
            String dateOnly = currentDateTime.formatGmt('yyyyMMdd');
            String req =  dateOnly + '/'+ bucketRegion +'/s3/aws4_request';
            String xAmzCredentialStr = accessKey + '/' + req;
            String xAmzDate = currentDateTime.formatGmt('yyyyMMdd\'T\'HHmmss\'Z\'');
            String xAmzSignedHeaders = 'host';
            String host = bucketName + '.s3.'+ bucketRegion +'.amazonaws.com';
            
            String canonicalRequest =
                'GET\n' +
                '/' + uriEncode(file, false) + '\n' +
                uriEncode('X-Amz-Algorithm', true) + '=' + uriEncode('AWS4-HMAC-SHA256', true) + '&' +
                uriEncode('X-Amz-Credential', true) + '=' + uriEncode(xAmzCredentialStr, true) + '&' +
                uriEncode('X-Amz-Date', true) + '=' + uriEncode(xAmzDate, true) + '&' +
                uriEncode('X-Amz-Expires', true) + '=' + uriEncode(String.valueOf(expires), true) + '&' +
                uriEncode('X-Amz-SignedHeaders', true) + '=' + uriEncode(xAmzSignedHeaders, true) + '\n' +
                'host:'+host + '\n\n' +
                'host\n' +
                'UNSIGNED-PAYLOAD';
            
            String stringToSign =
                'AWS4-HMAC-SHA256\n'+
                xAmzDate + '\n' + 
                req + '\n' +
                EncodingUtil.convertToHex(
                    Crypto.generateDigest('SHA-256', Blob.valueOf(canonicalRequest))
                );
            
            
            Blob dateKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(dateOnly), Blob.valueOf('AWS4' + secretKey));
            Blob dateRegionKey = Crypto.generateMac('hmacSHA256', Blob.valueOf(bucketRegion), dateKey);
            Blob dateRegionServiceKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('s3'), dateRegionKey);
            Blob signingKey = Crypto.generateMac('hmacSHA256', Blob.valueOf('aws4_request'), dateRegionServiceKey);
            
            Blob signature = Crypto.generateMac('hmacSHA256', Blob.valueOf(stringToSign), signingKey);
            String signatureStr = EncodingUtil.convertToHex(signature);
            
            return location + '?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=' + EncodingUtil.urlEncode(xAmzCredentialStr, 'UTF-8') + '&X-Amz-Date=' + xAmzDate + '&X-Amz-Expires=' + String.valueOf(expires) +'&X-Amz-Signature=' + signatureStr + '&X-Amz-SignedHeaders=host';
        }
        catch(Exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
* @description uriEncode method used for encrypting the headers.
* @param input This is the Input String to encrypt
* @param encodeSlash This is the boolean value to encode with slash
* @return Encoded String 
*/ 
    public static String uriEncode(String input, Boolean encodeSlash) {
        String result = '';
        try {
            for (Integer i = 0; i < input.length(); i++) {
                String ch = input.substring(i, i + 1);
                if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '_' || ch == '-' || ch == '~' || ch == '.') {
                    result += ch;
                } else if (ch == '/') {
                    result += encodeSlash ? '%2F' : ch;
                } else {
                    result =  convertToHex(ch, result);        
                }
            }   
            return result;
        }
        catch(Exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
* @description convertToHex method used for converting characters into hex.
* @param ch
* @param result
* @return Hexvalue String 
*/ 
    public static String convertToHex(String ch, String result) {
        if(ch != null){ 
            String hexValue = EncodingUtil.convertToHex(Blob.valueOf(ch)).toUpperCase();    
            if (hexValue.length() == 2) {
                result += '%' + hexValue;
            } else if (hexValue.length() == 4) {
                result += '%' + hexValue.substring(0, 2) + '%' + hexValue.substring(2);
            }     
        }
        return result; 
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
        List<Id> contDocIds = new List<Id>();
        List<String> errorList = new List<String>();
        List<ContentVersion> versionData;
        String filesize;
        try {
            if(recId != null && objectName != null) {
                List<ContentDocumentLink> condocList= [SELECT ContentDocumentId,LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =:recId WITH SECURITY_ENFORCED];
                if(condocList.size() > 0) {
                    for(ContentDocumentLink condoc:condocList) {
                        contDocIds.add(condoc.ContentDocumentId);
                    }
                    versionData= [SELECT Id, Title, ContentSize, FileExtension, ContentDocumentId, VersionData FROM ContentVersion WHERE ContentDocumentId IN:contDocIds WITH SECURITY_ENFORCED];
                }
                for(ContentVersion conver:versionData) {
                    filesize = fileSizeToString(conver.ContentSize);
                    if(filesize.contains('MB')) {
                        if(Double.valueOf(filesize.remove(' MB')) > 10) {
                            uploadedFlag = false;
                            break;
                        } else {
                            uploadedFlag = true;
                        }
                        
                    } else if(filesize.contains('GB')) {
                        uploadedFlag = false;
                        break;
                    }
                    else {
                        uploadedFlag = true;
                    }
                }
                
                if(uploadedFlag == true) {
                    AWSS3ServiceQueueable awsQu=new AWSS3ServiceQueueable();
                    awsQu.recId = recId;
                    awsQu.objectName = objectName;
                   // awsQu.versionData = versionData;
                    System.enqueueJob(awsQu);  
                } else {
                    List<ContentDocument> conList= [SELECT Id FROM ContentDocument where ContentAssetId = null WITH SECURITY_ENFORCED];
                    List<Database.DeleteResult> deleteResult = safe.doDelete(conList);
                    errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult); 
                }
                if(errorList.size()>0) {
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
                
            }
            return uploadedFlag;
        }catch(exception e) {
            String errorMsg = e.getMessage();
            throw new AuraHandledException(ErrorMsg);
        }
    }
    
    /**
* @description fileSizeToString to convert bytes into actual size.
* @param value
* @return size
*/ 
    public static String fileSizeToString(Long value) {
        /* string representation if a file's size, such as 2 KB, 4.1 MB, etc */
        if (value < 1024) {
            return string.valueOf(value) + ' Bytes';
        }
        else if (value >= 1024 && value < (1024*1024)) {
            //KB
            Decimal kb = Decimal.valueOf(value);
            kb = kb.divide(1024,2);
            return string.valueOf(kb) + ' KB';
        }
        else if (value >= (1024*1024) && value < (1024*1024*1024)) {
            //MB
            Decimal mb = Decimal.valueOf(value);
            mb = mb.divide((1024*1024),2);
            return string.valueOf(mb) + ' MB';
        }
        else {
            //GB
            Decimal gb = Decimal.valueOf(value);
            gb = gb.divide((1024*1024*1024),2);
            return string.valueOf(gb) + ' GB';
        }    
    }
    
    /**
* @description It is used to throw the exception
*/
    public class SecurityControllerException extends Exception{
    }
}