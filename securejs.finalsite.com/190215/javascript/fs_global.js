/* finalsiteCf fs_global.js

****** Requires jQuery *******

-- Version History --

1.0 - Merged global.js and javascript.js


-- Functions --

fsBtn('btn_name','state','alt_onSrc') or fsBtn('btn_name','state','otherBtn_name,other/btn/src.jpg');
-- state: on/off (on is default)

*/

/*
TODO

- Menu direction does not work with animated menus
- fsBtn on text link assumes menu exists. Move menu checking to showSubs().
- edit flash code to allow for variable alternate HTML output (add writeFlash from old flash.js)

 */

//var pathx = pathprefix ? pathprefix : "";

if (typeof(pathprefix) != "string"){
	var pathprefix = '';	
}

if(window.jQuery){
	var $j = jQuery.noConflict();
	// Test for placeholder support so we know if we need to fake the placeholder or not
	jQuery.support.inputPlaceholder = ('placeholder' in document.createElement('input'));
	jQuery.support.textareaPlaceholder = ('placeholder' in document.createElement('textarea'));
	
	jQuery.fn.extend({
		placeholder : function() {
			return this.each(function() {
				var $this = $j(this),
					tag = this.nodeName.toLowerCase();
				// Only polyfill if the browser doesn't already support it
				if( (tag == 'input' && !jQuery.support.inputPlaceholder && this.type.toLowerCase() != 'hidden') ||
						(tag == 'textarea' && !jQuery.support.textareaPlaceholder)){
					$this.focus(function() {
						var $foThis = $j(this);
						if ($foThis.val() == $foThis.attr("placeholder")) {
							$foThis.removeClass('fsHasPlaceholder').val("");
						}
					}).blur(function() {
						var $bThis = $j(this);
						if ($bThis.val() == "") {
							$bThis.val($bThis.attr("placeholder"));
						}
					}).addClass('fsHasPlaceholder').val($this.attr("placeholder"));
				}
			});
		}
	});

	// Fix for iframe issue involving different protocols (i.e., page uses "https:" while the iframe uses "http:" or vice versa)
	$j(document).ready(function(){
		// Find all iframes and compare the src attribute's protocol to the page's protocol
		$j('iframe').each(function(){
			// Make sure the iframe has a src attribute
			if ($j(this).attr('src')) {
				if (window.location.protocol === 'https:' && $j(this).attr('src').indexOf('view22c0.html') >= 0) {
					$j(this).attr('src', $j(this).attr('src').replace('view22c0.html', 'view22c0.html'));
				} else if (window.location.protocol === 'http:' && $j(this).attr('src').indexOf('view22c0.html') >= 0) {
					$j(this).attr('src', $j(this).attr('src').replace('view22c0.html', 'view22c0.html'));
				}
			}
		});

		if($j('.math-tex').length) {
			$j.getScript('../../securejs.finalsite.com/mathjax/2.7.1/MathJax7b8b.js?config=TeX-AMS_HTML');
		}
	});
}

if(!window.FS){
	window.FS = {
		//Used for showing email addresses
		insertEmail : function(id,domain,name){
			var e = name.split('').reverse().join('') + '@' + domain.split('').reverse().join('');
			$j('#'+id).html('<a href="mailto:'+e+'">'+e+'</a>');
		}
	};
}

FS.display = FS.display||{};


document.write('<script type="text/javascript" src="'+pathprefix+'javascript/flash_headers.js"></script>');

// these items can be redefined in global_vars.js
var menu_pause = 250;
var anim_menus = 0;
var menu_speed = .25;
var use_overview_pages = 0;
var use_select_btn = 0;
var section_subs = 0;
var menu_dir;
var otherBtns = new Array();
var otherImages = new Array();
function loadJS(){}


// Browser & Platform Check
var isIE = (document.all) ? true : false;
var isNS4 = (document.layers) ? true : false;
var isNS6 = (document.getElementById && !isIE) ? true : false;
var isSafari = (navigator.userAgent.indexOf("Safari") >= 0) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

