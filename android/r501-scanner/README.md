# ClothSync R501 Scanner

Native Android 13 RFID client for the R501/PDA. The app uses Kotlin, Jetpack
Compose, MVVM, Hilt, Retrofit, Room, WorkManager, encrypted session storage, and
the device-provided `android.bld.RFIDManager` service.

## Debug environment

The debug APK is configured through `BuildConfig.API_BASE_URL` for the current
local backend:

```text
https://clothsync.code-xperts.com/api/mobile-scanner/
```

The PDA and backend computer must be on the same network, and the backend must
listen on `0.0.0.0:5001`. Debug permits cleartext LAN HTTP. Release blocks
cleartext and reads `CLOTHSYNC_PRODUCTION_API_URL` from a Gradle property:

```sh
./gradlew assembleRelease -PCLOTHSYNC_PRODUCTION_API_URL=https://api.example.com/api/mobile-scanner/
```

## User flow

Login persists securely and refreshes expired access tokens. The backend returns
the portal type. The user selects an assigned active scanner; Laundry users also
select an incoming batch. Starting a session connects the RFID reader, applies a
1.5-second duplicate debounce, uploads unique EPCs in batches of 25, and shows
processed, rejected, and pending-offline counters. Offline requests retain their
request ID in Room and retry through WorkManager with exponential backoff.

## Build and test

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17 \
ANDROID_HOME=/opt/homebrew/share/android-commandlinetools \
./gradlew testDebugUnitTest lintDebug assembleDebug
```

Debug APK: `app/build/outputs/apk/debug/app-debug.apk`

Install: `adb install -r app/build/outputs/apk/debug/app-debug.apk`

The `r501-stubs` module is compile-only. Vendor framework code is not bundled.
