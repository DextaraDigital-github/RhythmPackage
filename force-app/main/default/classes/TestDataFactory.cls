/* Class Name   : AssessmentController
* Developer         :  Sai Koushik Nimmaturi and Reethika Velpula      
* Created Date      :
* Description       : TestDataFactory class is used to create test data.
* Last Modified Date:
*/


public class TestDataFactory{
    /**
    * createRecords methods is used to create the records for all objects.
    * @param records This is a list of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */
    public static List<SObject> createRecords(List<SObject> records, Boolean doInsert, Map<String, Object> attributes){
        try{
            Integer i = 0;
            if(attributes != null){
                for (Integer j =0; j < records.size(); j ++) {
                    SObject record = records[j];
                    system.debug('attributes------->'+attributes);
                    for (String key : attributes.keySet()) {
                        Object value = attributes.get(key);
                        if (value instanceof List<Object>) {
                            Object obj = ((List<Object>) value).get(i);
                            if( obj instanceof SObject ){
                                Id sObjectId = ((SObject) obj).Id;
                                record.put( key,sObjectId );
                            }
                            else {
                                record.put(key,obj);
                            }
                        } else {
                            record.put(key, value);
                        }
                    }
                    i++;
                }
            }
            if (doInsert) {
                insert records;
                system.debug('records=====>'+records);
            }
        } catch(Exception e){
            system.debug('Exception while creating record: '+e.getMessage()+e.getLineNumber());
        }
        return records;
    }

    /**
    * createAccounts method is used to create account records.
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */

    public static List<Account> createAccounts(Integer numToInsert, Boolean doInsert, Map<String, Object> attributes){
        List<Account> accountsToInsert = new List<Account>();
        for(Integer i=0; i< numToInsert; i++){
            Account acc = new Account();
            accountsToInsert.add(acc);
        }
        return createRecords(accountsToInsert, doInsert, attributes);
    }
    /**
    * createContacts method is used to create Contacts records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */  
     
    public static List<Contact> createContacts(Integer numToInsert, Boolean doInsert, Map<String, Object> attributes){
    List<contact> contactsToInsert = new List<Contact>();
        for(Integer i=0; i< numToInsert; i++){
            Contact ct=new Contact();
            contactsToInsert.add(ct);
        }
        return createRecords(contactsToInsert, doInsert, attributes);
    }

    public static List<User> createUser(Integer numToInsert, Boolean doInsert, Map<String, Object> attributes){
        List<user> usersToInsert = new List<user>();
        for(Integer i=0; i< numToInsert; i++){
            user u=new user();
            usersToInsert.add(u);
        }
        return createRecords(usersToInsert, doInsert, attributes);
    }
    /**
    * createAssessmentTemp method is used to create AssessmentTemplate records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */  

    public static List<Assessment_Template__c> createAssessmentTemp(Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
        List<Assessment_Template__c> atemp = new List<Assessment_Template__c>();
        for(Integer i=0; i< numToInsert; i++){
        Assessment_Template__c at = new Assessment_Template__c();
        atemp.add(at);
        }
       return createRecords(atemp, true, attributes);
    }
/**
* createSection method is used to create Section records.
* @param numToInsert This is a number of records to insert.  
* @param doInsert This is boolean value whether to insert record or not.
* @param attributes This is a map which contain record data to insert.
*/
   
    public static List<Section__c> createSection(Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
        List<Section__c> secLst = new List<Section__c>();
        for(Integer i=0; i< numToInsert; i++){
        Section__c sec = new Section__c();
        secLst.add(sec);
        }
        return createRecords(secLst,true,attributes);
    }

    /**
    * createQuestion method is used to create Question records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */

    public static List<Question__c> createQuestion(Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
        List<Question__c> qlist = new List<Question__c>();
        for(Integer i=0; i< numToInsert; i++){
        Question__c q = new Question__c();
        qlist.add(q);
        }
        return createRecords(qlist,true,attributes);
    }
 
    /**
    * createAssessment method is used to create Assessment records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */  
    
    public static List<Assessment__c> createAssessment (Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
    List<Assessment__c> AssesmentList=new List<Assessment__c> ();
        for(Integer i=0; i< numToInsert; i++){
            Assessment__c at=new Assessment__c();
            AssesmentList.add(at);
        }
        return createRecords(AssesmentList,true,attributes);
    }

    /**
    * createResponse method is used to create Response records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */
   
    public static List<Response__c> createResponse(Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
        List<Response__c> resplist = new List<Response__c>();
        for(Integer i=0; i< numToInsert; i++){
        Response__c resp = new Response__c();
       
        resplist.add(resp);
        }
        return createRecords(resplist,true,attributes);
    }

    /**
    * createResponse method is used to create Response records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */
    public static List<AccountAssessmentRelation__c> createAccountAssessment(Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
        List<AccountAssessmentRelation__c> accountAssessmentlist = new List<AccountAssessmentRelation__c>();
        for(Integer i=0; i< numToInsert; i++){
        AccountAssessmentRelation__c accountAssessment = new AccountAssessmentRelation__c();
       
        accountAssessmentlist.add(accountAssessment);
        }
        return createRecords(accountAssessmentlist,true,attributes);
    }

    /**
    * createResponse method is used to create Response records
    * @param numToInsert This is a number of records to insert.  
    * @param doInsert This is boolean value whether to insert record or not.
    * @param attributes This is a map which contain record data to insert.
    */
    public static List<Assessment_Supplier__c> createSuppliers(Integer numToInsert, Boolean doInsert,Map<String, Object> attributes){
        List<Assessment_Supplier__c> supplierList = new List<Assessment_Supplier__c>();
        for(Integer i=0; i< numToInsert; i++){
            Assessment_Supplier__c accSupplier = new Assessment_Supplier__c();
            supplierList.add(accSupplier);
        }
        return createRecords(supplierList,true,attributes);
    }
}