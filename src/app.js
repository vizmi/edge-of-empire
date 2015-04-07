var master;
$.ajax({ url: "data/master.json", dataType: "json" })
.done(function( data ) {
	master = data;
	React.render(
		<h1>{master.species[3].name}</h1>,
		document.getElementById('example')
		);
})
.fail(function( request, errorMsg, exception ) {
	alert('fail ' + errorMsg);
});
