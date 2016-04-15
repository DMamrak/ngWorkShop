var url = require('url');
var express = require('express');
var lowdb = require('lowdb');
var bodyparser = require('body-parser');
var storage = require('lowdb/file-sync');
var _ = require('lodash');
 
var PORT = 8080; 
var server = express();
var db = lowdb('db.json', {storage: storage});

server.use(express.static('app'));
server.use(bodyparser.json());

server
	.route('/api/users')
	.get(function(request, response){
		var query = url.parse(request.url, true).query;
		var page = _(query).pick(['start', 'end']).defaults({start: 0, end: 5}).value();
		var filter = _(query).omit(['start', 'end']).value();
		var users = db('users').chain().filter(filter).slice(page.start, page.end).value() || [];
		respond(response, users);
	})
	.post(function(request, response){
		var id = uid('users');
		var date = Date.now();
		var data = _.assign({}, request.body, {
			id: id,
			created: date,
			updated: date
		});
		var user = db('users').push(data);
		respond(response, user);
	});

server
	.route('/api/users/:id')
	.get(function(request, response){
		var id = _.toNumber(request.params.id);
		var user = db('users').find({id: id}) || {};
		respond(response, user);
	})
	.post(function(request, response){
		var id = _.toNumber(request.params.id);
		var date = Date.now();
		var data = _.assign({}, request.body, {
			updated: date
		});
		var user = db('users').chain().find({id: id}).assign(data).value();
		respond(response, user);
	});

server.listen(PORT, function(){
	console.log('Server is listening on port ' + PORT);
});

function respond(response, data){
	var delay = 500 + Math.round(Math.random() * 1000);
	setTimeout(function(){
		response.send(data);
	}, delay);
}

function uid(table){
	var max = db(table).reduce(function(id, item){
		return Math.max(id, item.id);
	}, 0);
	return max + 1;
}