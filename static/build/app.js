var master;
$.ajax({ url: "data/master.json", dataType: "json" })
.done(function( data ) {
	master = data;
	React.render(
		React.createElement("h1", null, master.species[3].name),
		document.getElementById('example')
		);
})
.fail(function( request, errorMsg, exception ) {
	alert('fail ' + errorMsg);
});
