jQuery.fn.fsValidator=function(a){settings=jQuery.extend({callback:null},a);var b=new RegExp("fsValidate[[a-zA-Z0-9,()-=]+]"),c=jQuery(this).find(":input[class*=fsValidate],fieldset[class*=fsValidate]");jQuery.each(c,function(){var a=b.exec(jQuery(this).attr("class"));a=a[0].replace("fsValidate[",""),a=a.replace("]",""),jQuery(this).data("validate",a.split(",")),jQuery(this).data("required",jQuery.inArray("required",jQuery(this).data("validate"))>=0)})},jQuery.fn.fsValidateElements=function(a){var a=jQuery.extend({onFail:null,onPass:null,ignore:".null-ignore-placeholder"},a),b={},c={},d=[],e={},f=[],g={},h=jQuery(this).find("[class*=fsValidate]").not(a.ignore);if(jQuery.each(h,function(){var a=jQuery(this),b=jQuery(a).attr("type"),c=!1;void 0==b&&(b=document.getElementById(a.attr("id")).type),!jQuery(a).data("required")&&jQuery(a).val().length>0&&jQuery.inArray(b,fsSpecialTypes)<0?c=!0:jQuery(a).data("required")&&(c=!0),jQuery(a).attr("name")&&jQuery(a).attr("name").indexOf("_disabled")>=0&&(c=!1),c&&jQuery.isArray(jQuery(a).data("validate"))&&jQuery.each(jQuery(a).data("validate"),function(){var c=/fileType\([a-zA-Z0-9\-]+\)/,h=c.test(this),i=/custom\([a-zA-Z0-9\-\=\/]+\)/,j=i.test(this);h||j||(fsValidationRules[this].useColdFusion?(e={},e.elementID=jQuery(a).attr("id"),e.value=jQuery(a).val(),e.rule=this.valueOf(),d.push(e)):(g={},g.elementID=jQuery(a).attr("id"),g.value=jQuery(a).val(),g.rule=this,g.elementType=b,f.push(g))),j&&(g={},g.elementID=jQuery(a).attr("id"),g.value=jQuery(a).val(),g.rule=this,g.elementType=jQuery(a).attr("type"),f.push(g))})}),d.length){var i=jQuery.ajax({url:jsPath+"cf_forms/jquery.finalsiteValidator.cfm",type:"POST",data:{cmd:"fsValidate",items:jQuery.jSONToString(d)},async:!1,dataType:"json"}).responseText;i=jQuery.toJSON(i);for(var j in i)for(var k in i[j])jQuery.isArray(b[j])||(b[j]=[]),b[j].push(fsValidationRules[k].alertMsg)}return f.length&&jQuery.each(f,function(){jQuery.fn.fsValidateValToRule(this.elementType,this.elementID,this.value,this.rule)||(jQuery.isArray(b[this.elementID])||(b[this.elementID]=[]),b[this.elementID].push(0==this.rule.indexOf("custom")?"Validation Error":fsValidationRules[this.rule].alertMsg))}),jQuery.each(d,function(){jQuery.isArray(b[this.elementID])||(c[this.elementID]=!0)}),jQuery.each(f,function(){jQuery.isArray(b[this.elementID])||(c[this.elementID]=!0)}),"function"==typeof a.onPass&&a.onPass(c),"function"!=typeof a.onFail?b:void a.onFail(b)},jQuery.fn.fsValidateValToRule=function(a,b,c,d){var e=!0,f=jQuery("#"+b);if("fieldset"==jQuery(f).tagName()){{jQuery(f).find(":radio[name="+b+"],:checkbox[name="+b+"]")}if("required"==d){var g=jQuery(f).find(":radio[name="+b+"]:checked,:checkbox[name="+b+"]:checked"),h=jQuery(f).find(":radio, :checkbox");!h.length&&console&&console.warn&&console.warn("Finalsite Forms: A required form field is missing inputs.",f),0==g.length&&(e=h.eq(0).attr("name").indexOf("_disabled")>=0)}}else if(jQuery.inArray(a,fsSpecialTypes)<0)if("required"==d)jQuery.trim(c).length||(e=!1);else if(0==d.indexOf("custom")){var i=d.replace("custom(","").replace(")",""),j=$j.base64Decode(i),k=$j.toJSON(j),l="",m="*",n="";switch(k.type){case"alpha":l="a-zA-Z";break;case"alphanumeric":l="a-zA-Z\\d";break;case"numeric":l="\\d";break;case"advanced":l=k.chars;break;case"phrase":}k.len.on&&(m="{"+k.len.min+","+k.len.max+"}"),k.spaces&&"numeric"!=k.type&&(n="\\s");var o=new RegExp("^["+l+n+"]"+m+"$");if("phrase"==k.type){var p=k.validationPhraseText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&");o=1==k["case"]?new RegExp("^"+p+"$"):new RegExp("^"+p+"$","i")}var q=o.test(jQuery.trim(c));q||(e=!1),e&&"numeric"==k.type&&k.num.on&&(isNaN(1*c)||1*c<k.num.min||1*c>k.num.max)&&(e=!1)}else e=fsValidationRules[d].regex.test(jQuery.trim(c));else if("required"==d)switch(a){case"radio":var r=jQuery(f).parents("form"),s=jQuery(f).attr("name"),t=jQuery(r).find(":radio[name="+s+"]:checked");e=t.length>0;break;case"checkbox":var r=jQuery(f).parents("form"),u=jQuery(f).attr("name"),v=jQuery(r).find(":checkbox[name="+u+"]:checked");e=v.length>0;break;case"select-one":e=jQuery("#"+b+" option").index(jQuery("#"+b+" option:selected"))>0;break;case"select-multiple":alert(jQuery("#"+b+" option").index(jQuery("#"+b+" option:selected")))}return e},jQuery.fn.tagName=function(){return this.get(0).tagName.toLowerCase()},fsSpecialTypes=["radio","checkbox","select-one","select-multiple"],fsValidationRules={dutchZip:{useColdFusion:!1,regex:/^[1-9]\d{3}\s?[a-zA-Z]{2}$/,alertMsg:"* Must be valid Dutch postal code"},email:{useColdFusion:!1,regex:/^[a-zA-Z0-9!#$%&'`*+\/=?^_'{|}~-]+(?:\.[a-zA-Z0-9!#$%&'`*+\/=?^_'{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,alertMsg:"* Invalid email address"},eurodate:{useColdFusion:!1,regex:/^(?:(?:3[01]|[0-2]?\d)([\/\-\.])(?:1[0-2]|0?\d)\1(?:\d{2}){1,2}|\d{4}([\/\-\.])(?:1[0-2]|0?\d)\2(?:3[01]|[0-2]?\d))$/,alertMsg:"* Invalid date"},USdate:{useColdFusion:!1,regex:/^(?:(?:1[0-2]|0?\d)([\/\-\.])(?:3[01]|[0-2]?\d)\1(?:\d{2}){1,2}|\d{4}([\/\-\.])(?:1[0-2]|0?\d)\2(?:3[01]|[0-2]?\d))$/,alertMsg:"* Invalid date"},integer:{useColdFusion:!1,regex:/^\d*$/,alertMsg:"* Must be an integer"},monetary:{useColdFusion:!1,regex:/^[-]?\d+(\.(\d{2}))?$/,alertMsg:"* Must be a monetary value"},numeric:{useColdFusion:!1,regex:/^\d*\.?\d*$/,alertMsg:"* Must be a numeric value"},onlyAlphaNum:{useColdFusion:!1,regex:/^[a-zA-Z0-9]+$/,alertMsg:"* Letters &amp; Numbers only"},onlyNumber:{useColdFusion:!1,regex:/^[0-9\ ]+$/,alertMsg:"* Numbers only"},onlyLetter:{useColdFusion:!1,regex:/^[a-zA-Z\ \']+$/,alertMsg:"* Letters only"},required:{useColdFusion:!1,regex:"",alertMsg:"* This field is required",alertMsgRadio:"* Please select an option",alertMsgCheckbox:"* This checkbox is required",alertMsgCheckboxMulti:"* You must select at least one checkbox",alertMsgSelect:"* This checkbox is required"},telephone:{useColdFusion:!1,regex:/(\+?1([ \-])?)?(\((?=\d{3}\)))?\d{3}[).\-]?\s?\d{3}[. \-]?\d{4}/,alertMsg:"* Must be valid U.S. Telephone Number"},url:{useColdFusion:!1,regex:/^(https?:\/\/)?[-a-z0-9:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-z0-9@:%_\+.~#?&\/\/=]*$/i,alertMsg:"* Invalid URL"},urlClientSide:{useColdFusion:!1,regex:/^((?:http|https):\/\/[a-z0-9\/\?=_#&%~-]+(\.[a-z0-9\/\?=_#&%~-]+)+)|(www(\.[a-z0-9\/\?=_#&%~-]+){2,})$/,alertMsg:"* Invalid URL"},zipcode:{useColdFusion:!1,regex:/^\d{5}(-?\d{4})?$/,alertMsg:"* Must be a valid 5 or 9 digit U.S. zipcode"}};