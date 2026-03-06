import { Platform } from 'react-native';
import {
  check,
  request,
  RESULTS,
  openSettings,
  PERMISSIONS,
} from 'react-native-permissions';

export const requestAppPermission = async (type) => {
  let permission;

  switch (type) {
    case 'camera':
      permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;
      break;

    case 'location':
      permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      break;

    case 'microphone':
      permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.MICROPHONE
          : PERMISSIONS.ANDROID.RECORD_AUDIO;
      break;

    default:
      return false;
  }

  const status = await check(permission);

  if (status === RESULTS.GRANTED) {
    return true;
  }

  if (status === RESULTS.DENIED) {
    const res = await request(permission);
    return res === RESULTS.GRANTED;
  }

  if (status === RESULTS.BLOCKED) {
    openSettings();
    return false;
  }

  return false;
};


const openCamera = async () => {
  const granted = await requestAppPermission('camera');

  if (!granted) return;

  launchCamera({
    mediaType: 'photo',
    cameraType: 'back',
  }, response => {
    if (response.assets) {
      setSelectedImage(response.assets[0]);
    }
  });
};