# ConnectSphere — a small social app

ConnectSphere is a beginner-friendly full-stack social app with an off-white, glossy interface. It includes email OTP signup, JWT cookie authentication, posts, likes, comments, profile editing, image uploads and Socket.IO conversations.

## Project layout

```text
frontend/   React + Vite + Tailwind CSS
backend/    Express + MongoDB + Socket.IO
```

## Run locally

1. Create a MongoDB database (local MongoDB works fine), then copy the two example environment files.
2. Fill in `backend/.env`. Gmail settings are optional in development: when omitted, the generated OTP is printed in the backend terminal.
3. Install and start each app in a separate terminal:

```bash
cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`, and the API runs at `http://localhost:5000`.

## Features

- Sign up with a six-digit email OTP; sign in using email or username
- Secure HTTP-only JWT cookie, bcrypt password hashing, protected API routes
- Create image posts, like/unlike, comment, and browse recent posts
- Edit display name, username, bio, password, and profile photo
- Live direct messages through Socket.IO
- Responsive, accessible glass UI for phone, tablet and desktop

## Notes

Image files are saved locally in `backend/uploads`. For production, replace this with Cloudinary/S3 and change the generated `avatar`/`image` URL. This project intentionally keeps the data model and controllers small enough to understand in one sitting.
