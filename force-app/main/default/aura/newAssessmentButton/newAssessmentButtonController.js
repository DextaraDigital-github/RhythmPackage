({
    init : function(cmp) {
        var myPageRef = cmp.get("v.pageReference");
        var templateId = '';
        if(myPageRef.state.Rhythm__templateId !== undefined && myPageRef.state.Rhythm__templateId.length >0){
            templateId = myPageRef.state.Rhythm__templateId;
            cmp.set("v.templateId",templateId);
        }
    },
    refreshPage: function(){
        $A.get('e.force:refreshView').fire();
    }
    
})