//Directive to implement HEADER
FrameworkApp.directive('headerBar', function ($rootScope) {
    return {
        restrict: 'C',
		templateUrl: '../html5/Views/ui/'+$rootScope.selectedLang+'/header.html',
        link: function ($scope, $rootScope, elem, attrs) {

        }
    }
});

//Directive to implement PAGE CONTAINER
FrameworkApp.directive('pageContainer', function ($animate,$rootScope) {
    return {
        restrict: 'C',
        templateUrl: $rootScope.deviceUrl+'/container.html',
        link: function ($scope, $rootScope, elem, attrs) {

        }
    }
});

//Directive to implement FOOTER
FrameworkApp.directive('footerBar', function ($rootScope) {
    return {
        restrict: 'C',
        templateUrl: '../html5/Views/ui/'+$rootScope.selectedLang+'/footer.html',
        link: function ($scope, $rootScope, elem, attrs) {

        }
    }
});

//Directive to implement MENU
FrameworkApp.directive('menuContainer', function ($rootScope) {
    return {
        restrict: 'C',
        templateUrl: $rootScope.deviceUrl+'/menu.html',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope) {
            $scope.closeMenu = function () {
                $('.menu-page-list .tree-toggler').parent().children('ul.tree').toggle(200);
                $('.menu').slideToggle(200);
                //$(".resource-btn").css("pointer-events", "all");
                $(".help-btn").css("pointer-events", "all");
			//	$('.resource-btn').css('opacity','1');
				//$('.menu-btn').css('opacity','1');
            }
        }
    }
});

//Directive to implement MENU LIST inside MENU
FrameworkApp.directive('menuList', function () {
    return {
        restrict: 'A',
        scope: {
            isOpen: "=menuList" // 'data-slide-toggle' in our html
        },
        link: function (scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            scope.$watch('isOpen', function (newIsOpenVal, oldIsOpenVal) {
                if (newIsOpenVal !== oldIsOpenVal) {
                    element.stop().slideToggle(slideDuration);

                }
                $('.menu-page-list .tree-toggler').parent().children('ul.tree').toggle(200, function(){
                    if ( $('.menu').css('display') == 'none'){
                        $(".resource-btn").css("pointer-events", "all");
                        $(".help-btn").css("pointer-events", "all");
						//$('.resource-btn').css('opacity','1');
						//$('.menu-btn').css('opacity','1');
                    }
                    else{
                        $(".resource-btn").css("pointer-events", "none");
                        $(".help-btn").css("pointer-events", "none");
						//$('.resource-btn').css('opacity','0.6');
						//$('.menu-btn').css('opacity','0.6');

                        var currentNode = $(".menu-page-list").find(".current-topic")
                        if(currentNode.attr('data-expand') != "false") {
                            currentNode.find("i").removeClass('fa-arrow-circle-o-down').addClass('fa-arrow-circle-o-up');
                            currentNode.next('.tree').slideDown();
                            $('.menu-page-list .tree').not(currentNode.next('.tree')).slideUp();
                        }
                    }

                });


            });
        }
    };
});

//Directive to implement MENU LIST inside MENU
FrameworkApp.directive('cogList', function () {
    return {
        restrict: 'A',
        scope: {
            isOpen: "=cogList" // 'data-slide-toggle' in our html
        },
        link: function (scope, element, attr) {
            var slideDuration = parseInt(attr.slideToggleDuration, 10) || 200;
            scope.$watch('isOpen', function (newIsOpenVal, oldIsOpenVal) {
                if (newIsOpenVal !== oldIsOpenVal) {
                    element.stop().slideToggle(slideDuration);
                }
                $('.cog-item .tree-toggler').parent().children('ul.tree').toggle(200);
            });
        }
    };
});

//Directive to implement MENU
FrameworkApp.directive('cogContainer', function ($rootScope) {
    return {
        restrict: 'C',
        templateUrl: $rootScope.deviceUrl+'/cog.html',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope) {

        }
    }
});

