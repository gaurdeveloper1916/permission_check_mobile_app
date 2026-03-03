//@ts-nocheck
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import PermissionCard from "./cards/LocationCard"
import CameraPermissionCard from "./cards/CameraPermissionScreen"; 
import PhotosPermissionCard from "./cards/PhotosPermissionCard";
import MicrophonePermissionCard from "./cards/MicrophonePermissionCard";


export default function PermissionHealthScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Permission & System Health</Text>

        <PermissionCard/>
        <CameraPermissionCard/>
        <PhotosPermissionCard/>
        <MicrophonePermissionCard/>
  
        {/* Run All Button */}
        <TouchableOpacity style={styles.runAllBtn}>
          <Icon name="play" size={18} color="#fff" />
          <Text style={styles.runAllText}> Run All Tests</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
  },

  header: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 13,
  },

  actionButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },

  resultBox: {
    marginTop: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
  },

  resultLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },

  resultText: {
    fontSize: 14,
  },

  runAllBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  runAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});