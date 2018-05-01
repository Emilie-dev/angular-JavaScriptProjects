/*
Modules can depend on other modules.
Here , project needs Firebase.
*/
angular.module('project', ['Firebase'])

/*
Object that can be injected into controllers and services.
Firebase location from which data are loaded.
*/
.value('fbURL', 'https://ng-projects-list.firebaseio.com/')
.service('fbRef', function(fbURL) {
	return new Firebase(fbURL)
})


// An Angularfire'service for binding data from Firebase to AngularJS models.
.service('fbAuth', function($q, $firebase, $firebaseAuth, fbRef) {
	var auth;
	return function () {
	    if (auth) return $q.when(auth);
	    var authObj = $firebaseAuth(fbRef);
	    if (authObj.$getAuth()) {
	    	return $q.when(auth = authObj.$getAuth());
	    }
	    var deferred = $q.defer();
	    authObj.$authAnonymously().then(function(authData) {
	    	auth = authData;
	    	deferred.resolve(authData);
	    });
	    return deferred.promise;
  	}
})