// Defining main app module, injecting dependancies
angular.module('todo', ['ngRoute', 'ngAnimate']);


// Config block. Executed before app takes off, contains pre-run configuration
angular.module('todo').config(function($routeProvider){
	$routeProvider
		.when('/login', {
			templateUrl: 'tpl/login.html',
			controller: 'LoginCtrl as login',
		})
		.when('/todo', {
			templateUrl: 'tpl/todo.html',
			controller: 'TodoCtrl',
			reloadOnSearch: false,
			resolve: {
				session: function(Session){
					return Session.get();
				},
			},
		})
		.when('/demo', {
			templateUrl: 'tpl/demo.html',
			controller: 'DemoCtrl',
			reloadOnSearch: false,
			resolve: {
				session: function(Session){
					return Session.get();
				},
			},
		})
		.otherwise('/login');
});


// Run block. Executed once application takes off
angular.module('todo').run(function($rootScope, $location){
	// Watching for route change errors, thrown by route resolvers, and redirecting to the Login page
	$rootScope.$on('$routeChangeError', function($event, newPath, oldPath){
		$location.path('/login');
	});
});


// Service mocking asynch http GET and POST requests
angular.module('todo').service('Loader', function($http){
	var _this = this;

	// Public property to expose service busy state
	_this.busy = false;

	// Getting data from storage asynchronously with random time delay
	_this.get = function(url, data){
		_this.busy = true;
		return $http
			.get(url, data)
			.success(success)
			.error(error);
	};

	// Adding data
	_this.post = function(url, data){
		_this.busy = true;
		return $http
			.post(url, data)
			.success(success)
			.error(error);
	};

	// Editing data
	_this.patch = function(url, data){
		_this.busy = true;
		return $http
			.patch(url + '/' + data.id, data)
			.success(success)
			.error(error);
	};

	// Removing item
	_this.delete = function(url, data){
		_this.busy = true;
		return $http
			.delete(url + '/' + data.id, data)
			.success(success)
			.error(error);
	};

	function success(){
		_this.busy = false;
	}

	function error(){
		_this.busy = false;
	}
});


// Service incapsulating session resolving logic
angular.module('todo').service('Session', function($q, Loader){
	var _this = this;

	_this.get = function(){
		// Generating custom promise to be returned to route resolver
		var deferred = $q.defer();
		var data = angular.fromJson(sessionStorage.getItem('user'));
		
		if(data){
			// Session is active, resolving promise immediately
			deferred.resolve(data);
		}else{
			// Session is inactive, rejecting promise immediately
			deferred.reject();
		}

		// Returning generated promise
		return deferred.promise;
	};

	// Creating session
	_this.create = function(data){
		return Loader
			.post('/api/users', data)
			.then(function(){
				sessionStorage.setItem('user', angular.toJson(data));
			});
	};

	// Destroying session
	_this.destroy =  function(){
		sessionStorage.removeItem('user')
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
angular.module('todo').controller('LoginCtrl', function(Session){
	var _this = this;

	_this.user = {
		loaded: false,
		logged:  false,
	};

	// Getting session data on controller initialization
	Session
		.get()
		.then(function(user){
			_this.user = user;
			_this.user.logged = true;
		})
		.finally(function(){
			_this.user.loaded = true;
		});

	// Creating session
	_this.login = function(){
		Session
			.create({
				name: _this.user.name,
				password: _this.user.password,
			})
			.then(function(){
				 _this.user.logged = true;
			});
	};

	// Destroying session
	_this.logout = function(){
		Session
			.destroy()
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
		.get('/api/todos')
		.success(function(result){
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
	};

	// Editing an item
	$scope.edit = function(selected){
		$scope.dialog.show = true;
		// Creating separated activities model to prevent immediate model change
		$scope.current = angular.copy(selected);
	};

	// Removing an item
	$scope.remove = function(selected){
		// Creating separated activities model to prevent immediate model change
		activities = $scope.activities.filter(function(item){
			return item != selected;
		});

		Loader
			.delete('/api/todos', selected)
			.success(function(){
				var index = $scope.activities.indexOf($scope.current);
				$scope.activities.splice(index, 1);
			});
	};

	// Toggling activity status
	$scope.toggle = function(item){
		Loader
			.patch('/api/todos', item)
			.error(function(){
				item.done = !item.done;
			});
	};

	// Submitting action
	$scope.submit = function(){
		$scope.dialog.show = false;

		if($scope.current.id){
			// Saving changes to existing item
			Loader
				.patch('/api/todos', $scope.current)
				.success(function(todo){
					var id = todo.id;
					var item = _.find($scope.activities, {id: id});
					var index = $scope.activities.indexOf(item);
					$scope.activities[index] = todo;
					$scope.current = {};
				});
		}else{
			// Creating new item
			Loader
				.post('/api/todos', $scope.current)
				.success(function(todo){
					$scope.activities.push(todo);
					$scope.current = {};
				});
		}
	};

	// Canceling action
	$scope.cancel = function(){
		$scope.current = {};
		$scope.dialog.show = false;
	};
});


angular.module('todo').controller('DemoCtrl', function($scope){
	$scope.name = 'demo';


});

// Simple directive to show / hide the spinner while loader is busy
angular.module('todo').directive('xtLoader', function(Loader){
	return {
		restrict: 'E',
		replace: true,
		scope: {},
		templateUrl: function($element, $attrs){
			return $attrs.template;
		},
		link: function($scope, $element, $attrs){
			$scope.loader = Loader;
		},

	};
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
// connects non-Angular date picker
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
				// Calling internal datepicker .destroy() method
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


angular.module('todo').filter('register', function(){
	return function(input){
		console.log('register', input);

		return input;
	}
})