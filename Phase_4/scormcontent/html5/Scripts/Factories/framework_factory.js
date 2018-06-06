var imageLocations = imagePath;
FrameworkApp.factory("PreloaderService", PreloaderService)
PreloaderService.$inject = ['$q', '$rootScope'];
function PreloaderService($q, $rootScope) {
    function Preloader() {

        this.imageLocations = imageLocations;
        //this.imageProp = imageProp;
        this.imageCount = this.imageLocations != undefined ? this.imageLocations.length : 0;
        this.loadCount = 0;
        this.errorCount = 0;
        this.states = {
            PENDING: 1,
            LOADING: 2,
            RESOLVED: 3,
            REJECTED: 4
        };
        this.state = this.states.PENDING;
        this.deferred = $q.defer();
        this.promise = this.deferred.promise;
    }

    Preloader.preloadImages = function () {
        var preloader = new Preloader();
        return (preloader.load());
    };

    var proto = {
        constructor: Preloader,
        isInitiated: isInitiated,
        isRejected: isRejected,
        isResolved: isResolved,
        load: load,
        handleImageError: handleImageError,
        handleImageLoad: handleImageLoad,
        loadImageLocation: loadImageLocation
    };

    function isInitiated() {
        return (this.state !== this.states.PENDING);
    }

    function isRejected() {
        return (this.state === this.states.REJECTED);
    }

    function isResolved() {
        return (this.state === this.states.RESOLVED);
    }

    function load() {
		if($rootScope.currentPage == 4){
			this.imageCount = 1;
		}
        if (this.isInitiated()) {
            return (this.promise);
        }

        this.state = this.states.LOADING;

        for (var i = 0; i < this.imageCount; i++) {
            this.loadImageLocation(this.imageLocations[i].source);
        }

        return (this.promise);
    }

    function handleImageError(imageLocation) {
        this.errorCount++;

        if (this.isRejected()) {
            return;
        }

        this.state = this.states.REJECTED;
        this.deferred.reject(imageLocation);
    }

    function handleImageLoad(imageLocation) {
        this.loadCount++;

        if (this.isRejected()) {
            return;
        }

        this.deferred.notify({
            percent: Math.ceil(this.loadCount / this.imageCount * 100),
            imageLocation: imageLocation
        });

        if (this.loadCount === this.imageCount) {
            this.state = this.states.RESOLVED;
            this.deferred.resolve(this.imageLocations);
        }
    }

    function loadImageLocation(imageLocation) {	
        var preloader = this,
            image = new Image();

        image.onload = function (event) {
            $rootScope.$apply(function () {
                    preloader.handleImageLoad(event.target.src);
                    preloader = image = event = null;
                }
            );

        };
        image.onerror = function (event) {
            $rootScope.$apply(function () {
                    preloader.handleImageError(event.target.src);
                    preloader = image = event = null;
                }
            );
        };
        image.src = "../"+imageLocation;
    }

    angular.extend(Preloader.prototype, proto);

    return (Preloader);
}