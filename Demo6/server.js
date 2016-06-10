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

		var debug   = _(query).pick(['error']).defaults({error: false}).value();
		var page    = _(query).pick(['start', 'end']).defaults({start: 0, end: 5}).value();
		var sorting = _(query).pick(['sort', 'order']).defaults({sort: 'updated', order: 'desc'}).value();
		var filter  = _(query).omit(['start', 'end', 'sort', 'order', 'error']).value();
		
		var total = db('users').filter(filter);
		var users = _(total).orderBy(sorting.sort, sorting.order).slice(page.start, page.end).value() || [];
		
		var data = {
			meta: {
				start: page.start,
				end: page.end,
				total: total.length
			},
			data: users
		};

		respond(response, data, debug);
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
	.patch(function(request, response){
		var id = _.toNumber(request.params.id);
		var date = Date.now();
		var data = _.assign({}, request.body, {
			updated: date
		});
		var user = db('users').chain().find({id: id}).assign(data).value();
		respond(response, user);
	})
	.delete(function(request, response){
		var ids = request.params.id.split(';');
		for(var i=0; i<ids.length; i++){
			var id = _.toNumber(ids[i]);
			db('users').remove({id: id});
		}
		respond(response);
	});

server.listen(PORT, function(){
	console.log('Server is listening on port ' + PORT);
});

function respond(response, data, debug){
	var delay = 500 + Math.round(Math.random() * 1000);
	setTimeout(function(){
		if(debug && debug.error){
			response.status(500).send({error: 'Something went really wrong. We are working hard to solve the problem.'});
		}else{
			response.send(data);
		}
	}, delay);
}

function uid(table){
	var max = db(table).reduce(function(id, item){
		return Math.max(id, item.id);
	}, 0);
	return max + 1;
}