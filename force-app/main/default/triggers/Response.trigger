trigger Response on Rhythm__Response__c (after delete, after insert,after undelete, after update,before delete, before insert, before update) {
        TriggerDispatcher.run(new ResponseHandler());
}