var timer1;
var FrameworkApp = angular.module('Framework', [
      'ui.router'
    , 'ui.bootstrap'
    , 'ngAnimate'
    , 'ngTouch'
    , 'angular-bootstrap-select'
    , 'vAccordion'
    , 'angular-carousel-3d'
    , 'ngSanitize'
    , 'ngDragDrop'
]);

////////////////////////////////////////////////////////
//Module config
////////////////////////////////////////////////////////
FrameworkApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProviderReference = $stateProvider;
    $urlRouterProviderReference = $urlRouterProvider;
}]);

////////////////////////////////////////////////////////
//Module run
////////////////////////////////////////////////////////
FrameworkApp.run(['$rootScope', '$state', '$stateParams', '$location', '$http', '$timeout', 'PreloaderService', '$modal', '$interval',function ($rootScope, $state, $stateParams, $location, $http, $timeout, PreloaderService, $modal,$interval) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.slideDirection = "Next";
    $rootScope.currentModule = 0;
    $rootScope.currentTopic = 0;
    $rootScope.currentPage = 0;
    $rootScope.totalPages = 0;
    $rootScope.currentPageNumber = 0;
    $rootScope.branchingCounter = 0;
    $rootScope.pageStatusList = [];
    $rootScope.cPageData = '01|01';
    $rootScope.clickedNextButton = false;
    $rootScope.clickedBackButton = false;
    $rootScope.showResumeBtn = false;
    $rootScope.isPreLoading = true;
    $rootScope.isPreLoadSuccessful = false;
    $rootScope.isRendered = false;
    $rootScope.percentLoaded = 0;
    $rootScope.lastPage = false;
    $rootScope.assesmentQuestionIndex = [];
    $rootScope.assesmentQuestionIndex[0] = 1;
    $rootScope.assesmentScore = 0;
    $rootScope.assesmentStarted = false;
    $rootScope.assesmentAttempted = 0;
    $rootScope.selectedLang = "en";
    $rootScope.deviceUrl = "../html5/Views";
    $rootScope.deskTop = true;
    $rootScope.isNextButtonDisabled = true;
    $rootScope.isPageCompleted = false;
    $rootScope.isPrevButtonDisabled = false;
    $rootScope.isLangPage = false;
    $rootScope.pageCount = 0;
    $rootScope.assesmentPercentageScore = 0;
	$rootScope.ScormnUsername = "";
	$rootScope.dateString = "";
    $rootScope.assessmentAnswers = [];
	$rootScope.answerArray = [];
	$rootScope.isAnswered = false;
	$rootScope.isLastQuestion = false;
	$rootScope.asmntScoreArray = [2,2,2,2,2];
	$rootScope.quizCounter = 1;
    $rootScope.isPassed = [2,2,0,"d",false,false,''];
	$rootScope.activityAnswer = false;
	//$rootScope.isPassed[5] if visual menu visited
	$rootScope.disableMenu = false;
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var dateString= day+'/'+month+'/'+year;
	$rootScope.userName = '< LMS Name >';
	$rootScope.currentDate = dateString;
	var weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	$rootScope.currentDay = weekDays[currentTime.getDay()];
	//$rootScope.isPassed[4] represents course is compliance or not
	//$rootScope.cCompliance = $rootScope.isPassed[4].isCompliance;
	$rootScope.getScore = 0;
	$rootScope.PageNumFinished = 0;	
	$rootScope.isResume = false;
	$rootScope.resumeLastPage = false;
	$rootScope.isOnline =true;
	$rootScope.linkSrc = '';
	$rootScope.showIframe = false;
	$rootScope.hideEaseArrow = false;
	$rootScope.asmntScoreArray = [];
	$rootScope.isStarted = false;
	$rootScope.isSoundon = true;
	$rootScope.disableAudio = false;
	$rootScope.isAudio = false;
	$rootScope.audioFile = "";
	$rootScope.isSoundon = true;
	$rootScope.isPaused = false;
	function formatAMPM(date) {
	  var hours = date.getHours();
	  var minutes = date.getMinutes();
	  var ampm = hours >= 12 ? 'pm' : 'am';
	  hours = hours % 12;
	  hours = hours ? hours : 12; // the hour '0' should be '12'
	  minutes = minutes < 10 ? '0'+minutes : minutes;
	  var strTime = hours + ':' + minutes + ' ' + ampm;
	  return strTime;
	}
	$rootScope.time = formatAMPM(currentTime);

	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)){
		$rootScope.deskTop = false;
	}else{
		$rootScope.deskTop = true;
	}

    GetConfigData = function () {
        return $http.get('../course_config.xml')
            .success(function (data) {
				 $rootScope.CourseConfig = $.xml2json(data);
            });
    };
	$rootScope.selectedLanguage = function(){
		$rootScope.selectedLang = event.target.value;
		$http.get('../course_content/'+$rootScope.selectedLang+'/langSelection.xml').
			then(function (response) {
				 $rootScope.languageSelectContent = $.xml2json(response.data).root;
			}, function (response) {
        });
		
		$http.get('../course_content/' + $rootScope.selectedLang + '/coursemenu.xml').
			then(function (response){
			$rootScope.CourseMenu = $.xml2json(response.data).root;
			$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
		});
	};
    GetConfigData().success(function (data) {
		data =  $rootScope.CourseConfig.root;
        $rootScope.CourseConfig = {
            CourseName: data.CourseName,
            CourseBrand: data.CourseBrandName,
            BrandFont: data.CourseBrandFontSize,
            LogoPath: data.CourseBrandNameImg,
            AppType: data.courseSettings.appType,
            VisualMenu: data.courseSettings.visualMenu =='true'?true:false,
            SkipVisualmenu: data.courseSettings.skipVisualMenu =='true'?true:false,
            MenuDepth: parseInt(data.courseSettings.menuDepth),
            UIControls: data.UIControllers,
            ForceNavigation: data.courseSettings.forceNavigation =='true'?true:false,
            HasAssessment:data.courseSettings.hasAssessment =='true'?true:false,
            AssessmentSection:parseInt(data.courseSettings.assessmentSection),
            TotalAssesmentQuestions: parseInt(data.courseSettings.totalQuestions),
            AvailableAssessmentQuestion : parseInt(data.courseSettings.availableQuestions),
            IsRandomized: data.courseSettings.hasRandomization =='true'?true:false,
            HasPooling: data.courseSettings.hasPooling =='true'?true:false,
			HasPreAssessment:data.courseSettings.hasPreAssessment =='true'?true:false,
            PreAssessmentSection:parseInt(data.courseSettings.preAssessmentSection),
            TotalPreQuestions: parseInt(data.courseSettings.totalPreQuestions),
            AvailablePreQuestions : parseInt(data.courseSettings.availablePreQuestions),
            IsPreRandomization: data.courseSettings.hasPreRandomization =='true'?true:false,
            IsPrePooling: data.courseSettings.hasPrePooling =='true'?true:false,
            MasteryScore: parseInt(data.courseSettings.masteryScore),
            HasAssesmentIntro: data.courseSettings.hasAssessmentIntro =='true'?true:false,
            HasPreAssesmentIntro: data.courseSettings.hasPreAssessmentIntro =='true'?true:false,
            MaxAssesmentAttempt: parseInt(data.courseSettings.maxAssesmentAttempt),
            HasLangSelectionPage: data.courseSettings.hasLangSelectionPage =='true'?true:false,
            HasIntroPage: data.courseSettings.hasCourseIntro =='true'?true:false,
            HasRole: data.courseSettings.hasRoleSelectionPage =='true'?true:false,
            HasAudio: data.courseSettings.hasAudio =='true'?true:false,
            PageCount: data.courseSettings.pageCountType,
			custom:data.courseSettings.custom
        };

        init();
		if($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2'){
			$rootScope.getScore = parent.SCORM_GetScore();
		}
    });

    $rootScope.$watch('[]', function () {
        PreloaderService
            .preloadImages()
            .then(
            // == Preloaded images success resolve handler
            function handleResolve() {
					$rootScope.isPreLoading = false;
					$rootScope.isPreLoadSuccessful = true;
            },
            // == Preloaded images reject  handler
            function handleReject() {
                $rootScope.isPreLoading = true;
                $rootScope.isPreLoadSuccessful = false;
            },
            // == Preloaded images notify handler which is executed multiple times during preload
            function handleNotify(event) {
                $rootScope.percentLoaded = event.percent;
            }
        );

    }, true);

    $stateProviderReference
        .state('/', {
            url: '/',
            templateUrl: $rootScope.deviceUrl + '/start.html',
            controller: 'Intro',
        })

        .state('course', {
            url: "/course",
            controller: 'Config',
            templateUrl: $rootScope.deviceUrl + '/home.html'
        })  
		
		.state('role', {
            url: "/role",
            controller: 'Intro',
            templateUrl: $rootScope.deviceUrl + '/role.html'
        })

        .state('intro', {
            url: "/intro",
            controller: 'Intro',
            templateUrl: function(){
				return $rootScope.deviceUrl+'/ui/'+$rootScope.selectedLang + '/intro.html';
			}
        })

        .state('menu', {
            url: "/menu",
            controller: 'Config',
            templateUrl: '../html5/Views/visual_menu.html'
        })

        .state('course.pages', {
            url: "/page/:id",
            views: {
                'page-container': {
                    controller: 'Config', templateUrl: function ($stateParams) {
                        var ids = $stateParams.id.split("_");
						$("#preloadericon").html('<img src="../course_images/pages/loader.gif">');
						$timeout(function(){$("#preloadericon").html('')},500);
                         return ('../html5/Views/screens/'+$rootScope.selectedLang+'/m' + ids[0] + '/t' + ids[1] + '/s' + ids[2] + '.html');						
                    }
                }
            }
        });
	
    $urlRouterProviderReference.otherwise('/');		
    $location.path('/page/:id').replace();
	

