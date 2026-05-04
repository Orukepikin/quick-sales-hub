# Quick Sales Hub Native Mobile App

This is the native Android app for Quick Sales Hub. It is separate from the browser web app.

The web app remains available at:

```text
https://www.quicksalehub.com
```

The native app uses React Native/Expo screens and talks to the existing production API at the same domain.

## Run Locally

```bash
cd mobile
npm install
npm run start
```

For Android:

```bash
npm run android
```

## Build

Use EAS for release builds:

```bash
npm run build:android
```

For a local development build, use Expo/Android Studio after installing the Android SDK.

## Current Native Features

- Email signup/login
- Browse real listings from the production API
- View listing details
- Contact sellers through WhatsApp
- Post listings with native image picker
- Edit profile and contact details
- View notifications
- Full in-app message conversations
- Driver verification submission and approval status
- Admin stats and recent orders for admin accounts
- Native tab navigation

Google sign-in should be implemented with native OAuth credentials before Play Store release. Email/password login is available now.

## Web App

Do not remove the Next.js app at the repository root. It remains the standalone browser app and Vercel deployment.
