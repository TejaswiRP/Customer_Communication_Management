FrameworkApp.directive('lastpage', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout) {
            $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] = "1";
			$rootScope.isLastPage = true;
			$timeout(function(){
				$rootScope.isNextButtonDisabled = true;				
			});
			$scope.certificate = true;
			$scope.togglePage = function(){
				if($scope.certificate){
					$scope.certificate = false;				
				}else{
					$scope.certificate = true;
				}
			};
			$scope.print = function(){
				setTimeout(function(){
					window.print();	
				},500);
			}
			if($rootScope.CourseConfig.AppType.toLowerCase() != 'scorm1.2'){
				$rootScope.ScormnUsername = "Dummy Name";
			}
			$rootScope.assesmentPercentageScore = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);
        }
    }
});
FrameworkApp.directive('nextAndBack', function (){
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$scope.counter = 0; 
			$scope.disableButton = true;
			$scope.feedbackToggle = false;
			$scope.btnsArray = [];
			$scope.correctAnswer = [];
			$scope.userAnswer = [];
			$scope.screenCompleted = false;
			$scope.visited = [];		
			$scope.ansCounter = 0;
			$scope.showNextInAssmnt = false;
			$scope.visited[$scope.counter] = 0;		
			$scope.showDragAndDrop = false;		
			$scope.start = function(){	
				var visited = false;			
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
					var visited = true;
				}
				$rootScope.numPages = $rootScope.CourseContent.pages.length;
				$scope.loadContent();
				$rootScope.question = $rootScope.CourseContent.pages[$scope.counter].question;
				$scope.numberOfbuttons = $rootScope.CourseContent.numberOfbuttons || 0;
				for(var i = 0 ; i < $rootScope.CourseContent.pages.length;i++){
					if(visited)
						$scope.btnsArray[i] = 0;
					else
						$scope.btnsArray[i] = $rootScope.CourseContent.pages[i].number_of_buttons;
				}					
			};
			var promise = $interval(function(){
				if($(".nextAndBack").length){
					$scope.start();	
					$interval.cancel(promise);
				}
			},100);

			
			
			$scope.previousPage = function(){
				if($scope.counter != 0){
					$scope.counter--;
					$scope.loadContent();
					$scope.feedbackToggle = false;
					$scope.disableButton = true;
					//$scope.screenCompletion();
					//console.log($scope.btnsArray)
				}
			}
			
			$scope.screenCompletion = function(){
				 $timeout(function(){ 
					if (JSON.stringify($scope.btnsArray) == JSON.stringify($scope.visited)) {
						$scope.screenCompleted = true;
						$rootScope.markVisitedPage();
					}	
				},500); 
			};
			
			$scope.nextPage = function(){
				if($scope.counter != $rootScope.CourseContent.pages.length-1){
					//console.log($rootScope.CourseContent.pages[$scope.counter].number_of_buttons);
					//console.log($scope.btnsArray);
					if((!$rootScope.CourseContent.assessmentScreen || $scope.feedbackToggle) && $scope.btnsArray[$scope.counter] == 0){
						$scope.counter++;
						$scope.loadContent();
						$scope.feedbackToggle = false;
						$scope.disableButton = true;
						$scope.showNextInAssmnt = false;
						//$scope.screenCompletion();
					}
				}		
				if($scope.counter === $rootScope.CourseContent.pages.length-1)
					$rootScope.markVisitedPage();
			}
			
			$scope.loadContent = function(){
					$rootScope.titleText = $rootScope.CourseContent.pages[$scope.counter].pageHeading || '';
					$rootScope.paraText = $rootScope.CourseContent.pages[$scope.counter].paragraphText || '';
					//console.log($("#bubbleID").text())				
					$("#bubbleID").hide(0).show(0);
			};
			
			$scope.onOptionSelected = function(pIndex){
				if(!$scope.feedbackToggle){
					$scope.disableButton = false;				
					$("#options label").removeClass("option-selected");
					$("#options label").eq(pIndex).addClass("option-selected");					
				}
			};
			
			$scope.toggleDragAndDrop = function(_val,_type){
				$rootScope.CourseContent.pages[$scope.counter].number_of_buttons = 0;
				$scope.showDragAndDrop?$scope.showDragAndDrop = false:$scope.showDragAndDrop = true;
				/* setTimeout(function(){
					if( $('#vid_2_4') != undefined && $scope.showDragAndDrop)
						$('#vid_2_4')[0].play();		
				},500); */
				if( _val!=undefined && _val=="gonext"){
					if($scope.counter == $rootScope.CourseContent.pages.length-1){
						$scope.gotoNextPage();						
					}else{
						if(_type == 'btnclick' && $rootScope.CourseContent.btn_click_learn.length == $(".selected").length){
							$scope.btnsArray[$scope.counter] = 0;
							$scope.nextPage();							
						}
						else if(_type == undefined || _type == null){
							$scope.btnsArray[$scope.counter] = 0;
							$scope.nextPage();
						}
					}
				}	
			}
			$scope.toggleDragAndDrop1 = function(nav){
				$scope.showDragAndDrop?$scope.showDragAndDrop = false:$scope.showDragAndDrop = true;
				if(nav){
					if($(".selected").length == $(".tabs").length){
							$scope.btnsArray[$scope.counter] = 0;
							$scope.nextPage();
					}
				}
			}
		
			$scope.checkAnswer = function(){
				$scope.screenCompletion();
				if($scope.counter+1 != $rootScope.CourseContent.pages.length)
				$scope.showNextInAssmnt = true;
				$scope.visited[$scope.counter] = 1;
				$scope.feedbackToggle = true;
				$scope.correctAns = [];
				
				var AnswerList = document.getElementsByName('answer');
				for (var i = 0; i < AnswerList.length; i++) {
					if (AnswerList[i].checked) {
						$scope.userAnswer.push(1);
					}
					else {
						$scope.userAnswer.push(0);
					}
					if($rootScope.CourseContent.pages[$scope.counter].question[i].isCorrect)
						$scope.correctAns.push(1)
					else
						$scope.correctAns.push(0)
					
				}
				if($('input[name=answer]:checked').length==0) return;				
				if($('input[name=answer]:checked').attr("correct") == "true"){
					$scope.feedback = $rootScope.CourseContent.pages[$scope.counter].correct_feedback;
						$scope.ansCounter++;
						
				}
				else{
					$scope.feedback = $rootScope.CourseContent.pages[$scope.counter].incorrect_feedback;
					$('input[name=answer]:checked').parent().parent().addClass("in-correct")
				}				
				$scope.showAnswer();
				if($scope.ansCounter == $rootScope.numPages && $rootScope.CourseContent.assessmentScreen){
					$rootScope.assesmentScore++;
				}
				if($rootScope.CourseContent.assessmentScreen && $scope.counter+1 == $rootScope.CourseContent.pages.length)
					$rootScope.isNextButtonDisabled = false;
			}
			
			$scope.showAnswer = function (){
				var checkAnswer = document.getElementsByName('answer');
				for (var i = 0; i < checkAnswer.length; i++) {
					if ($scope.correctAns[i] == 1){
						$(checkAnswer[i]).parent().parent().addClass("correct");
					}
				}
				$('.kc-option-label').css('cursor', 'default');
			};
			
			$scope.replay = function(){
				var src = $("#swfObject").attr("src");
				$("#swfObject").attr("src",'');
				$("#swfObject").attr("src",src);
				
			};
			
			function getContent(){
				if($rootScope.CourseContent.pages == undefined || $rootScope.CourseContent.pages == "undefined"){
					$timeout(function(){
						getContent();						
					},100);
				}else{
					$scope.start();	
					return;
				}
			}
			
			//getContent(); 
        }
    }
});
FrameworkApp.directive('gotoPage', function () {
	$rootScope.assesmentScore = 0;	
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
            $scope.gotoPageNum = function (e) {			
				if(e > 1){
					$rootScope.loadScreen($rootScope.currentModule, $rootScope.currentTopic, (e-1));
				}
				else{
					$rootScope.loadScreen($rootScope.currentModule, $rootScope.currentTopic, 0);
				}
            }
		$rootScope.gotoPage = true;
		$rootScope.isNextButtonDisabled = true;
		
        }
    }
});


FrameworkApp.directive('myPostRepeatDirective', function () {
    return function (scope, element, attrs) {
        if (scope.$last) {
            $('.-accordion').asAccordion({
                namespace: '-accordion',
                // accordion theme. WIP
            });
        }
    }
});

FrameworkApp.directive('verticalAccordian', function () {
		var counter = 0;
	    return {
        restrict: 'C',
		controller:function($rootScope){		
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
					setTimeout(function(){$(".dummyClas").parents("v-pane-header").addClass("visited")},1000);
					}       
            
		},
        link: function ($rootScope, scope, element, attrs) {
			$('.vAccordion--default').click(function(){
				counter = $(".visited").length;
				var len = $('v-pane-header').length;				
				if(counter === len){
					$rootScope.markVisitedPage();
				}					
			});
			$('v-pane-header').click(function(){
				
				
			});
		}
		
	}
});
FrameworkApp.directive('btnClickType04', function () {
	var tempVisited = '';
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			tempVisited = '';
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {			
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btnClickType04").addClass("visited");
				// if($rootScope.isPassed[4] == 0 && $rootScope.currentTopic == 5 && ($rootScope.currentPage == 3 || $rootScope.currentPage == 4)){
					// $rootScope.isNextButtonDisabled = true;
					// $(".btnClickType04").removeClass("visited");
				// }
			}
			var tempVisit = '';
			var counter = 0 ;
			$rootScope.clicked  = false;
			$rootScope.openpopup = false;
			$scope.active  = 1;
			$scope.count = 1;
			$scope.tCount = 0;
            $rootScope.clickCounter = [];
			$(".accordian-panel").hide();
            $scope.loadcontent = function (event, pItem,_type) {
				$rootScope.checkInternet($rootScope.selectedLang);
				$rootScope.openpopup = true;
				$(".accordian-panel").show();
				$scope.count = parseInt(pItem.id);
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
				$(flag[0]).addClass("markCompleted");
				$(flag[pItem.id-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[pItem.id-1]);
				//$(tempVisited).addClass("selected");
				$(".btnClickType04").removeClass("selected");
				$($(".btnClickType04")[$scope.count-1]).addClass("selected");
                $rootScope.Buttontext = pItem.text;
				$rootScope.clicked = true;
				$scope.checkCompletion($scope.count-1);
				if($rootScope.clickCounter.length > 0){
					$(tempVisited).addClass("visited");					
				}
				tempVisited = $(event.currentTarget);
				if(_type === "cType"){
					if($rootScope.clickCounter.indexOf(0) == -1){
						$rootScope.clickCounter.push(0);
					}
				}
			}
			$rootScope.close = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				$(tempVisited).addClass("visited");
				$rootScope.openpopup = false;
			};		
		
			$scope.onNextBack = function (state) {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state == 'back'){
					if($scope.count < 2) {
						$scope.count = $rootScope.CourseContent.btn_click_learn.length;
						$rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;
					}else{
						$scope.count--;
						$rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
					}
				}
				else if(state == 'next'){
					if($scope.count > $rootScope.CourseContent.btn_click_learn.length-1) $scope.count = 0; //return;;
						$scope.count++;
						$rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
				}
				
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[$scope.count-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[$scope.count-1]);
				
				$scope.active = $scope.count;
				$scope.checkCompletion($scope.count-1);
				if($rootScope.clickCounter.indexOf(0) == -1){
					$rootScope.clickCounter.push(0);
				}
				/* if($scope.count >= $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage(); */
			}
			$scope.checkCompletion = function(_val){
				if($rootScope.clickCounter.indexOf(_val) == -1)
					$rootScope.clickCounter.push(_val)
				
				console.log($rootScope.clickCounter.length +"=="+ $rootScope.CourseContent.btn_click_learn.length)
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.markVisitedPage();
					$rootScope.showInsText=true;
					
					if($rootScope.CourseContent.screen==5)
					$rootScope.showInsText1=true;
					console.log($rootScope.showInsText)
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
			/* if($rootScope.clickCounter.indexOf($scope.count-1) == -1)
				$rootScope.clickCounter.push($scope.count-1) */
		}
    }
});
FrameworkApp.directive('btnClickType4', function () {
	var tempVisited='';
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout) {
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btnClickType4").addClass("visited");
				}
			var tempVisit='';
			var counter = 0 ;
			$scope.count = 1;
			$rootScope.clicked  = false;
			$rootScope.openpopup = false;
			  $rootScope.clickCounter = [];
			$scope.active  = 1;
            $rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[0].text;
            $rootScope.ButtonContent = $rootScope.CourseContent.btn_click_learn[0].button_content;
            $rootScope.important = $rootScope.CourseContent.btn_click_learn[0].important;
            $rootScope.importantText = $rootScope.CourseContent.btn_click_learn[0].important_text;
			
            $(".btn-container li:first-child").addClass('test');
            $(".btn-container li:first-child > span").addClass('visited');
            // $(".btn-container li:first-child").css("background-color", "#0072aa"); 
            $(".btn-container li:first-child").addClass('selected');
			$(".popupClose").click(function(){
				$(".hotwordText").hide();
			});	
            $scope.loadcontent = function (event, pItem) {
				/* console.log(event.target); */
               	$rootScope.openpopup = true;
               	$scope.checkCompletion($scope.count-1);
               // $(event.target).parent().find(".test").css("background-color", "#65cdf4");
         		$($(".btnClickType4")[$scope.count-1]).addClass("selected");
                $(event.target).parent().find(".test").removeClass('test');
                $(event.target).addClass('test');
                $(event.target).addClass('selected');
                /* $(event.target).find("span").addClass('visited'); */
                // $(event.target).css("background-color", "#0072aa");
				$(".btn-content").show();
				$(".hotwordText").hide();
                $rootScope.Buttontext = pItem.text;
				$rootScope.important = pItem.important;
				$rootScope.importantText = pItem.important_text;
				var counter = $('.visited').length;
				var hotWordCounter = 0;
				if($rootScope.clickCounter.length > 0){
					$(tempVisited).addClass("visited");					
				}
				$timeout(function() {
					var hotword = $(document).find(".btn-content p > a");
					$(hotword).click(function(){
						$(".hotwordText").show();
						hotWordCounter = hotWordCounter +1;
						
					});
				},200);
				var totalClickableButtons = $(".btn-content p > a").length + $(".btnClickType4").length;
				var clickedButtons = hotWordCounter + counter;
				if(totalClickableButtons== clickedButtons){
					$rootScope.markVisitedPage();						
				}
            }		
            	$rootScope.close = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				$(tempVisited).addClass("markCompleted");
				$(tempVisited).addClass("selected");
				$(tempVisited).addClass("visited");
				$rootScope.openpopup = false;
			};	
			$scope.checkCompletion = function(_val){
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.markVisitedPage();
					$rootScope.showInsText=true;
					
					if($rootScope.CourseContent.screen==5)
					$rootScope.showInsText1=true;
					console.log($rootScope.showInsText)
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
        }
    }
});
FrameworkApp.directive('btnClickTypeA', function () {
	var tempVisited = '';
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			tempVisited = '';
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {	
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btnClickType4a").addClass("visited");
				// if($rootScope.isPassed[4] == 0 && $rootScope.currentTopic == 5 && ($rootScope.currentPage == 3 || $rootScope.currentPage == 4)){
					// $rootScope.isNextButtonDisabled = true;
					// $(".btnClickType4").removeClass("visited");
				// }
			}
			var tempVisit = '';
			var counter = 0 ;
			$rootScope.clicked  = false;
			$rootScope.openpopup = false;
			$scope.active  = 1;
			$scope.count = 1;
			$scope.tCount = 0;
            $rootScope.clickCounter = [];
			var gPItem = '';
			var gSbBtns = 0;
			$(".accordian-panel").hide();
            $scope.loadcontent = function (event, pItem,_type) {
				$rootScope.checkInternet($rootScope.selectedLang);
				$rootScope.openpopup = true;
				$(".accordian-panel").show();
				$scope.count = parseInt(pItem.id);
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
				$(flag[0]).addClass("markCompleted");
				$(flag[pItem.id-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[pItem.id-1]);
				//$(tempVisited).addClass("selected");
				$(".btnClickType4a").removeClass("selected");
				$($(".btnClickType4a")[$scope.count-1]).addClass("selected");
                $rootScope.Buttontext = pItem.text;
				$rootScope.clicked = true;
				tempVisited = $(event.currentTarget);
					gPItem = pItem;
				var gSbBtns = gPItem.sub_btn?gPItem.sub_btn:0;
				/* if($rootScope.clickCounter.length > 0 && gSbBtns == 0){
					$(tempVisited).addClass("visited");					
				} */
				if(gSbBtns == 0)
					$scope.checkCompletion($scope.count-1);
				if(_type === "cType" && sbBtns>=0){
					if($rootScope.clickCounter.indexOf(0) == -1){
						$rootScope.clickCounter.push(0);
					}
				}
			}
			$rootScope.close = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if(gPItem.sub_btn == 0)
					$(tempVisited).addClass("visited");
				$rootScope.openpopup = false;
			};		
		
			$scope.onNextBack = function (state) {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state == 'back'){
					if($scope.count < 2) {
						$scope.count = $rootScope.CourseContent.btn_click_learn.length;
						$rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;
					}else{
						$scope.count--;
						$rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
					}
				}
				else if(state == 'next'){
					if($scope.count > $rootScope.CourseContent.btn_click_learn.length-1) $scope.count = 0; //return;;
						$scope.count++;
						$rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
				}
				
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[$scope.count-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[$scope.count-1]);
				
				$scope.active = $scope.count;
				$scope.checkCompletion($scope.count-1);
				if($rootScope.clickCounter.indexOf(0) == -1){
					$rootScope.clickCounter.push(0);
				}
				/* if($scope.count >= $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage(); */
			}
			$scope.checkCompletion = function(_val){
				if($rootScope.clickCounter.indexOf(_val) == -1 && gSbBtns < 1 )
					$rootScope.clickCounter.push(_val)
				
				//console.log($rootScope.clickCounter.length +"=="+ $rootScope.CourseContent.btn_click_learn.length)
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.markVisitedPage();
					$rootScope.showInsText=true;
					
					if($rootScope.CourseContent.screen==5)
					$rootScope.showInsText1=true;
					//console.log($rootScope.showInsText)
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
			/* if($rootScope.clickCounter.indexOf($scope.count-1) == -1)
				$rootScope.clickCounter.push($scope.count-1) */
		}
    }
});
FrameworkApp.directive('screenNavigation', function () {
	return {
		restrict: 'C',
		link: function ($scope, $rootScope, elem, attrs) {
	},
	controller: function ($scope, $rootScope) {
		$scope.counter=1;
		//$scope.popupopen = false;
		$scope.visited = false;
		//if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == 1)
			//$scope.visited = true;
			//$scope.showBtns = false;
		$scope.getNextScreen = function(event){
			$scope.counter++;
		}
		$scope.getPrevScreen = function(event){
			$scope.counter--;
		}
		
	}
}
});

FrameworkApp.directive('assesmentResult', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
           /*  $(".menu-btn").css("pointer-events", "all");
			$('.menu-btn').css('opacity','1');
			$(".resource-btn").css("pointer-events", "all");
			$('.resource-btn').css('opacity','1'); */
        },
        controller: function ($scope, $rootScope,$timeout) {
			if($rootScope.currentTopic == $rootScope.CourseConfig.PreAssessmentSection-1){
				for(var i = 2 ; i < $rootScope.pageStatusList.length-1; i++){
					if($rootScope.assessmentAnswers[i-2][0] == 1 && $rootScope.assessmentAnswers[i-2][1] == 1 ){
						for(var j = 0; j < $rootScope.pageStatusList[i].length; j++){
							$rootScope.pageStatusList[i][j] = "1";
						}						
					}
				}
				
				if($rootScope.isPassed[0] == 1 || $rootScope.isPassed[1] == 1 ){
				for(var i = 2 ; i < $rootScope.pageStatusList.length-1; i++){
					
						for(var j = 0; j < $rootScope.pageStatusList[i].length; j++){
							$rootScope.pageStatusList[i][j] = "1";
						}						
					}
				}
				
				if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
					$rootScope.courseStatus =  scormAdaptor_getstatus();
					if($rootScope.courseStatus =="passed"){
						$rootScope.getScore = Math.round(scormAdaptor_getscore());
						var scorePre = Math.round(scormAdaptor_getscore());
					}else{
						var scorePre = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);						
					}
				}else{
					var scorePre = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailablePreQuestions) * 100);	
				}
				
				if(scorePre < $rootScope.CourseConfig.MasteryScore){
					$rootScope.isNextButtonDisabled = false;
					setTimeout(function(){
						$(".next").addClass("done");
						$("#gInstruct").fadeIn(500);					
					},500);					
				}else{
					if($rootScope.currentPage < $rootScope.CourseConfig.AvailableAssessmentQuestion+2){
						$rootScope.isNextButtonDisabled = false;						
						$(".next").addClass("done");
						$("#gInstruct").fadeIn(500);
					}
					else
						$rootScope.isNextButtonDisabled = true;
				}
				var answerData = '';
				for(var i = 0 ; i < $rootScope.assessmentAnswers.length; i++){
					answerData+=$rootScope.assessmentAnswers[i][0]+''+$rootScope.assessmentAnswers[i][1];
				} 
				//var answerData = {'data':$rootScope.assessmentAnswers};
				$rootScope.isPassed[6] =  answerData;
				$rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.CourseConfig.AvailablePreQuestions+2] = 1;
				/* console.log($rootScope.isPassed[6]) */
				//console.log($rootScope.pageStatusList)
			}
			//console.log($rootScope.currentTopic +"======"+ $rootScope.CourseConfig.PreAssessmentSection-1)
            $rootScope.assesmentStarted = false;
            $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] = "1";
			if($rootScope.currentTopic == $rootScope.CourseConfig.AssessmentSection-1){
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage+1]){
					$rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage+1] = "1";							
				}
			}
			/* console.clear();
			console.log("result page 1") */
			//console.log($rootScope.assessmentAnswers)
            if ($rootScope.assesmentAttempted < $rootScope.CourseConfig.MaxAssesmentAttempt)
                $rootScope.showTryAgain = true;
            else
                $rootScope.showTryAgain = false;
			if($rootScope.currentTopic==1 && $rootScope.CourseConfig.HasPreAssessment){
				$rootScope.assesmentPercentageScore = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailablePreQuestions) * 100);
				$rootScope.assesmentPercentageScore = Math.round($rootScope.assesmentPercentageScore);
				//$rootScope.isPrevButtonDisabled = true;
				//$rootScope.isNextButtonDisabled = false;
			}else{
				$rootScope.assesmentPercentageScore = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);
				$rootScope.assesmentPercentageScore = Math.round($rootScope.assesmentPercentageScore);
			}
			if($rootScope.assesmentPercentageScore>=80 && $rootScope.currentTopic == 1){
					$rootScope.isPassed[0]=1;
			}
			else if($rootScope.currentTopic == 1 && $rootScope.isPassed[0] == 2){
				$rootScope.isPassed[0]=0;
			}
			//console.log($rootScope.resumeLastPage)
			if($rootScope.assesmentPercentageScore >= $rootScope.CourseConfig.MasteryScore && $rootScope.currentTopic == $rootScope.CourseMenu.module.topics.length-1 && !$rootScope.resumeLastPage){
					//ispassed[1] will be 1 if passed post assesment
					$rootScope.isPassed[1]=1;
					//ispassed[2] will be number of correct answers in the last attempt of final assessment
					$rootScope.isPassed[2]= $rootScope.assesmentScore;
			}
			else if($rootScope.currentTopic == $rootScope.CourseMenu.module.topics.length-1 && !$rootScope.resumeLastPage){
				//ispassed[1] will be 0 if failed post assesment
				$rootScope.isPassed[1] = 0;
				//ispassed[2] will be number of correct answers in the last attempt of final assessment
				$rootScope.isPassed[2] = $rootScope.assesmentScore;
				//console.log($rootScope.resumeLastPage+"$rootScope.resumeLastPage$rootScope.resumeLastPage$rootScope.resumeLastPage$rootScope.resumeLastPage$rootScope.resumeLastPage")
			}		
			console.log($rootScope.isPassed[0])
			if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				var sScore = Math.round((parseInt($rootScope.isPassed[2])/$rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);
				//alert(sScore+"================="+$rootScope.assesmentPercentageScore);
				if($rootScope.currentTopic != $rootScope.CourseConfig.PreAssessmentSection-1){
				$rootScope.assesmentPercentageScore = sScore;	
				}
				
				if($rootScope.assesmentPercentageScore >= $rootScope.CourseConfig.MasteryScore && $rootScope.currentTopic != $rootScope.CourseConfig.PreAssessmentSection-1){
					
					$rootScope.courseStatus = scormAdaptor_getstatus();
					
					if($rootScope.courseStatus=="incomplete" || $rootScope.courseStatus=="failed"){
						//scormAdaptor_setscore($rootScope.assesmentPercentageScore);				
					}
					//alert("--------"+$rootScope.isPassed[3])
					if($rootScope.isPassed[3]=="d"){
						
					$rootScope.isPassed[3] = 	$rootScope.getDate();
					
					}
					
					$rootScope.setSuspend ();

					
					scormAdaptor_setscore($rootScope.assesmentPercentageScore)
					$rootScope.getScore = Math.round(scormAdaptor_getscore());
					scormAdaptor_complete();
					scormAdaptor_commit();
				}else if($rootScope.assesmentPercentageScore >= 80 && $rootScope.currentTopic == $rootScope.CourseConfig.PreAssessmentSection-1){
					if($rootScope.isPassed[3]=="d"){
						$rootScope.isPassed[3] = 	$rootScope.getDate();
					}
					$rootScope.setSuspend ();
					//scormAdaptor_setscore($rootScope.assesmentPercentageScore);
					scormAdaptor_setscore($rootScope.assesmentPercentageScore)
					$rootScope.getScore = Math.round(scormAdaptor_getscore());
					//alert($rootScope.getScore+"========sss======="+$rootScope.assesmentPercentageScore);				
					scormAdaptor_complete();
					scormAdaptor_commit();
				}
				else if($rootScope.currentTopic != $rootScope.CourseConfig.PreAssessmentSection-1){
					//alert("opop")
					$rootScope.getScore = Math.round(scormAdaptor_getscore());
					$rootScope.courseStatus =  scormAdaptor_getstatus();
					if($rootScope.courseStatus !="passed"){
						scormAdaptor_setscore($rootScope.assesmentPercentageScore);
						scormAdaptor_failed();
						scormAdaptor_commit();		
					}
						
				}else{
					//alert($rootScope.assesmentScore,"$rootScope.assesmentScore")
					$rootScope.courseStatus =  scormAdaptor_getstatus();
					if($rootScope.courseStatus =="passed"){
						$rootScope.getScore = Math.round(scormAdaptor_getscore());
					}else{
						$rootScope.getScore = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);						
					}
				}
             }else{
				 $rootScope.getScore = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);
				 // alert($rootScope.getScore+"========sss=======get score")
			 }
			 $rootScope.updateCourseProgress();
			$scope.calculateScore = function(){
					var cScore = Math.round((parseInt($rootScope.isPassed[2])/$rootScope.CourseConfig.AvailableAssessmentQuestion) * 100)
					//alert("cScore==========="+cScore)
					if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2'){
						if(cScore>=80){
							scormAdaptor_setscore(cScore)
							scormAdaptor_commit();	
						}						
					}
					//console.log(cScore)
					if(cScore >= 80){
						$rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] = "1";
						var timer1;
						var timer2;
							timer1 = $timeout(function(){
								if($rootScope.CourseContent.lastPage!="true"){
									$rootScope.isNextButtonDisabled = false;
									timer2 = $timeout(function(){
										$(".next").addClass("done");
										$("#gInstruct").fadeIn(500);								
									},500);
								}							
							},1000);
							$scope.$on('$destroy', function(){
								$timeout.cancel(timer1)
								$timeout.cancel(timer2)
							});
					}
					return cScore;
					
			}
			
            $scope.retakeAssesment = function () {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(navigator.onLine){
                $rootScope.assesmentScore = 0;
                $rootScope.assesmentAttempted++;
                $rootScope.assesmentQuestionIndex = [];
                $rootScope.assesmentStarted = true;
                $rootScope.isNextButtonDisabled = true;
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.assesmentScore = 0;
                //$(".resource-btn").css("pointer-events", "all");
                $(".menu-btn").css("pointer-events", "none");
                //$('.resource-btn').css('opacity','1');
                $('.menu-btn').css('opacity','0.5');
                if ($rootScope.CourseConfig.IsRandomized) {
                    if ($rootScope.CourseConfig.HasAssesmentIntro) {
                        $rootScope.assesmentQuestionIndex.push(1);
                        while ($rootScope.assesmentQuestionIndex.length < $rootScope.CourseConfig.AvailableAssessmentQuestion + 1) {
                            var tRandomNumber = Math.floor(Math.random() * $rootScope.CourseConfig.TotalAssesmentQuestions-1) + 2;
                            if ($rootScope.assesmentQuestionIndex.indexOf(tRandomNumber) == -1 )
                                $rootScope.assesmentQuestionIndex.push(tRandomNumber);
                        }
                    }
                    else {
                        while ($rootScope.assesmentQuestionIndex.length < $rootScope.CourseConfig.AvailableAssessmentQuestion) {
                            var tRandomNumber = Math.floor(Math.random() * $rootScope.CourseConfig.TotalAssesmentQuestions-1) + 2;
                            if ($rootScope.assesmentQuestionIndex.indexOf(tRandomNumber) == -1)
                                $rootScope.assesmentQuestionIndex.push(tRandomNumber);
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
                $rootScope.loadScreen($rootScope.currentModule, $rootScope.currentTopic, 0)
            }
		}
            $scope.viewCertificate = function(){
               // var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage+2);
               // $rootScope.$state.go('course.pages', { id: page_id });
			   var myWindow = window.open("Views/screens/certificate/certificate.html", "", "width=1003px, height=700px");
            }


        }
    }
});
FrameworkApp.directive('btnClickType30', function () {
	var tempVisited = '';
	
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			tempVisited = '';
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$rootScope.showPopUp = false;		
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btnClickType30").addClass("visited");
				$rootScope.showPopUp = true;
				/* if($rootScope.isPassed[4] == 0 && $rootScope.currentTopic == 5 && ($rootScope.currentPage == 3 || $rootScope.currentPage == 4)){
					$rootScope.isNextButtonDisabled = true;
					$(".btnClickType3").removeClass("visited");
				} */
			}
			var tempVisit = '';
			var counter = 0 ;
			$rootScope.clicked  = false;
			$rootScope.openpopupType3 = false;			
			$scope.active  = 1;
			$rootScope.count = 1;
			$scope.tCount = 0;
            $rootScope.clickCounter = [];
			$(".accordian-panel").hide();
			$rootScope.ButtontextType3 = '';
			var track = true;
            $scope.loadcontent = function (event, pItem,_type,tracking) {	
				if(tracking)
					track = tracking;
				$rootScope.checkInternet($rootScope.selectedLang);
				$rootScope.openpopupType3 = true;
				$(".accordian-panel").show();
				$rootScope.count = parseInt(pItem.id);
				//$(tempVisited).addClass("selected");
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[pItem.id-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[pItem.id-1]);
				$(".btnClickType30").removeClass("selected");
				$($(".btnClickType30")[$rootScope.count-1]).addClass("selected");
                $rootScope.ButtontextType3 = pItem.text;
				$rootScope.clicked = true;
				$scope.checkCompletion($rootScope.count-1);
				tempVisited = $(event.currentTarget);
				/* if($rootScope.clickCounter.length > 0){ */
					$(tempVisited).addClass("visited");					
				/* } */
				if(_type === "cType"){
					if($rootScope.clickCounter.indexOf(0) == -1){
						$rootScope.clickCounter.push(0);
					}
				}
				
			}
			$rootScope.close = function(val){
				// Temp code
				if(val=='exit'){
					$rootScope.markVisitedPage();
				}
				$rootScope.checkInternet($rootScope.selectedLang);
				$(tempVisited).addClass("visited");
				$rootScope.openpopupType3 = false;
			};			
			$scope.onNextBack = function (state) {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state == 'back'){
					if($rootScope.count < 2) {
						$rootScope.count = $rootScope.CourseContent.btn_click_learn.length;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$rootScope.count-1].text;
					}else{
						$rootScope.count--;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$rootScope.count-1].text;						
					}
				}
				else if(state == 'next'){
					if($rootScope.count > $rootScope.CourseContent.btn_click_learn.length-1) $rootScope.count = 0; //return;;
						$rootScope.count++;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$rootScope.count-1].text;						
				}
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[$rootScope.count-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[$rootScope.count-1]);
				$scope.active = $rootScope.count;
				$scope.checkCompletion($rootScope.count-1);
				if($rootScope.clickCounter.indexOf(0) == -1){
					$rootScope.clickCounter.push(0);
				}
				if($rootScope.count >= $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage();
			}
			$scope.checkCompletion = function(_val){
				
				if($rootScope.clickCounter.indexOf(_val) == -1)
					$rootScope.clickCounter.push(_val)
				console.log($rootScope.clickCounter.length + " == " + $rootScope.CourseContent.btn_click_learn.length)
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.showPopUp = true;
					if(track == false){
						
					}else{
						$rootScope.markVisitedPage();						
					}
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
			
			/* if($rootScope.clickCounter.indexOf($scope.count-1) == -1)
				$rootScope.clickCounter.push($scope.count-1) */
		}
    }
});



