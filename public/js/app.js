angular.module('joshhacks', [
  'joshhacks.controllers',
  'ngRoute'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.
	when("/attendance", {templateUrl: "/tmpl/attendance.html", controller: "AttendanceController"}).
	when("/meeting", {templateUrl: "/tmpl/room.html", controller: "MeetingRoomController"}).
	otherwise({redirectTo: '/attendance'});
}]);