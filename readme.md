# odin-members-only

This is a project submission for The Odin Project NodeJS Course, Project: Members Only.

This is a message board application with tiered membership levels where users can post messages anonymously until they become members, and admin users can delete messages.

## Features

- **User Authentication**: Sign up, login, and logout functionality using Passport.js and bcrypt for password hashing
- **Membership Tiers**:
  - **Guest Users**: Can view messages but authors and timestamps are hidden
  - **Members**: Can view full message details (author names and timestamps) after entering a secret passcode
  - **Admins**: Have all member privileges plus the ability to delete any message
- **Message System**: Authenticated users can create messages with titles and text
- **Input Validation**: Server-side validation using express-validator for signup, login, and message creation
- **Session Management**: Secure session handling with express-session

## Tech Used

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with node-postgres (pg)
- **Authentication**: Passport.js (Local Strategy) with bcrypt
- **View Engine**: EJS 
- **Validation**: express-validator
- **Session Store**: express-session

## Routes

- `GET /` - Homepage displaying all messages
- `GET/POST /sign-up` - User registration
- `GET/POST /log-in` - User authentication
- `GET /log-out` - User logout
- `GET/POST /club` - Member upgrade (requires secret passcode)
- `GET/POST /message` - Create new message (authenticated users only)
- `POST /message/:id` - Delete message (admin only)
- `GET/POST /admin` - Admin upgrade (requires admin secret passcode)