var isMAC = (navigator.appVersion.toLowerCase().indexOf("mac") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;

//remove transparency from menus to avoid conflict with flash plugin in FF2/Mac
if(isMAC && (navigator.userAgent.indexOf('Firefox/2') > 0)){ document.write('<style type="text/css">#nav_menus div, #ql_menu{ opacity:1 !important; -moz-opacity:1 !important; }</style>'); }

//remove transparency from menus in FF/Win to avoid issues with ClearType
if(isWin && (navigator.userAgent.indexOf('Firefox') > 0)){ document.write('<style type="text/css">#nav_menus div, #ql_menu{ opacity:1 !important; -moz-opacity:1 !important; }</style>');}

//button variables
var sectionId = "";
var sectionBtn = "";
var thisMenu = "";
var fsMenuName = "";
var xBtn = "";
var xBtnImg = "";
var wait;
var fsLinks = new Array();
FS.display.buttons = new Array();


//onLoad functions
addOnloadEvent(preLoad);

// Use this to add a function to the onload event
function addOnloadEvent(fnc){
  if ( typeof window.addEventListener != "undefined" )
    window.addEventListener( "load", fnc, false );
  else if ( typeof window.attachEvent != "undefined" ) {
    window.attachEvent( "onload", fnc );
  }
  else {
    if ( window.onload != null ) {
      var oldOnload = window.onload;
      window.onload = function ( e ) {
        oldOnload( e );
        window[fnc]();
      };
    }
    else
      window.onload = fnc;
  }
}

// Button Object Constructor
function btnObj(btnName,menuName,pageId,offSrc,onSrc,selectSrc) {
	this.btnName = btnName;
	if( menuName.indexOf("|") != -1 ){
		this.menuName = menuName.split("|")[0];
		this.menuDirection = menuName.split("|")[1];
	}else{
		this.menuName = menuName;
	}
	this.pageId = pageId;
	this.offSrc = offSrc;
	this.onSrc = onSrc;
	this.selectSrc = selectSrc;
}


function preLoad(){
	
	colorLink();
	loadJS();
	setStyle();
	fsLinkRedirect();
	if(isIE){ fixContentHeight(); }
	
	// focus on username field if on userlogin.cfm page
	if( document.location.href.search('userlogin.html') > -1){ 
		if(document.userlogin && document.userlogin.username){
			document.userlogin.username.focus();
		}
	}
	
	
	//------------------------ Create fsLinks buttons -----------------//

	//get all <a> tags
	fsLinks = document.getElementsByTagName('a');
	
	
	//test for fsbtn class and add button events
	for(i=0;i<fsLinks.length;i++){
		if( fsLinks[i].className.toLowerCase() == 'fsbtn' ){
			//get page id from href
			var search_str = fsLinks[i].search.split('&');
			for(j=0;j<search_str.length;j++){
				if(search_str[j].split('=')[0] == '?p'){
					fsLinks[i].pid = search_str[j].split('=')[1]; //add a pid attribute to <a> tag and assign id value
				}else{
					//this is for links other than "page.cfm"
					fsLinks[i].pid = "btn"+i; //add a generic id
				}
			}
			
			//create menu reference
			fsLinks[i].menu = "dhtmlmenu_"+fsLinks[i].pid;
			
			// change style from "visibility:hidden" to "display:none"
			if( anim_menus && document.getElementById(fsLinks[i].menu)){
				document.getElementById(fsLinks[i].menu).style.display = "none";
				document.getElementById(fsLinks[i].menu).style.visibility = "visible";
			}

			//check if there is anything in the <a> tag besides text
			if(fsLinks[i].childNodes[0].tagName){ 
				fsLinks[i].childNodes[0].id = "dhtmlbtn_"+fsLinks[i].pid; //add ID to the image			
				fsLinks[i].childNodes[0].onSrc = fsLinks[i].childNodes[0].src.replace(/\.(gif|jpg|png)/,"_on.$1"); //create onSrc and add to image
				
				if(use_select_btn){
					fsLinks[i].childNodes[0].selectSrc = fsLinks[i].childNodes[0].src.replace(/\.(gif|jpg|png)/,"_select.$1"); //create selectSrc and add to image
				}else{
					fsLinks[i].childNodes[0].selectSrc = fsLinks[i].childNodes[0].src.replace(/\.(gif|jpg|png)/,"_on.$1"); //create selectSrc and add to image
				}
				FS.display.buttons[fsLinks[i].childNodes[0].id] = new btnObj(fsLinks[i].childNodes[0].id,fsLinks[i].menu,fsLinks[i].pid,fsLinks[i].childNodes[0].src,fsLinks[i].childNodes[0].onSrc,fsLinks[i].childNodes[0].selectSrc);
				
				fsLinks[i].onmouseover = function (){ fsBtn(this.childNodes[0].id); }
				fsLinks[i].onmouseout = function (){ fsBtn(this.childNodes[0].id,'off'); }

			}else{
				fsLinks[i].id = "dhtmlbtn_"+fsLinks[i].pid; //add ID to the a tag
				FS.display.buttons[fsLinks[i].id] = new btnObj(fsLinks[i].id,fsLinks[i].menu,fsLinks[i].pid,'','');
				fsLinks[i].onmouseover = function (){ showSubs(this.id); this.className = "fsBtn_on"; }
				fsLinks[i].onmouseout = function (){ mnuOut(this.id); }
			}
		
			if(use_overview_pages && document.getElementById(fsLinks[i].menu)){ fsLinks[i].href = document.getElementById(fsLinks[i].menu).getElementsByTagName('a')[0].href; }
		
			//turn on section button here
			for(n=0;n<pagearray.length;n++){
				if( fsLinks[i].pid == pagearray[n] ){
					fsLinks[i].className = "fsBtn_on";
					sectionId = fsLinks[i].pid;
					sectionBtn = fsLinks[i].id;
				}
			}
		
		
		}//end fsBtn check
		
		//Auto generate ql_btn code
		if( fsLinks[i].className.toLowerCase() == 'qlbtn' ){
			
			// change style from "visibility:hidden" to "display:none"
			if( anim_menus && document.getElementById('ql_menu')){
				document.getElementById('ql_menu').style.display = "none";
				document.getElementById('ql_menu').style.visibility = "visible";
			}
			
			if(fsLinks[i].childNodes[0].tagName){ 
				fsLinks[i].childNodes[0].id = "ql_btn"; //add ID to the image			
				fsLinks[i].childNodes[0].onSrc = fsLinks[i].childNodes[0].src.replace(/\.(gif|jpg|png)/,"_on.$1"); //create onSrc and add to image
				FS.display.buttons['ql_btn'] = new btnObj('ql_btn','ql_menu','0',fsLinks[i].childNodes[0].src,fsLinks[i].childNodes[0].onSrc);			
				fsLinks[i].onmouseover = function (){ fsBtn('ql_btn'); }
				fsLinks[i].onmouseout = function (){ fsBtn('ql_btn','off'); }
			}else{
				fsLinks[i].id = "ql_btn"; //add ID to the a tag
				FS.display.buttons['ql_btn'] = new btnObj('ql_btn','ql_menu','0','','');
				fsLinks[i].onmouseover = function (){ showSubs('ql_btn'); }
				fsLinks[i].onmouseout = function (){ mnuOut('ql_btn'); }
				
				document.getElementById('ql_menu').onmouseover = function(){ clearTimeout(wait); }
				document.getElementById('ql_menu').onmouseout = function(){ mnuOut('ql_btn','ql_menu'); }
		
				
			}
		}
	}//end loop through fsLinks
	
	//add otherBtns
	if(otherBtns.length>0){
		for(i=0;i<otherBtns.length;i++){
			btnAttrs = otherBtns[i].split(',');
			FS.display.buttons[btnAttrs[0]] = new btnObj(btnAttrs[0],btnAttrs[1],btnAttrs[2],btnAttrs[3],btnAttrs[4]);
		}
	}

	//preLoad loops through the FS.display.buttons array and pre-loads all of the onSrc's
	//Also defines sectionID & sectionBtn & turns on section button

	if(document.images){
		var myImages = new Array();
		var i=0;
		for (this.btnName in FS.display.buttons) {
			if (FS.display.buttons[this.btnName].onSrc){
				myImages[i] = new Image();
				myImages[i].src = FS.display.buttons[this.btnName].onSrc;
				i++;
				var n = 0;
				for (n in pagearray) { // loop through pagearray to match pageid
					if (pagearray[n] == FS.display.buttons[this.btnName].pageId) {
						if(use_select_btn){
							document.images[this.btnName].src = FS.display.buttons[this.btnName].selectSrc;
						}else{
							document.images[this.btnName].src = FS.display.buttons[this.btnName].onSrc;
						}
						sectionId = FS.display.buttons[this.btnName].pageId;
						sectionBtn = FS.display.buttons[this.btnName].btnName;
					}
					n++;
				}
			}
		}
	
	if(otherImages){
		var oi = new Array();
		for(i=0; i < otherImages.length; i++){
			oi[i] = new Image(); oi[i].src = otherImages[i];
		}
	}
	
	}

} //end preLoad


function fsBtn(btn,state,alt_onSrc){
	if(alt_onSrc){
		if(alt_onSrc.indexOf(",") != -1){ //check if there is a comma list with btn_name and src
			ob = alt_onSrc.split(",");
			xBtn = ob[0];
			xBtnImg = ob[1];
			swapImage(btn);
		}else{
			// if there is just an alt src then only that button will be changed
				// this function may no longer be needed but is included for backwards compatiblity
			document.images[btn].src = alt_onSrc;
		}
	}else if(state == "off"){
		imgRestore(btn);
	}else{ swapImage(btn); }
}

function swapImage(btn){
	//swapImage creates a roll-over effect from onSrc when passed the name of the button
	//Also shows sub-menus if specified
	if(FS.display.buttons[btn].pageId != sectionId){ // btn src will not change if it is in the section, this preserves the selectSrc
		document.images[btn].src = FS.display.buttons[btn].onSrc; //Turn button on
	}
	
	//check btnID against sectionId and section_menu variable before turning on sub menus
	if( FS.display.buttons[btn].menuName && document.getElementById(FS.display.buttons[btn].menuName) ){
	//Turn on menus if section sub option is on or the button pageId does not equal the sectionId
		showSubs(btn);
	}else if( (thisMenu.length>0) && (thisMenu != FS.display.buttons[btn].btnName) ){
		clearSubs(thisMenu);
	}
	
	if(xBtn){ document.images[xBtn].src = xBtnImg; }
	
} //end swapImage

function imgRestore(btn){
	// turns button off unless it is the section button or has a menu
	if(FS.display.buttons[btn].menuName && document.getElementById(FS.display.buttons[btn].menuName)){
		mnuOut(btn);
	}else if(FS.display.buttons[btn].pageId != sectionId){
		document.images[btn].src = FS.display.buttons[btn].offSrc;
		if(xBtn){ document.images[xBtn].src = FS.display.buttons[xBtn].offSrc; }
	}
}


//Sub Menu Functions
function showSubs(btn){
	if((thisMenu.length>0) && (thisMenu != FS.display.buttons[btn].btnName)){ //turn off any current menus unless we are still on the same button
		clearSubs(thisMenu);
	}
		
	var mDir = (FS.display.buttons[btn].menuDirection) ? FS.display.buttons[btn].menuDirection : menu_dir;
	
	var mName = document.getElementById(FS.display.buttons[btn].menuName);
	var bName = document.getElementById(FS.display.buttons[btn].btnName);
	
	if(section_subs == 1 || (FS.display.buttons[btn].pageId != sectionId)){ //Test for section subs option and section ID

		// mName.style.left = findPosX(bName) + "px";
		mName.style.left = $j('#'+ FS.display.buttons[btn].btnName ).offset().left + 'px';
		menuTop = $j('#'+ FS.display.buttons[btn].btnName ).offset().top;

		if( mDir == "up" ){ mName.style.top = (findPosY(bName) - mName.scrollHeight) + "px";
		}else if( mDir == "center" ){ mName.style.top = (findPosY(bName) - (mName.scrollHeight / 2) + (bName.scrollHeight/2)) + "px";
		}else{ mName.style.top = (findPosY(bName) + bName.scrollHeight) + "px"; }

		if(anim_menus && mDir != "up"){
			if(thisMenu != FS.display.buttons[btn].btnName){
				 //new Effect.BlindDown(FS.display.buttons[btn].menuName,{ duration:menu_speed, queue: {position:'end', scope: btn} });
				$j('#'+FS.display.buttons[btn].menuName).slideDown(menu_speed*1000);
			}
		}else{
			mName.style.visibility = 'visible';
		}	

		thisMenu = FS.display.buttons[btn].btnName; //add menu to close later
	}
	
	clearTimeout(wait);
} //end showSubs


function mnuOut(btn){
	wait = setTimeout("clearSubs('"+ btn +"')", menu_pause);
}

function clearSubs(btn) { //clears open menu
	var mDir = (FS.display.buttons[btn].menuDirection) ? FS.display.buttons[btn].menuDirection : menu_dir;
	if(FS.display.buttons[btn].menuName){
		if(anim_menus && mDir != "up"){
			//new Effect.BlindUp(FS.display.buttons[btn].menuName,{ duration:menu_speed,afterFinish:function(){btnOff(btn)}, queue: {position:'end', scope: btn} });
			$j('#'+FS.display.buttons[btn].menuName).slideUp(menu_speed*1000,function(){btnOff(btn)});
		}else{
			document.getElementById(FS.display.buttons[btn].menuName).style.visibility='hidden';
			btnOff(btn);
		}
		thisMenu="";
	}else{
		btnOff(btn);
	}
	if(document.getElementById(btn).className=="fsBtn_on" && FS.display.buttons[btn].pageId != sectionId){ document.getElementById(btn).className="fsBtn"; }
}

function btnOff(btn){
	if(FS.display.buttons[btn].pageId != sectionId && FS.display.buttons[btn].offSrc){
			document.images[btn].src = FS.display.buttons[btn].offSrc; //turn button back off
			}else if(FS.display.buttons[btn].selectSrc){
				document.images[btn].src = FS.display.buttons[btn].selectSrc;
			}
	if(xBtn){ document.images[xBtn].src = FS.display.buttons[xBtn].offSrc; }
}


//Automatically find x,y positions of objects
function findPosX(obj)
  {
    var curleft = 0;
    if(obj.offsetParent)
        while(1) 
        {
          curleft += obj.offsetLeft;
          if(!obj.offsetParent)
            break;
          obj = obj.offsetParent;
        }
    else if(obj.x)
        curleft += obj.x;
    return curleft;
  }

  function findPosY(obj)
  {
    var curtop = 0;
    if(obj.offsetParent)
        while(1)
        {
          curtop += obj.offsetTop;
          if(!obj.offsetParent)
            break;
          obj = obj.offsetParent;
        }
    else if(obj.y)
        curtop += obj.y;
    return curtop;
  }
//end Sub Menus

// ----------------------------------------------

function fsMenu (btnName,menuName,menuPause) {
	var menuClear;
	
	var mp = menuPause ? menuPause : menu_pause;
	
	$j(btnName).hover(
		function(){ //over

			if(fsMenuName && menuName != fsMenuName){ $j(fsMenuName).hide(); }
		
			// check here for calendar export menu
			var calMenu;
			for(i=0;i<$j(btnName).parents().length;i++){
				if($j(btnName).parents().eq(i).attr('id') == 'feedDialog_list'){
					calMenu = true;
					break;
				}
			}
			
			if (calMenu) {
					$j(menuName).css('top', Number($j(btnName).position().top) + Number($j(btnName).height()) + 'px');
					$j(menuName).css('left', $j(btnName).position().left + 'px');				
			}else{
					$j(menuName).css('top', Number($j(btnName).offset().top) + Number($j(btnName).height()) + 'px');
					$j(menuName).css('left', $j(btnName).offset().left + 'px');
			};
			
			$j(menuName).show();
			$j(menuName).addClass('fsMenuOn');
			$j(btnName).addClass('fsBtnOn');
			
			//set thisMenu here to know what to turn off
			fsMenuName = menuName;
			
			clearTimeout(menuClear);
		},
		function() { //out
			menuClear = setTimeout( "$j('"+menuName+"').hide().removeClass('fsMenuOn'); fsMenuName=''; $j('.fsBtnOn').removeClass('fsBtnOn')", mp );
		}
	);
	
	$j(menuName).hover(
		function(){ //over
			clearTimeout(menuClear);
		},
		function() { //out
			menuClear = setTimeout( "$j('"+menuName+"').hide().removeClass('fsMenuOn'); fsMenuName=''; $j('.fsBtnOn').removeClass('fsBtnOn')", mp );
		}
	);
} //end fsMenu

function fsContentSlider(target,contentList,fsContentDelay,fsContentSpeed,random,showControls){

	// the following variables must be in jQuery format (#idname, .classname, tagname)
	// they are required
	// target is the container that will receive the news items
	// contentList is the class of the containers with the news items

	// the following variables must be time in milliseconds (1000 = 1 second)
	// fsContentDelay is the length of time that each item is displayed (default = 4500)
	// fsContentSpeed is the speed of the fade between items (default = 250)

	// random (true/false) determines if it should pick a random item to stop on (default = false)

/*
	Updating for news project

	- add mouseover for popup option (or move to other function)
	- add navigation output (boxes, numbers, fwd/back arrows)
	
*/

	var fd = fsContentDelay && fsContentDelay != 0 ? fsContentDelay : 4500;
	var fs = fsContentSpeed ? fsContentSpeed : 250;
	var cn =  random ? Math.floor( $j(contentList).length * Math.random()) : 0;
	var contentInterval;
	var timerRunning;
	
	//add the necessary elements and load first content block into target
	$j(target).html( '<div class="contentControls"></div><div class="contentSlider">' + $j(contentList).eq(cn).html() + '</div>' );

	if(typeof showControls != undefined && showControls == false){
		$j(target + ' .contentControls').hide();
	}

	// only process the rest of it if there is more than one item
	if($j(contentList).length > 1){

		// $j(target).mouseenter(function(){ stopSlider(); })
		// $j(target).mouseleave(function(){ startSlider(); })

		// add "previous" control box 
		$j(target + ' .contentControls').append('<div class="cboxPrev">&laquo;</div>');
		$j(target + ' .contentControls .cboxPrev').click(function(){

			cn = cn-1 >= 0 ? cn-1 : $j(contentList).length-1;

			clearInterval(contentInterval);
			elementFade($j(target + ' .contentSlider'),$j(contentList).eq(cn).html(),fs);
			$j(target + ' .contentControls div').removeClass('on');
			$j(target + ' .cbox_'+cn ).addClass('on');
			return false;
		});

		//build the numbered control boxes
		$j(contentList).each(function(i){

			// this if statement was used on Harper to allow for customizing the look of certain posts
			// this could be worked into the general output to allow color coding items
			if( $j(this).text().search(/alert:/i) != -1 ){
				$j(this).wrapInner('<span class="newsAlert"></span>');
			}

			$j(target + ' .contentControls').append('<div class="cbox_'+i+'" cid="'+i+'">'+(i+1)+'</div>');
			$j(target + ' .cbox_'+i ).click( function(){
				cn = $j(this).attr('cid');
				clearInterval(contentInterval);
				elementFade($j(target + ' .contentSlider'),$j(contentList).eq(cn).html(),fs);
				$j(target + ' .contentControls div').removeClass('on');
				$j(target + ' .cbox_'+i ).addClass('on');
				return false;
			});
		});
		
		// add "next" control
		$j(target + ' .contentControls').append('<div class="cboxNext">&raquo;</div>');
		$j(target + ' .contentControls .cboxNext').click(function(){
			cn = cn < $j(contentList).length-1 ? Number(cn)+1 : 0;
			clearInterval(contentInterval);
			elementFade($j(target + ' .contentSlider'),$j(contentList).eq(cn).html(),fs);
			$j(target + ' .contentControls div').removeClass('on');
			$j(target + ' .cbox_'+cn ).addClass('on');
			return false;
		});

		// turn on the first box and start the auto-rotation
		$j(target + ' .cbox_'+cn).addClass('on');		

		if(fsContentDelay!=0){
			contentInterval = setInterval( function(){
				// go to the next one
				cn = cn < $j(contentList).length-1 ? cn+1 : 0;
				elementFade($j(target + ' .contentSlider'),$j(contentList).eq(cn).html(),fs);
				$j(target + ' .contentControls div').removeClass('on');
				$j(target + ' .cbox_'+cn ).addClass('on');
			
			},fd);
		}
	} //end contentList length check
} //end fsContentSlider

function elementFade(elementName,newContent,fadeSpeed){
	if(isIE){
		elementName.css('visibility','hidden');
		elementName.html( newContent );
		elementName.css('visibility','visible');
	}else{
		elementName.animate({opacity:'.1'},fadeSpeed,function(){
			elementName.html( newContent );
			elementName.animate({opacity:'1'},fadeSpeed);
		});	
	}
}

function swapStyle(title) {
	document.getElementById('contentdiv').className = title;
	createCookie("cfstyle", title);
}

function setStyle() {
	var style = readCookie("cfstyle");
	if (style != null && document.getElementById('contentdiv')) { swapStyle(style);}
}


// ----------------------------------------------
// Cookie functions
// ----------------------------------------------

function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = ";expires="+date.toGMTString();
  }
  else expires = "";
  document.cookie = name+"="+value+expires+";path=/;";
}

