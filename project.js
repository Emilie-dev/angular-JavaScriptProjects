/*
Modules can depend on other modules.
Here , project needs Firebase.
*/
angular.module('project', ['ngRoute','firebase'])

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

	$routeProvider
		// Load list.html into the view and the ProjectListController controller.
		.when('/', {
			controller:'ProjectListController as projectList',
			templateUrl:'list.html',
			resolve: resolveProjects
		})
		/* 
		Here : make a component, EditProjectController can refer to
		 the projectId property which tells which project is edited.
		*/
		.when('/edit/:projectId', {
			controller:'EditProjectController as editProject',
			templateUrl:'detail.html',
			resolve: resolveProjects
		})
		.when('/new', {
			controller:'NewProjectController as editProject',
			templateUrl:'detail.html',
			resolve: resolveProjects
		})
		.otherwise({
			redirectTo:'/'
		});
})	

// Create ProjectListController controller
.controller('ProjectListController', function(projects) {
	var projectList = this;
	projectList.projects = projects;
})

// Create NewProjectController controller
.controller('NewProjectController', function($location, projects) {
	var editProject = this;
	editProject.save = function() {
		projects.$add(editProject.project).then(function(data) {
			$location.path('/');
		});
	};	
})

// Create EditProjectController controller
.controller('EditProjectController', function($location,$routeParams, projects) {
	var editProject = this;
	var projectId = $routeParams.projectId, projectIndex;

	editProject.projects = projects;
	projectIndex = editProject.projects.$indexFor(projectId);
	editProject.project = editProject.projects[projectIndex];

	editProject.destroy = function() {
		editProject.projects.$remove(editProject.project).then(function(data) {
			$location('/');
		});
	};

	editProject.save = function() {
		editProject.projects.$save(editProject.project).then(function(datat) {
			$location('/');
		});
	};
});