var express = require('express');
var app = express();

app.use(express.static('client'));

var domain = process.env.DOMAIN || '';
var port = process.env.PORT || 5000;

app.listen(port, function() {
	console.log('Edge of the Empire is listening at http://%s:%s', domain, port);
});
