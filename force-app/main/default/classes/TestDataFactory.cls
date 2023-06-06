public class TestDataFactory 
{
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

	public static List<Account> createAccounts(Integer numToInsert, Boolean doInsert, Map<String, Object> attributes){
        List<Account> accountsToInsert = new List<Account>();
        for(Integer i=0; i< numToInsert; i++){
            Account acc = new Account();
            acc.Name = 'TestAccount' + i;
            accountsToInsert.add(acc);
        }
        return createRecords(accountsToInsert, doInsert, attributes);
    }
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
    public static List<AccountContactRelation> createAccountContactRelation(Id accountid,Id contactid,Map<String, Object> attributes)
	{
       List<AccountContactRelation> acrlst = new List<AccountContactRelation>();
           AccountContactRelation acr = new AccountContactRelation();
            acr.AccountId = accountid;
            acr.ContactId = contactid;
        acrlst.add(acr);
       return createRecords(acrlst, true, attributes);
        
	}
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
    public static List<Rythm__Project__c> createProject(Id accountid,Id assetid,Boolean doInsert,Map<String, Object> attributes){
        List<Rythm__Project__c> prLst = new List<Rythm__Project__c>();
        Rythm__Project__c pr = new Rythm__Project__c();
            pr.Rythm__Account__c = accountid;
            pr.Rythm__Asset__c = assetid;
            pr.Name = 'TestProject';
            prLst.add(pr);
           return createRecords(prLst, doInsert, attributes);
           
        }
    public static List<Rythm__Project_Line__c> createProjectLine (Id projectid,Id assetid,Boolean doInsert,Map<String, Object> attributes){
        List<Rythm__Project_Line__c> prlList = new  List<Rythm__Project_Line__c>();
        Rythm__Project_Line__c prl = new Rythm__Project_Line__c();
        prl.Rythm__Project__c = projectid;
        prl.Rythm__Asset__c = assetid;
        prl.Name = 'TestProjectLine';
        prlList.add(prl);
return createRecords(prlList, doInsert, attributes);
    }
    public static List<Rythm__Project_Assignment__c> createProjectassignment (Id accountid,Id contactid,Id projectid,Id projectlineid,Map<String, Object> attributes){
        List<Rythm__Project_Assignment__c> paList = new List<Rythm__Project_Assignment__c>();
        Rythm__Project_Assignment__c pa = new Rythm__Project_Assignment__c();
        pa.Name = 'TestProjectAssignment';
        pa.Rythm__Contact__c = contactid;
        pa.Rythm__Account__c = accountid;
        pa.Rythm__Project__c = projectid;
        if(projectlineid!=null)
        pa.Rythm__Project_Line__c = projectlineid;
        paList.add(pa);
       return createRecords(paList, true, attributes);
    }
    public static List<Rythm__Assessment_Template__c> createAssessmentTemp(Map<String, Object> attributes){
        List<Rythm__Assessment_Template__c> atemp = new List<Rythm__Assessment_Template__c>();
        Rythm__Assessment_Template__c at = new Rythm__Assessment_Template__c();
        at.Name = 'TestAssessmentTemplate';
        atemp.add(at);
       return createRecords(atemp, true, attributes);
    }
    public static List<Rythm__Section__c> createSection(Map<String, Object> attributes){
        List<Rythm__Section__c> secLst = new List<Rythm__Section__c>();
        Rythm__Section__c sec = new Rythm__Section__c();
        sec.Name = 'TestSection';
        secLst.add(sec);
        return createRecords(secLst,true,attributes);
    }
    public static List<Rythm__Question__c> createQuestion(Map<String, Object> attributes){
        List<Rythm__Question__c> qlist = new List<Rythm__Question__c>();
        Rythm__Question__c q = new Rythm__Question__c();
        q.Rythm__Question__c = 'Test Question';
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
    public static List<Rythm__Assessment__c> createAssessment (Id accountid,Id assetid,Id Tempid,Id projectassignid,Map<String, Object> attributes){
		List<Rythm__Assessment__c> AssesmentList=new List<Rythm__Assessment__c> ();
				Rythm__Assessment__c at=new Rythm__Assessment__c();
				at.Rythm__Name__c='Test Assesment';
				at.Rythm__Account__c=accountid;
				at.Rythm__Asset__c=assetid;
				at.Rythm__Assessment_Template__c=Tempid;
				at.Rythm__Project_Assignment__c=projectassignid;
			AssesmentList.add(at);
       		 return createRecords(AssesmentList,true,attributes); 
    }
    public static List<Rythm__Response__c> createResponse(Id accountid,Id assessmentid,Id questionid,Map<String, Object> attributes){
        List<Rythm__Response__c> resplist = new List<Rythm__Response__c>();
        Rythm__Response__c resp = new Rythm__Response__c();
        resp.Rythm__Account__c = accountid;
        resp.Rythm__Assessment__c = assessmentid;
        resp.Rythm__Question__c = questionid;
        resplist.add(resp);
        return createRecords(resplist,true,attributes);
    }
    public static List<Rythm__Action__c> createActionItem(Id responseid,Map<String, Object> attributes){
        List<Rythm__Action__c> actionList = new List<Rythm__Action__c>();
        Rythm__Action__c action = new Rythm__Action__c();
        action.Rythm__Response__c = responseid;
        actionList.add(action);
        return createRecords(actionList,true,attributes);
    }

    
    }