FrameworkApp.directive('samc', function ($rootScope,$timeout) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
			
			if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
            }
			var myVar = setInterval(function(){  scope.myTimer() }, 1000);
			$rootScope.visited = false;
			/* if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == 1)
			$rootScope.visited = true; */
            scope.selection = 1;
            scope.isBranching = false;
            scope.disableButton = true;
            $rootScope.popupopen = false;
			$rootScope.btnopen = false;
            scope.start = function () {
				scope.hideSubmitButton = false;
                scope.id = 0;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
				scope.blnResponse ;
				scope.userTime =0;
				scope.blnCorrect;
                $rootScope.feedbackToggle = false;
				scope.fdbackTgle = false;
                scope.buttonText = $rootScope.CourseContent.submitText;
                scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
                $rootScope.feedback = "";
                scope.feedbackAssessment = "";
                scope.feedback_bg = $rootScope.CourseContent.feedback_bg_path;
			//	$rootScope.attachStyle();
            };
			
			scope.testingAnswers = function(_answers){
				if($rootScope.CourseConfig.isDebugging){	
					if(_answers.isCorrect == "true"){
						return "debug-quiz-color-correct";
					}else{
						return "debug-quiz-color-incorrect";
					}
				}
			};

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            };

            scope.onOptionSelected = function (pIndex) {
                if ($('input[name=answer]:checked').length > 0)
				{
                    scope.disableButton = false;
					}
                else
                    scope.disableButton = true;
                if ($(".kc-option").children().hasClass("option-selected")) {
                    $(".kc-option").children().removeClass("option-selected");
                }
                $("#options label").eq(pIndex).addClass("option-selected");

            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.question;
				console.log( scope.options);
            };
			

            scope.checkAnswer = function () {
				$rootScope.checkInternet($rootScope.selectedLang);
				 clearInterval(myVar);
				 scope.options = $rootScope.CourseContent.question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == "true"){
                     
						var flag = scope.options[i].text;
						flag = flag.replace(/\./g,' ');
				
						//scope.aryResponse.push(flag);
						scope.blnCorrectResponse = flag;
						//alert(scope.aryResponse)
					}
                    
                }
				
				//$rootScope.markVisitedPage();
                if (scope.buttonText == $rootScope.CourseContent.submitText) {
			
					var Response =["A","B","C","D","E","F","G"]
                    if (attrs.feedback == "true")
					
                        $rootScope.feedbackToggle = true;
						scope.hideSubmitButton = true;
						scope.fdbackTgle = true;
                    if (!$('input[name=answer]:checked').length) return;
                    if ($('input[name=answer]:checked').attr("correct") == "true") {
						var flag3 = $('input[name=answer]:checked').val();
					
						scope.blnResponse = Response[flag3-1]
	
						// alert("=============="+scope.blnResponse)
						scope.blnCorrect = true;
                        if (attrs.assesment == "true")
                            $rootScope.assesmentScore++;
                        $rootScope.feedback = $rootScope.CourseContent.correct_feedback;
						scope.feedbackAssessment = $rootScope.CourseContent.correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;
                        /* if (!$rootScope.CourseContent.branchingScreen)
                            $rootScope.markVisitedPage();
                        else {
                            scope.isBranching = true;
                        } */
					if (attrs.assesment == "true"){
						$rootScope.setUpAsmntArray(true);
					}
						//$rootScope.crntQuizStatus();
                    } else {
						scope.blnCorrect = "false";
						var flag3 = $('input[name=answer]:checked').val();
						
						scope.blnResponse = Response[flag3-1]
						// alert(scope.blnResponse);
						//alert("=============="+scope.blnResponse)
						//$rootScope.crntQuizStatus();
                        $rootScope.feedback = $rootScope.CourseContent.incorrect_feedback;
						scope.feedbackAssessment = $rootScope.CourseContent.incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.resetText;
                            scope.disableInput = true;

                        }
					if (attrs.assesment == "true"){
						$rootScope.setUpAsmntArray(false);
					}
                    }
                    if (attrs.tickmark == "true")
                        scope.checkUserAnswer();
					else
						$('.kc-option-label').css('cursor', 'default');
                    scope.attempt++;
                }
                else {
                    $rootScope.feedbackToggle = false;
					scope.fdbackTgle = false;
                    $('input[name=answer]:checked').parent().removeClass("correct-checkbox");
                    $('input[name=answer]:checked').parent().removeClass("in-correct-checkbox");
                    $('input[name=answer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    scope.disableInput = false;
                    scope.disableButton = true;
                    if ($(".kc-option").children().hasClass("option-selected")) {
                        $(".kc-option").children().removeClass("option-selected");
                    }

                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                     if (!$rootScope.CourseContent.branchingScreen)
						if(attrs.popup != "true")
							$rootScope.markVisitedPage();
                    else{
                        scope.isBranching = true;
                    }
                    if (attrs.tickmark == "true")
                        scope.showAnswer();
					else
						$('.kc-option-label').css('cursor', 'default');
                }
				/* if (!$rootScope.CourseContent.branchingScreen)
                            $rootScope.markVisitedPage();	 */	
					if(attrs.popup == "true"){
						$timeout(function(){
							$rootScope.popupopen = true;
							$rootScope.btnopen = true;
							 if (scope.attempt >= scope.maxAttempt) {
								$rootScope.markVisitedPage();
							 }
						},1500);
					}
				var flag4 = $rootScope.assesmentQuestionIndex[$rootScope.currentPage];
				var QuestionTypeText;
				if($rootScope.currentTopic==1){
					QuestionTypeText = "PreAssessmentSection_";
				}else{
					QuestionTypeText = "PostAssessmentSection_";
				}
				var strID = QuestionTypeText+"Question_"+flag4;
				//strID = strID.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "");
				///strID = strID.trim();
				//strID = strID.replace(/ +/g, "_");
				var strDescription = "";
				var intWeighting = 1;
				var intLatency = (scope.userTime*1000);
				var strLearningObjectiveID = $rootScope.currentPage-1;
				var dtmTime = $rootScope.getDate;
				if (attrs.assesment == "true"){
					if($rootScope.CourseConfig.AppType.toLowerCase() == "scorm1.2"){
						SCORM_RecordTrueFalseInteraction(strID, scope.blnResponse, scope.blnCorrect, scope.blnCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
						scormAdaptor_commit();						
					}
				}
				
				};
			 scope.myTimer = function(){
				 scope.userTime++;
			 }
            scope.checkUserAnswer = function () {
                if ($('input[name=answer]:checked').attr("correct") == "true") {
                    $('input[name=answer]:checked').parent().addClass("correct-checkbox")
                }
                else {
                    $('input[name=answer]:checked').parent().addClass("in-correct-checkbox")
                }

            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if ($(checkAnswer[i]).attr("correct") == "true") {
						 if (attrs.tickmark == "true")
							$(checkAnswer[i]).parent().addClass("correct-checkbox");
						$('.kc-option-label').css('cursor', 'default');
                    }
                }
            }
            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
            scope.reset();
            scope.start();
        }
    }
});

FrameworkApp.directive('btnClickType12', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
			var counter = 0;
			$scope.visitedStts=false;
			if ($rootScope.CourseContent.btn_click_learn != undefined) {	
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
						$("ul > .btnClickType12").addClass("visited");	
						$scope.visitedStts=true;
				}          
            }
            $rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[0].text;
            $rootScope.ButtonImage = $rootScope.CourseContent.btn_click_learn[0].image;
            $rootScope.ButtonContent = $rootScope.CourseContent.btn_click_learn[0].button_content;
            $rootScope.ButtonContentBg = $rootScope.CourseContent.btn_click_learn[0].button_content_bg;
            $rootScope.ImportantText = $rootScope.CourseContent.btn_click_learn[0].Important_text;
			$scope.popupToggle=false;
            $('.btn-content').hide();
            $rootScope.clickCounter = [];
			$('.btnClickType12').click(function(){
					$(this).addClass('visited');				
				});
			$('.hotWord').click(function(){
				$('.btn-content').hide();
				$(".btnClickType12").find("span").removeClass("btn-arrow option-selected");
				$(".btnClickType12").removeClass("option-selected");
				$(".hotwordText").show();
			});
			$(".popupClose").click(function(){
				$(".hotwordText").hide();
			});
            $scope.loadcontent = function (event, pItem) {
				$scope.popupToggle = true;
				counter = $(".visited").length;
                $('.btn-content').show();
                $rootScope.clickCounter.push(pItem);
                $(event.target).parent().find(".btn-arrow").removeClass('btn-arrow');
                $(event.target).parent().find(".option-selected").removeClass('option-selected');
                $(event.target).find("span").addClass('btn-arrow');
                $(event.target).addClass('option-selected visited');
				
                $rootScope.Buttontext = pItem.text;
                $rootScope.ButtonImage = pItem.image;
                $rootScope.ButtonContent = pItem.button_content;
                $rootScope.ButtonContentBg = pItem.button_content_bg;
                $rootScope.ImportantText = pItem.Important_text;
                if ($rootScope.CourseContent.btn_click_learn.length == counter)
                    $rootScope.markVisitedPage();
            }
        }
    }
});



FrameworkApp.directive('dragandrop', function ($rootScope,$interval) {
    return {
        restrict: 'CA',
        link: function (scope, elem, attrs) {
		},
		controller:function($scope,$rootScope){
			scope = $scope;
			scope.feedbackToggle = false;
			scope.showAns = false;
			scope.attempt = 0;
			scope.disableSbmtButton = true;
			scope.disableRstButton = true;
			scope.buttonText = $rootScope.CourseContent.submitText;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
			scope.maxAttempt = $rootScope.CourseContent.maximumAttempt || 2;
			scope.feedback = "";
			scope.question = $rootScope.CourseContent.question;
			scope.instruction_text = $rootScope.CourseContent.instruction_text;
            scope.dragCounter = 0;
            scope.userAnswer = [];
			scope.element = '';
			scope.correctAns = false;
            scope.dragAndDropContent = $rootScope.CourseContent;
            scope.start = function () {
                correctCards = 0;
                 var numbers = [];
                for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                    numbers.push($rootScope.CourseContent.question[i].dropIndex)
                }
				
                 //$timeout(function(){
                    $(".droppable-item").droppable({
                        accept: '.draggable-item',
                        hoverClass: 'hovered',
                        drop: handleCardDrop
                    });

                    $(".draggable-item").draggable({
                        stack: '.draggable-item',
                        cursor: 'pointer',
                        revert: true,
						drag:handleCardDrag
                    });
                  //  });
                    for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                        $("#card"+(i+1)).data({'originalLeft': $("#card"+(i+1)).css('left'),
                            'origionalTop': $("#card"+(i+1)).css('top')
                        });
                    }
                 //},0); 
				 $(".btns-container .btn-submit").attr("disabled", true);
				 $(".btns-container .btn-reset").attr("disabled", true);
            }
			
			function handleCardDrag(){
				scope.element = $(this);
				//$(this).hide();
			}
			var answer = null;
			var dropedElem = null;

            function handleCardDrop(event, ui) {
				scope.disableRstButton = false;
				var slotNumber = $(this).data('number');
				var cardNumber = ui.draggable.parent().data('number');
				ui.draggable.draggable('disable');
				$(this).droppable('disable');
				dropedElem = ui.draggable;
				answer = $(ui.draggable).attr('data-number');
				//console.log()
				//ui.draggable.detach().appendTo($(this));
				ui.draggable.position({ of: $(this), my: 'left top', at: 'left top', using: function (css, calc) { $(this).animate(css, 200, 'linear'); } });
				//$(scope.element).show();
				ui.draggable.draggable('option', 'revert', false);
				$(scope.element).css("cursor","default");
				$(scope.element).css("height","38px");
				scope.disableSbmtButton = false;
				scope.$apply();
				$('.instr').hide();
            }

            scope.checkAnswer = function(){
				$(".draggable-item").addClass( 'disableDraggable' );
				$(dropedElem).removeClass('disableDraggable');
				scope.attempt++;
					if(answer === "true"){
						scope.feedback = $rootScope.CourseContent.feedback.correct;
						scope.correctAns = true;
					}
					else{
						scope.feedback = $rootScope.CourseContent.feedback.inCorrect;					
					}
				scope.feedbackToggle = true;
				scope.disableRstButton = true;
				$rootScope.markVisitedPage();
            }
			scope.resetOptions = function(){
				scope.disableRstButton = true;
				scope.disableSbmtButton = true;
				for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
					$("#card" + (i + 1)).css({
							'left': $("#card" + (i + 1)).data('originalLeft'),
							'top': $("#card" + (i + 1)).data('origionalTop')
						}
					);
				}
									
				$(".droppable-item").droppable('enable');
				$(".draggable-item").draggable('enable');
				$(".draggable-item").css("cursor", "pointer");
				$(".draggable-item").draggable({revert: true});
				$(".btn-submit").attr("disabled", true);
				$(".ui-droppable").removeClass("correct");
				$(".ui-droppable").removeClass("in-correct");
				$(".feedback-panel").hide();
				scope.feedbackToggle = false;
			}
			scope.closeFeedback = function(_val){
				scope.feedbackToggle = false;
				scope.disableSbmtButton = true;
				/* if(_val == 'gonext'){
					$scope.gotoNextPage();
				} */
			};
			
			scope.tempAns = [];
			
			var promise = $interval(function(){
				if($(".droppable-item").length >0){
					scope.start();	
					$interval.cancel(promise);
				}
			},100);
			simulateEvents();
		}
	}
});

FrameworkApp.directive('btnClickType3', function () {
	var tempVisited = '';
	
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			tempVisited = '';
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$rootScope.showPopUp = false;		
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btnClickType3").addClass("visited");
				$rootScope.showPopUp = true;
				/* if($rootScope.isPassed[4] == 0 && $rootScope.currentTopic == 5 && ($rootScope.currentPage == 3 || $rootScope.currentPage == 4)){
					$rootScope.isNextButtonDisabled = true;
					$(".btnClickType3").removeClass("visited");
				} */
			}
			var tempVisit = '';
			var counter = 0 ;
			$rootScope.clicked  = false;
			$rootScope.openpopupType3 = false;			
			$scope.active  = 1;
			$rootScope.count = 1;
			$scope.tCount = 0;
            $rootScope.clickCounter = [];
			$(".accordian-panel").hide();
			$rootScope.ButtontextType3 = '';
			var track = true;
            $scope.loadcontent = function (event, pItem,_type,tracking) {	
				if(tracking)
					track = tracking;
				$rootScope.checkInternet($rootScope.selectedLang);
				$rootScope.openpopupType3 = true;
				$(".accordian-panel").show();
				$(".text-container").show();
                $(".btn_content").show();
				$rootScope.count = parseInt(pItem.id);
				$rootScope.clickCounter.push(pItem);
				 $rootScope.clickCounter.push(pItem);
				$(".text-container").show();
                $(".btn_content").show();
                $rootScope.Buttontext = pItem.text;
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[pItem.id-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[pItem.id-1]);
				$(".btnClickType3").removeClass("selected");
				$($(".btnClickType3")[$rootScope.count-1]).addClass("selected");
                $rootScope.ButtontextType3 = pItem.text;
				$rootScope.clicked = true;
				$scope.checkCompletion($rootScope.count-1);
				if($rootScope.clickCounter.length > 0){
					$(tempVisited).addClass("visited");					
				}
				tempVisited = $(event.currentTarget);
				if(_type === "cType"){
					if($rootScope.clickCounter.indexOf(0) == -1){
						$rootScope.clickCounter.push(0);
					}
				}
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
					timer1 = $timeout(function(){
						$scope.disableClose = false;
					},3000);
				}else{
					$scope.disableClose = false;
				}
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.openpopup = true;
				
			}

			  $('.popupClose').click(function () {
				$(".text-container").hide();
                $(".btn_content").hide();
				$(".hotwordText").hide();
            });
			$rootScope.close = function(val){
				// Temp code
				if(val=='exit'){
					$rootScope.markVisitedPage();
				}
				$rootScope.checkInternet($rootScope.selectedLang);
				$(tempVisited).addClass("visited");
				$rootScope.openpopupType3 = false;
			};			
			$scope.onNextBack = function (state) {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state == 'back'){
					if($rootScope.count < 2) {
						$rootScope.count = $rootScope.CourseContent.btn_click_learn.length;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$rootScope.count-1].text;
					}else{
						$rootScope.count--;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$rootScope.count-1].text;						
					}
				}
				else if(state == 'next'){
					if($rootScope.count > $rootScope.CourseContent.btn_click_learn.length-1) $rootScope.count = 0; //return;;
						$rootScope.count++;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$rootScope.count-1].text;						
				}
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[$rootScope.count-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[$rootScope.count-1]);
				$scope.active = $rootScope.count;
				$scope.checkCompletion($rootScope.count-1);
				if($rootScope.clickCounter.indexOf(0) == -1){
					$rootScope.clickCounter.push(0);
				}
				if($rootScope.count >= $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage();
			}
			$scope.checkCompletion = function(_val){
				
				if($rootScope.clickCounter.indexOf(_val) == -1)
					$rootScope.clickCounter.push(_val)
				console.log($rootScope.clickCounter.length + " == " + $rootScope.CourseContent.btn_click_learn.length)
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.showPopUp = true;
					if(track == false){
						
					}else{
						$rootScope.markVisitedPage();						
					}
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
			
			/* if($rootScope.clickCounter.indexOf($scope.count-1) == -1)
				$rootScope.clickCounter.push($scope.count-1) */
		}
    }
});
FrameworkApp.directive('btnClickType3_b', function () {
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout) {
			if ($rootScope.CourseContent.btn_click_learn != undefined) {				
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
					// $timeout(function() {
						$(".image_field").find("ul > .btnClickType3_b").addClass("visited");	
					//}, 1000);
				}          
            }
            $rootScope.Buttontext = $rootScope.CourseContent.btn_click_learn[0].text;
            $('.popupClose').click(function () {
				$(".text-container").hide();
                $(".btn_content").hide();
				$(".hotwordText").hide();
            });
            $rootScope.clickCounter = [];
            $scope.loadcontent = function (event, pItem) {
				$(event.target).addClass("visited");
                $rootScope.clickCounter.push(pItem);
				$(".text-container").show();
                $(".btn_content").show();
                $rootScope.Buttontext = pItem.text;
				var counter = $(".visited").length;
				$(".hotwordText").hide();
				
				/* $timeout(function() {
					var hotword = $(document).find(".btn_content p > a");
					$(hotword).click(function(){
						$(".hotwordText").show();
					});
				},200); */
				if ($rootScope.CourseContent.btn_click_learn.length == counter)
					$rootScope.markVisitedPage();	
            }
			$(".hotWordClick").click(function(){
				$(".btn_content").hide();
				$(".hotwordText").show();
				$rootScope.markVisitedPage();	
			});
			
        }

    }
});
FrameworkApp.directive('btnClickType10', function () {
	var tempVisited = '';

    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			tempVisited = '';
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$rootScope.showPopUp = false;			
			$timeout(function() {
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
					$(".btnClickType10").addClass("visited");
					$rootScope.showPopUp = true;
						//$('#mydiv').fadeOut('fast');
				}
			}, 1000);
			
			var tempVisit = '';
			var counter = 0 ;
			$rootScope.clicked  = false;
			$rootScope.openpopupType3 = false;
			
			$scope.active  = 1;
			$scope.count = 1;
			$scope.tCount = 0;
            $rootScope.clickCounter = [];
			$(".accordian-panel").hide();
			$rootScope.ButtontextType3 = '';
			
            $scope.loadcontent = function (event, pItem,_type) {				
				$rootScope.checkInternet($rootScope.selectedLang);
				$rootScope.openpopupType3 = true;
				$(".accordian-panel").show();
				$scope.count = parseInt(pItem.id);
				//$(tempVisited).addClass("selected");
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[pItem.id-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[pItem.id-1]);
				$(".btnClickType10").removeClass("selected");
				$($(".btnClickType10")[$scope.count-1]).addClass("selected");
                $rootScope.ButtontextType3 = pItem.text;
				$rootScope.clicked = true;
				$scope.checkCompletion($scope.count-1);
				if($rootScope.clickCounter.length > 0){
					$(tempVisited).addClass("visited");					
				}
				tempVisited = $(event.currentTarget);
				if(_type === "cType"){
					if($rootScope.clickCounter.indexOf(0) == -1){
						$rootScope.clickCounter.push(0);
					}
				}
				
			}
			$rootScope.close = function(val){
				// Temp code
				if(val=='exit'){
					$rootScope.markVisitedPage();
				}
				$rootScope.checkInternet($rootScope.selectedLang);
				$(tempVisited).addClass("visited");
				$rootScope.openpopupType3 = false;
			};			
			$scope.onNextBack = function (state) {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state == 'back'){
					if($scope.count < 2) {
						$scope.count = $rootScope.CourseContent.btn_click_learn.length;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;
					}else{
						$scope.count--;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
					}
				}
				else if(state == 'next'){
					if($scope.count > $rootScope.CourseContent.btn_click_learn.length-1) $scope.count = 0; //return;;
						$scope.count++;
						$rootScope.ButtontextType3 = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
				}
				var flag = $('.clickables');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[$scope.count-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[$scope.count-1]);
				$scope.active = $scope.count;
				$scope.checkCompletion($scope.count-1);
				if($rootScope.clickCounter.indexOf(0) == -1){
					$rootScope.clickCounter.push(0);
				}
				if($scope.count >= $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage();
			}
			$scope.checkCompletion = function(_val){
				
				if($rootScope.clickCounter.indexOf(_val) == -1)
					$rootScope.clickCounter.push(_val)
				//console.log($rootScope.clickCounter.length + " == " + $rootScope.CourseContent.btn_click_learn.length)
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.showPopUp = true;
					$rootScope.markVisitedPage();
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
			
			/* if($rootScope.clickCounter.indexOf($scope.count-1) == -1)
				$rootScope.clickCounter.push($scope.count-1) */
		}
    }
});

FrameworkApp.directive('btnClickType3new', function () {
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$scope.showPopUp = false;
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btnClk").addClass("visited");
				$scope.showPopUp = true;
			}
			var tempVisit = '';
			var counter = 0 ;			
			$scope.active  = 1;
			$scope.count = 1;
			$scope.tCount = 0;
            $scope.clickCounter = [];
			$(".accordian-panel").hide();
			$scope.ButtontextType3 = '';
			$scope.openpopupType4 = false;
			var tempVisited = '';
            $scope.loadcontent = function (event, pItem) {				
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.openpopupType4 = true;
				$(".accordian-panel").show();
				$scope.count = parseInt(pItem.id);
				$(".btnClk").removeClass("selected");
				$($(".btnClk")[$scope.count-1]).addClass("selected");
                $scope.ButtontextType3 = pItem.text;
				if($scope.clickCounter.length > 0){
					$(tempVisited).addClass("visited");					
				}
				tempVisited = $(event.currentTarget);
			}
			$scope.close = function(val){
				$scope.checkCompletion($scope.count-1);
				$rootScope.checkInternet($rootScope.selectedLang);
				$(tempVisited).addClass("visited");
				$scope.openpopupType4 = false;
			};			
			var timerDrag;
			$scope.checkCompletion = function(_val){				
				if($scope.clickCounter.indexOf(_val) == -1)
					$scope.clickCounter.push(_val)
				if($scope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$scope.showPopUp = true;
					timerDrag = $timeout(function(){							
						$rootScope.markVisitedPage();
					},500);
				}
			};
			$scope.$on('$destroy', function() {
				$timeout.cancel(timerDrag);
			});
		}
    }
});

FrameworkApp.directive('carouselNavWithYesNo', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope,$timeout, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
			var finished=false;
			var buttonClicked=[]
			$('#myCarousel').carousel({
				wrap: false
			});
			$("#myCarousel").on('slide.bs.carousel', function(evt) {
				$scope.counter=$(evt.relatedTarget).index();
			})
			$scope.counter = 0;
			$scope.showFeedback=false;
			$scope.carouselCheckAns=function(e,data){
				/* console.log(data) */
				$('#cNextBtn').removeClass("disabledBtn")
				
				var btnName=$(e.currentTarget).attr('id').split("_")[1];
				var btnNo=$(e.currentTarget).attr('id').split("_")[2];
				
				/* console.log(btnName) */
				/* console.log(btnNo) */
				
				if(data.correctAns.toLowerCase()==btnName.toLowerCase() ){
					//$scope.feedBackText=data.Right_Feedback;	
					$('#btn_yes_'+btnNo).addClass("selected");					
					$("#showFeedback_"+btnNo).html(data.Right_Feedback);
				}
				else{
					$('#btn_no_'+btnNo).addClass("selected");
					//$scope.feedBackText=data.Wrong_Feedback;	
					$("#showFeedback_"+btnNo).html(data.Wrong_Feedback);					
				}
				
				for(var i=1; i<=$rootScope.CourseContent.tabel_content.length; i++)
				{
					if(i==btnNo){
						$('#showFeedback_'+btnNo).show();
						$('#btn_yes_'+btnNo).attr('disabled',true);
						$('#btn_no_'+btnNo).attr('disabled', true)	
						break;
					}
				}
				if($rootScope.CourseContent.tabel_content.length == $scope.counter+1)
					$rootScope.markVisitedPage();	
				buttonClicked[$scope.counter]=1;					
			}
			
			$scope.navigatePage = function(nav){
				if(nav == 'next'){
					var idx = $('.carousel-inner li.active').index();
					
					$('#myCarousel').carousel("next");
					
					//console.log($scope.counter)
					
					//console.log(finished +"&&"+ buttonClicked[$scope.counter])
					
					if(finished!=true && buttonClicked[$scope.counter]!=1)
						$('#cNextBtn').addClass("disabledBtn")
					else
						$('#cNextBtn').removeClass("disabledBtn")
					
					
				}else{
					$('#myCarousel').carousel("prev");
					//$scope.counter--;
					$('#cNextBtn').removeClass("disabledBtn")
				}
				if($scope.counter > 0){
					$('.left').css("pointer-events","all");
					$('.left').css("opacity","1");
				}else{
					$('.left').css("pointer-events","none");
					$('.left').css("opacity","0.5");
				}
				
				if($rootScope.CourseContent.tabel_content.length == $scope.counter+1){
					$('.right').css("pointer-events","none");
					$('.right').css("opacity","0.5");
					finished=true;
				}else{
					$('.right').css("pointer-events","all");
					$('.right').css("opacity","1");
				}
			};
			
		}
    }
});
FrameworkApp.directive('popsamc1', function ($rootScope) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
                if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
				

            }
            scope.feedbackCounter = 1;
            scope.selection = 1;
            scope.isBranching = false;
            scope.disableButton = true;
            scope.start = function () {
				scope.id= Number(attrs.id-1);
                scope.attempt = 0;
                scope.disableInput = false;
				$rootScope.showContinuebtn = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
				scope.questionText=$rootScope.CourseContent.screen[ scope.id].QuestionText;
				scope.instructionText=$rootScope.CourseContent.screen[ scope.id].instruction_text;
				scope.pageBG=$rootScope.CourseContent.screen[ scope.id].pageBG;
                scope.feedbackToggle = false;
                scope.buttonText = $rootScope.CourseContent.screen[ scope.id].submitText;
                scope.maxAttempt = $rootScope.CourseContent.screen[ scope.id].maximumAttempt;
                scope.feedback = "";
                scope.feedback_bg = $rootScope.CourseContent.screen[ scope.id].feedback_bg_path;
            };

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            };

            scope.onOptionSelected = function (event) {
                if ($('input[name=answer]:checked').length > 0)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
                if ($(".kc-option-radio").children().hasClass("option-selected-radio")) {
                    $(".kc-option-radio").children().removeClass("option-selected-radio");
                }
               $(event.target).parent().addClass("option-selected-radio");

            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.screen[ scope.id].question;
            };
			scope.hideFeedback=function(){
				scope.feedbackToggle=false
			};
			
			scope.feedBackNavigation = function(nav){
				$rootScope.checkInternet($rootScope.selectedLang);
				if(nav=='next'){
					scope.feedbackCounter++;
				}else if(nav=='prev'){
					scope.feedbackCounter--;
				}
				console.log(scope.feedbackCounter+"=="+scope.feedback.paragraph.length)
				if(scope.feedbackCounter==scope.feedback.paragraph.length){
					$rootScope.markVisitedPage();
				}
			}
            scope.checkAnswer = function () {
				
				var flag3 = $('input[name=answer]:checked').val();
				
				$rootScope.checkInternet($rootScope.selectedLang);
				//$rootScope.markVisitedPage();
                if (scope.buttonText == $rootScope.CourseContent.screen[ scope.id].submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
                    if (!$('input[name=answer]:checked').length) return;
                    if ($('input[name=answer]:checked').attr("correct") == "true") {
                        if (attrs.assesment == "true")
                            $rootScope.assesmentScore++;
						
						if(attrs.feedbacktype=="true" || attrs.feedbacktype==true)
							scope.feedback =   $rootScope.CourseContent.screen[ scope.id].option_feedback.feedback[flag3-1];
						else
							scope.feedback = $rootScope.CourseContent.screen[ scope.id].correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;
                        //if (!$rootScope.CourseContent.screen[ scope.id][ scope.id].branchingScreen)
                            //$rootScope.markVisitedPage();
                        //else {
                            scope.isBranching = true;
                        //}
					//if (attrs.assesment == "true")
						//
						//$rootScope.crntQuizStatus();
                    } else {
						
					
					
						//$rootScope.crntQuizStatus();
						if(attrs.feedbacktype=="true" || attrs.feedbacktype==true){
							scope.feedback=   $rootScope.CourseContent.screen[ scope.id].option_feedback.feedback[flag3-1];
							/* console.log($rootScope.feedback) */
						}
						else
							scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
                            scope.disableInput = true;

                        }
					//if (attrs.assesment == "true")
						//
                    }
                    if (attrs.tickmark == "true")
                        scope.checkUserAnswer();
                    scope.attempt++;
                }
                else {
                    scope.feedbackToggle = false;
                    $('input[name=answer]:checked').parent().removeClass("correct-checkbox-radio");
                    $('input[name=answer]:checked').parent().removeClass("in-correct-checkbox-radio");
                    $('input[name=answer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.screen[ scope.id].submitText;
                    scope.disableInput = false;
                    scope.disableButton = true;
                    if ($(".kc-option-radio").children().hasClass("option-selected-radio")) {
                        $(".kc-option-radio").children().removeClass("option-selected-radio");
                    }

                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                    // if (!$rootScope.CourseContent.screen[ scope.id][ scope.id].branchingScreen)
                        //$rootScope.markVisitedPage();
                    //else{
                        scope.isBranching = true;
                    //}
                    if (attrs.tickmark == "true")
                        scope.showAnswer();
                }
				
				$rootScope.showContinuebtn = true;
				//if (!$rootScope.CourseContent.screen[ scope.id][ scope.id].branchingScreen)
                            //$rootScope.markVisitedPage();
            };

            scope.checkUserAnswer = function () {
                if ($('input[name=answer]:checked').attr("correct") == "true") {
                    $('input[name=answer]:checked').parent().addClass("correct-checkbox-radio")
                }
                else {
					if(attrs.type == "samc"){
						$('input[name=answer]:checked').parent().addClass("in-correct-checkbox-radio")	
						$('input[correct=true]').parent().addClass("correct-checkbox-radio")						
					}
					$('input[name=answer]:checked').parent().addClass("in-correct-checkbox-radio")
                }

            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if ($(checkAnswer[i]).attr("correct") == "true") {
						 if (!attrs.assesment == "true")
							$(checkAnswer[i]).parent().addClass("correct-checkbox-radio");
						$('.kc-option-label-radio').css('cursor', 'default');
                    }
                }
				
				if(attrs.disablenext!="true" )
				$rootScope.markVisitedPage();
            }
            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
            scope.reset();
           scope.start();
        }
    }
});

FrameworkApp.directive('popsamc', function ($rootScope) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
                if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
				

            }
            scope.feedbackCounter = 1;
            scope.selection = 1;
            scope.isBranching = false;
            scope.disableButton = true;
            scope.start = function () {
				scope.id= Number(attrs.id-1);
                scope.attempt = 0;
                scope.disableInput = false;
				$rootScope.showContinuebtn = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
				scope.continueText = $rootScope.CourseContent.screen.continueText;
				scope.questionText=$rootScope.CourseContent.screen.QuestionText;
				scope.instructionText=$rootScope.CourseContent.screen.instruction_text;
				scope.pageBG=$rootScope.CourseContent.screen.pageBG;
                scope.feedbackToggle = false;
                scope.buttonText = $rootScope.CourseContent.screen.submitText;
                scope.maxAttempt = $rootScope.CourseContent.screen.maximumAttempt;
                scope.feedback = "";
                scope.feedback_bg = $rootScope.CourseContent.screen.feedback_bg_path;
				//$rootScope.attachStyle();
            };

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            };

            scope.onOptionSelected = function (event) {
                if ($('input[name=answer]:checked').length > 0)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
                if ($(".kc-option-radio").children().hasClass("option-selected-radio")) {
                    $(".kc-option-radio").children().removeClass("option-selected-radio");
                }
               $(event.target).parent().addClass("option-selected-radio");

            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.screen.question;
            };
			scope.hideFeedback=function(){
				scope.feedbackToggle=false
			};
			
			scope.feedBackNavigation = function(nav){
				$rootScope.checkInternet($rootScope.selectedLang);
				if(nav=='next'){
					scope.feedbackCounter++;
				}else if(nav=='prev'){
					scope.feedbackCounter--;
				}
				console.log(scope.feedbackCounter+"=="+scope.feedback.paragraph.length)
				if(scope.feedbackCounter==scope.feedback.paragraph.length){
					$rootScope.markVisitedPage();
				}
			}
            scope.checkAnswer = function () {
				
				var flag3 = $('input[name=answer]:checked').val();
				
				$rootScope.checkInternet($rootScope.selectedLang);
				//$rootScope.markVisitedPage();
                if (scope.buttonText == $rootScope.CourseContent.screen.submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
                    if (!$('input[name=answer]:checked').length) return;
                    if ($('input[name=answer]:checked').attr("correct") == "true") {
                        if (attrs.assesment == "true")
                            $rootScope.assesmentScore++;
						
						if(attrs.feedbacktype=="true" || attrs.feedbacktype==true)
							scope.feedback =   $rootScope.CourseContent.screen.option_feedback.feedback[flag3-1];
						else
							scope.feedback = $rootScope.CourseContent.screen.correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;
                        //if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                            //$rootScope.markVisitedPage();
                        //else {
                            scope.isBranching = true;
                        //}
					//if (attrs.assesment == "true")
						//
						//$rootScope.crntQuizStatus();
                    } else {
						
					
					
						//$rootScope.crntQuizStatus();
						if(attrs.feedbacktype=="true" || attrs.feedbacktype==true){
							scope.feedback=   $rootScope.CourseContent.screen.option_feedback.feedback[flag3-1];
							/* console.log($rootScope.feedback) */
						}
						else
							scope.feedback = $rootScope.CourseContent.screen.incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.screen.resetText;
                            scope.disableInput = true;

                        }
					//if (attrs.assesment == "true")
						//
                    }
                    if (attrs.tickmark == "true")
                        scope.checkUserAnswer();
                    scope.attempt++;
                }
                else {
                    scope.feedbackToggle = false;
                    $('input[name=answer]:checked').parent().removeClass("correct-checkbox-radio");
                    $('input[name=answer]:checked').parent().removeClass("in-correct-checkbox-radio");
                    $('input[name=answer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.screen.submitText;
                    scope.disableInput = false;
                    scope.disableButton = true;
                    if ($(".kc-option-radio").children().hasClass("option-selected-radio")) {
                        $(".kc-option-radio").children().removeClass("option-selected-radio");
                    }

                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                    // if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                        //$rootScope.markVisitedPage();
                    //else{
                        scope.isBranching = true;
                    //}
                    if (attrs.tickmark == "true")
                        scope.showAnswer();
                }
				
				$rootScope.showContinuebtn = true;
				//if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                            //$rootScope.markVisitedPage();
            };

            scope.checkUserAnswer = function () {
                if ($('input[name=answer]:checked').attr("correct") == "true") {
                    $('input[name=answer]:checked').parent().addClass("correct-checkbox-radio")
                }
                else {
					if(attrs.type == "samc"){
						$('input[name=answer]:checked').parent().addClass("in-correct-checkbox-radio")	
						$('input[correct=true]').parent().addClass("correct-checkbox-radio")						
					}
					$('input[name=answer]:checked').parent().addClass("in-correct-checkbox-radio")
                }

            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if ($(checkAnswer[i]).attr("correct") == "true") {
						 if (!attrs.assesment == "true")
							$(checkAnswer[i]).parent().addClass("correct-checkbox-radio");
						$('.kc-option-label-radio').css('cursor', 'default');
                    }
                }
				
				if(attrs.disablenext!="true" )
				$rootScope.markVisitedPage();
            }
            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
            scope.reset();
           scope.start();
        }
    }
});


