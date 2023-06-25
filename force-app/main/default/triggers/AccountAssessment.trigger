trigger AccountAssessment on Rhythm__AccountAssessmentRelation__c (after delete, after insert, after undelete, after update,before delete, before insert, before update) {
        TriggerDispatcher.run(new AccountAssessmentRelationHandler());
}