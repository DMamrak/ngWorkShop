angular.module('demo', []);

angular.module('demo').controller('Main', function($scope, $http){
	$scope.user = {};
	
	getData();	

	$scope.submit = function($event){
		var url = '/api/users';
		var date = Date.now();
		var data = angular.extend({}, $scope.user, {date: date});
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
			});
	}
});