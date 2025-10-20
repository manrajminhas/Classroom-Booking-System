# Test Plan

We plan on using a combination of automated and manual tests to verify the functionality and quality of our application.  
We are using Vitest to conduct automated tests for each module of the application.  

## User Story Tests 

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/1

**Test 1 - system test:**

Staff member with an existing account opens the login page. 
They enter their correct username and password.
They click “Login”.
The system logs the user into their account, and the user sees the homepage. 

**Test 2 - system test:**

Staff member opens the login page. 
They enter incorrect credentials. 
They click “Login”.
The system does not log them in and returns a message: “Incorrect password or username was entered”

**Test 3 - unit test:**

We also plan on unit testing our authorize() function once it has been implemented, using Vitest. We will create a test user object, then assert that passing in the correct username and password as parameters into the authorize() function returns success. If we pass in an incorrect username and/or password, we expect that the function will return an error or null, depending on how it is implemented.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/2

**Test 1 - system test:**

The staff member is on the “Booking Room” page. 
They search for the building they want to book a room in. 
After the search, the user clicks on a room. The returned rooms match the user's search criteria.
The room page appears, showing a week's worth of options of when they can book. 
The user clicks on the first time frame within the week calendar and then clicks on the end time of the calendar. 
Once both a start and end date have been chosen, all time squares (30 minute periods) are darkened to show the total timeframe. 
The user clicks the “Book” button located below the calendar. 
They get a visual and email notification saying the time slot was successfully booked. 

**Test 2 - system test:**

Repeat test 1, but search by class size. Expect same result if applicable rooms are available.

**Test 3 - system test:**

Repeat test 1, but search by time and date. Expect same result if applicable rooms are available.

**Test 4 - system test:**

Repeat test 1, but apply combinations of building/time/date/class size. Expect same result if applicable rooms are available.

**Test 5 - unit test:**

We can test our filterRooms() function by creating test room objects with various dates, times, class sizes, and buildings. We can call filterRooms() with parameters that match one or more of the characteristics of the test rooms and assert that the applicable test rooms are returned.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/3

**Test 1 - system test:**

On the staff homepage, select the “Manage Bookings” tab within the navigation bar. The “Manage Bookings” page appears. Click on one of the bookings. The booking opens. Click on the “Cancel Booking” button. A success message appears. The user is redirected back to the “Manage Bookings” page, and the booking no longer appears on the page.  

**Test 2 - system test:**

Repeat test 1, then log in with another staff ID. When they search for a room that matches the cancelled booking, the room should appear as available and the staff member should be able to successfully book it. 

**Test 3 - system test:**

Go to the "Manage Bookings" tab when no rooms are currently booked. No results should appear.

**Test 4 - integration test:**

We can test this by creating a booking in Postgres, then calling our cancelBooking() function with the correct booking ID. We should assert that the booking is then removed from the database, and that querying again shows that the room at that timeslot is free.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/4

**Test 1 - system test:**

Using a staff account with previous bookings in the last year, on the staff homepage, click on the “Booking History” button, within the navigation bar. Check that the “Booking History” page appears. Ensure that all previous booking history for up to a year appears within the booking history. 

**Test 2 - system test:**

Repeat test 1 using an account without previous bookings in the past year. In the "Booking History" page, no results should appear.

**Test 3 - integration test:**

We can insert some test bookings for a test user into the Postgres database that are more than a year old, and some that are less than a year old. We can then assert that our getHistory() function only returns the bookings in the database that are less than 1 year old.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/19

**Test 1 - system test:**

1. Login using a registrar account. 
2. Navigate to the “Book Room” page. 
3. Search up a desired classroom. 
4. The registrar can change the status of the room to be closed or open for booking.

**Test 2 - integration test:**

We can insert some classroom options for the registrar to be able to access. With this access, we can assert the OpenClassroom(classroom) and CloseClassroom(classroom) functions and ensure that they return a 1 (1 for open) and 0 (for closed) when called. 

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/20

**Test 1 - System test:**

1. Login as a registrar. 
2. Navigate to the “Book Room” page. 
3. Search up a desired classroom. 
4. The registrar can cancel any bookings that have been made for the classroom.

**Test 2 - Integration test:**

