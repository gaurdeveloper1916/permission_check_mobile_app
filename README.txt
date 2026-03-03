// rm -rf node_modules .gradle ios/Pods android/build android/app/build
// git rm -r --cached .
// git add .
// git commit -m "cleanup react native gitignore"


//any new dependencies if installed
cd android
./gradlew clean
cd ..
npx react-native run-android




//for icons issue in react native cli (android)
path - android/app/build.gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"




//for icons issue in react native cli (ios)
path - /ios/employee/Info.plist
inside the </dict> column

<key>UIAppFonts</key>
<array>
	<string>Ionicons.ttf</string>
	<string>MaterialCommunityIcons.ttf</string>
</array>
//for first time run in icons
step 1 - sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

step 2 - it will ask password 
Password:

step 3 - accept license
sudo xcodebuild -license accept



//production build  steps (ANDROID)
Step - 1

npx react-native bundle \
--platform android \
--dev false \
--entry-file index.js \
--bundle-output android/app/src/main/assets/index.android.bundle \
--assets-dest android/app/src/main/res

Step-2
cd android
./gradlew assembleDebug



