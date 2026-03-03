//@ts-nocheck
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import notifee, { AndroidImportance } from "@notifee/react-native";

export default function NotificationPermissionCard() {
  const [status, setStatus] = useState("Not Checked");

  const requestPermission = async () => {
    if (Platform.Version >= 33) {
      const res = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);

      if (res === RESULTS.GRANTED) {
        setStatus("Granted ✅");
      } else {
        setStatus("Denied ❌");
        return;
      }
    } else {
      setStatus("Auto Granted (Below Android 13)");
    }
  };

  const sendNotification = async () => {
    // Create channel (Android required)
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: "🚀 Test Notification",
      body: "Your notification is working!",
      android: {
        channelId,
        smallIcon: "ic_launcher", // must exist in mipmap
      },
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Notifications</Text>
      <Text>Status: {status}</Text>

      <TouchableOpacity style={styles.btn} onPress={requestPermission}>
        <Text style={styles.btnText}>Request Permission</Text>
      </TouchableOpacity>

      {status.includes("Granted") && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#16a34a" }]}
          onPress={sendNotification}
        >
          <Text style={styles.btnText}>Send Test Notification</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#1f2937",
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    color: "#fff",
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