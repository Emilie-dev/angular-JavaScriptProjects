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

// Create, update and delete data in the database.
.service('Projects', function($q, $firebase, fbRef, fbAuth, projectListValue) {
	var self = this;
  	this.fetch = function () {
    	if (this.projects) return $q.when(this.projects);
    	return fbAuth().then(function(auth) {
	    	var deferred = $q.defer();
	      	var ref = fbRef.child('projects-fresh/' + auth.auth.uid);
	      	var $projects = $firebase(ref);
    	ref.on('value', function(snapshot) {
        	if (snapshot.val() === null) {
        		$projects.$set(projectListValue);
        	}
        self.projects = $projects.$asArray();
        deferred.resolve(self.projects);
      	});
 
	    //Remove projects list when no longer needed.
	    ref.onDisconnect().remove();
	    return deferred.promise;
    	});
  	};
})

/*
config() is to configure existing services.
Here, $routeProvider for mapping URL paths to partials.
*/
.config(function($routeProvider) {
	var resolveProjects = {
    projects: function (Projects) {
    	return Projects.fetch();
    }
};