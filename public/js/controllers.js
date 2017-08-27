angular.module('joshhacks.controllers', []).
controller('AttendanceController', function($scope, mainService) {
    $scope.enter_list = [];
    $scope.out_list = [];
    var socket = io();
    $scope.enter_list = mainService.getAttendance().filter((data) => {
        return data.status == 'Enter';
    });
    $scope.out_list = mainService.getAttendance().filter((data) => {
        return data.status == 'Exit';
    });
    socket.on('new_attendance', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.localtime = d.toLocaleTimeString();
        mainService.addAttendance(data);
        $scope.enter_list = mainService.getAttendance().filter((data) => {
            return data.status == 'Enter';
        });
        $scope.out_list = mainService.getAttendance().filter((data) => {
            return data.status == 'Exit';
        });
        $scope.$apply();
    });
    socket.on('attendance_removed', (data) => {
        list = mainService.getAttendance().filter((item) => {
            return item.time != data.time;
        });
        mainService.setAttendance(list);
        $scope.enter_list = mainService.getAttendance().filter((data) => {
            return data.status == 'Enter';
        });
        $scope.out_list = mainService.getAttendance().filter((data) => {
            return data.status == 'Exit';
        });
        $scope.$apply();
    });









    socket.on('room_one', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomOne(data);
        $scope.$apply();
    });
    socket.on('room_one_removed', (data) => {
        list = mainService.getRoomOne().filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomOne(list);
        $scope.$apply();
    });

    socket.on('room_two', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomTwo(data);
        $scope.$apply();
    });
    socket.on('room_two_removed', (data) => {
        list = mainService.getRoomTwo().filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomTwo(list)
        $scope.$apply();
    });

    socket.on('room_three', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomThree(data);
        $scope.$apply();
    });
    socket.on('room_three_removed', (data) => {
        list = mainService.getRoomThree().filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomThree(list);
        $scope.$apply();
    });

    socket.on('room_four', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomFour(data);
        $scope.$apply();
    });
    socket.on('room_four_removed', (data) => {
        list = mainService.getRoomFour().filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomFour(list);
        $scope.$apply();
    });
}).
controller('MeetingRoomController', function ($scope, $http, mainService) {
    var socket = io();
    $scope.room_one_list = mainService.getRoomOne();
    $scope.room_two_list = mainService.getRoomTwo();
    $scope.room_three_list = mainService.getRoomThree();
    $scope.room_four_list = mainService.getRoomFour();

    socket.on('room_one', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomOne(data);
        $scope.room_one_list = mainService.getRoomOne();
        $scope.$apply();
    });
    socket.on('room_one_removed', (data) => {
        $scope.room_one_list = $scope.room_one_list.filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomOne($scope.room_one_list)
        $scope.$apply();
    });

    socket.on('room_two', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomTwo(data);
        $scope.room_two_list = mainService.getRoomTwo();
        $scope.$apply();
    });
    socket.on('room_two_removed', (data) => {
        $scope.room_two_list = $scope.room_two_list.filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomTwo($scope.room_two_list)
        $scope.$apply();
    });

    socket.on('room_three', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomThree(data);
        $scope.room_three_list = mainService.getRoomThree();
        $scope.$apply();
    });
    socket.on('room_three_removed', (data) => {
        $scope.room_three_list = $scope.room_three_list.filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomThree($scope.room_three_list)
        $scope.$apply();
    });

    socket.on('room_four', function(data) {
        var d = new Date(data.time);
        data.date = d.toDateString();
        data.time = d.toLocaleTimeString();
        mainService.addRoomFour(data);
        $scope.room_four_list = mainService.getRoomFour();
        $scope.$apply();
    });
    socket.on('room_four_removed', (data) => {
        $scope.room_four_list = $scope.room_four_list.filter((item) => {
            return item.email != data.email;
        });
        mainService.setRoomFour($scope.room_four_list)
        $scope.$apply();
    });

}).
service('mainService', function () {
    this.attendanceList = [];
    this.roomOneList = [];
    this.roomTwoList = [];
    this.roomThreeList = [];
    this.roomFourList = [];

    this.addAttendance = (data) => {
        this.attendanceList.push(data);
    };
    this.setAttendance = (list) => {
        this.attendanceList = list;
    };
    this.getAttendance = () => {
        return this.attendanceList;
    };

    this.getRoomOne = () => {
        return this.roomOneList;
    };
    this.getRoomTwo = () => {
        return this.roomTwoList;
    };
    this.getRoomThree = () => {
        return this.roomThreeList;
    }
    this.getRoomFour = () => {
        return this.roomFourList;
    };


    this.addRoomOne = (data) => {
        this.roomOneList.push(data);
    };
    this.addRoomTwo = (data) => {
        this.roomTwoList.push(data);
    };
    this.addRoomThree = (data) => {
        this.roomThreeList.push(data);
    };
    this.addRoomFour = (data) => {
        this.roomFourList.push(data);
    };

    this.setRoomOne = (list) => {
        this.roomOneList = list;
    };
    this.setRoomTwo = (list) => {
        this.roomTwoList = list;
    };
    this.setRoomThree = (list) => {
        this.roomThreeList = list;
    };
    this.setRoomFour = (list) => {
        this.roomFourList = list;
    };
})