// ----------------------------------------------

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

//Colorize parent links in banner navigation module
function colorLink(){	
	var links = $j('.portalnavmod a, .navmod a');	
	for(i=0;i < links.length;i++){
		for(j=1; j<pagearray.length;j++){
			rExp = new RegExp( "p=" + pagearray[j] + "$" , "i" );
			if( links[i].href.search(rExp) > 0 ){ 
				links[i].className = 'nav_history';
			}
		}
	}		
}

function fixContentHeight(){ //use to fix the height of the content table in IE
	if($j('#contentdiv').length > 0){
		var h = $j('#contentdiv').parents('td').attr('offsetHeight');
		var pt = Number($j('#contentdiv').css('padding-top').replace(/[^0-9]/g,''));
		var pb = Number($j('#contentdiv').css('padding-bottom').replace(/[^0-9]/g,''));
		var bt = Number($j('#contentdiv').css('border-top-width').replace(/[^0-9]/g,''));
		var bb = Number($j('#contentdiv').css('border-bottom-width').replace(/[^0-9]/g,''));
		h = h-pt-pb-bt-bb;
		$j('#contentdiv').parents('table').eq(0).css('height', h + "px");		
	}
}

/*
	fsRedirect accepts a desitination URL to redirect the browser to and,
	optionally, a warn message which will produce a confirmation dialog
*/
function fsRedirect(l,warn){
	if(!parent.topframe){
		if(warn){
			if(confirm(warn)){document.location.replace(l);}else{return false;}
		}else{
			document.location.replace(l);
		}
	}
}

