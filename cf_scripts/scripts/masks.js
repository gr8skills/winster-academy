/*ADOBE SYSTEMS INCORPORATED
Copyright 2012 Adobe Systems Incorporated
All Rights Reserved.

NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
terms of the Adobe license agreement accompanying it.  If you have received this file from a
source other than Adobe, then your use, modification, or distribution of it requires the prior
written permission of Adobe.*/
var KT_focusedEl=null;
KT_validateSingle=function(_96a,_96b){
var _96c=_96a.charCodeAt(0);
switch(_96b){
case "9":
if(_96c<58&&_96c>47){
return true;
}
break;
case "A":
if((_96c<91&&_96c>64)||(_96c<123&&_96c>96)){
return true;
}
break;
case "X":
if((_96c<91&&_96c>64)||(_96c<123&&_96c>96)||(_96c<58&&_96c>47)){
return true;
}
break;
case "?":
return true;
break;
default:
return true;
break;
}
};
KT_maskDefaultValue=function(_96d){
switch(_96d){
case "9":
return "0";
break;
case "A":
return "a";
break;
case "X":
return "0";
break;
case "?":
return "0";
break;
default:
return "0";
break;
}
};
KT_isSpecialChar=function(_96e){
if(_96e=="9"||_96e=="A"||_96e=="X"||_96e=="?"){
return true;
}else{
return false;
}
};
mask_onValueChanged=function(){
if((typeof window.getSelection=="undefined"&&typeof document.selection=="undefined")){
return;
}
if(KT_focusedEl==null||KT_focusedEl.mask==null||KT_focusedEl.mask==""){
return;
}
var mask=KT_focusedEl.mask;
var val=KT_focusedEl.value;
var i=0;
var _972=false;
if(val==KT_focusedEl.oldText){
return;
}
if(val.length>mask.length){
val=val.substr(0,mask.length);
_972=true;
}
for(;i<mask.length;i++){
if(val.charCodeAt(i).toString()!="NaN"){
if(KT_isSpecialChar(mask.charAt(i))){
if(KT_validateSingle(val.charAt(i),mask.charAt(i))){
continue;
}else{
val=KT_focusedEl.oldText;
i=mask.length;
break;
}
}else{
if(val.charAt(i)!=mask.charAt(i)){
if(i==val.length-1){
var _973=val.substr(val.length-1,val.length);
val=val.substr(0,val.length-1)+mask.charAt(i)+_973;
_972=true;
continue;
}else{
val=KT_focusedEl.oldText;
i=mask.length;
}
break;
}
}
}else{
if(val.length<KT_focusedEl.oldText.length){
break;
}
for(;i<mask.length;i++){
if(!KT_isSpecialChar(mask.charAt(i))){
val+=mask.charAt(i);
_972=true;
}else{
break;
}
}
break;
}
}
if(val.length>mask.length){
val=val.substr(0,mask.length);
_972=true;
}
if(KT_focusedEl.value!=val){
KT_focusedEl.value=val;
}
KT_focusedEl.oldText=val;
if(_972){
}
};
mask_parseFirstTime=function(_974,mask){
var _976="";
var _977="";
cond=1;
imask=0;
ival=0;
cnt=0;
while(cond==1){
cond=1;
if(!KT_isSpecialChar(mask.charAt(imask))){
if(_974.charCodeAt(ival).toString()!="NaN"){
if(mask.charAt(imask)==_974.charAt(ival)){
imask++;
ival++;
}else{
_974=_974.substr(0,ival)+mask.charAt(imask)+_974.substr(ival,_974.length);
imask=0;
ival=0;
cond=1;
}
}else{
_974+=KT_maskDefaultValue(mask.charAt(imask));
}
}else{
imask++;
ival++;
}
if(imask>=mask.length||ival>=_974.length){
cond=0;
}
}
for(i=0;i<mask.length;i++){
if(KT_isSpecialChar(mask.charAt(i))){
_976+=mask.charAt(i);
if(_974.charCodeAt(i).toString()!="NaN"){
_977+=_974.charAt(i);
}else{
_977+=KT_maskDefaultValue(mask.charAt(i));
}
}
}
oldvalue=_974;
_974=_977;
var _978="";
for(i=0;i<_976.length;i++){
if(!KT_validateSingle(_974.charAt(i),_976.charAt(i))){
_978+=KT_maskDefaultValue(_976.charAt(i));
}else{
_978+=_974.charAt(i);
}
}
var _979="";
var j=0;
for(i=0;i<mask.length;i++){
if(KT_isSpecialChar(mask.charAt(i))){
_979+=_978.charAt(j++);
}else{
_979+=mask.charAt(i);
}
}
return _979;
};
mask_onSetFocus=function(obj,mask){
if((typeof window.getSelection=="undefined"&&typeof document.selection=="undefined")){
return;
}
if(typeof obj.mask=="undefined"){
ret="";
if(obj.value!=""){
ret=mask_parseFirstTime(obj.value,mask);
}
obj.value=ret;
obj.mask=mask;
}
KT_focusedEl=obj;
if(typeof KT_focusedEl.oldText=="undefined"){
KT_focusedEl.oldText=obj.value;
mask_onValueChanged();
}
};
mask_onKillFocus=function(){
if((typeof window.getSelection=="undefined"&&typeof document.selection=="undefined")){
return;
}
mask_onValueChanged();
KT_focusedEl=null;
};
