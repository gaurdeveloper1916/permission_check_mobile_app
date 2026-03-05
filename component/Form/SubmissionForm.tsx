//@ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const ORANGE = '#FF7A00';

export default function SubmissionDetails() {

  /* ---------------- STATES ---------------- */

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [recording, setRecording] = useState(false);

  /* ---------------- PERMISSIONS ---------------- */

  const requestCameraPermission = async () => {
    const res = await request(PERMISSIONS.ANDROID.CAMERA);
    return res === RESULTS.GRANTED;
  };

  const requestLocationPermission = async () => {
    const res = await request(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    );
    return res === RESULTS.GRANTED;
  };

  const requestMicPermission = async () => {
    const res = await request(
      PERMISSIONS.ANDROID.RECORD_AUDIO
    );
    return res === RESULTS.GRANTED;
  };

  /* ---------------- CAMERA ---------------- */

  const takePhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return Alert.alert('Camera permission denied');

    launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.assets?.length) {
        setPhoto(res.assets[0].uri);
      }
    });
  };

  /* ---------------- GALLERY ---------------- */

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (res.assets?.length) {
        setPhoto(res.assets[0].uri);
      }
    });
  };

  /* ---------------- LOCATION ---------------- */

  const getLocation = async () => {
    const granted = await requestLocationPermission();
    if (!granted) return;

    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
      },
      () => Alert.alert('Location error'),
      { enableHighAccuracy: true }
    );
  };

  /* ---------------- VOICE (Mock Recorder) ---------------- */

  const toggleRecording = async () => {
    const granted = await requestMicPermission();
    if (!granted) return;

    setRecording(!recording);
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = () => {
    const payload = {
      ...form,
      photo,
      location,
      voiceRecorded: recording,
    };

    console.log('SUBMIT DATA', payload);
    Alert.alert('Submitted ✅', JSON.stringify(payload, null, 2));
  };


  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F4" />

      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} />
        <Text style={styles.headerTitle}>Submission Details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>

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
            placeholder="Email"
            style={styles.input}
            onChangeText={v => setForm({ ...form, email: v })}
          />
        </View>

        {/* MEDIA */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>MEDIA SUBMISSION</Text>

          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaBox} onPress={takePhoto}>
              <Feather name="camera" size={26} color={ORANGE} />
              <Text style={styles.mediaText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaBox} onPress={openGallery}>
              <Feather name="image" size={26} color={ORANGE} />
              <Text style={styles.mediaText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {photo && (
            <Image source={{ uri: photo }} style={{ height: 150, marginTop: 15, borderRadius: 12 }} />
          )}
        </View>

        {/* VOICE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>VOICE MEMO</Text>

          <View style={styles.voiceContainer}>
            <TouchableOpacity style={styles.micButton} onPress={toggleRecording}>
              <Feather name="mic" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.voiceText}>
              {recording ? 'Recording...' : 'Tap to record'}
            </Text>
          </View>
        </View>

        {/* LOCATION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>LOCATION</Text>

          {location && (
            <Text>
              Lat: {location.latitude} | Lng: {location.longitude}
            </Text>
          )}

          <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
            <Feather name="crosshair" size={18} color={ORANGE} />
            <Text style={styles.locationText}>Use current location</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* SUBMIT */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

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
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
  },

  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});