/**
* Class Name        : SecurityCheckController
* Developer         :            
* Created Date      : 
* @description      : It is used to check permissions for objects and fields.
* Last Modified Date: 
*/
public with sharing class SecurityCheckController {
    @testVisible
    private Boolean allOrNothing = false;
    @testVisible
    private Boolean throwIfRemovedFields = true;
    /**
    * @description It extends exceptions. 
    */
    public class RemovedFieldsException extends Exception {
    }
    
    /**
    * @description 
    * @return  
    */
    public SecurityCheckController allOrNothing() {
        this.allOrNothing = true;
        return this;
    }

    /**
    * @description To execute before insert logics.
    * @return  
    */
    public SecurityCheckController throwIfRemovedFields() {
        this.throwIfRemovedFields = true;
        return this;
    }

    /**
    * @description To insert the records.
    * @param records List of records.
    * @return 
    */
    public List<Database.SaveResult> doInsert(List<SObject> records) {
        if (records.isEmpty()) {
            return new List<Database.SaveResult>();
        }
        if (CanTheUser.create(records)) {
            return doDML(System.AccessType.CREATABLE, records);
        }
        return new List<Database.SaveResult>();
    }
/**
    * @description To insert records.
    * @param record is Sobject record.
    * @return  
    */
    // public List<Database.SaveResult> doInsert(SObject record) {
    //     return doInsert(new List<Sobject>{ record });
    // }

   /**
    * @description To update records.
    * @param records of records.
    * @return  
    */
    public List<Database.SaveResult> doUpdate(List<SObject> records) {
        if (records.isEmpty()) {
            return new List<Database.SaveResult>();
        }
        if (CanTheUser.edit(records)) {
            return doDML(System.AccessType.UPDATABLE, records);
        }
        return new List<Database.SaveResult>();
    }
/**
    * @description To update records.
    * @param record is Sobject record.
    * @return 
    */
    // public List<Database.SaveResult> doUpdate(SObject record) {
    //     return doUpdate(new List<Sobject>{ record });
    // }

    /**
    * @description 
    * @param records List of records
    * @return 
    */
    public List<Database.UpsertResult> doUpsert(List<SObject> records) {
        if (records.isEmpty()) {
            return new List<Database.UpsertResult>();
        }
        if (CanTheUser.edit(records) && CanTheUser.create(records)) {
            /*SObjectAccessDecision securityDecision = guardAgainstRemovedFields(
                AccessType.UPSERTABLE,
                records
            );*/

            return Database.upsert(
                //securityDecision.getRecords(),
                records,
                this.allOrNothing
            );
        }
        return new List<Database.UpsertResult>();
    }
/**
    * @description 
    * @param records
    * @param uniqueField
    * @return 
    */
    public List<Database.UpsertResult> doUpsert(List<SObject> records, Schema.sObjectField uniqueField) {
        if (records.isEmpty()) {
            return new List<Database.UpsertResult>();
        }
        if (CanTheUser.edit(records) && CanTheUser.create(records)) {
            /*SObjectAccessDecision securityDecision = guardAgainstRemovedFields(
                AccessType.UPSERTABLE,
                records
            );*/

            return Database.upsert(
                //securityDecision.getRecords(),
                records,
                uniqueField,
                this.allOrNothing
            );
        }
        return new List<Database.UpsertResult>();
    }
/**
    * @description 
    * @param record
    * @return  
    */
    public List<Database.UpsertResult> doUpsert(Sobject record) {
        return doUpsert(new List<Sobject>{ record });
    }

   /**
    * @description 
    * @param records
    * @return  
    */
    public List<Database.DeleteResult> doDelete(List<SObject> records) {
        if (records.isEmpty()) {
            return new List<Database.DeleteResult>();
        }
        if (CanTheUser.destroy(records)) {
            return Database.delete(records, this.allOrNothing);
        }
        return new List<Database.DeleteResult>();
    }
/**
    * @description 
    * @param record
    * @return  
    */
    public List<Database.DeleteResult> doDelete(SObject record) {
        return doDelete(new List<Sobject>{ record });
    }

   /**
    * @description 
    * @param query
    * @return  
    */
    public List<SObject> doQuery(String query) {
        List<SObject> records = Database.query(query);
        SObjectAccessDecision securityDecision = guardAgainstRemovedFields(
            AccessType.READABLE,
            records
        );
        return securityDecision.getRecords();
    }
/**
    * @description 
    * @param query
    * @param bindVariables
    * @return
    */
    public List<SObject> doQueryWithBinds(String query, Map<String, Object> bindVariables) {
        List<SObject> records = Database.queryWithBinds(query, bindVariables,AccessLevel.USER_MODE);
        SObjectAccessDecision securityDecision = guardAgainstRemovedFields(
            AccessType.READABLE,
            records
        );
        return securityDecision.getRecords();
    }

    /**
    * @description 
    * @param accessType
    * @param records
    * @return
    */
    private List<Database.SaveResult> doDML(
        System.AccessType accessType,
        List<SObject> records
    ) {
     /*   SObjectAccessDecision securityDecision = guardAgainstRemovedFields(
            accessType,
            records
        );
        */

        switch on accessType {
            when CREATABLE {
                return Database.insert(
                   // securityDecision.getRecords(),
                   records,
                    this.allOrNothing
                );
            }
            when UPDATABLE {
                return Database.update(
                    //securityDecision.getRecords(),
                    records,
                    this.allOrNothing
                );
            }
            // impossible, but required by compiler
            when else {
                return new List<Database.SaveResult>();
            }
        }
    }
/**
    * @description 
    * @param accessType
    * @param records
    * @return 
    */
    private SObjectAccessDecision guardAgainstRemovedFields(
        System.AccessType accessType,
        List<SObject> records
    ) {
        SObjectAccessDecision securityDecision = Security.stripInaccessible(
            accessType, // What kind of Access are we checking?
            records, // The records to check
            true // <- true here also enforces CRUD.
        );
        Map<String, Set<String>> removedFields = securityDecision.getRemovedFields();
        if (this.throwIfRemovedFields && !removedFields.isEmpty()) {
            throw new RemovedFieldsException(
                'ThrowIfRemovedFields is enabled and the following fields were removed: ' +
                removedFields
            );
        }
        return securityDecision;
    }
/**
    * @description 
    * @param srList
    * @return  
    */
    public static List<String> safeClassExceptionHandlerInsert(Database.SaveResult[] srList){
        List<String> errorList = new List<String>();
        for (Database.SaveResult sr : srList) {
            if (!sr.isSuccess()) {             
                for(Database.Error err : sr.getErrors()) {
                    errorList.add(err.getMessage());
                }
            }
        } 
        return errorList;
    }
/**
    * @description 
    * @param srList
    * @return  
    */
    public static List<String> safeClassExceptionHandlerUpsert(Database.UpsertResult[] srList){
            List<String> errorList = new List<String>();
            for (Database.UpsertResult sr : srList) {
                if (!sr.isSuccess()) {             
                    for(Database.Error err : sr.getErrors()) {
                        errorList.add(err.getMessage());
                    }
                }
            } 
            return errorList;
    }
/**
    * @description 
    * @param srList
    * @return 
    */
    public static List<String> safeClassExceptionHandlerDelete(Database.DeleteResult[] srList){
            List<String> errorList = new List<String>();
            for (Database.DeleteResult sr : srList) {
                if (!sr.isSuccess()) {             
                    for(Database.Error err : sr.getErrors()) {
                        errorList.add(err.getMessage());
                    }
                }
            } 
            return errorList;
    }
}