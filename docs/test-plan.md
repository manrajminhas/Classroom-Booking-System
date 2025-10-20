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

## Quality Attribute Tests

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/48

**Visual testing**  
- Are all of the UI elements in the correct place on the screen?
- Are there any text/icon cut offs, across different screen resolutions?
- Do the UI elements have a helpful text or image description? (e.g. button to book a room says "Book Room" instead of "OK")
- Are elements placed according to industry standards? (e.g. menu bar is at the top of the screen) 

**End-to-end testing** 
- How easy is it to reserve a classroom? Log in with a new account, track how many clicks it takes to book a room. Then, look up the booking information in the "Booking History" tab and ensure the information matches.
- Are error messages helpful? Try to book a room that is already reserved. Error message should be descriptive instead of just stating "An error has occurred".
- Is the process to cancel/edit a booking difficult? Ensure that the user's future bookings appear in the "Upcoming Bookings" page. There should be Edit and Cancel buttons. If Edit clicked, a prompt similar to the one used when booking a room should appear so the user can change the date/time/classroom. If Cancel clicked, a prompt should appear asking the user if they are sure.
- Is the sign-in process easy? Enter a correct and incorrect username/password. If correct info entered, user should immediately be taken to homepage. If incorrect info entered, a prompt should appear stating that the username/password was incorrect and asks if the user wants to reset their password.

##### For the specific QA scenario:
_It takes 6 clicks or less for a staff member to search for classrooms filtered by date, time, building, and capacity, then book an available room if one matches their criteria_

Once the frontend and backend are fully implemented and linked, we can restart the app to a fresh state and follow these steps for a manual test:  

1. Assuming the staff member is already logged in with a valid staff account:
2. The application defaults to the Room Booking page. Enter a valid date, time, building, and attendee count. (max 5 clicks)
3. A corresponding room appears in the list of options. Click on the Book button. A success message appears.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/49

**End-to-end testing:**
- In the login screen, enter a correct username and password. The user should be logged in to the correct account.
- Enter a correct username and incorrect password. A prompt should appear stating that an incorrect username/password was entered and asks if the user wants to reset their password.
- Enter an incorrect username. A prompt should appear stating that the account does not exist.
- Log into a valid staff, registrar, and admin account. After 5 minutes of inactivity, the session should timeout and the user should be logged out.
- If a user attempts to reset their password while they are currently logged in, they should be asked to enter their current password first.
- When a staff member is logged in, they should not be able to access registrar- or admin-only pages.

**Unit tests:**
- The authorize() function can be tested by creating a test user object. Passing in the correct username and password should lead to the test user object being returned.
- If an incorrect username and/or password is passed in, authorize() should return null.
- Test the hasRole() function by passing in a valid user and their valid role; it should return true.
- If an incorrect role for a user is passed in, hasRole() should return false.

##### For the specific QA scenario:
_The system does not allow staff members and registrars to access the system health and configuration page. The "System Configuration" tab is not visible in the menu bar, and pasting in the link results in an "Access Denied" page._

Once and frontend and backend are linked, we can conduct a manual test with the following steps:
1. Log in with a valid staff member account.
2. See the top navigation menu bar. There is no option for System Configuration.
3. Pasting in the URL for the System Configuration page presents the user with an Access Denied page.
4. Repeat steps 1-3 with a valid registrar account.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/50

**End-to-end testing:**
- Log in as a staff member, then reserve any room. In the "Upcoming Bookings" page, the reservation should appear. The information should match the user's initial search criteria.
- Log in with another staff member account now; the same room and timeslot should not be available.
- Reserve a room, then edit the booking through the "Upcoming Bookings" page. Upon changing the date, time, or classroom, the modifications should appear.
- Log in with another staff member account now; the original room and timeslot should be available and ready for booking.
- Reserve a room, then cancel the booking. The reservation should disappear from the "Upcoming Bookings" page.
- Log in with another staff member account now; the room and timeslot should be available and ready for booking.
- After the date and time of a booking has passed, it should appear in the "Booking History" page for no less than 1 year. If the booking is set to repeat, there should be copies of it in both the "Booking History" and "Upcoming Bookings" pages.
- Log in as a registrar, and edit the list of classrooms and/or available times in the "Edit Schedules" page.
- If a staff member already has a booking scheduled in one of the affected classrooms, they should receive a notification of changes/deletion of their booking next time they log in.
- If the registrar adds classrooms to the list, the new rooms should appear as search criteria options when staff members look for available rooms. 
- If the registrar edits or cancels a staff member's reservation, or books one on a staff member's behalf, the staff member should receive a notification next time they log in. 
- Log in as an admin and make changes to the system configuration. The changes should be reflected for all users when the system restarts. The changes and data are preserved on the "System Configuration" page (i.e. the sliders, etc. are not reset to their default values after applying changes).

