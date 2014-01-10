// Dependencies
var selfService = require('self-service-banner');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var icalendar = require('icalendar');
var crypto = require('crypto');
var nconf = require('nconf');
// 
var app = express();

// Configuration
nconf
    .argv()
    .env()
    .file('custom', 'config.json')
    .file('config.default.json');

/**
Helper Functions
*/
var getCourses = function (username, password, callback) {
    var s = new selfService;
    s.login({'username': username, 'password': password }, function(error, response, localService) {
        localService.weekAtAGlance({ /*'startDate': new Date()*/ }, function(error, response, courses) {
            return callback(courses);
        });
    });
};
var saveCoursesForUser = function(calendarId, courses, collection, callback) {
    var data = {
        calendarId: calendarId,
        courses: courses
    };
    collection.update({ 'calendarId': calendarId }, data, {upsert:true}, function(err, docs) {
        //console.log(err, docs);
        callback(err, docs);
    });
};
var timeFromStr = function(str) {
    // Ex: "4:00 pm"
    var hours = 0;
    var minutes = 0;
    var s = str.split(':');
    hours = parseInt(s[0]);
    minutes = parseInt(s[1]);
    // Check if 'pm'
    if (s[1].indexOf("pm") != -1) {
        hours += 12;
    }
    return {'hours':hours, 'minutes':minutes }
};
var daysFromDaysArray = function(arr) {
    var days = [ ];
    for (var i=0, len=arr.length; i<len; i++ )
    {
        days.push(dayFromDayStr(arr[i]));
    }
    return days;
};
var dayFromDayStr = function(str) {
    console.log(str);
    var day = "";
    if (str === 'M') // Monday
        day = "MO";
    if (str === 'T') // Tuesday
        day = "TU";
    if (str === 'W') // Wed
        day = "WE";
    if (str === 'R') // Thursday
        day = "TH";
    if (str === 'F') // Friday
        day = "FR";
    if (str === 'S') // Saturday
        day = "SA"
    if (str === 'SU') // Sunday
        day = "SU";
    return day;
};
var jsonToEvent = function(json) {
    console.log(json);
    var vevent = new icalendar.VEvent("event-"+json.crn);
    vevent.setSummary(json.title);
    vevent.setDescription(json.location);
    // Calculate date and event length
    var startDate = json.startDate;
    var startTime = timeFromStr(json.time.start);
    startDate.setHours(startTime.hours, startTime.minutes);
    var endTime = timeFromStr(json.time.end);
    var endDate = new Date(startDate);
    endDate.setHours(endTime.hours, endTime.minutes);
    // console.log(startDate, endDate);
    vevent.setDate(startDate, endDate);

    var days = daysFromDaysArray(json.days);
    console.log(days);
    vevent.addProperty('RRULE', { FREQ: 'WEEKLY', BYDAY: days.join(',') });
    return vevent;
};
var coursesToCalendar = function(courses, callback) {
    console.log(courses);
    // Generate iCalendar file
    var calendar = new icalendar.iCalendar();
    // Replace PRODID
    calendar.properties.PRODID = [];
    calendar.addProperty('PRODID',"-//Saint Mary's University//Calendar//EN");
    // Add events to calendar
    for (var i=0, len=courses.length; i<len; i++)
    {
        var vevent = jsonToEvent(courses[i]);
        calendar.addComponent(vevent);
    }
    return callback(calendar);
};

/**
Main
*/
MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;
    
    var collection = db.collection('bannerCal');

    // Setup Express server
    app.use(express.bodyParser());
    // - Public files
    app.use(express.static(__dirname + '/public'));
    app.use("/bower_components", express.static(__dirname + '/bower_components'));
    
    /**
    =========================================================================
    API
    */
    app.post('/api/updateUser', function(req, res) {
        //console.log('/api/updateUser', req.body);
        var username = req.body.username;
        var password = req.body.password;

        getCourses(username, password, function(courses) {
            //console.log("Retrieved Courses");
            //console.log(courses);

            if (courses.length > 0) {

                // Create secure CalendarId
                var temp = (username + nconf.get('secret'));
                var digest = "hex"
                var calendarId = crypto.createHash('md5').update(temp).digest(digest);
                console.log(calendarId);
                saveCoursesForUser(calendarId, courses, collection, function(err, docs) {
                    console.log('Saved Courses');

                    var url = "/calendar/"+calendarId+"/calendar.ics";
                    res.json({
                        'url': url,
                        'courses': courses
                    }, 201);

                });

            } else {
                res.json({
                    'error': "No courses were found."
                }, 204);
            }

        });

    });

    // Stats
    app.get('/stats.json', function(req, res) {
        // Count
        collection.count(function(err, count) {
            res.json({ 'calendars': count }, 200);
        });

    });
    
    // Calendar
    app.get('/calendar/:calendarId/calendar.ics', function(req, res) {
        console.log('Calendar', req.params);
        var calendarId = req.params.calendarId;

        // Locate all the entries using find
        collection.find({'calendarId': calendarId }).toArray(function(err, results) {
            console.dir(results);
            var result = results[0] || { 'courses': [] };
            var courses = result.courses;

            coursesToCalendar(courses, function(calendar) {
                res.header("Content-Type", "text/calendar; charset=utf-8");
                res.header("Content-Disposition", "inline; filename=calendar.ics");
                res.end(calendar.toString());
            });
        });

    });

    // Start server
    app.listen(process.env.PORT || 3000);

});

