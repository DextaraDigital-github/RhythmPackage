/** 
* Class Name        : AWSS3ServiceQueueable
* Developer         : Priyanka         
* Created Date      : 11-07-2023
* @description      : AWSS3ServiceQueueable class is used to upload Files to AWS S3.
* Last Modified Date: 11-07-2023
*/
public class AWSS3ServiceQueueable implements Queueable, Database.AllowsCallouts {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;
    public Id recId;
    public Id pathRecId;
    public Boolean deleteFlag;
    public String objectName;
    
    
    /**
* @description execute method used for Execute Queueable Context.
* @param context This is the Input QueueableContext
*/ 
    public void execute(QueueableContext context) {
        try{
            List<String> errorList = new List<String>();
            List<Id> contDocIds = new List<Id>();
            Set<Id> contentDocumentIds = new Set<Id>();
            if( recId != null && objectName != null) {
                List<ContentDocumentLink> condocList= [SELECT ContentDocumentId,LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =:recId];
                if(condocList.size() > 0) {
                    for(ContentDocumentLink condoc:condocList) {
                        contDocIds.add(condoc.ContentDocumentId);
                    }
                    List<ContentVersion> versionData= [SELECT Id, Title, FileExtension, ContentDocumentId, VersionData FROM ContentVersion WHERE ContentDocumentId IN:contDocIds];
                    for(ContentVersion conver:versionData) {
                        contentDocumentIds.add(conver.ContentDocumentId);
                        AWSS3Service putAttachment = new AWSS3Service();
                        putAttachment.recordId = recId;
                        if(pathRecId == null) {
                        putAttachment.folderName='/'+objectName+'/'+recId;
                        }
                        else {
                          putAttachment.folderName='/'+objectName+'/'+pathRecId;  
                        }
                        putAttachment.versionData=conver;
                        String name = conver.Title.substringBeforeLast('.');
                        name = name.replaceAll(' ','');
                        Name = name.replaceAll('[^a-zA-Z0-9 -]', '');
                        name = name.replaceAll('-','');
                        Datetime datetimeVal = Datetime.now(); // Returns the current Datetime based on a GMT calendar.
                        String timeStamp = datetimeVal.format('yyyyMMdd\'T\'HHmmss');
                        putAttachment.fileName =timeStamp+'_'+name;
                        putAttachment.fileBody = conver.VersionData;
                        putAttachment.ContentType = conver.FileExtension;
                        putAttachment.init();
                    }
                    if(deleteFlag == true) {
                    List<ContentDocument> conList= [SELECT Id FROM ContentDocument where ContentAssetId = null And Id IN: contentDocumentIds];
                    List<Database.DeleteResult> deleteResult = safe.doDelete(conList);
                    errorList = SecurityCheckController.safeClassExceptionHandlerDelete(deleteResult);
                    }
                }
                if(errorList.size()>0){
                    Database.rollback(sp);
                    throw new SecurityControllerException(String.join( errorList, ', ' ));
                }
            }
        }
        catch(Exception e)
        {
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