FrameworkApp.directive('quizNavigation', function () {
	
	return {
		restrict: 'C',
		link: function ($scope, $rootScope, elem, attrs) {
			$rootScope.counterid=1;
	},
	controller: function ($scope, $rootScope) {
			$rootScope.counterid=1;
			$scope.scenario = false;
			$scope.getNextScreen = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if( $rootScope.counterid < $rootScope.CourseContent.screen.length){
					$rootScope.counterid++;					
				}
				$scope.scenario = false;
			};	
			
			$scope.getPrevScreen = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if($rootScope.counterid > 1){
					$rootScope.counterid--;					
				}
				$scope.scenario = false;
			};
			
			$scope.dropScenario = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if($scope.scenario)
					$scope.scenario = false;
				else
					$scope.scenario = true;
			};
			
			$scope.closeScenario = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.scenario = false;
			};
			
	}
}
});


FrameworkApp.directive('resultpage', function () {
    return {
        restrict: 'AC',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
			var currentTime = new Date();
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			$scope.dateString=month + "/" + day + "/" + year;
			$(".menu-contain").css("pointer-events", "all");
			$('.menu-contain').css('opacity','1');
            $rootScope.assesmentStarted = false;
            $rootScope.pageStatusList[$rootScope.currentModule][$rootScope.currentTopic][$rootScope.currentPage] = "1";
            if ($rootScope.assesmentAttempted < $rootScope.CourseConfig.MaxAssesmentAttempt)
                $rootScope.showTryAgain = true;
            else
                $rootScope.showTryAgain = false;

            $rootScope.assesmentPercentageScore = Math.round(($rootScope.assesmentScore / $rootScope.CourseConfig.AvailableAssessmentQuestion) * 100);
			//console.log($rootScope.assesmentPercentageScore);			
			
			if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				if($rootScope.assesmentPercentageScore >= $rootScope.CourseConfig.MasteryScore){	
					parent.SCORM_SetScore($rootScope.assesmentPercentageScore);
					parent.SCORM_SetPassed();
				}                
				else {			
					parent.SCORM_SetScore($rootScope.assesmentPercentageScore);
					parent.SCORM_SetFailed();
				}				
				parent.SCORM_CallLMSCommit();
            }
            $scope.retakeAssesment = function () {
                $rootScope.assesmentScore = 0;
                $rootScope.assesmentQuestionIndex = [];
				$scope.questionsArray[0] = Math.ceil(Math.random()*5);
				$rootScope.quizCounter = $scope.questionsArray[0];
				//console.log($rootScope.quizCounter)
                $rootScope.assesmentStarted = true;
                $rootScope.isNextButtonDisabled = false;
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isLastQuestion = false;
				$rootScope.asmntScoreArray = [2,2,2,2,2];
				//$rootScope.loadVisualMenu();
				$rootScope.showResumeBtn = false;
				$rootScope.assesmentQuestionIndex[0] = 1;
				$rootScope.loadScreen($rootScope.currentModule, $rootScope.currentTopic, 0)
            }
			
			$scope.proceedToCertficate = function () {
				$scope.gotoNextPage();
				 $rootScope.isLastQuestion = false;
			};

        }
    }
});


FrameworkApp.directive('mamc12', function ($rootScope,$timeout) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
				var myVar = setInterval(function(){  scope.myTimer() }, 1000);
            }
			scope.visited = false;
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == 1){
				scope.visited = true;
			}
            scope.selection = 1;
            scope.correctAnswer = [];
            scope.userAnswer = [];
			scope.aryResponse = [];
			scope.blnCorrect;
			scope.aryCorrectResponse =[];
            scope.options = "";
            scope.disableButton = true;
            scope.isBranching = false;
			scope.userTime = 0;
            scope.start = function () {
                scope.id = 0;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
                $rootScope.feedbackToggle = false;
                scope.fdbackTgle = false;
                scope.buttonText = $rootScope.CourseContent.submitText;
                scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
                $rootScope.feedback = "";
				scope.feedbackAssessment = "";
                scope.feedback_bg = $rootScope.CourseContent.feedback_bg_path;
                scope.quizTxt = $rootScope.CourseContent.quizTxt;
				scope.openpopup = false;

            };
			
			scope.testingAnswers = function(_answers){
				if($rootScope.CourseConfig.isDebugging){	
					if(_answers.isCorrect == "true"){
						return "debug-quiz-color-correct";
					}else{
						return "debug-quiz-color-incorrect";
					}
				}
			};

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            };

            scope.onOptionSelected = function (pIndex,type) {
				if(type==true){
					var elem=$('input[name=answer]')[pIndex]; 
					var cEle = $(event.currentTarget).siblings(".kc-option-label");
					var cInp = $($(cEle[0]).find("input[name=answer]")[0]);
					$(elem).attr("checked",true);
				}
				if ($('input[name=answer]:checked').length > 0)
						scope.disableButton = false;
				else
					scope.disableButton = true;
				if ($("#options label").eq(pIndex).hasClass("option-selected")) {
					$("#options label").eq(pIndex).removeClass("option-selected");
				}
				else {
					$("#options label").eq(pIndex).addClass("option-selected");					
				}	
            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == "true"){
						
                        scope.correctAnswer.push(1);
						if(attrs.assesment=="true"){
						var flag = scope.options[i].text;
						//flag = flag.replace(/ +/g, "_");
						flag = flag.replace(/\./g,' ')
						//scope.aryResponse.push(flag);
						scope.aryCorrectResponse.push(flag);	
						}
					
					}
                    else{
                        scope.correctAnswer.push(0);
					}
                }
            };

            scope.checkAnswer = function () {
				$rootScope.checkInternet($rootScope.selectedLang);
				if (attrs.assesment == "true")clearInterval(myVar);
                if (scope.buttonText == $rootScope.CourseContent.submitText) {
                    if (attrs.feedback == "true")
                        $rootScope.feedbackToggle = true;
						scope.fdbackTgle = true;
                    var AnswerList = document.getElementsByName('answer');
                    for (var i = 0; i < AnswerList.length; i++) {
                        if (AnswerList[i].checked) {
                            scope.userAnswer.push(1);
							if(attrs.assesment=="true"){
							var flag1 = scope.options[i].text;
							//flag = flag.replace(/ +/g, "_");
							flag1 = flag1.replace(/\./g,' ');
							var Response =["A","B","C","D","E","F","G"];
							var flag4 = Response[i]
							//alert("flag4"+flag4)
							//scope.aryCorrectResponse.push(flag1);
							scope.aryResponse.push(flag4);	
								
							}
							
							
                        }
                        else {
                            scope.userAnswer.push(0);
                        }
                    }
					//alert("scope.aryResponse"+scope.aryResponse)
                    if (!$('input[name=answer]:checked').length) return;
				    var tottalCorrectAns = 0;
					var tottaluserAns = 0;
					var tottaluserIncorrectAnswer =0;
					for(var k = 0;k < scope.options.length;k++){
						if(scope.correctAnswer[k]==1){tottalCorrectAns++;}
						if(scope.correctAnswer[k]== scope.userAnswer[k] &&  scope.userAnswer[k] ==1){
							tottaluserAns++;							
						}						
						if(scope.userAnswer[k]==1){
							if(scope.userAnswer[k]!=scope.correctAnswer[k]){
							tottaluserIncorrectAnswer++;
							}							
						}					
					}
                    if (JSON.stringify(scope.correctAnswer) == JSON.stringify(scope.userAnswer) && attrs.assesment == "true") {	//check both if answer is correct and assessment is true
                        if (attrs.assesment == "true")
							{$rootScope.assesmentScore++;}
                        $rootScope.feedback = $rootScope.CourseContent.correct_feedback;
						scope.feedbackAssessment = $rootScope.CourseContent.correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;
						scope.blnCorrect = true;					
                        if (!$rootScope.CourseContent.branchingScreen)
                            $rootScope.markVisitedPage();
                        else {
                            scope.isBranching = true;
                        }
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 1;
                    }
					else{
						 $rootScope.feedback = $rootScope.CourseContent.incorrect_feedback;
						 scope.feedbackAssessment = $rootScope.CourseContent.incorrect_feedback;
						 scope.blnCorrect = "false";
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.resetText;
                            scope.disableInput = true;
                        }
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 0;
						}                       
                    }
					if (attrs.assesment != "true"){
							if(tottalCorrectAns == tottaluserAns && tottaluserIncorrectAnswer==0 ){
								$rootScope.feedback = $rootScope.CourseContent.correct_feedback;
								scope.feedbackAssessment = $rootScope.CourseContent.correct_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}		
							}
							else if(tottaluserAns>=1 && tottaluserIncorrectAnswer==0){
								$rootScope.feedback = $rootScope.CourseContent.partial_correct_feedback;
								scope.feedbackAssessment = $rootScope.CourseContent.partial_correct_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}	 		
							}
							else{								
								$rootScope.feedback = $rootScope.CourseContent.incorrect_feedback;
								scope.feedbackAssessment = $rootScope.CourseContent.incorrect_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}	
							}
						}
				if (attrs.tickmark == "true" && attrs.assesment == "false"){
					scope.checkUserAnswer();
					scope.attempt++;
				}
                else {
					$('.kc-option-label').css('cursor', 'default');
                    $rootScope.feedbackToggle = false;
					scope.fdbackTgle = false;
                    $('input[name=answer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    scope.disableInput = false;
                    scope.userAnswer = [];
                    scope.disableButton = true;
                    $('input[name=answer]').parent().removeClass("correct-checkbox");
                    $('input[name=answer]').parent().removeClass("in-correct-checkbox");
                    if ($(".kc-option").children().hasClass("option-selected")) {
                        $(".kc-option").children().removeClass("option-selected");
                    }
                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                    if (!$rootScope.CourseContent.branchingScreen){
						if(attrs.popupbox != "true")
							$rootScope.markVisitedPage();						
					}
                    else {
                        scope.isBranching = true;
                    }
                    if (attrs.tickmark == "true" && attrs.assesment == "false")
                        scope.showAnswer();
					else
						$('.kc-option-label').css('cursor', 'default');
					
                }
				scope.popuptext = $rootScope.CourseContent.popupcontent;
				if(attrs.popupbox == "true"){
					$timeout(function(){
						scope.openpopup = true;						
						$rootScope.markVisitedPage();
					},1000);
				}
				
				var flag4 = $rootScope.assesmentQuestionIndex[$rootScope.currentPage];
				var QuestionTypeText;
				if($rootScope.currentTopic==0){
					QuestionTypeText = "PreAssessmentSection_";
				}else{
					QuestionTypeText = "PostAssessmentSection_";
				}
				var strID = QuestionTypeText+"Question_"+flag4;
				//var strID = $rootScope.CourseContent.paragraph_text1_1;
				//strID = strID.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "");
				///strID = strID.trim();
				//strID = strID.replace(/ +/g, "_");
				var strDescription = "";
				var intWeighting = 1;
				var intLatency = (scope.userTime*1000);
				var dtmTime = $rootScope.getDate;
				var strLearningObjectiveID = $rootScope.currentPage;
				if (attrs.assesment == "true"){
					if($rootScope.CourseConfig.AppType.toLowerCase() == "scorm1.2"){
						SCORM_RecordMultipleChoiceInteraction(strID, scope.aryResponse, scope.blnCorrect, scope.aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
						scormAdaptor_commit();
					}
				}
				
            };
			 scope.myTimer = function(){
				 scope.userTime++;
			 }
            scope.checkUserAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if (checkAnswer[i].checked) {
                        if (scope.correctAnswer[i] == 1) {
                            $(checkAnswer[i]).parent().addClass("correct-checkbox")
                        }
                        else {
                            $(checkAnswer[i]).parent().addClass("in-correct-checkbox")
                        }
                    }
                }
            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if (scope.correctAnswer[i] == 1) {
                        $(checkAnswer[i]).parent().addClass("correct-checkbox");
						$('.kc-option-label').css('cursor', 'default');
						$('.kc-option-label').find('.option-text').css('cursor', 'default');						
                    }
                }
            };

            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
			
            scope.reset();
            scope.start();
        }
    }

});

FrameworkApp.directive('conversation', function () {
    return {
        restrict: 'A',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval){
			var count = 0;
			var cnvrnTimer = null;
			var isPlaying = false;
			var sbBtClcked = [];
			$scope.isPlaying = isPlaying;
			$scope.visitedArray = [];
			$scope.c = 0;
			$scope.subPopup = false;
			$scope.showSbPP = false;
			$scope.disableOpt = false;
			$scope.page1 = true;
			$scope.openHotword = false;
			$scope.showRetry = false;
			$scope.hotwordText = '';
			$scope.popupText = '';
			$scope.disableClose = true;
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == "1")
				$scope.disableClose = false;
			$scope.checkState = function(i){
				//checkTime();
				if(i>$scope.c && $scope.visitedArray.indexOf(i) == -1 && $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == "0"){
					return "disabled";
				}
				if(i==$scope.c){
					return "activebtn";
				}
			};
			var timer;
			$timeout.cancel(timer);
			function checkTime(_val){
				 timer = $timeout(function(){
					console.log("----------"+_val)
					$($('.nav-btns')[_val+1]).removeClass('disabled');
				},2000);
			}
			checkTime($scope.c);
			
			function startScreen(){
				cnvrnTimer = $interval(function(){
					count++;
					var getTime = $rootScope.CourseContent.screen[$scope.c].timer?$rootScope.CourseContent.screen[$scope.c].timer:2;
						getTime = parseInt(getTime);
					var isSubBtn = $rootScope.CourseContent.screen[$scope.c].subBtn;
					if(isSubBtn){
						$scope.isPlaying = false;
						isPlaying = false;
						$interval.cancel(cnvrnTimer);
					}
					if($scope.visitedArray.indexOf($scope.c) == -1)
						$scope.visitedArray.push($scope.c);
					if(count >= getTime && !isSubBtn){
						$('.speach-bubble').fadeOut(300,function(){
							$scope.c++;	
							$scope.$apply();
							$('.speach-bubble').fadeIn(500);							
						});
						sbBtClcked = [];
						$scope.showSbPP = false;
						if($scope.c >= $rootScope.CourseContent.screen.length)
							$scope.c = 0;
						count = 0;
					}
					chkCompletion();
				},1000);				
			}
			
			$scope.getcCntent = function(i){
				if(!$rootScope.CourseContent.screen[0].subBtn && $scope.visitedArray.indexOf(0) == -1)
					$scope.visitedArray.push(0);
				$('.speach-bubble').fadeOut(300,function(){
					$scope.c = i;
					$timeout.cancel(timer);
					if(!$rootScope.CourseContent.screen[i].subBtn)
						checkTime($scope.c);
					$scope.$apply();
					$('.speach-bubble').fadeIn(500);
				});				
				var isSubBtn = $rootScope.CourseContent.screen[i].subBtn;					
				count = 0;
				
				if(isSubBtn){
					$scope.isPlaying = false;
					isPlaying = false;
					$interval.cancel(cnvrnTimer);
				}	
				if($scope.visitedArray.indexOf(i) == -1 && !isSubBtn)
					$scope.visitedArray.push(i);
				chkCompletion();
				$scope.showSbPP = false;
				$scope.subPopup = false;
				
			}
			
			function chkCompletion(){
				var isCompleted = $scope.visitedArray.length >= $rootScope.CourseContent.screen.length;
				
				if(isCompleted){
					$rootScope.markVisitedPage();
					$scope.isPlaying = false;
					isPlaying = false;
					return true;
				}else{
					return false;					
				}
			}
			
			$scope.openSubPopup = function(ind,item,isObj){
				$(event.currentTarget).addClass("selected-answer");
				$scope.subPopup = true;
				$scope.popupText = item.popupText;
				var sbBtnCnt = $rootScope.CourseContent.screen[$scope.c].subBtn;
					sbBtnCnt = parseInt(sbBtnCnt);
					if(sbBtClcked.indexOf(ind) == -1)
						sbBtClcked.push(ind);
					if(sbBtClcked.length >= sbBtnCnt){
						if($scope.visitedArray.indexOf($scope.c) == -1)
							$scope.visitedArray.push($scope.c);
						checkTime($scope.c);
					}
					$scope.disableClose = true;
					if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
						timer1 = $timeout(function(){
							$scope.disableClose = false;
						},3000);
					}else{
						$scope.disableClose = false;
					}
					chkCompletion();
			};
			
			$scope.closeSub = function(){
				$scope.subPopup = false;
				var isSubBtn = $rootScope.CourseContent.screen[$scope.c].subBtn;
				var sbBtnCnt = $rootScope.CourseContent.screen[$scope.c].subBtn;
					sbBtnCnt = parseInt(sbBtnCnt);
			};
		
			
			$scope.hotword = function(key,id,itemNum){
				$scope.disableClose = true;
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
					timer1 = $timeout(function(){
						$scope.disableClose = false;
					},3000);
				}else{
					$scope.disableClose = false;
				}
				$scope.openHotword = true;
				$scope.hotwordText = $rootScope.CourseContent[key];
				if(itemNum){
					var sbBtnCnt = $rootScope.CourseContent.screen[itemNum].subBtn;
				}else{
					var sbBtnCnt = $rootScope.CourseContent.screen[$scope.c].subBtn;					
				}
					sbBtnCnt = parseInt(sbBtnCnt);
				if(sbBtClcked.indexOf(id) == -1)
					sbBtClcked.push(id);
				if(sbBtClcked.length >= sbBtnCnt){
					if(itemNum){
						if($scope.visitedArray.indexOf(itemNum) == -1)
							$scope.visitedArray.push(itemNum);
						checkTime($scope.c);
					}
					else if($scope.visitedArray.indexOf($scope.c) == -1)
							$scope.visitedArray.push($scope.c);
						checkTime($scope.c);
					chkCompletion();
				}
			}
			
			$scope.closeHotword = function(key){
				$scope.openHotword = false;
				$scope.hotwordText = '';
			};
			var currentAttempt = 0;
			$scope.sbPop = function(){
				$scope.disableClose = true;
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
					timer1 = $timeout(function(){
						$scope.disableClose = false;
					},3000);
				}else{
					$scope.disableClose = false;
				}
					currentAttempt++;
				var maxAttempt = $rootScope.CourseContent.screen[$scope.c].maxAttempt || 1;
				var isSelectedCorrect = $(event.currentTarget).hasClass('correct-ans');
				if(isSelectedCorrect || currentAttempt >= maxAttempt){
					$(event.currentTarget).addClass("selected-answer");
					$scope.showSbPP = true;
					$scope.disableOpt = true;
					if($scope.visitedArray.indexOf($scope.c) == -1){
						$scope.visitedArray.push($scope.c);
						checkTime($scope.c);
					}
					chkCompletion();					
				}else{
					$scope.showRetry = true;
					$(event.currentTarget).parent().children().addClass('disabled');
				}
				
			}		
				
			$scope.tryAgain = function(){
				$scope.showRetry = false;
				$('.lst-wrapper').find('li').removeClass('disabled');
			};
			
			$scope.closeSbPop = function(){
				$scope.showSbPP = false;
			};
			
			$scope.$on('$destroy', function(){
				$interval.cancel(cnvrnTimer)
				$timeout.cancel(timer);
			});
        }
    }
});

FrameworkApp.directive('conversationp14', function () {
    return {
        restrict: 'A',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval){
			var count = 0;
			var cnvrnTimer = null;
			var isPlaying = false;
			var sbBtClcked = [];
			$scope.isPlaying = isPlaying;
			$scope.visitedArray = [];
			$scope.c = 0;
			$scope.subPopup = false;
			$scope.showSbPP = false;
			$scope.disableOpt = false;
			$scope.disableClose = true;
			$scope.page1 = true;
			$scope.openHotword = false;
			$scope.showRetry = false;
			$scope.hotwordText = '';
			$scope.popupText = '';
			$scope.checkState = function(i){
				//checkTime();
				if(i>$scope.c && $scope.visitedArray.indexOf(i) == -1 && $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == "0"){
					return "disabled";
				}
				if(i==$scope.c){
					return "activebtn";
				}
			};
			var timer;
			$timeout.cancel(timer);
			function checkTime(_val){
				 timer = $timeout(function(){
					console.log("----------"+_val)
					$($('.nav-btns')[_val+1]).removeClass('disabled');
				},2000);
			}
			//checkTime($scope.c);
			
			function startScreen(){
				cnvrnTimer = $interval(function(){
					count++;
					var getTime = $rootScope.CourseContent.screen[$scope.c].timer?$rootScope.CourseContent.screen[$scope.c].timer:2;
						getTime = parseInt(getTime);
					var isSubBtn = $rootScope.CourseContent.screen[$scope.c].subBtn;
					if(isSubBtn){
						$scope.isPlaying = false;
						isPlaying = false;
						$interval.cancel(cnvrnTimer);
					}
					if($scope.visitedArray.indexOf($scope.c) == -1)
						$scope.visitedArray.push($scope.c);
					if(count >= getTime && !isSubBtn){
						$('.speach-bubble').fadeOut(300,function(){
							$scope.c++;	
							$scope.$apply();
							$('.speach-bubble').fadeIn(500);							
						});
						sbBtClcked = [];
						$scope.showSbPP = false;
						if($scope.c >= $rootScope.CourseContent.screen.length)
							$scope.c = 0;
						count = 0;
					}
					chkCompletion();
				},1000);				
			}
			
			$scope.getcCntent = function(i){
				if(!$rootScope.CourseContent.screen[0].subBtn && $scope.visitedArray.indexOf(0) == -1)
					$scope.visitedArray.push(0);
				$('.speach-bubble').fadeOut(300,function(){
					$scope.c = i;
					$timeout.cancel(timer);
					if(!$rootScope.CourseContent.screen[i].subBtn)
						checkTime($scope.c);
					$scope.$apply();
					$('.speach-bubble').fadeIn(500);
				});				
				var isSubBtn = $rootScope.CourseContent.screen[i].subBtn;					
				count = 0;
				
				if(isSubBtn){
					$scope.isPlaying = false;
					isPlaying = false;
					$interval.cancel(cnvrnTimer);
				}	
				if($scope.visitedArray.indexOf(i) == -1 && !isSubBtn)
					$scope.visitedArray.push(i);
				chkCompletion();
				$scope.showSbPP = false;
				$scope.subPopup = false;
				
			}
			
			function chkCompletion(){
				var isCompleted = $scope.visitedArray.length >= $rootScope.CourseContent.screen.length;
				
				if(isCompleted){
					$rootScope.markVisitedPage();
					$scope.isPlaying = false;
					isPlaying = false;
					return true;
				}else{
					return false;					
				}
			}
			
			$scope.openSubPopup = function(ind,item,isObj){
				$scope.disableClose = true;
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
					timer1 = $timeout(function(){
						$scope.disableClose = false;
					},3000);
				}else{
					$scope.disableClose = false;
				}
				$(event.currentTarget).addClass("selected-answer");
				$scope.subPopup = true;
				$scope.popupText = item.popupText;
				var sbBtnCnt = $rootScope.CourseContent.screen[$scope.c].subBtn;
					sbBtnCnt = parseInt(sbBtnCnt);
					if(sbBtClcked.indexOf(ind) == -1)
						sbBtClcked.push(ind);
					if(sbBtClcked.length >= sbBtnCnt){
						if($scope.visitedArray.indexOf($scope.c) == -1)
							$scope.visitedArray.push($scope.c);
						checkTime($scope.c);
					}
					chkCompletion();
			};
			
			$scope.closeSub = function(){
				$scope.subPopup = false;
				var isSubBtn = $rootScope.CourseContent.screen[$scope.c].subBtn;
				var sbBtnCnt = $rootScope.CourseContent.screen[$scope.c].subBtn;
					sbBtnCnt = parseInt(sbBtnCnt);
			};
		
			
			$scope.hotword = function(key,id,itemNum){
				$scope.disableClose = true;
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
					timer1 = $timeout(function(){
						$scope.disableClose = false;
					},3000);
				}else{
					$scope.disableClose = false;
				}
				$scope.openHotword = true;
				$scope.hotwordText = $rootScope.CourseContent[key];
				if(itemNum){
					var sbBtnCnt = $rootScope.CourseContent.screen[itemNum].subBtn;
				}else{
					var sbBtnCnt = $rootScope.CourseContent.screen[$scope.c].subBtn;					
				}
					sbBtnCnt = parseInt(sbBtnCnt);
				if(sbBtClcked.indexOf(id) == -1)
					sbBtClcked.push(id);
				if(sbBtClcked.length >= sbBtnCnt){
					if(itemNum){
						if($scope.visitedArray.indexOf(itemNum) == -1)
							$scope.visitedArray.push(itemNum);
						checkTime($scope.c);
					}
					else if($scope.visitedArray.indexOf($scope.c) == -1)
							$scope.visitedArray.push($scope.c);
						checkTime($scope.c);
					chkCompletion();
				}
			}
			
			$scope.closeHotword = function(key){
				$scope.openHotword = false;
				$scope.hotwordText = '';
			};
			var currentAttempt = 0;
			$scope.sbPop = function(){
				$scope.disableClose = true;
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]!="1"){
					timer1 = $timeout(function(){
						$scope.disableClose = false;
					},3000);
				}else{
					$scope.disableClose = false;
				}
					currentAttempt++;
				var maxAttempt = $rootScope.CourseContent.screen[$scope.c].maxAttempt || 1;
				var isSelectedCorrect = $(event.currentTarget).hasClass('correct-ans');
				if(isSelectedCorrect || currentAttempt >= maxAttempt){
					$(event.currentTarget).addClass("selected-answer");
					$scope.showSbPP = true;
					$scope.disableOpt = true;
					if($scope.visitedArray.indexOf($scope.c) == -1){
						$scope.visitedArray.push($scope.c);
						checkTime($scope.c);
					}
					chkCompletion();					
				}else{
					$scope.showRetry = true;
					$(event.currentTarget).parent().children().addClass('disabled');
				}
				
			}		
				
			$scope.tryAgain = function(){
				$scope.showRetry = false;
				$('.lst-wrapper').find('li').removeClass('disabled');
			};
			
			$scope.closeSbPop = function(){
				$scope.showSbPP = false;
			};
			
			$scope.$on('$destroy', function(){
				$interval.cancel(cnvrnTimer)
				$timeout.cancel(timer);
			});
        }
    }
});

FrameworkApp.directive('conversationwithstart', function () {
    return {
        restrict: 'A',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval){
			var count = 0;
			var cnvrnTimer = null;
			var isPlaying = false;
			var timer1;
			$scope.isPlaying = isPlaying;
			$scope.visitedArray = [];
			$scope.c = 0;
			$scope.subPopup = false;
			$scope.page1 = true;
			$scope.popupText = '';
			$scope.disableClose = true;
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == 1){
				$scope.disableClose = false;
			}
			$scope.visitedArray.push($scope.c);
			$scope.checkState = function(i){
				//checkTime();
				if(i>$scope.c && $scope.visitedArray.indexOf(i) == -1 && $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == "0"){
					return "disabled";
				}
				if(i==$scope.c){
					return "activebtn";
				}
			};
			
			var timer;
			$timeout.cancel(timer);
			function checkTime(_val){
				 timer = $timeout(function(){
					console.log("----------"+_val)
					$($('.nav-btns')[_val+1]).removeClass('disabled');
				},2000);
			}
			
			
			function startScreen(){
				cnvrnTimer = $interval(function(){
					count++;
					var getTime = $rootScope.CourseContent.screen[$scope.c].timer?$rootScope.CourseContent.screen[$scope.c].timer:2;
						getTime = parseInt(getTime);
					if(count >= getTime){
						$scope.c++;
						if($scope.c >= $rootScope.CourseContent.screen.length)
							$scope.c = 0;
						if($scope.visitedArray.indexOf($scope.c) == -1)
							$scope.visitedArray.push($scope.c);
						count = 0;
						chkCompletion();
					}
				},1000);				
			}
			
			$scope.screenPlay = function(){
				$scope.page1 = false;
				$scope.isPlaying = isPlaying;
				checkTime($scope.c);
			};
			
			$scope.closeP1 = function(){
				$scope.page1 = true;
				$scope.c = 0;
			}
			
			$scope.getcCntent = function(i){
				$scope.c = i;
				count = 0;
				if($scope.visitedArray.indexOf($scope.c) == -1)
					$scope.visitedArray.push($scope.c);
				checkTime($scope.c);
				chkCompletion();
			}
			
			function chkCompletion(){
				var isCompleted = $scope.visitedArray.length >= $rootScope.CourseContent.screen.length;
				if(isCompleted){
					timer1 = $timeout(function(){
						$rootScope.markVisitedPage();
						$scope.disableClose = false;					
						$scope.isPlaying = false;
						isPlaying = false;
						$interval.cancel(cnvrnTimer);
						$timeout.cancel(timer1);
					},3000);
				}
			}
			
			$scope.openSubPopup = function(ind,item){
				$scope.subPopup = true;
				$scope.popupText = item.popupText;
			};
			
			$scope.closeSub = function(){
				$scope.subPopup = false;
			};
			
			$scope.$on('$destroy', function(){
				$interval.cancel(cnvrnTimer);
				$timeout.cancel(timer1);
			});
        }
    }
});


FrameworkApp.directive('createScenario', function () {
    return {
        restrict: 'AC',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval){
			$scope.loadScenarionScreen = function(ind,item){
				var pID = item.gotPage.split("_");
				var m = parseInt(pID[0]);
					m--;
				var t = parseInt(pID[1]);
					t--;
				var c = parseInt(pID[2]);
					c--;
				$rootScope.loadScreen(m,t,c);
			};
			
			$scope.checkCompleteion = function(ind,item){
				var status = "";
				var pID = item.gotPage.split("_");
				var c = parseInt(pID[2]);
				var pEndID = item.scnEnds.split("_");
				var cE = parseInt(pEndID[2]);
				var anyOneCompleted = false;
				var allCompleted = false;
				var sliceList = $rootScope.pageStatusList[$rootScope.currentTopic].slice(c-1,cE-1);
					allCompleted = (sliceList.indexOf("0") == -1);
					anyOneCompleted = (sliceList.indexOf("1") >= 0);
				if(allCompleted){
					status = "sc-visited";
				}else if(anyOneCompleted){
					status = "sc-in-progress";
				}else{
					status = "sc-not-started";
				}
				if($('.sc-visited').length == $rootScope.CourseContent.scenario.length){
					$rootScope.markVisitedPage();
					$rootScope.isNextButtonDisabled = false;					
				}
				//console.log()
				var isHasCls = $(".btn_"+(ind)).hasClass('sc-visited');
				if(ind > 0 && !isHasCls){
					if ($rootScope.CourseConfig.ForceNavigation)
						status +=" disable-scenario";
				}
				return status;
			}
		}
    }
});