//fsLinksRedirect will highjack links listed in the fsRedirects array based on pageid
// syntax: "pageid,newUrl,target(optional)"
// example: "2,http://www.cnn.com/,_blank"

var fsRedirects = new Array();

function fsLinkRedirect (){
	fsLinks = document.getElementsByTagName('a');	
	if (fsRedirects.length > 0) {
		for (var i=0; i < fsLinks.length; i++) {
			if(fsLinks[i].href.search('page.html') > -1 && fsLinks[i].search.split(/p=/)[1]){ //limit to page.cfm links and check for p=
				id = fsLinks[i].search.split(/p=/)[1].split(/&/)[0]; // get the page id in each link
				for( var j=0; j < fsRedirects.length; j++){ //loop through redirects list
					reID = fsRedirects[j].split(',')[0]; //get the id from the redirect list
					if(reID == id){
						//use jQuery to rewrite the link attributes here
						$j('a').eq(i).attr('href',fsRedirects[j].split(',')[1]);
						$j('a').eq(i).attr('target',fsRedirects[j].split(',')[2]);
					}
				}
			}
		};		
	};		
	//if page id's match then change attributes or apply click function
}

/*---------------------------
 Start of javascript.js code
*/

 
function valuevalidation(entered, min, max, alertbox, datatype)
	{
		// Value Validation by Henrik Petersen / NetKontoret
		// Explained at www.echoecho.com/jsforms.htm
		// Please do not remove this line and the two lines above.
		with (entered)
		{
		checkvalue=parseFloat(value);
		if (datatype)
		{smalldatatype=datatype.toLowerCase();
		if (smalldatatype.charAt(0)=="i") {checkvalue=parseInt(value)};
		}
		if ((parseFloat(min)==min && checkvalue<min) || (parseFloat(max)==max && checkvalue>max) || value!=checkvalue)
		{if (alertbox!="") {alert(alertbox);} return false;}
		else {return true;}
		}
	}


function loadModalPanel () {
	modalPanel = new YAHOO.widget.Panel("modalPanel");
	modalPanel.render(document.body);

	modalPanel.cfg.setProperty('visible',false);
	modalPanel.cfg.setProperty('width','450px');
	//modalPanel.cfg.setProperty('height','300px');
	modalPanel.cfg.setProperty('modal',true);
	modalPanel.cfg.setProperty('fixedcenter',true);
	modalPanel.cfg.setProperty('autofillheight','body');
	
	//remove shadow for FF2/Mac to address opacity/flash issue
	if(isMAC && (navigator.userAgent.indexOf('Firefox/2') > 0)){ modalPanel.cfg.setProperty('underlay','none'); }
	
}


$j(document).ready(function(){ if(typeof YAHOO != "undefined"){YAHOO.util.Event.onDOMReady(loadModalPanel);}});

function fsModalPanel(content,modalWidth,modalHeight,modalHeader,modalFooter) {

	var callback =
	{
	  success: function(o) { showModalPanel(o.responseText,modalWidth,modalHeight,modalHeader,modalFooter) },
	  failure: function(o) {showModalPanel("The requested URL could not be loaded.",modalWidth,modalHeight,modalHeader,modalFooter) }
	}

	if (content.indexOf('page.html') == 0) {
		transaction = YAHOO.util.Connect.asyncRequest('GET', content + '&pullcontent=true', callback);		
	}else if(content.indexOf('#') == 0){
		thisId = content.split('#')[1];
		showModalPanel(document.getElementById(thisId).innerHTML,modalWidth,modalHeight,modalHeader,modalFooter);
	}else{
		showModalPanel(content,modalWidth,modalHeight,modalHeader,modalFooter);		
	};

}

function showModalPanel (bodyText,modalWidth,modalHeight,modalHeader,modalFooter) {

	modalPanel.setBody(bodyText);

	if(modalWidth){ modalPanel.cfg.setProperty('width', modalWidth); }
	//if(modalHeight){ modalPanel.cfg.setProperty('height', modalHeight); }

	if(modalHeader){ modalPanel.setHeader(modalHeader); }
	if(modalFooter){ modalPanel.setFooter(modalFooter); }

	modalPanel.render();


	var divs = document.getElementById('modalPanel').getElementsByTagName('div');
	for (var i=0; i < divs.length; i++) {
		if (divs[i].className == 'bd') {
			divs[i].style.height = modalHeight ? modalHeight : '300px';
		}
	}


	modalPanel.show();

	document.getElementById('modalPanel_mask').onclick = function(){ modalPanel.hide() }
}

