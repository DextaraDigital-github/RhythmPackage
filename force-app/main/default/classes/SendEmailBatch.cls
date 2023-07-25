/**
* Class Name         : SendEmailBatch
* Developer          : Sri Kushal Reddy N           
* Created Date       : 11-07-2023
* @description       : This class is used for sending bulk mails to Users related to Primary Contact of the selected Accounts
* Last Modified Date : 
*/
public with sharing class SendEmailBatch implements Database.batchable<sObject>, Database.Stateful {
    public static SecurityCheckController safe = new SecurityCheckController();   //Implementing singleton pattern
    public static List<ErrorTransactionLog__c> errorList;   //Stores list of ErrorTransactionLog__c records to store errors
    public static ErrorTransactionLog__c errorRec;   //Used for creating an instance for ErrorTransactionLog__c to log/store an error
    
    public Map<String,Object> parameterMap;
    String subject;
    String body;
    public Integer success;
    public Integer error;
    
    /**
    * @description Initializes the data
    * @param parameterMap It is a Map of all parameters required to send mails
    */
    public SendEmailBatch(Map<String,Object> parameterMap) {
        this.parameterMap = parameterMap;
        subject = (String)parameterMap.get('subject');
        body = (String)parameterMap.get('body');
        if((Boolean)parameterMap.get('hasCustomContents')==false && parameterMap.get('templateId')!=null) {
            parameterMap.remove('subject');
            parameterMap.remove('body');
            parameterMap.put('setTreatBodiesAsTemplate',false);
        }
        else {
            parameterMap.remove('templateId');
            parameterMap.put('setTreatBodiesAsTemplate',true);
        }
        success = error = 0;
    }
    
    /**
    * @description Fetches a List of User records related to the Primary Contact of the selected Accounts 
    * @param bc Context of the Batch class
    * @return List of User records
    */
    public Database.QueryLocator start(Database.BatchableContext bc) {
        List<String> accList=(List<String>) JSON.deserialize(JSON.serialize(parameterMap.get('selectedAccounts')), List<String>.class);
        String userFilter = 'where Email!=null and Contact.Email!=null and Contact.AccountId in (\''+String.join(accList,'\',\'')+'\')';
        String query = 'Select Id, Email, ContactId, Contact.AccountId from User '+userFilter;
        return Database.getQueryLocator(query);
    }
    
    /**
    * @description Creates SingleEmailMessage for each User and emails the user with the chosen subject, body, template and file attachments
    * @param bc Context of the Batch class
    * @param usersList List of User records to whom the emails should be sent
    */
    public void execute(Database.BatchableContext bc, List<User> usersList) {
        Map<String,Object> attachmentsData = (Map<String,Object>)parameterMap.get('attachmentsData');
        List<String> contentDocuments = (List<String>)json.deserialize(json.serialize(attachmentsData.get('contentDocuments')),List<String>.class);
        List<String> cvFields = new List<String>{'Id', 'VersionData', 'FileExtension', 'PathOnClient'};
        String cvFilter = 'where ContentDocumentId in (\''+String.join(contentDocuments,'\',\'')+'\')';
        Map<String,Object> cvParameterMap = new Map<String,Object>{'fields'=>cvFields, 'filter'=>cvFilter};
            
        // Creating File Attachments for the Email
        List<ContentVersion> cvList = ContentVersionSelector.fetchContentVersions(cvParameterMap).values();
        List<Messaging.EmailFileAttachment> attachments = new List<Messaging.EmailFileAttachment>();
        for(ContentVersion cv:cvList) {
            Messaging.EmailFileAttachment mef = new Messaging.EmailFileAttachment();
            mef.setFileName(cv.PathOnClient);
            mef.setBody(cv.VersionData);
            switch on cv.FileExtension {
                when 'png', 'jpeg' {
                    mef.setContentType('image/'+cv.FileExtension);
                }
                when 'csv' {
                    mef.setContentType('text/csv');
                }
                when 'pdf' {
                    mef.setContentType('application/pdf');
                }
            }
            attachments.add(mef);
        }
        
        //Constructing a temporary list of SingleEmailMessage to store merge field values of email
        Map<Id,User> conUserMap = new Map<Id,User>();
        List<Messaging.SingleEmailMessage> emailListTemp = new List<Messaging.SingleEmailMessage>();
        for(User user:usersList) {
            conUserMap.put((Id)user.get('ContactId'),user);
            
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setTemplateId((Id)parameterMap.get('templateId'));
            email.setSubject((String)parameterMap.get('subject'));
            email.setHtmlBody((String)parameterMap.get('body'));
            email.setWhatId((Id)parameterMap.get('assessmentId'));
            email.setTreatBodiesAsTemplate((Boolean)parameterMap.get('setTreatBodiesAsTemplate'));
            email.setTreatTargetObjectAsRecipient(true);
            email.setTargetObjectId((Id)user.get('ContactId'));
            emailListTemp.add(email);
        }
        Savepoint sp = Database.setSavepoint();
        Messaging.sendEmail(emailListTemp);
        Database.rollback(sp);
        
        //Constructing a list of SingleEmailMessage to send emails
        Map<Id,String> toAddressMap = new Map<Id,String>();
        Map<Id,EmailMessageRelation> emrMap = new Map<Id,EmailMessageRelation>();
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
        for(Messaging.SingleEmailMessage emailTemp:emailListTemp) {
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setSubject(emailTemp.getSubject());
            email.setHtmlBody(emailTemp.getHtmlBody());
            email.setTreatTargetObjectAsRecipient(true);
            email.setTargetObjectId(conUserMap.get(emailTemp.getTargetObjectId()).Id);
            email.setSaveAsActivity(false);
            email.setFileAttachments(attachments);
            emailList.add(email);
            
            toAddressMap.put(conUserMap.get(emailTemp.getTargetObjectId()).Id, (String)conUserMap.get(emailTemp.getTargetObjectId()).get('Email'));
            
            EmailMessageRelation emr = new EmailMessageRelation();
            emr.RelationId = conUserMap.get(emailTemp.getTargetObjectId()).Id;
            emr.RelationType = 'ToAddress';
            emr.RelationAddress = (String)conUserMap.get(emailTemp.getTargetObjectId()).get('Email');
            emrMap.put(conUserMap.get(emailTemp.getTargetObjectId()).Id, emr);
        }
        
        // Creating an EmailMessage for tracking on Activity History
        EmailMessage em = new EmailMessage();
        em.HtmlBody = body;
        em.Subject = subject;
        em.FromName = UserInfo.getName();
        em.FromAddress = UserInfo.getUserEmail();
        em.ValidatedFromAddress = UserInfo.getUserEmail();
        em.Incoming = false;
        em.Status = '3';
        em.RelatedToId = (Id)parameterMap.get('assessmentId');
        em.MessageDate = DateTime.now();
        em.EmailTemplateId = (Id)parameterMap.get('templateId');
        
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(emailList);
        for(Messaging.SendEmailResult result:results) {
            if(result.isSuccess()) {
                success+=1;
            }
            else {
                emrMap.remove(result.geterrors()[0].getTargetObjectId());
                toAddressMap.remove(result.geterrors()[0].getTargetObjectId());
                error+=1;
            }
        }
        
        em.toAddress = String.join(toAddressMap.values(),'; ');
        List<EmailMessage> emList = new List<EmailMessage>();
        emList.add(em);
        safe.doInsert(emList);
        for(EmailMessageRelation emr: emrMap.values()) {
            emr.EmailMessageId = em.Id;
        }
        safe.doInsert(emrMap.values());
    }
    
    /**
    * @description Deletes the additional attachments added at the time of composing email and creates a platform event to post the email status on UI
    * @param bc Context of the Batch class
    */
    public void finish(Database.BatchableContext bc) {
        Map<String,Object> attachmentsData = (Map<String,Object>)parameterMap.get('attachmentsData');
        List<String> deleteContentDocuments = (List<String>)json.deserialize(json.serialize(attachmentsData.get('deleteContentDocuments')),List<String>.class);
        if(deleteContentDocuments!=null && deleteContentDocuments.size()>0) {
            List<String> cdFields = new List<String>{'Id'};
            String cdFilter = 'where Id in (\''+String.join(deleteContentDocuments,'\',\'')+'\')';
            Map<String,Object> cdParameterMap = new Map<String,Object>{'fields'=>cdFields, 'filter'=>cdFilter};
            List<ContentDocument> cdList = ContentDocumentSelector.fetchContentDocuments(cdParameterMap).values();
            safe.doDelete(cdList);
        }
        
        SendEmailEvent__e event = new SendEmailEvent__e();
        event.Source__c = 'SendEmailBatch status';
        event.Type__c = 'Information';
        event.Data__c = '{"success":'+success+',"error":'+error+'}';
        try {
            EventBus.publish(event);
        }
        catch(Exception e) {
            errorList = new List<ErrorTransactionLog__c>();
            errorRec = new ErrorTransactionLog__c();
            errorRec.Class_Name__c = 'SendEmailBatch';
            errorRec.Error_Stack_Trace__c = e.getStackTraceString();
            errorRec.Name = 'Error while publishing SendEmailEvent record';
            errorRec.LWC_Component_Name__c = '';
            errorRec.Method_Name__c = 'finish';
            errorList.add(errorRec);
            safe.doInsert(errorList);
            throw new AuraHandledException(e.getMessage());   //Throws an exception
        }
    }
}