FrameworkApp.directive('courseAssessment', function () {
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$interval,$timeout) {
			$rootScope.isNextButtonDisabled = false;
            $rootScope.startAssessment = function(){
                $rootScope.assesmentStarted = true;
                $rootScope.loadScreen($rootScope.currentModule, $rootScope.currentTopic, 1);
            }
			$rootScope.blinkQuizWrapper=false;
			$(".menu-contain").css("pointer-events", "all");
			$('.menu-contain').css('opacity','1');
			$rootScope.isAnswered = false;
			$rootScope.isLastQuestion = false;
			$rootScope.assesmentScore = 0;
			if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				
			}
			$rootScope.asmntScoreArray = [2,2,2,2,2,2,2,2,2,2];
			//if($rootScope.isPooled){
				
			//}
			
			//$rootScope.timerMins = 0;
			//$rootScope.timerSecs = 0;
			$interval.cancel($rootScope.promiseInterval);
            $rootScope.markVisitedPage();
			var timeout = $timeout(function(){
				$rootScope.isNextButtonDisabled = false;
				$rootScope.isPageCompleted = true;
				$("#gInstruct").fadeIn(700);
			},1000);
			$scope.$on('$destroy', function(){
				$timeout.cancel(timeout)
			});
			if($rootScope.currentPage==0){
				$rootScope.assesmentQuestionIndex = [];	
				if($rootScope.assesmentQuestionIndex.length<2){
					 if ($rootScope.CourseConfig.IsRandomized) {
						if ($rootScope.CourseConfig.HasAssesmentIntro) {
							$rootScope.assesmentQuestionIndex.push(1);
							while ($rootScope.assesmentQuestionIndex.length < $rootScope.CourseConfig.AvailableAssessmentQuestion+1) {
								var tRandomNumber = Math.floor(Math.random() * $rootScope.CourseConfig.TotalAssesmentQuestions) + 2;
								if ($rootScope.assesmentQuestionIndex.indexOf(tRandomNumber) == -1 ){
									$rootScope.assesmentQuestionIndex.push(tRandomNumber);
								}
							}
						}
						else {
							while ($rootScope.assesmentQuestionIndex.length < $rootScope.CourseConfig.AvailableAssessmentQuestion) {
								var tRandomNumber = Math.floor(Math.random() * $rootScope.CourseConfig.TotalAssesmentQuestions) + 2;
								if ($rootScope.assesmentQuestionIndex.indexOf(tRandomNumber) == -1){
										$rootScope.assesmentQuestionIndex.push(tRandomNumber);
									}
							}
						}
						$rootScope.assesmentQuestionIndex.push($rootScope.CourseConfig.TotalAssesmentQuestions + 2);
					}
					else{
						if($rootScope.CourseConfig.custom){
							$rootScope.assesmentQuestionIndex = $rootScope.CourseConfig.custom.split(',');
						}
						else{
							for (i = 1; i <= $rootScope.CourseConfig.AvailableAssessmentQuestion+1; i++) {
								$rootScope.assesmentQuestionIndex.push(i);
							}						
						}
						$rootScope.assesmentQuestionIndex.push($rootScope.CourseConfig.TotalAssesmentQuestions + 2);
					}
				}
			}
		}
    }
});

FrameworkApp.directive('bindHtmlCompile', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(function () {
                return scope.$eval(attrs.bindHtmlCompile);
            }, function (value) {
                // In case value is a TrustedValueHolderType, sometimes it
                // needs to be explicitly called into a string in order to
                // get the HTML string.
                element.html(value && value.toString());
                // If scope is provided use it, otherwise use parent scope
                var compileScope = scope;
                if (attrs.bindHtmlScope) {
                    compileScope = scope.$eval(attrs.bindHtmlScope);
                }
                $compile(element.contents())(compileScope);
            });
        }
    };
}]);





