angular.module('homework', []);

angular.module('homework', []).filter('langF', function() {
        return function(input) {
            switch (input)
            {
                case "DE": return 'GERMAN';
                case "EN": return 'ENGLISH';
                case "IT": return 'ITALIAN';
                case "FR": return 'FRANCH';
                default: return input;
            }
        }
        })
      
        .filter('mroleF', function() {
        return function(input) {
            switch (input)
            {
                case "UP": return "НОВИЧЁК";
                case "AD": return "РЯДОВОЙ";
                case "VI": return "БОСС";
                case "SU": return "СЛУГА";
                default: return "НИКТО";
            }
        };
});

// Tiny controller to expose current page to the main menu
angular.module('homework').controller('Main', function($scope, $http){
    
    $scope.users_on_page = 10;
    $scope.current_page = 1;
    
    $scope.users = [];
    
    $scope.myOrderBy = '';
    $scope.sortReverse = false;
    $scope.showLoadMore = true;
    
    //$http.get("server/db.json")
    $scope.loadUsers = function(page) {
        $http.get("/api/users", { params: { 
                start: $scope.users_on_page*(page-1), 
                end:   $scope.users_on_page*page} })
        .then(function(response) {
            if (response.data)
            {
                $scope.users = $scope.users.concat(response.data);
            }
            
            // hide load more
            if (response.data.length < $scope.users_on_page)
            {
                $scope.showLoadMore = false;
            }
        });
    };
    
    $scope.loadMoreUsers = function() {
        $scope.current_page++;
        $scope.loadUsers($scope.current_page);
    };
    
    $scope.orderByMe = function(sort_field)
    {
        if ($scope.myOrderBy === sort_field) {
            $scope.sortReverse = !$scope.sortReverse;
        } else $scope.sortReverse = false;
        
        $scope.myOrderBy = sort_field;
    };

    $scope.loadUsers($scope.current_page);
});