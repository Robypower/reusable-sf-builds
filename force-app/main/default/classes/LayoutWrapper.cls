public without sharing class LayoutWrapper{
    
        @AuraEnabled
        public sObject record {get;set;}
        @AuraEnabled
        public List<Section> sections {get;set;}
        public LayoutWrapper(){
            sections = new List<Section>();            
        }
        public LayoutWrapper(List<Section> sections){
            this.sections = sections;
        }
    
    public class Section{
        @AuraEnabled
        public String name {get;set;}
        @AuraEnabled
        public Column col1 {get;set;}
        @AuraEnabled
        public Column col2 {get;set;}
        public Section(){
            
        }
        public Section(Column col1,Column col2,String name){
            this.col1 = col1;
            this.col2 = col2;
            this.name = name;
        }
    }
    public class Column{
        @AuraEnabled
        public List<Field> fields {get;set;}
        public Column(){
            fields = new List<Field>();
        }
        public Column(List<Field> fields){
            this.fields = fields;
        }
    }
    public class Field{
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public String APIName {get;set;}
        @AuraEnabled
        public String fieldType {get;set;}
        @AuraEnabled
        public Boolean editable {get;set;}
        @AuraEnabled
        public Boolean required {get;set;}
        @AuraEnabled
        public Boolean visible {get;set;}
        @AuraEnabled
        public List<PicklistOption> picklistOptions {get;set;}
        @AuraEnabled
        public Object value {get;set;}
        @AuraEnabled
        public String masterField {get;set;}
        @AuraEnabled
        public Map<String,List<PicklistOption>> picklistMap {get;set;}
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
        public Address address {get;set;}
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
        public Field(){
            label='';
            APIName='';
            formatter='';
            fieldType='';
            editable=true;
            visible=true;
            required=true;
            picklistOptions=new List<PicklistOption>();
            value ='';
            masterField ='';
            picklistMap=new Map<String,List<PicklistOption>>();
            isDependent=false;
            isMaster=false;
            dataType='';
            referenceto = '';
            address = new Address();
            values = new List<String>();
            formats = new List<String>();
            longitude = '';
            latitude = '';
            lookupRecordName = '';
            lookupObjStr = '';
        }        
    }

    public class Address{
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
        public Address(){}
        public Address(String street,String city,String country,String postalCode,String province){
            this.street=street;
            this.city=city;
            this.country=country;
            this.postalCode=postalCode;
            this.province=province;
        }        
    }
    public class PicklistOption{
        @AuraEnabled
        public String label {get;set;}
        @AuraEnabled
        public String value {get;set;}
        public PicklistOption(){}
        public PicklistOption(String label,String value){
            this.label=label;
            this.value=value;
        }
    }
}