//This should no longer be used, just left it here in case somebody else was using it
function gaTrackLinks(){

	// pageTracker._trackEvent(category, action, optional_label, optional_value)
	// <category name>, url, trackingpath + [linked text or img src]

	if(typeof pageTracker != "undefined"){

		// find all the non-page.cfm links
		$j('a').filter( function(){ return $j(this).attr('href') && $j(this).attr('href').indexOf('page.html') < 0 } ).each(function(){

			var ah = $j(this).attr('href'); //grab the href attribute

			if( ah.indexOf('#') == 0 || ah.indexOf('javascript:') == 0 ){ // filter out '#', anchors, and javascript links
				return; //do nothing			
			}else if(ah.indexOf('mailto') == 0){ //process mailto (mailMe links will be tracked through the mailMe function)
				$j(this).click(function(){
					pageTracker._trackEvent('email links', ah , trackingpath + gaLinkText( $j(this) ));
				});
			}else if( ah.indexOf('http') == 0 && ah.indexOf(document.location.host) < 0 ){  // process external links (not local domain)
				$j(this).click(function(){
					pageTracker._trackEvent('external links', ah , trackingpath + gaLinkText( $j(this) ));
				});
			}else if(ah.indexOf('.cfm') > 0){ //filter local cfm here
				return;
			}else if(ah.indexOf('.htm') > 0){ // .htm files should get pageTracker function instead
				// local htm files will have to add their own ga code to enable tracking, this will avoid creating duplicates by adding an automated version
				/*$j(this).click(function(){
					pageTracker._trackPageview(ah); //pass URL to GA Content
				});*/
				return;
			}else{ // assume the rest are file links
				$j(this).click(function(){
					pageTracker._trackEvent('file downloads', ah , trackingpath + gaLinkText( $j(this) ));	
				});
			}

		}); //end each function
	}
}
//this should no longer be used either
function gaLinkText (obj) {
	if( $j(obj).text().length > 0 ){
		return " [" + $j(obj).text() + "]" ;
	}else if( $j(obj).find('img').length > 0 ){
		return " [img:" + $j(obj).find('img').attr('src') + "]";
	}else{
		return "";
	}
}

function popUp(url,w,h,windowname){
	if (windowname == undefined){windowname = 'name'};
	var properties = 'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes,width='+w+',height='+h+'';
	mypopup = window.open(url, windowname, properties);
	if (mypopup == undefined) {alert('It appears that your browser has popup blocking enabled.\nPlease modify this setting to allow for full functionality.');}
	else {mypopup.focus();}
}

// Init pop-up height vars
var addHeight = 0;
var baseHeight = 505;
if (navigator.userAgent.indexOf("Chrome") != -1 && navigator.userAgent.indexOf("Mac OS") != -1) {
	baseHeight = 555;
}
var testHeight = false;
function popMedia(thevar) {
	
	var mh_url = pathprefix + "cf_media/popheight.cfm";
	
	synRequest(mh_url);
	mediaAction(thevar);
	
}

// perform actual window open
function mediaAction (thevar){
	var popHeight = baseHeight + (addHeight/1);
	var properties = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=805,height=' + popHeight;
	if (thevar.indexOf('grp=') != -1) {
		thevar = thevar.replace('grp=','g=');
	}
	var theurl = pathprefix + 'cf_media/index.cfm?' + thevar;
	mymedia = window.open(theurl,'popupmedia', properties);
	mymedia.focus();
}

// Callback for getting the media header height
function mediaHeight(rq,thevar) {
	addHeight = rq.responseText;
	testHeight = true;
	
}

function synRequest(url){
	
	if(window.XMLHttpRequest) {
		// Gecko (Firefox, Moz), KHTML (Konqueror, Safari), Opera, Internet Explorer 7
		var req = new XMLHttpRequest(); 
	} else if(window.ActiveXObject) {  
		var req = new ActiveXObject("Microsoft.XMLHTTP"); // Internet Explorer 4,5,5.5,6
	} 
	
	req.open('GET.html', url, false); 
	req.send(null);
	if(req.status == 200){
		addHeight = req.responseText;
	} else {
		// Fail to default of 80
		addHeight = 80;
	}
 	
}

// Request
	function request(url,method,qs,callback,cbparam){
		var myRequest = null;
		var ready  = false;
	
		try {
			if(window.XMLHttpRequest) {
				
				// Gecko (Firefox, Moz), KHTML (Konqueror, Safari), Opera, Internet Explorer 7
				myRequest = new XMLHttpRequest(); 
			} else if(window.ActiveXObject) {  
				myRequest = new ActiveXObject("Microsoft.XMLHTTP"); // Internet Explorer 4,5,5.5,6
			} 
		} catch(e) {
			return false;
		}
		
		ready = false;
		method = method.toUpperCase();
	
		try {
			if((method=="GET") || (method=="HEAD"))
			{
				myRequest.open(method, url+qs, true);
			}
			else if(method=="POST")
			{
				myRequest.open(method, url, true);
				myRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			}
			myRequest.onreadystatechange = function(){
				if(myRequest.readyState==4 && !ready) {
					ready = true;
					callback(myRequest,cbparam);
				} else {
				return false;
				}
			}
			myRequest.send(qs);
		}
		catch(e) {
			return false;
		}
		return true;
	}
	

//moved flash version variables to the top of file

function writeJS(player,grp,wide,high,auto,rand,loop_tog,time,aspect){
	 
	if(player == 'slideshow'){
		var playerType = 'slideshow_small';	
        var defaultHeight = 225;
        var defaultWidth = 300;
		
	}
	else if(player == 'mp3'){
		var playerType = 'mp3_small';
        var defaultHeight = 80;
        var defaultWidth = 300;
		aspect = (defaultWidth/defaultHeight); // force landscape view
	}
	else if(player == 'video'){
		var playerType = 'video_small';
        var defaultHeight = 225;
        var defaultWidth = 300;
	}
	
	if(grp != null){var mediaPath = grp;}
	if(auto != null){var autoplay = auto;}
	if(rand != null){var ran = rand;}
	if(time != null){var timer = time;}

    if((wide != null)&&(high != null)){
		var width = wide;
		var height = high;
	}
    else if((wide != null)&&(high == null)){
		var width = wide;
		
		// (defaultHeight/defaultWidth) or (defaultWidth/defaultHeight)
		var height = Math.round(width * aspect); 
		
		// force mp3 height to be static - (height < 80)&&
        if((player == 'mp3')){
			height = 80;
         }
	}
	else if((wide == null)&&(high != null)){
		var height = high;
		
		// (defaultWidth/defaultHeight) or (defaultHeight/defaultWidth)
		var width = Math.round(height * aspect);
		
	}
    else if((wide == null)&&(high == null)){
		var width = defaultWidth;
		var height = defaultHeight;
	}

	var filename = "cf_media/players/"+playerType+".swf";

        var alternateContent = '<div id="tooolds"><p>We have detected that your version of flash is too old.</p><p>This Media Gallery requires Flash 8 or higher</p><p align="center"><a href="http://www.adobe.com/go/getflashplayer" target="_blank"><img src="../images/media/get_flash_player.gif" alt="Get the Flash Player" border="0" /></a></p></div>';

	var hasRightVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
  var protocol = window.location.protocol;
	
	// +' <param name="bgcolor" value="#000000" />'
	if(hasRightVersion) {  // if we've detected an acceptable version
    	var oeTags = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
   		+ 'width="'+width+'" height="'+height+'"'
    	+ 'codebase="' + protocol + '//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="mm_movie'+grp+'">'
	    + '<param name="movie" value="'+filename+'" />'
	    + '<param name="quality" value="high" /><param name="wmode" value="transparent" />'
                
		+ '<param name="FlashVars" value="high='+height+'&wide='+width+'&autoplay='+autoplay+'&rand='+ran+'&timer='+timer+'&grp='+grp+'" />'
    	+ '<embed src="'+filename+'" quality="high" wmode="transparent"'
    	+ 'width="'+width+'" height="'+height+'" name="mm_movie'+grp+'" align="middle"'
		+ 'FlashVars="high='+height+'&wide='+width+'&autoplay='+autoplay+'&rand='+ran+'&timer='+timer+'&grp='+grp+'" '
    	+ 'play="true"'
	    + 'loop="'+loop_tog+'"'
	    + 'quality="high"'
    	+ 'allowScriptAccess="sameDomain"'
	    + 'type="application/x-shockwave-flash"'
    	+ 'pluginspage="' + protocol + '//www.macromedia.com/go/getflashplayer">'
	    + '<\/embed>' 
    	+ '<\/object>';
 	  // document.write(oeTags);   // embed the flash movie
	  return oeTags;
  	} 
 	else {  // flash is too old or we can't detect the plugin
  	 	// document.write(alternateContent);  // insert non-flash content
		return alternateContent;
 	}
}


