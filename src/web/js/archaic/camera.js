var Camera = {
    videoSettings : {
        audio: false,
        video: {
            mandatory: {
                minWidth: 1920,
                minHeight: 1080
            }
        }
    },
    onCameraFail : function (e) {
        this.error = e.name || e;
        clearTimeout(window.turnOnCamera);
        clearInterval(window.cameraInterval);
        console.log(this.error);
        //$scope.setMessage(this.error + '. Other programs or tabs using the camera will prevent it from working here.', -1);

    },
    destroy : function () {
        "use strict";
        var video = document.querySelector('video');
        console.log(video);
        if (video !== null) {
            video.src="";
            try{
                window.localMediaStream.stop();
            } catch(e){
                console.log(e);
            }
            window.localMediaStream = null;
            video.load();
        };
    },
    init : function() {

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        window.URL = window.URL || window.webkitURL;
        if (!navigator.getUserMedia) {
            $('#nativeFile').click();
        }
        navigator.getUserMedia(Camera.videoSettings, function (stream) {
            window.localMediaStream = stream;
            //$('video').attr("src",window.localMediaStream);
            window.video.src = window.localMediaStream;
            window.addEventListener('loadedmetadata', function(e) {
                alert('Got loadedmetadata!');
                Canvas.feed();
            }, true);
            window.addEventListener('canplaythrough', function(e) {
                alert('Got loadedmetadata!');
                Canvas.feed();
            }, true);
            window.video.onloadedmetadata = function(e) {
                alert('data')
                Canvas.feed();
            };



        });



    },
    feed : function() {

        function feedTimer() {
            if (window.video.videoHeight > window.video.videoWidth) {
                window.sourceX = 0;
                window.sourceY = (window.video.videoHeight - window.video.videoWidth) / 2;
                window.sourceWidth = window.video.videoWidth;
                window.sourceHeight = window.video.videoWidth;
                Tools.loading('stop');

                clearInterval(window.feedTimer);
            } else if (window.video.videoHeight < window.video.videoWidth){
                window.sourceX = (window.video.videoWidth - window.video.videoHeight) / 2;
                window.sourceY = 0;
                window.sourceWidth = window.video.videoHeight;
                window.sourceHeight = window.video.videoHeight;
                Tools.loading('stop');

                clearInterval(window.feedTimer);
            } else { // firefox edge case
                console.log('STILL WAITING');
            }
        }
        function snapIntervalTimer() {
            try {

                window.ctx.drawImage(window.video, window.sourceX, window.sourceY, window.sourceWidth, window.sourceHeight, window.destX, window.destY, window.destWidth, window.destHeight);
            } catch (e) {
                console.log(e);
            }

        }
        if (window.localMediaStream) {

            if (window.snapInterval) {

                clearInterval(window.snapInterval);
            }

            $('canvas#previewer').attr('videoLive', "on");
            // we need to wait for firefox.video to catch up

            if (!window.feedTimer) {
                window.feedTimer = setInterval(feedTimer,50);
            }


            window.destWidth = window.canvas.width;
            window.destHeight = window.canvas.height;
            window.ctx = window.canvas.getContext('2d');

            window.snapInterval = setInterval(snapIntervalTimer, 1000/30);

        }
    },
    freezer : function() {
        if ($('canvas#previewer').attr('videoLive') === 'on') {
            clearInterval(window.snapInterval);
            $(this).attr('videoLive', "off");
        }
    },
    releaser : function() {
        if ($('.active').hasClass('cam')){
            Canvas.feed();
            $(this).attr('videoLive', "on");
        }
    }
}