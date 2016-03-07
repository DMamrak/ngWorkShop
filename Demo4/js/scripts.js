angular.module('todo', ['ngRoute']);

angular.module('todo').config(function($routeProvider, $httpProvider){
	$routeProvider
		.when('/login', {
			templateUrl: 'tpl/login.html',
			controller: 'LoginCtrl as login',
			resolve: {
				User: 'SessionResolver'
			}
		})
		.when('/todo', {
			templateUrl: 'tpl/todo.html',
			controller: 'TodoCtrl',
			reloadOnSearch: false,
			resolve: {
				User: 'SessionResolver'
			},
		})
		.otherwise('/login');

	$httpProvider.interceptors.push('SessionInterceptor');
});

angular.module('todo').run(function($rootScope, $location){
	$rootScope.$on('$routeChangeSuccess', function(e, prev, next){
		console.log('error')
		//$location.path('/login');
	});
});

angular.module('todo').service('SessionInterceptor', function(){
	var _this = this;

	_this.request = function(config){
		console.log(config)
		return config;
	};

	_this.requestError = function(error){
		console.log(error)
		return error;
	};

	_this.response = function(response){
		console.log(response)
		return response;
	};

	_this.responseError = function(error){
		console.log(error)
		return error;
	};

});

angular.module('todo').service('SessionResolver', function($location, Loader){
	console.log('resolving');
	return Loader
		.get('user')
		.then(
			function(user){
				console.log('resolve success');
				return user;
			},
			function(){
				console.log('resolve error');
				return false;
			}
		);
});

angular.module('todo').service('Loader', function($q, $timeout){
	var _this = this;

	_this.get = function(name){
		var result = sessionStorage.getItem(name);
		var deferred = $q.defer();
		var timeout = Math.round(Math.random() * 1000);

		$timeout(function(){
			if(result){
				deferred.resolve(angular.fromJson(result));
			}else{
				deferred.reject();
			}
		}, timeout);

		return deferred.promise;
	};

	_this.post = function(name, data){
		var timeout = Math.round(Math.random() * 1000);
		if(data){
			sessionStorage.setItem(name, angular.toJson(data));
		}else{
			sessionStorage.removeItem(name);
		}

		var deferred = $q.defer();

		$timeout(function(){
			deferred.resolve();
		}, timeout);

		return deferred.promise;
	};
});

angular.module('todo').controller('HeaderCtrl', function($scope, $location){
	var _this = this;

	$scope.$on('$routeChangeSuccess', function(e){
		var path = $location.path();
		_this.path = path.replace('/', '');
	});
});

angular.module('todo').controller('LoginCtrl', function(Loader, User){
	var _this = this;
	_this.user = User;

	_this.login = function(){
		Loader
			.post('user', {
				name: _this.user.name,
				password: _this.user.password,
				logged: true
			})
			.then(function(){
				 _this.user.logged = true;
			});
	};

	_this.logout = function(){
		Loader
			.post('user', null)
			.then(function(){
				 _this.user.logged = false;
			});
	};
});


// Todos page main controller
angular.module('todo').controller('TodoCtrl', function($scope, $location, $http, $timeout, Loader){
	'use strict';

	// Declaring initial values
	$scope.activities = [];
	$scope.current = {};
	$scope.dialog = {
		show: false,
	};

	var activities = [];

	// Binding $scope.filters to the URL query string for deep linking
	$scope.filters = $location.search();
	$scope.$on('$routeUpdate', function(e){
		$scope.filters = $location.search();
	});

	// Fetching the data
	Loader
		.get('activities')
		.then(function(result){
			$scope.activities = result;
		});

	// Binding URL query string to the $scope.filters for deep linking
	$scope.updateURL = function(){
		$location.search($scope.filters);
	};

	// Adding an item
	$scope.add = function(){
		$scope.dialog.show = true;
		activities = $scope.activities.concat([$scope.current]);
	};

	// Editing an item
	$scope.edit = function(selected){
		$scope.dialog.show = true;
		$scope.current = angular.copy(selected);
		activities = $scope.activities.map(function(item){
			return item != selected ? item : $scope.current;
		});
	};

	// Removing an item
	$scope.remove = function(selected){
		activities = $scope.activities.filter(function(item){
			return item != selected;
		});
		save(activities);
	};


	$scope.change = function($event, item){
		console.log('change: ', $event, item.done);
	};

	// Toggling activity status
	$scope.toggle = function($event, item){
		console.log('click: ', $event, item.done);
	};

	// Submitting action
	$scope.submit = function(){
		$scope.current = {};
		$scope.dialog.show = false;
		save(activities);
	};

	// Canceling action
	$scope.cancel = function(){
		$scope.current = {};
		$scope.dialog.show = false;
	};

	// Saving items list on the "server side"
	function save(){
		Loader
			.post('activities', activities)
			.then(function(){
				$scope.activities = activities;
				$scope.current = {};
			});
	}
});


// Multipurpose dialog window component
angular.module('todo').directive('xtWin', function(){
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			title: '@title',
			submit: '&submit',
			cancel: '&cancel',
		},
		templateUrl: function($element, $attrs){
			return $attrs.template;
		},
		link: function($scope, $element, $attrs){

		}
	};
});


// Multipurpose filters component
angular.module('todo').directive('xtFilters', function(){
	return {
		restrict: 'E',
		replace: true,
		scope: {
			filters: '=filters',
			change: '&change',
		},
		templateUrl: function($element, $attrs){
			return $attrs.template;
		},
		link: function($scope, $element, $attrs){
			// Clearing the filters
			$scope.clear = function(){
				$scope.filters = {};
				$scope.change();
			};
		}
	};
});


// Returns the length of given object
// using either built in "length" property
// or enumerable keys number
angular.module('todo').filter('length', function(){
	return function(input){
		var result;
		if(input){
			result = 0;
			if(input.length){
				result = input.length;
			}else{
				for(var key in input){
					result += 1;
				}
			}
		}
		return result;
	};
});


/*
angular.module('todo').directive('dir', function(){
	return {
		replace: true,
		restrict: 'E',
		scope: {
			title: '@index'
		},
		transclude: true,
		template: '<div>Mydir: <span ng-transclude></span> / {{title}} </div>',
		controller: function($scope, $transclude){
			this.scope = $scope;
			console.log($scope);
			console.log('controller', arguments);
			$transclude(function($tscope, $telement){
				console.log('$transclude', arguments);
			});
		},
		compile: function(){
			console.log('compile', arguments);
			return {
				pre: function($scope){
					console.log('pre', $scope.title, arguments);
				},
				post: function($scope){
					console.log('post', $scope.title, arguments);
				}
			};
		}
	};
});


angular.module('todo').directive('dir2', function(){
	return {
		replace: true,
		restrict: 'A',
		require: '?^dir',
		link: function(scope, element, attrs, controller){
			console.log(scope, controller.scope);
		}

	};
});
*/