// THIS SCRIPT IS USED TO GET THE DIMENSIONS OF A DIV OR TABLE - mostly for media2
function getStyle(elem, style) {
	if(!document.getElementById){return;}
	
	var value = elem.style[style];
	
	if(!value){
		if(document.defaultView){
			value = document.defaultView.getComputedStyle(elem, "").getPropertyValue(style);
		}
        else if(elem.offsetWidth){
			//value = elem.currentStyle[style];
			value = elem.offsetWidth;	
		}
	}
	return value;
}

// Output the media html
function writeMediaJS(divID,playername,data1,mediawidth,mediaheight,auto_tog,random_tog,loop_tog,delay_num,data7){
	var theDiv=document.getElementById(divID);
	
	if(mediawidth == null){
		// var currWidth = parseInt(getStyle(theDiv,"width"));
		var currWidth = $j('#'+divID).width();
		if((currWidth==0)||(isNaN(currWidth))){currWidth = null;}
	} else {
		var currWidth = mediawidth;
	}
	
	if(mediaheight == null){
		// var currHeight = parseInt(getStyle(theDiv,"height"));
		var currHeight = $j('#'+divID).height();
		if((currHeight==0)||(isNaN(currHeight))){currHeight = null;}
	} else if(mediaheight == 0){
		var currHeight = null;
	} else {
		var currHeight = mediaheight;
	}
	
	theDiv.innerHTML = writeJS(playername,data1,currWidth,currHeight,auto_tog,random_tog,loop_tog,delay_num,data7);
}

/*
 * embedFlash()
 * 		Verifies client's flash version and embeds the swf object; dimensions are determined by aspect ratio or defined explicitly
 * Parameters:
 *		divId (string) - id of html container
 *		playername (string) - full or relative path to swf file (ie /root/myMovie.swf)
 *		embedWidth (integer)
 *		embedHeight (integer)
 *		aspectRatio (float) - determines if the object should be contrained by height or width
 *		flashvars (object)
 *		params (object)
 *		attributes (object)
 *		minVersion (string) - defaults to 9.0.0
 * Dependencies:
 *		swfobject.js
 */
function embedFlash(divID,playername,embedWidth,embedHeight,aspectRatio,flashvars,params,attributes,minVersion){
	$j(function(){
		var currWidth = 0;
		var currHeight = 0;
		var calcWidth = $j('#'+divID).parent().width();
		var calcHeight = $j('#'+divID).parent().height();
		
		if (!isNaN(parseInt(embedWidth)) && !isNaN(parseInt(embedHeight))) {
			// Enforce Dimensions
			currWidth = parseInt(embedWidth);
			currHeight = parseInt(embedHeight);
		} else {
			
			if(!isNaN(parseInt(embedWidth)))
				calcWidth = parseInt(embedWidth);
			if (isNaN(calcWidth) || calcWidth == 0) 
				calcWidth = 100;
			
			// Auto-size the object
			currWidth = calcWidth;
			currHeight = calcWidth * Math.pow(aspectRatio, -1);
			
		}
		
		if(flashvars == null) flashvars = {};
		if(params == null) params = { wmode: 'transparent' };
		if(attributes == null) attributes = {};
		if(minVersion == '') minVersion = '9.0.0';
		
		var expressInstallPath = null;
		if (typeof flashvars.mini == 'boolean' && !flashvars.mini) {
			if (typeof flashvars.siteurl == 'string') expressInstallPath = flashvars.siteurl + '/cf_media/scripts/expressInstall.swf';
			else expressInstallPath = '../cf_media/scripts/expressInstall.swf';
		}
		
		if (swfobject.hasFlashPlayerVersion(minVersion) || (swfobject.hasFlashPlayerVersion('6.0.65') && (typeof flashvars.mini == 'boolean' && !flashvars.mini))) 
			swfobject.embedSWF(playername, divID, currWidth, currHeight, minVersion, expressInstallPath, flashvars, params, attributes);
		else $j('#' + attributes.id + '_flash_requirement').show();
		
	});
}

/*
 * fsUserLogin()
 *
 */
$j(document).ready(function(){
	if (typeof $j('#fsUserLoginForm').dialog != 'undefined') {
		var firstEl = document.body.firstChild;
		var formHtml = '<div id="fsUserLoginForm" title="User Login">Loading...</div>';
		
		
		$j(formHtml).insertBefore(firstEl);
		$j('#fsUserLoginForm').dialog({
			height: 170,
			width: 425,
			autoOpen: false,
			modal: true
		});
	}
});
function fsUserLogin(){
	var postMediaGroupId = 0;
	var postMediaCheckUser = false;
	var postMediaCheckKey = false;
	
	// Optional arguments, used for login auth from media player
	if(arguments[0]){
		postMediaGroupId = arguments[0];
	}
	if(arguments[1]){
		postMediaCheckUser = true;
	}
	if(arguments[2]){
		postMediaCheckKey = true;
	}
	
	// Listen for Login form submission
	$j(document).on('click', '#submitLogin', function(){
		
		$j.post(pathprefix+'userlogin_remote.cfm', { doAction: "login", username: $j('#usernameLogin').val(), password: $j('#passwordLogin').val(), mediaPasskey: $j('#mediaPasskey').val(), mediaGroupId: postMediaGroupId,  mediaCheckUser: postMediaCheckUser, mediaCheckKey: postMediaCheckKey }, 
			function(data){
				if($j.trim(data) == "SUCCESS"){
					window.location.reload();
				} else {
					$j('#fsUserLoginForm').html(data);
				}
		});
		
		
		return false;
	});
	
	// Listen for forgot login submission
	$j(document).on('click', '#submitForgot', function(){
		
		$j.post(pathprefix+'userlogin_remote.cfm', { doAction: "sendforgot", email: $j('#emailForgot').val() }, function(data){
			$j('#fsUserLoginForm').html(data);
			
			// Listen for Login form submission
			$j('#submitLogin').click(loginFnc);
		});
		
		
		return false;
	});
	
	
	// Initial load of login form
	$j.post(pathprefix+'userlogin_remote.cfm', { mediaGroupId: postMediaGroupId, mediaCheckUser: postMediaCheckUser, mediaCheckKey: postMediaCheckKey }, function(data){
		$j('#fsUserLoginForm').html(data);
	});
	
	// Show it
	$j('#fsUserLoginForm').dialog('open');
}

function resizeResponsiveMediaPlayers() {

	// Look for all responsive media players and recalculate their height based on their width and aspect ratio
	$j('.fsEmbeddedMediaResponsive').each(function() {
		var $this = $j(this);
		$this.height(Math.round($this.width() * $this.data('aspectratio')));
	});
}

var windowResizeTimeout;
$j(window).resize(function() {

	// Clear any previous timeout
	clearTimeout(windowResizeTimeout);

	// Perform actions 250ms after the window has finished resizing
	windowResizeTimeout = setTimeout(function() {

		// Resize all responsive media players when the window has been resized
		resizeResponsiveMediaPlayers();

	}, 250);
});

