angular.module('demo', []);

angular.module('demo').controller('Main', function($scope, $http){
	$scope.user = {};
	
	getData();	

	$scope.submit = function($event){
		$http
			.post('/api/users', $scope.user)
			.success(function(user){
				getData();
			});

		$event.preventDefault();
	};

	function getData(){
		$http
			.get('/api/users')
			.success(function(users){
				$scope.users = users;
			});
	}
});