function init() {
	 //Get Course language Data in json format
	 $http.get('../course_content/'+$rootScope.selectedLang+'/langSelection.xml').
        then(function (response) {			
			 $rootScope.languageSelectContent = $.xml2json(response.data).root;
        }, function (response) {
        });
		
    //Get Course Menu Data in json format
    $http.get('../course_content/' + $rootScope.selectedLang + '/coursemenu.xml').
        then(function (response){
			$rootScope.CourseMenu = $.xml2json(response.data).root;
            $rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
                $rootScope.pageStatusList = new Array($rootScope.CourseMenu.module.topics.length);
                for (j = 0; j < $rootScope.CourseMenu.module.topics.length; j++) {
                    $rootScope.pageStatusList[j] = new Array($rootScope.CourseMenu.module.topics[j].length);
                        if($rootScope.CourseConfig.HasAssessment && j == $rootScope.CourseConfig.AssessmentSection-1){
                            for (k = 0; k < $rootScope.CourseConfig.AvailableAssessmentQuestion+2; k++) {
                                $rootScope.pageStatusList[j][k] = "0";
                            }
                        }
					  else if($rootScope.CourseConfig.HasPreAssessment && j == $rootScope.CourseConfig.PreAssessmentSection-1){
                            for (k = 0; k < $rootScope.CourseConfig.AvailablePreQuestions+2; k++) {
                                $rootScope.pageStatusList[j][k] = "0";
                            }
                        }
					else {
                        for (k = 0; k < $rootScope.CourseMenu.module.topics[j].pages.length; k++) {
                            $rootScope.pageStatusList[j][k] = "0";
                        }
                    }
                }
            if (!$rootScope.CourseConfig.HasIntroPage && !$rootScope.CourseConfig.HasLangSelectionPage){
                if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
                    $rootScope.getLMSData();
                }
                else {
                    if ($rootScope.CourseConfig.VisualMenu) {
                        $rootScope.$state.go('menu');
                    }
                    else {
                        $rootScope.currentModule = 0;
                        $rootScope.currentTopic = 0;
                        $rootScope.currentPage = 0;
                        var page_id = "01_01_01"
                        $rootScope.$state.go('course.pages', {id: page_id});
                    }
                }
            }
        }, function (response) {			
        });


    $rootScope.$on("$locationChangeStart", function (event, next, current) {
        $rootScope.CourseContent = "";
       if( $rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-1 || $rootScope.currentTopic == $rootScope.CourseConfig.PreAssessmentSection-1)
			{
				var tURL = '../course_content/' + $rootScope.selectedLang + '/m' + $rootScope.pad($rootScope.currentModule + 1) + '/t' + $rootScope.pad($rootScope.currentTopic + 1) + '/p' + $rootScope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]) + '.xml';
			}
        else{
			 var tURL = '../course_content/' + $rootScope.selectedLang + '/m' + $rootScope.pad($rootScope.currentModule + 1) + '/t' + $rootScope.pad($rootScope.currentTopic + 1) + '/p' + $rootScope.pad($rootScope.currentPage + 1) + '.xml';
		}
        $http.get(tURL).
            then(function (response) {
				 $rootScope.isPageCompleted = false;
				 $rootScope.CourseContent = $.xml2json(response.data).root.contents;
				 $rootScope.isAudio = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages[$rootScope.currentPage].isAudio;
				 $rootScope.isAudio = toBool($rootScope.isAudio);
				 var isCurrentBranching = $rootScope.CourseContent.branchingScreen == "true" || $rootScope.CourseContent.branchingScreen == true;
                if ($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] != "1") {
                    if ($rootScope.CourseConfig.ForceNavigation)
                        $rootScope.isNextButtonDisabled = true;
					else {
                        if ($rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1)
                            $rootScope.isNextButtonDisabled = false;
                    }
					if($rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1){
                        $rootScope.isPrevButtonDisabled = false;
                    }
                }
                else {
                    if ($rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1){
                        $rootScope.isNextButtonDisabled = false;
					}
                }
                if($rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1){
                    $rootScope.isPrevButtonDisabled = false;
                }
                if (($rootScope.CourseContent.static == true || $rootScope.CourseContent.static == "true") && $location.path().indexOf("_") != -1) {
                    $rootScope.markVisitedPage();
                }else if($location.path().indexOf("_") != -1 && $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == 1 && $rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1){
					 $rootScope.markVisitedPage();
				}
				if (!$rootScope.CourseContent.branchingScreen && $rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1)
					$rootScope.isPrevButtonDisabled = false;
				
				
				if($rootScope.CourseContent.branchingScreen == "true" || $rootScope.CourseContent.branchingScreen == true){
					$rootScope.isNextButtonDisabled = true;
					$rootScope.isPrevButtonDisabled = true;
				}
                if($rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-1 && $rootScope.currentPage != 0 && $rootScope.currentPage != $rootScope.CourseConfig.AvailableAssessmentQuestion + 1){
					$rootScope.disableMenu = true;
				}else{
					if ($rootScope.CourseContent.menuDisable == "true"){
						$rootScope.disableMenu=true;
					}else{
						$rootScope.disableMenu=false;
					}
				}
				if($rootScope.currentTopic == 0 && $rootScope.currentPage==0){
					$rootScope.isPrevButtonDisabled = true;
				}
				if($rootScope.currentPageNumber == $rootScope.totalPages){
						$rootScope.isNextButtonDisabled = true;
						$rootScope.isPrevButtonDisabled = true;
				}
				$rootScope.PageNumFinished = $rootScope.currentPage;
            }, function (response) {
            });
        getTotalPagesCount();
        getCurrentPagesCount();
		/* ===== Style using XML ===== */
		$http.get('../style.xml').
			then(function (response){
				var courseStyle = $.xml2json(response.data).root;
				var titleClass = 'page-heading';
				var instructionClass = 'instructionText';
				var popupClass='popUp';
				setTimeout(function(){
					for(var temp=0;temp < courseStyle.style.length; temp++)
					{
					$('.'+courseStyle.style[temp].className).css(courseStyle.style[temp].classStyle);
					}
				},0);	
				$rootScope.attachStyle=function(){
					setTimeout(function(){
						for(var temp=0;temp < courseStyle.style.length; temp++)
						{
							$('.'+courseStyle.style[temp].className).css(courseStyle.style[temp].classStyle);
							var x=$('.'+courseStyle.style[temp].className);
						}
					},0);	
				};
			});				
			/* ===== Style using XML ===== */
    });

     var getTotalPagesCount = function () {
        var _totalPageCount = 0;
        if ($rootScope.CourseConfig.PageCount == "topicwise")
            $rootScope.totalPages = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages.length;
        else {
            if ($rootScope.CourseConfig.MenuDepth == 2) {
                if($rootScope.CourseConfig.HasAssessment) {
                    for (var i = 0; i < $rootScope.CourseMenu.module.topics.length; i++) {
                        if(i == $rootScope.CourseConfig.AssessmentSection-1) {
                                    _totalPageCount = _totalPageCount + $rootScope.CourseConfig.AvailableAssessmentQuestion + 1;
                            if($rootScope.CourseConfig.HasAssesmentIntro)
                                _totalPageCount++;
                        }
                        else{
                            for (var j = 0; j < $rootScope.CourseMenu.module.topics[i].pages.length; j++) {
                                    _totalPageCount++;
                            }
                        }
                    }
                }
            }
			$rootScope.totalPages = getTotalPagenumber();
        }
    }

    var getCurrentPagesCount = function () {
        if ($rootScope.CourseConfig.PageCount == "topicwise")
            $rootScope.currentPageNumber = $rootScope.currentPage;
        else{
            var pageCounter = 0;
            for (var i = 0; i < $rootScope.CourseMenu.module.topics.length; i++)
            {
                if ($rootScope.currentTopic == i)
                {
                    pageCounter += $rootScope.currentPage;break;
                }
                else
                {
                    pageCounter += $rootScope.CourseMenu.module.topics[i].pages.length;
                }
            }
				pageCounter = pageCounter+1;
            $rootScope.currentPageNumber =  getCurrentPageNumber(pageCounter);
        }
    }


	function getTotalPagenumber(){
		var _totalPageCount  = 0;
		for(var i = 0; i < $rootScope.CourseMenu.module.topics.length; i++){
			for(var j = 0; j < $rootScope.CourseMenu.module.topics[i].pages.length; j++){
				if(!$rootScope.CourseMenu.module.topics[i].pages[j].branchingScreen)
					_totalPageCount++;
			}
		}
		var flag2 = 0;
		
		if($rootScope.CourseConfig.HasPooling){
			flag2 = $rootScope.CourseConfig.TotalAssesmentQuestions - $rootScope.CourseConfig.AvailableAssessmentQuestion;
		}
		_totalPageCount = _totalPageCount-flag2;
		return _totalPageCount;
	}

	function getCurrentPageNumber(_val){
		var _totalPageCount  = 0;
		var flag = 0;
		for(var i = 0; i < $rootScope.CourseMenu.module.topics.length; i++){
			for(var j = 0; j < $rootScope.CourseMenu.module.topics[i].pages.length; j++){
				if(flag!=_val){

					if(!$rootScope.CourseMenu.module.topics[i].pages[j].branchingScreen)
						_totalPageCount++;

				}
				else{

					break;
				}
				flag++;

			}
		}
		if($rootScope.CourseConfig.HasPreAssessment){
			if($rootScope.CourseConfig.AvailablePreQuestions + 2 < _totalPageCount){
				_totalPageCount = _totalPageCount - ($rootScope.CourseConfig.TotalPreQuestions - $rootScope.CourseConfig.AvailablePreQuestions);	
			}
		}
		return _totalPageCount;
	}


    $rootScope.$on("$locationChangeSuccess", function (event, next, current) {
        $rootScope.isPreLoading = false;
        $rootScope.isPreLoadSuccessful = true;
        $rootScope.isRendered = true;
        $rootScope.percentLoaded = 0;
		$rootScope.disableAudio = false;
		if ($location.path() != '/menu' && $location.path() != "'/'" && $rootScope.pageStatusList.length > 0) {
			if($rootScope.CourseConfig.HasAudio) {
				$rootScope.isAudio = $rootScope.CourseMenu.module[$rootScope.currentModule].topics[$rootScope.currentTopic].pages[$rootScope.currentPage].isAudio;
				if($rootScope.isAudio == true){
					$rootScope.audioFile.play();
				}
			}
          
        }
    });

   

    $rootScope.pad = function (n) {
        return (n < 10) ? ("0" + n) : n;
    }
	
	$rootScope.getdateString = function(){
		
		var currentTime = new Date();
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		$rootScope.dateString =month + "/" + day + "/" + year;
		
	}
	$rootScope.getdateString();
	
	$rootScope.getUiAssests = function(){
		$http.get('../course_content/' + $rootScope.selectedLang + '/globalContent.xml').
			then(function (response) {
				$rootScope.gContent = $.xml2json(response.data).root;
			}, function (response) {
		});
		 //Get Visual menu Content
		$http.get('../course_content/' + $rootScope.selectedLang + '/visualmenu.xml').
			then(function (response) {
				$rootScope.VisualMenuContent = $.xml2json(response.data).root;
			}, function (response) {
			});

		$http.get('../course_content/' + $rootScope.selectedLang + '/resources.xml').
			then(function (response) {
			   // $rootScope.ResourceContent = response.data;
				$rootScope.ResourceContent = $.xml2json(response.data).root;
			}, function (response) {
			});

		$http.get('../course_content/' + $rootScope.selectedLang + '/help.xml').
			then(function (response) {
				$rootScope.HelpContent = $.xml2json(response.data).root;
			}, function (response) {
			});
		$http.get('../course_content/' + $rootScope.selectedLang + '/coursemenu.xml').
			then(function (response) {
				$rootScope.CourseMenu = $.xml2json(response.data).root;
			}, function (response) {
			});
		$http.get('../course_content/' + $rootScope.selectedLang + '/footer.xml').
		then(function (response) {
			$rootScope.footer = $.xml2json(response.data).root;
		}, function (response) {
		});
	};
	
	$rootScope.getUiAssests();
	
    $rootScope.markVisitedPage = function () {
        $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] = "1";
		var time = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages[$rootScope.currentPage].time?$rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages[$rootScope.currentPage].time:3000;
		if($rootScope.totalPages !== $rootScope.currentPageNumber && $rootScope.currentTopic != $rootScope.CourseConfig.AssessmentSection-1 && $rootScope.CourseContent.branchingScreen !=="true" ){
			if($rootScope.CourseContent.static == "true"){
				timer1 = $timeout(function(){
					$rootScope.isNextButtonDisabled = false;
					$rootScope.isPageCompleted = true;
					$("#gInstruct").fadeIn(300);						
				},time);
			}else{
				timer1 = $timeout(function(){
					$("#gInstruct").fadeIn(700);	
					$rootScope.isNextButtonDisabled = false;
					$rootScope.isPageCompleted = true;
				},3000);
			}
		}
        $rootScope.updateCourseProgress();
	}; 

	$rootScope.loadPage = function (page_id){
		$rootScope.$state.go('course.pages', {id: page_id});
	};

    $rootScope.pageVisited = function (m, t, p) {
        if ($rootScope.CourseConfig.ForceNavigation) {
            if ($rootScope.pageStatusList[t][p] == "1")
                return "enable-menu-list";
            else
                return "disable-menu-list";
        }
    }
	$rootScope.topic3Completed = function (){
		
		for(var i = 0; i < $rootScope.pageStatusList[2].length; i++){
			$rootScope.pageStatusList[2][i] = "1";
		}
	}
	
	/////////////////////////////////////////////////
	///for opening links in new window
	/////////////////////////////////////////////////
	openLinkInNewWindow = function(link){
		var myWindow1 =window.open(link, "myWindow", "width=1015, height=672,resizable=yes,scrollbars=yes");
	}
	
	
    $rootScope.viewedPage = function (m, t, p) {
        var currentPath = $location.path().split("/")[3];
        var cModule = currentPath.split("_")[0] - 1;
        var cTopic = currentPath.split("_")[1] - 1;
        var cPage = currentPath.split("_")[2] - 1;
        if($rootScope.CourseContent.branchingScreen){
            $("#0"+"_"+t+"_"+($rootScope.CourseContent.branchingHomeScreen-1)).addClass("current-page");
        }
        if(m == cModule && t == cTopic && p == cPage){
            return "current-page"
        }
    }

    //Bootstrapp modal instaciate
    var ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    $rootScope.viewedTopic = function (m, t) {
        var currentPath = $location.path().split("/")[3];
        var cModule = currentPath.split("_")[0] - 1;
        var cTopic = currentPath.split("_")[1] - 1;
        var cPage = currentPath.split("_")[2] - 1;
        if(m == cModule && t == cTopic){
            return "current-topic"
        }

    }

    //Event triggered on click of RESOURCE button
    $rootScope.loadResources = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine){
			var modalInstance = $modal.open({
				animation: $rootScope.animationsEnabled,
				templateUrl: '../html5/Views/ui/'+$rootScope.selectedLang+'/resource.html',
				controller: ModalInstanceCtrl,
				backdrop: 'static',
				keyboard: false

			});
		}
    };
	
	$rootScope.AudioAutoPlay =  function(pageType,pageId){
		if($rootScope.CourseConfig.HasAudio) {
				$rootScope.audioFile = document.getElementById('course-audio');
				$rootScope.audioFile.src = "#";
				var audioSrc ;
				if(pageType=="page"){
					audioSrc  = '../course_audio/' + $rootScope.selectedLang + '/m' + $rootScope.pad($rootScope.currentModule + 1) + '/t' + $rootScope.pad($rootScope.currentTopic + 1) + '/p' + $rootScope.pad($rootScope.currentPage + 1) + '.mp3';
				}
				if(pageType=="intro"){
					audioSrc = '../course_audio/intro/intro.mp3';
				}
				$rootScope.isAudio = $rootScope.CourseMenu.module[$rootScope.currentModule].topics[$rootScope.currentTopic].pages[$rootScope.currentPage].isAudio;
				if($rootScope.isAudio == true){					
					$rootScope.audioFile.src = audioSrc;
					$rootScope.audioFile.load();
					$rootScope.audioFile.addEventListener('loadeddata', $rootScope.LoadContent(pageType,pageId));
					$rootScope.audioFile.addEventListener('ended', $rootScope.AudioFinishedPlaying);
				}
				else{
					$rootScope.LoadContent(pageType,pageId)	
				}
                
            }else{				
				$rootScope.LoadContent(pageType,pageId);				
			}
	}
	$rootScope.LoadContent = function(pageType,pageId){
		$("#preloadericon").html('<img src="../course_images/pages/loader.gif">');
		if($rootScope.isAudio=="true")
			$rootScope.audioFile.removeEventListener('loadeddata',$rootScope.LoadContent,false);
		if(pageType=="page"){
			$rootScope.loadJSON().success(function(response){
				//console.log(response.contents)
				$rootScope.CourseContent = response.contents;
				checkCourseState();
				$rootScope.$state.go('course.pages', { id: pageId });
			});
			
		}
		if(pageType=="intro"){
			 $rootScope.$state.go('intro');
		}
	}
	
	$rootScope.AudioFinishedPlaying = function(){	
		if($rootScope.screenType == "static"){
			$rootScope.markVisitedPage();
		}
		$rootScope.audioFile.removeEventListener('ended', $rootScope.AudioFinishedPlaying);
		$rootScope.$apply();
	}

    //Event triggered on click of HELP button
    $rootScope.loadHelp = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine){
			var modalInstance = $modal.open({
				animation: $rootScope.animationsEnabled,
				templateUrl: '../html5/Views/ui/'+$rootScope.selectedLang+'/help.html',
				controller: ModalInstanceCtrl,
				windowClass: "modal fade in",
				backdrop: 'static',
				keyboard: false
			});
			$('.modal-backdrop').find('body').css('overflow-y','hidden');
		}
    };

    //Event triggered on click of Menu button if Visual menu set to true
    $rootScope.loadVisualMenu = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine==true){
			$rootScope.$state.go('menu');
			if ($rootScope.pageStatusList.join("").indexOf(1) == -1)
				$rootScope.showResumeBtn = false;
			else{
				if($rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-2 && ($rootScope.isPassed[1]==1)){
					$rootScope.showResumeBtn = false;
				}else{
					$rootScope.showResumeBtn = true;						
				}
			}
		}
    };
	
	$rootScope.LoadPopAudio = function(_id,custom){
		$rootScope.isPpAudioPlaying = true;		
		if(custom){
			$rootScope.audioFile.src = "";
			 audioSrc = '../course_audio/' + $rootScope.selectedLang + '/m' + $rootScope.pad($rootScope.currentModule + 1) + '/t' + $rootScope.pad($rootScope.currentTopic + 1)+ "/" + _id;
			$rootScope.audioFile.src = audioSrc;
			$rootScope.audioFile.load();
			$rootScope.audioFile.play();
		}else{
			audioSrc = '../course_audio/' + $rootScope.selectedLang + '/m' + $rootScope.pad($rootScope.currentModule + 1) + '/t' + $rootScope.pad($rootScope.currentTopic + 1) + '/p' + $rootScope.pad($rootScope.currentPage + 1) + '_pop'+ _id+'.mp3';
			$rootScope.audioFile.src = audioSrc;
			$rootScope.audioFile.load();
			$rootScope.audioFile.play();			
		}
		var elem = $("[audio-sync]");
		$(elem).removeAttr("audio-sync");
		$rootScope.isPaused = false;
		//$rootScope.isAudio = 'true';
		$(".pause-btn").removeClass('btnDisabled').addClass('btnEnabled');
		$rootScope.audioFile.addEventListener("ended",popupAudioEnded);
	}
	
	function popupAudioEnded(){
		$(".pause-btn").removeClass('btnEnabled').addClass('btnDisabled');
		//$rootScope.isAudio = 'false';
		$rootScope.audioFile.removeEventListener("ended",popupAudioEnded);
		$rootScope.$apply();
	}
}
	$rootScope.closeIframe = function(){
		$rootScope.showIframe = false;
		$rootScope.linkSrc = '';
	};
	
	$rootScope.printPdf = function(){
		var frm = document.getElementById("normalIframe").contentWindow;
			frm.focus();// focus on contentWindow is needed on some ie versions
			frm.print();
	};
	
	$rootScope.openPdfNewWindow = function(){
		myWindow = window.open($rootScope.linkSrc, "myWindow", "width=1015, height=672,resizable=yes,scrollbars=yes");
	};

    /////////////////////////////////////////////////
    ///LMS
    /////////////////////////////////////////////////


    $rootScope.updateCourseProgress = function () {
		var branching = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages[$rootScope.currentPage].branchingScreen;		
        $rootScope.cPageData = $rootScope.pad($rootScope.currentTopic + 1) + '|' + $rootScope.pad($rootScope.currentPage + 1);
         if(navigator.onLine==true){
			$rootScope.setLMSData();
		}
        $rootScope.checkForCompletion();
    };

	$rootScope.checkInternet = function (val){
		if(navigator.onLine==false){
				updateAlert(val);			
		}
	}
	
     $rootScope.setLMSData = function () {
        if ($rootScope.CourseConfig != undefined) {
			var _loctn = $rootScope.cPageData;
            var _psList = $rootScope.pageStatusList;
            var _susData = "course_progress=" + String(_psList.join('|'))+"%isPassed="+$rootScope.isPassed;
            if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				parent.SCORM_CallLMSSetValue("cmi.core.lesson_location", _loctn);
				parent.SCORM_CallLMSSetValue("cmi.suspend_data", _susData);
				parent.SCORM_CallLMSCommit();
            }
        }
    };
	$rootScope.setSuspend = function(){
		var _psList = $rootScope.pageStatusList;
		var _susData = "course_progress=" + String(_psList.join('|'))+"%isPassed="+$rootScope.isPassed;
		if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {  
				parent.SCORM_CallLMSSetValue("cmi.suspend_data", _susData);
				parent.SCORM_CallLMSCommit();
            }
		
	}
	
	 $rootScope.getDate = function (){
		var currentTime = new Date();
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		var	Months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
		var dateString = day + " " + Months[month-1] + " " + year;
		return dateString;
	}
	
	$rootScope.createaAssesment = function(){
		$rootScope.assesmentQuestionIndex = [];
		if($rootScope.assesmentQuestionIndex.length<2){
				 if ($rootScope.CourseConfig.IsRandomized && $rootScope.isPooled==true) {
					$rootScope.isPooled=false;					
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
					for (i = 1; i <= $rootScope.CourseConfig.AvailableAssessmentQuestion+1; i++) {
						$rootScope.assesmentQuestionIndex.push(i);
					}
					$rootScope.assesmentQuestionIndex.push($rootScope.CourseConfig.TotalAssesmentQuestions + 2);
				}
			}
	}
	
	
    $rootScope.checkForCompletion = function () {
        var _count = 0;
        var _len = 0;
        if ($rootScope.CourseConfig != undefined) {
            if ($rootScope.CourseConfig.MenuDepth == 2) {
                for (var i = 0; i < $rootScope.pageStatusList.length; i++) {
                    _len += $rootScope.pageStatusList.length;
                    for (var j = 0; j < $rootScope.pageStatusList[i].length; j++) {
                        if ($rootScope.pageStatusList[i][j] == "1") _count++;
                    }
                }
            } else {
                for (var i = 0; i < $rootScope.pageStatusList.length; i++) {
                    for (var j = 0; j < $rootScope.pageStatusList[i].length; j++) {
                        _len += $rootScope.pageStatusList[i].length;
                        for (var k = 0; k < $rootScope.pageStatusList[j].length; k++) {
                            if ($rootScope.pageStatusList[j][k] == "1") _count++;
                        }
                    }
                }
            }
            _len += 1;
        }
    }
}]);