/*
 * like options()
 *
 */
$j(document).ready(function(){

	// Resize all responsive media players when the page is ready
	resizeResponsiveMediaPlayers();

	$j('a.fs_LikeBtn').on('click',function(){
		var likeBtn = $j(this);
		var likeBtnParent = $j(this).parent('div');
		var postData = {};
		postData['do'] = 'updateLike';
		postData.action = $j(this).attr('data-action');
		postData.likeType = $j(this).attr('data-type');
		postData.primaryKeyValue = $j(this).attr('data-pk');
		postData.personId = $j(this).attr('data-pid');

		$j.ajax({
			type: 'POST',
			url: 'cf_miscpages/likes/ajaxhandler.cfm',
			data: postData,
			success: function(data) {
				try {
					var result = JSON.parse(data);
				} catch(e) {
					var result = { 'SUCCESS' : 0, 'WARNINGS':'Update request failed during parse.' };
				}
				
				if(result['SUCCESS'] != 0 && result['WARNINGS'] == ''){

					if(postData.action == 'like'){
						likeBtn.attr('data-action','unlike').html('Liked');
						likeBtnParent.removeClass('fs_Like').addClass('fs_Liked');
					} else {
						likeBtn.attr('data-action','like').html('Like');
						likeBtnParent.removeClass('fs_Liked').addClass('fs_Like');
					}
					refreshLikeCount(postData.likeType,postData.primaryKeyValue);

				} else {
					alert("ERROR: " + result['WARNINGS']);
				}
			},
			error: function(data) {
				try {
					var result = JSON.parse(data);
					alert("ERROR: " + result['WARNINGS'])
				} catch(e) {
					alert("ERROR: an error occurred during update.")
				}
			}
		});
	})
});

function refreshLikeCount(type,typevalue){
	var postData = {};
	postData['do'] = 'likeCount';
	postData.likeType = type;
	postData.primaryKeyValue = typevalue;

	$j.ajax({
		type: 'POST',
		url: 'cf_miscpages/likes/ajaxhandler.cfm',
		data: postData,
		success: function(data) {
			if(isNaN(data)){
				return false;
			} else {
				$j('span.fs_likeCount_' + postData.primaryKeyValue).html(data);
			}
		},
		error: function(data) {
			//alert("ERROR: " + data)
		}
	});
}

function printpage(){
	thestring = location.search.substring(1);
	var findid = thestring.indexOf('id=');
	var findp = thestring.indexOf('p=');
	if (thestring.length == 0){thestring = 'p=' + pageid}
	else if (findid == -1 && findp == -1){thestring = thestring + '&p='+pageid}
   
	for (var f = 0; f<document.forms.length; f++)
		{
		for (var i = 0; i<document.forms[f].length; i++)
			{
			
			// for some reason this chokes on fieldsets in FF
			if ( document.forms[f].elements[i].tagName == "FIELDSET" || document.forms[f].elements[i].tagName == "fieldset" ) { i++ } 
			
			if (thestring.indexOf(document.forms[f].elements[i].name) == -1 && document.forms[f].elements[i].value != "" && document.forms[f].elements[i].type != "submit" && document.forms[f].elements[i].name != "" && document.forms[f].elements[i].name.indexOf('savecontent') == -1 && document.forms[f].elements[i].name.indexOf('savetext') == -1 && document.forms[f].elements[i].name != "p" && thestring.indexOf(document.forms[f].elements[i].name) == -1  && document.forms[f].elements[i].name != "do" && document.forms[f].elements[i].name != "calid_pull" && document.forms[f].elements[i].name != "customizeit" && document.forms[f].elements[i].name != "searchstart" && document.forms[f].elements[i].name.indexOf('pass') == -1 && document.forms[f].elements[i].name != "username" && document.forms[f].elements[i].name.indexOf('google.com') == -1 && document.forms[f].elements[i].name != "email" && document.forms[f].elements[i].name != "hl" && document.forms[f].elements[i].name != "service" && document.forms[f].elements[i].name != "nui" && document.forms[f].elements[i].name != "persistentCookie")
				{
				if (document.forms[f].elements[i].type == 'checkbox') 
					{
						if (document.forms[f].elements[i].checked == true) 
							{
								thestring = thestring + "&" + document.forms[f].elements[i].name + "=" + document.forms[f].elements[i].value;
							} 
					}
				else {
					if (document.forms[f].elements[i].value.indexOf('&') == -1)
						{thestring = thestring + "&" + document.forms[f].elements[i].name + "=" + document.forms[f].elements[i].value;}
					else
						{
							var splitValue = document.forms[f].elements[i].value.split("&");
							for(v = 0; v < splitValue.length; v++){
								if (thestring.indexOf(splitValue[v]) == -1)
									{thestring = thestring + "&" + splitValue[v]}
							}
						}
					}
				}
			}
		}

	var url = 'pageprintd41d.html?'+thestring;
	var properties = 'toolbar=yes,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes,width=650,height=600';
	printpop = window.open(url,'Print', properties);
	printpop.focus();
}

function emailpage(){
	thestring = location.search.substring(1);
	var findid = thestring.indexOf('id=');
	var findp = thestring.indexOf('p=');
	if (thestring.length == 0){thestring = 'p=' + pageid}
	else if (findid == -1 && findp == -1){thestring = thestring + '&p='+pageid}
	
	if(window.jQuery){
		var $j = jQuery,
			ins = $j('input[type!=submit],textarea,select'),
			ignoreExact = /$p|do|calid_pull|customizeit|searchstart|username|email|hl|service|nui|persistantcookie^/i,
			ignorePart = /savecontent|savetext|pass|google\.com/i,
			splitValue,v;
		ins.each(function(i,e){
			//Test to see if we have seen this elements name already and if it has a name and value that are not blank
			if(thestring.indexOf(this.name) == -1 && this.name.length > 0 && this.value != ''){
				//Make sure this name isn't on our ignore lists
				if(!ignoreExact.test(this.name) && !ignorePart.test(this.name)){
					if(this.type == 'checkbox'){
						if(this.checked){
							thestring += "&" + this.name + "=" + this.value;
						}
					} else {
						if (this.value.indexOf('&') == -1){
							thestring += "&" + this.name + "=" + this.value;
						} else {
							splitValue = this.value.split("&");
							for(v = 0; v < splitValue.length; v++){
								if (thestring.indexOf(splitValue[v]) == -1) {
									thestring += "&" + splitValue[v];
								}
							}
						}
					}
				}
			}
			
		});
		
		// good greif
		// if this is a form page, just grab the url
		if ( $j("div.formPage").length > 0 ) {

			thestring = location.search.substring(1);
			if (thestring.length == 0){thestring = 'p=' + pageid}
			else if (findid == -1 && findp == -1){thestring = thestring + '&p='+pageid}

		}
	}else{
		for (var f = 0; f<document.forms.length; f++){
			for (var i = 0; i<document.forms[f].length; i++){
				if (thestring.indexOf(document.forms[f].elements[i].name) == -1 && document.forms[f].elements[i].value != "" && document.forms[f].elements[i].type != "submit" && document.forms[f].elements[i].name != "" && document.forms[f].elements[i].name.indexOf('savecontent') == -1 && document.forms[f].elements[i].name.indexOf('savetext') == -1 && document.forms[f].elements[i].name != "p" && document.forms[f].elements[i].name != "do" && document.forms[f].elements[i].name != "calid_pull" && document.forms[f].elements[i].name != "customizeit" && document.forms[f].elements[i].name != "searchstart" && document.forms[f].elements[i].name.indexOf('pass') == -1 && document.forms[f].elements[i].name != "username" && document.forms[f].elements[i].name.indexOf('google.com') == -1 && document.forms[f].elements[i].name != "email" && document.forms[f].elements[i].name != "hl" && document.forms[f].elements[i].name != "service" && document.forms[f].elements[i].name != "nui" && document.forms[f].elements[i].name != "persistentCookie") {
					if (document.forms[f].elements[i].type == 'checkbox') {
						if (document.forms[f].elements[i].checked == true) {
							thestring = thestring + "&" + document.forms[f].elements[i].name + "=" + document.forms[f].elements[i].value;
						} 
					} else {
						if (document.forms[f].elements[i].value.indexOf('&') == -1){
							thestring = thestring + "&" + document.forms[f].elements[i].name + "=" + document.forms[f].elements[i].value;
						} else {
							var splitValue = document.forms[f].elements[i].value.split("&");
							for(v = 0; v < splitValue.length; v++){
								if (thestring.indexOf(splitValue[v]) == -1) {
									thestring = thestring + "&" + splitValue[v];
								}
							}
						}
					}
				}
			}
		}
	}

	var url = 'pageemaild41d.html?'+thestring;
	var properties = 'toolbar=yes,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes,width=420,height=300';
	emailpop = window.open(url,'Email', properties);
	emailpop.focus();
}

