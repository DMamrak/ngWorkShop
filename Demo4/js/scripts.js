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
				console.log('resolve success')
				return user;
			},
			function(){
				console.log('resolve error')
				return false;
			}
		);
});

angular.module('todo').service('Loader', function($q, $timeout){
	var _this = this;

	_this.get = function(name){
		var result = sessionStorage.getItem(name);
		var deferred = $q.defer();

		$timeout(function(){
			if(result){
				deferred.resolve(angular.fromJson(result));
			}else{
				deferred.reject();
			}
		}, 500);

		return deferred.promise;
	};

	_this.post = function(name, data){
		if(data){
			sessionStorage.setItem(name, angular.toJson(data));
		}else{
			sessionStorage.removeItem(name);
		}

		var deferred = $q.defer();

		$timeout(function(){
			deferred.resolve();
		}, 500);

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

angular.module('todo').controller('TodoCtrl', function($scope, $location, $http, Loader){
	//var _this = this;

	$scope.activities = [];
	$scope.current = {};

	$scope.query = $location.search();
	$scope.$on('$routeUpdate', function(e){
		$scope.query = $location.search();
	})

	Loader
		.get('todos')
		.then(function(result){
			$scope.activities = result;
		});

	$scope.queryUpdate = function(){
		$location.search($scope.query);
	};

	$scope.add = function(){
		var activities = $scope.activities.concat([$scope.current]);
		debugger
		Loader
			.post('todos', activities)
			.then(function(){
				$scope.activities.push($scope.current);
				$scope.current = {};
			});
	};

	$scope.remove = function(){

	};

	$scope.submit = function(){
		console.log('submit');
	}



	$http
		.get('data/data1.json')
		.then(function(result){

			return 	Promise.all([
				Promise.resolve(result),
				$http.get('data/data2.json'),
				$http.get('data/data3.json'),
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


angular.module('todo').directive('xtWin', function(){
	return {
		restrict: 'AE',
		replace: true,
		scope: {
			title: '@heading',
			todos: '=',
			push: '&',
		},
		templateUrl: function($element, $attrs){
			return $attrs.template;
		},
		link: function($scope, $element, $attrs){
			$scope.ok = function(){

				$scope.push();
			};
		}
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