function updateAlert(val){
	if(navigator.onLine==false){
	if(val=="en"){
			alert("Retrieval of data failed, this may be due to\n\n\u2022Failure in internet connection\n\u2022Failure in VPN connection\n\u2022Session Timeout\n\n\Please check all the above and re-take the assessment/course for successful completion\n\n\Note: Bookmark will help you to go to the last page you visited.");
		}
		
		if(val=="sc"){
			alert("数据检索失败，这可能是因为\n\n\u2022互联网连接失败\n\u2022VPN连接失败\n\u2022会话超时\n\n\请检查上述因素并重新参加测验/课程，以成功完成学习。\n\n\注意： 书签将帮助你前往你访问的最后一页。");
		}
		
		if(val=="in"){
			alert("Penarikan data gagal, ini mungkin disebabkan karena\n\n\u2022Kegagalan koneksi internet\n\u2022Kegagalan koneksi VPN\n\u2022Habis Waktu Sesi\n\n\Harap periksa seluruh hal tersebut di atas dan ulangi penilaian/pelatihan agar berhasil menyelesaikan.\n\n\Catatan: Penanda akan membantu Anda untuk membuka halaman terakhir yang Anda kunjungi.");
		}
		
		if(val=="kr"){
			alert("데이터를 불러 오는 데 실패 했다면, 다음의 이유로 추정됩니다.\n\n\u2022인터넷 연결 상태가 원활하지 않았기 때문에\n\u2022VPN 연결 상태가 원활하지 않았기 때문에\n\u2022 세션 시간이 종료되어서\n\n\상기 사항을 모두 확인 하신 다음, 평가/코스를 다시 완료해 주시기 바랍니다.\n\n\참고: 북마크 기능으로 마지막으로 방문했던 페이지를 쉽게 찾으실 수 있습니다.");
		}
		
		if(val=="tc"){
			alert("擷取資料錯誤，可能是因為以下原因\n\n\u2022網際網路連線失敗\n\u2022VPN 連線失敗\n\u2022工作階段逾時\n\n\請檢查以上原因並重新進行評估/課程。\n\n\Note: 注意事項： 書籤功能將協助您前往上次瀏覽的頁面。");
		}
		if(val=="th"){
			alert("การกู้คืนข้อมูลล้มเหลว สาเหตุอาจเป็นเพราะ\n\n\u2022การเชื่อมต่ออินเทอร์เน็ตล้มเหลว\n\u2022การเชื่อมต่อ VPN ล้มเหลว\n\u2022หมดเวลา\n\n\กรุณาตรวจสอบสาเหตุทั้งหมดข้างต้นแล้วทำการประเมิน/เรียนหลักสูตรใหม่อีกครั้งเพื่อให้ผ่านหลักสูตรนี้\n\n\หมายเหตุ: การบุ๊กมาร์คจะช่วยให้คุณไปยังหน้าล่าสุดได้ง่ายขึ้น");
		}
	}
	
}

var getsuspendDataVisual;
var getDateVisualMenu;
function getLMSDATAVisualMenu(){
	getsuspendDataVisual = parent.SCORM_CallLMSGetValue("cmi.suspend_data");
	getParsedSuspendDataVisual();
	
	
}

function getParsedSuspendDataVisual() {
  
            var tmp = getsuspendDataVisual.split("&");
            if (tmp.length > 1) tmp = tmp[1].split('%isPassed=');
            else tmp = tmp[0].split('%isPassed=');
            if (tmp.length >= 1) getDateVisualMenu = tmp[1].split(',');
            tmp = tmp[0].split("=");
            var suspendData = {};
            suspendData[tmp[0]] = tmp[1];
            return (suspendData);
        
 };
 