FrameworkApp.directive('formvalidate',function(){
	return {
		restrict:'A',
        link: function ($scope, $rootScope, elem, attrs) {
        },
		controller:function($scope,$rootScope){
			var userName;
			if($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
				userName = parent.SCORM_GetStudentName();
				userName = userName.split(',')
				userName = userName[1].trim();
			}else{
				userName = 'Offline Name';
			}
			$scope.cantContinue = true;
			$scope.dsbleDeclare = false;
			$scope.page = 1;
			$scope.fName = userName;
			$scope.employeeNum = '';
			$scope.country = 'Singapore';
			$scope.customer = '';
			$scope.distributor = '';
			$scope.competitor = '';
			$scope.prsnl_rlnshp = '';
			$scope.any_relative = '';
			$scope.countryInput = '';
			$scope.coi_brg = '';
			$scope.pNC = '';
			$scope.brfDscrp = '';
			$scope.Company = '';
			$scope.Location = '';
			$scope.date = '';
			var updated = false;
			var glblYsExist = false;
			var userData = {};
			if($rootScope.isPassed[6].length > 1){
				var data = JSON.parse($rootScope.isPassed[6]);
				$scope.fName = data.fName;
				$scope.employeeNum = data.employeeNum;
				if(data.country !='Singapore' && data.country !='Indonesia' &&  data.country !='Thailand' &&  data.country !='Vietnam' &&  data.country !='China' && data.country !='India (ISC)' && data.country !='UAE'){
					$scope.countryInput = data.country;
					$scope.country = 'Others';
				}else{
					$scope.country = data.country;
				}
				$scope.customer = data.Q1_a;
				userData.Q1_a = data.Q1_a;
				$scope.distributor = data.Q1_b;
				userData.Q1_b = data.Q1_b;
				$scope.competitor = data.Q1_c;
				userData.Q1_c = data.Q1_c;
				$scope.prsnl_rlnshp = data.Q2_a;
				userData.Q2_a = data.Q2_a;
				$scope.any_relative = data.Q2_b;
				userData.Q2_b = data.Q2_b;
				$scope.coi_brg = data.Q3;
				userData.Q3 = data.Q3;
				$scope.pNC = data.pNC;
				updated = true;
				$scope.brfDscrp = data.brfDscrp;
				$scope.Company = data.Company;
				$scope.Location = data.Location;
				console.log(data)
				if($scope.customer.toLowerCase() == 'yes' || $scope.distributor.toLowerCase() == "yes" || $scope.competitor.toLowerCase() == "yes" || $scope.prsnl_rlnshp.toLowerCase() == 'yes' || $scope.any_relative.toLowerCase() == "yes" || $scope.coi_brg.toLowerCase() == "yes"){
					glblYsExist = true;
				}else{
					glblYsExist = false;
				}
			}
			if($scope.fName.length > 0 && $scope.employeeNum.toString().length >0 && $scope.country.length > 0){
					$scope.cantContinue = false;					
			}
			else{
				$scope.cantContinue = true;					
			}
			$scope.checkFilled = function(e){
				if($scope.fName.length > 0 && ($scope.employeeNum!=null && $scope.employeeNum.toString().length >0) && (($scope.country != 'Others' || $scope.countryInput.length > 0) && $scope.country.length > 0)){
					$scope.cantContinue = false;					
				}
				else{
					$scope.cantContinue = true;					
				}
			};		
			
			$scope.checkFilled2 = function(){
				if($scope.pNC.length > 0 && $scope.brfDscrp.length >0 && $scope.Company.length > 0 && $scope.Location.length > 0){
					$scope.cantContinue = false;					
				}
				else{
					$scope.cantContinue = true;					
				}
			};	
			$scope.checkRadio = function(){
				$(event.target).parent().siblings('label').removeClass('option-selected');
				$(event.target).parent().addClass('option-selected');
				var dataKey = $(event.target).parents('form').data('key');
					userData[dataKey] = $(event.target).val();
				if($scope.customer && $scope.distributor && $scope.competitor){
					$scope.cantContinue = false;
				}		
				if($scope.customer.toLowerCase() == 'yes' || $scope.distributor.toLowerCase() == "yes" || $scope.competitor.toLowerCase() == "yes" || $scope.prsnl_rlnshp.toLowerCase() == 'yes' || $scope.any_relative.toLowerCase() == "yes" || $scope.coi_brg.toLowerCase() == "yes"){
					glblYsExist = true;
				}else{
					glblYsExist = false;
				}
			};		
			
			$scope.checkRadio2 = function(){
				$(event.target).parent().siblings('label').removeClass('option-selected');
				$(event.target).parent().addClass('option-selected');
				var dataKey = $(event.target).parents('form').data('key');
					userData[dataKey] = $(event.target).val();
				if($scope.prsnl_rlnshp && $scope.any_relative && $scope.coi_brg){
					$scope.cantContinue = false;
				}		
				if($scope.prsnl_rlnshp.toLowerCase() == 'yes' || $scope.any_relative.toLowerCase() == "yes" || $scope.coi_brg.toLowerCase() == "yes" || $scope.customer.toLowerCase() == 'yes' || $scope.distributor.toLowerCase() == "yes" || $scope.competitor.toLowerCase() == "yes"){
					glblYsExist = true;
				}else{
					glblYsExist = false;
				}	
			};
			
			$scope.goNext = function(){
				$scope.cantContinue = true;
				$scope.page++;
				if($scope.page == 4 && !glblYsExist){
					$scope.page++;
					$scope.pNC = '';
					$scope.brfDscrp = '';
					$scope.Company = '';
					$scope.Location = '';
				}				
				if($scope.prsnl_rlnshp && $scope.any_relative && $scope.coi_brg && $scope.page==3){
					$scope.cantContinue = false;
				}	
				if($scope.customer && $scope.distributor && $scope.competitor && $scope.page==2){
					$scope.cantContinue = false;
				}
				if($scope.fName.length > 0 && $scope.employeeNum.toString().length >0 && $scope.country.length > 0 && $scope.page==1){
					
				}
				if($scope.pNC.length > 0 && $scope.brfDscrp.length >0 && $scope.Company.length > 0 && $scope.Location.length > 0 && $scope.page==4){
					$scope.cantContinue = false;					
				}
			};
			
			$scope.goPrev = function(){
				$scope.cantContinue = false;
				$scope.dsbleDeclare = false;
				$scope.page--;
				if($scope.page == 4 && !glblYsExist){
					$scope.page--;
				}
			};
			
			$scope.declare = function(){
				$scope.dsbleDeclare = true;
				if($scope.country=='Others' && $scope.countryInput.length > 0){
					$scope.country = $scope.countryInput;
				}
				userData.fName = $scope.fName;
				userData.employeeNum = $scope.employeeNum;
				userData.country = $scope.country;
				userData.pNC = $scope.pNC;
				userData.brfDscrp = $scope.brfDscrp;
				userData.Company = $scope.Company;
				userData.Location = $scope.Location;
				userData.Q1_a = $scope.customer;
				userData.Q1_b = $scope.distributor;
				userData.Q1_c = $scope.competitor;
				userData.Q2_a = $scope.prsnl_rlnshp;
				userData.Q2_b = $scope.any_relative;
				userData.Q3 = $scope.coi_brg;
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				var yyyy = today.getFullYear();
				if(dd<10) {
					dd = '0'+dd
				} 
				if(mm<10) {
					mm = '0'+mm
				} 
				today = dd + '/' + mm + '/' + yyyy;
				userData.date = today;
				if(updated){
					userData.updated = 'Yes';					
				}
				else{
					userData.updated = 'No';
					//userData.date = '';
				}
				userData = JSON.stringify(userData);
				//$rootScope.isPassed[6] = '';
				$rootScope.isPassed[6] = userData;
				$rootScope.markVisitedPage();
				userData = JSON.parse(userData);
				if(userData.country !='Singapore' && userData.country !='Indonesia' &&  userData.country !='Thailand' &&  userData.country !='Vietnam' &&  userData.country !='China' && userData.country !='India (ISC)' && userData.country !='UAE'){
					$scope.countryInput = userData.country;
					$scope.country = 'Others';
				}else{
					$scope.country = userData.country;
				}
				userData = {};
			}
		}
	}
});


FrameworkApp.directive('introControl', function () {
    return {
        restrict: 'A',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$timeout) {	
			$scope.page2 = true;
			var vdo = document.getElementById("introVideo");
				// vdo.load();
				// vdo.play();
				vdo.addEventListener('ended', function(){
					/* $timeout(function(){
						$scope.startcourseFromIntro();
						$scope.$apply();							
					}); */
				});

        }
    }
});

FrameworkApp.directive('vdocontrol', function () {
    return {
        restrict: 'A',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$timeout) {
			$scope.openHotword = false;
			
			$scope.playVideo = function(){
				$scope.openHotword = true;
				$scope.closeEnable = false;
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == "1"){
					$scope.closeEnable = true;
				}
				var a = document.getElementById('introVideo');
				setTimeout(function(){
					// a.load();
					// a.play();		
					a.addEventListener("ended",function(){
						$scope.closeEnable = true;
						$rootScope.markVisitedPage();				
						$rootScope.$apply();				
					});
				},1000);
				pauseAudio();
				$rootScope.disableAudio = true;
			}
				
			$scope.closeVideo = function(){
				var a = document.getElementById('introVideo');
				a.pause();
				$scope.openHotword = false;
				plAudio();
				$rootScope.disableAudio = false;
			}
        }
    }
});

FrameworkApp.directive('carouselNav', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope,$timeout, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
			
			$('#myCarousel').carousel({
				wrap: false
			});
			if($rootScope.isPassed[4] == 0 && $rootScope.currentPage == 2 && $rootScope.currentTopic == 5){
				$rootScope.isNextButtonDisabled = true;
			}
			
			$scope.counter = 0;	
			$scope.clickCounter = [];
			setTimeout(function(){
				if($rootScope.CourseContent.subBtns == true || $rootScope.CourseContent.subBtns == "true"){
					
				}else{
					if($scope.clickCounter.indexOf(0) == -1)
						$scope.clickCounter.push(0);
				}
			},500);
			
			var _hyperLink = false;
			var subBtn = 0;
			
			$scope.navigatePage = function(nav){
				$rootScope.checkInternet($rootScope.selectedLang);
				if(nav == 'next'){
					$('#myCarousel').carousel("next");
					$scope.counter++;
				}else{
					$('#myCarousel').carousel("prev");
					$scope.counter--;
				}
				if($scope.counter > 0){
					setTimeout(function(){
						$('.left').css("pointer-events","all");
					},800);
					$('.left').css("opacity","1");
				}else{
					$('.left').css("pointer-events","none");
					$('.left').css("opacity","0.5");
				}
				
				if($rootScope.CourseContent.btn_content.length == $scope.counter+1){
					$('.right').css("pointer-events","none");
					$('.right').css("opacity","0.5");
				}else{
					setTimeout(function(){
						$('.right').css("pointer-events","all");						
					},800);
					$('.right').css("opacity","1");
				}
				var sbBtns = $rootScope.CourseContent.btn_content[$scope.counter].sub_btn?$rootScope.CourseContent.btn_content[$scope.counter].sub_btn:0;
				if(parseInt(sbBtns) <= 0){
					$scope.checkCompletion();
				}
				$(".right").css("pointer-events","none");
				$(".left").css("pointer-events","none");
				$(".item").css("pointer-events","all");
				$(".item").removeClass("done");
				$(".item").removeClass("done");
			};
			
			$scope.trackBtns = function(_val){
				if($scope.clickCounter.indexOf(_val) == -1){
					$scope.clickCounter.push(_val);
					$scope.checkCompletion();
				}
			};
			
			$scope.checkCompletion = function(){
				if($scope.clickCounter.indexOf($scope.counter) == -1){
					$scope.clickCounter.push($scope.counter);
				}
				if($scope.clickCounter.length == $rootScope.CourseContent.btn_content.length){
					$rootScope.markVisitedPage();
					if($rootScope.CourseContent.markNextScreen == "true")
						$rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage+1]= "1";
				}
			}
			$scope.showQuestion = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.openScenario=true;
			}
			
			
		}
    }
});

FrameworkApp.directive('btnClickType14', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout) {
			var counter = 0;
			$scope.popupToggle = false;
			$scope.visitedStts = false;
			var tempVisited = '';
			var adedCls = '';
			
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$scope.visitedStts = true;
			}
            $rootScope.clickCounter = [];
			if($rootScope.clickCounter.indexOf($scope.active) == -1 && $scope.active != undefined)
				$rootScope.clickCounter.push($scope.active);
            $scope.loadcontent = function (event, pItem) {
				$(".butns").removeClass("selected");
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.popupToggle = true;
				$scope.active = pItem.id;
				if($rootScope.clickCounter.indexOf($scope.active) == -1)
					$rootScope.clickCounter.push($scope.active);
                $rootScope.Buttontext = pItem.text;
                $rootScope.header = pItem.button;
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage();
				$(event.currentTarget).addClass("selected");
				tempVisited = event.currentTarget;
				$(".btn_content").removeClass(adedCls);
				$(".btn_content").addClass("btn_content"+pItem.id);
				adedCls = "btn_content"+pItem.id;
            }		
			$scope.closePopup = function(){
				$scope.popupToggle=false;
				//console.log(tempVisited)
				//$(tempVisited).removeClass("selected");
				$(tempVisited).addClass("visited");
			}
        }
    }
});
FrameworkApp.directive('hotword', function ($rootScope) {
	return {
        restrict: 'CA',
		controller: function($scope, $rootScope) {
			$scope.popupToggle = false;
			var visitedHWArray = [];
			$scope.openPopup = function(key){
				$scope.popupHead = $rootScope.CourseContent[key].header;
				$scope.popupText = $rootScope.CourseContent[key].content;
				$scope.clsName = key;
				$scope.popupToggle = true;
				if(visitedHWArray.indexOf(key) == -1){
					visitedHWArray.push(key);
					if(visitedHWArray.length == $rootScope.CourseContent.numberofhotwords){
						$rootScope.markVisitedPage();
					}
				}
			};	
			
			$scope.closepopup = function(){
				$scope.popupToggle = false;
				$scope.popupHead = '';
				$scope.popupText = '';
			}
		}
	}
});
FrameworkApp.directive('btnClickType1', function () {
	var tempVisited = '';
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			tempVisited = '';
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {		
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$(".btns").addClass("visited");
			}
			var tempVisit = '';
			var counter = 0 ;
			$scope.clicked  = false;
			$scope.openpopup = false;
			$scope.active  = 1;
			$scope.count = 1;
			$scope.tCount = 0;
            $scope.clickCounter = [];
			var gPItem = '';
			var gSbBtns = 0;
			$(".accordian-panel").hide();
            $scope.loadcontent = function (event, pItem,_type) {
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.openpopup = true;
				$(".accordian-panel").show();
				$scope.count = parseInt(pItem.id);
				var flag = $('.btns');
				if(!$(flag[0]).hasClass("markCompleted"))
				$(flag[0]).addClass("markCompleted");
				$(flag[pItem.id-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[pItem.id-1]);
				//$(tempVisited).addClass("selected");
				$(".btns").removeClass("selected");
				$($(".btns")[$scope.count-1]).addClass("selected");
                $scope.Buttontext = pItem.text;
				$scope.clicked = true;
				tempVisited = $(event.currentTarget);
					gPItem = pItem;
				var gSbBtns = gPItem.sub_btn?gPItem.sub_btn:0;
				/* if($scope.clickCounter.length > 0 && gSbBtns == 0){
					$(tempVisited).addClass("visited");					
				} */
				if(gSbBtns == 0)
					$scope.checkCompletion($scope.count-1);
				if(_type === "cType" && sbBtns>=0){
					if($scope.clickCounter.indexOf(0) == -1){
						$scope.clickCounter.push(0);
					}
				}
			}
			$scope.close = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				//console.log(gPItem)
				if(gPItem.sub_btn == 0)
					$(tempVisited).addClass("visited");
				$scope.openpopup = false;
			};		
		
			$scope.onNextBack = function (state) {
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state == 'back'){
					if($scope.count < 2) {
						$scope.count = $rootScope.CourseContent.btn_click_learn.length;
						$scope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;
					}else{
						$scope.count--;
						$scope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
					}
				}
				else if(state == 'next'){
					if($scope.count > $rootScope.CourseContent.btn_click_learn.length-1) $scope.count = 0; //return;;
						$scope.count++;
						$scope.Buttontext = $rootScope.CourseContent.btn_click_learn[$scope.count-1].text;						
				}
				
				var flag = $('.btns');
				if(!$(flag[0]).hasClass("markCompleted"))
					$(flag[0]).addClass("markCompleted");
				$(flag[$scope.count-1]).removeClass("markCompleted");
				$(tempVisit).addClass("markCompleted");
				tempVisit = $(flag[$scope.count-1]);
				
				$scope.active = $scope.count;
				$scope.checkCompletion($scope.count-1);
				if($scope.clickCounter.indexOf(0) == -1){
					$scope.clickCounter.push(0);
				}
				/* if($scope.count >= $rootScope.CourseContent.btn_click_learn.length)
					$rootScope.markVisitedPage(); */
			}
			$scope.checkCompletion = function(_val){
				if($scope.clickCounter.indexOf(_val) == -1 && gSbBtns < 1 )
					$scope.clickCounter.push(_val)
				
				//console.log($rootScope.clickCounter.length +"=="+ $rootScope.CourseContent.btn_click_learn.length)
				if($scope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.markVisitedPage();
					$scope.showInsText=true;
					
					if($scope.CourseContent.screen==5)
					$scope.showInsText1=true;
					//console.log($rootScope.showInsText)
				}
					
				//console.log($rootScope.clickCounter)
				/* if($rootScope.CourseContent.btn_click_learn.length == undefined)
					$rootScope.markVisitedPage(); */
			};
			$scope.popCounter=1;	
			$scope.navigatePage =function(state){
				$rootScope.checkInternet($rootScope.selectedLang);
				if(state=='left'){
					$scope.popCounter--;
				}else if(state=='right'){
					$scope.popCounter++;
					var _val = gPItem.id;
					if($scope.clickCounter.indexOf(_val) == -1 && gSbBtns < 1 )
						$scope.clickCounter.push(_val)
					$(tempVisited).addClass("visited");	
					$scope.checkCompletion(_val);
				}
			}
			/* if($rootScope.clickCounter.indexOf($scope.count-1) == -1)
				$rootScope.clickCounter.push($scope.count-1) */
		}
    }
});


FrameworkApp.directive('btnClickType15', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout) {
			var counter = 0;
			$rootScope.showInsText=false;
			$scope.popupToggle = false;
			$scope.visitedStts = false;
			var tempVisited = '';
			var adedCls = '';
			
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$scope.visitedStts = true;
			}
            $rootScope.clickCounter = [];
			if($rootScope.clickCounter.indexOf($scope.active) == -1 && $scope.active != undefined)
				$rootScope.clickCounter.push($scope.active);
			
            $scope.loadcontent = function (event, pItem) {
				$(".butns").removeClass("selected");
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.popupToggle = true;
				$scope.active = pItem.id;
				if($rootScope.clickCounter.indexOf($scope.active) == -1)
					$rootScope.clickCounter.push($scope.active);
                $rootScope.Buttontext = pItem.text;
                $rootScope.header = pItem.button;
				console.log($rootScope.clickCounter.length +"=="+ $rootScope.CourseContent.btn_click_learn.length);
				if($rootScope.clickCounter.length == $rootScope.CourseContent.btn_click_learn.length){
					$rootScope.showInsText=true;
					$rootScope.markVisitedPage();
				}
				$(event.currentTarget).addClass("selected");
				$(event.currentTarget).addClass("visited");
				tempVisited = event.currentTarget;
				$(".btn_content").removeClass(adedCls);
				$(".btn_content").addClass("btn_content"+pItem.id);
				adedCls = "btn_content"+pItem.id;
            }		
			$scope.closePopup = function(){
				$scope.popupToggle=false;
				//console.log(tempVisited)
				//$(tempVisited).removeClass("selected");
				$(tempVisited).addClass("visited");
			}
			
        }
    }
});

FrameworkApp.directive('singleBtn', function ($rootScope) {
	  return {
        restrict: 'A',
	    controller: function ($scope, $rootScope) {
			$scope.showPopup = false; 
			$scope.openPopup = function(_val){
				$('.m-pop-up').show();
				if($scope.showPopup){
					$scope.showPopup = false;	
					if($('.m-pop-up').length > 0)
						$('.m-pop-up').hide();
				}
				else{
					$scope.showPopup = true;
					if($('.m-pop-up').length > 0)
						$('.m-pop-up').show();
				}
				var len = $(".selected").length;
				var btnLen = $rootScope.CourseContent.btn_click_learn.length
				if(len === btnLen && _val === 'gonext'){
					$scope.gotoNextPage();
				}
			};
		}
	 }
});
FrameworkApp.directive('clicknlearntopic1', function ($rootScope) {
    return {
        restrict: 'AE',
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
				return '../html5/Views/kc/' + template + '.html';
			}
			console.log("click and learn");
			var counter = [];
			scope.content = $rootScope.CourseContent;
			scope.Buttontext = scope.content.btn_click_learn[0].text;
			scope.id = 1;
			scope.popupToggle=true;
			setTimeout(function(){
				$(".tab1").addClass('selected');
			},500);
			counter.push(1);
			scope.loadcontent = function (event, pItem) {
				$(event.currentTarget).addClass('selected');
				scope.popupToggle = true;				
				scope.Buttontext = pItem.text;
				scope.id = pItem.id;
				if(counter.indexOf(pItem.id) == -1)
					counter.push(pItem.id)
				if(scope.CourseContent.btn_click_learn.length == counter.length)
					$rootScope.markVisitedPage(); 
			};
		}
	}
});
FrameworkApp.directive('popupnextback', function () {
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
			$scope.showContent = false;
			$scope.popupText = '';
			$scope.popupHead = '';
			$scope.counter = 0;
			var targetElement = null;
			$scope.navigation = true;
			$scope.cArrayCnt = [];
			$scope.noteBtn = false;
			var visitArray = [];
			var tempClass = '';
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
				$scope.scrnCmpltd = true;
				$scope.noteBtn = true;
			}
			
			$scope.loadcontent = function(e,pItem){
				$(".btnBox").removeClass("selected");
				$scope.counter = 0;
				$scope.showContent = true;
				$scope.popupHead = pItem.head;
				targetElement = e.currentTarget;
				$(targetElement).addClass("selected");
				if(pItem.button_content.length == undefined || pItem.button_content.length == "undefined"){
					$scope.navigation = false;
					$scope.popupText = pItem.button_content.text;
					var cEl = pItem.id;
					chkPgSts(cEl);
				}else{
					$scope.popupText = pItem.button_content[$scope.counter].text;
					$scope.navigation = true;
				}
				$scope.cArrayCnt = pItem;
				$(".btn_content").removeClass(tempClass);
				$(".btn_content").addClass("popup_"+pItem.id);
				tempClass = "popup_"+pItem.id;
			};
			
			$scope.navPage = function(dir){				
				if(dir == 'next' && $scope.counter < $scope.cArrayCnt.button_content.length-1){
					var cEl = $scope.cArrayCnt.id;				
					$scope.counter++;
					if($scope.counter == $scope.cArrayCnt.button_content.length-1){
						chkPgSts(cEl);
					}
				}else if(dir == 'back' && $scope.counter > 0){
					$scope.counter--;
				}
				$scope.popupText = $scope.cArrayCnt.button_content[$scope.counter].text;
			}			
			
			$scope.closepopup = function(){
				$scope.showContent = false;
				$scope.popupText = '';
				//$scope.noteBtn = false;
			};
			
			$scope.openNote = function(){
				$scope.showContent = true;
				$scope.navigation = false;
				$scope.popupHead = $rootScope.CourseContent.note.head;
				$scope.popupText = $rootScope.CourseContent.note.text;
				$(".btn_content").removeClass(tempClass);
				$(".btn_content").addClass("popup_note");
				tempClass = "popup_note";				
				$rootScope.markVisitedPage();
			};
			
			function chkPgSts(_val){
				var i = _val;
				if(visitArray.indexOf(i) == -1){
					visitArray.push(i);
					$(targetElement).addClass("visited");
				}
				var totalItems = $rootScope.CourseContent.btn_click_learn.length;
				if(visitArray.length == totalItems){
					$scope.noteBtn = true;
					$rootScope.markVisitedPage();
					console.log("---------completed-------")
				}
				console.log(visitArray)
			};
        }
    }
});

FrameworkApp.directive('btnClickSingle', function ($rootScope) {
	return {
        restrict: 'CA',
		controller: function($scope, $rootScope, $timeout) {
			$scope.count = 0;
			$scope.isOpen = false;
			$scope.openPopup = function(_type){
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.isOpen = true;
				if(_type == "video"){
					pauseAudio();
					$timeout(function(){
						var _ele = document.getElementById("videoBox");
							//console.log(_ele)
							_ele.addEventListener("ended",checkCompletion);
						function checkCompletion(){
							_ele.removeEventListener("ended",checkCompletion);
							$rootScope.markVisitedPage();
							$rootScope.$apply();
						}						
					},100);
				}else{
					$rootScope.markVisitedPage();
				}
				
				//$rootScope.markVisitedPage();
			}
			$scope.closePopup = function(_type){
				if(_type == "video"){
					// playAudio();
				}



				$scope.isOpen = false;
			}
		}
	}
});



FrameworkApp.directive('dragdropacustom', function ($rootScope,$timeout) {
     return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
			scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
			
            var template = attrs.templateUrl;
			var ansArr = [];
			
			
			var option =[];
			var totalCorrectOpt=0;
			var totalCorrectAns=0;
			var curretAttempt=1;
			var correctAns=0;
			var dragOpts = {
				 cursor: 'move',
				zIndex: 99999 };
				
			scope.attempt = 0;
            scope.feedback = "";
            scope.dragCounter = 0;
            scope.userAnswer = [];
			
			
            // JSON Data
			var showAnswer=$rootScope.CourseContent.showAnswer;
			var maxAttempt= $rootScope.CourseContent.maximumAttempt;
			var noOfDragable=$rootScope.CourseContent.question.length;
			var showMarkerInAttempt = $rootScope.CourseContent.showMarkerInAttempt;
			var correctFeedback=$rootScope.CourseContent.correct_feedback;
			var pertialFeedback=$rootScope.CourseContent.try_feedback;
			var incorrectFeedback=$rootScope.CourseContent.incorrect_feedback;
			var submitEnable=$rootScope.CourseContent.submitEnable;
			var incorrectTitle  = $rootScope.CourseContent.inCorrectFeedbackTitle;
			var correctTitle = $rootScope.CourseContent.correctFeedbackTitle;
			
            scope.buttonText = $rootScope.CourseContent.submitText;
            scope.feedBacktitle = "";
            scope.instruction_text = $rootScope.CourseContent.instruction_text;
            scope.pageHeading = $rootScope.CourseContent.pageHeading;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
            scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
			scope.question = $rootScope.CourseContent.question;
			scope.para1 = $rootScope.CourseContent.para1;
			scope.para2 = $rootScope.CourseContent.para2;
			scope.feedBackTitle = $rootScope.CourseContent.feedBackTitle;
			scope.feedBackText = $rootScope.CourseContent.feedBackText;
			scope.isCorrect  = false;
			scope.startActivity  = false;
			// Boolean variable
			scope.disableButton = true;
			scope.showAnser= false;
			scope.feedbackToggle = false;
			scope.showFeedBack=false;
			for(var i=1; i<=noOfDragable; i++){
				option.push("#draggable_"+i)
			}
			
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
            }
			var arrowTimer;
			scope.activityStart = function(){
				scope.startActivity  = true;
				$('.drag-content').addClass('animate');
				arrowTimer = setTimeout(function(){ 
					$('.arrow').show();
				}, 500);
			}

            scope.start = function () 
			{
                
				for(var i=1; i<=noOfDragable; i++)
				{
					ansArr.push($rootScope.CourseContent.question[i-1].dropIndex);
					if($rootScope.CourseContent.question[i-1].dragText!="" && $rootScope.CourseContent.question[i-1].dropText!=""){
						totalCorrectOpt++;
					}
					$("#draggable_"+i).data( "ans", 0 ); // user answer
					$( "#draggable_"+i).data({
						'originalLeft': $( "#draggable_"+i).css('left'),
						'origionalTop': $( "#draggable_"+i).css('top')
					});
					$("#draggable_"+i ).draggable(dragOpts);
					$("#draggable_"+i ).draggable({
						drag: function() {
							clearTimeout(arrowTimer);
							$('.arrow').hide();
							$(this).css({cursor: 'move',zIndex: 99999 });
						},
						revert: function(Obj )
						{
							if(Obj==false)
							{
								var dragedId= this.attr("id").split("_")[1];
								var targetId=$("#draggable_"+dragedId).data( "ans")
								this.appendTo("#dragarea_"+dragedId);
								$("#target_"+targetId).droppable("enable");
								//$("#target_"+targetId).css("border","#666666 dashed thin");
								//this.animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
								this.css({top:0,left:0});
								$("#draggable_"+dragedId).data( "ans", 0 ); //reseting the user answer while dragging back 
								//$(this).html("<p class='drophere'>Drop here </p>");
							}
							checkSubmitEnable();
						}
					});  
					
					$("#target_"+i).droppable
					({
						accept:option.toString(),   
						drop: function(event, ui) 
						{
							 //scope.disableButton = false;
							var dragedId= ui.draggable.attr("id").split("_")[1]; 
							var targetId=$("#draggable_"+dragedId).data( "id")
							$("#target_"+targetId).droppable("enable");
							//$("#target_"+targetId).css("border","#666666 dashed thin");
							
							// Enable Previous dropable object.
							var prevId=$("#draggable_"+dragedId).data( "ans");
							$("#target_"+prevId).droppable("enable");
							 
							$("#draggable_"+dragedId).data( "ans", $(this).attr("id").split("_")[1] );
						
							
							$(ui.draggable).appendTo($(this))
								 .css({'position':'absolute' , 'display':'table-cell' , 'top':'184px', left:'28px'})
								 .draggable('option', 'disabled', true)
								//.css({position:'relative'});
								 checkSubmitEnable();
								 $(this).droppable('disable')
								// $(this).css("border","none");
							$(ui.draggable).hide();
							 $(this).addClass('greenBorder');
							$(".btn-reset").attr("disabled", false);
							checkForResult();
						}
					});
				}
				totalCorrectAns=ansArr.length;
			}
			
			
			function checkSubmitEnable()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
			   var cnt=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "ans" )!=0)
					  cnt++; 
				 // console.log(cnt)
			   if(cnt==0)
					$(".btn-reset").attr("disabled", true);		
				
			   if(cnt>=submitEnable)
			   {
				    $(".btn-submit").attr("disabled", false);
			   }else
			   {
				   $(".btn-submit").attr("disabled", true);
			   }
			   
			}
			
			function checkForResult()
			{
			   var cnt=0;
			   var correctAns=0;
			   var inCorrectAns=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "ans" )!=0)
					  cnt++; 
				  
			   
			   for(var i=1; i<=noOfDragable; i++){
					var droppedObjId=$( "#draggable_"+i).data("ans" );
					
					if($( "#draggable_"+i).data("ans" )== ansArr[i-1] && $( "#draggable_"+i).data("ans" )!= 0){
						correctAns++;
					}else if($( "#draggable_"+i).data("ans" )!= 0){
						inCorrectAns++;
					}
			   }
			   if(correctAns==totalCorrectOpt && inCorrectAns==0 ){
				   feedbackSetText(correctFeedback,correctTitle);
					scope.isCorrect  = true;				   
					
			   }else{
				   feedbackSetText(incorrectFeedback,incorrectTitle);
			   }
			    $timeout(function(){
					scope.showFeedBack=true;
					$rootScope.markVisitedPage();
					scope.$apply();
				},2000);
				scope.$apply();				
			   
			}
			

			function disableOption(){
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).draggable("disable").css("cursor","default");
				}
			}
			function feedbackSetText(value,title)
			{
				//console.log(title)
				scope.feedBacktitle=title;
				scope.feedback=value;
			}
			function enableOption(){
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).draggable("enable").css("cursor","move");;
				}
			}

			function showCorrectAns(){
				
				 for(var i=1; i<=noOfDragable; i++)
				 {
					$( "#draggable_"+i).addClass('greenBorder'); 
				 } 	
			}

						
        var timerDrag = $timeout(function(){
					scope.start();
			 },3000);
		scope.$on('$destroy', function() {
			 $timeout.cancel(timerDrag);
		});
	//---- For Ipad
	(function ($) {
		// Detect touch support
		$.support.touch = 'ontouchend' in document;
		// Ignore browsers without touch support
		if (!$.support.touch) {
		return;
		}
		var mouseProto = $.ui.mouse.prototype,
			_mouseInit = mouseProto._mouseInit,
			touchHandled;

		function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
		// Ignore multi-touch events
			if (event.originalEvent.touches.length > 1) {
			return;
			}
		event.preventDefault(); //use this to prevent scrolling during ui use

		var touch = event.originalEvent.changedTouches[0],
			simulatedEvent = document.createEvent('MouseEvents');
		// Initialize the simulated mouse event using the touch event's coordinates
		simulatedEvent.initMouseEvent(
			simulatedType,    // type
			true,             // bubbles                    
			true,             // cancelable                 
			window,           // view                       
			1,                // detail                     
			touch.screenX,    // screenX                    
			touch.screenY,    // screenY                    
			touch.clientX,    // clientX                    
			touch.clientY,    // clientY                    
			false,            // ctrlKey                    
			false,            // altKey                     
			false,            // shiftKey                   
			false,            // metaKey                    
			0,                // button                     
			null              // relatedTarget              
			);

		// Dispatch the simulated event to the target element
		event.target.dispatchEvent(simulatedEvent);
		}
		mouseProto._touchStart = function (event) {
		var self = this;
		// Ignore the event if another widget is already being handled
		if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
			return;
		}
		// Set the flag to prevent other widgets from inheriting the touch event
		touchHandled = true;
		// Track movement to determine if interaction was a click
		self._touchMoved = false;
		// Simulate the mouseover event
		simulateMouseEvent(event, 'mouseover');
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		// Simulate the mousedown event
		simulateMouseEvent(event, 'mousedown');
		};

		mouseProto._touchMove = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
			}
		// Interaction was not a click
		this._touchMoved = true;
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		};
		mouseProto._touchEnd = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Simulate the mouseup event
		simulateMouseEvent(event, 'mouseup');
		// Simulate the mouseout event
		simulateMouseEvent(event, 'mouseout');
		// If the touch interaction did not move, it should trigger a click
		if (!this._touchMoved) {
		  // Simulate the click event
		  simulateMouseEvent(event, 'click');
		}
		// Unset the flag to allow other widgets to inherit the touch event
		touchHandled = false;
		};
		mouseProto._mouseInit = function () {
		var self = this;
		// Delegate the touch handlers to the widget's element
		self.element
			.on('touchstart', $.proxy(self, '_touchStart'))
			.on('touchmove', $.proxy(self, '_touchMove'))
			.on('touchend', $.proxy(self, '_touchEnd'));
		// Call the original $.ui.mouse init method
		_mouseInit.call(self);
    };
})(jQuery);


        }
    }
});



