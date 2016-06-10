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
	.post(function(request, response){
		var name = request.body.name;
		var password = request.body.password;
		var user = db('users').find({name: name, password: password});
		if(user){
			respond(response, user);
		}else{
			respond(response, {error: 'username / password not found'}, 404);
		}
	});

server
	.route('/api/todos')
	.get(function(request, response){
		var data = db('todos');
		respond(response, data);
	})
	.post(function(request, response){
		var id = uid('todos');
		var date = Date.now();
		var data = _.assign({}, request.body, {
			id: id,
			created: date,
			updated: date
		});
		var todo = db('todos').chain().push(data).find({id: id}).value();
		respond(response, todo);
	});

server
	.route('/api/todos/:id')
	.get(function(request, response){
		var id = _.toNumber(request.params.id);
		var todo = db('todos').find({id: id}) || {};
		respond(response, todo);
	})
	.patch(function(request, response){
		var id = _.toNumber(request.params.id);
		var date = Date.now();
		var data = _.assign({}, request.body, {
			updated: date
		});
		var todo = db('todos').chain().find({id: id}).assign(data).value();
		respond(response, todo);
	})
	.delete(function(request, response){
		var id = _.toNumber(request.params.id);
		db('todos').remove({id: id});
		respond(response);
	});

server.listen(PORT, function(){
	console.log('Server is listening on port ' + PORT);
});

function respond(response, data, status){
	var delay = 500 + Math.round(Math.random() * 1000);
	setTimeout(function(){
		response.status(status || 200).send(data);
	}, delay);
}

function uid(table){
	var max = db(table).reduce(function(id, item){
		return Math.max(id, item.id);
	}, 0);
	return max + 1;
}