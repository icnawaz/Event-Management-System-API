# Event-Management-System-API
Event management which involves CRUD operation with authentication and authorization

USER :
- Register User
- Login / Logout User
- Change Password, Reset and Update Password

EVENT : 
- Create event
- Update event
- Invite user for a event
- Get event details [Pagination, Sorting, Search Filter, Date Filter]
- See your created event and event in which you are invited

create your .env file and insert the following

MONGODB_URI = your mongodb connect uri

ACCESS_TOKEN_SECRET = your access token secret
[you can create your ACCESS_TOKEN_SECRET through Event-Management-System-API/helpers/generateKeys.js]

Note: I have used redis for this
