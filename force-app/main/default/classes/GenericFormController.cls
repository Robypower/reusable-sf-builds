/**
 * Main controller for Generic Form Application
 *
 * @author      Onkar Pawar <onkar.doc@gmail.com>
 * @version     1.0
 * @since       1.0
 */
public without sharing class GenericFormController {
    
    static Map<String, Schema.SObjectField> allFields;
    /**
    * Returns generated FormWrapper to UI component.
    *
    * <p>Use {@link #validateWrapper(FormWrapper wrapper)} to validate request wrapper.
    *
    * @param wrapper  Request FormWrapper with basic details for Response FormWrapper generation.
    * @return         generated FormWrapper or with appropriate errorMessage in case of failure.
    * @since          1.0
    */
    @AuraEnabled
    public static FormWrapper get_Form_Wrapper(FormWrapper wrapper) {

        if(validateWrapper(wrapper)){ //
            Boolean processedSuccessfully = generate_Form_Wrapper(wrapper);
            
        }

        return wrapper;
    }

    /**
    * Generates FormWrapper from request.
    *
    * @param wrapper  Request FormWrapper with basic details for request parameter generation.
    * @return         true if FormWrapper generated successfully otherwise false and appropriate errorMessage in wrapper.
    * @since          1.0
    */
    public static Boolean generate_Form_Wrapper(FormWrapper wrapper){
        Boolean processedSuccessfully = true;
        try{
            List<Schema.DescribeSObjectResult> describeSobjectsResult = Schema.describeSObjects(new List<String>{wrapper.objectName});
           allFields = describeSobjectsResult[0].fields.getMap();
             /**
            * Page Layout metadata list.
            */
            List<Metadata.Metadata> layouts = Metadata.Operations.retrieve(Metadata.MetadataType.Layout,new List<String> {wrapper.objectName+'-'+wrapper.layoutName});
            Metadata.Layout layoutMd = (Metadata.Layout) layouts.get(0);
            wrapper.layoutSections = new List<LayoutSection>();

            for (Metadata.LayoutSection section : layoutMd.layoutSections) {  
                LayoutSection layoutSection = populate_LayoutSection(section);
                if(layoutSection != null){
                    wrapper.layoutSections.add(layoutSection);
                }
            }

        }catch(Exception e){
            processedSuccessfully = false;
            wrapper.errorMessage = '{"method":"generate_Form_Wrapper","errorMessage":"'+e.getMessage()+'","lineNumber":"'+e.getLineNumber()+'"}';
        }
        return processedSuccessfully;
    }

    /**
    * Populates LayoutSection from Layout Metadata.
    *
    * @param section  Metadata.LayoutSection object.
    * @return         pupulated LayoutSection object.
    * @since          1.0
    */
    public static LayoutSection populate_LayoutSection(Metadata.LayoutSection section){
        LayoutSection layoutSection = new LayoutSection();
        layoutSection.label = section.label;
        Integer columnIndex = 0;
        for (Metadata.LayoutColumn column : section.layoutColumns) {
            LayoutColumn layoutColumn = populate_LayoutColumn(column,++columnIndex);
            if(layoutColumn != null){
                layoutSection.columns.add(layoutColumn);
            }
        }
        return layoutSection;
    }

    /**
    * Populates LayoutColumn from Metadata.LayoutColumn object.
    *
    * @param column         Metadata.LayoutColumn object.
    * @param columnIndex    Defines column position on UI.
    * @return               pupulated LayoutColumn object.
    * @since                1.0
    */
    public static LayoutColumn populate_LayoutColumn(Metadata.LayoutColumn column,Integer columnIndex){
        LayoutColumn layoutColumn = new LayoutColumn();
        layoutColumn.columnIndex = columnIndex;
        layoutColumn.fieldCount = 0;
        layoutColumn.editableFieldFound = false;

        if (column.layoutItems != null) {
            for (Metadata.LayoutItem layoutItem : column.layoutItems) {
                ColumnField columnField  = populate_ColumnField(layoutItem);
                if(columnField != null){
                    layoutColumn.fields.add(columnField);
                }
            }
        }
        return layoutColumn;
    }

    /**
    * Populates ColumnField from Metadata.LayoutItem object.
    *
    * @param layoutItem     Metadata.LayoutItem object.
    * @return               pupulated ColumnField object.
    * @since                1.0
    */
    public static ColumnField populate_ColumnField(Metadata.LayoutItem layoutItem ){
        ColumnField columnField = new ColumnField();
        if(layoutItem != null && String.isNotBlank(layoutItem.field)){
            Schema.DescribeFieldResult fieldData = allFields.get(layoutItem.field).getDescribe();
            columnField.APIName = layoutItem.field;
            columnField.dataType = String.valueOf(fieldData.getType());
            columnField.fieldType = determineUIFieldType(fieldData.getType());
            columnField.label = fieldData.getLabel();
            
            if('address'.equals(columnField.fieldType) ){
                return null; // skiping Address data type for now
            }
            
            if(fieldData.getType() == Schema.DisplayType.TEXTAREA && fieldData.isHtmlFormatted()){
                columnField.fieldType = 'inputRich';
                columnField.formats = new List<String>{'font', 'size', 'bold', 'italic', 'underline', 'strike','list', 'indent', 'align', 'link', 'image', 'clean', 'table','header', 'color', 'background', 'code', 'code-block', 'script','blockquote','direction'};
            }

            if(fieldData.getType() == Schema.DisplayType.CURRENCY){
                columnField.formatter = 'currency';
            }

            if('REFERENCE'.equals(columnField.dataType)){
                // if(fieldData.referenceto != null && fieldData.referenceto.size() > 0){
                //     columnField.referenceto = String.valueOf( fieldData.referenceto.get(0));
                // }
                return null; // skipping lookup field type for now
            }
        }
        return columnField;
    }

    /**
    * Determines UI field type from Schema.DisplayType.
    *
    * @param dataType     Schema.DisplayTypeobject.
    * @return            pupulated UI element field type.
    * @since             1.0
    */
    public static String determineUIFieldType(Schema.DisplayType dataType){
        switch on dataType{
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

    /**
    * Validates FormWrapper request parametewrs.
    *
    * @param wrapper  Request FormWrapper with basic details for request parameter validation.
    * @return         true if required parameters are valid otherwise false and appropriate errorMessage in wrapper.
    * @since          1.0
    */
    static Boolean validateWrapper(FormWrapper wrapper){
        Boolean valid = true;
        if(wrapper != null){
            wrapper.errorMessage = '';
            if(String.isBlank(wrapper.objectName) || String.isBlank(wrapper.layoutName)){
                wrapper.errorMessage = '{"method":"validateWrapper","errorMessage":"Required information missing objectName/layoutName.","lineNumber":""}';
                valid = false;
            }
        }

        if(wrapper == null){
            wrapper = new FormWrapper();
            wrapper.errorMessage = '{"method":"validateWrapper","errorMessage":"Empty request received.","lineNumber":""}';
            valid = false;
        }
        return valid;
    }

  
/**
 * Data Wrapper for Generic Form Application
 *
 * @author      Onkar Pawar <onkar.doc@gmail.com>
 * @version     1.0
 * @since       1.0
 */
    public class FormWrapper{
        /**
        * Request parameter.
        * Salesforce Record Id for Record Edit operation.
        */
        @AuraEnabled
        public String recordId {get;set;}

        /**
        * Required Request parameter.
        * Salesforce sObject Name for New Record/Record Edit operation.
        */
        @AuraEnabled
        public String objectName {get;set;}

        /**
        * Required Request parameter.
        * Salesforce sObject Page Layout Name for New Record/Record Edit operation.
        */
        @AuraEnabled
        public String layoutName {get;set;}

        /**
        * Response parameter.
        * Error message in case of failed operation.
        */
        @AuraEnabled
        public String errorMessage {get;set;}

        /**
        * Response parameter.
        * List of LayoutSection in Page Layout.
        */
        @AuraEnabled
        public List<LayoutSection> layoutSections {get;set;}
    }

    /**
    * LayoutSection Data for FormWrapper
    *
    * @author      Onkar Pawar <onkar.doc@gmail.com>
    * @version     1.0
    * @since       1.0
    */
    public class LayoutSection{
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public Integer fieldCount {get;set;}
        @AuraEnabled
        public Boolean editableFieldFound {get;set;}
        @AuraEnabled
        public List<LayoutColumn> columns {get;set;}
        public LayoutSection(){
            this.columns = new List<LayoutColumn>();
        }
        // public LayoutSection(List<LayoutColumn> columns,String label,Integer fieldCount,Boolean editableFieldFound){
        //     this.columns = columns;
        //     this.label = label;
        //     this.editableFieldFound = editableFieldFound;
        //     this.fieldCount = fieldCount;
        // }
    }

    /**
    * LayoutColumn data for LayoutSection
    *
    * @author      Onkar Pawar <onkar.doc@gmail.com>
    * @version     1.0
    * @since       1.0
    */
    public class LayoutColumn{
        @AuraEnabled
        public Integer columnIndex {get;set;}
        @AuraEnabled
        public Integer fieldCount {get;set;}
        @AuraEnabled
        public Boolean editableFieldFound {get;set;}
        @AuraEnabled
        public List<ColumnField> fields {get;set;}
        public LayoutColumn(){
            this.fields = new List<ColumnField>();
        }
        public LayoutColumn(List<ColumnField> fields){
            this.fields = fields;
        }
    }

    /**
    * ColumnField data for LayoutColumn
    *
    * @author      Onkar Pawar <onkar.doc@gmail.com>
    * @version     1.0
    * @since       1.0
    */
    public class ColumnField{
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public String APIName {get;set;}
        @AuraEnabled
        public String fieldType {get;set;}
        @AuraEnabled
        public Boolean disabled {get;set;}
        @AuraEnabled
        public Boolean required {get;set;}
        @AuraEnabled
        public Boolean visible {get;set;}
        @AuraEnabled
        public List<PicklistItem> picklistOptions {get;set;}
        @AuraEnabled
        public Object value {get;set;}
        @AuraEnabled
        public String masterField {get;set;}
        @AuraEnabled
        public Map<String,List<PicklistItem>> picklistMap {get;set;}
        @AuraEnabled
        public Boolean isDependent {get;set;}
        @AuraEnabled
        public Boolean isMaster {get;set;}
        @AuraEnabled
        public String dependentField {get;set;}
        @AuraEnabled
        public String dataType {get;set;}
        @AuraEnabled
        public String referenceto {get;set;}
        @AuraEnabled
        public AddressFormat address {get;set;}
        @AuraEnabled
        public String formatter {get;set;}
        @AuraEnabled
        public List<String> values {get;set;}
        @AuraEnabled
        public List<String> formats {get;set;}    
        @AuraEnabled
        public String latitude {get;set;}
        @AuraEnabled
        public String longitude {get;set;}
        @AuraEnabled
        public String lookupRecordName {get;set;}
        @AuraEnabled
        public String lookupObjStr {get;set;}           
        public ColumnField(){
            label='';
            APIName='';
            formatter='';
            fieldType='';
            disabled=true;
            visible=true;
            required=true;
            picklistOptions=new List<PicklistItem>();
            value ='';
            masterField ='';
            picklistMap=new Map<String,List<PicklistItem>>();
            isDependent=false;
            isMaster=false;
            dataType='';
            referenceto = '';
            address = new AddressFormat();
            values = new List<String>();
            formats = new List<String>();
            longitude = '';
            latitude = '';
            lookupRecordName = '';
            lookupObjStr = '';
        }   
    }

    /**
    * AddressFormat data for Field
    *
    * @author      Onkar Pawar <onkar.doc@gmail.com>
    * @version     1.0
    * @since       1.0
    */
    public class AddressFormat{
        @AuraEnabled
        public String street {get;set;}
        @AuraEnabled
        public String city {get;set;}
        @AuraEnabled
        public String country {get;set;}
        @AuraEnabled
        public String postalCode {get;set;}
        @AuraEnabled
        public String province {get;set;}
        public AddressFormat(){}
        public AddressFormat(String street,String city,String country,String postalCode,String province){
            this.street=street;
            this.city=city;
            this.country=country;
            this.postalCode=postalCode;
            this.province=province;
        }        
    }

    /**
    * PicklistItem data for Field
    *
    * @author      Onkar Pawar <onkar.doc@gmail.com>
    * @version     1.0
    * @since       1.0
    */
    public class PicklistItem{
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public String value {get;set;}
        public PicklistItem(){}
        public PicklistItem(String label,String value){
            this.label=label;
            this.value=value;
        }
    }
}
