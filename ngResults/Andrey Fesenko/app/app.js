angular.module('homework', []);

angular.module('homework').service('DataLoader', function($q, $http) {
    
    this.load = function(range) {
        var deferred = $q.defer();
        var start = range.start;
        var end = range.end;
        
            $http.get('http://localhost:8080/api/users?start=' + start + '&end=' + end).then(function(data) {
                deferred.resolve(data);
            },
            function(error) {
                deferred.reject();
            });    
            
            return deferred.promise; 
    };
});

angular.module('homework').controller('Main', function($scope, DataLoader) {    
    $scope.users = [];
    $scope.currentLoadRange = {start: 0, end: 10};
    $scope.increment = 10;
    $scope.moreUsersAvailable = true;
    $scope.sortOrder = 'id';
    $scope.reverseSortOrder = false;
    
    $scope.updateSortOrder = function(sortOrder) {
        $scope.reverseSortOrder = ($scope.sortOrder === sortOrder) ? !$scope.reverseSortOrder : false;     
        $scope.sortOrder = sortOrder;                                 
    };
    
    $scope.loadData = this.loadData = function(range) {
                
        DataLoader.load(range).then(function(users) {
            // It doesn't cover a case with increment equal amount of users
            // on the last page
            if(users.data.length < $scope.increment) { 
                $scope.moreUsersAvailable = false;
            }
            $scope.users = $scope.users.concat(users.data);     
        });        
        
        this.updateCurrentLoadRange(range, $scope.increment);    
            
    }.bind(this);
    
    this.updateCurrentLoadRange = function(range, increment) {
        $scope.currentLoadRange = {
            start: $scope.currentLoadRange.start + increment, 
            end: $scope.currentLoadRange.end + increment
        }
    };
    
    

});

angular.module('homework').filter('normalizeLanguage', [function() {
    return function(abriviation) {
        var languages = {
            'EN': 'English',
            'DE': 'German',
            'FR': 'Franch',
            'IT': 'Italian'
        }  
        
        for(key in languages) {
            if(abriviation === key) {
                return languages[key];
            }
        }
    };
}]);

angular.module('homework').filter('normalizeRoles', [function() {
    return function(abriviation) {
        var roles = {
            'AD': 'Admin',
            'UP': 'Uploader',
            'AU': 'Author',
            'SA': 'Super Admin',
            'SU': 'Super User',
            'VI': 'Vice Inspector'
        }  
        
        for(key in roles) {
            if(abriviation === key) {
                return roles[key];
            }
        }
    };
}]);