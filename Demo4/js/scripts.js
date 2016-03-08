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


// Tiny controller to expose current page to the main menu
angular.module('todo').controller('HeaderCtrl', function($scope, $location){
	var _this = this;

	$scope.$on('$routeChangeSuccess', function(e){
		var path = $location.path();
		_this.path = path.replace('/', '');
	});
});


// Login page main controller
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

	// Declaring initial values:
	// Todos (activities) list
	$scope.activities = [];
	// Selected list item
	$scope.current = {};
	// Dialog window state
	$scope.dialog = {
		show: false,
	};

	// Temporary storage for changed $scope.activities version.
	// Made in order to prevent changing the real model instantly,
	// and apply changes only after successfully posting them to the server.
	var activities = [];

	// Binding $scope.filters to the URL query string for deep linking
	// Gettin the initial value from the URL first
	$scope.filters = $location.search();
	// Tnen updating the value each time user changes the URL manually
	$scope.$on('$routeUpdate', function(e){
		$scope.filters = $location.search();
	});

	// Fetching the list and exposing it to the template
	Loader
		.get('activities')
		.then(function(result){
			$scope.activities = result;
		});

	// Binding URL query string to the $scope.filters for deep linking
	// This function is called whenever filters are changed
	$scope.updateURL = function(){
		$location.search($scope.filters);
	};

	// Adding an item to the list
	$scope.add = function(){
		$scope.dialog.show = true;
		// Creating separated activities model to prevent immediate model change
		activities = $scope.activities.concat([$scope.current]);
	};

	// Editing an item
	$scope.edit = function(selected){
		$scope.dialog.show = true;
		// Creating separated activities model to prevent immediate model change
		$scope.current = angular.copy(selected);
		activities = $scope.activities.map(function(item){
			return item != selected ? item : $scope.current;
		});
	};

	// Removing an item
	$scope.remove = function(selected){
		// Creating separated activities model to prevent immediate model change
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
				// Applying changes to the model after successfully saving them
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


// Templateless directive
// connects jQuery date picker
// to the Angular application
angular.module('todo').directive('xtPikaday', function(){
	return {
		restrict: 'A',
		scope: true,
		link: function($scope, $element, $attrs){
			// Getting a reference to the DOM element, not jQuery wrapper
			var element = $element[0];
			// Getting format string from directive attribute
			var format  = $attrs.xtPikaday; 
			
			// Making new datepicker
			var picker = new Pikaday({
				field: element,
				format: format,
				onOpen: open,
				onSelect: select,
			});

			// Listening to the destroy events in order to destroy datepicker properly
			$scope.$on('$destroy', destroy);

			function open(){
				// Making datepisker show proper date on opening
				var date = $element.val();
				picker.setDate(date);
			}

			function select(){
				// Starting digest loop whenever user selects a date
				$scope.$digest();
			}

			function destroy(){
				// Calling interna; datepicker .destroy() method
				// in order to remove listeners and DOM nodes
				// when directive is about to be destroyed.
				picker.destroy();
			}
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