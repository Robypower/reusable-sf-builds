({
	doInit : function(component, event, helper) {
        component.set('v.isSpinner',true);
        var customSlots = component.get('v.customSlots');
        var custSl = {};
        if(customSlots){            
            for(var i in customSlots){
                if(i && customSlots[i]){
                    var extraFields = customSlots[i]['extraFields'];
                    if(extraFields){
                        custSl[i] = extraFields;
                    }
                }
            }
        }
        custSl = JSON.stringify(custSl);
        helper.apexCall(component,event,
                        'getLayoutWrp',
                        {recordId:component.get('v.recordId'),objName:component.get('v.sObject'),layoutName:component.get('v.layoutname'),customSlots:custSl},
                        function(errors,result){
                            component.set('v.isSpinner',false);
                            if(!errors && result){                                
                                helper.initalizeComponent(component,event,result);
                            }
        });
	},
    saveRecord : function(component, event, helper){
        var valid = helper.validateReqFields(component,"formInput");
        if(!valid){
            helper.displayMessage(component,'ErrorToast1', 'errormsg1','Please fill all required fields.');
            return;
        }
        var fieldList = [],disabledFields = [];
        var layoutWrp = component.get('v.layoutWrp');
        var rec = layoutWrp.record;
        if($A.util.isEmpty(component.get('v.recordId')) ){
            rec = {};
        }
        if($A.util.isEmpty(rec) && !$A.util.isEmpty(component.get('v.recordId')) ){
            rec = {'Id':component.get('v.recordId')};
        }
        var fields = helper.getAllFields(component,event);
       
        for(var j in fields){
           if(fields[j].visible){
            var val = fields[j].value;
            if(!j || j == 'remove' || !fields[j]){
                continue;
            }
            if(fields[j].fieldType == "multipicklist"){                
                var lst = fields[j].values;
                if(lst){
                    val = lst.join(';');
                }
            }
            if(fields[j].required && ( (!val && fields[j].fieldType != "location") || ( fields[j].fieldType == "location" && (!fields[j].latitude || !fields[j].longitude ) ) ) ){
                valid = false;
                break;
            }
            if(fields[j].fieldType == "location"){                 
                let locAPI = fields[j].APIName.slice(0, -1);                
                rec[locAPI+'Latitude__s'] = fields[j].latitude;
                rec[locAPI+'Longitude__s'] = fields[j].longitude;
                delete rec[fields[j].APIName];                
                continue;                
            }
               fieldList.push(fields[j].APIName);
               if(!fields[j].editable){
                   disabledFields.push(fields[j].APIName);
                   delete rec[fields[j].APIName];                
                	continue; 
               }
               
               
               
            if(fields[j].fieldType == "time"){ 
                var ch = val.substr(val.length - 1);
                if(ch != 'Z'){
                    val=val+'Z';
                }                
            }            
            if(fields[j].dataType == "INTEGER" && val){
                rec[fields[j].APIName] = parseInt(val);
            }            
            else if(val){
                rec[fields[j].APIName] = val;
            }
            else{
                if(fields[j] && fields[j].fieldType == 'checkbox'){
                    rec[fields[j].APIName] = false;
                }
                else{
                    rec[fields[j].APIName] = null;
                }
            }
            if(fields[j].fieldType == 'address'){
                var add = {};
                var address = fields[j].address;
                add['city'] = address['city'];
                add['street'] = address['street'];
                add['country'] = address['country'];
                add['state'] = address['province'];
                add['postalCode'] = address['postalCode'];
                rec[fields[j].APIName] = add;
            }
        }
        else{
            delete rec[fields[j].APIName];
        }
        }     
        if(!valid){
            helper.displayMessage(component,'ErrorToast1', 'errormsg1','Please fill all required fields.');
            return;
        }
		component.set('v.fieldNames',fieldList);
        component.set('v.disabledFieldNames',disabledFields);
        return rec;
    },
    onPicklistChange : function(component, event, helper){
        var targetField = event.getSource().get("v.name");
        if(targetField && targetField.isMaster && targetField.dependentField ){       
            var layoutWrp = component.get('v.layoutWrp');
            for(var i in layoutWrp.sections){
                if(layoutWrp.sections[i].col1){
                   var fields=layoutWrp.sections[i].col1.fields; 
                   if(fields){
                        for(var j in fields){
                            if(fields[j].APIName == targetField.dependentField && fields[j].picklistMap){
                                fields[j].picklistOptions = fields[j].picklistMap[targetField.value];
                                if(fields[j].fieldType == 'multipicklist' && fields[j].values && fields[j].picklistOptions){                                    
                                    let values =[];
                                    fields[j].picklistOptions.forEach(opt=>{
                                        if(fields[j].values.includes(opt.value)){
                                            values.push(opt.value);
                                        }
                                    });
                                    fields[j].values = values;
                                }
                                break;
                            }
                        }
                    }
                }
                if(layoutWrp.sections[i].col2){
                    var fields=layoutWrp.sections[i].col2.fields; 
                    if(fields){
                         for(var k in fields){
                             if(fields[k].APIName == targetField.dependentField && fields[k].picklistMap){
                                 fields[k].picklistOptions = fields[k].picklistMap[targetField.value];
                                 if(fields[k].fieldType == 'multipicklist' && fields[k].values && fields[k].picklistOptions){
                                    let values =[];
                                    fields[k].picklistOptions.forEach(opt=>{
                                        if(fields[k].values.includes(opt.value)){
                                            values.push(opt.value);
                                        }
                                    });
                                    fields[k].values = values;
                                }
                                 break;
                             }
                         }
                     }
                 }
            }
            component.set("v.layoutWrp",layoutWrp);
        }
        if(targetField && targetField.onchange){
            targetField.onchange(component,event,helper);
        }
    },
    onfocus : function(component,event,helper){
        var targetField = event.getSource().get("v.name");
        if(targetField && targetField.onfocus){
            targetField.onfocus(component,event,helper);
        }
        else{
            targetField = event.getSource().get("v.shareWithEntityId");
            if(targetField && targetField.onfocus){
                targetField.onfocus(component,event,helper);
                return;
            }
            targetField = event.getSource().get("v.fieldLevelHelp");
            if(targetField && targetField.onfocus){
                targetField.onfocus(component,event,helper);
            }            
        }
    },
    onblur : function(component,event,helper){
        var targetField = event.getSource().get("v.name");
        if(targetField && targetField.onblur){
            targetField.onblur(component,event,helper);
        }
        else{
            targetField = event.getSource().get("v.shareWithEntityId");
            if(targetField && targetField.onblur){
                targetField.onblur(component,event,helper);
                return;
            }
            targetField = event.getSource().get("v.fieldLevelHelp");
            if(targetField && targetField.onblur){
                targetField.onblur(component,event,helper);
            }
        }
    },
    onchange : function(component,event,helper){
        var targetField = event.getSource().get("v.name");
        if(targetField && targetField.onchange){
            targetField.onchange(component,event,helper);
        }
        else{
            targetField = event.getSource().get("v.shareWithEntityId");
            if(targetField && targetField.onchange){
                targetField.onchange(component,event,helper);
                return;
            }
            
            targetField = event.getSource().get("v.fieldLevelHelp");
            if(targetField && targetField.onchange){
                targetField.onchange(component,event,helper);
            }            
        }
    },
    getAllFieldsMap : function(component,event,helper){
        return helper.getAllFieldsMap(component, event);
    },
    updateRecord : function(component,event,helper){
        var params = event.getParam('arguments');
        if (params) {
            var record = params.record;
            var disabledFieldNames = component.get("v.disabledFieldNames");
            if(record && disabledFieldNames && disabledFieldNames.length >0){
                var fieldMap = helper.getAllFieldsMap(component, event);
                var fldMap = {};
                disabledFieldNames.forEach(field=>{
                    var fld = fieldMap[field];
                    fld.value = record[fld.APIName];
                    fldMap[fld.APIName]= fld;
                });
                //console.log('update fldMap:'+JSON.stringify(fldMap));
                if(fldMap){
                    helper.updateElements(component,fldMap);
                }
            }
        }
    },
})