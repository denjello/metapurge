/**
 * Created by egal on 9/19/14.
 */


$(document).ready(function(){
    "use strict";


    $(window).smartresize(function () {
        setTimeout(function () {
            Canvas.resizeCanvas();
        }, 500);
    });

    $('#camera,#camchoice').click(function(){
        // we assume here that the camera has not yet been initialized
        Tools.loading(true);
        window.turnOnCamera = setTimeout(function(){
            if ($('#load').is(':visible')){
                //$scope.setMessage('Please turn on your Camera.',-1,'label-error');
            }
        }, 5000);
        window.cameraProblems = setTimeout(function(){
            if ($('#load').is(':visible')){
                //$scope.setMessage('Problems? Try uploading from the filesystem.',-1,'label-error');
                $('#nativeFile .fa').addClass('oneblink');
            }
        }, 30000);
        Canvas.init();

        function cameraIntervalTimer(){
            if (Global.localMediaStream){
                clearTimeout(window.turnOnCamera);
                clearTimeout(window.cameraProblems);
                clearInterval(window.cameraInterval);
            }
        }
        window.cameraInterval = setInterval(cameraIntervalTimer,1000);
    });
    $('#nativeFile,#filechoice').click(function(){
        $('input#filechooser').trigger('click');
    });

    $('input#filechooser').on("click",function(){
        setTimeout(function(){
            if (!Global.file){
                //$scope.setMessage('Try the old uploader.',null,'label-error');
                $('input#filechooser').attr('capture','camera').removeClass('hidden');
                clearInterval(window.fileInterval);
            }
        }, 15000);
        function fileIntervalTimer() {
            if (Global.file){
                Tools.loading('stop');
                clearInterval(window.fileInterval);
            }
        }
        window.fileInterval = setInterval(fileIntervalTimer,100);
    }).off("change").on("change",function (evnt) {
        // this is the native file element
        // that is not being triggered when a picture is made on mobile. :(
        Global.file = this.files[0];
        if (Global.file) {
            if (Tools.isImage(Global.file.type) === true) {
                Canvas.fromImage(evnt);
                Tools.activate('filechoice');
                $(".step1").hide();
                $(".step3").hide();
                $('.step2').hide().removeClass('hidden').fadeIn(500);
            } else {
                //$scope.setMessage('That file is not an image.',-1,'label-error');
                setTimeout(function(){window.location.reload(true);},3000);
            }
        }
    });

    $("#accept.action,canvas").click(function(){
        Tools.flash();
        $(".step1").hide();
        $('.step2').hide().removeClass('hidden').fadeIn(500);
        Canvas.freezer();
    });
    $("#cancel").click(function(){
        $(".step2").hide();
        $(".step1").fadeIn(500);
        $(".step3").hide();
        Canvas.releaser();
    });
    $("#settings span.trigger").click(function(){
        if ($('.step3').hasClass('hidden')){
            $(".step3").hide().removeClass('hidden').fadeIn(500);
            $("#settings i.fa-stack-2x").addClass("fa-circle");
            $("#settings i.fa-stack-1x").addClass("white");

        } else {
            $(".step3").fadeOut(250).addClass('hidden');
            $("#settings .trigger").blur();
            $("#settings .fa-stack-2x").removeClass("fa-circle");
            $("#settings .fa-stack-1x").removeClass("white");
        }
    });
    $(".step3 button").click(function(){
        $("#settings .trigger").click();
    });


    $("#upload").bind('click',function(e){
        $('.step2').addClass('hidden');
        // $('#cancel').click();
        // todo: add progress callback for uploader

        //var canvas = document.getElementById("previewer");
        //var image = canvas.toDataURL("image/png")//.replace("image/png", "data:application/octet-stream");
        Canvas.save();
        $('#cancel').click();
    });


//////////////////////////////////////////////
// FILTER OPS
//
//  todo: functionalize this mess!!!
//
//////////////////////////////////////////////


    $(".filter.contrast").click(function () {
        Tools.loading('start','Processing Contrast.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.contrast(Global.imageData,20);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.BW").click(function () {
        Tools.loading('start','Processing Black&White.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.grayscale(Global.imageData);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.brighten").click(function () {
        Tools.loading('start','Processing Lighten.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.brightness(Global.imageData, 5);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.darken").click(function () {
        Tools.loading('start','Processing Darken.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Filter.brightness(Global.imageData, -5);
            Global.ctx.putImageData(Global.imageData, 0, 0);
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.sharpen").click(function () {
        Tools.loading('start','Processing Sharpen.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Global.iData = Filter.convolute(Global.imageData, [ 0, -1, 0, -1, 5, -1, 0, -1, 0]);
            Global.ctx.putImageData(Global.iData, 0, 0);
            Global.iData = null;
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });
    $(".filter.blur").click(function () {
        Tools.loading('start','Processing Blur.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Global.iData = Filter.convolute(Global.imageData, Filter.gaussian,4);
            Global.ctx.putImageData(Global.iData, 0, 0);
            Global.iData = null;
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });

    $(".filter.laplace").click(function () {
        Tools.loading('start','Processing Unsharpen.');
        setTimeout(function(){
            Global.imageData = Global.ctx.getImageData(0, 0, Global.canvas.width, Global.canvas.height);
            Global.iData = Filter.convolute(Global.imageData, Filter.gaussian );
            Global.iData2 = Filter.convolute(Global.iData, Filter.gaussian);
            Global.iData3 = Filter.convolute(Global.iData2, [
                -1, -2, -1,
                -2, 13, -2,
                -1, -2, -1
            ]);
            Global.ctx.putImageData(Global.iData3, 0, 0);
            Global.iData = null;
            Global.iData2 = null;
            Global.iData3 = null;
            Global.imageData = null;
        },50);
        Tools.loading('stop');
    });


// maybe we need a new algo for these turners...
    $("#clockwise").click(function () {
        Tools.loading('start','Processing Rotation.');
        setTimeout(function(){
            Canvas.rotate(90);
        },50);
        Tools.loading('stop');
    });

    $("#counterclockwise").click(function () {
        Tools.loading('start','Processing Rotation.');
        setTimeout(function(){
            Canvas.rotate(-90);
        },50);
        Tools.loading('stop');
    });


});