var editState = 1;
var oldEditState = editState;

function confirmIt(){
	if (editState == 1) {}
	else {return("You have not saved the latest changes made to this page. The\nchanges will be discarded if you leave before clicking 'save changes'.")}
}

function writeDate(){
var months=new Array(13);
months[1]="January";
months[2]="February";
months[3]="March";
months[4]="April";
months[5]="May";
months[6]="June";
months[7]="July";
months[8]="August";
months[9]="September";
months[10]="October";
months[11]="November";
months[12]="December";
var time=new Date();
var lmonth=months[time.getMonth() + 1];
var date=time.getDate();
var year=time.getYear();
if(year<1000){year = 1900 + year}
return(lmonth + " " + date + ", " + year);
}

function mailMe(which){
	if(typeof _gaq != "undefined"){
		var ah = "mailto:"+unescape(which).replace(/\[nospam\]/,"@");
		// pageTracker._trackEvent('email links', ah , trackingpath + ' [' + unescape(which).replace(/\[nospam\]/,"@") + ']'); //old way
		_gaq.push(['_trackEvent', 'email links',  ah , trackingpath + ' [' + unescape(which).replace(/\[nospam\]/,"@") + ']']);
	}
	window.location="mailto:"+unescape(which).replace(/\[nospam\]/,"@");
}

// Calendar Function
function popEvent(url){
	var properties = 'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes,width=500,height=350';
	var eventpop = window.open(url,'eventpop', properties);
	eventpop.focus();
}

//Editor functions
function editpopUp(id,text,layout,bgcolor,path,width){
	if (path == undefined){path = ''}
	idString = '';
	if (id != 'undefined') {idString = '&id='+id};
	var url = path + "editor/tinymce/popup.cfm?redactorSafe&whichelement="+text+idString;
	var properties = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=650,height=500';
	editpop = window.open(url,'mceEditor', properties);
	if (editpop == null) {alert('Sorry, but we have noticed that your popup-blocker has disabled a window that provides application functionality. You will need to disable popup blocking on this site in order to fully utilize this tool.');}
	else {editpop.focus();}
}

function editorFileBrowser(field_name, url, type, win) {
	// This is where you insert your custom filebrowser logic
	// alert("Example of filebrowser callback: field_name: " + field_name + ", url: " + url + ", type: " + type);
	which_field_name = field_name;
	holdField = field_name;
	which_win = win;
	which_type = type;
	if (type == 'image') {theOpener = 'getimage'; pathprefix = 'uploaded/index.html';}
	else {theOpener = 'editor', pathprefix = '';};
	editorCall = true;
	
	if(typeof baseURL === 'undefined')
		baseURL = '../index.html'
	
	popUrl = baseURL+"/cf_filemanager/adminfiles.cfm?do=refresh&opener="+theOpener;
	var properties = 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=750,height=550';
	filelinksel = window.open(popUrl,'popFilelink', properties);
	if (filelinksel == null) {alert(tinyMCELang['lang_popup_blocked']);}
	else {filelinksel.focus();}
}

function editorReturnImage(which_image) {
	if (which_image != '') {
		if (typeof pathprefix === 'undefined') { pathprefix = '' };
		if (which_image.indexOf('filed41d.html?') != -1) {pathprefix = ''};
		if( typeof which_win == 'object' ) {
			which_win.document.forms[0].elements[which_field_name].value = pathprefix+which_image;
		} else {
			// for media manager file import (which_win was undefined for those calls)
			$j('input##importfm_file').val(pathprefix+which_image);
			$j('input##importfm_file_display').val(pathprefix+which_image);
		}
		if (holdField == 'src' && which_type == 'image') {
			which_win.ImageDialog.showPreviewImage(pathprefix+which_image);
		}
	}
}

function editorUrlConverter(url, node, on_save) {
	
	//leave a tags alone
	if(node == 'a' || (typeof node == "object" && "nodeName" in node && node.nodeName === 'A')) return url;
	
	if (url.indexOf(siteurl) == 0) {
		url = url.replace(siteurl+'/','');
		url = url.replace(siteurl,'');
	}
	if (url.indexOf('http://') == -1) {
		url = url.replace('../index.html#','#');
	}
	return url;
}

function selectColor(field,formName) {
	holdColorField = field;
	if (formName == undefined){formName = 'update'};
	holdColorFormName = formName;	
	thisValue = document[formName][field].value;
	var url = relativeBasePath + "editor/colorcube.cfm?thisvalue="+thisValue;
	var properties = 'toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=no,resizable=yes,width=400,height=280';
	colorpop = window.open(url,'selColor', properties);
	colorpop.focus();
}
	
function returnColor(theColor) {
	document[holdColorFormName][holdColorField].value = theColor;
	document.getElementById(holdColorField+'_preview').style.backgroundColor = theColor;
}

function valuevalidation(entered, min, max, alertbox, datatype) {
	// Value Validation by Henrik Petersen / NetKontoret
	// Explained at www.echoecho.com/jsforms.htm
	// Please do not remove this line and the two lines above.
	with (entered)
	{
	checkvalue=parseFloat(value);
	if (datatype)
	{smalldatatype=datatype.toLowerCase();
	if (smalldatatype.charAt(0)=="i") {checkvalue=parseInt(value)};
	}
	if ((parseFloat(min)==min && checkvalue<min) || (parseFloat(max)==max && checkvalue>max) || value!=checkvalue)
	{if (alertbox!="") {alert(alertbox);} return false;}
	else {return true;}
	}
}

// Dropbox Function
function popDropboxUpload(pageId, occurId){
	var url = 'extensions/includes/dropbox/dropbox_upload.html';
	if(window.location.href.indexOf('extensions/includes/dropbox') != -1){
		url = 'dropbox_upload.html';
	}
	
	url += '?pageId=' + pageId;
	url += '&occurId=' + occurId;
	
	if(arguments[2]){
		url += '#submissions';
	}
	
	var dropboxup = window.open(url, 'dropboxUpload', 'height=550,width=425,status=no,toolbar=no,menubar=no,location=no,scrollbars=yes');
	dropboxup.focus();
}



//Email validator
FS.validateEmail = function validateEmail(email)
{
	var exp = /^(?:[a-zA-Z0-9_'^&amp;/+-])+(?:\.(?:[a-zA-Z0-9_'^&amp;/+-])+)*@(?:(?:\[?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\.){3}(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\]?)|(?:[a-zA-Z0-9-]+\.)+(?:[a-zA-Z]){2,}\.?)$/;
	return exp.test(email);
	// Syntax coloring fix '
}

//Receive logoff message
if(window.postMessage){
	function onLogoffMessage(msg){
		msg = msg.originalEvent;
		if(msg.data && msg.data == 'logoff'){
			msg.source.postMessage("complete","*");
			window.location.replace("userlogoff.html");
		}
	}
	$j(window).bind('message',onLogoffMessage);
}
