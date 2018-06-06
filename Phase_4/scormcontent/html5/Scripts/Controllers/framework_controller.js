////////////////////////////////////////////////////////
//Controller
////////////////////////////////////////////////////////
FrameworkApp.controller('Config', ['$scope', '$http', '$rootScope', '$modal', '$animate','$timeout', function ($scope, $http, $rootScope, $modal, $animate,$timeout) {
    //Event triggred on click of menu items 
    $rootScope.loadScreen = function ($mod, $topic, $page) {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(timer1)
			$timeout.cancel(timer1);
		if(navigator.onLine){	
			$rootScope.isPageCompleted = false;		
				$("#gInstruct").hide(0);
				var flag_getTopic = $topic+1;
				var getCstatus = $scope.gtCrseStts();
				
				if(flag_getTopic==$rootScope.CourseConfig.AssessmentSection && getCstatus){					
					$rootScope.passPopup = true;				
					
				}
				else{
					$rootScope.currentModule = $mod;
			$rootScope.currentTopic = $topic;
			$rootScope.currentPage = $page;
			if( $rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-1 )
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]);
			else
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.currentPage + 1);
			$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$topic].name;
					//$rootScope.$state.go('course.pages', { id: page_id });	
					$rootScope.AudioAutoPlay('page',page_id);
				if (!$rootScope.CourseConfig.VisualMenu) {
					if ($('.menu').css('display') != 'none') {
					$('.menu-page-list .tree-toggler').parent().children('ul.tree').toggle(200);
					$('.menu').slideToggle(200);
					$(".resource-btn").css("pointer-events", "all");
					$(".help-btn").css("pointer-events", "all");

					}
				}

				
					$rootScope.updateCourseProgress();
			}
			$rootScope.isPassed[5] = true;		
		}
    };

	$scope.GoToPages = function(t,p){
		//console.log(t,p);
		$rootScope.loadScreen(0,(t-1),(p-1));
	}

     //Event triggered on click og NEXT button
    $scope.gotoNextPage = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(timer1)
			$timeout.cancel(timer1);
		if(navigator.onLine){
			$rootScope.isPageCompleted = false;		
			$("#gInstruct").hide(0);
			if($rootScope.CourseContent.gotoVmenuFrwd){
				$scope.loadVisualMenu();
				return;
			}
			$rootScope.currentPage++;
			if($rootScope.CourseContent.goNext != undefined){
				var pID = $rootScope.CourseContent.goNext.split("_");
				$rootScope.currentModule = parseInt(pID[0])-1;
				$rootScope.currentTopic = parseInt(pID[1])-1;
				$rootScope.currentPage = parseInt(pID[2])-1;
			}else{
				if ($rootScope.CourseContent.skipToNextPage != undefined)
					$rootScope.currentPage = $rootScope.CourseContent.skipToNextPage - 1;
				if ($rootScope.currentPage >= $rootScope.getTotalPagesInTopic()){
					if ($rootScope.CourseConfig.VisualMenu && !$rootScope.CourseConfig.SkipVisualmenu) {
						$rootScope.currentPage = $rootScope.currentPage - 1;
						$scope.loadVisualMenu();
						return;
					} else {
						$rootScope.currentTopic++;
						$rootScope.currentPage = 0;
						if ($rootScope.currentTopic >= $scope.getTotalTopicsInModule()) {
							$rootScope.currentModule++;
							$rootScope.currentPage = 0;
							$rootScope.currentTopic = 0;

						}
					}
				}
			}
			$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
			if( $rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-1 && $rootScope.currentPage > 0)
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]);
			else
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.currentPage + 1);
				//$rootScope.$state.go('course.pages', { id: page_id });	
				$rootScope.AudioAutoPlay('page',page_id);
			if ($rootScope.pageStatusList[$rootScope.currentTopic].indexOf("1") == -1)
				$rootScope.showResumeBtn = false;
			else
				$rootScope.showResumeBtn = true;
				$rootScope.updateCourseProgress();	
		}			
    };
	
	$scope.togglePlay = function(){
		//$rootScope.isAudio = $rootScope.CourseMenu.module[$rootScope.currentModule].topics[$rootScope.currentTopic].pages[$rootScope.currentPage].isAudio;
		if($rootScope.isAudio){
				if($rootScope.isPaused){
				$rootScope.audioFile.play();
				$rootScope.isPaused = false;
			}
			else{
				$rootScope.audioFile.pause();
				$rootScope.isPaused = true;
				}
			}
	};
	
	$scope.reloadAudio = function(){
		$rootScope.audioFile.pause();
		if($rootScope.isAudio){
			var audioSrc  = '../course_audio/' + $rootScope.selectedLang + '/m' + $rootScope.pad($rootScope.currentModule + 1) + '/t' + $rootScope.pad($rootScope.currentTopic + 1) + '/p' + $rootScope.pad($rootScope.currentPage + 1) + '.mp3';
			$rootScope.audioFile.src = audioSrc;
			$rootScope.audioFile.load();
			$rootScope.isPaused = false;
		}
		
		$rootScope.$state.go($rootScope.$state.current.name, {}, {reload: true});
		if($rootScope.isAudio){
			$rootScope.audioFile.play();
			$(".pause-btn").removeClass('btnDisabled').addClass('btnEnabled');
		}
	}

    //Event triggered on click of PREVIOUS button
    $scope.gotoPreviousPage = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(timer1)
			$timeout.cancel(timer1);
		if(navigator.onLine){
			$rootScope.isPageCompleted = false;	
			$("#gInstruct").hide(0);			
			$rootScope.isPrevButtonDisabled = true;
			if($rootScope.CourseContent.gotoVmenuBk){
				$scope.loadVisualMenu();
				return;
			}
			if($rootScope.CourseContent.goPrevious != undefined){
				var pID = $rootScope.CourseContent.goPrevious.split("_")
				$rootScope.currentModule = parseInt(pID[0])-1;
				$rootScope.currentTopic = parseInt(pID[1])-1;
				$rootScope.currentPage = parseInt(pID[2])-1;
			}else{
				if ($rootScope.CourseContent.skipToPrevPage != undefined)
					$rootScope.currentPage = $rootScope.CourseContent.skipToPrevPage;
				$rootScope.currentPage--;
				if ($rootScope.currentPage < 0) {
					if ($rootScope.CourseConfig.VisualMenu && !$rootScope.CourseConfig.SkipVisualmenu) {
						$rootScope.currentPage = $rootScope.currentPage + 1;
						$scope.loadVisualMenu();
						return;
					} else {
						$rootScope.currentTopic--;
						if ($rootScope.currentTopic < 0) {
							$rootScope.currentModule--;
							$rootScope.currentTopic = $rootScope.CourseMenu.module.topics.length - 1;
							$rootScope.currentPage = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages.length - 1;
						}
						$rootScope.currentPage = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages.length - 1;						
					}
				}				
			}
			$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
			var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.currentPage + 1);
			//$rootScope.$state.go('course.pages', { id: page_id });	
			$rootScope.AudioAutoPlay('page',page_id);
			if ($rootScope.pageStatusList[$rootScope.currentTopic].indexOf(1) == -1)
				$rootScope.showResumeBtn = false;
			else
				$rootScope.showResumeBtn = true;
			}

    };	
	
	$scope.progressBar = function(){
		var sts = $rootScope.pageStatusList.toString().split(','),
			ttl = sts.length,
			cntr = 0,
			ttlWdth = parseInt($("#progressBar").css('width')),
			devided = 0,
			percent = 0,border=0;
		for(var i = 0 ; i < ttl;i++){
			if(sts[i] == 1 || sts[i] == "1"){
				cntr++;
			}
		}
		percent = Math.round(100 * (cntr/ttl));
		devided = ttlWdth/ttl;
		border = Math.round(devided*cntr);
		var temp = parseInt($("#progressBar").css('border-left'));
		if($rootScope.currentPageNumber<=$rootScope.totalPages){
			return {"border-left":border+"px solid #65cdf3"};	
		}
		
	}

    //Event triggered on click of menu heading module/topic button
    $rootScope.displayList = function ($event, pMod, pTopic) {
        $(".menu-page-list").mCustomScrollbar({
            axis: "y" // horizontal scrollbar
        });
		if ($($event.target).attr("data-expand") != "false") {
			$($event.target).parent().parent().find("i").removeClass('fa-arrow-circle-o-down').addClass('fa-arrow-circle-o-down');
			$($event.target).next('.tree').slideToggle();
			$('.menu-page-list .tree').not($($event.target).next('.tree')).slideUp();
			var cs = $($event.currentTarget).parent().find('i').attr("class");
			$($event.target).parent().parent().find("i").removeClass('fa-arrow-circle-o-up');
			if (cs == 'nav-toggle-icon fa fa-arrow-circle-o-down') {
				$($event.currentTarget).find('i').removeClass('fa-arrow-circle-o-down').addClass('fa-arrow-circle-o-up');
			}
			if (cs == 'nav-toggle-icon fa fa-arrow-circle-o-up') {
				$($event.currentTarget).find('i').removeClass('fa-arrow-circle-o-up').addClass('fa-arrow-circle-o-down');
			}
		}
		else {
			$rootScope.loadScreen(pMod, pTopic, 0)
		}
    };
	
	$scope.hideArrow = function(){
		$rootScope.hideEaseArrow = true;
	};
	
	$scope.gtCrseStts = function(){
		if($rootScope.isPassed[0] == 1 || $rootScope.isPassed[1] == 1){
			return true;			
		}
		else{
			return false;
		}
	}
	
	$scope.CloseCrseStts = function(){
		$rootScope.passPopup = false;
	}
	
	$scope.toggleSound = function(){
		//$rootScope.isAudio = $rootScope.CourseMenu.module[$rootScope.currentModule].topics[$rootScope.currentTopic].pages[$rootScope.currentPage].isAudio;
		//if($rootScope.isAudio=="true"){
		var audioELement = document.getElementById("course-audio");
		if($rootScope.isSoundon){
			audioELement.volume = 0;
			$rootScope.isSoundon = false;
		}
		else{
			audioELement.volume = 1;
			$rootScope.isSoundon = true;
		}
	//	}
	};
	$scope.transcript = false;
	$scope.toggleTranscript = function(){
		if($scope.transcript)
			$scope.transcript = false;
		else
			$scope.transcript = true;
	};

	$scope.resumeCourseMenu = function (){
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine==true){
			$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
			if($rootScope.currentTopic + 1 == $rootScope.CourseConfig.AssessmentSection && ($rootScope.currentPage!=$rootScope.CourseConfig.AvailableAssessmentQuestion+1 || $rootScope.assesmentPercentageScore < $rootScope.CourseConfig.MasteryScore)){
				$rootScope.currentPage = 0;
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.currentPage + 1);
			}else if($rootScope.currentTopic + 1 == $rootScope.CourseConfig.PreAssessmentSection && $rootScope.currentPage !=0){
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]);
				$rootScope.isResume = true;
			}else if($rootScope.currentTopic + 1 == $rootScope.CourseConfig.AssessmentSection && $rootScope.currentPage==$rootScope.CourseConfig.AvailableAssessmentQuestion+1){
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]);
			}
			else{
				var cT = $rootScope.currentTopic;
				var cP = $rootScope.currentPage;
				if($rootScope.pageStatusList[cT][cP] == "1"){
					//console.log($rootScope.currentPage,"==========",$rootScope.pageStatusList[cT].length-1)
					/* var isPassed = ($rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-2 && $rootScope.getScore >= $rootScope.CourseConfig.MasteryScore);
					if(isPassed){
						showcertificate();
						return;
					} */
					if($rootScope.CourseContent.markNextScreen != "true" && $rootScope.currentPage < $rootScope.pageStatusList[cT].length-1 && $rootScope.CourseMenu.module.topics[cT].pages[cP].type != 'branching'){
						$rootScope.currentPage++;
					}
					else{
						$rootScope.currentPage = 0;
						$rootScope.currentTopic++;
					}
				}
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.currentPage + 1);
			}		
			$scope.$state.go('course.pages', { id: page_id });
		}
    };
	
	
	$scope.checkscormStatus = function(){		
		$rootScope.courseStatus =  scormAdaptor_getstatus();
		if($rootScope.courseStatus !="passed" || $rootScope.courseStatus !="failed"){			
			scormAdaptor_incomplete()
			scormAdaptor_commit();			
		}		
	};

    //Event triggered on click of EXIT button
    $scope.closeWindow = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		$('.course-footer').css('zIndex','0');
		$('#myModal').modal('show');
		$('#exit').on('click', function (e) {
			$scope.checkscormStatus();
			closeWERE();
			window.close();
			top.close();
			window.self.close();
			window.top.close();
			scormAdaptor_adlOnunload();
			
			$('.course-footer').css('zIndex','1030');
		});
		$('#stayThere').on('click',function(e){
			$('#myModal').modal('hide');
			$('.course-footer').css('zIndex','1030');
		});
    };

    $scope.pad = function (n) {
        return (n < 10) ? ("0" + n) : n;
    };

    $rootScope.getTotalPagesInTopic = function (){
		if($rootScope.currentTopic != $rootScope.CourseConfig.PreAssessmentSection-1){
			return $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages.length;		
		}else{
			return $rootScope.pageStatusList[$rootScope.currentTopic].length;
		}
    };

    $scope.getTotalTopicsInModule = function (){
        return $rootScope.CourseMenu.module.topics.length;
    };

    $scope.getModuleStatus = function ($moduleId){
        var pageCount = 0;
        var totalPageCount = 0;
        for (var i = 0; i < $rootScope.pageStatusList[$moduleId].length; i++) {
            for (var j = 0; j < $rootScope.pageStatusList[$moduleId][i].length; j++) {
                totalPageCount++;
                if ($rootScope.pageStatusList[i][j] == "1") {
                    pageCount++;
                }
            }
        }
        if (pageCount == totalPageCount)
            return "completed";
        if (pageCount > 0)
            return "in-progress";
        if (pageCount == 0)
            return "not-visited";
    };
	
	
	$rootScope.crntQuizStatus = function(indx){
		 	if($rootScope.asmntScoreArray[indx] == 1){
				return "correct-ans";			
			}else if($rootScope.asmntScoreArray[indx] == 0){
				return "incorrect-ans";
			}else{
				return "before-answer";
			}
	}

    $scope.exitBtn = function () {
        if ($rootScope.CourseConfig.UIControls.ExitButton == 1)
            return "show";
        else
            return "hide";
    };
	
	 var passStatus = $scope.gtCrseStts();
	
    $scope.getTopicStatus = function ($moduleId, $topicId) {
        var tStautus = "";
        if ($rootScope.pageStatusList[$topicId].indexOf("0") == -1) {
            tStautus = "completed";
            if ($rootScope.CourseConfig.ForceNavigation)
            $(".completed").parent().removeClass("curser-event");
            $(".completed").parent().removeClass("disabled-visual-menu");
        }
        if ($rootScope.pageStatusList[$topicId].indexOf("0") > -1 && $rootScope.pageStatusList[$topicId].indexOf("1") > -1) {
				tStautus = "in-progress";
            if ($rootScope.CourseConfig.ForceNavigation) {
                $(".in-progress").parent().removeClass("curser-event");
                $(".in-progress").parent().removeClass("disabled-visual-menu");
            }
        }
        if ($rootScope.pageStatusList[$topicId].indexOf("1") == -1) {
				tStautus = "not-visited";
        }
		if ($topicId == 0 && ($rootScope.isPassed[0] == 0)) {
				tStautus = "completed-unsuccess";
		}
		if ($topicId == $rootScope.CourseConfig.AssessmentSection-1 && $rootScope.pageStatusList[$topicId].indexOf("0") == -1) {
			if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2'){
				if($rootScope.getScore<80){
					tStautus = "completed-unsuccess";
					
				}
			}else{
				$rootScope.getScore = $rootScope.assesmentPercentageScore;
				if($rootScope.getScore<80){
					tStautus = "completed-unsuccess";
				}
			}
		}
		if($rootScope.pageStatusList[$topicId+1] != undefined && $rootScope.pageStatusList[$topicId].indexOf("0") == -1 && $rootScope.pageStatusList[$topicId+1].indexOf("1") == -1){
			var visitNext = ".topic"+($topicId+2);
			$(visitNext).addClass("hightlight-next");
		}else if($rootScope.pageStatusList[0].indexOf("1") == -1){
			var visitNext = ".num1";		
		}
		if(passStatus){
			$(".topic7").css({
				"background": "#cfd0d0",
				"border":"1px solid #b9b9b9"
			});
		}
        return tStautus;
    };
	
	$scope.getProgressImage = function(ind){
		var img = "../course_images/visualmenu/location/t"+(ind+1)+".png";
		 if ($rootScope.pageStatusList[ind].indexOf("0") == -1) {
			 img = "../course_images/visualmenu/location/t"+(ind+1)+"_completed.png";
		 }
		 else if($rootScope.pageStatusList[ind].indexOf("0") > -1 && $rootScope.pageStatusList[ind].indexOf("1") > -1) {
			   img = "../course_images/visualmenu/location/t"+(ind+1)+"_in_progress.png";
		  }
		return img;
	}
	
	$scope.getCurrentStatus = function($moduleId, $topicId){		
		
		var status = '';
		 if ($rootScope.pageStatusList[$topicId].indexOf("0") == -1){
			status = "topic-completed";
		 }
		else if($rootScope.pageStatusList[$topicId].indexOf("1") == -1){
			if($topicId!=0 )
			{
				if($rootScope.pageStatusList[$topicId-1].indexOf("0") == -1)
					status = "topic-not-active";
				else{
					if ($rootScope.CourseConfig.ForceNavigation)
						status = "topic-not-started";
				}
			}
		}else{
			status = "topic-in-progress";
		}
		return status;
	};

    $scope.getVisualMenuStatus = function($moduleId, $topicId) {
        var tStautus = "";
        if ($topicId > 0 && $rootScope.pageStatusList[$topicId-1].indexOf("0") >= 0) {
            if ($rootScope.CourseConfig.ForceNavigation) {
				
				tStautus = "curser-event disabled-visual-menu";
				/* if($topicId != 0){
					if($rootScope.isPassed[0] == 0 || $rootScope.isPassed[0] == 2){
						
						if ($rootScope.pageStatusList[$topicId-1].indexOf("0") != -1) {
						
								tStautus = "curser-event disabled-visual-menu";
						}
					}					
				}
				if($topicId == 0 && ($rootScope.vstdAbtThCrse || $rootScope.pageStatusList[0].indexOf(1) == -1)){
							tStautus = "curser-event disabled-visual-menu";
				} */

            }
        }
		/* if($rootScope.isPassed[0] == 0 && $topicId == 0){			
			tStautus = "curser-event disabled-visual-menu";		
		} */
        return tStautus;
    }
	
	$scope.getButtonStyle = function ($moduleId, $topicId) {
	  $scope.myObj = {
		    "background": "linear-gradient(#c7d9e2, #9ba0a2)"
	  }
		 if ($rootScope.pageStatusList[$topicId].indexOf("0") == -1) {
				$scope.myObj = {
				"background" : "linear-gradient(to bottom, #79c142 0%, #79c142 35%, rgba(34,170,70,1) 100%)"
			  }
		}
         if ($rootScope.pageStatusList[$topicId].indexOf("0") > -1 && $rootScope.pageStatusList[$topicId].indexOf("1") > -1) {
			 $scope.myObj = {
				"background" : "linear-gradient(to top, rgb(0, 100, 148),rgb(0, 120, 173) 35%,rgb(0, 176, 243))"
			  }
        }
        if ($rootScope.pageStatusList[$topicId].indexOf("1") == -1) {
			$scope.myObj = {
				 "background": "linear-gradient(#c7d9e2, #9ba0a2)"
			  }
        }
		if ($topicId == 0 && ($rootScope.isPassed[0] == 0)) {
			$scope.myObj = {
				"background" : "linear-gradient(#e48772, #c10000)"
			  }
		} 
		if ($topicId == $rootScope.CourseConfig.AssessmentSection-1 && $rootScope.pageStatusList[$topicId].indexOf("0") == -1) {
			if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2'){
				if($rootScope.getScore<80){
					$scope.myObj = {
					"background" : "linear-gradient(#e48772, #c10000)"
				  }
					
				}
			}else{
				$rootScope.getScore = $rootScope.assesmentPercentageScore;
				if($rootScope.getScore<80){
					$scope.myObj = {
						"background" : "linear-gradient(#e48772, #c10000)"
					  }
				}
			}
		}
        return $scope.myObj; 
    };
	
	$scope.getMenuStyle = function($isPassed, $index) {
        if(($isPassed[0]==1 || $isPassed[0]==0) && $index==0 )
			return 'printDisable';
		
		else
			return 'completed-bg';
    }
	

    $scope.getPageStatus = function ($moduleId, $topicId, $pageId) {
        if ($rootScope.pageStatusList[$topicId][$pageId] == "1")
            return "completed";
        else
            return "not-visited";
    };

    $rootScope.getTotalPagesCount = function () {
        var _totalPageCount = 0;
        if($rootScope.CourseConfig.PageCount == "topicwise")
            return $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].pages.length;
        else {
            if($rootScope.CourseConfig.MenuDepth == 2){
				for(var j = 0; j < $rootScope.CourseMenu.module.topics[i].length; j++){
					if(!$rootScope.CourseMenu.topics[i].pages[j].branchingScreen)
						_totalPageCount++;
				}
            }
        }
    };

    

    $scope.closeVidePopUp = function(){
    	$scope.showVideo = false;
    	document.getElementById('introVideo').pause();
    }


    $scope.changeRole = function(role){
		if(role == '' || role == undefined){
			alert('Select your role')
		}else if(role == 'role1'){
			$scope.gotoNextPage();
		}else{
			return;
		}
	}
}]);