FrameworkApp.directive('dragdropmanycustom', function ($rootScope,$timeout) {
     return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
			scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
			
            var template = attrs.templateUrl;
			var correctAnswer = [];
			var submitEnable=0;
			var showAnswer=2;
			var noOfDragable;
			var showMarkerInAttempt = 1;
			var option =[];
			var totalCorrectAns=0;
			var curretAttempt=1;
			var maxDropItem;
			var maxAttempt;
			var dragOpts = {
				 cursor: 'move',
				 zIndex: 99999 };
			
		    scope.correctFeedback=$rootScope.CourseContent.correct_feedback;
			var pertialFeedback=$rootScope.CourseContent.try_feedback;
			var incorrectFeedback=$rootScope.CourseContent.incorrect_feedback;

            scope.feedbackToggle = false;
            scope.pageHeading = $rootScope.CourseContent.pageHeading;
            scope.instruction_text = $rootScope.CourseContent.instruction_text;
            scope.buttonText = $rootScope.CourseContent.submitText;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
            maxAttempt = $rootScope.CourseContent.maximumAttempt;
            scope.feedback = "";
            scope.question = $rootScope.CourseContent.question;
			scope.options = $rootScope.CourseContent.options;
			scope.maxDropItem = Number($rootScope.CourseContent.maxDropItem);
            scope.userAnswer = [];
			scope.disableButton = true;
			scope.showAnser= false;
			
			
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
            }
			
            scope.start = function () 
			{
				noOfDragable=$rootScope.CourseContent.options.length;
				$rootScope.disableBackBtn=true;
                for(var i=1; i<=noOfDragable; i++){
					option.push("#draggable_"+i) // Number of draggable obbjects 
				}
				
				for(var i=1; i<=noOfDragable; i++){
					correctAnswer.push($rootScope.CourseContent.options[i-1].dropIndex);
					$("#target_"+i).data( "id", 0 ); 
					$("#draggable_"+i).data( "id", 0 );
					$( "#draggable_"+i).data({
						'originalLeft': $( "#draggable_"+i).css('left'),
						'origionalTop': $( "#draggable_"+i).css('top')
					});
					$("#draggable_"+i ).draggable(dragOpts);
					$("#draggable_"+i ).draggable({
						drag: function() {
							$(this).css({cursor: 'move',zIndex: 99999 });
							$(this).find('p').addClass('onDrag')
							
						},
						revert: function(Obj ){
							
							if(Obj==false){
								var dragedId= this.attr("id").split("_")[1];
								var targetId=$("#draggable_"+dragedId).data( "id")
								this.appendTo("#dragarea_"+dragedId);
								$("#draggable_"+dragedId).find('p').removeClass('afterDrag onDrag');
								$("#target_"+targetId).droppable("enable");
							   
								// Toggle drag indicator
								if($('#cart_'+targetId).children().length==1)
									$("#cart_"+targetId).find('.cart').css('display','none');
							   
								this.css({top:0,left:0});
								$("#draggable_"+dragedId).data( "id", 0 ); 
								checkSubmitEnable();
								scope.showOption(dragedId); // Shows the next draggable object
							}
							
							checkSubmitEnable();
						}
					});  
				
					$("#target_"+i).droppable
					({
						accept:option.toString(), 
						drop: function(event, ui) 
						{
							var dragedId= parseInt(ui.draggable.attr("id").split("_")[1]); 
							var targetId=event.target.id.split("_")[1];
							
							if($('#cart_'+targetId).children().length==scope.maxDropItem+1 || correctAnswer[dragedId-1]!=$(this).attr("id").split("_")[1] ){
								$("#draggable_"+dragedId).appendTo("#dragarea_"+dragedId);
								$("#draggable_"+dragedId).css({'top':'0px','left':'0px','margin':'0px'})
								$("#target_"+targetId).droppable("enable");
								$("#draggable_"+dragedId).find('p').removeClass('afterDrag onDrag');
								scope.showOption(dragedId+1);
								$("#draggable_"+dragedId).data( "id", 0 ); 
								return true;
							}
							
							
									
							$("#target_"+targetId).droppable("enable");
							$("#draggable_"+dragedId).data( "id", $(this).attr("id").split("_")[1] );
							$(this).data( "id", targetId ); // set the dragged object's id to target object
							$(ui.draggable).find('p').removeClass('onDrag').addClass('afterDrag');
							$("#cart_"+targetId).find('.cart').css('display','block'); // Toggle drag indicator.
							 
							$(ui.draggable).appendTo($("#cart_"+targetId))
								.css({ 'display':'inline-block' , 'width': 'auto','top':'5px', 'margin':'0px 5px 5px 5px', 'left':'0px'}) // Custom CSS for dragged object
								.draggable('option', 'disabled', true)
								 if(submitEnable==0)
									 checkSubmitEnable();
								 $(".btn-reset").attr("disabled", false);
								 scope.showOption(dragedId+1);
							$(ui.draggable).addClass('greenBorder');
							checkForResult()
							
						}
					});
				}
				totalCorrectAns=correctAnswer.length;
				scope.showOption(1);
		//		$rootScope.attachStyle();
			}
			scope.showOption=function(id){
				
				//console.log("sub = "+isSubmitBtnEnable())
				var cnt=0;
			    for(var i=1; i<=noOfDragable; i++){
					console.log($("#draggable_"+i).data( "id" ))
					if($("#draggable_"+i).data( "id" )==0){
						$('#dragHolder_'+i).show();
						return true;
					}
				}	   
			}
			scope.onResetClick=function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).appendTo("#dragarea_"+i);
					$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
					$( "#target_"+i).removeClass('redBorder').removeClass('greenBorder');
					$("#target_"+i).droppable("enable");
					$("#target_"+i).data( "id",0);
					$("#draggable_"+i).data( "id",0);
					$("#draggable_"+i).css({'width': '320px'})
					$("#draggable_"+i).find('p').removeClass('afterDrag onDrag');
			   }
			   $("#cart_1 ,#cart_2, #cart_3, #cart_4").find('.cart').css('display','none');
			   scope.showOption(1);
			   if(submitEnable==0)
			   $(".btn-submit").attr("disabled", true);
			   $(".btn-reset").attr("disabled", true);
			   $(".btn-submit").hide();
			}
			
			function checkForResult()
			{
			   var cnt=0;
			   var correctAns=0;
			   var inCorrectAns=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "ans" )!=0)
					  cnt++; 
				  
			   
			   for(var i=1; i<=noOfDragable; i++){
					var droppedObjId=$( "#draggable_"+i).data("ans" );
					if($( "#draggable_"+i).data("id" )== correctAnswer[i-1] ){
						correctAns++;
					}else if($( "#draggable_"+i).data("id" )==$rootScope.CourseContent.options[i-1].optional){
						correctAns++;
					}
			   }
			  
			   if(correctAns==totalCorrectAns && inCorrectAns==0 ){
					scope.showFeedBack=true;
					$rootScope.markVisitedPage();
					scope.$apply();
			   }
			   
			}
			scope.onShowAnsClick=function()
			{
				//scope.showAnser= false;
				scope.feedbackToggle = false;
				$(".next img").addClass("done");
				$rootScope.isNextButtonDisabled = false;
				if(scope.showAnsText == $rootScope.CourseContent.showAns){
					for(var i=1; i<=noOfDragable; i++){
						$("#draggable_"+i).appendTo("#cart_"+correctAnswer[i-1]);
						//$("#draggable_"+i).css({'margin-top':'5px'});
						// $( "#target_"+i).removeClass('redBorder');
						// $( "#target_"+i).addClass('greenBorder');
						$( "#draggable_"+i).addClass('greenBorder').removeClass('redBorder'); 
					}
					scope.showAnsText =$rootScope.CourseContent.myAns;
				}
				else
				{
					onMyAnsClick();
					
					scope.showAnsText = $rootScope.CourseContent.showAns;
				}
			}
			
			function onMyAnsClick()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
				$( ".droppable-item").removeClass('greenBorder'); 
				for(var i=1; i<=noOfDragable; i++)
				{
					var targetId = $("#draggable_"+i).data( "id" );
					$("#draggable_"+i).appendTo("#cart_"+targetId);
					
					if($( "#draggable_"+i).data("id" )== correctAnswer[i-1])
						$( "#draggable_"+i).addClass('greenBorder').removeClass('redBorder'); 
					else if($( "#draggable_"+i).data("id" )==$rootScope.CourseContent.options[i-1].optional)
						$( "#draggable_"+i).addClass('greenBorder').removeClass('redBorder'); 
					else 
						$( "#draggable_"+i).addClass('redBorder').removeClass('greenBorder');
				}
			}
			
			function checkSubmitEnable()
			{
			   if(isSubmitBtnEnable())
			   {
				    $(".btn-submit").show();
					$(".btn-submit").attr("disabled", false);
					for(var i=1; i<=noOfDragable; i++)
					{
						$( "#draggable_"+i).draggable( 'disable' );
					}
					 
			   }else{
				   $(".btn-submit").hide();
			   }
			   // if(isSubmitBtnEnable())
			   // {
				    // $(".btn-submit").attr("disabled", false);
			   // }else{
				   // $(".btn-submit").attr("disabled", true);
			   // }
			}
			
			function isSubmitBtnEnable()
			{
				var cnt=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "id" )!=0)
					  cnt++; 

			   if(cnt==0)
					$(".btn-reset").attr("disabled", true);	
			   
			   if(cnt==noOfDragable)
			   {
				   return true;
			   }else{
				   return false;
			   }
			  
			}
			
			scope.onSubmitClick=function()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
				if (scope.buttonText == $rootScope.CourseContent.submitText) {
				$(".btn-reset").attr("disabled", true);
				var correctAns=0;
				var inCorrectAns=0;
				
				disableOption();
				if(attrs.feedback == "true")
					scope.feedbackToggle = true;
				
				for(var i=1; i<=noOfDragable; i++){
					
				    $( "#draggable_"+i).draggable( 'disable' )
					if($( "#draggable_"+i).data("id" )== correctAnswer[i-1] ){
						if(showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#draggable_"+i).addClass('greenBorder'); 
						correctAns++;
					}else if($( "#draggable_"+i).data("id" )==$rootScope.CourseContent.options[i-1].optional){
						if(showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#draggable_"+i).addClass('greenBorder'); 
						correctAns++;
					}else{
						inCorrectAns++;
						if (showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#draggable_"+i).addClass('redBorder');
					}
			   }
			   if(correctAns==totalCorrectAns && inCorrectAns==0 ){
				   //$(".btn-submit").attr("disabled", true);
				   $(".btn-submit").hide();
				   feedbackSetText(correctFeedback);
				   showCorrectAns();
				   $(".next img").addClass("done");
				   $rootScope.isNextButtonDisabled = false;
				   $rootScope.markVisitedPage();
				   
			   }
			   else{
				   if(curretAttempt<maxAttempt){
						 scope.buttonText = $rootScope.CourseContent.tryAgainText;
						 feedbackSetText(pertialFeedback);
				   }else{
						//$(".btn-submit").attr("disabled", true);
						$(".btn-submit").hide();
						feedbackSetText(incorrectFeedback);
						scope.showAnser= true;
						$rootScope.markVisitedPage();
						$(".btn-show-ans").attr("disabled", false);
				   }
			   }
			   }else
			   {
					$("#cart_1 ,#cart_2, #cart_3, #cart_4").find('.cart').css('display','none');
					curretAttempt++;
					scope.feedbackToggle = false;
					//$(".btn-reset").attr("disabled", true);
					$(".btn-submit").hide();
					enableOption()
				   for(var i=1; i<=noOfDragable; i++)
				   {
					    $( "#draggable_"+i).draggable( 'enable' )
						$("#draggable_"+i).appendTo("#dragarea_"+i);
						$("#draggable_"+i).css("margin","5px");
						$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
						$( "#target_"+i).removeClass('redBorder');
						$( "#target_"+i).removeClass('greenBorder');
						//$("#target_"+i).css("border","#666666 dashed thin");
						$("#target_"+i).droppable("enable");
						$("#target_"+i).data( "id",0);
						$("#draggable_"+i).data( "id",0);
						$("#draggable_"+i).css({'width': '500px','margin':'0px'})
						$("#draggable_"+i).find('p').removeClass('afterDrag onDrag');
				   }
				   if(submitEnable==0)
				   $(".btn-submit").attr("disabled", true);
				   scope.buttonText = $rootScope.CourseContent.submitText;
				   
				   scope.showOption(1);
				  
			   
			   }
			}

			function disableOption(){
				for(var i=1; i<=noOfDragable; i++){
					$("#draggable_"+i).draggable("disable").css("cursor","default");
				}
			}
			
			function feedbackSetText(value){
				scope.feedback=value;
			}
			
			function enableOption(){
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).draggable("enable").css("cursor","move");;
				}
			}

			function showCorrectAns(){
				 for(var i=1; i<=noOfDragable; i++)
				 {
					$( "#draggable_"+i).addClass('greenBorder'); 
				 } 	
			}

						
           $timeout(function(){
				scope.start();
		   },1000);
	//---- For Ipad
	(function ($) {
		// Detect touch support
		$.support.touch = 'ontouchend' in document;
		// Ignore browsers without touch support
		if (!$.support.touch) {
		return;
		}
		var mouseProto = $.ui.mouse.prototype,
			_mouseInit = mouseProto._mouseInit,
			touchHandled;

		function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
		// Ignore multi-touch events
			if (event.originalEvent.touches.length > 1) {
				return;
			}
		event.preventDefault(); //use this to prevent scrolling during ui use

		var touch = event.originalEvent.changedTouches[0],
			simulatedEvent = document.createEvent('MouseEvents');
		// Initialize the simulated mouse event using the touch event's coordinates
		simulatedEvent.initMouseEvent(
			simulatedType,    // type
			true,             // bubbles                    
			true,             // cancelable                 
			window,           // view                       
			1,                // detail                     
			touch.screenX,    // screenX                    
			touch.screenY,    // screenY                    
			touch.clientX,    // clientX                    
			touch.clientY,    // clientY                    
			false,            // ctrlKey                    
			false,            // altKey                     
			false,            // shiftKey                   
			false,            // metaKey                    
			0,                // button                     
			null              // relatedTarget              
			);

		// Dispatch the simulated event to the target element
		event.target.dispatchEvent(simulatedEvent);
		}
		mouseProto._touchStart = function (event) {
		var self = this;
		// Ignore the event if another widget is already being handled
		if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
			return;
		}
		// Set the flag to prevent other widgets from inheriting the touch event
		touchHandled = true;
		// Track movement to determine if interaction was a click
		self._touchMoved = false;
		// Simulate the mouseover event
		simulateMouseEvent(event, 'mouseover');
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		// Simulate the mousedown event
		simulateMouseEvent(event, 'mousedown');
		};
 
		mouseProto._touchMove = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Interaction was not a click
		this._touchMoved = true;
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		};
		mouseProto._touchEnd = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Simulate the mouseup event
		simulateMouseEvent(event, 'mouseup');
		// Simulate the mouseout event
		simulateMouseEvent(event, 'mouseout');
		// If the touch interaction did not move, it should trigger a click
		if (!this._touchMoved) {
		  // Simulate the click event
		  simulateMouseEvent(event, 'click');
		}
		// Unset the flag to allow other widgets to inherit the touch event
		touchHandled = false;
		};
		mouseProto._mouseInit = function () {
		var self = this;
		// Delegate the touch handlers to the widget's element
		self.element
			.on('touchstart', $.proxy(self, '_touchStart'))
			.on('touchmove', $.proxy(self, '_touchMove'))
			.on('touchend', $.proxy(self, '_touchEnd'));
		// Call the original $.ui.mouse init method
		_mouseInit.call(self);
    };
})(jQuery);


        }
    }
});

FrameworkApp.directive('dragdropmany', function ($rootScope,$timeout) {
     return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
			scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            var template = attrs.templateUrl;
			var correctAnswer = [];
			var submitEnable=0;
			var showAnswer=2;
			var noOfDragable=8;
			/* console.log(noOfDragable) */
			var showMarkerInAttempt = 1;
			var option =[];
			var totalCorrectAns=0;
			var curretAttempt=1;
			var maxDropItem;
			var maxAttempt;
			var dragOpts = {
				 cursor: 'move',
				 zIndex: 99999 };
			
			var correctFeedback=$rootScope.CourseContent.correct_feedback;
			var pertialFeedback=$rootScope.CourseContent.try_feedback;
			var incorrectFeedback=$rootScope.CourseContent.incorrect_feedback;

            scope.feedbackToggle = false;
            scope.buttonText = $rootScope.CourseContent.submitText;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
			scope.myAnsText = $rootScope.CourseContent.myAns;
            maxAttempt = $rootScope.CourseContent.maximumAttempt;
            scope.feedback = "";
            scope.question = $rootScope.CourseContent.question;
			scope.options = $rootScope.CourseContent.options;
			scope.maxDropItem = Number($rootScope.CourseContent.maxDropItem);
            scope.userAnswer = [];
			scope.disableButton = true;
			scope.showAnser = false;
			scope.myAnswer = false;
			scope.failed = false;
			
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
            }
			
            scope.start = function () 
			{
				$rootScope.disableBackBtn=true;
                for(var i=1; i<=noOfDragable; i++){
					option.push("#draggable_"+i) // Number of draggable obbjects 
				}
				
				for(var i=1; i<=noOfDragable; i++){
					correctAnswer.push($rootScope.CourseContent.options[i-1].dropIndex);
					$("#target_"+i).data( "id", 0 ); 
					$("#draggable_"+i).data( "id", 0 );
					$( "#draggable_"+i).data({
						'originalLeft': $( "#draggable_"+i).css('left'),
						'origionalTop': $( "#draggable_"+i).css('top')
					});
					$("#draggable_"+i ).draggable(dragOpts);
					$("#draggable_"+i ).draggable({
						drag: function() {
							$(this).css({cursor: 'move',zIndex: 99999 });
							$(this).find('p').addClass('onDrag')
							var drag_id=$(this).data("id");
							//console.log("drag_id "+drag_id)
							$('#cart_'+drag_id).css('overflow','visible')
						},
						revert: function(Obj ){
							
							if(Obj==false){
								var dragedId= this.attr("id").split("_")[1];
								var targetId=$("#draggable_"+dragedId).data( "id")
								this.appendTo("#dragarea_"+dragedId);
								$("#draggable_"+dragedId).find('p').removeClass('afterDrag onDrag');
								$("#target_"+targetId).droppable("enable");
							   
								// Toggle drag indicator
								if($('#cart_'+targetId).children().length==1)
									$("#cart_"+targetId).find('.cart').css('display','none');
							   
								this.css({top:0,left:0});
								$("#draggable_"+dragedId).data( "id", 0 ); 
								checkSubmitEnable();
								scope.showOption(dragedId); // Shows the next draggable object
								
							}
							$('.Caart').css('overflow','hidden')
							checkSubmitEnable();
						}
					});  
				
					$("#target_"+i).droppable
					({
						accept:option.toString(), 
						drop: function(event, ui) 
						{
							var dragedId= parseInt(ui.draggable.attr("id").split("_")[1]); 
							var targetId=event.target.id.split("_")[1];

							$('.Caart').css('overflow','hidden')
							if($('#cart_'+targetId).children().length==scope.maxDropItem+1){
								$("#draggable_"+dragedId).appendTo("#dragarea_"+dragedId);
								$("#draggable_"+dragedId).css({'top':'0px','left':'0px','margin':'0px'})
								$("#target_"+targetId).droppable("enable");
								$("#draggable_"+dragedId).find('p').removeClass('afterDrag onDrag');
								scope.showOption(dragedId+1);
								$("#draggable_"+dragedId).data( "id", 0 ); 
								return true;
							}
									
							$("#target_"+targetId).droppable("enable");
							$("#draggable_"+dragedId).data( "id", $(this).attr("id").split("_")[1] );
							$(this).data( "id", targetId ); // set the dragged object's id to target object
							$(ui.draggable).find('p').removeClass('onDrag').addClass('afterDrag');
							$("#cart_"+targetId).find('.cart').css('display','block'); // Toggle drag indicator
							var children=$('#cart_'+targetId).children().length;
							console.log(children)
							$(ui.draggable).appendTo($("#cart_"+targetId))
								.css({ 'display':'inline-block' ,'top':function(){
									if(children == 1){
										return "32px";
									}else{
										return "115px";										
									}
								}, 'position':'absolute', 'margin':'0px 5px 5px 5px', 'left':'7px'}) // Custom CSS for dragged object
								.draggable('option', 'disabled', false)
								 if(submitEnable==0)
									 checkSubmitEnable();
								 $(".btn-reset").attr("disabled", false);
								 scope.showOption(dragedId+1);
						}
					});
				}
				totalCorrectAns=correctAnswer.length;
				scope.showOption(1);
			}
			
			scope.showOption=function(id){
				//$('.dragHolder').hide();
				//console.log("sub = "+isSubmitBtnEnable())
				var cnt=0;
			    for(var i=1; i<=noOfDragable; i++){
					//console.log($("#draggable_"+i).data( "id" ))
					if($("#draggable_"+i).data( "id" )==0){
						$('#dragHolder_'+i).show();
						return true;
					}
				}	   
			}
			
			scope.onResetClick=function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).appendTo("#dragarea_"+i);
					$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
					$( "#target_"+i).removeClass('redBorder').removeClass('greenBorder');
					$("#target_"+i).droppable("enable");
					$("#target_"+i).data( "id",0);
					$("#draggable_"+i).data( "id",0);


					$("#draggable_"+i).find('p').removeClass('afterDrag onDrag');
			   }
			   $("#cart_1 ,#cart_2, #cart_3, #cart_4").find('.cart').css('display','none');
			   scope.showOption(1);
			   if(submitEnable==0)
			   $(".btn-submit").attr("disabled", true);
			   $(".btn-reset").attr("disabled", true);
			}

			scope.onShowAnsClick=function()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
				//scope.showAnser= false;
				//scope.feedbackToggle = false;
				$(".next img").addClass("done");
				$rootScope.isNextButtonDisabled = false;
				if(scope.showAnsText == $rootScope.CourseContent.showAns){
					for(var i=1; i<=noOfDragable; i++){
						$("#draggable_"+i).appendTo("#cart_"+correctAnswer[i-1]);
						$( "#draggable_"+i).addClass('greenBorder').removeClass('redBorder'); 
					}
					$(".Caart").each(function(ind,ele){
						$(ele).find(".ui-draggable").each(function(_ind,_ele){
							if(_ind%2 == 0){
								$(_ele).css("top","32px");
							}else{
								$(_ele).css("top","115px");
							}
						});
					});
					scope.showAnsText =$rootScope.CourseContent.showAns;
					
				}
				else
				{
					scope.onMyAnsClick();
					
					scope.showAnsText = $rootScope.CourseContent.showAns;
				}
				scope.myAnswer = true;
			}
			
			scope.onMyAnsClick = function()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
				$( ".droppable-item").removeClass('greenBorder'); 
				for(var i=1; i<=noOfDragable; i++)
				{
					var targetId = $("#draggable_"+i).data( "id" );
					$("#draggable_"+i).appendTo("#cart_"+targetId);
					
					if($( "#draggable_"+i).data("id" )== correctAnswer[i-1])
						$( "#draggable_"+i).addClass('greenBorder').removeClass('redBorder'); 
					else if($( "#draggable_"+i).data("id" )==$rootScope.CourseContent.options[i-1].optional)
						$( "#draggable_"+i).addClass('greenBorder').removeClass('redBorder'); 
					else 
						$( "#draggable_"+i).addClass('redBorder').removeClass('greenBorder');
				}
				$(".Caart").each(function(ind,ele){
						$(ele).find(".ui-draggable").each(function(_ind,_ele){
							if(_ind%2 == 0){
								$(_ele).css("top","32px");
							}else{
								$(_ele).css("top","115px");
							}
						});
				});
				scope.myAnswer = false;
			}
			
			function checkSubmitEnable()
			{
			   if(isSubmitBtnEnable())
					$(".btn-submit").attr("disabled", false);
				else
					$(".btn-submit").attr("disabled", true);
			}
			
			function isSubmitBtnEnable()
			{
				var cnt=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "id" )!=0)
					  cnt++;
			   if(cnt==0)
					$(".btn-reset").attr("disabled", true);	
			   
			   if(cnt==noOfDragable)
			   {
				   return true;
			   }else{
				   return false;
			   }
			  
			}
			
			scope.onSubmitClick=function()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
				if (scope.buttonText == $rootScope.CourseContent.submitText) {
				$(".btn-reset").attr("disabled", true);
				var correctAns=0;
				var inCorrectAns=0;
				disableOption();
				if(attrs.feedback == "true")
					scope.feedbackToggle = true;
				for(var i=1; i<=noOfDragable; i++){
				    $( "#draggable_"+i).draggable( 'disable' )
					if($( "#draggable_"+i).data("id" )== correctAnswer[i-1] ){
						if(showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#draggable_"+i).addClass('greenBorder'); 
						correctAns++;
					}else if($( "#draggable_"+i).data("id" )==$rootScope.CourseContent.options[i-1].optional){
						if(showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#draggable_"+i).addClass('greenBorder'); 
						correctAns++;
					}else{
						inCorrectAns++;
						if (showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#draggable_"+i).addClass('redBorder');
					}
			   }
			   if(correctAns==totalCorrectAns && inCorrectAns==0 ){
				   $(".btn-submit").attr("disabled", true);
				   feedbackSetText(correctFeedback);
				   showCorrectAns();
				   $(".next img").addClass("done");
				   $rootScope.isNextButtonDisabled = false;
				   $rootScope.markVisitedPage();
				   
			   }
			   else{
				   
				   scope.failed=true;
				   if(curretAttempt<maxAttempt){
						 scope.buttonText = $rootScope.CourseContent.tryAgainText;
						 feedbackSetText(pertialFeedback);
				   }else{
						$(".btn-submit").attr("disabled", true);
						//$(".btn-submit").hide();
						feedbackSetText(incorrectFeedback);
						scope.showAnser= true;
						$rootScope.markVisitedPage();
						$(".btn-show-ans").attr("disabled", false);
				   }
			   }
			   }else
			   {
					$("#cart_1 ,#cart_2, #cart_3, #cart_4").find('.cart').css('display','none');
					curretAttempt++;
					scope.feedbackToggle = false;
					//$(".btn-reset").attr("disabled", true);
					//$(".btn-submit").hide();
					enableOption()
				   for(var i=1; i<=noOfDragable; i++)
				   {
					    $( "#draggable_"+i).draggable( 'enable' )
						$("#draggable_"+i).appendTo("#dragarea_"+i);
						$("#draggable_"+i).css("margin","5px");
						$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
						$( "#target_"+i).removeClass('redBorder');
						$( "#target_"+i).removeClass('greenBorder');
						//$("#target_"+i).css("border","#666666 dashed thin");
						$("#target_"+i).droppable("enable");
						$("#target_"+i).data( "id",0);
						$("#draggable_"+i).data( "id",0);
						$("#draggable_"+i).css({'width': '500px','margin':'0px'})
						$("#draggable_"+i).find('p').removeClass('afterDrag onDrag');
				   }
				   if(submitEnable==0)
				   $(".btn-submit").attr("disabled", true);
				   scope.buttonText = $rootScope.CourseContent.submitText;
				   
				   scope.showOption(1);
				  
			   
			   }
			}

			function disableOption(){
				for(var i=1; i<=noOfDragable; i++){
					$("#draggable_"+i).draggable("disable").css("cursor","default");
				}
			}
			
			function feedbackSetText(value){
				scope.feedback=value;
				//console.log("----------------")
				//console.log(scope.feedback)
			}
			
			function enableOption(){
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).draggable("enable").css("cursor","move");;
				}
			}

			function showCorrectAns(){
				 for(var i=1; i<=noOfDragable; i++)
				 {
					$( "#draggable_"+i).addClass('greenBorder'); 
				 } 	
			}

						
           $timeout(function(){
				scope.start();
		   },1000);
	//---- For Ipad
	(function ($) {
		// Detect touch support
		$.support.touch = 'ontouchend' in document;
		// Ignore browsers without touch support
		if (!$.support.touch) {
		return;
		}
		var mouseProto = $.ui.mouse.prototype,
			_mouseInit = mouseProto._mouseInit,
			touchHandled;

		function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
		// Ignore multi-touch events
			if (event.originalEvent.touches.length > 1) {
				return;
			}
		event.preventDefault(); //use this to prevent scrolling during ui use

		var touch = event.originalEvent.changedTouches[0],
			simulatedEvent = document.createEvent('MouseEvents');
		// Initialize the simulated mouse event using the touch event's coordinates
		simulatedEvent.initMouseEvent(
			simulatedType,    // type
			true,             // bubbles                    
			true,             // cancelable                 
			window,           // view                       
			1,                // detail                     
			touch.screenX,    // screenX                    
			touch.screenY,    // screenY                    
			touch.clientX,    // clientX                    
			touch.clientY,    // clientY                    
			false,            // ctrlKey                    
			false,            // altKey                     
			false,            // shiftKey                   
			false,            // metaKey                    
			0,                // button                     
			null              // relatedTarget              
			);

		// Dispatch the simulated event to the target element
		event.target.dispatchEvent(simulatedEvent);
		}
		mouseProto._touchStart = function (event) {
		var self = this;
		// Ignore the event if another widget is already being handled
		if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
			return;
		}
		// Set the flag to prevent other widgets from inheriting the touch event
		touchHandled = true;
		// Track movement to determine if interaction was a click
		self._touchMoved = false;
		// Simulate the mouseover event
		simulateMouseEvent(event, 'mouseover');
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		// Simulate the mousedown event
		simulateMouseEvent(event, 'mousedown');
		};
 
		mouseProto._touchMove = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Interaction was not a click
		this._touchMoved = true;
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		};
		mouseProto._touchEnd = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Simulate the mouseup event
		simulateMouseEvent(event, 'mouseup');
		// Simulate the mouseout event
		simulateMouseEvent(event, 'mouseout');
		// If the touch interaction did not move, it should trigger a click
		if (!this._touchMoved) {
		  // Simulate the click event
		  simulateMouseEvent(event, 'click');
		}
		// Unset the flag to allow other widgets to inherit the touch event
		touchHandled = false;
		};
		mouseProto._mouseInit = function () {
		var self = this;
		// Delegate the touch handlers to the widget's element
		self.element
			.on('touchstart', $.proxy(self, '_touchStart'))
			.on('touchmove', $.proxy(self, '_touchMove'))
			.on('touchend', $.proxy(self, '_touchEnd'));
		// Call the original $.ui.mouse init method
		_mouseInit.call(self);
    };
})(jQuery);


        }
    }
});


