angular.module('todo', ['ngRoute']);


angular.module('todo').config(function($routeProvider){
	$routeProvider
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'LoginCtrl',
		})
		.when('/todo', {
			templateUrl: 'todo.html',
			controller: 'TodoCtrl as todos',
			reloadOnSearch: false,
		})
		.when('/todo/:done', {
			templateUrl: 'todo.html',
			controller: 'TodoCtrl as todos',
		})
		.otherwise('/login');
});

angular.module('todo').run(function($rootScope, $location, User){
	$rootScope.$on('$routeChangeStart', function(e){
		if(!User.state.logged){
			$location.path('/login');
		}
	});
});

angular.module('todo').service('User', function(){
	var _this = this;

	_this.state = {
		logged: false
	};
});

angular.module('todo').controller('LoginCtrl', function($scope, $http, User){
	$scope.state = User.state;

	$scope.logIn = function(){
		$http
			.get('data1.json')
			.then(function(){
				User.state.logged = true;
			});
	};

});

angular.module('todo').service('Loader', function($q, $http, $window){
	var _this = this;

	_this.init = function(){

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

angular.module('todo').controller('TodoCtrl', function($q, $http, $scope, $routeParams, $location, Loader){
	var _this = this;

	_this.order = $location.search().order;

	$scope.$on('$routeUpdate', function(e){
		_this.order = $location.search().order;
	})

	_this.activities = [];
	_this.new = {};
	_this.search = '';
	_this.order = '';
	_this.filters = {
		order: ''
	}

	_this.queryUpdate = function(){
		$location.search({
			order: _this.order
		})
	};

	_this.add = function(){
		_this.activities.push(_this.new);
		_this.new = {};
	};

	_this.remove = function(){

	};

	$http
		.get('data1.json')
		.then(function(result){

			return 	Promise.all([
				Promise.resolve(result),
				$http.get('data2.json'),
				$http.get('data3.json'),
			])
		})
		.then(
			function(results){
				var data = results.map(function(item){
					return item.data[0];
				});

				console.log(data);
			},
			function(error){

				$q.reject('error messages')
			});

});

