/* Class Name   : AssessmentController
* Developer         :  Sai Koushik Nimmaturi and Reethika Velpula      
* Created Date      : 
* Description       : TestDataFactory class is used to create test data.
* Last Modified Date: 
*/


public class TestDataFactory 
{
    /* createRecords methods is used to create the records for all objects */
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
   /* createAccounts method is used to create account records */
	public static List<Account> createAccounts(Integer numToInsert, Boolean doInsert, Map<String, Object> attributes){
        List<Account> accountsToInsert = new List<Account>();
        for(Integer i=0; i< numToInsert; i++){
            Account acc = new Account();
            acc.Name = 'TestAccount' + i;
            accountsToInsert.add(acc);
        }
        return createRecords(accountsToInsert, doInsert, attributes);
    }
    
     /* createContacts method is used to create Contacts records */
	public static List<Contact> createContacts(Integer numToInsert, Boolean doInsert, Map<String, Object> attributes){
    	List<contact> contactsToInsert = new List<Contact>();
		for(Integer i=0; i< numToInsert; i++)
        {
            Contact ct=new Contact();
			ct.LastName='Test contact '+i;
			ct.Email='testemail@gmail.com';
			
			contactsToInsert.add(ct);
        }
		return createRecords(contactsToInsert, doInsert, attributes);
	}
    /* createAccountContactRelation method is used to create AccountContactRelation records */
    public static List<AccountContactRelation> createAccountContactRelation(Id accountid,Id contactid,Map<String, Object> attributes)
	{
       List<AccountContactRelation> acrlst = new List<AccountContactRelation>();
           AccountContactRelation acr = new AccountContactRelation();
            acr.AccountId = accountid;
            acr.ContactId = contactid;
        acrlst.add(acr);
       return createRecords(acrlst, true, attributes);
        
	}
      /* createAsset method is used to create Asset records */
    public static List<Asset> createAsset(Integer numberofassets,Boolean doInsert,Id accountid,Map<String, Object> attributes)
	{
		List<Asset> assetlist=new List<Asset>();
		for(Integer i=0; i< numberofassets; i++)
        {
          
			Asset ast=new Asset();
			ast.name='Test Asset '+i;
			ast.AccountId=accountid;
			assetlist.add(ast);
        }
		return createRecords(assetlist, doInsert, attributes);
    }
     /* createProject method is used to create Project records */
    public static List<Project__c> createProject(Id accountid,Id assetid,Boolean doInsert,Map<String, Object> attributes){
        List<Project__c> prLst = new List<Project__c>();
        Project__c pr = new Project__c();
            pr.Account__c = accountid;
            pr.Asset__c = assetid;
            pr.Name = 'TestProject';
            prLst.add(pr);
           return createRecords(prLst, doInsert, attributes);
           
        }
    
   /* createProjectLine method is used to create ProjectLine records */

    public static List<Project_Line__c> createProjectLine (Id projectid,Id assetid,Boolean doInsert,Map<String, Object> attributes){
        List<Project_Line__c> prlList = new  List<Project_Line__c>();
        Project_Line__c prl = new Project_Line__c();
        prl.Project__c = projectid;
        prl.Asset__c = assetid;
        prl.Name = 'TestProjectLine';
        prlList.add(prl);
return createRecords(prlList, doInsert, attributes);
    }
    
   /* createProjectassignment method is used to create ProjectAssignment records */

    public static List<Project_Assignment__c> createProjectassignment (Id accountid,Id contactid,Id projectid,Id projectlineid,Map<String, Object> attributes){
        List<Project_Assignment__c> paList = new List<Project_Assignment__c>();
        Project_Assignment__c pa = new Project_Assignment__c();
        pa.Name = 'TestProjectAssignment';
        pa.Contact__c = contactid;
        pa.Account__c = accountid;
        pa.Project__c = projectid;
        if(projectlineid!=null)
        pa.Project_Line__c = projectlineid;
        paList.add(pa);
       return createRecords(paList, true, attributes);
    }
       /* createAssessmentTemp method is used to create AssessmentTemplate records */

    public static List<Assessment_Template__c> createAssessmentTemp(Map<String, Object> attributes){
        List<Assessment_Template__c> atemp = new List<Assessment_Template__c>();
        Assessment_Template__c at = new Assessment_Template__c();
        at.Name = 'TestAssessmentTemplate';
        atemp.add(at);
       return createRecords(atemp, true, attributes);
    }
     /* createSection method is used to create Section records */
    
    public static List<Section__c> createSection(Map<String, Object> attributes){
        List<Section__c> secLst = new List<Section__c>();
        Section__c sec = new Section__c();
        sec.Name = 'TestSection';
        secLst.add(sec);
        return createRecords(secLst,true,attributes);
    }
     /* createQuestion method is used to create Question records */
    public static List<Question__c> createQuestion(Map<String, Object> attributes){
        List<Question__c> qlist = new List<Question__c>();
        Question__c q = new Question__c();
        q.Question__c = 'Test Question';
        qlist.add(q);
        return createRecords(qlist,true,attributes);
    }
   /* public static List<Rythm__Assessment_Template_Junction__c> createATJunction (Id tempid,Id sectionid,Id questionid,Map<String, Object> attributes){
        List<Rythm__Assessment_Template_Junction__c> atjlist = new List<Rythm__Assessment_Template_Junction__c>();
        Rythm__Assessment_Template_Junction__c atj =  new Rythm__Assessment_Template_Junction__c();
        atj.Rythm__Assessment_Template__c = tempid;
        atj.Rythm__Section__c = sectionid;
        atj.Rythm__Question__c = questionid;
        atjlist.add(atj);
        return createRecords(atjlist,true,attributes);
    }*/
    
    /* createAssessment method is used to create Assessment records */
    
    public static List<Assessment__c> createAssessment (Id accountid,Id assetid,Id Tempid,Id projectassignid,Map<String, Object> attributes){
		List<Assessment__c> AssesmentList=new List<Assessment__c> ();
				Assessment__c at=new Assessment__c();
				at.Name__c='Test Assesment';
				at.Account__c=accountid;
				at.Asset__c=assetid;
				at.Template__c=Tempid;
				at.Project_Assignment__c=projectassignid;
			AssesmentList.add(at);
       		 return createRecords(AssesmentList,true,attributes); 
    }
    /* createResponse method is used to create Response records */
    public static List<Response__c> createResponse(Id accountid,Id assessmentid,Id questionid,Map<String, Object> attributes){
        List<Response__c> resplist = new List<Response__c>();
        Response__c resp = new Response__c();
        resp.Account__c = accountid;
        resp.Assessment__c = assessmentid;
        resp.Question__c = questionid;
        resplist.add(resp);
        return createRecords(resplist,true,attributes);
    }
    /* createActionItem method is used to create Action records */
    public static List<Action__c> createActionItem(Id responseid,Map<String, Object> attributes){
        List<Action__c> actionList = new List<Action__c>();
        Action__c action = new Action__c();
        action.Response__c = responseid;
        actionList.add(action);
        return createRecords(actionList,true,attributes);
    }

    
    }