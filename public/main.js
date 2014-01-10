$(document).ready(function() {

    // Request Stats
    $.ajax({
        method: "GET",
        url: '/api/stats.json',
        success: function(data, textStatus, jqXHR)
        {
            console.log(data);
            $('.cal-count').text(data.calendars);
        }
    });


    var sections = {
        'main': 1,
        'sign-in': 2,
        'loading': 3,
        'finish': 4,
        'help': 5
    };

    /*
    // Make Textarea read-only, source: http://stackoverflow.com/a/15518726/2578205
    $('textarea[readonly]').removeAttr('readonly').each(function () {
                var $this = $(this);
                $this.hide().after('<div data-textarea="'+$this.attr('id') +'" class="textarea">' + $this.val() + '</div>');
            }).on('textareachange', function () {
                var $this = $(this);
                $('[data-textarea="'+$this.attr('id')+'"]').html($this.val());
            });
    */

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

    $('.getting-started-btn').click(function() {
        smoothScrollTo('#sign-in-section');
    })

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
      smoothScrollTo('#loading-section');

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
            smoothScrollTo("#finish-section");

          } else {
            // Error

            // Scroll back up to login
            smoothScrollTo("#sign-in-section");
            
            $formSignIn.addClass('error-occured');

          }

        }, 
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("An error occured: ", textStatus);

            // Scroll back up to login
            smoothScrollTo("#sign-in-section");

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
    
    var resize = function() {
        var viewPort = getViewport();
        $('section').height(viewPort[1]);
    };
    resize();
    $(window).resize(function() {
        resize();
    })
    

 });