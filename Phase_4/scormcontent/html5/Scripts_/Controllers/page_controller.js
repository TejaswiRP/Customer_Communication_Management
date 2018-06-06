FrameworkApp.controller('PageContentCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
	
	if($rootScope.selectedLang == "ar"){
		$("#PageContent").attr("dir","rtl");	
	}
	// Video Completion handler 
	$scope.videoCompleteHandler = function(val){
		$("#vid_6_1").on('ended',function(){
			if(val=='skipNext'){
				$rootScope.gotoNextPage();
			}					
			else{
				$rootScope.markVisitedPage();
				$rootScope.isNextButtonDisabled = false;
			}
			$scope.$apply();	
		});
	}
	
	$scope.gamifiedPage = function(){
		if($rootScope.currentTopic+1 === $rootScope.CourseConfig.AssessmentSection && $rootScope.currentPage != 0 && $rootScope.pageStatusList[$rootScope.currentTopic].length-1 != $rootScope.currentPage)
			return true;
		else
			return false;
	}
	
	$scope.questionsArray = new Array(5);
	$scope.questionsArray[0] = Math.ceil(Math.random()*5);
	$rootScope.quizCounter = $scope.questionsArray[0];
	
	$scope.loadQuestion = function(e,indx){
		$rootScope.blinkQuizWrapper=false;
		if($scope.questionsArray.indexOf(indx) === -1){
			$scope.gotoNextPage();
			$rootScope.quizCounter = indx;
			$rootScope.isAnswered = false;
		}
	}
	
	$scope.crntQuizStatus = function(ele){
		if($rootScope.isAnswered){
			if($rootScope.asmntScoreArray[ele-1] === 2){
				return {'background-color':'#00abf0','cursor':'pointer','pointer-events':'all'};
			}else if($rootScope.asmntScoreArray[ele-1] === 1){
				return {'background-color':'transparent','cursor':'default','pointer-events':'none','border':'none'};
			}else if($rootScope.asmntScoreArray[ele-1] === 0){
				return {'background-color':'#65666a','cursor':'default','pointer-events':'none'};
			}
		}else{
			if(ele == $rootScope.quizCounter){
				return {'background-color':'#005c84','cursor':'default','pointer-events':'none'};
			}else if($rootScope.asmntScoreArray[ele-1] === 2){
				return {'background-color':'#00abf0','cursor':'default','pointer-events':'none'};
			}else if($rootScope.asmntScoreArray[ele-1] === 1){
				return {'background-color':'transparent','cursor':'default','pointer-events':'none','border':'none'};
			}else if($rootScope.asmntScoreArray[ele-1] === 0){
				return {'background-color':'#65666a','cursor':'default','pointer-events':'none'};
			}
		}
	};
	
	$scope.setImage = function(indx){
		if($rootScope.asmntScoreArray[indx-1] == 2){
			return '../course_images/pages/assesment/quesmark.png';
		}else if($rootScope.asmntScoreArray[indx-1] == 0){
			return '../course_images/pages/assesment/Xmark.png';
		}else{
			return '../course_images/pages/assesment/transparent.png';
		}
	};
	
	$scope.getResult = function(){
		if($rootScope.assesmentScore >= 4)
			return 'Views/screens/certificate/'+$rootScope.selectedLang+'/passed.html';	
		else
			return 'Views/screens/certificate/'+$rootScope.selectedLang+'/failed.html';	
	};
   
}]);