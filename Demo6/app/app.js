angular.module('homework', []);

angular.module('homework').service('Data', function(){
	var _this = this;

	var data = {
		name: [
			'John',
			'Paul',
			'Ringo',
			'George',
			'Tom',
			'Nick',
			'Iggy',
			'Daniel',
			'Jim',
			'Victor',
			'Janis',
			'Brian',
			'Robert'
		],
		surname: [
			'Lennon',
			'McCartney',
			'Starr',
			'Harrison',
			'Waits',
			'Cave',
			'Pop',
			'Kahn',
			'Morrison',
			'Tsoi',
			'Joplin',
			'Eno',
			'Fripp'
		],
		role: [
			'SU',
			'AD',
			'AU',
			'UP',
			'VI'
		],
		lang: [
			'EN',
			'DE',
			'FR',
			'IT'
		],
		email: [
			'@gmail.com',
			'@yahoo.com',
			'@hotmail.com',
			'@inbox.com',
			'@ua.fm',
			'@yandex.ru'
		]
	};

	_this.random = function(field){
		var values = data[field];
		var length = values.length - 1;
		var index = Math.round(Math.random() * length);
		return values[index];
	};


});

angular.module('homework').filter('lookup', function(){
	return function(input, type){
		var map = {
			lang: {
				'EN': 'English',
				'DE': 'German',
				'FR': 'French',
				'IT': 'Italian'
			},
			role: {
				'SU': 'Super Admin',
				'AD': 'Admin',
				'AU': 'Author',
				'UP': 'Uploader',
				'VI': 'Visitor'
			}
		};

		var result;

		if(input){
			result = map[type][input] || input;
		}

		return result;
	}
});


angular.module('homework').filter('moment', function() {
	moment.lang('en', {
		relativeTime: {
			future: "in %s",
			past:   "%s",
			s:  "now",
			m:  "a minute ago",
			mm: "%d minutes ago",
			h:  "an hour ago",
			hh: "%d hours ago",
			d:  "a day ago",
			dd: "%d days ago",
			M:  "a month ago",
			MM: "%d months ago",
			y:  "a year ago",
			yy: "%d years ago"
		}
	});

	return function(value, method, argument) {
		if(!isNaN(value)){
			value = parseInt(value);
		}
		return moment(value)[method](argument);
	};
});


angular.module('homework').filter('track', function(){
	return function(value, name){
		console.log(name, ' = ', value)
		return value;
	};
});

angular.module('homework').controller('Main', function($scope, $http, Data){
	$scope.window = {};
	$scope.page = {start: 0, end: 15};
	$scope.sorting = {sort: 'updated', order: 'desc'};
	$scope.filters = {};
	$scope.users = [];
	$scope.current = {};
	$scope.selected = [];
	
	var size = 15;	
	//var total = 100;

	getData();	

	$scope.load = function(){
		$scope.page.start += size;
		$scope.page.end += size;
		getData();
	};

	$scope.add = function(){
		$scope.window = {
			title: 'Add user',
			show: true
		}
	}

	$scope.edit = function(user){
		$scope.current = user;
		$scope.window = {
			title: 'Edit user',
			show: true
		}
	}

	$scope.cancel = function(){
		$scope.window = {
			show: false
		}
	}

	$scope.submit = function(){
		$scope.window = {
			show: false
		}

		var user = $scope.current;

		if(user.id){
			edit(user);
		}else{
			create(user);
		}

	};

	$scope.select = function(user){
		if(user.selected){
			$scope.selected.push(user);
		}else{
			var index = $scope.selected.indexOf(user);
			$scope.selected.splice(index, 1);
		}
	};

	$scope.delete = function(selected){
		var ids = selected.map(function(user){
			return user.id;
		});
		var url = '/api/users/' + ids.join(';');
		$http
			.delete(url)
			.success(function(){
				$scope.users = [];
				$scope.page.start = 0;
				$scope.page.end = size;

				getData();
			});
	}

	$scope.filter = function(){
		$scope.users = [];
		$scope.page.start = 0;
		$scope.page.end = size;

		getData();
	}

	$scope.sort = function(field){
		if($scope.sorting.sort == field){
			$scope.sorting.order = $scope.sorting.order == 'asc' ? 'desc' : 'asc';
		}else{
			$scope.sorting.sort = field;
			$scope.sorting.order = 'asc';
		}
		$scope.users = [];
		$scope.page.start = 0;
		$scope.page.end = size;
		getData();
	}

	$scope.reset = function(){
		$scope.filters = {};
		$scope.users = [];
		$scope.page.start = 0;
		$scope.page.end = size;
		getData();
	}

	function getData(){
		var url = '/api/users';
		var params = angular.extend({}, $scope.sorting, $scope.filters, $scope.page);
		$http
			.get(url, {params: params})
			.success(function(response){
				$scope.users = $scope.users.concat(response.data);
				/*
				if($scope.users.length < total){
					generate();
				}
				*/
			});
	}

	function create(user){
		var url = '/api/users';
		$http
			.post(url, user)
			.success(function(user){
				$scope.current = {};
				getData();
			});
	}

	function edit(user){
		var index = $scope.users.indexOf(user);
		var url = '/api/users/' + user.id;
		$http
			.patch(url, user)
			.success(function(user){
				$scope.current = {};
				$scope.users[index] = user;
			});
	}

	function generate(){
		var name = Data.random('name');
		var surname = Data.random('surname');
		var email = name.toLowerCase() + '_' + surname.toLowerCase() + Data.random('email');
		var role = Data.random('role');
		var lang = Data.random('lang');

		$scope.user = {
			name: name,
			surname: surname,
			email: email,
			role: role,
			lang: lang
		};

		$scope.submit({preventDefault: function(){}});
	};
});