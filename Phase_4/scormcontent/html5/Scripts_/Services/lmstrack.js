/**
 * Created by Hari on 20/09/15.
 */
var FrameworkApp = angular.module('Framework.LMSTrack', [
])
    .controller('Config', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
        $scope.getLMSData = function () {
            $scope.lessonLocation = scormAdaptor_getlocation();
            $scope.getSuspendData = scormAdaptor_getsuspenddata();
            $scope.checkForCourseResume()
        }

        $scope.checkForCourseResume = function () {
            if ($scope.getSuspendData == undefined || $scope.getSuspendData == '' || $scope.getSuspendData == "null" || $scope.getSuspendData == "403" || $scope.getSuspendData.length < 5) {
                $rootScope.$state.go('/');
            } else {
                $scope.sus_data = $scope.getParsedSuspendData();

                var cp_data = $scope.sus_data.course_progress.slice();
                var t1 = cp_data.split("|");
                var t2 = [];
                for (var i = 0; i < t1.length; i++) {
                    t2.push(t1[i].split(","));
                }

                // set pageStatus List
                $scope.pageStatusList = t2.slice();

                $rootScope.currentPage = Number($scope.lessonLocation.split('|')[1]) - 1;
                $scope.showResumePopup();
            }
        }

        $scope.showResumePopup = function () {
            $('#course_popup').modal('show');
        }

        $scope.resumeCourse = function () {
            $('#course_popup').modal('hide');
            $rootScope.CourseContent = {
                PageBG: ""
            }
            $http.get('../course_content/'+$rootScope.selectedLang+'/coursemenu.json').
                then(function (response) {
                    $rootScope.CourseContent = {
                        PageBG: response.data.coursemenu.module[0].screen[$rootScope.currentPage].item[0].path
                    }
                    $rootScope.PageData = response.data.coursemenu.module[0];

                    $('#course_popup').on('hidden.bs.modal', function (e) {

                        if ($rootScope.currentPage == 2) {
                            $scope.disableNextButton = true;
                        }
                        else {
                            $scope.disablePrevButton = false;
                        }
                        var page_id = 00 + '_' + $rootScope.currentPage;
                        $scope.$state.go('course.pages', {id: page_id});
                        $scope.checkForCompletion();


                    });

                }, function (response) {
                });


        }

        $scope.dontResumeCourse = function () {
            $rootScope.currentPage = 0;
            $('#course_popup').modal('hide');
        }

        $scope.getParsedSuspendData = function () {
            var tmp = $scope.getSuspendData.split("&");

            if (tmp.length > 1) tmp = tmp[1].split('%rate=');
            else tmp = tmp[0].split('%rate=');

            if (tmp.length >= 1) _ratedNumber = tmp[1];

            tmp = tmp[0].split("=");

            var suspendData = new Object();
            suspendData[tmp[0]] = tmp[1];

            return (suspendData);
        }

        $scope.startcourse = function () {
            $scope.disableNextButton = false;
            $scope.disablePrevButton = true;
            var page_id = 00 + '_' + $rootScope.currentPage;
            $rootScope.$state.go('course.pages', {id: page_id});
            $scope.updateCourseProgress();
        }

        $scope.updateCourseProgress = function () {
            console.log($rootScope.currentPage);
            $scope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] = 1;
            $scope.cPageData = $rootScope.pad($rootScope.currentTopic + 1)+ '|' + $rootScope.pad($rootScope.currentPage + 1);
            //setLMSData($scope.pageStatusList, $scope.cPageData, $scope.CourseConfig.AppType);
            $scope.setLMSData();
            $scope.checkForCompletion();
        }

        $scope.setLMSData = function () {
            var _susData = "course_progress=" + String($scope.pageStatusList.join('|'));

            if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2')
            {
                scormAdaptor_setsuspenddata(_susData)
                scormAdaptor_setlocation($scope.cPageData);
            }
        }

        $scope.checkForCompletion = function () {
            var _count = 0;
            var _len = 0;
            for (var i = 0; i < $scope.pageStatusList.length; i++) {
                _len += $scope.pageStatusList[i].length;
                for (var j = 0; j < $scope.pageStatusList[i].length; j++) {
                    if ($scope.pageStatusList[i][j] == 1) _count++;
                }
            }

            if (_count == _len) {
                scormAdaptor_complete();
            }
        }
    }]);