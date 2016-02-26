angular.module('todo', []);

angular.module('todo').service('Loader', function($q, $http, $window){
	var _this = this;

	_this.init = function(url1, url2){
		$q.all([
			$http.get(url1),
			$http.get(url2)
		])
		.then(function(){

		});
	};

	_this.get = function(url, params){
		return $http.get(url, params)
			.error(errorHandler);
	};

	_this.post = function(url, params){
		return $http.get(url, params)
			.error(errorHandler);
	};

	function errorHandler(error){
		$window.alert(error);
	}

});

angular.module('todo').controller('TodoCtrl', function($scope, Loader){
	var _this = this;
	
	_this.activities = [];
	_this.new = {};
	_this.search = '';
	_this.order = 'name';

	_this.add = function(){
		_this.activities.push(_this.new);
		_this.new = {};
	};

	_this.remove = function(){

	};

	Loader.init('data.json', 'data2.json');

	/*
	Loader.get('data.json', {})
		.success(function(response){
			_this.activities = response;
		});
	*/
});

