var temp;
var responseValues;
export function constructMultilevelhierarchy(queryResults, savedResp, respAttr, thistemp) {
    if (typeof thistemp !== 'undefined') {
        temp = thistemp;
    }
    const children = queryResults.filter(result => typeof result.Rhythm__Parent_Question__c !== 'undefined');
    const parent = queryResults.filter(result => typeof result.Rhythm__Parent_Question__c === 'undefined');
    const resQuestType = queryResults.filter(query => query.Rhythm__Question_Type__c === 'Picklist' || query.Rhythm__Question_Type__c === 'Radio'
        || query.Rhythm__Question_Type__c === 'Checkbox' || query.Rhythm__Question_Type__c === 'Picklist (Multi-Select)');
    const ques = queryResults.filter(query => query.Rhythm__Question_Type__c !== 'Picklist' && query.Rhythm__Question_Type__c !== 'Radio'
        && query.Rhythm__Question_Type__c !== 'Checkbox' && query.Rhythm__Question_Type__c !== 'Picklist (Multi-Select)');
    let childQueslst = [];
    let parentQueslst = [];
    parent.forEach(parentdata => {
        parentQueslst.push(parentdata.Id);
    });
    children.forEach(child => {
        childQueslst.push(child.Id);
    });
    ques.forEach(parentData => {
        if (!childQueslst.includes(parentData.Id)) {
            const hierarchyObj = temp.constructWrapperConditionalQuestion(parentData, savedResp);
            temp.hierarchy.push(hierarchyObj);
        }
    });
    if (resQuestType.length > 0) {
        resQuestType.forEach(parentdata => {
            //if (!childQueslst.includes(parentdata.Id)) {
            
            const hierarchyObj = temp.constructWrapperConditionalQuestion(parentdata, savedResp);
            responseValues = [];
            respAttr.forEach(resp=>{
                if(resp.Rhythm__QuestionId__c===hierarchyObj.Id){
                    responseValues.push(resp.Id);
                }
            });
            createChildHierarchy(children, hierarchyObj, savedResp, respAttr, temp,true);
            temp.hierarchy.push(hierarchyObj);
            /*} else {
                const hierarchyObj = temp.constructWrapperConditionalQuestion(parentdata, savedResp);
                temp.hierarchy.push(hierarchyObj);
            }*/
        });
    }

}
// createChildHierarchy method is used to construct nested questions wrapper for child questions accordingly with its parent Question 
export function createChildHierarchy(queryResults, parentObj, savedResp, respAttr, thistemp,bool) {
    if (typeof thistemp !== 'undefined') {
        temp = thistemp;
    }
    const child = queryResults.filter(result =>
        (result['Rhythm__Parent_Question__c'] === parentObj.Id));
    respAttr.forEach(resp => {
        if (parentObj.type === 'Checkbox' && parentObj.Id === resp.Rhythm__QuestionId__c) {
            if (resp.Rhythm__Response_value__c === 'true' || resp.Rhythm__Response_value__c===true) {
                resp.Rhythm__Response_value__c = true;
            }
            else {
                resp.Rhythm__Response_value__c = false;
            }
        }
    });
    if (child.length > 0 && bool) {
        child.forEach(childdata => {
            const childObj = temp.constructWrapperConditionalQuestion(childdata, savedResp);
            temp.childQuestionList.push(childObj.Id);
            temp.parentQuestionList.push(parentObj.Id);
            if (childObj.type === 'Radio' || childObj.type === 'Picklist (Multi-Select)' || childObj.type === 'Checkbox' ||
                childObj.type === 'Picklist') {
                respAttr.forEach(resp=>{
                if(resp.Rhythm__QuestionId__c===childObj.Id){
                    responseValues.push(resp.Id);
                }
            });
                createChildHierarchy(queryResults, childObj, savedResp, respAttr, thistemp,false);
            }
            if (parentObj.type === 'Checkbox') {
                if (childObj.conditional === 'true') {
                    childObj.conditional = true;
                }
                else {
                    childObj.conditional = false;
                }
            }
            if (parentObj.value === childObj.conditional) {
                let key = parentObj.question + '-' + parentObj.value;
                temp.questionsvaluemap[key] = childObj;
                let childmp = {};
                respAttr.forEach(resp => {
                    if (resp.Rhythm__Response_value__c === parentObj.value && resp.Rhythm__QuestionId__c === parentObj.Id &&
                    responseValues.includes(resp.Id)) {
                        childmp.respAttrId = resp.Id;
                        childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                        childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                        childmp.score = resp.Rhythm__Score__c;
                        childmp.weight = resp.Rhythm__Weight__c;
                        let index = responseValues.indexOf(resp.Id);
                        let del = responseValues.splice(index, 1);
                    }
                });
                childmp.isdisplay = true;
                let bool = false;
                let childlst = JSON.parse(JSON.stringify(parentObj.Children));
                if (childlst.length > 0) {
                    childlst.forEach(lst => {
                        if (lst.optionValue === childObj.conditional) {
                            lst.questions.push(childObj);
                            bool = true;
                        }
                    });
                    if (bool) {
                        parentObj.Children = childlst;
                    }
                    else {
                        childmp.optionValue = childObj.conditional;
                        let lst = [];
                        lst.push(childObj);
                        childmp.questions = lst;
                        parentObj.Children.push(childmp);
                    }
                }
                else {
                    let childmp = {};
                    respAttr.forEach(resp => {
                        if (resp.Rhythm__Response_value__c === childObj.conditional && resp.Rhythm__QuestionId__c === parentObj.Id
                        && responseValues.includes(resp.Id)) {
                            childmp.respAttrId = resp.Id;
                            childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                            childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                            childmp.score = resp.Rhythm__Score__c;
                            childmp.weight = resp.Rhythm__Weight__c;
                            let index = responseValues.indexOf(resp.Id);
                            let del = responseValues.splice(index, 1);
                        }
                    });
                    childmp.isdisplay = true;
                    childmp.optionValue = childObj.conditional;
                    let lst = [];
                    lst.push(childObj);
                    childmp.questions = lst;
                    parentObj.Children.push(childmp);
                }
            }
            else {
                let displayval = false;
                if (temp.isPreviewComponent) {
                    displayval = true;
                }
                let childlst = JSON.parse(JSON.stringify(parentObj.Children));
                let bool = false;
                let key = parentObj.question + '-' + parentObj.value;
                temp.questionsvaluemap[key] = childObj;
                if (childlst.length > 0) {
                    childlst.forEach(lst => {
                        if (lst.optionValue === childObj.conditional) {
                            lst.questions.push(childObj);
                            bool = true;
                        }
                    });
                    if (bool) {
                        parentObj.Children = childlst;
                    }
                    else {
                        let childmp = {};
                        respAttr.forEach(resp => {
                            if (resp.Rhythm__Response_value__c === childObj.conditional && resp.Rhythm__QuestionId__c === parentObj.Id && 
                            responseValues.includes(resp.Id)) {
                                childmp.respAttrId = resp.Id;
                                childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                                childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                                childmp.score = resp.Rhythm__Score__c;
                                childmp.weight = resp.Rhythm__Weight__c;
                                let index = responseValues.indexOf(resp.Id);
                                let del = responseValues.splice(index, 1);
                            }
                        });
                        childmp.isdisplay = displayval;
                        childmp.optionValue = childObj.conditional;
                        let lst = [];
                        lst.push(childObj);
                        childmp.questions = lst;
                        parentObj.Children.push(childmp);
                    }
                }
                else {
                    let childmp = {};
                    respAttr.forEach(resp => {
                        if (resp.Rhythm__Response_value__c === childObj.conditional && resp.Rhythm__QuestionId__c === parentObj.Id
                        && responseValues.includes(resp.Id)) {
                            childmp.respAttrId = resp.Id;
                            childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                            childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                            childmp.score = resp.Rhythm__Score__c;
                            childmp.weight = resp.Rhythm__Weight__c;
                            let index = responseValues.indexOf(resp.Id);
                            let del =responseValues.splice(index,1);
                        }
                    });
                    childmp.isdisplay = displayval;
                    childmp.optionValue = childObj.conditional;
                    let lst = [];
                    lst.push(childObj);
                    childmp.questions = lst;
                    parentObj.Children.push(childmp);
                }
            }
        });
        while(responseValues.length>0){
            createChildHierarchy(queryResults,parentObj, savedResp, respAttr, thistemp  ,false);
        }
    }
    else {
        console.log('Into else',responseValues);
        let childlst = JSON.parse(JSON.stringify(parentObj.Children));
        respAttr.forEach(resp => {
            let childmp = {};
            if (resp.Rhythm__QuestionId__c === parentObj.Id && responseValues.includes(resp.Id)) {
                console.log('resp',resp);
                childmp.respAttrId = resp.Id;
                childmp.uploadrequired = resp.Rhythm__Upload_Required__c;
                childmp.ispreffered = resp.Rhythm__preferred_Not_preferred__c;
                childmp.score = resp.Rhythm__Score__c;
                childmp.weight = resp.Rhythm__Weight__c;
                childmp.optionValue = resp.Rhythm__Response_value__c;
                childmp.isdisplay = (parentObj.value === resp.Rhythm__Response_value__c);
                childmp.questions = [];
                childlst.push(childmp);
                let index = responseValues.indexOf(resp.Id);
                let del =responseValues.splice(index,1);
            }
        });
        parentObj.Children = childlst;
    }
}

export function handleOnloadUtil(thistemp,tempchatterData){
    if (typeof thistemp !== 'undefined') {
        temp = thistemp;
    }
     //This loop is to iterate over the sections in the wrapper.
        this.questionsAndAnswerss.forEach(questionAnswer => {
            questionAnswer.questions.forEach(question => {
                if (question.Id === tempchatterData.questionId) {
                    question.Rhythm__Conversation_History__c = tempchatterData.conversationHistory;
                    if (JSON.parse(tempchatterData.conversationHistory).length > 0) {
                        question.chatColour = true;
                    }
                }
                question.Children.forEach(subQuestion => {
                    subQuestion.questions.forEach(ques => {
                        if (ques.Id === tempchatterData.questionId) {
                            ques.Rhythm__Conversation_History__c = tempchatterData.conversationHistory;
                            if (JSON.parse(tempchatterData.conversationHistory).length > 0) {
                                ques.chatColour = true;
                            }
                        }
                    })
                })
            })
        });
}