import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import NitroSound from "react-native-nitro-sound";

export default function MicrophonePermissionCard() {
  const [status, setStatus] = useState("Not Checked");
  const [recording, setRecording] = useState(false);
  const [recordedPath, setRecordedPath] = useState<string | null>(null);

  const requestPermission = async () => {
    const permission =
      Platform.OS === "android"
        ? PERMISSIONS.ANDROID.RECORD_AUDIO
        : PERMISSIONS.IOS.MICROPHONE;

    const res = await request(permission);

    if (res === RESULTS.GRANTED) {
      setStatus("Granted ✅");
    } else {
      setStatus("Denied ❌");
    }
  };

  const startRecording = async () => {
    try {
      const path = await NitroSound.startRecorder();
      setRecordedPath(path);
      setRecording(true);
    } catch (e) {
      console.log("Start recording error:", e);
    }
  };

  const stopRecording = async () => {
    try {
      await NitroSound.stopRecorder();
      setRecording(false);
    } catch (e) {
      console.log("Stop recording error:", e);
    }
  };

  const playRecording = async () => {
    if (!recordedPath) return;

    try {
      await NitroSound.startPlayer(recordedPath);
    } catch (e) {
      console.log("Playback error:", e);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Microphone</Text>
      <Text>Status: {status}</Text>

      <TouchableOpacity style={styles.btn} onPress={requestPermission}>
        <Text style={styles.btnText}>Request Permission</Text>
      </TouchableOpacity>

      {status.includes("Granted") && (
        <>
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: recording ? "#dc2626" : "#16a34a" },
            ]}
            onPress={recording ? stopRecording : startRecording}
          >
            <Text style={styles.btnText}>
              {recording ? "Stop Recording" : "Start Recording"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#9333ea" }]}
            onPress={playRecording}
            disabled={!recordedPath}
          >
            <Text style={styles.btnText}>Play Recording</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    color: "black",
    marginBottom: 5,
  },
  btn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
  },
});