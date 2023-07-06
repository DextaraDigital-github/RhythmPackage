public with sharing class TemplateController {
    public static SecurityCheckController safe = new SecurityCheckController();//use singleton pattern
    private static Savepoint sp;//prudhvi to work

    @AuraEnabled
    public static ResultWrapper createTemplateVersion(string recordId){
        ResultWrapper resultWrap = new ResultWrapper();
        Savepoint sp = Database.setSavepoint();
        try{
            List<Section__c> newSectionsList = new List<Section__c>();
            string query = 'SELECT Id,Name,Assessment_Template__c'
                         + ' FROM Assessment_Template_Version__c'
                         + ' WHERE Assessment_Template__c= \'' + string.escapeSingleQuotes(recordId) + '\''
                         + ' WITH SECURITY_ENFORCED'
                         + ' ORDER BY CreatedDate';
            
            List<Assessment_Template_Version__c> latestAssVerList = safe.doQuery(query);
            Integer versionCount = latestAssVerList.size();      
            if(latestAssVerList.isEmpty() == false){
                string versionId = '';
                string newVersionId = '';
                List<Assessment_Template_Version__c> versionList = new List<Assessment_Template_Version__c>();

                set<Id> existingVerIds = new set<Id>();
                Assessment_Template_Version__c activeVer = latestAssVerList[0];
                activeVer.Status__c = 'Inactive';
                versionList.add(activeVer);
                
                Assessment_Template_Version__c newVer = activeVer.clone(false, true); //do a deep clone
                newVer.Name = 'Version '+string.valueOf(versionCount+1);
                newVer.Status__c = 'Inactive';
                versionList.add(newVer);
                
                for(Assessment_Template_Version__c tempVer:versionList){
                    if(tempVer.Id != null){
                        existingVerIds.add(tempVer.Id);
                    }
                }
                if(sp == null){
                    sp = Database.setSavepoint();
                }
                if(versionList.isEmpty() == false){
                    Database.UpsertResult[] results = safe.doUpsert(versionList);
                    List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerUpsert(results);
                    if(errorsList.size()>0){
                        Database.rollback(sp);
                        throw new SecurityControllerException(String.join(errorsList, ', ' ));
                    }
                    for(Assessment_Template_Version__c tempVer:versionList){
                        if(existingVerIds.contains(tempVer.Id)){
                            versionId = tempVer.Id;
                        }else{
                            newVersionId = tempVer.Id;
                        }
                    }
                }


                string secQuery = 'SELECT Id, Name,Assessment_Template__c,'
                                + 'Assessment_Template_Version__c,(Select Id,Name,Question__c,'
                                + 'Assessment_Template__c,Assessment_Template_Version__c,'
                                + 'Question_Type__c,Conditional_Response__c,HelpText__c,'
                                + 'OptionValueSet__c,Parent_Question__c,Question_Sequence_Number__c,'
                                + 'Required__c,Requires_File_Upload__c,Section__c FROM Questions__r)'
                                +' FROM Section__c'
                                +' WHERE Assessment_Template_Version__c =\'' + string.escapeSingleQuotes(versionId) + '\''
                                +' WITH SECURITY_ENFORCED';
                List<Section__c> sectionsList = safe.doQuery(secQuery);

                List<Question__c> oldQuestionsList = new List<Question__c>();
                List<Question__c> questionsList = new List<Question__c>();

                if(sectionsList.isEmpty() == false){
                    for(Section__c section : sectionsList){
                        Section__c newSection = section.clone(false, true); //do a deep clone
                        newSection.Assessment_Template_Version__c = newVersionId;
                        newSection.Cloned_Record_Id__c = section.Id;
                        newSectionsList.add(newSection);
                        oldQuestionsList.addAll(section.Questions__r);
                    }
                    Map<Id,Id> sectionIdsMap = new Map<Id,Id>();
                    if(newSectionsList.isEmpty() == false){
                        Database.SaveResult[] results = safe.doInsert(newSectionsList);
                        List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                        if(errorsList.size()>0){
                            Database.rollback(sp);
                            throw new SecurityControllerException(String.join(errorsList, ', ' ));
                        }else{
                            for(Section__c sec:newSectionsList){
                                sectionIdsMap.put(sec.Cloned_Record_Id__c,sec.Id);
                            }
                        }
                    }
                    if(oldQuestionsList.isEmpty() == false){
                        for(Question__c question : oldQuestionsList){
                            Question__c newQuestion = question.clone(false, true);
                            newQuestion.Section__c = sectionIdsMap.get(question.Section__c);
                            newQuestion.Assessment_Template_Version__c = newVersionId;
                            questionsList.add(newQuestion);
                        }
                        if(questionsList.isEmpty() == false){
                            Database.SaveResult[] results = safe.doInsert(questionsList);
                            List<String> errorsList = SecurityCheckController.safeClassExceptionHandlerInsert(results);
                            if(errorsList.size()>0){
                                Database.rollback(sp);
                                throw new SecurityControllerException(String.join(errorsList, ', ' ));
                            }
                        }
                    }
                    resultWrap.isSuccess = true;
                    resultWrap.message = '';
                    resultWrap.errorCode = '';
                }
            }else{
                resultWrap.isSuccess = false;
                resultWrap.message = 'No Existing Template Version';
                resultWrap.errorCode = '';
            }
        }catch(Exception e){
            Database.rollback(sp);
            resultWrap.isSuccess = false;
            resultWrap.message = e.getMessage();
            resultWrap.errorCode = '';
        }
        return resultWrap;
    }
    public class ResultWrapper{
        @AuraEnabled public boolean isSuccess;
        @AuraEnabled public string message;
        @AuraEnabled public string errorCode;
    }
    public class SecurityControllerException extends Exception{
        
    }
}