FrameworkApp.directive('dragdropa', function ($rootScope,$timeout) {
     return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
			scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
			
            var template = attrs.templateUrl;
			var ansArr = [];
			
			
			var option =[];
			var totalCorrectOpt=0;
			var totalCorrectAns=0;
			var curretAttempt=1;
			var correctAns=0;
			var dragOpts = {
				 cursor: 'move',
				zIndex: 99999 };
				
			scope.attempt = 0;
            scope.feedback = "";
            scope.dragCounter = 0;
            scope.userAnswer = [];
			
			
            // JSON Data
			var showAnswer=$rootScope.CourseContent.showAnswer;
			var maxAttempt= $rootScope.CourseContent.maximumAttempt;
			var noOfDragable=$rootScope.CourseContent.question.length;
			var showMarkerInAttempt = $rootScope.CourseContent.showMarkerInAttempt;
			scope.correctFeedback=$rootScope.CourseContent.correct_feedback;
			var pertialFeedback=$rootScope.CourseContent.try_feedback;
			var incorrectFeedback=$rootScope.CourseContent.incorrect_feedback;
			var submitEnable=$rootScope.CourseContent.submitEnable;
			
            scope.buttonText = $rootScope.CourseContent.submitText;
            scope.instruction_text = $rootScope.CourseContent.instruction_text;
            scope.pageHeading = $rootScope.CourseContent.pageHeading;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
            scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
			scope.question = $rootScope.CourseContent.question;
			scope.para1 = $rootScope.CourseContent.para1;
			scope.para2 = $rootScope.CourseContent.para2;
			// Boolean variable
			scope.disableButton = true;
			scope.showAnser= false;
			scope.feedbackToggle = false;
			scope.showFeedBack=false;
			for(var i=1; i<=noOfDragable; i++){
				option.push("#draggable_"+i)
			}
			
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
            }

            scope.start = function () 
			{
                
				for(var i=1; i<=noOfDragable; i++)
				{
					ansArr.push($rootScope.CourseContent.question[i-1].dropIndex);
					if($rootScope.CourseContent.question[i-1].dragText!="" && $rootScope.CourseContent.question[i-1].dropText!=""){
						totalCorrectOpt++;
					}
					$("#draggable_"+i).data( "ans", 0 ); // user answer
					$( "#draggable_"+i).data({
						'originalLeft': $( "#draggable_"+i).css('left'),
						'origionalTop': $( "#draggable_"+i).css('top')
					});
					$("#draggable_"+i ).draggable(dragOpts);
					$("#draggable_"+i ).draggable({
						drag: function() {
							$(this).css({cursor: 'move',zIndex: 99999 });
						},
						revert: function(Obj )
						{
							if(Obj==false)
							{
								var dragedId= this.attr("id").split("_")[1];
								var targetId=$("#draggable_"+dragedId).data( "ans")
								this.appendTo("#dragarea_"+dragedId);
								$("#target_"+targetId).droppable("enable");
								//$("#target_"+targetId).css("border","#666666 dashed thin");
								//this.animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
								this.css({top:0,left:0});
								$("#draggable_"+dragedId).data( "ans", 0 ); //reseting the user answer while dragging back 
								//$(this).html("<p class='drophere'>Drop here </p>");
							}
							checkSubmitEnable();
						}
					});  
					
					$("#target_"+i).droppable
					({
						accept:"#draggable_"+i, 
						drop: function(event, ui) 
						{
							 //scope.disableButton = false;
							var dragedId= ui.draggable.attr("id").split("_")[1]; 
							var targetId=$("#draggable_"+dragedId).data( "id")
							$("#target_"+targetId).droppable("enable");
							//$("#target_"+targetId).css("border","#666666 dashed thin");
							
							// Enable Previous dropable object.
							var prevId=$("#draggable_"+dragedId).data( "ans");
							$("#target_"+prevId).droppable("enable");
							 
							$("#draggable_"+dragedId).data( "ans", $(this).attr("id").split("_")[1] );
							$(this).html("");
							$(ui.draggable).appendTo($(this))
								 .css({'vertical-align': 'middle', 'display':'table-cell' , top:'0px', left:'0px'})
								 .draggable('option', 'disabled', true)
								//.css({position:'relative'});
								 checkSubmitEnable();
								 $(this).droppable('disable')
								// $(this).css("border","none");
							 $(this).addClass('greenBorder');
							$(".btn-reset").attr("disabled", false);
							checkForResult();
						}
					});
				}
				totalCorrectAns=ansArr.length;
			//	$rootScope.attachStyle();
			}
			scope.onResetClick=function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				for(var i=1; i<=noOfDragable; i++)
				{
					//console.log("000")
					$("#draggable_"+i).appendTo("#dragarea_"+i);
					$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
					$( "#target_"+i).removeClass('redBorder');
					$( "#target_"+i).removeClass('greenBorder');
				    //$("#target_"+i).css("border","#666666 dashed thin");
					$("#target_"+i).droppable("enable");
					$("#draggable_"+i).data( "ans",0)
					
			   }
			  
			   $(".btn-submit").attr("disabled", true);
			   $(".btn-reset").attr("disabled", true);
			}
			scope.onShowAnsClick=function()
			{
				$rootScope.checkInternet($rootScope.selectedLang);
				//visibility(showBtn,false);
				//visibility(myansButton,true);
				$( ".droppable-item").removeClass('greenBorder redBorder'); 
				 scope.feedbackToggle = false;
				
				if(scope.showAnsText == $rootScope.CourseContent.showAns){
					//console.log('noOfDragable '+noOfDragable)
					for(var i=1; i<=noOfDragable; i++){
						if(ansArr[i-1]!=0){
							//console.log("#draggable_"+i)
							$("#draggable_"+i).appendTo("#target_"+ansArr[i-1]);
							$("#target_"+ansArr[i-1]).find('.drophere').remove();
							$("#draggable_"+i).css({top:'0px',left:'0px',margin:0});
							$( "#target_"+ansArr[i-1]).removeClass('redBorder');
							$( "#target_"+ansArr[i-1]).addClass('greenBorder');
						}
						else if($rootScope.CourseContent.question[i-1].dropText==""){
							$("#draggable_"+i).appendTo("#dragarea_"+i);
							$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
						
						}
					}
					scope.showAnsText =$rootScope.CourseContent.myAns;
				}
				else
				{
					resetPosition();
					onMyAnsClick();
					scope.showAnsText = $rootScope.CourseContent.showAns;
				}
			}
			function resetPosition ()
			{
				for(var i=1; i<=noOfDragable; i++){
						$("#draggable_"+i).appendTo("#dragarea_"+i);
				}
			}
			function onMyAnsClick()
			{
				$( ".droppable-item").removeClass('greenBorder redBorder'); 
				
				for(var i=1; i<=noOfDragable; i++)
				{
					var targetId = $("#draggable_"+i).data( "ans" );
					//console.log(("#draggable_"+i)+" targetId "+targetId)
					$("#draggable_"+i).appendTo("#target_"+targetId);
					if(ansArr[i-1]!=0){
						if(targetId== ansArr[i-1])
							$( "#target_"+targetId).addClass('greenBorder'); 
						else 
							$( "#target_"+targetId).addClass('redBorder');
					}else if($rootScope.CourseContent.question[i-1].dropText==""){
						if(targetId== ansArr[i-1])
							$( "#target_"+targetId).addClass('greenBorder'); 
						else 
							$( "#target_"+targetId).addClass('redBorder');	
					}
					
				}
			}
			
			function checkSubmitEnable()
			{
			   var cnt=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "ans" )!=0)
					  cnt++; 
				 // console.log(cnt)
			   if(cnt==0)
					$(".btn-reset").attr("disabled", true);		
				
			   if(cnt>=submitEnable)
			   {
				    $(".btn-submit").attr("disabled", false);
			   }else
			   {
				   $(".btn-submit").attr("disabled", true);
			   }
			   
			}
			
			function checkForResult()
			{
			   var cnt=0;
			   var correctAns=0;
			   var inCorrectAns=0;
			   for(var i=1; i<=noOfDragable; i++)
				   if($("#draggable_"+i).data( "ans" )!=0)
					  cnt++; 
				  
			   
			   for(var i=1; i<=noOfDragable; i++){
					var droppedObjId=$( "#draggable_"+i).data("ans" );
					
					if($( "#draggable_"+i).data("ans" )== ansArr[i-1] && $( "#draggable_"+i).data("ans" )!= 0){
						correctAns++;
					}else if($( "#draggable_"+i).data("ans" )!= 0){
						inCorrectAns++;
					}
			   }
			   //console.log(correctAns + " == "+totalCorrectOpt + " == "+ inCorrectAns)
			   if(correctAns==totalCorrectOpt && inCorrectAns==0 ){
					scope.showFeedBack=true;
					$rootScope.markVisitedPage();
					scope.$apply();
			   }
			   
			}
			
			scope.onSubmitClick=function()
			{
				if (scope.buttonText == $rootScope.CourseContent.submitText) {
				$(".btn-reset").attr("disabled", true);
				//$(".btn-submit").attr("disabled", true);
				
				
				disableOption();
				
				 if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
				
				for(var i=1; i<=noOfDragable; i++){
					var droppedObjId=$( "#draggable_"+i).data("ans" );
					
					if($( "#draggable_"+i).data("ans" )== ansArr[i-1] && $( "#draggable_"+i).data("ans" )!= 0){
						if(showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#target_"+droppedObjId).addClass('greenBorder'); 
						correctAns++;
					}else if($( "#draggable_"+i).data("ans" )!= 0){
						inCorrectAns++;
						if (showMarkerInAttempt ==  curretAttempt || showMarkerInAttempt == 0)
						$( "#target_"+droppedObjId).addClass('redBorder');
					}
			   }
			  // console.log(correctAns+"=*****="+totalCorrectOpt)
			   if(correctAns==totalCorrectOpt && inCorrectAns==0 ){
				  // visibility(resumeBtn,true);
				  $(".btn-submit").attr("disabled", true);
				   feedbackSetText(correctFeedback);
				    $rootScope.markVisitedPage();
				   //showCorrectAns();
			   }
			   else{
				   if(curretAttempt<maxAttempt){
						 scope.buttonText = $rootScope.CourseContent.tryAgainText;
						 feedbackSetText(pertialFeedback);
				   }
				   else{
						$(".btn-submit").attr("disabled", true);
						feedbackSetText(incorrectFeedback);
						scope.showAnser= true;
						 $rootScope.markVisitedPage();
						$(".btn-show-ans").attr("disabled", false);
						//visibility(resumeBtn,true);
				   }
			   }
			   }else
			   {
			   
					curretAttempt++;
					scope.feedbackToggle = false;
					$(".btn-reset").attr("disabled", true);
					enableOption()
				   for(var i=1; i<=noOfDragable; i++)
				   {
						$("#draggable_"+i).appendTo("#dragarea_"+i);
						$("#draggable_"+i).css("margin","5px");
						$( "#draggable_"+i).animate({top:0,left:0},{duration:600,easing:'easeOutBack'});
						$( "#target_"+i).removeClass('redBorder');
						$( "#target_"+i).removeClass('greenBorder');
						//$("#target_"+i).css("border","#666666 dashed thin");
						$("#target_"+i).droppable("enable");
						$("#draggable_"+i).data( "ans",0);
				   }
				  
				  $(".btn-submit").attr("disabled", true);
				   scope.buttonText = $rootScope.CourseContent.submitText;
			   
			   }
			}

			function disableOption(){
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).draggable("disable").css("cursor","default");
				}
			}
			function feedbackSetText(value)
			{
				scope.feedback=value;
			}
			function enableOption(){
				for(var i=1; i<=noOfDragable; i++)
				{
					$("#draggable_"+i).draggable("enable").css("cursor","move");;
				}
			}

			function showCorrectAns(){
				
				 for(var i=1; i<=noOfDragable; i++)
				 {
					$( "#draggable_"+i).addClass('greenBorder'); 
				 } 	
			}

						
          $timeout(function(){
					scope.start();
			 },1000);
	//---- For Ipad
	(function ($) {
		// Detect touch support
		$.support.touch = 'ontouchend' in document;
		// Ignore browsers without touch support
		if (!$.support.touch) {
		return;
		}
		var mouseProto = $.ui.mouse.prototype,
			_mouseInit = mouseProto._mouseInit,
			touchHandled;

		function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
		// Ignore multi-touch events
			if (event.originalEvent.touches.length > 1) {
			return;
			}
		event.preventDefault(); //use this to prevent scrolling during ui use

		var touch = event.originalEvent.changedTouches[0],
			simulatedEvent = document.createEvent('MouseEvents');
		// Initialize the simulated mouse event using the touch event's coordinates
		simulatedEvent.initMouseEvent(
			simulatedType,    // type
			true,             // bubbles                    
			true,             // cancelable                 
			window,           // view                       
			1,                // detail                     
			touch.screenX,    // screenX                    
			touch.screenY,    // screenY                    
			touch.clientX,    // clientX                    
			touch.clientY,    // clientY                    
			false,            // ctrlKey                    
			false,            // altKey                     
			false,            // shiftKey                   
			false,            // metaKey                    
			0,                // button                     
			null              // relatedTarget              
			);

		// Dispatch the simulated event to the target element
		event.target.dispatchEvent(simulatedEvent);
		}
		mouseProto._touchStart = function (event) {
		var self = this;
		// Ignore the event if another widget is already being handled
		if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
			return;
		}
		// Set the flag to prevent other widgets from inheriting the touch event
		touchHandled = true;
		// Track movement to determine if interaction was a click
		self._touchMoved = false;
		// Simulate the mouseover event
		simulateMouseEvent(event, 'mouseover');
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		// Simulate the mousedown event
		simulateMouseEvent(event, 'mousedown');
		};

		mouseProto._touchMove = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
			}
		// Interaction was not a click
		this._touchMoved = true;
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		};
		mouseProto._touchEnd = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Simulate the mouseup event
		simulateMouseEvent(event, 'mouseup');
		// Simulate the mouseout event
		simulateMouseEvent(event, 'mouseout');
		// If the touch interaction did not move, it should trigger a click
		if (!this._touchMoved) {
		  // Simulate the click event
		  simulateMouseEvent(event, 'click');
		}
		// Unset the flag to allow other widgets to inherit the touch event
		touchHandled = false;
		};
		mouseProto._mouseInit = function () {
		var self = this;
		// Delegate the touch handlers to the widget's element
		self.element
			.on('touchstart', $.proxy(self, '_touchStart'))
			.on('touchmove', $.proxy(self, '_touchMove'))
			.on('touchend', $.proxy(self, '_touchEnd'));
		// Call the original $.ui.mouse init method
		_mouseInit.call(self);
    };
})(jQuery);


        }
    }
});
FrameworkApp.directive('customHotSpot', function () {
	var tempVisited = '';
    return {
        restrict: 'CA',
        link: function ($scope, $rootScope, elem, attrs) {
			
        },
        controller: function ($scope, $rootScope,$timeout) {	
			$scope.showFeedback=false;
			$scope.selectOption = function(event){
				$(event.currentTarget).addClass('selectedOption');
				$('.btn2').removeClass('disabled')
				if($(".selectedOption").length >=5){
					$scope.showGiveUp = false;
					$("#showGiveUp").hide();						
				}
			};
		
			$scope.submitOption = function(event){
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.showFeedback=true;
				if($(".selectedOption").length ==  $rootScope.CourseContent.screen_2_table.correct_ans)
					$scope.isCorrect=true;
				else
					$scope.isCorrect=false;
				
				$rootScope.markVisitedPage();
			};
			
			$scope.getClass = function(id,showFeedback){
				
				if(id==2 || showFeedback)
					if(id!=1)
					return 'grayout';
			}
		}
	}
});



FrameworkApp.directive('dragdrop', function ($rootScope,$timeout) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var correctCards = 0;
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            scope.feedbackToggle = false;
            scope.buttonText = $rootScope.CourseContent.submitText;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
            scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
            scope.attempt = 1;
            scope.feedback = "";
            scope.question = $rootScope.CourseContent.question;
            scope.dragCounter = 0;
            scope.userAnswer = [];
			scope.answerTable = false;
			scope.correctAnswerConent = '';
			scope.showAns = false;
			var userAnswerRecord = [];
			var userAnsweredIndex = [];
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
            }

			/* window.onresize = function(){
				if($rootScope.CourseContent.question != undefined)
					scope.resetOptions();
			} */
            scope.start = function () {
                // Hide the success message
                // Reset the game
                correctCards = 0;
                // Create the pile of shuffled cards
                var numbers = [];
                for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                    numbers.push($rootScope.CourseContent.question[i].dropIndex)
                }
				
                var timer = $timeout(function(){
                    $(".droppable-item").droppable({
                        accept: '.draggable-item',
                        hoverClass: 'hovered',
                        drop: handleCardDrop
                    });

                    $(".draggable-item").draggable({
                        stack: '.draggable-item',
                        cursor: 'move',
                        revert: true
                    });

                    for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                        $("#card"+(i+1)).data({'originalLeft': $("#card"+(i+1)).css('left'),
                            'origionalTop': $("#card"+(i+1)).css('top')
                        });
                    }
                },500);
				
				scope.$on("$destroy", function() {
					if (timer) {
						$timeout.cancel(timer);
					}
				});
            }
			var c = 0;
            function handleCardDrop(event, ui) {
                scope.disableButton = false;
                var slotNumber = $(this).data('number');
                var cardNumber = ui.draggable.data('number');
                ui.draggable.draggable('disable');
                $(this).droppable('disable');
				var findClass = ui.draggable.attr('class').split(' ')[2].split('_')[1];
				var getOrderNumber = parseInt(findClass)
				$(ui.draggable).attr('style','');
				$(this).append(ui.draggable)
				userAnswerRecord.push(getOrderNumber);
				userAnsweredIndex.push(slotNumber);
				c++;
                ui.draggable.draggable('option', 'revert', false);
                if (slotNumber == cardNumber) {
                    correctCards++;
                    scope.userAnswer.push(1);
                }
                else{
                    scope.userAnswer.push(0);
                }
                scope.dragCounter++;				
                if(scope.dragCounter == $rootScope.CourseContent.question.length)
                    $(".btn-submit").removeAttr("disabled");
				if(scope.dragCounter >= 1)
					$(".btn-reset").removeAttr("disabled");
            }

            scope.checkAnswer = function(){
				$(".btn-reset").attr("disabled", true);
                if (scope.buttonText == $rootScope.CourseContent.submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
						//$(".feedback-panel").show();
                    if (correctCards == $rootScope.CourseContent.question.length) {
                        scope.feedback = $rootScope.CourseContent.correct_feedback;
                        scope.disableButton = true;
						$(".btn-reset").attr("disabled", true);
						scope.showAns = false;
						$(".btn-submit").attr("disabled", true);
						$rootScope.markVisitedPage();
                    }
                    else {
                        scope.feedback = $rootScope.CourseContent.incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.tryAgainText;
                        }else{							
							scope.showAns = true;
							$rootScope.markVisitedPage();
						}
						//scope.buttonResetText = scope.showAnsText;
						
                    }
                    if (attrs.tickmark == "true")
                        scope.checkUserAnswer();
                    scope.attempt++;
                }
                else{
                   /*  scope.feedbackToggle = false;
					$(".feedback-panel").hide();
                    scope.dragCounter = 0;
                    scope.userAnswer = [];
                    scope.feedback = "";
                    for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                        $("#card" + (i + 1)).css({
                                'left': $("#card" + (i + 1)).data('originalLeft'),
                                'top': $("#card" + (i + 1)).data('origionalTop')
                            }
                        );
                        $($(".ui-droppable")[i]).removeClass("correct");
                        $($(".ui-droppable")[i]).removeClass("in-correct");
                    }
                    $(".droppable-item").droppable('enable');
                    $(".draggable-item").draggable('enable');
					$(".draggable-item").draggable({revert: true});
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    $(".btn-submit").attr("disabled", true); */
					scope.resetOptions();
                }

                if (scope.attempt >= scope.maxAttempt) {
                    $(".btn-submit").attr("disabled", true);
                }
            }
			scope.tempAns = [];
			scope.resetOptions = function(){
				scope.feedbackToggle = false;
				scope.buttonText = $rootScope.CourseContent.submitText
				correctCards = 0;
				$(".btn-reset").attr("disabled", true);
				scope.dragCounter = 0;
				scope.userAnswer = [];
				for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
					/* $("#card" + (i + 1)).css({
							'left': $("#card" + (i + 1)).data('originalLeft'),
							'top': $("#card" + (i + 1)).data('origionalTop')
						}
					); */
					$($('.containDrags')[i]).append($('.drgblItem_'+(i+1)));
					//console.log($('#card'+(i+1)))
				}
				$(".droppable-item").droppable('enable');
				$(".draggable-item").draggable('enable');
				$(".draggable-item").draggable({revert: true});
				$(".btn-submit").attr("disabled", true);
				$(".ui-droppable").removeClass("correct");
				$(".ui-droppable").removeClass("in-correct");
				/* $(".feedback-panel").hide();
				scope.feedbackToggle = false; */
				userAnswerRecord = [];
				userAnsweredIndex = [];				
			}
			//scope.showAns = true;
			scope.tempAns = [];
			var answerShown = false;
			scope.showAnswer = function(){
				if(answerShown){
					//console.log(userAnswerRecord)
					//console.log(userAnsweredIndex)
					for(var i = 0; i < scope.question.length ; i++){
						//console.log()
						var drElement = $('[data-order='+userAnsweredIndex[i]+']');
						$(drElement).appendTo($('#target'+userAnswerRecord[i]));
					}
					//console.log($("#card"+userAnswerRecord[0]))
					answerShown = false; 
					scope.showAnsText = "SHOW ANSWER";
				}else{
					for(var i = 1; i <= scope.question.length ; i++){
						$("#card"+i).appendTo($("#target"+i));
					}
					answerShown = true;
					scope.showAnsText = "MY ANSWER";
				}
				$(".ui-droppable").removeClass("correct");
				$(".ui-droppable").removeClass("in-correct");
				scope.feedbackToggle = false;
				
			};
			
			
			
			scope.closeAnswerTable = function(){
				scope.answerTable = false;
			}
		
            scope.checkUserAnswer = function () {
				$(".btn-show-ans").attr("disabled", false);
                for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                    if(scope.userAnswer[i] ==1)
                        $($(".ui-droppable")[i]).addClass("correct");
                    else
                        $($(".ui-droppable")[i]).addClass("in-correct");
                }
            };
            scope.start();
	//---- For Ipad
	(function ($) {
		// Detect touch support
		$.support.touch = 'ontouchend' in document;
		// Ignore browsers without touch support
		if (!$.support.touch) {
		return;
		}
		var mouseProto = $.ui.mouse.prototype,
			_mouseInit = mouseProto._mouseInit,
			touchHandled;

		function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
		// Ignore multi-touch events
			if (event.originalEvent.touches.length > 1) {
			return;
			}
		event.preventDefault(); //use this to prevent scrolling during ui use

		var touch = event.originalEvent.changedTouches[0],
			simulatedEvent = document.createEvent('MouseEvents');
		// Initialize the simulated mouse event using the touch event's coordinates
		simulatedEvent.initMouseEvent(
			simulatedType,    // type
			true,             // bubbles                    
			true,             // cancelable                 
			window,           // view                       
			1,                // detail                     
			touch.screenX,    // screenX                    
			touch.screenY,    // screenY                    
			touch.clientX,    // clientX                    
			touch.clientY,    // clientY                    
			false,            // ctrlKey                    
			false,            // altKey                     
			false,            // shiftKey                   
			false,            // metaKey                    
			0,                // button                     
			null              // relatedTarget              
			);

		// Dispatch the simulated event to the target element
		event.target.dispatchEvent(simulatedEvent);
		}
		mouseProto._touchStart = function (event) {
		var self = this;
		// Ignore the event if another widget is already being handled
		if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
			return;
		}
		// Set the flag to prevent other widgets from inheriting the touch event
		touchHandled = true;
		// Track movement to determine if interaction was a click
		self._touchMoved = false;
		// Simulate the mouseover event
		simulateMouseEvent(event, 'mouseover');
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		// Simulate the mousedown event
		simulateMouseEvent(event, 'mousedown');
		};

		mouseProto._touchMove = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
			}
		// Interaction was not a click
		this._touchMoved = true;
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		};
		mouseProto._touchEnd = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Simulate the mouseup event
		simulateMouseEvent(event, 'mouseup');
		// Simulate the mouseout event
		simulateMouseEvent(event, 'mouseout');
		// If the touch interaction did not move, it should trigger a click
		if (!this._touchMoved) {
		  // Simulate the click event
		  simulateMouseEvent(event, 'click');
		}
		// Unset the flag to allow other widgets to inherit the touch event
		touchHandled = false;
		};
		mouseProto._mouseInit = function () {
		var self = this;
		// Delegate the touch handlers to the widget's element
		self.element
			.on('touchstart', $.proxy(self, '_touchStart'))
			.on('touchmove', $.proxy(self, '_touchMove'))
			.on('touchend', $.proxy(self, '_touchEnd'));
		// Call the original $.ui.mouse init method
		_mouseInit.call(self);
    };
})(jQuery);


        }
    }
});
FrameworkApp.directive('mamccyu', function ($rootScope,$timeout) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            scope.selection = 1;
            scope.correctAnswer = [];
            scope.userAnswer = [];
            scope.options = "";
            scope.disableButton = true;
            scope.isBranching = false;
            scope.start = function () {
                scope.id = 0;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
                scope.feedbackToggle = false;
                scope.buttonText = $rootScope.CourseContent.submitText;
                scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
                scope.disabletryAgain = false;
                scope.feedback = "";
//				$rootScope.attachStyle();
            };

            scope.onOptionSelected = function (pIndex) {
                if ($('input[name=answer]:checked').length > 1)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
                if ($("#options label").eq(pIndex).hasClass("option-selected")) {
                    $("#options label").eq(pIndex).removeClass("option-selected");
                }
                else {
                    $("#options label").eq(pIndex).addClass("option-selected");
                }
            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == true)
                        scope.correctAnswer.push(1);
                    else
                        scope.correctAnswer.push(0);
                }
            };

            scope.checkAnswer = function () {
                    var AnswerList = document.getElementsByName('answer');
                    for (var i = 0; i < AnswerList.length; i++) {
                        if (AnswerList[i].checked) {
                            scope.userAnswer.push(1);
                        }
                        else {
                            scope.userAnswer.push(0);
                        }
                    }
					//console.log(scope.userAnswer);
                    if (!$('input[name=answer]:checked').length) return;
				    var tottalCorrectAns = 0;
					var tottaluserAns = 0;
					var tottaluserIncorrectAnswer =0;
					for(var k = 0;k < scope.options.length;k++){
						if(scope.correctAnswer[k]==1){tottalCorrectAns++;}
						if(scope.correctAnswer[k]== scope.userAnswer[k] &&  scope.userAnswer[k] ==1){
							tottaluserAns++;							
						}						
						if(scope.userAnswer[k]==1){
							if(scope.userAnswer[k]!=scope.correctAnswer[k]){
							tottaluserIncorrectAnswer++;
							}							
						}					
					}
					scope.attempt++;
                  if (JSON.stringify(scope.correctAnswer) == JSON.stringify(scope.userAnswer)) {
							scope.feedback = $rootScope.CourseContent.correct_feedback;
							 scope.disabletryAgain = true;
							 $(".try-aggain").css("display","none");
							scope.disableButton = true;
							$rootScope.markVisitedPage();
							scope.checkUserAnswer();
                    }
					else{
						if(scope.attempt < scope.maxAttempt){
							scope.feedback = $rootScope.CourseContent.incorrect_feedback;
						}else{
							scope.feedback = $rootScope.CourseContent.partial_correct_feedback;
						}
					}
					if(scope.attempt >= scope.maxAttempt){
						  scope.disabletryAgain = true;
						  $(".try-aggain").css("display","none");
						  $rootScope.markVisitedPage();
						  scope.checkUserAnswer();
					}
					scope.disableInput = true;
									
				 if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
					
				$(".kc-option-label").css("cursor","default");
            };
			
			scope.resetOptions = function(){
				scope.correctAnswer = [];
				scope.getQuestion();
				scope.userAnswer = [];
				$(".kc-option-label").removeClass("option-selected");
				$('input[name=answer]:checked').attr('checked', false);
				scope.disableInput = false;		
				scope.feedbackToggle = false;	
				scope.disableButton = true;	
				$(".kc-option-label").css("cursor","pointer");
			};
			

            scope.checkUserAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                   // if (checkAnswer[i].checked) {
                        if (scope.correctAnswer[i] == 1) {
                            $(checkAnswer[i]).parent().addClass("correct")
                        }
						else if (checkAnswer[i].checked) {
                            $(checkAnswer[i]).parent().addClass("in-correct")
                        }
                   // }
                }
            };
            scope.start();
        }
    }

});

FrameworkApp.directive('mamccyu2', function ($rootScope,$timeout) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            scope.selection = 1;
            scope.correctAnswer = [];
            scope.userAnswer = [];
            scope.options = "";
            scope.disableButton = true;
            scope.isBranching = false;
            scope.start = function () {
                scope.id = 0;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
                scope.feedbackToggle = false;
                scope.buttonText = $rootScope.CourseContent.submitText;
                scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
                scope.disabletryAgain = false;
                scope.feedback = "";
//				$rootScope.attachStyle();
            };

            scope.onOptionSelected = function (pIndex) {
                if ($('input[name=answer]:checked').length > 1)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
                if ($("#options label").eq(pIndex).hasClass("option-selected")) {
                    $("#options label").eq(pIndex).removeClass("option-selected");
                }
                else {
                    $("#options label").eq(pIndex).addClass("option-selected");
                }
            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == true)
                        scope.correctAnswer.push(1);
                    else
                        scope.correctAnswer.push(0);
                }
            };

            scope.checkAnswer = function () {
                    var AnswerList = document.getElementsByName('answer');
                    for (var i = 0; i < AnswerList.length; i++) {
                        if (AnswerList[i].checked) {
                            scope.userAnswer.push(1);
                        }
                        else {
                            scope.userAnswer.push(0);
                        }
                    }
					//console.log(scope.userAnswer);
                    if (!$('input[name=answer]:checked').length) return;
				    var tottalCorrectAns = 0;
					var tottaluserAns = 0;
					var tottaluserIncorrectAnswer =0;
					for(var k = 0;k < scope.options.length;k++){
						if(scope.correctAnswer[k]==1){tottalCorrectAns++;}
						if(scope.correctAnswer[k]== scope.userAnswer[k] &&  scope.userAnswer[k] ==1){
							tottaluserAns++;							
						}						
						if(scope.userAnswer[k]==1){
							if(scope.userAnswer[k]!=scope.correctAnswer[k]){
								tottaluserIncorrectAnswer++;
							}							
						}					
					}
					scope.attempt++;
						if(tottalCorrectAns == tottaluserAns && tottaluserIncorrectAnswer==0 ){
								scope.feedback = $rootScope.CourseContent.correct_feedback;
								scope.disabletryAgain = true;
								$(".try-aggain").css("display","none");
								scope.checkUserAnswer();
								$rootScope.markVisitedPage();
						}
						else if(tottaluserAns>=1 && tottaluserIncorrectAnswer==0){
							scope.feedback = $rootScope.CourseContent.partial_correct_feedback;
								
						}
							else{
								scope.feedback = $rootScope.CourseContent["incorrect_feedback"+scope.attempt];
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}
							}
					if(scope.attempt >= scope.maxAttempt){
						  scope.disabletryAgain = true;
						  $(".try-aggain").css("display","none");
						  $rootScope.markVisitedPage();
						  scope.checkUserAnswer();
					}
					//console.log("scope.attempt ="+scope.attempt)
					//console.log("scope.maxAttempt ="+scope.maxAttempt)
					
					scope.disableInput = true;
									
				 if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
				$(".kc-option-label").css("cursor","default");
            };
			
			scope.resetOptions = function(){
				scope.correctAnswer = [];
				scope.getQuestion();
				scope.userAnswer = [];
				$(".kc-option-label").removeClass("option-selected");
				$('input[name=answer]:checked').attr('checked', false);
				scope.disableInput = false;		
				scope.feedbackToggle = false;	
				scope.disableButton = true;		
				$(".kc-option-label").css("cursor","pointer");				
			};
			

            scope.checkUserAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                   // if (checkAnswer[i].checked) {
                        if (scope.correctAnswer[i] == 1) {
                            $(checkAnswer[i]).parent().addClass("correct")
                        }
						else if (checkAnswer[i].checked) {
                            $(checkAnswer[i]).parent().addClass("in-correct")
                        }
                   // }
                }
            };
            scope.start();
        }
    }

});

FrameworkApp.directive('dragdropappropriate', function ($rootScope,$timeout,$interval) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            scope.attempt = 0;
			scope.correntAns = 0;
            scope.feedback = "";
            scope.question = $rootScope.CourseContent.question;
			scope.blinkBtn = true;
			scope.disableReset = true;
			scope.totalOptions ;
            if (attrs.assesment == "true"){
                $rootScope.isPrevButtonDisabled = true;
            }
			scope.id1="target1";
			scope.id2="target2";
			scope.cls1="draggable-item";

			var temp1 = 5;
			var temp2 = 5;
			scope.dragCounter = $rootScope.CourseContent.question.length-1;
			scope.totalOptions = $rootScope.CourseContent.question.length;
			var tempClass='';
			var currentElement = null;
			var uiItem = null;

            scope.start = function () {
				
				scope.feedbackToggle = false;
				scope.submitBtnToggle = false;
				scope.tryBtnToggle = false;
				scope.feedbackText = "";
                var numbers = [];
                for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                    numbers.push($rootScope.CourseContent.question[i].dropIndex)
                }
				//console.log($rootScope.CourseContent.question)			
               // $timeout(function(){
                    $("#"+scope.id1).droppable({
                        accept: '.draggable-item',
                        hoverClass: 'hovered',
                        drop: handleCardDrop1
                    });
					
					$("#"+scope.id2).droppable({
                        accept: '.draggable-item',
                        hoverClass: 'hovered',
                        drop: handleCardDrop2
                    });

                    $("."+scope.cls1).draggable({
                        stack: '.draggable-item',
                        cursor: 'move',
                        revert: reverFn,
						drag:function(){
							currentElement = $(this);
						}
                    });
					
					for (var i = 0; i < $rootScope.CourseContent.question.length; i++){
						$("#card"+(i+1)).data({'originalLeft': $("#card"+(i+1)).css('left'),
							'origionalTop': $("#card"+(i+1)).css('top'),
							'origionalHieght': $("#card"+(i+1)).css('height')
						});
						
					}
				
                // },500);
				
            }
			scope.popupToggle = false;
			scope.openPopup = function(){
				scope.popupToggle?scope.popupToggle = false:scope.popupToggle = true;
				scope.feedbackToggle = true;
				scope.blinkBtn = false;
				$rootScope.markVisitedPage();
			}
			
			function reverFn(bool){
				if(bool==false){
					var eleme = $(this);
					$(eleme).removeClass("ui-draggable-dragging");
					setTimeout(function(){
						$(eleme).removeAttr("style","");	
					});
					
					$(eleme).css({width:"295px","height":"79px"});
				}	
				return true;
			}
			
			function handleCardDrop1(event, ui){
					scope.disableReset = false;
					uiItem = ui;
				
				//	if($rootScope.CourseContent.question[dragCounter]["do"]){
						var dragId = $(this).parent().attr("id");
						//console.log(currentElement)
						$(currentElement).addClass("droped");
						if(dragId=="true")dragId=true; else dragId=false;
						if( dragId === ui.draggable.data("target")){
							scope.correntAns++;
							$(this).parent().data("ans","true")
						}else{
							$(this).parent().data("ans","false")
						}
						
						scope.dragCounter--;						
						ui.draggable.position({ of: $(this), my: 'top right', at: 'top right',using: function (css, calc) {
							css.top = temp1;
							/* alert(temp1);	 */
							css.left = '325px';
							css.width = '235px';
							//console.log($(this).height())
							temp1 += $(this).height()+10;
							$(this).css({
								height:($(this).height()+15)+'px',
								width:"219px"
							});
							$(this).animate(css, 200, 'linear');
						}});
						
						if(scope.dragCounter==-1){
							$timeout(function(){
							//	scope.feedbackToggle = true;
								$("#btn").prop("disabled", false);
								//scope.submitBtnToggle = true;
							},0);
						}
						ui.draggable.draggable('option', 'revert', false);
						ui.draggable.draggable('disable');
					//}			
				//	else{
					//	ui.draggable.draggable('option', 'revert', function(){
					//		$(this).removeClass("ui-draggable-dragging");
					//		$(this).css({width:"295px","height":"69px"});
					//		return true;
					//	});
				//	}
				scope.$apply();
			}
			
			function handleCardDrop2(event, ui){
					uiItem = ui;
					scope.disableReset = false;
					$(currentElement).addClass("droped");
					var dragId=$(this).parent().attr("id");
					if(dragId=="true")dragId=true; else dragId=false;
					
					if( dragId === ui.draggable.data("target")){
						scope.correntAns++
						$(this).parent().data("ans","true")
					}else
					{
						$(this).parent().data("ans","false")
					}
					scope.dragCounter--;
					ui.draggable.position({ of: $(this), my: 'top', at: 'top',using: function (css, calc) {
						css.top = temp2;
						css.left = '561px';
						css.width = '245px';
						temp2 += $(this).height()+10;
						$(this).css({
							height:($(this).height()+15)+'px',
							width:"219px"
						});
						$(this).animate(css, 200, 'linear');
					}});		
					
					if(scope.dragCounter==-1){
						$timeout(function(){
							//scope.submitBtnToggle = true;
							$("#btn").prop("disabled", false);
						},0);
					}
					ui.draggable.draggable('option', 'revert', false);
					ui.draggable.draggable('disable');	
				scope.$apply();
			}
			
			scope.completeDragging = function(){
				return dragCounter == 0;
			}
			scope.checkAnswer = function(){
				scope.disableReset = true;
				scope.attempt++;
				$("#btn").prop("disabled", true);
				scope.feedbackToggle = true;
				if(scope.correntAns==scope.totalOptions){
					scope.feedbackText=$rootScope.CourseContent.correct_feedback;
					$rootScope.isNextButtonDisabled = false;
					$rootScope.markVisitedPage();
				}else if(scope.correntAns!=scope.totalOptions && scope.attempt==1){
					scope.feedbackText=$rootScope.CourseContent.attempt1_Incorrect;
					//scope.submitBtnToggle = false;
				
					scope.tryBtnToggle = true;
				}else if(scope.correntAns>0 && scope.attempt==2){
					scope.feedbackText=$rootScope.CourseContent.attempt2_Partial;
					showTickMark();
					$rootScope.isNextButtonDisabled = false;
					$rootScope.markVisitedPage();
					
				}else if(scope.correntAns==0 && scope.attempt==2){
					scope.feedbackText=$rootScope.CourseContent.attempt2_Incorrect;
					showTickMark();
					$rootScope.isNextButtonDisabled = false;
					$rootScope.markVisitedPage();
				}
				$("body").css("cursor","auto");
			}
			
			function showTickMark(){
				 for (var i = 0; i < $rootScope.CourseContent.question.length; i++){
					 if($("#card"+(i+1)).data("ans")=="true")
						$("#card"+(i+1)).find(".iconHolder").addClass('rightMark')
					 else
						$("#card"+(i+1)).find(".iconHolder").addClass('wrongtMark')
				 }
				
			}
			
			scope.tryAgain = function(){
				scope.correntAns=0;
				//scope.submitBtnToggle = false;
				$("#btn").prop("disabled", true);
				$(".draggable-item").removeClass("droped");
				scope.tryBtnToggle = false;
				scope.feedbackToggle = false;
				
				scope.dragCounter = $rootScope.CourseContent.question.length-1;;
				temp1 = 5;
				temp2 = 5;
				
				$(".droppable-item").droppable('enable');
				$(".draggable-item").draggable('enable');
				$(".draggable-item").draggable({revert: reverFn});
				
			   for (var i = 0; i < $rootScope.CourseContent.question.length; i++){
					$('#question-text').append($("#card"+(i+1)))
					//console.log($("#card" + (i + 1)).data('origionalHieght'))
					$("#card"+(i+1)).css({
						'left': $("#card" + (i + 1)).data('originalLeft'),
						'top':   $("#card" + (i + 1)).data('origionalTop'),
						'height':$("#card" + (i + 1)).data('origionalHieght')
					});

				}
			}
			scope.reset = function(){
				scope.disableReset = true;
				scope.correntAns = 0;
				//scope.submitBtnToggle = false;
				//$("#btn").prop("disabled", true);
				$(".draggable-item").removeClass("droped");
				$(".draggable-item").css({
					"width":"279px",
					"height":"175px"
				});
				$("#btn").prop("disabled", true);
				//scope.tryBtnToggle = false;
				//scope.feedbackToggle = false;
				
				scope.dragCounter = $rootScope.CourseContent.question.length-1;;
				temp1 = 5;
				temp2 = 5;
				
				$(".droppable-item").droppable('enable');
				$(".draggable-item").draggable('enable');
				//$(".draggable-item").draggable({revert: true});
				
			   for (var i = 0; i < $rootScope.CourseContent.question.length; i++){
					$('#question-text').append($("#card"+(i+1)))
					//console.log($("#card" + (i + 1)).data('origionalHieght'))
					$("#card"+(i+1)).css({
						'left': $("#card" + (i + 1)).data('originalLeft'),
						'top':   $("#card" + (i + 1)).data('origionalTop'),
						'height':$("#card" + (i + 1)).data('origionalHieght')
					});

				}
				//ui.draggable.draggable('option', 'revert', true);
				//uiItem.draggable.o('option', 'revert', true);
				$(".draggable-item").draggable('option', 'revert', reverFn);
			}
			
			var promise = $interval(function(){
				var ele = $(".draggable-item");
				if(ele.length > 0 ){
					scope.start();
					$interval.cancel(promise);
				}
			},50);
		simulateEvents();
        }
    }
});



