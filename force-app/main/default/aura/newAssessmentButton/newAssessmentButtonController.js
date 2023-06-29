({
    init : function(cmp, event, helper) {
        console.log('DOINIT------------->');
       	var myPageRef = cmp.get("v.pageReference");
        let templateId = '';
        if(myPageRef.state.Rhythm__templateId != undefined && myPageRef.state.Rhythm__templateId.length >0){
            templateId = myPageRef.state.Rhythm__templateId;
            cmp.set("v.templateId",templateId);
        }
        console.log('templateId------------->',templateId);
    },
    refreshPage: function(cmp, event, helper){
        console.log('successeventValue----->',event.getParam('value'));
        $A.get('e.force:refreshView').fire();
    }
    
})