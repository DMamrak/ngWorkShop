var http = require('http');
var url = require('url');
var dispatcher = require('httpdispatcher');

var PORT=8080; 
var server = http.createServer(handleRequest);

function handleRequest(request, response){
	try{
		console.log(request.url);
		dispatcher.dispatch(request, response);
	}catch(error){
		console.log(error);
	}
}

dispatcher.onGet("/api/data/", function(request, response) {
	var query = url.parse(request.url, true).query;
	var data = {
		value: true
	};
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.write(JSON.stringify(query));
	response.end();
});

dispatcher.onGet("/api/details/", function(request, response) {
	var query = url.parse(request.url, true).query;
	var data = {
		value: true
	};
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.write(JSON.stringify(query.reiuytiuert.eriutyeriuty));
	response.end();
});

server.listen(PORT, function(){
	console.log("Server listening on: http://localhost:%s", PORT);
});

server.on('error', function(error){
	console.log(error);
});