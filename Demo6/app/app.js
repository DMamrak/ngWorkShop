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



angular.module('homework').controller('Main', function($scope, $http, Data){
	$scope.user = {};
	
	var total = 100;

	getData();	

	$scope.submit = function($event){
		var url = '/api/users';
		var data = $scope.user;
		$http
			.post('/api/users', data)
			.success(function(user){
				$scope.user = {};
				getData();
			});

		$event.preventDefault();
	};

	function getData(){
		var url = '/api/users';
		$http
			.get(url)
			.success(function(users){
				$scope.users = users;
				/*
				if($scope.users.length < total){
					generate();
				}
				*/
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