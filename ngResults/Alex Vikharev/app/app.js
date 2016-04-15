
var myApp = angular.module('homework', []);

var languages = { "DE":"German",
                  "IT":"Italian",
                  "FR":"Franch",
                  "EN":"English"};

var roles = { "UP":"Uploader",
              "AU":"Autor",
              "AD":"ADMIN",
              "SU":"Super Admin",
              "VI":"Vitaly"};


angular.module('homework').controller('Main', function($scope, $http)
{
  console.log("Controller created!");

  $scope.step = 10;
  $scope.sortField = 'id';
  $scope.sortReverse = false;
  $scope.startIndex = 0;
  $scope.lastIndex = 10;
  $scope.users = [];
  $scope.loadMoreEnabled = true;


  addUsers($scope.startIndex, $scope.step);

  function addUsers(start, end)
  {
    $http.get('/api/users', {params:{start:start, end:end}} )
      .success(function(data) {
          console.log('Users loaded', start, end, 'loaded', data.length, data);
          $scope.users = $scope.users.concat(data);
          $scope.lastIndex = end;
          $scope.loadMoreEnabled = (data.length == $scope.step);
      });
  };

  $scope.loadMore = function()
  {
    console.log('LoadMode...');
    addUsers($scope.lastIndex, $scope.lastIndex + $scope.step);
  }

});

// custom filters:

//language filter
myApp.filter('formatLang', function(){
  return function(text){
    return languages[text];
  }
})

// role filter
myApp.filter('formatRole', function(){
  return function(text){
    return roles[text];
  }
})
