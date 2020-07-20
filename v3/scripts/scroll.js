// (function($, document, window){

  // An object that keeps track of all the videos on the page.
  var Scroller = function(iframes,swiperIndex){
    // console.log(iframes)
    this.init(iframes,swiperIndex);
  };

  Scroller.prototype.init = function(iframes,swiperIndex){
    this.data = [];
    this.currentIsFullscreen = false;
    var currentScroller = this;
	var tempData = [];
    // create a player for each of the videos.
    iframes.each($.proxy(function(i, elem){
      var $elem = $(elem);
      var videoId = $elem.attr("id");	  
      var t = $elem.offset().top,
        b = t + $elem.height();
        
//       console.log(videoId);
//       console.log(t);
//       console.log(b);
//       console.log("-------------------------");

      tempData.push({
        top: t,
        bottom: b,
        $elem: $elem,
        player: player
      });
      // console.log(tempData)

	  var player = videojs(videoId);	  
	  	  
	  // when the player is ready, add it to the rotatation
	  videojs(videoId).ready(function () {
	     var videoId = $elem.attr("id");

	     for(let i = 0; i < tempData.length; i++) {
			var newElem = tempData[i].$elem;
			var newVideoId = newElem.attr("id");
			if (videoId == newVideoId) {
      // console.log("===========================");
      // console.log(newVideoId);
      // console.log(tempData[i].top);
      // console.log(tempData[i].bottom);
      // console.log("===========================");
			
   			  currentScroller.add(tempData[i].top,tempData[i].bottom,swiperIndex,tempData[i].$elem,this); 
   			  break;
			}
		 } 
		 
		 this.on('fullscreenchange', function () {
		   currentScroller.currentIsFullscreen = this.isFullscreen();
// 	       console.log("````````````````````````````````````");
// 		   console.log(this.isFullscreen())
// 	       console.log("````````````````````````````````````");
		 });

//    	    this.muted = false;
//     	if (i == 0) {
//    	    	this.play().then(function () {
//   				// autoplay was successful!
//   				alert("success");
// 			}).catch(function (error) {
//   				// do something if you want to handle or track this error
//   				alert(error);
// 			});
//     	}
//  	    this.play()
// 	    currentScroller.add($elem,this);
	  });
	  		
    }, this));

    // Listen to the scroll events.
    this.listen();
  };

  // Add the elements positioning data.
  Scroller.prototype.add = function(top,bottom,index,$elem, player){
//     var t = $elem.offset().top,
//       b = t + $elem.height();

    this.data.push({
      top: top,
      bottom: bottom,
      index: index,
      $elem: $elem,
      player: player
    });
  };

  // Called by the on scroll event.
  Scroller.prototype.scrolled = function(){
    var $window = $(window);

    // Get the scrollTop and scrollBottom.
    var t = $window.scrollTop();
    var b = t + $window.height();
    
    // It possible to have multiple videos inframe, so we only want to play
    // the first one or the one that has the largest percentage in frame.
    // console.log('===============')
     // console.log(this.data)
    console.log(active_index)
    console.log(this.data[0].index)
    // console.log('===============')
    if(this.data[0].index==active_index){
      $.each($.map(this.data, function(obj, i){
         
        // We need to find the percentage of the video that's in frame.
        var p = 0;
        // console.log(obj.top)  //90 390 690 990 1290 1590...
        // console.log(obj.bottom)  //390 690 990 1290 1590 1890...
        // console.log(b+' 11b11')  //736  1036  2424 2435.199...
        // console.log(t+' 11t11')  //0 300 1688 1699.199...
        // There is overlap of the window and iframe.
        if (obj.top <= b && obj.bottom >= t) {
          // Height of the embed.
          var h = obj.bottom - obj.top;
      
          // Based on the window, figure out percentages.
          if (obj.bottom > b){
            p = (b - obj.top) / h;
          } else if (obj.top < t){
            p = (obj.bottom - t) / h;
          } else {
            p = 1;
          }
        }
      
        // Stripped down object of what we need.
        return {
          p: p,
          t: obj.top,
          elem: obj.$elem,
          player: obj.player
        };
      }).sort(function(a, b){
        // sort based on percentages.
        if (a.p > b.p){
          return -1;
        } else if (a.p < b.p) {
          return 1;
        }
      
         // If the percentages are equal, use the one higher on the page.
        if (a.t < b.t){
          return -1;
        } else if (a.t > b.t){
          return 1;
        }
        return 0;
      }), function(i, obj){
        // the first obj in the list should be the one we want to play, but
        // make sure it has at least a little inframe.
        if (i === 0 && obj.p > 0.25){
          obj.player.play();
        } else {
          // pause the rest.
          obj.player.pause();
        }
      });
    }else{
      // console.log(this.data)
      $.each(this.data, function(i,obj){
          obj.player.pause();
      });
    }
    
  };

  // Called when the window is resized. It allows use to update the data
  // to with the new top and bottom. It's a bit faster to do this, as window
  // resize isn't called all that often.
  Scroller.prototype.resized = function(){
    $.each(this.data, function(i, obj){
      obj.top = obj.$elem.offset().top;
      obj.bottom = obj.top + obj.$elem.height();
    });

    // We call scrolled here as most likely something went out of frame.
    this.scrolled();
  };

  Scroller.prototype.listen = function($elem, player){
    var $window = $(window);
   
    // Listen to the scroll event.
    $window.on('scroll', $.proxy(function(){
       // console.log(status)
      if(status == 'true'){
      // Nothings ready yet.
      if (this.data.length === 0){
        return false;
      }
      // console.log(status)
      
//       console.log(this.currentIsFullscreen);
      if(this.currentIsFullscreen) {
        return false;
      }
    
//       console.log("start scroll");

      this.scrolled();
      }

    }, this));

    // Listen to the resize event.
    $window.on('resize', $.proxy(function(){

      // Nothings ready yet.
      if (this.data.length === 0){
        return false;
      }

//       this.resized();
    }, this));
  };



// })(jQuery, document, window);