**Unit tests:**
- Create test classroom objects with associated date/time availabilities. We can call availableRooms() with relevant search criteria as parameters. The matching classroom objects should be returned.
- If non-matching parameters are passed in, availableRooms() should return null.
- Create a test booking object, then call editBooking() with relevant parameters. If the edit was successful, the function returns success. If the edit was unsuccessful (maybe because the room was already booked for the requested time), the function returns an error.
- Repeat with the cancelBooking() function. If the booking exists, the function should always return success.
- With a valid booking, call upcomingBookings(userID) and assert that the booking's information matches.
- After the time of the booking has passed, call bookingHistory(userID) and assert that the correct booking appears.
- Edit system configuration options with the editConfig() function and relevant parameters. The function should return success if valid parameters are passed in. Calling viewConfig() should reflect the recent changes.

We might also consider using a tool to ping the web application consistently to ensure that it remains available most of the time.

##### For the specific QA scenario:
_The system allows staff members to edit their own upcoming booking times and then presents the original bookings as available to other users._

We can follow these steps to conduct a test for this QA scenario:
1. As a staff member, create a booking for any room in the future.
2. Ensure the booking appears in the Booking History page.
3. Ensure the Cancel button appears next to the relevant booking's information.
4. Click the Cancel button. The booking is removed from the list.
5. Now, re-create the booking with the same staff account. The room should appear as available for the requested time. Do not book it.
6. On another valid staff account, re-create the booking. It should succeed.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/51

**Integration tests:**
- As a registrar, edit the list of classrooms in the "Edit Schedule" page. It should be possible to easily edit the list by choosing the relevant building from a search bar (or adding a new building), and then entering the relevant room number. The changes should be reflected in the Postgres database.
- The registrar may also edit or remove the characteristics of a specific classroom (e.g. has projector, class size). The changes should be reflected in the database.
- There should be an option to overwrite or import classroom data from the CSV file containing the classrooms. All insertions, changes, and deletions should be reflected in the database.
- There should also be an option to create/delete users and change their passwords. Relevant changes should be reflected in the database, and should be shown in the results of the getUserInfo() function.
- For system administrators, the system configuration options should be clearly represented on the "System Configuration" page. Making a change to one of the options should be reflected in the return data of the getConfig() function.

**Other tests:**
- We might also consider improving the modifiability of the code by visually inspecting it. We would like to reduce coupling while abstracting common services, like room booking and reservation editing.
- Another test would be to see how long it takes to build upon the features implemented in Implementation I when we begin on Cycle II. If we find ourselves having to edit several functions or modules, there might be room for improvement in regard to modifiability. 

##### For the specific QA scenario:
_A registrar can import a list of classrooms and associated data from a CSV, then choose whether they'd like to add the classrooms to the existing database or completely overwrite it._

We can follow these steps to conduct a test for this QA scenario:
1. Log in with a valid registrar account.
2. Ensure the CSV file is formatted properly; that is, with "Room,Building,Capacity,AV Equipment,Location,URL" columns
3. In the application, click on the "Manage Rooms" button in the navigation bar.
4. In the Manage Rooms page, an option for adding rooms from a CSV appears.
5. Click on the Upload CSV button, and upload the relevant CSV file.
6. Any duplicate rooms are not added, and all new rooms are added to the database. If any errors occur with any rows, a specific error message will appear.

Note: As of October 18, our QA scenario has slightly changed as there will not be an option for choosing whether or not to overwrite the existing classrooms.
Intead, any duplicate classrooms will automatically be skipped.

### https://gitlab.csc.uvic.ca/courses/2025091/SENG350_COSI/teams/group_10_proj/-/issues/52

**System tests:**
- As a staff member, log in and enter the room booking page. Filter the rooms based on any combination of criteria, then time how long it takes for results to appear.
- Select any room to book, then click the "Book Room" button. Time how long it takes for a success message to appear.
- Click on Booking History and Upcoming Bookings on an account with several past and future bookings, and time how long it takes for results to appear.
- Time how long the sign in process takes.
- We'd also like to test how long it takes different pages of the web application to load (e.g. homepage, system health, booking history, edit schedule) and rendering performance for the icons and text.

**Integration tests:**
- Create test bookings with the createBooking() function, then query the database to see how long the searching operation takes.
- Create test classrooms with the addClassroom() function, then query the list of rooms in the database with relevant search criteria to see how long the operation takes.
- Investigate general query performance by checking the database for index usage and caching.

**Stress tests:**
  
If possible, we'd like to conduct stress and load testing by simulating multiple operations happening at once. Tools like JMeter can help us investigate what the performance of the system under stressful conditions is like compared to regularly.

##### For the specific QA scenario:
_A user selects a room to book at a specified date and time while several other operations are occurring, and the booking process completes in 3 seconds or less._

We can follow these steps to conduct a simple test for this QA scenario:
1. While connected to the UVic wifi network, enter a valid room and date in the Create Booking page.
2. Once a room appears and the Book button is clicked, start a stopwatch.
3. The success message should appear and the booking is added to the database in no more than 3 seconds.

Given the nature of our application, it may be difficult to test response times with multiple requests being sent at once, but we could potentially have multiple group members run the application and interact with it at the same time, while one person creates a booking and times how long it takes.
