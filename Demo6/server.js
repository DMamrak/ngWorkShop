var url = require('url');
var express = require('express');
var lowdb = require('lowdb');
var underscoredb = require('underscore-db');
var bodyparser = require('body-parser');
var storage = require('lowdb/file-sync');
 
var PORT = 8080; 
var server = express();
var db = lowdb('db.json', {storage: storage});

db._.mixin(underscoredb);

server.use(express.static('app'));
server.use(bodyparser.json());

server
	.route('/api/users')
	.get(function(request, response){
		var query = url.parse(request.url, true).query;
		var users = db('users').filter(query) || [];
		response.send(users);
	})
	.post(function(request, response){
		console.log(request.body)
		var user = db('users').insert(request.body);
		response.send(user);
	});

server
	.route('/api/users:id')
	.get(function(request, response){
		var id = request.params.id;
		var user = db('users').find({id: id}) || {};
		response.send(user);
	})
	.post(function(request, response){
		var id = request.params.id;
		var user = db('users').chain().find({id: id}).assign(request.body).value();
		response.send(user);
	});

server.listen(PORT, function(){
	console.log('Server is listening on port ' + PORT);
});