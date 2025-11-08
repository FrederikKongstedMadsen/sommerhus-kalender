# Sommerhus Kalender

A simple vacation house booking calendar built with React and Firebase. This application allows family members to book days in a calendar for renting a vacation house.

## Features

- 📅 Monthly calendar view with navigation
- 🖱️ Single day selection
- 🎯 Range selection (click and drag)
- 🔄 Cross-month booking support
- 👁️ Visual display of existing bookings
- 🚫 Prevent double-booking
- ✏️ Create, update, and delete bookings
- ⚡ Real-time updates via Firebase

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable Firestore Database:

   - Go to "Firestore Database" in the left menu
   - Click "Create database"
   - Start in test mode (we'll update security rules later)
   - Choose a location for your database

4. Get your Firebase configuration:

   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

5. Set up security rules:
   - Go to "Firestore Database" → "Rules"
   - Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /bookings/{document=**} {
         allow read, write: if true;
     }
   }
   ```
   - Note: These rules allow anyone to read/write. For family use, this is acceptable, but you can add authentication later if needed.

### 3. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Deploy:

   ```bash
   vercel
   ```

3. Add your environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all the `VITE_FIREBASE_*` variables from your `.env` file

### Option 2: Deploy to Netlify

1. Install Netlify CLI:

   ```bash
   npm i -g netlify-cli
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Deploy:

   ```bash
   netlify deploy --prod --dir=dist
   ```

4. Add your environment variables in the Netlify dashboard:
   - Go to your site settings
   - Navigate to "Environment variables"
   - Add all the `VITE_FIREBASE_*` variables

## Usage

1. **Select dates**: Click on a date to select it, or click and drag to select a range
2. **Create booking**: Enter your name and click "Opret booking"
3. **Edit booking**: Click on an existing booking to edit or delete it
4. **Navigate months**: Use the "Forrige" (Previous) and "Næste" (Next) buttons to navigate between months

## Project Structure

```
sommerhus-kalender/
├── src/
│   ├── components/
│   │   ├── Calendar.tsx          # Main calendar component
│   │   ├── CalendarDay.tsx       # Individual day cell
│   │   └── BookingForm.tsx       # Booking form
│   ├── services/
│   │   └── firebase.ts           # Firebase service
│   ├── types/
│   │   └── booking.ts            # TypeScript types
│   ├── hooks/
│   │   └── useBookings.ts        # Custom hook for bookings
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase Firestore** - Database

## License

This project is for personal/family use.
