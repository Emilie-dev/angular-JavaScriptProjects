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