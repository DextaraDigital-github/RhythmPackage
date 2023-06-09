public class TemplateController {

    @AuraEnabled
    public static ResultWrapper createTemplateVersion(string recordId){
        ResultWrapper resultWrap = new ResultWrapper();
        Savepoint sp = Database.setSavepoint();
        try{
            List<Rythm__Section__c> newSectionsList = new List<Rythm__Section__c>();
            List<Rythm__Assessment_Template_Version__c> latestAssVerList = [SELECT Id,Name,Rythm__Assessment_Template__c FROM Rythm__Assessment_Template_Version__c WHERE Rythm__Assessment_Template__c=:recordId ORDER BY CreatedDate];
            Integer versionCount = latestAssVerList.size();      
            if(latestAssVerList.isEmpty() == false){
                string versionId = '';
                string newVersionId = '';
                List<Rythm__Assessment_Template_Version__c> versionList = new List<Rythm__Assessment_Template_Version__c>();

                set<Id> existingVerIds = new set<Id>();
                Rythm__Assessment_Template_Version__c activeVer = latestAssVerList[0];
                activeVer.Rythm__Status__c = 'Inactive';
                versionList.add(activeVer);
                
                Rythm__Assessment_Template_Version__c newVer = activeVer.clone(false, true); //do a deep clone
                newVer.Name = 'Version '+string.valueOf(versionCount+1);
                newVer.Rythm__Status__c = 'Inactive';
                versionList.add(newVer);
                
                for(Rythm__Assessment_Template_Version__c tempVer:versionList){
                    if(tempVer.Id != null){
                        existingVerIds.add(tempVer.Id);
                    }
                }
                upsert versionList;
                
                for(Rythm__Assessment_Template_Version__c tempVer:versionList){
                    if(existingVerIds.contains(tempVer.Id)){
                        versionId = tempVer.Id;
                    }else{
                        newVersionId = tempVer.Id;
                    }
                }

                List<Rythm__Section__c> sectionsList = [Select Id, Name,Rythm__Assessment_Template__c,
                Rythm__Assessment_Template_Version__c,(Select Id,Name,Rythm__Question__c,Rythm__Assessment_Template__c,
                Rythm__Assessment_Template_Version__c,Rythm__Question_Type__c,Rythm__Conditional_Response__c,
                Rythm__HelpText__c,Rythm__OptionValueSet__c,Rythm__Parent_Question__c,
                Rythm__Question_Sequence_Number__c,Rythm__Required__c,Rythm__Requires_File_Upload__c,
                Rythm__Section__c FROM Questions__r) FROM Rythm__Section__c WHERE Rythm__Assessment_Template_Version__c = :versionId];

               
                List<Rythm__Question__c> oldQuestionsList = new List<Rythm__Question__c>();
                List<Rythm__Question__c> questionsList = new List<Rythm__Question__c>();
                for(Rythm__Section__c section : sectionsList){
                    system.debug('section----->'+section);
                    Rythm__Section__c newSection = section.clone(false, true); //do a deep clone
                    newSection.Rythm__Assessment_Template_Version__c = newVersionId;
                    newSection.Rythm__Cloned_Record_Id__c = section.Id;
                    newSectionsList.add(newSection);
                    oldQuestionsList.addAll(section.Questions__r);
                }
                Map<Id,Id> sectionIdsMap = new Map<Id,Id>();

                //insert sections
                insert newSectionsList;
                for(Rythm__Section__c sec:newSectionsList){
                    sectionIdsMap.put(sec.Rythm__Cloned_Record_Id__c,sec.Id);
                }
                system.debug('sectionIdsMap------->'+sectionIdsMap);
                for(Rythm__Question__c question : oldQuestionsList){
                    Rythm__Question__c newQuestion = question.clone(false, true);
                    newQuestion.Rythm__Section__c = sectionIdsMap.get(question.Rythm__Section__c);
                    newQuestion.Rythm__Assessment_Template_Version__c = newVersionId;
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