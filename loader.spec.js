describe('Loader: Class incapsulating XHR requests logic', function(){
	var xhr;
	//var loader;

	beforeEach(function(){
		module('app', function($provide){
			//spyOn($http, 'get').and.callThrough();
			//spyOn($http, 'post').and.callThrough();
			//$provide.value('$http', $http);
		});

	});

	describe('Initial loader state:', function(){
		it('is properly defined', inject(function(Loader){
			expect(Loader).toBeDefined();
		}));

		it('is not busy by default', inject(function(Loader){
			expect(Loader.busy).toBeDefined();
			expect(Loader.busy).toBeFalsy();
		}));
	});


	describe('GET method support', function(){
		it('makes a GET request when Loader.get() method is called', inject(function(Loader, $http){
			spyOn($http, 'get').and.callThrough();
			Loader.get('url');
			expect($http.get).toHaveBeenCalledWith('url');
		}));

		it('is busy when making a GET request', inject(function(Loader){
			Loader.get('url');
			expect(Loader.busy).toBeTruthy();
		}));
	});

	describe('POST method support', function(){
		it('makes a POST request when Loader.post() method is called', inject(function(Loader, $http){
			spyOn($http, 'post').and.callThrough();
			Loader.post('url', {name: 'value'});
			expect($http.post).toHaveBeenCalledWith('url', {name: 'value'});
		}));

		it('is busy when making a POST request', inject(function(Loader){
			Loader.post('url');
			expect(Loader.busy).toBeTruthy();
		}));
	});

});