FrameworkApp.controller('Intro', ['$scope', '$http', '$rootScope', '$modal','$location', function ($scope, $http, $rootScope, $modal,$location) {
    //Start the Course on click of proceed button in language select page
    $scope.startcourse = function (){
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine==false){
			return;
		}
		if($location.path()=="/" && $rootScope.selectedLang == 'en' && $rootScope.CourseConfig.HasRole){
			$rootScope.$state.go('role');
			return;
		}	
		disableKeys();		
		$rootScope.isStarted = true;		
        if($rootScope.selectedLang == undefined)
            $rootScope.selectedLang = "en";
		$rootScope.getUiAssests();
		
		
		
        if($rootScope.CourseConfig.HasIntroPage){
            $rootScope.$state.go('intro');
            return true;
        }else{
            if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				$rootScope.getSuspendData = parent.SCORM_CallLMSGetValue("cmi.suspend_data");
				
				if($rootScope.getSuspendData){
					var susData = $rootScope.getParsedSuspendData();
					
					if($rootScope.isPassed[4] == "false"){
						$rootScope.getLMSData();
					}else{
						startNewCourse();
					}
				}else{
					$rootScope.getLMSData();					
				}
            }else{
                startNewCourse();
            }
        }
    };
	
	function startNewCourse(){
		if ($rootScope.CourseConfig.VisualMenu)
			$rootScope.loadVisualMenu();
		else {
			//$rootScope.$state.go('course.pages', {id: page_id});
			$rootScope.AudioAutoPlay('page',page_id);
			$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[0].name;
		}
		$rootScope.isPassed[4] = false;
	}
	
	$scope.startComplianceCourse = function(){
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine==false){
			return;
		}
		window.onbeforeunload = null;
		window.location.href="../compliance/a001index.html";
	}

    $scope.startcourseFromIntro = function (){
		var audioELement = document.getElementById("course-audio");
			audioELement.src = "../course_document/conversion_audio.mp3";
			audioELement.load();
			audioELement.addEventListener('loadeddata',playAud);
		function playAud(){
			if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				$rootScope.getLMSData();
			} else {
				var page_id = $scope.pad($rootScope.currentModule + 1) + '_' + $scope.pad($rootScope.currentTopic + 1) + '_' + $scope.pad($rootScope.currentPage + 1);
				if ($rootScope.CourseConfig.VisualMenu)
					$rootScope.loadVisualMenu();
				else {
					//$rootScope.$state.go('course.pages', {id: page_id});
					$rootScope.AudioAutoPlay('page',page_id);
					$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[0].name;
				}
			}
		}			
    };


    $rootScope.getLMSData = function () {
		var fullname = parent.SCORM_GetStudentName();
		var nameArray = fullname.split(',')
		$rootScope.ScormnUsername = parent.SCORM_GetStudentName();
		$rootScope.ScormnUseScore = parent.SCORM_GetScore();
		$rootScope.userName = nameArray[1].trim();
        $rootScope.lessonLocation = parent.SCORM_CallLMSGetValue("cmi.core.lesson_location");
		$rootScope.getSuspendData = parent.SCORM_CallLMSGetValue("cmi.suspend_data");
	
        if($rootScope.lessonLocation != "")
            $rootScope.checkForCourseResume();
        else{
			$rootScope.dontResumeCourse(true);
        }
    };

    $rootScope.checkForCourseResume = function () {
		$rootScope.resumeLastPage = false;
        if ($rootScope.lessonLocation == undefined || $rootScope.lessonLocation == '' || $rootScope.lessonLocation == "null" || $rootScope.lessonLocation == "403" ||  $rootScope.lessonLocation.length>10) {
            var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage + 1);
            if ($rootScope.CourseConfig.VisualMenu)
                $rootScope.loadVisualMenu();
            else
				$rootScope.AudioAutoPlay('page',page_id);
                //$rootScope.$state.go('course.pages', { id: page_id });
            $rootScope.topicTitle = $rootScope.CourseMenu.module.topics[0].name;
        } else {
            $rootScope.sus_data = $rootScope.getParsedSuspendData();
            var cp_data = $rootScope.sus_data.course_progress.slice();
            var t1 = cp_data.split("|");
            var t2 = [];
            if ($rootScope.CourseConfig.MenuDepth == 2) {
                for (var i = 0; i < t1.length; i++) {
                    t2.push(t1[i].split(","));
                }
                $rootScope.pageStatusList = t2.slice();
            } else {
                $rootScope.pageStatusList = t2.slice();
            }
            if ($rootScope.CourseConfig.MenuDepth == 2) {
                $rootScope.currentModule = 0;
                $rootScope.currentTopic = Number($rootScope.lessonLocation.split('|')[0]) - 1;
                if(Number($rootScope.lessonLocation.split('|')[0]) - 1 == $rootScope.CourseConfig.AssessmentSection-1) {
					var cP = Number($rootScope.lessonLocation.split('|')[1]) - 1;
					var score = (parseInt($rootScope.isPassed[2])/$rootScope.CourseConfig.AvailableAssessmentQuestion) * 100;
					if(cP == $rootScope.CourseConfig.AvailableAssessmentQuestion+2 && $rootScope.isPassed[1]==1){
						$rootScope.currentPage = cP;
						$rootScope.resumeLastPage = true;
					}
					else{
						$rootScope.currentPage = 0;
					}
                }
                else{
                    $rootScope.currentPage = Number($rootScope.lessonLocation.split('|')[1]) - 1;
                }

            } else {
                $rootScope.currentModule = Number($rootScope.lessonLocation.split('|')[0]) - 1;
                $rootScope.currentTopic = Number($rootScope.lessonLocation.split('|')[1]) - 1;
                if(Number($rootScope.lessonLocation.split('|')[1]) - 1 == $rootScope.CourseConfig.AssessmentSection-1) {
                    $rootScope.currentPage = 0;
                }
                else {
                    $rootScope.currentPage = Number($rootScope.lessonLocation.split('|')[2]) - 1;
                }
            }
            $rootScope.showResumePopup();
        }
    };

    $rootScope.showResumePopup = function () {
        $('#course_popup').modal('show');
    };
	

    $rootScope.resumeCourse = function () {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine==false){
			return;
		}
        $('#course_popup').modal('hide');
		$rootScope.createaAssesment();
		if($scope.pad($rootScope.currentTopic + 1) == $rootScope.CourseConfig.PreAssessmentSection && $rootScope.currentPage == $rootScope.CourseConfig.AvailablePreQuestions+1 && $rootScope.isPassed[0] == 1){
			$http.get('../course_content/' + $rootScope.selectedLang + '/coursemenu.xml').
			then(function (response) {
				$('#course_popup').on('hidden.bs.modal', function (e) {
					$rootScope.CourseMenu = $.xml2json(response.data).root;
					$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
					var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]);
					//$rootScope.$state.go('course.pages', { id: page_id });
					$rootScope.AudioAutoPlay('page',page_id);
				});
			});
		}else if($rootScope.currentTopic + 1 == $rootScope.CourseConfig.PreAssessmentSection && $rootScope.currentPage !=0){
			$rootScope.dontResumeCourse();
			
		}else{
			$http.get('../course_content/' + $rootScope.selectedLang + '/coursemenu.xml').
			then(function (response) {
				$rootScope.CourseMenu = $.xml2json(response.data).root;
				$rootScope.topicTitle = $rootScope.CourseMenu.module.topics[$rootScope.currentTopic].name;
				$('#course_popup').on('hidden.bs.modal', function (e) {
					if($rootScope.resumeLastPage)
						var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.assesmentQuestionIndex[$rootScope.currentPage]);
					else
						var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage + 1);
					//$rootScope.$state.go('course.pages', { id: page_id });
					$rootScope.AudioAutoPlay('page',page_id);
				});
			}, function (response) {
			});			
		}
		plAudio();
    };

    $rootScope.dontResumeCourse = function (start) {
		$rootScope.checkInternet($rootScope.selectedLang);
		if(navigator.onLine){
			$('#course_popup').modal('hide');
			$rootScope.currentModule = 0;
			$rootScope.currentTopic = 0;
			$rootScope.currentPage = 0;
			$('#course_popup').on('hidden.bs.modal', function (e){
				if ($rootScope.CourseConfig.VisualMenu && start==false && start!=undefined ){
					$rootScope.loadVisualMenu();
					$rootScope.showResumeBtn = false;
				}
				else{
					var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage + 1);
					$rootScope.AudioAutoPlay('page',page_id);
					//plAudio();
					//$rootScope.$state.go('course.pages', {id: page_id});
				}
			});
			if(start){
				/* var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage + 1);
				$rootScope.loadPage(page_id) */
				if ($rootScope.CourseConfig.VisualMenu){
					$rootScope.loadVisualMenu();
					$rootScope.showResumeBtn = false;
				}
				//$rootScope.$state.go('course.pages', {id: page_id});
			}
		}
     
    };

    $rootScope.getParsedSuspendData = function () {
        if ($rootScope.getSuspendData != undefined) {
            var tmp = $rootScope.getSuspendData.split("&");
            if (tmp.length > 1) tmp = tmp[1].split('%isPassed=');
            else tmp = tmp[0].split('%isPassed=');
            if (tmp.length >= 1) {
				//console.log(tmp[1].split(',').slice(0,6))
				$rootScope.isPassed = tmp[1].split(',').slice(0,6);
				var jsonStr = tmp[1].split(',').slice(6,tmp[1].split(',').length);
				var userData = jsonStr.join(",");
				$rootScope.isPassed[6] = userData;
				console.log(userData)
				console.log($rootScope.isPassed[6])
				//$rootScope.isPassed = tmp[1].split(',');
			}
            tmp = tmp[0].split("=");
            var suspendData = {};
            suspendData[tmp[0]] = tmp[1];
			console.log(tmp[1])
            return (suspendData);
        }
    };
}]);