FrameworkApp.directive('dragndroponetoone', function ($rootScope,$timeout,$interval) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var correctCards = 0;
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            scope.feedbackToggle = false;
            scope.buttonText = $rootScope.CourseContent.submitText;
			scope.buttonResetText = $rootScope.CourseContent.resetText;
			scope.TrybuttonText = $rootScope.CourseContent.tryAgainText;
			scope.showAnsText = $rootScope.CourseContent.showAns;
            scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
            scope.attempt = 0;
            scope.feedback = "";
			scope.tryAgainButton = true;
            scope.question = $rootScope.CourseContent.question;
            scope.dragCounter = 0;
            scope.userAnswer = [];
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
            }
			var currentElement = null;


            scope.start = function () {
                // Hide the success message
                // Reset the game
                correctCards = 0;
                // Create the pile of shuffled cards
                var numbers = [];
                for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                    numbers.push($rootScope.CourseContent.question[i].dropIndex)
                }

               // $timeout(function(){
                    $(".droppable-item").droppable({
                        accept: '.draggable-item',
                        hoverClass: 'hovered',
                        drop: handleCardDrop
                    });

                    $(".draggable-item").draggable({
                        stack: '.draggable-item',
                        cursor: 'move',
                        revert: true,
						drag:function(){
							currentElement = $(this);
						}
                    });

                    for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
						//console.log($("#card"+(i+1)).css('left'))
                        $("#card"+(i+1)).data({'originalLeft': $("#card"+(i+1)).css('left'),
                            'origionalTop': $("#card"+(i+1)).css('top')
                        });
                    }
                //},500);
            }

            function handleCardDrop(event, ui) {
				$(currentElement).addClass("droped");
                scope.disableButton = false;
                var slotNumber = $(this).data('number');
                var cardNumber = ui.draggable.data('number');
                ui.draggable.draggable('disable');
                $(this).droppable('disable');
                ui.draggable.position({ of: $(this), my: 'left top', at: 'left top', using: function (css, calc) { $(this).animate(css, 200, 'linear'); } });
                ui.draggable.draggable('option', 'revert', false);
                if (slotNumber == cardNumber) {
                    correctCards++;
                    scope.userAnswer.push(1);
                }
                else{
                    scope.userAnswer.push(0);
                }
                scope.dragCounter++;
                if(scope.dragCounter == $rootScope.CourseContent.question.length)
                    $(".btn-submit").removeAttr("disabled");
				if(scope.dragCounter >= 1)
					$(".btn-reset").removeAttr("disabled");
            }

            scope.checkAnswer = function(){
                if (scope.buttonText == $rootScope.CourseContent.submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
					//console.log("correctCards ="+correctCards)
                    if (correctCards == $rootScope.CourseContent.question.length) {
                        scope.feedback = $rootScope.CourseContent.correct_feedback;
						scope.tryAgainButton = false;
                        scope.disableButton = true;
						$rootScope.markVisitedPage();
						$rootScope.topic3Completed();
						$(".btn-reset").attr("disabled", true);
                    }
                    else {
                        
                        if (scope.attempt < scope.maxAttempt - 1) {
							scope.tryAgainButton = true;
                           // scope.buttonText = $rootScope.CourseContent.tryAgainText;
							scope.feedback = $rootScope.CourseContent.try_feedback;
                        }
						else if (correctCards>0) {
							scope.tryAgainButton = false;
                            //scope.buttonText = $rootScope.CourseContent.incorrect-partial_feedback;
							scope.feedback = $rootScope.CourseContent.incorrect_partial_feedback;
							$rootScope.markVisitedPage();
							$rootScope.topic3Completed();
							$('.btn-reset').hide();
                        }
						else{
							scope.tryAgainButton = false;
							scope.feedback = $rootScope.CourseContent.incorrect_feedback;
							$rootScope.markVisitedPage();
							$rootScope.topic3Completed();
							$('.btn-reset').hide();
						}
						//scope.buttonResetText = scope.showAnsText;
						
                    }
                    if (attrs.tickmark == "true")
                        scope.checkUserAnswer();
                    scope.attempt++;
                }
                else{
					correctCards=0;
                    scope.feedbackToggle = false;
                    scope.dragCounter = 0;
                    scope.userAnswer = [];
                    scope.feedback = "";
                    for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                        $("#card" + (i + 1)).css({
                                'left': $("#card" + (i + 1)).data('originalLeft'),
                                'top': $("#card" + (i + 1)).data('origionalTop')
                            }
                        );
                        $($(".ui-droppable")[i]).removeClass("correct");
                        $($(".ui-droppable")[i]).removeClass("in-correct");
                    }
                    $(".droppable-item").droppable('enable');
                    $(".draggable-item").draggable('enable');
					$(".draggable-item").draggable({revert: true});
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    $(".btn-submit").attr("disabled", true);
                }

                if (scope.attempt >= scope.maxAttempt) {
                    $(".btn-submit").attr("disabled", true);
					//$(".btn-reset").attr("disabled", true);
                }
				
				//scope.buttonResetText = scope.showAnsText;
            }
			scope.tryAgain = function(){
					$(".draggable-item").removeClass("droped");
					$(".btn-reset").attr("disabled", true);
					correctCards=0;
                    scope.feedbackToggle = false;
                    scope.dragCounter = 0;
                    scope.userAnswer = [];
                    scope.feedback = "";
                    for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                        $("#card" + (i + 1)).css({
                                'left': $("#card" + (i + 1)).data('originalLeft'),
                                'top': $("#card" + (i + 1)).data('origionalTop')
                            }
                        );
                        $($(".ui-droppable")[i]).removeClass("correct");
                        $($(".ui-droppable")[i]).removeClass("in-correct");
                    }
                    $(".droppable-item").droppable('enable');
                    $(".draggable-item").draggable('enable');
					$(".draggable-item").draggable({revert: true});
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    $(".btn-submit").attr("disabled", true);
				
			}
			scope.showAns = true;
			scope.tempAns = [];
			scope.resetOptions = function(){
				correctCards = 0;
				$(".draggable-item").removeClass("droped");
				//scope.feedbackToggle = false;
				if(!scope.feedbackToggle){
					$(".btn-reset").attr("disabled", true);
					scope.dragCounter = 0;
					scope.userAnswer = [];
					//scope.feedback = "";
					for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
						$("#card" + (i + 1)).css({
								'left': $("#card" + (i + 1)).data('originalLeft'),
								'top': $("#card" + (i + 1)).data('origionalTop')
							}
						);
					}
										
					$(".droppable-item").droppable('enable');
					$(".draggable-item").draggable('enable');
					$(".draggable-item").draggable({revert: true});
					$(".btn-submit").attr("disabled", true);

				}
				else{
						scope.showAnswer();
						$(".btn-reset").attr("disabled", true);
						scope.buttonResetText = $rootScope.CourseContent.resetText;
					}
			}
			scope.showAns = true;
			scope.tempAns = [];
			scope.showAnswer = function(){
				if(scope.buttonResetText == scope.showAnsText){
					for(var i = 1; i <= scope.question.length ; i++){	
						$("#card"+i).appendTo($("#target"+i));
					}					 
				}
				$(".draggable-item").css({
					left:'-21px',
					top:'-6px',
					bottom:'0px',
					right:'0xp'
				});
				$(".ui-droppable").removeClass("correct");
				$(".ui-droppable").removeClass("in-correct");
				scope.showAns = false;
				scope.feedbackToggle = false;				
			};
		
            scope.checkUserAnswer = function () {
				$(".btn-show-ans").attr("disabled", false);
                for (var i = 0; i < $rootScope.CourseContent.question.length; i++) {
                    if(scope.userAnswer[i] ==1)
                        $($(".ui-droppable")[i]).addClass("correct");
                    else
                        $($(".ui-droppable")[i]).addClass("in-correct");
                }
            };
			var promise = $interval(function(){
				var ele = $(".droppable-item");
				if(ele.length > 0){
					scope.start();
					$interval.cancel(promise);
				}
				
			},100);
	//---- For Ipad
	simulateEvents();


        }
    }
});

function simulateEvents(){
	//---- For Ipad
	(function ($) {
		// Detect touch support
		$.support.touch = 'ontouchend' in document;
		// Ignore browsers without touch support
		if (!$.support.touch) {
		return;
		}
		var mouseProto = $.ui.mouse.prototype,
			_mouseInit = mouseProto._mouseInit,
			touchHandled;

		function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
		// Ignore multi-touch events
			if (event.originalEvent.touches.length > 1) {
			return;
			}
		event.preventDefault(); //use this to prevent scrolling during ui use

		var touch = event.originalEvent.changedTouches[0],
			simulatedEvent = document.createEvent('MouseEvents');
		// Initialize the simulated mouse event using the touch event's coordinates
		simulatedEvent.initMouseEvent(
			simulatedType,    // type
			true,             // bubbles                    
			true,             // cancelable                 
			window,           // view                       
			1,                // detail                     
			touch.screenX,    // screenX                    
			touch.screenY,    // screenY                    
			touch.clientX,    // clientX                    
			touch.clientY,    // clientY                    
			false,            // ctrlKey                    
			false,            // altKey                     
			false,            // shiftKey                   
			false,            // metaKey                    
			0,                // button                     
			null              // relatedTarget              
			);

		// Dispatch the simulated event to the target element
		event.target.dispatchEvent(simulatedEvent);
		}
		mouseProto._touchStart = function (event) {
		var self = this;
		// Ignore the event if another widget is already being handled
		if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
			return;
		}
		// Set the flag to prevent other widgets from inheriting the touch event
		touchHandled = true;
		// Track movement to determine if interaction was a click
		self._touchMoved = false;
		// Simulate the mouseover event
		simulateMouseEvent(event, 'mouseover');
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		// Simulate the mousedown event
		simulateMouseEvent(event, 'mousedown');
		};

		mouseProto._touchMove = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
			}
		// Interaction was not a click
		this._touchMoved = true;
		// Simulate the mousemove event
		simulateMouseEvent(event, 'mousemove');
		};
		mouseProto._touchEnd = function (event) {
		// Ignore event if not handled
		if (!touchHandled) {
			return;
		}
		// Simulate the mouseup event
		simulateMouseEvent(event, 'mouseup');
		// Simulate the mouseout event
		simulateMouseEvent(event, 'mouseout');
		// If the touch interaction did not move, it should trigger a click
		if (!this._touchMoved) {
		  // Simulate the click event
		  simulateMouseEvent(event, 'click');
		}
		// Unset the flag to allow other widgets to inherit the touch event
		touchHandled = false;
		};
		mouseProto._mouseInit = function () {
		var self = this;
		// Delegate the touch handlers to the widget's element
		self.element
			.on('touchstart', $.proxy(self, '_touchStart'))
			.on('touchmove', $.proxy(self, '_touchMove'))
			.on('touchend', $.proxy(self, '_touchEnd'));
		// Call the original $.ui.mouse init method
		_mouseInit.call(self);
    };
})(jQuery);
}
FrameworkApp.directive('clicknlearn', function ($rootScope) {
    return {
        restrict: 'AE',
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
				return '../html5/Views/kc/' + template + '.html';
			}
			var counter = [];
			counter.push(1);
			scope.content = $rootScope.CourseContent;
			scope.Buttontext = scope.content.btn_click_learn[0].text;
			scope.id = 1;
			scope.popupToggle=true;
			setTimeout(function(){
				$(".tab1").addClass("selected");				
			});
			scope.loadcontent = function (event, pItem) {
				$(event.currentTarget).addClass("selected");
				scope.popupToggle = true;				
				scope.Buttontext = pItem.text;
				scope.id = pItem.id;
				if(counter.indexOf(pItem.id) == -1)
					counter.push(pItem.id)
				/* if(scope.CourseContent.btn_click_learn.length == counter.length)
					$rootScope.markVisitedPage(); */
		//		$rootScope.attachStyle();
			};
		}
	}
});
FrameworkApp.directive('nextAndBack2', function (){
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$scope.counter = 0; 
			$scope.disableButton = true;
			$scope.feedbackToggle = false;
			$scope.btnsArray = [];
			$scope.correctAnswer = [];
			$scope.userAnswer = [];
			$scope.screenCompleted = false;
			$scope.visited = [];		
			$scope.ansCounter = 0;
			$scope.showNextInAssmnt = false;
			$scope.visited[$scope.counter] = 0;		
			$scope.showDragAndDrop = false;		
			$scope.start = function(){
				var visited = false;			
				if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1"){
					var visited = true;
				}
				$rootScope.numPages = $rootScope.CourseContent.pages.length;
				$scope.loadContent();
				$rootScope.question = $rootScope.CourseContent.pages[$scope.counter].question;
				$scope.numberOfbuttons = $rootScope.CourseContent.numberOfbuttons || 0;
				for(var i = 0 ; i < $rootScope.CourseContent.pages.length;i++){
					if(visited)
						$scope.btnsArray[i] = 0;
					else
						$scope.btnsArray[i] = $rootScope.CourseContent.pages[i].number_of_buttons;
				}
			};
 			var promise = $interval(function(){
				if($(".nextAndBack2").length){
					$scope.start();	
					$interval.cancel(promise);
				}
			},100);

			
			
			$scope.previousPage = function(){
				if($scope.counter != 0){
					$scope.counter--;
					$scope.loadContent();
					$scope.feedbackToggle = false;
					$scope.disableButton = true;
					//$scope.screenCompletion();
					//console.log($scope.btnsArray)
				}
			}
			
			$scope.screenCompletion = function(){
				 $timeout(function(){ 
					if (JSON.stringify($scope.btnsArray) == JSON.stringify($scope.visited)) {
						$scope.screenCompleted = true;
						$rootScope.markVisitedPage();
					}	
				},500); 
			};
			
			$scope.nextPage = function(){
				if($scope.counter != $rootScope.CourseContent.pages.length-1){
					if((!$rootScope.CourseContent.assessmentScreen || $scope.feedbackToggle) && $scope.btnsArray[$scope.counter] == 0){
						$scope.counter++;		
						$scope.loadContent();
						$scope.feedbackToggle = false;
						$scope.disableButton = true;
						$scope.showNextInAssmnt = false;
						//$scope.screenCompletion();
					}
				}		
				if($scope.counter === $rootScope.CourseContent.pages.length-1)
					$rootScope.markVisitedPage();
			}
			
			$scope.loadContent = function(){
					$rootScope.titleText = $rootScope.CourseContent.pages[$scope.counter].pageHeading || '';
					$rootScope.paraText = $rootScope.CourseContent.pages[$scope.counter].paragraphText || '';	
					$("#bubbleID").hide(0).show(0);
			};
			
			$scope.onOptionSelected = function(pIndex){
				if(!$scope.feedbackToggle){
					$scope.disableButton = false;				
					$("#options label").removeClass("option-selected");
					$("#options label").eq(pIndex).addClass("option-selected");					
				}
			};
			
			$scope.toggleDragAndDrop = function(_val){
				$scope.showDragAndDrop?$scope.showDragAndDrop = false:$scope.showDragAndDrop = true;
				/* setTimeout(function(){
					if( $('#vid_2_2') != undefined)
						$('#vid_2_2')[0].play(); 
				},500); */
				if( _val!=undefined && _val=="gonext"){
					if($scope.counter == $rootScope.CourseContent.pages.length-1){
						$scope.gotoNextPage();						
					}else{
						$scope.btnsArray[$scope.counter] = 0;
						$scope.nextPage();
					}
				}			
			}
		
			$scope.checkAnswer = function(){
				$scope.screenCompletion();
				if($scope.counter+1 != $rootScope.CourseContent.pages.length)
				$scope.showNextInAssmnt = true;
				$scope.visited[$scope.counter] = 1;
				$scope.feedbackToggle = true;
				$scope.correctAns = [];
				
				var AnswerList = document.getElementsByName('answer');
				for (var i = 0; i < AnswerList.length; i++) {
					if (AnswerList[i].checked) {
						$scope.userAnswer.push(1);
					}
					else {
						$scope.userAnswer.push(0);
					}
					if($rootScope.CourseContent.pages[$scope.counter].question[i].isCorrect)
						$scope.correctAns.push(1)
					else
						$scope.correctAns.push(0)
					
				}
				if($('input[name=answer]:checked').length==0) return;				
				if($('input[name=answer]:checked').attr("correct") == "true"){
					$scope.feedback = $rootScope.CourseContent.pages[$scope.counter].correct_feedback;
						$scope.ansCounter++;
						
				}
				else{
					$scope.feedback = $rootScope.CourseContent.pages[$scope.counter].incorrect_feedback;
					$('input[name=answer]:checked').parent().parent().addClass("in-correct")
				}				
				$scope.showAnswer();
				if($scope.ansCounter == $rootScope.numPages && $rootScope.CourseContent.assessmentScreen){
					$rootScope.assesmentScore++;
				}
				if($rootScope.CourseContent.assessmentScreen && $scope.counter+1 == $rootScope.CourseContent.pages.length)
					$rootScope.isNextButtonDisabled = false;
			}
			
			$scope.showAnswer = function (){
				var checkAnswer = document.getElementsByName('answer');
				for (var i = 0; i < checkAnswer.length; i++) {
					if ($scope.correctAns[i] == 1){
						$(checkAnswer[i]).parent().parent().addClass("correct");
					}
				}
				$('.kc-option-label').css('cursor', 'default');
			};
			
			$scope.replay = function(){
				var src = $("#swfObject").attr("src");
				$("#swfObject").attr("src",'');
				$("#swfObject").attr("src",src);
				
			};
			
			function getContent(){
				if($rootScope.CourseContent.pages == undefined || $rootScope.CourseContent.pages == "undefined"){
					$timeout(function(){
						getContent();						
					},100);
				}else{
					$scope.start();	
					return;
				}
			}
			
			//getContent(); 
        }
    }
});
FrameworkApp.directive('scrnBranching', function () {
	// console.log('scrnBranching')
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope) {
            if ($rootScope.CourseContent.btn_click_learn != undefined) {
				
               for (i = 0; i < $rootScope.CourseContent.btn_click_learn.length; i++) {	
				  if ($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.CourseContent.btn_click_learn[i].gotoPage - 1] == "1") {
                        $(".branching-screen li:nth-child(" + (i + 1) + ")").addClass("branching-visited");
                    }
                }
            }

			if($rootScope.screenType == "branchingHome"){
				$rootScope.scenarioAnswers = [2,2];
			}
            $scope.loadBranchingPage = function (event, pPageIndex,_scenarioPassed) {
                $(".branching-screen").empty();
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
                $rootScope.currentPage = pPageIndex;
                $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage - 1] = "1";
                var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage);
                $rootScope.$state.go('course.pages', { id: page_id });
                $rootScope.currentPage = $rootScope.currentPage - 1;
                /* if ($rootScope.CourseConfig != undefined) {
                    var _psList = ($rootScope.CourseConfig.MenuDepth == 2) ? $rootScope.pageStatusList[0] : $rootScope.pageStatusList;
                     var _susData = "course_progress=" + String(_psList.join('|'));
                    if ($rootScope.CourseConfig.AppType.toLowerCase() == 'scorm1.2') {
                        parent.SCORM_CallLMSSetValue("cmi.suspend_data", _susData);
                        parent.SCORM_CallLMSCommit();
                    }
                } */
				/* if(_scenarioPassed !== undefined && _scenarioPassed !== "undefined" && $rootScope.scenarioAnswers.indexOf(2) !==-1){
					
						console.log($rootScope.scenarioAnswers.indexOf(2));
					if(_scenarioPassed){
						$rootScope.scenarioAnswers[$rootScope.scenarioAnswers.indexOf(2)] = 1;
					}else{
						$rootScope.scenarioAnswers[$rootScope.scenarioAnswers.indexOf(2)] = 0;
					}
					for(var i = 3; i < 14; i++){
						$rootScope.pageStatusList[$rootScope.currentTopic][i] = '1';
					}
					
				} */
				//console.log($rootScope.pageStatusList)
				
				//$(".menu-btn").css({cursor:'default',pointerEvents:'none',opacity:'0.5'});
				//console.log($(".menu-btn"))
            };

            $scope.loadBranchingHome = function () {
                $rootScope.isPrevButtonDisabled = false;
                if(!$rootScope.CourseConfig.ForceNavigation)
                    $rootScope.isNextButtonDisabled = false;
                $rootScope.currentPage = $rootScope.CourseContent.branchingHomeScreen;
                var page_id = $rootScope.pad($rootScope.currentModule + 1) + '_' + $rootScope.pad($rootScope.currentTopic + 1) + '_' + $rootScope.pad($rootScope.currentPage);
                $rootScope.$state.go('course.pages', { id: page_id });
                $rootScope.currentPage = $rootScope.currentPage - 1;				
                $rootScope.branchingCounter++;
				$(".menu-btn").css({cursor:'pointer',pointerEvents:'all',opacity:'1'});
            };
			
            angular.element(document).ready(function () {
                if ($rootScope.CourseContent.btn_click_learn != undefined) {
                    if ($(".branching-visited").length >= $rootScope.CourseContent.btn_click_learn.length)
						{ 
					$rootScope.markVisitedPage(); 
						  $rootScope.branchingCounter = 0;
						}
                }
            });

        }
    }
});

