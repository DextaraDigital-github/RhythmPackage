/**
* Class Name         : SendEmailBatch 62867
* Developer          : Sri Kushal Reddy N           
* Created Date       : 11-07-2023
* @description       : This class is used for sending bulk mails to Users related to Primary Contact of the selected Accounts
* Last Modified Date : 
*/
public with sharing class SendEmailBatch implements Database.batchable<sObject>, Database.Stateful {
    public SecurityCheckController safe;
    public EmailWrapper email;
    List<failedEmailsWrapper> failedEmailsMapList;

    static ContentDocumentSelector selector = ContentDocumentSelector.getInstance();
    static ContentVersionSelector cvSelector = ContentVersionSelector.getInstance();
    
    /**
    * @description Initializes the data
    * @param parameterMap It is a Map of all parameters required to send mails
    */
    public SendEmailBatch(String parameterMap) {
        this.email = (EmailWrapper)JSON.deserialize(parameterMap,emailWrapper.class);
        
        /* Initializing attributes */
        this.email.success = 0;
        this.email.conUserMap = new Map<Id,User>();   // Stores ContactId and respective User record
        this.email.accUserMap = new Map<Id,User>();   // Stores AccountId and respective primary contact's User record
        this.email.userEmailMap = new Map<Id,String>();   // Stores UserId and respective Email
        this.email.userEmrMap = new Map<Id,EmailMessageRelation>();   // Stores UserId and respective EmailMessageRelation record
        this.failedEmailsMapList = new List<failedEmailsWrapper>();   // Stores list of recipient data to whom the emails weren't sent
        this.safe = new SecurityCheckController();
        
        /* If the Email should be sent using an Email Template */
        if(this.email.hasCustomContents == false && this.email.templateId != null) {
            this.email.subject = null;
            this.email.body = null;
            this.email.treatBodiesAsTemplate = false;
        }
        /* If the Email should be sent using custom subject and body rather than an Email Template */
        else {
            this.email.templateId = null;
            this.email.treatBodiesAsTemplate = true;
        }
    }
    
    /**
    * @description Fetches a List of User records related to the Primary Contact of the selected Accounts 
    * @param bc Context of the Batch class
    * @return List of User records
    */
    public Database.QueryLocator start(Database.BatchableContext bc) {       
        /* Fetching User records to whom the email should be sent */
        String userFilter = ' WHERE Email!=null AND Contact.Primary_Contact__c = true AND Contact.Email != null AND Contact.AccountId IN (\'' + String.join(email.selectedRecipients,'\',\'') + '\') ';
        String query = ' SELECT Id, Email, ContactId, Contact.AccountId, Contact.Account.Name FROM User ' + userFilter;
        return Database.getQueryLocator(query);
    }
    
    /**
    * @description Creates SingleEmailMessage for each User and emails the user with the chosen subject, body, template and file attachments
    * @param bc Context of the Batch class
    * @param usersList List of User records to whom the emails should be sent
    */
    public void execute(Database.BatchableContext bc, List<User> usersList) {
        
        /* Fetching Files(ContentVersion) for all the attachments and creating email attachments */
        List<Messaging.EmailFileAttachment> emailAttachments = new List<Messaging.EmailFileAttachment>();
        if(email.attachmentsData != null && email.attachmentsData.contentDocuments != null && email.attachmentsData.contentDocuments.size() > 0) {
            /* Fetching Content Versions to attach to the email */            
            List<String> cvFields = new List<String>{'Id', 'VersionData', 'FileExtension', 'PathOnClient'};
            String cvFilter = 'where ContentDocumentId in (\'' + String.join(email.attachmentsData.contentDocuments,'\',\'') + '\')';
            Map<String,Object> cvParameterMap = new Map<String,Object>{ 'fields'=>cvFields, 'filter'=>cvFilter };
            email.contentVersionMap = cvSelector.fetchContentVersions(cvParameterMap);   // Stores map of all the ContentVersions of all the attachments which will be attached to the email
            List<ContentVersion> cvList = new List<ContentVersion>();
            if(email.contentVersionMap != null) {
                cvList = email.contentVersionMap.values();
            }
            
            /* Creating File Attachments for the Email */
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
                emailAttachments.add(mef);
            }
        }
        /* Constructing a temporary list of SingleEmailMessage to store merge field values of email */
        List<Messaging.SingleEmailMessage> singleEmailTempList = new List<Messaging.SingleEmailMessage>();
        for(User user:usersList) {
            email.conUserMap.put((Id)user.get('ContactId'),user);
            email.accUserMap.put((Id)user.getsObject('Contact').get('AccountId'),user); 
            
            Messaging.SingleEmailMessage singleEmailTemp = new Messaging.SingleEmailMessage();
            singleEmailTemp.setTemplateId(email.templateId);
            singleEmailTemp.setSubject(email.subject);
            singleEmailTemp.setHtmlBody(email.body);
            singleEmailTemp.setWhatId(email.whatId);
            singleEmailTemp.setTreatBodiesAsTemplate(email.treatBodiesAsTemplate);
            singleEmailTemp.setTreatTargetObjectAsRecipient(true);
            singleEmailTemp.setTargetObjectId((Id)user.get('ContactId'));
            singleEmailTempList.add(singleEmailTemp);
        }
        Savepoint sp = Database.setSavepoint();
        Messaging.sendEmail(singleEmailTempList);
        Database.rollback(sp);
        
        /* Constructing a list of SingleEmailMessage to send emails */
        List<Messaging.SingleEmailMessage> singleEmailList = new List<Messaging.SingleEmailMessage>();
        for(Messaging.SingleEmailMessage singleEmailTemp:singleEmailTempList) {
            User u = email.conUserMap.get(singleEmailTemp.getTargetObjectId());   // Stores the User of the current singleEmailTemp's recipient(Contact record) for easy access
            email.userEmailMap.put(u.Id, (String)u.get('Email'));   // Stores UserId alongwith their Email to store emails in EmailMessage record 
            
            Messaging.SingleEmailMessage singleEmail = new Messaging.SingleEmailMessage();
            singleEmail.setSubject(singleEmailTemp.getSubject());
            singleEmail.setHtmlBody(singleEmailTemp.getHtmlBody());
            singleEmail.setTreatTargetObjectAsRecipient(true);
            singleEmail.setTargetObjectId(u.Id);
            singleEmail.setSaveAsActivity(false);
            if(emailAttachments != null && emailAttachments.size() > 0) {
            	singleEmail.setFileAttachments(emailAttachments);
            }
            singleEmailList.add(singleEmail);
            
            /* Creating EmailMessageRelation to link the EmailMessage to the User */
            EmailMessageRelation emr = new EmailMessageRelation();
            emr.RelationId = u.Id;   // Linking the user with the email sent to their Email using EmailMessageRelation junction object
            emr.RelationType = 'ToAddress';
            emr.RelationAddress = (String)u.get('Email');
            email.userEmrMap.put(u.Id,emr);
        }
        
        /* Evaluating the status(sent/failed) of all the emails sent */
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(singleEmailList);
        for(Messaging.SendEmailResult result:results) {
            if(result.isSuccess()) {
                email.success += 1;
            }
            else {
                email.userEmrMap.remove(result.geterrors()[0].getTargetObjectId());
                email.userEmailMap.remove(result.geterrors()[0].getTargetObjectId());
            }
        }
        
        SendEmailEvent__e event = new SendEmailEvent__e();
        event.Source__c = 'Refresh Emails';
        event.Type__c = 'RefreshEmails';
        try {
            EventBus.publish(event);
        }
        catch(Exception e) {
            throw new AuraHandledException(e.getMessage());   //Throws an exception
        }
    }
    
    /**
    * @description Deletes the additional attachments added at the time of composing email and creates a platform event to post the email status on UI
    * @param bc Context of the Batch class
    */
    public void finish(Database.BatchableContext bc) {
        
        /* Creating an EmailMessage to maintain a track ---> START */
        EmailMessage emailMsg = new EmailMessage();
        emailMsg.HtmlBody = email.body;
        emailMsg.Subject = email.subject;
        emailMsg.FromName = UserInfo.getName();
        emailMsg.FromAddress = UserInfo.getUserEmail();
        emailMsg.ValidatedFromAddress = UserInfo.getUserEmail();
        emailMsg.Incoming = false;
        emailMsg.Status = '3';
        emailMsg.RelatedToId = email.whatId;
        emailMsg.MessageDate = DateTime.now();
        emailMsg.EmailTemplateId = email.templateId;
       	
        try {
            /* Capturing Failed Emails to store on EmailMessage */
            String htmlBody = '';
            Map<String,Object> selectedRecipientsMap = (Map<String,Object>)JSON.deserializeUntyped(email.selectedRecipientsData);
            for(Id accId: email.selectedRecipients) {
                failedEmailsWrapper failedEmailsMap = new failedEmailsWrapper();   // Stores UserId and respective Email
                Map<String,Object> selectedRecipient = (Map<String,Object>)JSON.deserializeUntyped(JSON.serialize(selectedRecipientsMap.get(String.valueOf(accId))));
                if(!email.accUserMap.containsKey(accId)) {    // Storing 'No Email' against accountId which is not in accUserMap as the account might not have a primary contact, account's primary contact or the primary contact's user might not have an email
                    failedEmailsMap.Id = accId;
                    if(selectedRecipient != null){
                        failedEmailsMap.Name = (String)selectedRecipient.get('Name');
                    }
                    failedEmailsMap.Email = 'No Email';
                    failedEmailsMapList.add(failedEmailsMap);
                    htmlBody += '<li>' + failedEmailsMap.Name + ' (' + 'No Email' + ')</li>';
                }
                else if(email.userEmailMap != null && email.userEmailMap.size() > 0 && !email.userEmailMap.containsKey(email.accUserMap.get(accId).Id)) {   // Storing email and this email might not have been sent due to some other issue despite the user having email address
                    failedEmailsMap.Id = accId;
                    if(selectedRecipient != null){
                        failedEmailsMap.Name = (String)selectedRecipient.get('Name');
                    }
                    failedEmailsMap.Email = email.userEmailMap.get('Email');
                    failedEmailsMapList.add(failedEmailsMap);
                    htmlBody += '<li>' + failedEmailsMap.Name + ' (' + email.userEmailMap.get('Email') + ')</li>';
                }
            }
            
            if(failedEmailsMapList != null && failedEmailsMapList.size() > 0) {
                emailMsg.Failed_Recipients__c = JSON.serialize(failedEmailsMapList);
            }
            emailMsg.toAddress = String.join(email.userEmailMap.values(),'; ');
            email.emailMsgList = new List<EmailMessage>();
            email.emailMsgList.add(emailMsg);
            safe.doInsert(email.emailMsgList);
            /* Creating an EmailMessage to maintain a track ---> END */
            
            /* Inserting EmailMessageRelation records to create a relation between the Email Message and the users to whom it was sent */
            for(EmailMessageRelation emr: email.userEmrMap.values()) {
                emr.EmailMessageId = email.emailMsgList[0].Id;
            }
            safe.doInsert(email.userEmrMap.values());
            
            /* Storing the Email Attachments in AWS S3 */
            if(email.contentVersionMap != null && email.contentVersionMap.size() > 0) {
                AWSS3ServiceQueueable awsQu=new AWSS3ServiceQueueable();
                awsQu.recId = email.emailMsgList[0].Id;
                awsQu.objectName = 'EmailMessage';
                awsQu.pathRecId = null;
                awsQu.deleteFlag = true;
                awsQu.contVerIds = email.contentVersionMap.keySet();
                System.enqueueJob(awsQu);
            }
            
            /* Deleting the email attachments stored as files in salesforce as these files are already stored in AWS S3 */
            if(email.attachmentsData.deleteContentDocuments != null && email.attachmentsData.deleteContentDocuments.size() > 0) {
                List<String> cdFields = new List<String>{'Id'};
                String cdFilter = ' WHERE Id IN (\'' + String.join(email.attachmentsData.deleteContentDocuments,'\',\'') + '\') ';
                Map<String,Object> cdParameterMap = new Map<String,Object>{'fields'=>cdFields, 'filter'=>cdFilter};
                selector.fetchContentDocuments(cdParameterMap).values();
            }
            
            /* Sending a status report of the email to all the user who has sent the mails */
            if(email.selectedRecipients.size() - email.success > 0) {
                Messaging.SingleEmailMessage singleEmail = new Messaging.SingleEmailMessage();
                singleEmail.setSubject('Status of the email - "' + email.subject + '"');
                singleEmail.setHtmlBody('<div>Hello&nbsp;<strong>' + UserInfo.getName() + '</strong>,</div><div><p>Delivery has failed to the ' + (email.selectedRecipients.size() - email.success) + ' recipient(s) for the email with Subject, <strong>' + email.subject + '</strong>.</p></div><div><ol type="1">' + htmlBody + '</ol></div><div><p><a href="' + URL.getSalesforceBaseUrl().toExternalForm() + '/lightning/r/Rhythm__Assessment__c/' + email.whatId + '/view">Click here</a>&nbsp;to view the status of the email.</p></div>');
                singleEmail.setTargetObjectId(UserInfo.getUserId());
                singleEmail.setSaveAsActivity(false);
                Messaging.sendEmail(new Messaging.SingleEmailMessage[]{singleEmail});
            }
            
            SendEmailEvent__e event = new SendEmailEvent__e();
            event.Source__c = 'Refresh Emails';
            event.Type__c = 'RefreshEmails';
            try {
                EventBus.publish(event);
            }
            catch(Exception e) {
                throw new AuraHandledException(e.getMessage());   //Throws an exception
            }
        }
        catch(Exception e) {
            Messaging.SingleEmailMessage singleEmail = new Messaging.SingleEmailMessage();
        	singleEmail.setSubject('Status of the email - "' + email.subject + '"');
            singleEmail.setHtmlBody('<div>Hello&nbsp;<strong>' + UserInfo.getName() + '</strong>,</div><div><p>Delivery has failed to all the recipient(s) for the email with Subject, <strong>' + email.subject + '</strong>.</p></div><div>Please try resending the email or contact your System Administrator.</div>');
        	singleEmail.setTargetObjectId(UserInfo.getUserId());
            singleEmail.setSaveAsActivity(false);
            Messaging.sendEmail(new Messaging.SingleEmailMessage[]{singleEmail});
        }
    }
    
    /**
    * @description Email Wrapper Class.
    */
    public class EmailWrapper {
        public Id whatId;
        public Id templateId;
        public String body;
        public String subject;
        public Boolean hasCustomContents;
        public Boolean treatBodiesAsTemplate;
        public Integer success;
        public AttachmentsDataWrapper attachmentsData;
        public List<Id> selectedRecipients;
        String selectedRecipientsData;
        public Map<Id,ContentVersion> contentVersionMap;   // Stores map of all the ContentVersions of all the attachments which will be attached to the email
        public Map<Id,User> conUserMap;   // Stores ContactId and respective User record
        public Map<Id,User> accUserMap;   // Stores AccountId and respective primary contact's User record
        public Map<Id,String> userEmailMap;   // Stores UserId and respective Email
        public Map<Id,EmailMessageRelation> userEmrMap;   // Stores UserId and respective EmailMessageRelation record
        public List<EmailMessage> emailMsgList;   // Stores List of EmailMessages to insert
    }

    /**
    * @description Attachment Wrapper Class.
    */
    public class AttachmentsDataWrapper {
        public List<Id> contentDocuments;
        public List<Id> deleteContentDocuments;
    }

    /**
    * @description Failed Wrapper Class.
    */
    public class FailedEmailsWrapper {
        public Id id;
        public String name;
        public String email;
    }
}