var app = angular.module('homework', []);

app.controller('MainCtrl', function(Signers, $scope) {



  Signers.getSigners().then(function(response) {
      $scope.users = response.data.users;
  })

    $scope.sortType     = 'name'; // set the default sort type
  $scope.sortReverse  = false;  // set the default sort order
  $scope.searchFish   = '';     // set the default search/filter term

});


app.service('Signers', function($http, $q) {
  this.getSigners = function(callback) {
    return $http.get('../db.json');

  }
});

app.directive('singers', function() {
  return {
    restrict: 'E',
    templateUrl: '/table_singers_template.html',
    controller: 'MainCtrl',
    link: function() {

    }

  }
});
