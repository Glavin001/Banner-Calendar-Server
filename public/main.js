$(document).ready(function() {

    // One Page Scroll
    $(".main").onepage_scroll({
        sectionContainer: "section", // sectionContainer accepts any kind of selector in case you don't want to use section
        easing: "ease", // Easing options accepts the CSS3 easing animation such "ease", "linear", "ease-in", "ease-out", "ease-in-out", or even cubic bezier value such as "cubic-bezier(0.175, 0.885, 0.420, 1.310)"
        animationTime: 1000, // AnimationTime let you define how long each section takes to animate
        pagination: true, // You can either show or hide the pagination. Toggle true for show, false for hide.
        updateURL: false, // Toggle this true if you want the URL to be updated automatically when the user scroll to each page.
        beforeMove: function(index) {}, // This option accepts a callback function. The function will be called before the page moves.
        afterMove: function(index) {}, // This option accepts a callback function. The function will be called after the page moves.
        loop: true, // You can have the page loop back to the top/bottom when the user navigates at up/down on the first/last page.
        responsiveFallback: false // You can fallback to normal page scroll by defining the width of the browser in which you want the responsive fallback to be triggered. For example, set this to 600 and whenever the browser's width is less than 600, the fallback will kick in.
    });

    var sections = {
        'sign-in': 1,
        'loading': 2,
        'finish': 3,
        'help': 4
    };

    // Make Textarea read-only, source: http://stackoverflow.com/a/15518726/2578205
    $('textarea[readonly]').removeAttr('readonly').each(function () {
                var $this = $(this);
                $this.hide().after('<div data-textarea="'+$this.attr('id') +'" class="textarea">' + $this.val() + '</div>');
            }).on('textareachange', function () {
                var $this = $(this);
                $('[data-textarea="'+$this.attr('id')+'"]').html($this.val());
            });

    /*
    function smoothScrollTo(hash) {
        var dest=0;
        if ($(hash).offset().top > $(document).height()-$(window).height()) {
            dest=$(document).height()-$(window).height();
        } else {
            dest=$(hash).offset().top;
        }
        //go to destination
        $('html,body').animate({scrollTop:dest}, 1000,'swing');
    }
    */

    //
    var $formSignIn = $('#form-signin');
    $formSignIn.submit(function(e){

      // Dismiss keyboard, Source: http://stackoverflow.com/a/2890234/2578205 
      $('button[type="submit"]').focus();

      e.preventDefault();

      var data = $formSignIn.serialize();
      // Rest Form
      $('input[name="password"]', $formSignIn).val('');
      
        // Scroll down
      //smoothScrollTo('#loading-section');
      $(".main").moveTo(sections['loading']);

        // Send request
      $.ajax({
        method: "POST",
        url: '/api/updateUser',
        data: data,
        success: function(data, textStatus, jqXHR)
        {
          //callback methods go right here
          var statusCode = jqXHR.statusCode().status;
          console.log(data, textStatus, jqXHR.statusCode(), statusCode);

          if (statusCode === 201) { // 201 CREATED
            // Success!
            
            //var $userInfo = $('.user-info');
            //$userInfo.html(JSON.stringify(data,null,4));
            //$('#user-calendar-url').attr('href', data.url).text(data.url);
            
            var calendarURL = window.location.origin + data.url;
            
            console.log(calendarURL);
            console.log(data);

            // Display data
            //$('textarea#calendarURL').val(calendarURL).trigger('textareachange'); 
            $('a#calendarURL').text(calendarURL).attr('href', calendarURL);

            // Scroll back up to login
            //smoothScrollTo("#finish-section");
            $(".main").moveTo(sections['finish']);

          } else {
            // Error

            // Scroll back up to login
            //smoothScrollTo("#sign-in-section");
            $(".main").moveTo(sections['sign-in']);
            
            $formSignIn.addClass('error-occured');

          }

        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("An error occured: ", textStatus);

            // Scroll back up to login
            //smoothScrollTo("#sign-in-section");
            $(".main").moveTo(sections['sign-in']);

            $formSignIn.addClass('error-occured');
            
        }
      });

    });

    /*
     $(".scroll").click(function(event){
         event.preventDefault();
         //calculate destination place
         var hash = this.hash;

         smoothScrollTo(hash);
     });
    */

    /*
    function getViewport() {

     var viewPortWidth;
     var viewPortHeight;

     // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
     if (typeof window.innerWidth != 'undefined') {
       viewPortWidth = window.innerWidth,
       viewPortHeight = window.innerHeight
     }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
     else if (typeof document.documentElement != 'undefined'
     && typeof document.documentElement.clientWidth !=
     'undefined' && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth,
        viewPortHeight = document.documentElement.clientHeight
     }

     // older versions of IE
     else {
       viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
       viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
     }
     return [viewPortWidth, viewPortHeight];
    }
    */

    /*
    var resize = function() {
        var viewPort = getViewport();
        $('section').height(viewPort[1]);
    };
    resize();
    $(window).resize(function() {
        resize();
    })
    */


 });