//@ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings
} from 'react-native-permissions';
import NitroSound from 'react-native-nitro-sound';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ORANGE = '#ed8c31';

Geocoder.init('AIzaSyD0hbAbCDsDvZSvCF8g50RhLpd89Htk2vA'); // add your key

const SubmissionDetails = () => {

  /* ---------------- STATES ---------------- */

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [recording, setRecording] = useState(false);
  const [recordedPath, setRecordedPath] = useState(null);
  const [selectedImage, setSelectedImage] = React.useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);


  //
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success'); // success | error
  const [modalMessage, setModalMessage] = useState('');

  const [seconds, setSeconds] = useState(0);
  const [voiceDenyCount, setVoiceDenyCount] = useState(0);


  /* ---------------- AUTO LOCATION ON LOAD ---------------- */

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const [denyCount, setDenyCount] = useState(0);
  const [denyCountLocation, setDenyCountLocation] = useState(0)



  /* ---------------- Access Camera ---------------- */
  const openCamera = async () => {
    try {
      const permission = getCameraPermission();
      const res = await request(permission);

      console.log("Camera permission:", res);

      if (res === RESULTS.GRANTED) {
        launchDeviceCamera();
        return;
      }

      // handle denied / blocked
      handlePermissionDenied(res);

    } catch (error) {
      console.log("Camera error:", error);
    }
  };

  const launchDeviceCamera = () => {
    const options = {
      mediaType: "photo",
      cameraType: "back",
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {

      if (response?.didCancel) {
        console.log("User cancelled camera");
        return;
      }

      if (response?.errorCode) {
        console.log("Camera error:", response.errorMessage);
        return;
      }

      const asset = response?.assets?.[0];

      if (asset) {
        setSelectedImage(asset);
        console.log("Image URI:", asset.uri);
      }
    });
  };
  const handlePermissionDenied = (status) => {
    if (status !== RESULTS.DENIED && status !== RESULTS.BLOCKED) return;

    const newCount = denyCount + 1;
    setDenyCount(newCount);

    console.log("Permission denied:", newCount);

    // open settings after 3 attempts
    if (newCount >= 3) {
      openSettings().catch(() =>
        console.log("Cannot open settings")
      );
    }
  };
  /* ---------------- Access Camera ---------------- */

  const getCameraPermission = () => {
    return Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (!result.didCancel && result.assets?.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };


  /* ---------------- Location ---------------- */

  const requestLocationPermission = async () => {
    try {
      const permission = getLocationPermission();
      const res = await request(permission);

      console.log("Location permission:", res);

      if (res === RESULTS.GRANTED) {
        setLocationGranted(true);
        fetchDeviceLocation();
        return;
      }

      handleLocationPermissionDenied(res);

    } catch (error) {
      console.log("Location permission error:", error);
    }
  };

  const getLocationPermission = () => {
    return Platform.OS === "android"
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  };
  const handleLocationPermissionDenied = (status) => {
    if (status !== RESULTS.DENIED && status !== RESULTS.BLOCKED) return;

    const newCount = denyCountLocation + 1;
    setDenyCountLocation(newCount);

    console.log("Location permission denied:", newCount);

    if (newCount >= 3) {
      openSettings().catch(() =>
        console.log("Cannot open settings")
      );
    }
    setLocationGranted(false);
  };

  const fetchDeviceLocation = () => {
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        setLatitude(latitude);
        setLongitude(longitude);

        try {
          const geo = await Geocoder.from(latitude, longitude);

          const formattedAddress =
            geo?.results?.[0]?.formatted_address || "";

          setAddress(formattedAddress);

        } catch (error) {
          console.log("Geocoder error:", error);
        }
      },
      (error) => {
        console.log("Location error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };
  /* ---------------- Location ---------------- */


  /* ---------------- VOICE ---------------- */
  useEffect(() => {
    let interval;

    if (recording) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);

  }, [recording]);


  /* -------- permission request -------- */

  const toggleRecording = async () => {
    try {

      const permission = getMicrophonePermission();

      const res = await request(permission);

      console.log("Mic permission:", res);

      if (res === RESULTS.GRANTED) {
        handleRecording();
        return;
      }

      handleVoicePermissionDenied(res);

    } catch (error) {
      console.log("Mic error:", error);
    }
  };


  /* -------- permission getter -------- */

  const getMicrophonePermission = () => {
    return Platform.OS === "android"
      ? PERMISSIONS.ANDROID.RECORD_AUDIO
      : PERMISSIONS.IOS.MICROPHONE;
  };


  /* -------- permission denied handler -------- */

  const handleVoicePermissionDenied = (status) => {

    if (status !== RESULTS.DENIED && status !== RESULTS.BLOCKED) return;

    const newCount = voiceDenyCount + 1;
    setVoiceDenyCount(newCount);

    console.log("Mic permission denied:", newCount);

    if (newCount >= 3) {
      openSettings().catch(() =>
        console.log("Cannot open settings")
      );
    }

  };


  /* -------- recording start/stop -------- */

  const handleRecording = async () => {

    try {

      if (!recording) {

        const path = await NitroSound.startRecorder();

        setRecordedPath(path);
        setRecording(true);
        setSeconds(0);

        console.log("Recording started:", path);

      } else {

        await NitroSound.stopRecorder();

        setRecording(false);

        console.log("Recording stopped");

      }

    } catch (error) {
      console.log("Recorder error:", error);
    }

  };


  /* -------- play recording -------- */

  const playRecording = async () => {

    try {

      if (!recordedPath) return;

      await NitroSound.startPlayer(recordedPath);

    } catch (error) {
      console.log("Play error:", error);
    }

  };


  /* -------- format timer -------- */

  const formatTime = () => {

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = () => {
    const finalLocation = locationGranted ? address : manualAddress;

    // First Name validation
    if (!form.firstName.trim()) {
      // Alert.alert('Validation Error', 'First Name is required.');
      setModalType('error');
      setModalMessage('First Name is required.');
      setModalVisible(true);
      return;
    }

    // Email validation
    if (!form.email.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      setModalType('error');
      setModalMessage('Email is required.');
      setModalVisible(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      // Alert.alert('Validation Error', 'Please enter a valid Email address.');
      setModalType('error');
      setModalMessage('Email is required.');
      setModalVisible(true);
      return;
    }

    // Image validation
    if (!selectedImage) {
      // Alert.alert('Validation Error', 'Please upload or capture an image.');
      setModalType('error');
      setModalMessage('Please upload or capture an image.');
      setModalVisible(true);
      return;
    }

    // Location validation
    if (!finalLocation || finalLocation.trim() === '') {
      // Alert.alert('Validation Error', 'Please provide your location.');
      setModalType('error');
      setModalMessage('Please provide your location.');
      setModalVisible(true);
      return;
    }

    const payload = {
      ...form,
      image: selectedImage,
      voiceRecording: recordedPath, // optional
      latitude,
      longitude,
      address: finalLocation,
    };

    console.log('FINAL SUBMISSION OBJECT:', payload);
    // Alert.alert('Success ✅', 'Submitted Successfully');
    setModalType('success');
    setModalMessage('Submitted Successfully 🎉');
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

      <View style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submission Details</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >

          {/* PERSONAL INFO */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>PERSONAL INFO</Text>

            <TextInput
              placeholder="First Name"
              style={styles.input}
              onChangeText={v => setForm({ ...form, firstName: v })}
            />
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              onChangeText={v => setForm({ ...form, lastName: v })}
            />
            <TextInput
              placeholder="Email Address"
              style={styles.input}
              onChangeText={v => setForm({ ...form, email: v })}
            />
          </View>

          {/* MEDIA SUBMISSION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>MEDIA SUBMISSION</Text>

            {!selectedImage ? (
              <View style={styles.mediaRow}>
                <TouchableOpacity style={styles.mediaBox} onPress={openCamera}>
                  <Feather name="camera" size={26} color={ORANGE} />
                  <Text style={styles.mediaText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaBox} onPress={openGallery}>
                  <Feather name="image" size={26} color={ORANGE} />
                  <Text style={styles.mediaText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.previewImage}
                />

                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* VOICE MEMO */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>VOICE MEMO</Text>

            <View style={styles.voiceContainer}>
              <TouchableOpacity
                style={[
                  styles.micButton,
                  recording && { backgroundColor: '#dc2626' },
                ]}
                onPress={toggleRecording}
              >
                <Feather name="mic" size={20} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.voiceText}>
                {recording ? 'Recording...' : 'Tap to record'}
              </Text>

              {!recording && recordedPath && (
                <TouchableOpacity
                  onPress={playRecording}
                  style={{ marginLeft: 10 }}
                >
                  <Feather name="play-circle" size={28} color={ORANGE} />
                </TouchableOpacity>
              )}

              <Text style={styles.timer}>{formatTime()}</Text>
            </View>
          </View>

          {/* LOCATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>LOCATION</Text>

            {locationGranted ? (
              <Text style={{ marginBottom: 10 }}>
                {address || 'Fetching location...'}
              </Text>
            ) : (
              <TextInput
                placeholder="Enter location manually"
                style={styles.input}
                value={manualAddress}
                onChangeText={setManualAddress}
              />
            )}

            <TouchableOpacity
              style={styles.locationButton}
              onPress={requestLocationPermission}
            >
              <Feather name="crosshair" size={18} color={ORANGE} />
              <Text style={styles.locationText}>
                Use current location
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* FIXED BUTTON */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Request</Text>
          </TouchableOpacity>
        </View>

      </View>
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View
              style={[
                styles.iconCircle,
                modalType === 'success'
                  ? { backgroundColor: '#DCFCE7' }
                  : { backgroundColor: '#FEE2E2' },
              ]}
            >
              <Feather
                name={modalType === 'success' ? 'check' : 'x'}
                size={28}
                color={modalType === 'success' ? '#16A34A' : '#DC2626'}
              />
            </View>

            <Text style={styles.modalTitle}>
              {modalType === 'success' ? 'Success' : 'Oops!'}
            </Text>

            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </SafeAreaView>

  );
};

export default SubmissionDetails;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 15,
    letterSpacing: 1,
  },

  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    fontSize: 14,
  },

  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    marginBottom: 15,
  },

  removeImageBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  mediaBox: {
    flex: 0.48,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: ORANGE,
    borderRadius: 18,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#FFF6ED',
  },

  mediaText: {
    marginTop: 8,
    color: ORANGE,
    fontWeight: '600',
  },

  voiceContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  micButton: {
    backgroundColor: ORANGE,
    padding: 14,
    borderRadius: 40,
  },

  voiceText: {
    marginLeft: 12,
    color: '#6B7280',
  },

  waveContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  wave: {
    width: 4,
    height: 18,
    backgroundColor: ORANGE,
    marginHorizontal: 2,
    borderRadius: 4,
  },

  timer: {
    marginLeft: 'auto',
    fontWeight: '600',
    color: '#111',
  },

  mapWrapper: {
    backgroundColor: '#C8D6CE',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },

  mapImage: {
    width: 120,
    height: 160,
    borderRadius: 10,
  },

  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 14,
    justifyContent: 'center',
  },

  locationText: {
    marginLeft: 6,
    color: '#111',
    fontWeight: '600',
  },

  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,

  },

  submitBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
  },

  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },


  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },

  modalMessage: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
  },

  modalButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});