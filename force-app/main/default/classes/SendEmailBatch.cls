/**
* Class Name         : SendEmailBatch 62867
* Developer          : Sri Kushal Reddy N           
* Created Date       : 11-07-2023
* @description       : This class is used for sending bulk mails to Users related to Primary Contact of the selected Accounts
* Last Modified Date : 
*/
public with sharing class SendEmailBatch implements Database.batchable<sObject>, Database.Stateful {
    public static SecurityCheckController safe = null;   //Implementing singleton pattern
    public emailWrapper ew = null;
    
    /**
    * @description Initializes the data
    * @param parameterMap It is a Map of all parameters required to send mails
    */
    public SendEmailBatch(Map<String,Object> parameterMap) {
        ew = new emailWrapper();
        ew.parameterMap = parameterMap;
        ew.subject = (String)ew.parameterMap.get('subject');
        ew.body = (String)ew.parameterMap.get('body');
        ew.success = ew.error = 0;
        
        //If the Email should be sent using an Email Template
        if((Boolean)ew.parameterMap.get('hasCustomContents') == false && ew.parameterMap.get('templateId') != null) {
            ew.parameterMap.remove('subject');
            ew.parameterMap.remove('body');
            ew.parameterMap.put('setTreatBodiesAsTemplate',false);
        }
        //If the Email should be sent using custom subject and body rather than an Email Template
        else {
            ew.parameterMap.remove('templateId');
            ew.parameterMap.put('setTreatBodiesAsTemplate',true);
        }
    }
    
    /**
    * @description Fetches a List of User records related to the Primary Contact of the selected Accounts 
    * @param bc Context of the Batch class
    * @return List of User records
    */
    public Database.QueryLocator start(Database.BatchableContext bc) {
        List<String> accList=(List<String>) JSON.deserialize(JSON.serialize(ew.parameterMap.get('selectedAccounts')), List<String>.class);
        String userFilter = ' WHERE Email!=null AND Contact.Email!=null AND Contact.AccountId in (\'' + String.join(accList,'\',\'') + '\') ';
        String query = ' SELECT Id, Email, ContactId, Contact.AccountId FROM User ' + userFilter;
        return Database.getQueryLocator(query);
    }
    
    /**
    * @description Creates SingleEmailMessage for each User and emails the user with the chosen subject, body, template and file attachments
    * @param bc Context of the Batch class
    * @param usersList List of User records to whom the emails should be sent
    */
    public void execute(Database.BatchableContext bc, List<User> usersList) {
        Map<String,Object> attachmentsData = (Map<String,Object>)ew.parameterMap.get('attachmentsData');
        List<String> contentDocuments = (List<String>)json.deserialize(json.serialize(attachmentsData.get('contentDocuments')),List<String>.class); //Fetching content documents from attachmentsData key in parameterMap JSON
        
        // Fetchinf Files(ContentVersion) related to the EmailTemplate
        List<String> cvFields = new List<String>{'Id', 'VersionData', 'FileExtension', 'PathOnClient'};
        String cvFilter = 'where ContentDocumentId in (\''+String.join(contentDocuments,'\',\'')+'\')';
        Map<String,Object> cvParameterMap = new Map<String,Object>{'fields'=>cvFields, 'filter'=>cvFilter};
        Map<Id,ContentVersion> cvMap = ContentVersionSelector.fetchContentVersions(cvParameterMap);
        List<ContentVersion> cvList = new List<ContentVersion>();
        if(cvMap != null) {
            cvList = cvMap.values();
        }
        
        // Creating File Attachments for the Email
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
            email.setTemplateId((Id)ew.parameterMap.get('templateId'));
            email.setSubject((String)ew.parameterMap.get('subject'));
            email.setHtmlBody((String)ew.parameterMap.get('body'));
            email.setWhatId((Id)ew.parameterMap.get('assessmentId'));
            email.setTreatBodiesAsTemplate((Boolean)ew.parameterMap.get('setTreatBodiesAsTemplate'));
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
        em.HtmlBody = ew.body;
        em.Subject = ew.subject;
        em.FromName = UserInfo.getName();
        em.FromAddress = UserInfo.getUserEmail();
        em.ValidatedFromAddress = UserInfo.getUserEmail();
        em.Incoming = false;
        em.Status = '3';
        em.RelatedToId = (Id)ew.parameterMap.get('assessmentId');
        em.MessageDate = DateTime.now();
        em.EmailTemplateId = (Id)ew.parameterMap.get('templateId');
        
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(emailList);
        for(Messaging.SendEmailResult result:results) {
            if(result.isSuccess()) {
                ew.success+=1;
            }
            else {
                emrMap.remove(result.geterrors()[0].getTargetObjectId());
                toAddressMap.remove(result.geterrors()[0].getTargetObjectId());
                ew.error+=1;
            }
        }
        
        em.toAddress = String.join(toAddressMap.values(),'; ');
        List<EmailMessage> emList = new List<EmailMessage>();
        emList.add(em);
        safe = new SecurityCheckController();
        safe.doInsert(emList);
        safe = null;
        for(EmailMessageRelation emr: emrMap.values()) {
            emr.EmailMessageId = emList[0].Id;
        }
        safe = new SecurityCheckController();
        safe.doInsert(emrMap.values());
        safe = null;
    }
    
    /**
    * @description Deletes the additional attachments added at the time of composing email and creates a platform event to post the email status on UI
    * @param bc Context of the Batch class
    */
    public void finish(Database.BatchableContext bc) {
        Map<String,Object> attachmentsData = (Map<String,Object>)ew.parameterMap.get('attachmentsData');
        List<String> deleteContentDocuments = (List<String>)json.deserialize(json.serialize(attachmentsData.get('deleteContentDocuments')),List<String>.class);
        if(deleteContentDocuments!=null && deleteContentDocuments.size()>0) {
            List<String> cdFields = new List<String>{'Id'};
            String cdFilter = 'where Id in (\''+String.join(deleteContentDocuments,'\',\'')+'\')';
            Map<String,Object> cdParameterMap = new Map<String,Object>{'fields'=>cdFields, 'filter'=>cdFilter};
            List<ContentDocument> cdList = ContentDocumentSelector.fetchContentDocuments(cdParameterMap).values();
            safe = new SecurityCheckController();
            safe.doDelete(cdList);
            safe = null;
        }
        
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setSubject('Status of the email - "'+ew.subject+'"');
        if(ew.success > 0) {
        	email.setHtmlBody('<p>Hello<br/>Email with subject, <strong>\''+ew.subject+'\'</strong> has been sent to '+ew.success+' Supplier(s). Check the status of the email <a href="'+URL.getSalesforceBaseUrl().toExternalForm()+'/lightning/r/Rhythm__Assessment__c/'+(String)ew.parameterMap.get('assessmentId')+'/view">here</a>.</p>');
        }
        else {
        	email.setHtmlBody('Email with subject, <strong>\''+ew.subject+'\'</strong> couldn\'t be sent. Please contact the administrator.');
        }
        email.setTargetObjectId(UserInfo.getUserId());
        email.setSaveAsActivity(false);
        List<Messaging.SendEmailResult> results = Messaging.sendEmail(new Messaging.SingleEmailMessage[]{email});
    }
    
    public class emailWrapper {
        public Map<String,Object> parameterMap;
    	public String subject;
    	public String body;
    	public Integer success;
   		public Integer error;
    }
}