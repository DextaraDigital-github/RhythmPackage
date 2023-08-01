/**
* Class Name        : AssessmentServiceTest
* Developer         :         
* Created Date      :
* @description      :
* Last Modified Date:
*/

@isTest
public class AssessmentServiceTest {
    
    /**
* @description
*/
    @isTest
    Public Static void fetchAssessmentTemplatesTest() {
        
        try{
            user u = [SELECT Id,UserName FROM User WHERE Profile.Name='Standard Platform User' LIMIT 1];
            System.runAs(u){
				Test.startTest();
                AssessmentService.fetchAssessmentTemplates();
				Test.stopTest();
            }
        }
        catch(Exception e) {
            
        }
        
    }
}