FrameworkApp.directive('mamc', function ($rootScope,$timeout) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
				var myVar = setInterval(function(){  scope.myTimer() }, 1000);
            }
			scope.visited = false;
			if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] == 1){
				scope.visited = true;
			}
            scope.selection = 1;
            scope.correctAnswer = [];
            scope.userAnswer = [];
			scope.aryResponse = [];
			scope.blnCorrect;
			scope.aryCorrectResponse =[];
            scope.options = "";
            scope.disableButton = true;
            scope.isBranching = false;
			scope.userTime = 0;
            scope.start = function () {
                scope.id = 0;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
                $rootScope.feedbackToggle = false;
                scope.fdbackTgle = false;
                scope.buttonText = $rootScope.CourseContent.submitText;
                scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
                $rootScope.feedback = "";
				scope.feedbackAssessment = "";
                scope.feedback_bg = $rootScope.CourseContent.feedback_bg_path;
                scope.quizTxt = $rootScope.CourseContent.quizTxt;
				scope.openpopup = false;

            };
			
			scope.testingAnswers = function(_answers){
				if($rootScope.CourseConfig.isDebugging){	
					if(_answers.isCorrect == "true"){
						return "debug-quiz-color-correct";
					}else{
						return "debug-quiz-color-incorrect";
					}
				}
			};

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            };

            scope.onOptionSelected = function (pIndex,type) {
				if(type==true){
					var cEle = $(event.currentTarget).siblings(".kc-option-label");
					var cInp = $($(cEle[0]).find("input[name=answer]")[0]);
					$(cInp).trigger("click");
				}
				if ($('input[name=answer]:checked').length > 0)
						scope.disableButton = false;
				else
					scope.disableButton = true;
				if ($("#options label").eq(pIndex).hasClass("option-selected")) {
					$("#options label").eq(pIndex).removeClass("option-selected");
				}
				else {
					$("#options label").eq(pIndex).addClass("option-selected");					
				}	
            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == "true"){
						
                        scope.correctAnswer.push(1);
						if(attrs.assesment=="true"){
							
						var flag = scope.options[i].text;
						//flag = flag.replace(/ +/g, "_");
						flag = flag.replace(/\./g,' ')
						//scope.aryResponse.push(flag);
						scope.aryCorrectResponse.push(flag);	
						}
					
					}
                    else{
                        scope.correctAnswer.push(0);
					}
                }
            };

            scope.checkAnswer = function () {
				$rootScope.checkInternet($rootScope.selectedLang);
				if (attrs.assesment == "true")clearInterval(myVar);
                if (scope.buttonText == $rootScope.CourseContent.submitText) {
                    if (attrs.feedback == "true")
                        $rootScope.feedbackToggle = true;
						scope.fdbackTgle = true;
                    var AnswerList = document.getElementsByName('answer');
                    for (var i = 0; i < AnswerList.length; i++) {
                        if (AnswerList[i].checked) {
                            scope.userAnswer.push(1);
							if(attrs.assesment=="true"){
							var flag1 = scope.options[i].text;
							//flag = flag.replace(/ +/g, "_");
							flag1 = flag1.replace(/\./g,' ');
							var Response =["A","B","C","D","E","F","G"];
							var flag4 = Response[i]
							//alert("flag4"+flag4)
							//scope.aryCorrectResponse.push(flag1);
							scope.aryResponse.push(flag4);	
								
							}
							
							
                        }
                        else {
                            scope.userAnswer.push(0);
                        }
                    }
					//alert("scope.aryResponse"+scope.aryResponse)
                    if (!$('input[name=answer]:checked').length) return;
				    var tottalCorrectAns = 0;
					var tottaluserAns = 0;
					var tottaluserIncorrectAnswer =0;
					for(var k = 0;k < scope.options.length;k++){
						if(scope.correctAnswer[k]==1){tottalCorrectAns++;}
						if(scope.correctAnswer[k]== scope.userAnswer[k] &&  scope.userAnswer[k] ==1){
							tottaluserAns++;							
						}						
						if(scope.userAnswer[k]==1){
							if(scope.userAnswer[k]!=scope.correctAnswer[k]){
							tottaluserIncorrectAnswer++;
							}							
						}					
					}
                    if (JSON.stringify(scope.correctAnswer) == JSON.stringify(scope.userAnswer) && attrs.assesment == "true") {	//check both if answer is correct and assessment is true
                        if (attrs.assesment == "true")
							{$rootScope.assesmentScore++;}
                        $rootScope.feedback = $rootScope.CourseContent.correct_feedback;
						scope.feedbackAssessment = $rootScope.CourseContent.correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;
						scope.blnCorrect = true;					
                        if (!$rootScope.CourseContent.branchingScreen)
                            $rootScope.markVisitedPage();
                        else {
                            scope.isBranching = true;
                        }
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 1;
                    }
					else{
						 $rootScope.feedback = $rootScope.CourseContent.incorrect_feedback;
						 scope.feedbackAssessment = $rootScope.CourseContent.incorrect_feedback;
						 scope.blnCorrect = "false";
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.resetText;
                            scope.disableInput = true;
                        }
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 0;
						}                       
                    }
					if (attrs.assesment != "true"){
							if(tottalCorrectAns == tottaluserAns && tottaluserIncorrectAnswer==0 ){
								$rootScope.feedback = $rootScope.CourseContent.correct_feedback;
								scope.feedbackAssessment = $rootScope.CourseContent.correct_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}		
							}
							else if(tottaluserAns>=1 && tottaluserIncorrectAnswer==0){
								$rootScope.feedback = $rootScope.CourseContent.partial_correct_feedback;
								scope.feedbackAssessment = $rootScope.CourseContent.partial_correct_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}	 		
							}
							else{								
								$rootScope.feedback = $rootScope.CourseContent.incorrect_feedback;
								scope.feedbackAssessment = $rootScope.CourseContent.incorrect_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.resetText;
									scope.disableInput = true;
								}	
							}
						}
				if (attrs.tickmark == "true" && attrs.assesment == "false"){
					scope.checkUserAnswer();
					scope.attempt++;
				}
                else {
					$('.kc-option-label').css('cursor', 'default');
                    $rootScope.feedbackToggle = false;
					scope.fdbackTgle = false;
                    $('input[name=answer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    scope.disableInput = false;
                    scope.userAnswer = [];
                    scope.disableButton = true;
                    $('input[name=answer]').parent().removeClass("correct-checkbox");
                    $('input[name=answer]').parent().removeClass("in-correct-checkbox");
                    if ($(".kc-option").children().hasClass("option-selected")) {
                        $(".kc-option").children().removeClass("option-selected");
                    }
                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                    if (!$rootScope.CourseContent.branchingScreen){
						if(attrs.popupbox != "true")
							$rootScope.markVisitedPage();						
					}
                    else {
                        scope.isBranching = true;
                    }
                    if (attrs.tickmark == "true" && attrs.assesment == "false")
                        scope.showAnswer();
					else
						$('.kc-option-label').css('cursor', 'default');
					
                }
				scope.popuptext = $rootScope.CourseContent.popupcontent;
				if(attrs.popupbox == "true"){
					$timeout(function(){
						scope.openpopup = true;						
						$rootScope.markVisitedPage();
					},1000);
				}
				
				var flag4 = $rootScope.assesmentQuestionIndex[$rootScope.currentPage];
				var QuestionTypeText;
				if($rootScope.currentTopic==0){
					QuestionTypeText = "PreAssessmentSection_";
				}else{
					QuestionTypeText = "PostAssessmentSection_";
				}
				var strID = QuestionTypeText+"Question_"+flag4;
				//var strID = $rootScope.CourseContent.paragraph_text1_1;
				//strID = strID.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "");
				///strID = strID.trim();
				//strID = strID.replace(/ +/g, "_");
				var strDescription = "";
				var intWeighting = 1;
				var intLatency = (scope.userTime*1000);
				var dtmTime = $rootScope.getDate;
				var strLearningObjectiveID = $rootScope.currentPage;
				if (attrs.assesment == "true"){
					if($rootScope.CourseConfig.AppType.toLowerCase() == "scorm1.2"){
						SCORM_RecordMultipleChoiceInteraction(strID, scope.aryResponse, scope.blnCorrect, scope.aryCorrectResponse, strDescription, intWeighting, intLatency, strLearningObjectiveID, dtmTime);
						scormAdaptor_commit();
					}
				}
				
            };
			 scope.myTimer = function(){
				 scope.userTime++;
			 }
            scope.checkUserAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if (checkAnswer[i].checked) {
                        if (scope.correctAnswer[i] == 1) {
                            $(checkAnswer[i]).parent().addClass("correct-checkbox")
                        }
                        else {
                            $(checkAnswer[i]).parent().addClass("in-correct-checkbox")
                        }
                    }
                }
            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if (scope.correctAnswer[i] == 1) {
                        $(checkAnswer[i]).parent().addClass("correct-checkbox");
						$('.kc-option-label').css('cursor', 'default');
						$('.kc-option-label').find('.option-text').css('cursor', 'default');						
                    }
                }
            };

            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
			
            scope.reset();
            scope.start();
        }
    }

});
FrameworkApp.directive('validatePassword', function ($rootScope) {
	return {
        restrict: 'CA',
		controller: function($scope, $rootScope, $timeout) {
			$(document).unbind("keydown",disableOptionalKeys);
			$scope.btnDisabled = true;
			$scope.inptDisabled = false;
			$scope.showFeedback = false;
			$scope.ppInit = true;
			//$scope.feedback = '';
			var attempt = 0;
			
			$scope.closeInit = function(){
				$scope.feedBack = $rootScope.CourseContent.initFeedback;
				$scope.btnText = $rootScope.CourseContent.submit;
				$scope.maxAttempt = $rootScope.CourseContent.attempts;
				$scope.ppInit = false;
				//console.log($scope.feedBack)
			};
			
			$scope.isValid = function(){
				var password = $("#pwd").val();
				if(password.length >= 1)
					$scope.btnDisabled = false;
				else
					$scope.btnDisabled = true;
				//console.log(password)
			};
			
			$scope.validateP = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if($scope.btnText == $rootScope.CourseContent.submit){
					var password = $("#pwd").val();
					var cNum = password.match('[0-9]');
					var cSmL = password.match('[a-z]');
					var cCapL = password.match('[A-Z]');
					var cSpclCh = password.match(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/);
					
					var isContainLater = (password.toUpperCase()).match(/PASSWORD/);
					
					function checkNumOfValids(a,b,c,d){
						var ttlValid = 0;
						for(var i = 0 ; i < arguments.length; i++){
							if(arguments[i]){
								ttlValid++;
							}
						}
						return ttlValid;
					}
					
					var totalValidCriteria = checkNumOfValids(cNum,cSmL,cCapL,cSpclCh);
					attempt++;
					if(password.length >= 8){
						if(totalValidCriteria >= 3 && isContainLater==null){
							$scope.feedBack = $rootScope.CourseContent["correctFeedback"+attempt];
							//if(attempt >= $scope.maxAttempt){
								$scope.btnText = $rootScope.CourseContent.noRetryCrct;
								$scope.btnDisabled = true;
								$scope.inptDisabled = true;
							//}
							$(".laptop").addClass("correct-answ");
							$rootScope.markVisitedPage();
							$(document).bind("keydown",disableOptionalKeys)
						}else{
							$scope.feedBack = $rootScope.CourseContent["inCorrectFeedback"+attempt];
							if(attempt >= $scope.maxAttempt){
								$scope.btnDisabled = true;
								$scope.inptDisabled = true;
								$scope.btnText = $rootScope.CourseContent.noRetryInCrct;
								$rootScope.markVisitedPage();
							}else{
								$scope.btnText = $rootScope.CourseContent.retry;
							}
							$(".laptop").addClass("incorrect-answ");
							
						}

					}else{
						$scope.feedBack = $rootScope.CourseContent["inCorrectFeedback"+attempt];
						if(attempt >= $scope.maxAttempt){
								$scope.btnDisabled = true;
								$scope.inptDisabled = true;
								$scope.btnText = $rootScope.CourseContent.noRetryInCrct;
								$rootScope.markVisitedPage();
								$(document).bind("keydown",disableOptionalKeys)
						}else{
							$scope.btnText = $rootScope.CourseContent.retry;
						}
						$(".laptop").addClass("incorrect-answ");
					}
					
					$scope.showFeedback = true;
					//console.log($scope.feedBack)
				}else{
					if(attempt >= $scope.maxAttempt){
						return;
					}
					$scope.feedBack = $rootScope.CourseContent.initFeedback_2;
					$(".laptop").removeClass("correct-answ incorrect-answ");
					$("#pwd").val('');
					$scope.btnDisabled = true;
					$scope.inptDisabled = false;
					$scope.btnText = $rootScope.CourseContent.submit;
				}
			}
		}
	}
});
FrameworkApp.directive('identifyHazard', function ($rootScope) {
	return {
        restrict: 'CA',
		controller: function($scope, $rootScope,$interval,$timeout){
			$scope.initPopup = true;
			$scope.fdbackPopup = false;
			$scope.timeUp = false;
			$scope.timer = 1;
			$scope.identified = [];
			$scope.feedbackText = '';
			var timeInsFdbck = 0;
			var timerCtrl ;
			$scope.isAnsweredCorrectly = false;
			$scope.trackSelected = function(_index){
				$rootScope.checkInternet($rootScope.selectedLang);
				if($scope.identified.indexOf(_index) == -1)
					$scope.identified.push(_index);
				if($scope.identified.length >= $rootScope.CourseContent.items.length)
					getFdback();
				$(event.currentTarget).parent().addClass("selected");
				//console.log("_index =========="+_index)
				$('.border_'+(_index+1)).show();
			}
			
			$scope.closeInit = function(){
				$scope.initPopup = false;
				timerCtrl = $interval(function(){
					$scope.timer++;
					//console.log($scope.timer +">="+ $rootScope.CourseContent.totalTime)
					if($scope.timer >= $rootScope.CourseContent.totalTime){
						$scope.timeUp = true;
						$interval.cancel(timerCtrl);
						timeInsFdbck = $rootScope.CourseContent.timeInSecondsFeedbackToAppear;
						validateAnswered();
					}
				},1000);
			}
			
			function validateAnswered(){
				$(".markMc").each(function(ind,ele){
					var isSelected = $(ele).hasClass("selected");
					if(!isSelected)
						$(ele).addClass("not-selected");
				});
				
				$timeout(function(){	
					getFdback();
				},timeInsFdbck*1000);
			}
			
			function getFdback(){
			
				$rootScope.markVisitedPage();
				$rootScope.isNextButtonDisabled = false;
				$scope.fdbackPopup = true;
				if($scope.identified.length >= $rootScope.CourseContent.items.length){
					$scope.feedbackTitle = $rootScope.CourseContent.feedbackRightTitle;
					$scope.feedbackText = $rootScope.CourseContent.correctFeedback;
					$scope.isAnsweredCorrectly = true;
					$rootScope.activityAnswer = true;
					
					
				}else{
					$scope.feedbackTitle = $rootScope.CourseContent.feedbackWrongTitle;
					$scope.feedbackText = $rootScope.CourseContent.inCorrectFeedback;
					$scope.isAnsweredCorrectly = false;
					$rootScope.activityAnswer = false;
					$rootScope.CourseContent.skipToNextPage=7;
					$rootScope.pageStatusList[$rootScope.currentTopic][5] = "1";
					
				}
				 $interval.cancel(timerCtrl);
			}
			
			$scope.$on('$destroy', function() {
				 $interval.cancel(timerCtrl);
			});
		}
	}
});
FrameworkApp.directive('brachingScreen', function ($rootScope) {
	return {
        restrict: 'CA',
		controller: function($scope, $rootScope, $timeout) {
			//$(".next img").addClass("done");
			/* $rootScope.isNextButtonDisabled = true;
			$timeout(function(){
					$rootScope.isNextButtonDisabled = true;
			 },500); */
			
			$scope.showSceanrio1=true;
			$scope.scenario_1_checkAns=function(event){
				$rootScope.checkInternet($rootScope.selectedLang);
				$rootScope._06_04_visited=false;
				if($(event.currentTarget).data( "ans")==false){
					$scope.showSceanrio1_feedback=true;
					$scope.showSceanrio1=false;
					$rootScope.isNextButtonDisabled = false;
					$("#gInstruct").fadeIn(500);
					$(".next").addClass("done");
					
				}else{
					// $scope.showSceanrio1=false;
					// $scope.showSceanrio2=true;
					$rootScope.loadScreen($rootScope.currentModule, $rootScope.currentTopic, 7);
				}
				$rootScope.CourseContent.skipToNextPage=8;
				//$rootScope.pageStatusList[$rootScope.currentTopic][1] = "1";
				$rootScope.pageStatusList[$rootScope.currentTopic][4] = "1";
			}
			
			$scope.scenario_2_checkAns=function(event){
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.showSceanrio3=true;
				$rootScope._06_04_visited=true;
				if($(event.currentTarget).data( "ans")==false){
					 $scope.showSceanrio3IncorectFeedback=true;
					 $rootScope.CourseContent.skipToNextPage=9;
				}else{
					$scope.showSceanrio3CorrectFeedback=true;
					$rootScope.CourseContent.skipToNextPage=10;
				}
				$rootScope.pageStatusList[$rootScope.currentTopic][1] = "1";
				$rootScope.pageStatusList[$rootScope.currentTopic][3] = "1";
				$rootScope.pageStatusList[$rootScope.currentTopic][4] = "1";

				$rootScope.isNextButtonDisabled = false;
				$rootScope.markVisitedPage();
			}
		}
	}
});
FrameworkApp.directive('samcscenario', function ($rootScope) {
    return {
        restrict: 'AE',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
                if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
				

            }
            scope.selection = 1;
            scope.isBranching = false;
            scope.disableButton = true;
            scope.start = function () {
                scope.id = 0;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
                scope.feedbackToggle = false;
                $rootScope.feedbackToggleSC = false;
                scope.buttonText = $rootScope.CourseContent.submitText;
                scope.returnText = $rootScope.CourseContent.returnText;
                scope.maxAttempt = $rootScope.CourseContent.maximumAttempt;
                scope.feedback = "";
                $rootScope.feedbackTxt = "";
                scope.feedback_bg = $rootScope.CourseContent.feedback_bg_path;
            };

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            };

            scope.onOptionSelected = function (pIndex) {
                if ($('input[name=answer]:checked').length > 0)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
                if ($(".kc-option").children().hasClass("option-selected")) {
                    $(".kc-option").children().removeClass("option-selected");
                }
                $("#options label").eq(pIndex).addClass("option-selected");

            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.question;
            };

            scope.checkAnswer = function () {
                if (scope.buttonText == $rootScope.CourseContent.submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
						$rootScope.feedbackToggleSC = true;
                    if (!$('input[name=answer]:checked').length) return;
                    if ($('input[name=answer]:checked').attr("correct") == "true") {
                        if (attrs.assesment == "true")
                            $rootScope.assesmentScore++;
                        scope.feedback = $rootScope.CourseContent.correct_feedback;
                        $rootScope.feedbackTxt = $rootScope.CourseContent.correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;
                        if (!$rootScope.CourseContent.branchingScreen)
                            $rootScope.markVisitedPage();
                        else {
                            scope.isBranching = true;
                        }
                    } else {
                        scope.feedback = $rootScope.CourseContent.incorrect_feedback;
                        $rootScope.feedbackTxt = $rootScope.CourseContent.incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.resetText;
                            scope.disableInput = true;

                        }
                    }
                    if (attrs.tickmark == "true")
                        scope.checkUserAnswer();
                    scope.attempt++;
                }
                else {
                    scope.feedbackToggle = false;
					$rootScope.feedbackToggleSC = false;
                    $('input[name=answer]:checked').parent().parent().removeClass("correct");
                    $('input[name=answer]:checked').parent().parent().removeClass("in-correct");
                    $('input[name=answer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.submitText;
                    scope.disableInput = false;
                    scope.disableButton = true;
                    if ($(".kc-option").children().hasClass("option-selected")) {
                        $(".kc-option").children().removeClass("option-selected");
                    }

                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                   // if (!$rootScope.CourseContent.branchingScreen)
                      //  $rootScope.markVisitedPage();
				  $rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage] = "1";
					if($rootScope.CourseContent.branchingScreen == "true" || $rootScope.CourseContent.branchingScreen == true){
						var isBranchingCompleted = function(){
							var _sList = $rootScope.pageStatusList[$rootScope.currentTopic];
							var _cP = $rootScope.currentPage;
							return _sList[4] == "1" && _sList[5] == "1" && _sList[6] == "1";
						}
						if(isBranchingCompleted()){
							$rootScope.pageStatusList[$rootScope.currentTopic][3] = "1";
							$rootScope.markVisitedPage();
						}
					}
                   // else {
                        scope.isBranching = true;
                   // }
                    if (attrs.tickmark == "true")
                        scope.showAnswer();
                }
            };

            scope.checkUserAnswer = function () {
                if ($('input[name=answer]:checked').attr("correct") == "true") {
                    $('input[name=answer]:checked').parent().parent().addClass("correct")
                }
                else {
                    $('input[name=answer]:checked').parent().parent().addClass("in-correct")
                }

            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('answer');
                for (var i = 0; i < checkAnswer.length; i++) {
                    if ($(checkAnswer[i]).attr("correct") == "true") {
                        $(checkAnswer[i]).parent().parent().addClass("correct");
						$('.kc-option-label').css('cursor', 'default');
                    }
                }
            }
            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
            scope.reset();
            scope.start();
        }
    }
});
FrameworkApp.directive('popmamc1', function ($rootScope,$timeout) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
            }
			
            scope.selection = 1;
            scope.correctAnswer = [];
            scope.userAnswer = [];
            scope.options = "";
            scope.disableButton = true;
            scope.isBranching = false;
            scope.start = function () {
               
				scope.id= Number(attrs.id-1);;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
				scope.showContinuebtn=false;
                scope.feedbackToggle = false;
				scope.continueText = $rootScope.CourseContent.screen[ scope.id].continueText;
				scope.questionText=$rootScope.CourseContent.screen[ scope.id].QuestionText;
				scope.instructionText=$rootScope.CourseContent.screen[ scope.id].instruction_text;
				scope.pageBG=$rootScope.CourseContent.screen[ scope.id].pageBG;
                scope.buttonText = $rootScope.CourseContent.screen[ scope.id].submitText;
                scope.maxAttempt = $rootScope.CourseContent.screen[ scope.id].maximumAttempt;
                scope.feedback = "";
                scope.feedback_bg = $rootScope.CourseContent.screen[ scope.id].feedback_bg_path;
				scope.openpopup = false;
				$('.kc-option-label-1').css('cursor', 'pointer !important');
			//	$rootScope.attachStyle();
            };

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
				 $('input[name=canswer]').parent().removeClass("option-selected-check");
            };

            scope.onOptionSelected = function (event) {
                if ($('input[name=canswer]:checked').length > 0)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
				
                if ($(event.target).parent().hasClass("option-selected-check")) {
                    $(event.target).parent().removeClass("option-selected-check");
                }
                else {
                   $(event.target).parent().addClass("option-selected-check");
                }
            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.screen[ scope.id].question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == "true")
                        scope.correctAnswer.push(1);
                    else
                        scope.correctAnswer.push(0);
                }
            };
			scope.hideFeedback=function(){
				scope.feedbackToggle=false
			};
            scope.checkAnswer = function () {
				$rootScope.checkInternet($rootScope.selectedLang);
                if (scope.buttonText == $rootScope.CourseContent.screen[ scope.id].submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
                    var AnswerList = document.getElementsByName('canswer');
				
                    for (var i = 0; i < AnswerList.length; i++) {
						
							
                        if (AnswerList[i].checked) {
                            scope.userAnswer.push(1);
							
                        }
                        else {
                            scope.userAnswer.push(0);
                        }
                    }
                    if (!$('input[name=canswer]:checked').length) return;
				    var tottalCorrectAns = 0;
					var tottaluserAns = 0;
					var tottaluserIncorrectAnswer =0;
					for(var k = 0;k < scope.options.length;k++){
						var id=($rootScope.CourseContent.screen[ scope.id].question[k].id)
						
						if(scope.correctAnswer[k]==1){tottalCorrectAns++;}
					
						if(scope.correctAnswer[k]== scope.userAnswer[id-1] &&  scope.userAnswer[id-1] ==1){
							tottaluserAns++;							
						}	
							
						if(scope.userAnswer[id-1]==1){
							if(scope.userAnswer[id-1]!=scope.correctAnswer[k]){
							tottaluserIncorrectAnswer++;
							}							
						}					
					}
                    if (JSON.stringify(scope.correctAnswer) == JSON.stringify(scope.userAnswer) && attrs.assesment == "true") {	//check both if answer is correct and assessment is true
                        if (attrs.assesment == "true")
							{$rootScope.assesmentScore++;}
                        scope.feedback = $rootScope.CourseContent.screen[ scope.id].correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;						
                        //if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                            //$rootScope.markVisitedPage();
                        //else {
                            scope.isBranching = true;
                        //}
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 1;
                    } 
					else{
						 scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
                            scope.disableInput = true;
                        }
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 0;
						}                       
                    }
					if (attrs.assesment != "true"){
						scope.showContinuebtn = true;
							if(tottalCorrectAns == tottaluserAns && tottaluserIncorrectAnswer==0 ){
								scope.feedback = $rootScope.CourseContent.screen[ scope.id].correct_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
									scope.disableInput = true;
								}		
							}
							else if(tottaluserAns>=1 && tottaluserIncorrectAnswer==0){
								scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
									scope.disableInput = true;
								}	 		
							}
							else{								
								scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
									scope.disableInput = true;
								}	
							}
						}
				if (attrs.tickmark == "true"){
					scope.checkUserAnswer();
					scope.attempt++;
				}
                else {
                    scope.feedbackToggle = false;
                    $('input[name=canswer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.screen[ scope.id].submitText;
                    scope.disableInput = false;
                    scope.userAnswer = [];
                    scope.disableButton = true;
                    $('input[name=canswer]').parent().removeClass("correct-checkbox1");
                    $('input[name=canswer]').parent().removeClass("in-correct-checkbox1");
                    if ($(".kc-option-check").children().hasClass("option-selected-check1")) {
                        $(".kc-option-check").children().removeClass("option-selected-check1");
                    }
                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                    //if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                        //$rootScope.markVisitedPage();
                    //else {
                        scope.isBranching = true;
                    //}
                    if (attrs.tickmark == "true")
                        scope.showAnswer();
					
                }
				
				$rootScope.showContinuebtn = true;
				if(attrs.popupbox == "true"){
					$timeout(function(){
						scope.openpopup = true;						
					},1000);
				}
            };
			
            scope.checkUserAnswer = function () {
                var checkAnswer = document.getElementsByName('canswer');
			
                for (var i = 0; i < scope.options.length; i++) {
						var id=($rootScope.CourseContent.screen[ scope.id].question[i].id)
						
                    if (checkAnswer[id-1].checked) {
                        if (scope.correctAnswer[i] == 1) {
                            $(checkAnswer[id-1]).parent().addClass("correct-checkbox1")
                        }
                        else {
                            $(checkAnswer[id-1]).parent().addClass("in-correct-checkbox1")
                        }
                    }
                }
            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('canswer');
                for (var i = 0; i < scope.options.length; i++) {
					var id=($rootScope.CourseContent.screen[ scope.id].question[i].id)
                    if (scope.correctAnswer[i] == 1) {
                        $(checkAnswer[id-1]).parent().addClass("correct-checkbox1");
						$('.kc-option-label-1').css('cursor', 'default');
                    }
                }
            };

            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
            scope.reset();
			scope.start();
            
        }
	
		
    }

});
FrameworkApp.directive('popmamc', function ($rootScope,$timeout) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ng-include src="getTemplateUrl()"/>',
        link: function (scope, elem, attrs) {
            var template = attrs.templateUrl;
            scope.getTemplateUrl = function () {
                return '../html5/Views/kc/' + template + '.html';
            };
            if (attrs.assesment == "true") {
                $rootScope.isPrevButtonDisabled = true;
                $rootScope.isNextButtonDisabled = true;
            }
			
            scope.selection = 1;
            scope.correctAnswer = [];
            scope.userAnswer = [];
            scope.options = "";
            scope.disableButton = true;
            scope.isBranching = false;
            scope.start = function () {
               
				scope.id= Number(attrs.id-1);;
                scope.attempt = 0;
                scope.disableInput = false;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
				scope.showContinuebtn=false;
                scope.feedbackToggle = false;
				scope.continueText = $rootScope.CourseContent.screen[ scope.id].continueText;
				scope.questionText=$rootScope.CourseContent.screen[ scope.id].QuestionText;
				scope.instructionText=$rootScope.CourseContent.screen[ scope.id].instruction_text;
				scope.pageBG=$rootScope.CourseContent.screen[ scope.id].pageBG;
                scope.buttonText = $rootScope.CourseContent.screen[ scope.id].submitText;
                scope.maxAttempt = $rootScope.CourseContent.screen[ scope.id].maximumAttempt;
                scope.feedback = "";
                scope.feedback_bg = $rootScope.CourseContent.screen[ scope.id].feedback_bg_path;
				scope.openpopup = false;
				$('.kc-option-label-1').css('cursor', 'pointer !important');
			//	$rootScope.attachStyle();
            };

            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
				 $('input[name=canswer]').parent().removeClass("option-selected-check");
            };

            scope.onOptionSelected = function (event) {
                if ($('input[name=canswer]:checked').length > 0)
                    scope.disableButton = false;
                else
                    scope.disableButton = true;
				
                if ($(event.target).parent().hasClass("option-selected-check")) {
                    $(event.target).parent().removeClass("option-selected-check");
                }
                else {
                   $(event.target).parent().addClass("option-selected-check");
                }
            };

            scope.getQuestion = function () {
                scope.options = $rootScope.CourseContent.screen[ scope.id].question;
                for (i = 0; i < scope.options.length; i++) {
                    if (scope.options[i].isCorrect == "true")
                        scope.correctAnswer.push(1);
                    else
                        scope.correctAnswer.push(0);
                }
            };
			scope.hideFeedback=function(){
				scope.feedbackToggle=false
			};
            scope.checkAnswer = function () {
				$rootScope.checkInternet($rootScope.selectedLang);
                if (scope.buttonText == $rootScope.CourseContent.screen[ scope.id].submitText) {
                    if (attrs.feedback == "true")
                        scope.feedbackToggle = true;
                    var AnswerList = document.getElementsByName('canswer');
				
                    for (var i = 0; i < AnswerList.length; i++) {
						
							
                        if (AnswerList[i].checked) {
                            scope.userAnswer.push(1);
							
                        }
                        else {
                            scope.userAnswer.push(0);
                        }
                    }
                    if (!$('input[name=canswer]:checked').length) return;
				    var tottalCorrectAns = 0;
					var tottaluserAns = 0;
					var tottaluserIncorrectAnswer =0;
					for(var k = 0;k < scope.options.length;k++){
						var id=($rootScope.CourseContent.screen[ scope.id].question[k].id)
						
						if(scope.correctAnswer[k]==1){tottalCorrectAns++;}
					
						if(scope.correctAnswer[k]== scope.userAnswer[id-1] &&  scope.userAnswer[id-1] ==1){
							tottaluserAns++;							
						}	
							
						if(scope.userAnswer[id-1]==1){
							if(scope.userAnswer[id-1]!=scope.correctAnswer[k]){
							tottaluserIncorrectAnswer++;
							}							
						}					
					}
                    if (JSON.stringify(scope.correctAnswer) == JSON.stringify(scope.userAnswer) && attrs.assesment == "true") {	//check both if answer is correct and assessment is true
                        if (attrs.assesment == "true")
							{$rootScope.assesmentScore++;}
                        scope.feedback = $rootScope.CourseContent.screen[ scope.id].correct_feedback;
                        scope.disableButton = true;
                        scope.disableInput = true;						
                        //if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                            //$rootScope.markVisitedPage();
                        //else {
                            scope.isBranching = true;
                        //}
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 1;
                    } 
					else{
						 scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
                        if (scope.attempt < scope.maxAttempt - 1) {
                            scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
                            scope.disableInput = true;
                        }
						if (attrs.assesment == "true")
							$rootScope.asmntScoreArray[$rootScope.currentPage-1] = 0;
						}                       
                    }
					if (attrs.assesment != "true"){
						scope.showContinuebtn = true;
							if(tottalCorrectAns == tottaluserAns && tottaluserIncorrectAnswer==0 ){
								scope.feedback = $rootScope.CourseContent.screen[ scope.id].correct_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
									scope.disableInput = true;
								}		
							}
							else if(tottaluserAns>=1 && tottaluserIncorrectAnswer==0){
								scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
									scope.disableInput = true;
								}	 		
							}
							else{								
								scope.feedback = $rootScope.CourseContent.screen[ scope.id].incorrect_feedback;
								if (scope.attempt < scope.maxAttempt - 1) {
									scope.buttonText = $rootScope.CourseContent.screen[ scope.id].resetText;
									scope.disableInput = true;
								}	
							}
						}
				if (attrs.tickmark == "true"){
					scope.checkUserAnswer();
					scope.attempt++;
				}
                else {
                    scope.feedbackToggle = false;
                    $('input[name=canswer]:checked').attr('checked', false);
                    scope.buttonText = $rootScope.CourseContent.screen[ scope.id].submitText;
                    scope.disableInput = false;
                    scope.userAnswer = [];
                    scope.disableButton = true;
                    $('input[name=canswer]').parent().removeClass("correct-checkbox");
                    $('input[name=canswer]').parent().removeClass("in-correct-checkbox");
                    if ($(".kc-option-check").children().hasClass("option-selected-check")) {
                        $(".kc-option-check").children().removeClass("option-selected-check");
                    }
                }
                scope.answerMode = false;
                if (scope.attempt >= scope.maxAttempt) {
                    scope.disableInput = true;
                    scope.disableButton = true;
                    //if (!$rootScope.CourseContent.screen[ scope.id].branchingScreen)
                        //$rootScope.markVisitedPage();
                    //else {
                        scope.isBranching = true;
                    //}
                    if (attrs.tickmark == "true")
                        scope.showAnswer();
					
                }
				
				$rootScope.showContinuebtn = true;
				if(attrs.popupbox == "true"){
					$timeout(function(){
						scope.openpopup = true;						
					},1000);
				}
            };
			
            scope.checkUserAnswer = function () {
                var checkAnswer = document.getElementsByName('canswer');
			
                for (var i = 0; i < scope.options.length; i++) {
						var id=($rootScope.CourseContent.screen[ scope.id].question[i].id)
						
                    if (checkAnswer[id-1].checked) {
                        if (scope.correctAnswer[i] == 1) {
                            $(checkAnswer[id-1]).parent().addClass("correct-checkbox")
                        }
                        else {
                            $(checkAnswer[id-1]).parent().addClass("in-correct-checkbox")
                        }
                    }
                }
            };

            scope.showAnswer = function () {
                var checkAnswer = document.getElementsByName('canswer');
                for (var i = 0; i < scope.options.length; i++) {
					var id=($rootScope.CourseContent.screen[ scope.id].question[i].id)
                    if (scope.correctAnswer[i] == 1) {
                        $(checkAnswer[id-1]).parent().addClass("correct-checkbox");
						$('.kc-option-label-1').css('cursor', 'default');
                    }
                }
            };

            scope.nextQuestion = function () {
                scope.id++;
                scope.getQuestion();
            };
            scope.reset();
			scope.start();
            
        }
	
		
    }

});FrameworkApp.directive('hotspot1', function (){
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$rootScope.pageBG="";
			var forceNavigation=true;
			$rootScope.btnCompletion=[];
			var openFirstPopup=true;
			var btnVisitedState=[];
			$scope.start=function(){
				for(var i=1; i<= $rootScope.CourseContent.slide.length; i++){
					btnVisitedState[i]=0;
					if($rootScope.pageStatusList[$rootScope.currentTopic][$rootScope.currentPage]=="1")
					$rootScope.btnCompletion[i]=1;
						else
					$rootScope.btnCompletion[i]=0;
					if(!forceNavigation) initButtonClick(i);
				}
				if(openFirstPopup){
					$scope.openPopUp(1)
				}
			//	$rootScope.attachStyle();
				
			}
			
			//if(forceNavigation) initButtonClick(i);
			$scope.getBtnStatus=function(id){
				var clsss="";
				
				if($rootScope.btnCompletion[id]==1){
					clsss+='visited';
				}
				if(btnVisitedState[id]==1){
					clsss+=' active';
				}
				return clsss;
			}
			
			$scope.openPopUp =function(no){
				$rootScope.checkInternet($rootScope.selectedLang);
				$scope.hideAllPopup();
				btnVisitedState[no]=1;
				$rootScope.currentPop=no;
				$scope['pop_'+no]=true;
				//console.log(btnVisitedState)
				
				if($rootScope.CourseContent.slide[$rootScope.currentPop-1].pageBG){
					$rootScope.pageBG=$rootScope.CourseContent.slide[$rootScope.currentPop-1].pageBG;
				}
				
				if($rootScope.CourseContent.slide[$rootScope.currentPop-1].subBtn==undefined){
					$rootScope.btnCompletion[no]=1;
				}
				if($rootScope.btnCompletion.indexOf(0)==-1)
					$rootScope.markVisitedPage();
			}
			
			$scope.hideAllPopup =function(){
				for(var i=1; i<= $rootScope.CourseContent.slide.length; i++){
					//console.log(" == "+$scope['pop_'+i]);
					$scope['pop_'+i]=false;
				}
			}
			
			var promise = $interval(function(){
				if($rootScope.CourseContent.slide){
					$scope.start();	
					$interval.cancel(promise);
				}
			},500);
		}
		
	}
});

FrameworkApp.directive('nextAndBack3', function (){
    return {
        restrict: 'C',
        link: function ($scope, $rootScope, elem, attrs) {
        },
        controller: function ($scope, $rootScope,$timeout,$interval) {
			$rootScope.counter = 0; 
			$scope.disableButton = true;
			$scope.feedbackToggle = false;
			$scope.btnsArray = [];
			$scope.correctAnswer = [];
			$scope.userAnswer = [];
			$scope.screenCompleted = false;
			$scope.visited = [];		
			$scope.ansCounter = 0;
			
			$scope.showNextInAssmnt = false;
			$scope.visited[$rootScope.counter] = 0;		
			$scope.showDragAndDrop = false;
			
			$scope.id=$rootScope.currentPop-1;
			$scope.start = function(){	
				var visited = false;	
				//console.log($rootScope.CourseContent)
				$rootScope.numPages = $rootScope.CourseContent.slide[$scope.id].pages.length;
				$scope.loadContent();
				$rootScope.question = $rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].question;
				$scope.numberOfbuttons = $rootScope.CourseContent.numberOfbuttons || 0;
				for(var i = 0 ; i < $rootScope.CourseContent.slide[$scope.id].pages.length;i++){
					if(visited)
						$scope.btnsArray[i] = 0;
					else
						$scope.btnsArray[i] = $rootScope.CourseContent.slide[$scope.id].pages[i].number_of_buttons;
				}
//$rootScope.attachStyle();				
			};

			$scope.previousPage = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if($rootScope.counter != 0){
					$rootScope.counter--;
					$scope.loadContent();
					$scope.feedbackToggle = false;
					$scope.disableButton = true;
					if($rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].pageBG){
						$rootScope.pageBG=$rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].pageBG;
					}
				}
			}
			
			$scope.screenCompletion = function(){
				 $timeout(function(){ 
					if (JSON.stringify($scope.btnsArray) == JSON.stringify($scope.visited)) {
						$scope.screenCompleted = true;
					}	
				},500); 
			};
			
			$scope.nextPage = function(){
				$rootScope.checkInternet($rootScope.selectedLang);
				if($rootScope.counter != $rootScope.CourseContent.slide[$scope.id].pages.length-1){
					if((!$rootScope.CourseContent.assessmentScreen || $scope.feedbackToggle) && $scope.btnsArray[$rootScope.counter] == 0){
						$rootScope.counter++;
						$scope.loadContent();
						$scope.feedbackToggle = false;
						$scope.disableButton = true;
						$scope.showNextInAssmnt = false;
						if($rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].pageBG){
							$rootScope.pageBG=$rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].pageBG;
						}
					}
				}		
				if($rootScope.counter === $rootScope.CourseContent.slide[$scope.id].pages.length-1)
					$rootScope.btnCompletion[$rootScope.currentPop]=1;
				
				if($rootScope.btnCompletion.indexOf(0)==-1)
					$rootScope.markVisitedPage();
			}
			
			$scope.loadContent = function(){
					$rootScope.titleText = $rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].pageHeading || '';
					$rootScope.paraText = $rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].paragraphText || '';			
					$("#bubbleID").hide(0).show(0);
			};
			
			$scope.onOptionSelected = function(pIndex){
				if(!$scope.feedbackToggle){
					$scope.disableButton = false;				
					$("#options label").removeClass("option-selected");
					$("#options label").eq(pIndex).addClass("option-selected");					
				}
			};
			
			$scope.toggleDragAndDrop = function(_val,_type){
				$rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].number_of_buttons = 0;
				$scope.showDragAndDrop?$scope.showDragAndDrop = false:$scope.showDragAndDrop = true;
				setTimeout(function(){
					if( $('#vid_2_4') != undefined && $scope.showDragAndDrop)
						$('#vid_2_4')[0].play();		
				},500);
				if( _val!=undefined && _val=="gonext"){
					if($rootScope.counter == $rootScope.CourseContent.slide[$scope.id].pages.length-1){
						$scope.gotoNextPage();						
					}else{
						if(_type == 'btnclick' && $rootScope.CourseContent.btn_click_learn.length == $(".selected").length){
							$scope.btnsArray[$rootScope.counter] = 0;
							$scope.nextPage();							
						}
						else if(_type == undefined || _type == null){
							$scope.btnsArray[$rootScope.counter] = 0;
							$scope.nextPage();
						}
					}
				}	
			}
			$scope.toggleDragAndDrop1 = function(nav){
				$scope.showDragAndDrop?$scope.showDragAndDrop = false:$scope.showDragAndDrop = true;
				if(nav){
					if($(".selected").length == $(".tabs").length){
							$scope.btnsArray[$rootScope.counter] = 0;
							$scope.nextPage();
					}
				}
			}
		
			$scope.checkAnswer = function(){
				$scope.screenCompletion();
				if($rootScope.counter+1 != $rootScope.CourseContent.slide[$scope.id].pages.length)
				$scope.showNextInAssmnt = true;
				$scope.visited[$rootScope.counter] = 1;
				$scope.feedbackToggle = true;
				$scope.correctAns = [];
				
				var AnswerList = document.getElementsByName('answer');
				for (var i = 0; i < AnswerList.length; i++) {
					if (AnswerList[i].checked) {
						$scope.userAnswer.push(1);
					}
					else {
						$scope.userAnswer.push(0);
					}
					if($rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].question[i].isCorrect)
						$scope.correctAns.push(1)
					else
						$scope.correctAns.push(0)
					
				}
				if($('input[name=answer]:checked').length==0) return;				
				if($('input[name=answer]:checked').attr("correct") == "true"){
					$scope.feedback = $rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].correct_feedback;
						$scope.ansCounter++;
						
				}
				else{
					$scope.feedback = $rootScope.CourseContent.slide[$scope.id].pages[$rootScope.counter].incorrect_feedback;
					$('input[name=answer]:checked').parent().parent().addClass("in-correct")
				}				
				$scope.showAnswer();
				if($scope.ansCounter == $rootScope.numPages && $rootScope.CourseContent.assessmentScreen){
					$rootScope.assesmentScore++;
				}
				if($rootScope.CourseContent.assessmentScreen && $rootScope.counter+1 == $rootScope.CourseContent.slide[$scope.id].pages.length)
					$rootScope.isNextButtonDisabled = false;
			}
			
			$scope.showAnswer = function (){
				var checkAnswer = document.getElementsByName('answer');
				for (var i = 0; i < checkAnswer.length; i++) {
					if ($scope.correctAns[i] == 1){
						$(checkAnswer[i]).parent().parent().addClass("correct");
					}
				}
				$('.kc-option-label').css('cursor', 'default');
			};
			
			$scope.replay = function(){
				var src = $("#swfObject").attr("src");
				$("#swfObject").attr("src",'');
				$("#swfObject").attr("src",src);
				
			};
			
			function getContent(){
				if($rootScope.CourseContent.slide[$scope.id].pages == undefined || $rootScope.CourseContent.slide[$scope.id].pages == "undefined"){
					$timeout(function(){
						getContent();						
					},100);
				}else{
					$scope.start();	
					return;
				}
			}
			
			getContent(); 
        }
    }
});
