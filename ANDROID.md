# Quick Sales Hub Android App

This project uses Capacitor to package the live Quick Sales Hub web app as an Android app.

## App Details

- App name: Quick Sales Hub
- Android package id: `com.quicksalehub.app`
- Web app URL: `https://www.quicksalehub.com`
- Native project: `android/`

## Commands

```bash
npm install
npm run android:sync
npm run android:open
```

`npm run android:open` opens the project in Android Studio. From there you can run it on an emulator/device or build a release APK/AAB.

## Building Locally

Install Android Studio first, then make sure Android SDK is configured. Gradle needs either:

- `ANDROID_HOME` set in your environment, or
- `android/local.properties` with `sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk`

Debug APK:

```bash
cd android
./gradlew assembleDebug
```

Release builds for Play Store should be signed from Android Studio or configured with a release keystore.

## Notes

The Android app currently opens the production website inside the native shell. Keep the Vercel production deployment healthy because the app depends on `https://www.quicksalehub.com`.
