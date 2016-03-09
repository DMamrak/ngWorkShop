angular.module('todo', ['ngRoute']);


// Config block. Executed before app takes off, contains pre-run configuration
angular.module('todo').config(function($routeProvider){
	$routeProvider
		.when('/login', {
			templateUrl: 'tpl/login.html',
			controller: 'LoginCtrl as login',
			resolve: {
				User: function(Session){
					return Session.get()
						.then(
							function(response){
								return response;
							},
							function(){
								return false;
							}
						);
				},
			},
		})
		.when('/todo', {
			templateUrl: 'tpl/todo.html',
			controller: 'TodoCtrl',
			reloadOnSearch: false,
			resolve: {
				User: function(Session){
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


// Service incapsulating session resolving logic
angular.module('todo').service('Session', function($q, Loader){
	var _this = this;

	_this.user = null;

	_this.get = function(){
		// Generating custom promise to be returned to route resolver
		var deferred = $q.defer();
		
		if(_this.user){
			// Already logged in, resolving promise immediately
			deferred.resolve(_this.user);
		}else{
			// Not logged in yet, getting session data from the server
			Loader
				.get('user')
				.then(
					function(response){
						// Session is active, resolving promise
						_this.user = response;
						deferred.resolve(response);
					},
					function(error){
						// Session is inactive, rejecting promise
						_this.user = null;
						deferred.reject(error);
					}
				);
		}

		// Returning generated promise
		return deferred.promise;
	};

	_this.set = function(data){
		Loader
			.post('user', data)
			.then(function(){
				
			});
	};
});


// Service mocking asynch http GET and POST requests
angular.module('todo').service('Loader', function($q, $timeout){
	var _this = this;

	// Public property to expose service busy state
	_this.busy = false;

	// Getting data from storage asynchronously with random time delay
	_this.get = function(name){
		_this.busy = true;
		var result = sessionStorage.getItem(name);
		var deferred = $q.defer();
		var timeout = Math.round(Math.random() * 1000);

		$timeout(function(){
			if(result){
				// Resolving if key is found in the storage
				deferred.resolve(angular.fromJson(result));
			}else{
				// Rejecting if there's no given key
				deferred.reject();
			}
			_this.busy = false;
		}, timeout);

		return deferred.promise;
	};

	// Adding / removing data
	_this.post = function(name, data){
		_this.busy = true;
		var timeout = Math.round(Math.random() * 1000);
		if(data){
			// Adding item if the request was made with payload
			sessionStorage.setItem(name, angular.toJson(data));
		}else{
			// Removing item otherwise
			sessionStorage.removeItem(name);
		}

		var deferred = $q.defer();

		$timeout(function(){
			// Resolving the request (always successfull)
			deferred.resolve();
			_this.busy = false;
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
angular.module('todo').controller('LoginCtrl', function(Session){
	var _this = this;
	_this.user = Session.user;

	_this.login = function(){
		Loader
			.post('user', {
				name: _this.user.name,
				password: _this.user.password,
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

	// Toggling activity status
	$scope.toggle = function(item){
		save($scope.activities)
			.then(null, function(){
				item.done = !item.done;
			});
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
	function save(activities){
		return Loader.post('activities', activities)
			.then(function(){
				// Applying changes to the model after successfully saving them
				$scope.activities = activities;
				$scope.current = {};
			});
	}
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