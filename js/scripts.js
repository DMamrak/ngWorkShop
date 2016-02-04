angular.module('inner', []);

angular.module('demo', ['inner']);

angular.module('demo').controller('TodoCtrl', function(){
	var _this = this;

	_this.planned = [
		{
			name: 'Wake up',
			done: true,
			type: 'Leisure',
		},
		{
			name: 'Come to the office',
			type: 'Work',
		},
		{
			name: 'Drink some coffee',
			type: 'Leisure',
		},
		{
			name: 'Watch YouTube',
			done: false,
			type: 'Work',
		},
		{
			name: 'Go home'
		},
	];

	_this.add = function(e){
		_this.planned.push(_this.new);

		_this.new = {};
	};

	_this.remove = function(activity){
		var index = _this.planned.indexOf(activity);
		_this.planned.splice(index, 1);

	};
});

angular.module('inner').controller('ActivityCtrl', function($scope){
	var _this = this;

	console.log($scope);
});