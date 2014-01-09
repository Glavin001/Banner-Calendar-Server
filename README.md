Banner-Calendar-Server
======================

Service that serves iCal files for registered users, of their Student Calendars.

## Trying `Banner Calendar`
Go to [http://society.cs.smu.ca:1234/](http://society.cs.smu.ca:1234/) and sign up with your SMU Self-Service Banner credentials. See [security below](#security) if you have any concerns.

### Updating Calendar
We do not store your login data, and so cannot login again to update. Whenever you change your course schedule, simply login once again and your schedule will be updated. Be sure to *refresh* on your Calendar clients.

### Important
We will be upgrading this soon to be even more secure (see [security](#secutiry) below). When that happens, the service will be cleared and restarted. Please come back here and login once again and continue using.

## How It Works

Powered by [Self Service Banner API for Node.js](https://github.com/SMU-CS-and-Math-Society/Self-Service).

1. The user is presented with a simple login form, asking for their username (`A-number`) and password (`PIN`). The user enters their Self Service Banner credentials.
2. The server signs in as the user.
3. The server reads the user's courses and retrieves their scheduled class times.
4. The server uses [Expressjs](http://expressjs.com/) to serve an [iCalendar file](http://en.wikipedia.org/wiki/ICalendar) created by [node-icalendar](https://github.com/tritech/node-icalendar).
5. A URL is displayed to the user that they can [subscribe to in their Calendar client](http://support.apple.com/kb/ht5029).

That's it! Now the user has an automated calendar.

----- 

#### Security

Only the fetched calendar data and a [hash](http://en.wikipedia.org/wiki/Cryptographic_hash_function) of the user's `A-number` / Username is stored in the [MongoDB](http://www.mongodb.org/) on the server. THe URL displayed is using the [secretly salted hash](http://en.wikipedia.org/wiki/Salt_(cryptography)), such that another user cannot simply type in an `A-number` of a friend or other user and see their course calendar.
