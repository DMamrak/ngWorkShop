angular.module('demo', ['ngRoute', 'common']);

angular.module('common', []);

angular.module('common').run(function($rootScope, $location, User){
	$rootScope.$on('$routeChangeStart', function(){
		if(!User.logged){
			$location.path('/login');
			return false;
		}
	});
});

angular.module('demo').config(function($routeProvider){
    $routeProvider
      .when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl as login',
        reloadOnSearch: false,
      })
      .when('/todo', {
        templateUrl: 'templates/todo.html',
        controller: 'TodoCtrl as todo',
        reloadOnSearch: false,
      })
      .when('/todo/:type', {
        templateUrl: 'templates/todo.html',
        controller: 'TodoCtrl as todo',
        reloadOnSearch: false,
      })
      .otherwise({
        redirectTo: '/todo'
      });
});

angular.module('demo').service('User', function(){
	var _this = this;

	_this.logged = false;
});

angular.module('demo').controller('LoginCtrl', function($scope, $location, User){
	var _this = this;

	_this.logIn = function(){
		User.logged = true;
		$location.path('/');
	};

});

angular.module('demo').controller('MainCtrl', function($scope, $http){
	var _this = this;

	_this.save = function(){
		console.log('save')
	};

	console.log($scope);
	console.log(_this);
	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
});

angular.module('demo').controller('TodoCtrl', function($scope, $http, $routeParams, $location){
	var _this = this;


	_this.window = {
		show: false,
		data: null
	};

	_this.planned = [];

	_this.type = $routeParams.type;
	_this.query = $location.search();

	$scope.$on('$routeUpdate', function(){
		_this.query = $location.search();
	});

	$http.get('data.json')
		.success(function(data){
			_this.planned = data;
		})
		.error(function(error){
			console.log(error);
		});

	_this.filter = function(){
		$location.search(_this.query);
	}

	_this.add = function(e){
		_this.planned.push(_this.new);
		_this.new = {};
	};

	_this.remove = function(activity){
		var index = _this.planned.indexOf(activity);
		_this.planned.splice(index, 1);
	};

	_this.edit = function(activity){
		_this.window = {
			show: true,
			data: activity
		}
	};

	_this.cancel = function(){
		this.window = {
			show: false,
			data: null
		}
	};

	console.log($scope);
	console.log(_this);
	console.log('+++++++++++++++++++++++++');

});

angular.module('demo').controller('ActivityCtrl', function($scope){
	var _this = this;

	_this.edit = function(activity){
		$scope.edit(activity);
	};

	console.log($scope);
	console.log(_this);
	console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
});