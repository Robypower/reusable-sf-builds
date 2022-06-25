public without sharing class ReusableLayoutCtrl {
    
    @AuraEnabled
    public static LayoutWrapper getLayoutWrp(String recordId,String objName,String layoutName,String customSlots){
        Map<String,String> slotsMap = new Map<String,String>();
        if(String.isNotBlank(customSlots)){
            slotsMap = (Map<String,String>) JSON.deserialize(customSlots, Map<String,String>.class);
        }
        List<Schema.DescribeSObjectResult> describeSobjectsResult = Schema.describeSObjects(new List<String>{objName});
        Map<String, Schema.SObjectField> allFields = describeSobjectsResult[0].fields.getMap();
        Set<String> fieldSet = new Set<String>();
        Map<String,LayoutWrapper.Field> picklistMap = new Map<String,LayoutWrapper.Field>();
        Map<String,LayoutWrapper.Field> controllerMap = new Map<String,LayoutWrapper.Field>();
        Map<String,LayoutWrapper.Field> allFieldMap = new Map<String,LayoutWrapper.Field>();
        Map<String,String> relatedFldMap = new Map<String,String>();
        Map<String,List<String>> extraFldMap = new Map<String,List<String>>();        
        LayoutWrapper layoutWrp = new LayoutWrapper();
        List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(Metadata.MetadataType.Layout,new List<String> {objName+'-'+layoutName});//Account Layout
        Metadata.Layout layoutMd = (Metadata.Layout)layouts.get(0);
        List<LayoutWrapper.Section> sections = new List<LayoutWrapper.Section>();
        for (Metadata.LayoutSection section : layoutMd.layoutSections) {  
            if('Custom Links'.equals(section.label)){
                continue;
            }
            Boolean editableFound = false;
            LayoutWrapper.Section sec = new LayoutWrapper.Section();
            sec.name = section.label;
            for (Metadata.LayoutColumn column : section.layoutColumns) {
                LayoutWrapper.Column col = new LayoutWrapper.Column();
                if (column.layoutItems != null) {
                    List<LayoutWrapper.Field> fields = new List<LayoutWrapper.Field>();
                    for (Metadata.LayoutItem item : column.layoutItems) {
                        if(item != null && String.isNotBlank(item.field)){
                            Schema.DescribeFieldResult fieldData = allFields.get(item.field).getDescribe();
                            LayoutWrapper.Field fld = new LayoutWrapper.Field();                            
                            fld.APIName = item.field; 
                            fld.dataType = String.valueOf(fieldData.getType());
                                             
                            fld.fieldType = getDataType(fieldData.getType());
                            if('address'.equals(fld.fieldType) ){
                                continue;
                            }
                            if(fieldData.getType() == Schema.DisplayType.TEXTAREA && fieldData.isHtmlFormatted()){
                                fld.fieldType = 'inputRich';
                                fld.formats = new List<String>{'font', 'size', 'bold', 'italic', 'underline', 'strike','list', 'indent', 'align', 'link', 'image', 'clean', 'table','header', 'color', 'background', 'code', 'code-block', 'script','blockquote','direction'};
                            }
                            if(fieldData.getType() == Schema.DisplayType.CURRENCY){
                                fld.formatter = 'currency';
                            }
                            if('REFERENCE'.equals(fld.dataType)){
                                fld.fieldType = 'reference';
                                String apiN = item.field.removeEnd('__c');
                                fieldSet.add(fieldData.getRelationshipName()+'.Name');
                                relatedFldMap.put(item.field,fieldData.getRelationshipName());
                                String refListStr = slotsMap.get(item.field);
                                if(String.isNotBlank(refListStr)){
                                    extraFldMap.put(item.field,refListStr.split(','));
                                    for(String refFld:refListStr.split(',')){
                                        fieldSet.add(fieldData.getRelationshipName()+'.'+refFld);
                                    }
                                }
                            }
                            if('location'.equals(fld.fieldType)){
                                String apiN = item.field.removeEnd('c');
                                fieldSet.add(apiN+'Latitude__s');
                                fieldSet.add(apiN+'Longitude__s');
                            }
                            else{
                                fieldSet.add(item.field);
                            }
                            fld.label = fieldData.getLabel();                            
                            List <Schema.sObjectType> tempList = fieldData.referenceto;
                            if(tempList != null && tempList.size()>0){
                            	fld.referenceto = String.valueOf( tempList.get(0));
                            }
                            
                            switch on item.behavior{
                                when Edit{
                                    editableFound = true;
                                    fld.editable=true;
                                    fld.required=false;
                                }
                                when Readonly{
                                    fld.editable=false;
                                    fld.required=false;
                                }
                                when Required{
                                    editableFound = true;
                                    fld.editable=true;
                                    fld.required=true;
                                }
                            }
                            if('PICKLIST' == String.valueOf(fieldData.getType()) || 'MULTIPICKLIST' == String.valueOf(fieldData.getType()) || 'Boolean' == String.valueOf(fieldData.getType()) ){
                                controllerMap.put(item.field,fld);                               
                                if(fieldData.getController()!=null){
                                    picklistMap.put(String.valueOf(fieldData.getController()),fld);
                                    fld.isDependent=true;
                                    fld.masterField = String.valueOf(fieldData.getController());
                                    Schema.SObjectField ctrlField = allFields.get(String.valueOf(fieldData.getController()));
                                    List<Schema.PicklistEntry> contrEntries = ctrlField.getDescribe().getPicklistValues();                                    
                                    List<PicklistEntryWrapper> depEntries = wrapPicklistEntries(fieldData.getPicklistValues());                                    
                                    List<String> controllingValues = new List<String>();
                                    Boolean chbkCtrl = false;
                                    if( 'Boolean' == String.valueOf(ctrlField.getDescribe().getType()) ){
                                        controllingValues.add('true');
                                        controllingValues.add('false');
                                        fld.picklistMap.put('true', new List<LayoutWrapper.PicklistOption>());
                                        fld.picklistMap.put('false', new List<LayoutWrapper.PicklistOption>());
                                        chbkCtrl = true;
                                    }
                                    for (Schema.PicklistEntry ple1 : contrEntries) {
                                        String label = ple1.getLabel();
                                        fld.picklistMap.put(label, new List<LayoutWrapper.PicklistOption>());
                                        controllingValues.add(label);
                                    }
                                    for (PicklistEntryWrapper plew : depEntries) {
                                        String validForBits = base64ToBits(plew.validFor);
                                        for (Integer i = 0; i < validForBits.length(); i++) {
                                            String bit = validForBits.mid(i, 1);
                                            if (bit == '1') {
                                                System.debug('controllingValues->'+controllingValues);
                                                fld.picklistMap.get(controllingValues.get(i)).add(new LayoutWrapper.PicklistOption(plew.label,plew.value));
                                            }
                                        }
                                    }
                                    if(chbkCtrl){
                                        List<LayoutWrapper.PicklistOption> tmp = fld.picklistMap.get('true');
                                        fld.picklistMap.put('true',fld.picklistMap.get('false'));
                                        fld.picklistMap.put('false',tmp);
                                    }
                                }
                                else{                                    
                                    List<Schema.PicklistEntry> ple = fieldData.getPicklistValues();
                                    for( Schema.PicklistEntry pickOption : ple){
                                        
                                        fld.picklistOptions.add(new LayoutWrapper.PicklistOption(pickOption.getLabel(),pickOption.getValue()));
                                    }
                                }                                
                            }
                            fields.add(fld);                            
                            if('location'.equals(fld.fieldType)){
                                String apiN = item.field.removeEnd('c');
                                allFieldMap.put(apiN+'Latitude__s',fld);
                                allFieldMap.put(apiN+'Longitude__s',fld);                                
                            }
                            else{
                                allFieldMap.put(item.field,fld);
                            } 
                        }                                                
                    }
                    col.fields = fields;
                }
                if(sec.col1== null){
                    sec.col1 = col;
                }
                else if(sec.col2== null){
                    sec.col2 = col;
                }                
            }
            if( (sec.col1.fields.size() > 0 || sec.col2.fields.size() > 0) && editableFound ){
                sections.add(sec);
            }
        }
        layoutWrp.sections = sections;
        for(String key:controllerMap.keySet()){            
            LayoutWrapper.Field dependent = picklistMap.get(key);
            LayoutWrapper.Field master = controllerMap.get(key);
            if(dependent != null && dependent.isDependent && master != null){
                master.isMaster = true;
                master.dependentField = dependent.APIName;
            }            
        }
        if(String.isNotBlank(recordId)){
            fieldSet.add('Id');
            String query='SELECT '+String.join(new List<String>(fieldSet),',')+' FROM '+objName+' WHERE Id=\''+recordId+'\'';
            List<sObject> records=Database.query(query);
            if(records.size()>0){
                layoutWrp.record = records[0];
                for(String name:fieldSet){
                    LayoutWrapper.Field fld=allFieldMap.get(name);
                    if(fld!=null){
                        if('address'.equals(fld.fieldType)){
                            if(records[0].get(name) != null){
                            Address a = (Address) records[0].get(name);
                            LayoutWrapper.Address add = new LayoutWrapper.Address();
                            add.city = a.getCity();
                            add.country = a.getCountry();
                            add.postalCode = a.getPostalCode();
                            add.province = a.getState();
                            add.street = a.getStreet();
                            fld.address = add;
                            }
                        }
                        else if('location'.equals(fld.fieldType)){
                            String apiN = fld.APIName.removeEnd('c');                            
                            fld.latitude = ''+records[0].get(apiN+'Latitude__s');
                            fld.longitude = ''+ records[0].get(apiN+'Longitude__s');
                        }
                        else if('multipicklist'.equals(fld.fieldType)){
                            String str = (String) records[0].get(name);
                            if(String.isNotBlank(str)){
                            fld.values.addAll(str.split(';'));
                            }
                        }                        
                        else if('time'.equals(fld.fieldType)){
                            fld.value=''+records[0].get(name);
                        }
                        else{
                           fld.value=records[0].get(name); 
                        }
                        if('REFERENCE'.equals(fld.dataType)){
                            String relName = relatedFldMap.get(fld.APIName); 
                            SObject relObj = records[0].getSObject(relName);                          
                             if(relObj != null){
                            	fld.lookupRecordName=''+relObj.get('Name');
                            }
                            Map<String,Object> lookupObj = new Map<String,Object>();
                            if(extraFldMap != null){
                                if(extraFldMap.get(fld.APIName) != null){
                                    for(String extFld:extraFldMap.get(fld.APIName)){
                                        if(relObj != null){
                                            lookupObj.put(extFld,relObj.get(extFld));
                                        }                                     
                                    }
                                }
                            }                            
                            if(lookupObj.size()>0){
                                fld.lookupObjStr = JSON.serialize(lookupObj);
                            }

                        }
                        
                    }
                }  
            } 
        }
        return layoutWrp;
    } 
    
   
    
    public static String getDataType(Schema.DisplayType fldType){
        switch on fldType{
            when String,ID{
                return 'text';
            }
            when TextArea,base64{
                return 'textarea';
            }
            when address{
                return 'address';
            }
            when Boolean{
                return 'checkbox';
            }
            when Date{
                return 'date';
            }
            when DateTime{
                return 'datetime';
            }
            when Time{
                return 'time';
            }
            when Phone{
                return 'tel';
            }
            when Double,Integer,Long,Percent,CURRENCY{
                return 'number';
            }
            when Picklist{
                return 'picklist';
            }
            when Reference{
                return 'text';
            }
            when Email{
                return 'email';
            }
            when URL{
                return 'url';
            }
            when MULTIPICKLIST{
                return 'multipicklist';
            }
            when ENCRYPTEDSTRING{
                return 'password';
            }
            when LOCATION{
                return 'location';
            }
        }
        return 'text';
    }
    
    @AuraEnabled
    public static List<sObject> fetchLookUpValuesGeneric(String searchKeyWord, String ObjectName,String extraFields,String maxResults,Boolean noLimit) {
        String searchKey = searchKeyWord + '%';
        searchKey = String.escapeSingleQuotes(searchKey);
        maxResults = String.escapeSingleQuotes(maxResults);
        List<sObject> returnList = new List<sObject>();      
        String sQuery =  'select id, Name from ' +ObjectName + ' where Name LIKE: searchKey order by createdDate DESC limit '+ ( noLimit?'40000': maxResults);
        if(String.isNotBlank(extraFields)){
            sQuery =  'select id, Name,'+extraFields+' from ' +ObjectName + ' where Name LIKE: searchKey order by createdDate DESC limit '+( noLimit?'40000': maxResults);
        }
        List<sObject> lstOfRecords = Database.query(sQuery);        
        for (sObject obj: lstOfRecords) {
            returnList.add(obj);
        }
        return returnList;
    }
    
    
    public static String decimalToBinary(Integer val) {
        String bits = '';
        while (val > 0) {
            Integer remainder = Math.mod(val, 2);
            val = Integer.valueOf(Math.floor(val / 2));
            bits = String.valueOf(remainder) + bits;
        }
        return bits;
    }
    public static string getType(Object o) {
        if(o==null) return '';              // we can't say much about null with our current techniques
        if(o instanceof SObject)            return ((SObject)o).getSObjectType().getDescribe().getName()+''; 
        if(o instanceof Boolean)            return 'Boolean';
        if(o instanceof Id)                 return 'Id';
        if(o instanceof String)             return 'String';
        if(o instanceof Blob)               return 'Blob';
        if(o instanceof Date)               return 'Date';
        if(o instanceof Datetime)           return 'Datetime';
        if(o instanceof Time)               return 'Time';
        if(o instanceof String)             return 'String';
        if(o instanceof Integer)            return 'Integer';
        if(o instanceof Long)               return 'Long';
        if(o instanceof Decimal)            return 'Decimal';  // we can't distinguish between decimal and double
        if(o instanceof Double)             return 'Double';   // we can't distinguish between decimal and double
        if(o instanceof List<object>)       return 'List';
        return 'Object';                    // actually we can't detect maps and sets and maps
    }
    public static String base64ToBits(String validFor) {
        if (String.isEmpty(validFor)) return '';
        
        String validForBits = '';
        
        for (Integer i = 0; i < validFor.length(); i++) {
            String thisChar = validFor.mid(i, 1);
            Integer val = base64Chars.indexOf(thisChar);
            String bits = decimalToBinary(val).leftPad(6, '0');
            validForBits += bits;
        }
        
        return validForBits;
    }
    
    private static final String base64Chars = '' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        'abcdefghijklmnopqrstuvwxyz' +
        '0123456789+/';
    
    
    private static List<PicklistEntryWrapper> wrapPicklistEntries(List<Schema.PicklistEntry> PLEs) {
        return (List<PicklistEntryWrapper>)
            JSON.deserialize(JSON.serialize(PLEs), List<PicklistEntryWrapper>.class);
    }
    public class PicklistEntryWrapper{
        public String active {get;set;}
        public String defaultValue {get;set;}
        public String label {get;set;}
        public String value {get;set;}
        public String validFor {get;set;}
        public PicklistEntryWrapper(){            
        }        
    }
    
}