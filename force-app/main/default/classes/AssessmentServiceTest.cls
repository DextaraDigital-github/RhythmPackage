/**
* Class Name        : AssessmentServiceTest
* Developer         :         
* Created Date      :
* @description      :
* Last Modified Date:
*/

@isTest
public class AssessmentServiceTest {
    static AssessmentService service = AssessmentService.getInstance();
    /**
* @description
*/
    @isTest
    public static void fetchAssessmentTemplatesTest() {
        try{
            user u = [SELECT Id,UserName FROM User WHERE Profile.Name='Standard Platform User' LIMIT 1];
            System.runAs(u){
				Test.startTest();
                service.fetchAssessmentTemplates();
				Test.stopTest();
            }
        }
        catch(Exception e) {
            
        }
        
    }
}