We can register bookings for a classroom space in the Postgres database. Then assert that our CancelBooking(booking_id) function correctly removes a booking and opens up new time slots by calling GetOpenTimes() and seeing that it returns the time frame from the booking we inserted.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/21

**Test 1 - System test:**

1. As a registrar, I navigate to the “Manage Users” button on the navigation bar. 
2. In the "Manage Users" page, I can search for a specific account. 
3. Click on the account. 
4. Check that the account’s profile appears. 
5. Within the account profile click on “Blacklist”.
6. Login to the account that was blacklisted. 
7. Navigate to a classroom booking. 
8. Attempt to book a classroom. 
9. Check that a message is returned saying “Classroom cannot be booked as your account does not have permission”

**Test 2 - Integration test:**

We can start by calling the function BlockUser(UserID). Then assert that calling BookRoom(UserID, RoomID, Start-Date-Time, End-Date-Time) where UserID is the id of the account was just blocked will return "Classroom cannot be booked as your account does not have  permission".

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/22

**Test 1 - System test:**

1. Login to a registrar account. 
2. Click on the “Statistics” button in the navigation bar. 
3. Check that the statistics page appears. 
4. Under “Classroom Statistics”, search a classroom. 
5. Click on the desired classroom. 
6. Check that the classroom’s statistics page appears. 
7. Check that there is information on how often the classroom has been booked within the past year. 

**Test 2 - System test:**

Repeat test 1 but for a classroom that has had no previous statistics within the past year (add at least one from over a year ago) and ensure that no data is returned.

**Test 3 - Integration test:**

We can insert some test statistics into the database for up to a year. Then, assert that getStatistic() function only returns data from within the past year.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/23

**Test 1 - System test:**

1. Login to a registrar account. 
2. Click on the “Statistics” button in the navigation bar. 
3. Check that the statistics page appears. 
4. In the "Recent Errors" section, a list of recent booking failures and conflicts appears.
5. Clicking on one of the errors, you can see relevant information such as date and time, and affected users and rooms.

**Test 2 - Integration test:**

We can insert some test logs into the Postgres database. We can then assert that the getAccessLogs() function returns all failure logs for the system and that the date, time, and users match the test data.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/24

**Test 1 - System test:**

1. Login as a registrar. 
2. Navigate to the “Book Room” page. 
3. Search up a classroom without any current bookings. 
4. Click on the desired classroom. 
5. Check that you can book the desired classroom for another user.

**Test 2 - System test:**

1. Login as a registrar 
2. Navigate to the “Book Room” page. 
3. Search up a desired classroom with one or more bookings.
4. The registrar can cancel any bookings that have been made for the classroom. 

**Test 3 - Integration test:**

Insert some user bookings into the database. Then assert that CancelBooking(BookingID) removes a booking; this can be checked with GetOpenTimes() function as it will return open bookings.

**Test 4 - Integration test:**

Assert that calling bookRoom(UserID) books a room, this can be checked by calling GetOpenTimes() and checking that the times booked do not appear in the list returned.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/25

**Test 1 - System test:**

1. Login as an admin user. 
2. In the navigation bar, click on “System Configuration” 
3. Check that the appropriate system-level configuration options can be altered.
4. The changes are reflected for staff and registrar accounts after the system restarts (try logging in with one of each).
5. The options in the "System Configuration" page are preserved.

**Test 2 - Unit test:**

In a fresh instance, call getSystemConfigs() and check that all system-level configuration options match the default values.

**Test 3 - Integration test:**

Call updateSystemConfigs(<a new value for each different config>), then assert getSystemConfigs() and ensure each of the values has been changed.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/26

**Test 1 - System test:**

1. Login as a staff member.
2. Go to several different pages and book a room (see test #2 for how this is done).
3. Login as an admin.
4. Click on “Logs” in the navigation bar. 
5. Under the “Access Logs” page, review that you can see all actions you conducted as the user. 

**Test 2 - Integration test:**

We can insert audit records into the Postgres database. We can then assert that calling auditRecords() returns the data added into the records.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/27

**Test 1 - System test:**

1. Login as an admin. 
2. Click on “Logs” in the navigation bar 
3. Under “Health Records”, check that you can see information like uptime, performance metrics, and status of dependencies like the Postgres database.

**Test 2 - Integration test:**

We can assert that calling systemHealth() returns the expected data regarding the system.