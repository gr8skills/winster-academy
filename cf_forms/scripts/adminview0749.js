// ==================
// ! DOCUMENT READY
// ==================
$j(document).ready(function() {

	//relative links will be off by one level
	$j('form,#confirmOut').find('a:not([href^="//"], [href^="http"], [href^="mailto"], [href^="javascript:"])').each( function(){
		$j(this).attr('href', '../'+$j(this).attr('href').replace(/^\/+/, ''));
	});

	// all image references will be off by one directory level
/*	$j(".cf_form").find("img").each( function() {

		var thisSrc = $j(this).attr( "src" );

		$j(this).attr( "src", "../" + thisSrc );
	} );
	*/
});
