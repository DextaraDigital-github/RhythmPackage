public class TemplateController {

    @AuraEnabled
    public static ResultWrapper createTemplateVersion(string recordId){
        ResultWrapper resultWrap = new ResultWrapper();
        Savepoint sp = Database.setSavepoint();
        try{
            List<Section__c> newSectionsList = new List<Section__c>();
            List<Assessment_Template_Version__c> latestAssVerList = [SELECT Id,Name,Assessment_Template__c FROM Assessment_Template_Version__c WHERE Assessment_Template__c=:recordId ORDER BY CreatedDate];
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
                upsert versionList;
                
                for(Assessment_Template_Version__c tempVer:versionList){
                    if(existingVerIds.contains(tempVer.Id)){
                        versionId = tempVer.Id;
                    }else{
                        newVersionId = tempVer.Id;
                    }
                }

                List<Section__c> sectionsList = [Select Id, Name,Assessment_Template__c,
                Assessment_Template_Version__c,(Select Id,Name,Question__c,Assessment_Template__c,
                Assessment_Template_Version__c,Question_Type__c,Conditional_Response__c,
                HelpText__c,OptionValueSet__c,Parent_Question__c,
                Question_Sequence_Number__c,Required__c,Requires_File_Upload__c,
                Section__c FROM Questions__r) FROM Section__c WHERE Assessment_Template_Version__c = :versionId];

               
                List<Question__c> oldQuestionsList = new List<Question__c>();
                List<Question__c> questionsList = new List<Question__c>();
                for(Section__c section : sectionsList){
                    system.debug('section----->'+section);
                    Section__c newSection = section.clone(false, true); //do a deep clone
                    newSection.Assessment_Template_Version__c = newVersionId;
                    newSection.Cloned_Record_Id__c = section.Id;
                    newSectionsList.add(newSection);
                    oldQuestionsList.addAll(section.Questions__r);
                }
                Map<Id,Id> sectionIdsMap = new Map<Id,Id>();

                //insert sections
                insert newSectionsList;
                for(Section__c sec:newSectionsList){
                    sectionIdsMap.put(sec.Cloned_Record_Id__c,sec.Id);
                }
                system.debug('sectionIdsMap------->'+sectionIdsMap);
                for(Question__c question : oldQuestionsList){
                    Question__c newQuestion = question.clone(false, true);
                    newQuestion.Section__c = sectionIdsMap.get(question.Section__c);
                    newQuestion.Assessment_Template_Version__c = newVersionId;
                    questionsList.add(newQuestion);
                }
                insert questionsList;
                
                resultWrap.isSuccess = true;
                resultWrap.message = '';
                resultWrap.errorCode = '';
                
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
}