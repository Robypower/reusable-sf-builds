({
    apexCall : function(component, event, method, params, callback) {
        var action = component.get("c."+method); 
        action.setParams(params);
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === "SUCCESS"){
                callback.call(this, null, response.getReturnValue());
            } else if(state === "ERROR") {                
                var errors = response.getError();
                var errString = [];
                if (errors) {
                    var errString = '';
                    for(const i in errors){
                        var pageErrors = errors[i].pageErrors;
                        for(const prop in pageErrors){
                            if(prop && pageErrors[prop]){
                                var errList = pageErrors[prop];
                                if(errList && errList.statusCode && errList.message){
                                    errString += errList.statusCode+':'+errList.message+', ';
                                }
                            }
                        }
                        var fieldError = errors[i].fieldErrors;
                        for(const prop in fieldError){
                            if(prop && fieldError[prop]){
                                var errList = fieldError[prop];
                                if(errList && errList[0].message){
                                    errString += prop+':'+errList[0].message+', ';
                                }
                            }
                        }
                    }
                    if(!$A.util.isEmpty(errString))
                        this.displayMessage(component,'ErrorToast1', 'errormsg1',errString);
                    else
                        this.displayMessage(component,'ErrorToast1', 'errormsg1','Error occurred please contact to system administrator.');
                } 
                else {
                    this.displayMessage(component,'ErrorToast1', 'errormsg1','Error occurred please contact to system administrator.');
                }                
                callback.call(this, errString, response.getReturnValue());                
            }
        });
        $A.enqueueAction(action);
    },
    displayMessage: function(component, toastid, messageid, message,timeout) {
        var msgTimeout=5000 ;
        if(timeout)
            msgTimeout=timeout;
        document.getElementById(toastid).style.display = "block";
        var toastClasses = document.getElementById("ErrorToast").classList;
        toastClasses.add("lightningtoast");
        document.getElementById("SuccessToast").classList.add("lightningtoast");
        document.getElementById(messageid).innerHTML = message;
        
        setTimeout(function() {
            if(document.getElementById(messageid))
                document.getElementById(messageid).innerHTML = "";
            if(document.getElementById(toastid))
                document.getElementById(toastid).style.display = "none";
        }, msgTimeout);
        
    },
    getAllFields : function(component, event,lWrap){
        var layoutWrp = component.get('v.layoutWrp');
        if(!layoutWrp && lWrap){
            layoutWrp = lWrap;
        }
        var fields = [];
        if(layoutWrp.sections){
            layoutWrp.sections.forEach(section=>{
                if(section.col1){
                    fields=fields.concat(section.col1.fields); 
                }
                if(section.col2){
                    fields=fields.concat(section.col2.fields);
                }
            });
        }
        return fields;
    },
    getAllFieldsMap : function(component, event){
        var layoutWrp = component.get('v.layoutWrp');
        var fieldMap = {};
        if(layoutWrp.sections){
            layoutWrp.sections.forEach(section=>{
                if(section.col1){
                    if(section.col1.fields){
                        section.col1.fields.forEach(fld => {
                            fieldMap[fld.APIName] = fld;
                        });
                    }
                }
                if(section.col2){
                   if(section.col2.fields){
                        section.col2.fields.forEach(fld => {
                            fieldMap[fld.APIName] = fld;
                        });
                    }
                }
            });
        }
        return fieldMap;
    },
    initalizeComponent : function(component,event,layoutWrp){
        var allFields = this.getAllFields(component,event,layoutWrp);
        var customSlots = component.get('v.customSlots');
        var initializers = {};
        if(allFields){
            allFields.forEach(targetField => {
                if(targetField && targetField.isMaster && targetField.dependentField ){           
                    
                    if(layoutWrp.sections){
                        layoutWrp.sections.forEach(section=>{
                            var tempFields = [];
                            if( section && section.col1 && section.col1.fields ){
                                tempFields =tempFields.concat(section.col1.fields);
                            }
                            if( section && section.col2 && section.col2.fields ){
                                tempFields =tempFields.concat(section.col1.fields);
                            }                            
                            if(section.col1){
                                var fields=section.col1.fields; 
                                if(fields){
                                    fields.forEach(field=>{
                                        if(field.APIName == targetField.dependentField && field.picklistMap){
                                            field.picklistOptions = field.picklistMap[targetField.value];
                                            if(field.fieldType == 'multipicklist' && field.values && field.picklistOptions){                                    
                                                let values =[];
                                                field.picklistOptions.forEach(opt=>{
                                                    if(field.values.includes(opt.value)){
                                                        values.push(opt.value);
                                                    }
                                                });
                                                field.values = values;
                                            }
                                        }
                                    });                                    
                                }
                            }
                            if(section.col2){
                                var fields=section.col2.fields; 
                                if(fields){
                                    fields.forEach(field=>{
                                        if(field.APIName == targetField.dependentField && field.picklistMap){
                                            field.picklistOptions = field.picklistMap[targetField.value];
                                            if(field.fieldType == 'multipicklist' && field.values && field.picklistOptions){                                    
                                                let values =[];
                                                field.picklistOptions.forEach(opt=>{
                                                    if(field.values.includes(opt.value)){
                                                        values.push(opt.value);
                                                    }
                                                });
                                                field.values = values;
                                            }
                                        }
                                    });                                    
                                }
                            }
                        });
                    }                    
                }
                else{
                    var picklistSlotsJ = {};
                    
                    if(targetField.fieldType =='picklist' || targetField.fieldType =='multipicklist'){                    
                        var picklistSlots = customSlots;
                        if(picklistSlots){                                                    
                            for(const key in picklistSlots){
                                if(key == targetField.APIName && picklistSlots[key] && picklistSlots[key]['picklistopt']){                                
                                    var options = picklistSlots[key]['picklistopt'].split(';');
                                    var pickopt = [];
                                    options.forEach(ops=>{
                                        var lst = ops.split(',');
                                        var optObj = {'label':lst[0],'value':lst[1]};
                                                    pickopt.push(optObj);
                                    });
                                    if(pickopt.length >0){
                                        picklistSlotsJ[targetField.APIName] = pickopt;
                                    }
                                }
                            }                    
                        }                
                    }
                    
                    if(layoutWrp.sections){
                        layoutWrp.sections.forEach(section=>{
                            if(section.col1){
                                var fields=section.col1.fields;
                                if(fields){
                                    fields.forEach(field=>{
                                        if(field.fieldType == 'checkbox' && $A.util.isEmpty(component.get('v.recordId'))){                                 
                                            field.value = false;
                                        }
                                        if(field.fieldType == 'multipicklist' ){
                                            field.selectedLabel="Available";
                                            field.sourceLabel="Selected";
                                        }
                                        if(field.fieldType == 'location' ){
                                            field.title="";
                                        }
                                        if(field.fieldType == 'inputRich' ){
                                            field.valid=true;
                                            field.labelVisible=true;
                                            field.disabledCategories=[];                                            
                                        }
                                        var opts = picklistSlotsJ[field.APIName];
                                        if(opts && opts.length > 0){
                                            field.picklistOptions = opts;
                                        }
                                        if(customSlots){
                                            this.initCustomFields(customSlots[field.APIName],field,initializers);    
                                        }
                                        if(field.dataType == 'REFERENCE'  && $A.util.isEmpty(field.IconName) ){
                                            field.IconName = 'custom:custom5';
                                        }
                                    });
                                    
                                }
                            }
                            
                            if(section.col2){
                                var fields=section.col2.fields;
                                if(fields){
                                    fields.forEach(field=>{                                        
                                        if(field.fieldType == 'checkbox' && $A.util.isEmpty(component.get('v.recordId'))){
                                            field.value = false;
                                        }
                                        if(field.fieldType == 'multipicklist' ){
                                            field.selectedLabel="Available";
                                            field.sourceLabel="Selected";
                                        }
                                        if(field.fieldType == 'location' ){
                                            field.title="";
                                        }
                                        if(field.fieldType == 'inputRich' ){
                                            field.valid=true;
                                            field.labelVisible=true;
                                            field.disabledCategories=[];
                                        }
                                        var opts = picklistSlotsJ[field.APIName];
                                        if(opts && opts.length > 0){
                                            field.picklistOptions = opts;
                                        }
                                        if(customSlots){
                                            this.initCustomFields(customSlots[field.APIName],field,initializers);
                                        }     
                                        
                                        if(field.dataType == 'REFERENCE'  && $A.util.isEmpty(field.IconName) ){
                                            field.IconName = 'custom:custom5';
                                        }
                                    });                                    
                                }
                            }
                        });
                    }

                }
                
            });
        }
        console.log('layoutWrp->'+JSON.stringify(layoutWrp));
        component.set("v.layoutWrp",layoutWrp);
        if(initializers){
           for(var key in initializers){
               var fld = initializers[key];
               var init = customSlots[key];
               if(init){
                   init = init['init'];
               }
               if(init){
                init(component,event,this,fld);
               }
           }
        }
    
},
 validateReqFields : function(component, idsTocheck){
    var validIntr = component.find(idsTocheck).reduce(function (validSoFar, inputCmp) {
        inputCmp.showHelpMessageIfInvalid();
        return validSoFar && inputCmp.get('v.validity').valid;
    }, true);
    return validIntr;
},
updateElement : function(component,element){
    var layoutWrp = component.get('v.layoutWrp');
    var found = false;
    if(layoutWrp.sections){
        layoutWrp.sections.forEach(section=>{
            if(section.col1){
                var fields=section.col1.fields;
                if(fields){
                    fields.forEach(field=>{
                        if(!found){
                            if(element && element.APIName == field.APIName){
                                field = element;
                                found = true;
                            }
                        }
                    });                    
                }
            }
            if(section.col2){
                var fields=section.col2.fields;
                if(fields){
                    fields.forEach(field=>{
                        if(!found){
                            if(element && element.APIName == field.APIName){
                                field = element;
                                found = true;
                            }
                        }
                    });                    
                }
            }
        });
    }    
    if(found){  
        console.log('updating element');
        component.set("v.layoutWrp",layoutWrp);
    }  
},
    /*updateElement : function(component,element){
    var layoutWrp = component.get('v.layoutWrp');
    var found = false;
    for(var i in layoutWrp.sections){
        if(layoutWrp.sections[i].col1){
            var fields=layoutWrp.sections[i].col1.fields;
            if(fields){
                for(var j in fields){
                    if(!found){
                        if(element.APIName == fields[j].APIName){
                            fields[j] = element;
                            found == true;
                            break;
                        }
                    }
                    else{
                        break;
                    }
                }
            }
        }
        if(layoutWrp.sections[i].col2){
            var fields=layoutWrp.sections[i].col2.fields;
            if(fields){
                for(var j in fields){
                    if(!found){
                        if(element.APIName == fields[j].APIName){
                            fields[j] = element;
                            found == true;
                            break;
                        }
                    }
                    else{
                        break;
                    }
                }
            }
        }
    }    
    component.set("v.layoutWrp",layoutWrp);   
},*/
updateElements : function(component,elementMap){
    console.log('in update fields');
    var layoutWrp = component.get('v.layoutWrp');
    var found = false;
    if(layoutWrp.sections){
        layoutWrp.sections.forEach(section=>{
            if(section.col1){
                var fields=section.col1.fields;
                if(fields){
                    fields.forEach(field=>{
                        var element = elementMap[field.APIName];
                        if(element && element.APIName == field.APIName){
                            field = element;
                            found = true;
                        }
                    });                    
                }
            }
            if(section.col2){
                var fields=section.col2.fields;
                if(fields){
                    fields.forEach(field=>{
                        var element = elementMap[field.APIName];
                        if(element && element.APIName == field.APIName){
                            field = element;
                            found = true;
                        }
                    });                    
                }
            }
        });
    }
    if(found){
        console.log('update fields');
        component.set("v.layoutWrp",layoutWrp);
    } 
else{
    console.log('not found');
}
},
initCustomFields : function(target,field,initializers){
	if(target){
		var pat = target['pattern'];
		var visible = target['visible'];
		var val = target['value'];
		var onfocus = target['onfocus'];
		var editable = target['editable'];
		var label = target['label'];
		var fieldType = target['fieldType'];
		var required = target['required'];
		var onblur = target['onblur'];
		var onchange = target['onchange'];
		var init = target['init'];
        var extraFields = target['extraFields'];
        var maxResults = target['maxResults'];
        var accesskey = target['accesskey' ];
        var autocomplete = target['autocomplete' ];
        var dateStyle = target['dateStyle' ];
        var fieldLevelHelp = target['fieldLevelHelp' ];
        var formatter = target['formatter' ];
        var isLoading = target['isLoading' ];
        var max = target['max' ];
        var maxlength = target['maxlength' ];
        var messageToggleActive = target['messageToggleActive' ];
        var messageToggleInactive = target['messageToggleInactive' ];
        var messageWhenBadInput = target['messageWhenBadInput' ];
        var messageWhenPatternMismatch = target['messageWhenPatternMismatch' ];
        var messageWhenRangeOverflow = target['messageWhenRangeOverflow' ];
        var messageWhenRangeUnderflow = target['messageWhenRangeUnderflow' ];
        var messageWhenStepMismatch = target['messageWhenStepMismatch' ];
        var messageWhenTooLong = target['messageWhenTooLong' ];
        var messageWhenTooShort = target['messageWhenTooShort' ];
        var messageWhenTypeMismatch = target['messageWhenTypeMismatch' ];
        var messageWhenValueMissing = target['messageWhenValueMissing' ];
        var min = target['min' ];
        var minlength = target['minlength' ];
        var multiple = target['multiple' ];
        var placeholder = target['placeholder' ];
        var selectionEnd = target['selectionEnd' ];
        var selectionStart = target['selectionStart' ];
        var step = target['step' ];
        var tabindex = target['tabindex' ];
        var timeStyle = target['timeStyle' ];
        var timezone = target['timezone' ];
        var title = target['title' ];
        var variant = target['variant' ];
        var IconName = target['IconName'];
        var addButtonLabel = target['addButtonLabel'];
        var disableReordering = target['disableReordering'];
        var downButtonLabel = target['downButtonLabel'];
        var removeButtonLabel = target['removeButtonLabel'];
        var requiredOptions = target['requiredOptions'];
        var selectedLabel = target['selectedLabel'];
        var showActivityIndicator = target['showActivityIndicator'];
        var size = target['size'];
        var sourceLabel = target['sourceLabel'];
        var upButtonLabel = target['upButtonLabel'];
        var validity = target['validity'];
        var ariaDescribedby = target['ariaDescribedby'];
        var ariaLabel = target['ariaLabel'];
        var ariaLabelledby = target['ariaLabelledby'];
        var disabledCategories = target['disabledCategories'];
        var formats = target['formats'];
        var labelVisible = target['labelVisible'];
        var valid = target['valid'];
        
        if(ariaDescribedby){ field.ariaDescribedby=ariaDescribedby;}
        if(ariaLabel){ field.ariaLabel=ariaLabel;}
        if(ariaLabelledby){ field.ariaLabelledby=ariaLabelledby;}
        if(disabledCategories){ field.disabledCategories=disabledCategories;}
        if(formats){ field.formats=formats;}
        if(!$A.util.isUndefinedOrNull(labelVisible)){ field.labelVisible=labelVisible;}
        if(!$A.util.isUndefinedOrNull(valid)){ field.valid=valid;}
        if(addButtonLabel){ field.addButtonLabel=addButtonLabel;}
        if(!$A.util.isUndefinedOrNull(disableReordering)){ field.disableReordering=disableReordering;}
        if(downButtonLabel){ field.downButtonLabel=downButtonLabel;}
        if(removeButtonLabel){ field.removeButtonLabel=removeButtonLabel;}
        if(requiredOptions){ field.requiredOptions=requiredOptions;}
        if(selectedLabel){ field.selectedLabel=selectedLabel;}
        if(!$A.util.isUndefinedOrNull(showActivityIndicator)){ field.showActivityIndicator=showActivityIndicator;}
        if(size){ field.size=size;}
        if(sourceLabel){ field.sourceLabel=sourceLabel;}
        if(upButtonLabel){ field.upButtonLabel=upButtonLabel;}
        if(validity){ field.validity=validity;}
        if(IconName){ field.IconName=IconName;}
        if(accesskey){ field.accesskey = accesskey ;}else{ field.accesskey = null ;}
        if(autocomplete){ field.autocomplete = autocomplete ;}else{ field.autocomplete = null ;}
        if(dateStyle){ field.dateStyle = dateStyle ;}else{ field.dateStyle = null ;}
        if(fieldLevelHelp){ field.fieldLevelHelp = fieldLevelHelp ;}else{ field.fieldLevelHelp = null ;}
        if(formatter){ field.formatter = formatter ;}else{ field.formatter = null ;}
        if(isLoading == true || isLoading == false){ field.isLoading = isLoading ;}else{ field.isLoading = null ;}
        if(max){ field.max = max ;}else{ field.max = null ;}
        if(maxlength){ field.maxlength = maxlength ;}else{ field.maxlength = null ;}
        if(messageToggleActive){ field.messageToggleActive = messageToggleActive ;}else{ field.messageToggleActive = null ;}
        if(messageToggleInactive){ field.messageToggleInactive = messageToggleInactive ;}else{ field.messageToggleInactive = null ;}
        if(messageWhenBadInput){ field.messageWhenBadInput = messageWhenBadInput ;}else{ field.messageWhenBadInput = null ;}
        if(messageWhenPatternMismatch){ field.messageWhenPatternMismatch = messageWhenPatternMismatch ;}else{ field.messageWhenPatternMismatch = null ;}
        if(messageWhenRangeOverflow){ field.messageWhenRangeOverflow = messageWhenRangeOverflow ;}else{ field.messageWhenRangeOverflow = null ;}
        if(messageWhenRangeUnderflow){ field.messageWhenRangeUnderflow = messageWhenRangeUnderflow ;}else{ field.messageWhenRangeUnderflow = null ;}
        if(messageWhenStepMismatch){ field.messageWhenStepMismatch = messageWhenStepMismatch ;}else{ field.messageWhenStepMismatch = null ;}
        if(messageWhenTooLong){ field.messageWhenTooLong = messageWhenTooLong ;}else{ field.messageWhenTooLong = null ;}
        if(messageWhenTooShort){ field.messageWhenTooShort = messageWhenTooShort ;}else{ field.messageWhenTooShort = null ;}
        if(messageWhenTypeMismatch){ field.messageWhenTypeMismatch = messageWhenTypeMismatch ;}else{ field.messageWhenTypeMismatch = null ;}
        if(messageWhenValueMissing){ field.messageWhenValueMissing = messageWhenValueMissing ;}else{ field.messageWhenValueMissing = null ;}
        if(min){ field.min = min ;}else{ field.min = null ;}
        if(minlength){ field.minlength = minlength ;}else{ field.minlength = null ;}
        if(multiple == true || multiple == false){ field.multiple = multiple ;}else{ field.multiple = null ;}
        if(placeholder){ field.placeholder = placeholder ;}else{ field.placeholder = null ;}
        if(selectionEnd){ field.selectionEnd = selectionEnd ;}
        if(selectionStart){ field.selectionStart = selectionStart ;}
        if(step){ field.step = step ;}else{ field.step = null ;}
        if(tabindex){ field.tabindex = tabindex ;}else{ field.tabindex = null ;}
        if(timeStyle){ field.timeStyle = timeStyle ;}else{ field.timeStyle = null ;}
        if(timezone){ field.timezone = timezone ;}else{ field.timezone = null ;}
        if(title){ field.title = title ;}else{ field.title = null ;}
        if(variant){ field.variant = variant ;}else{ field.variant = null ;}
		if(pat){ field.pattern = pat; } else { field.pattern = null }
		if(extraFields){ field.extraFields = extraFields; } else { field.extraFields = null }
        if(maxResults){ field.maxResults = maxResults; } else { field.maxResults = null }
		if(visible == false || visible == true){ field.visible = visible; }

		if(!field.value && field.fieldType != 'checkbox'){
			if(val){field.value = val;}
		} else if(field.fieldType == 'checkbox' && (val == true || val == false)){field.value = val;}

		if(onfocus){ field.onfocus = onfocus; }		
		if(editable == false || editable){ field.editable = editable; }		
		if(label){ field.label = label; }		
		if(fieldType){ field.fieldType = fieldType; }		
		if(required == false || required){ field.required = required; }		
		if(onblur){ field.onblur = onblur; }		
		if(onchange){ field.onchange = onchange; }
		if(init){initializers[field.APIName] = field;}		
	}
}
})