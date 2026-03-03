//@ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import Geolocation from "react-native-geolocation-service";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from "react-native-permissions";

const PermissionCard = ({
  icon,
  title,
  status,
  statusColor,
  buttonLabel,
  result,
  onPress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={22} color="#5f6c7b" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {status}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>RESULT</Text>
        <Text style={styles.resultText}>{result}</Text>
      </View>
    </View>
  );
};

export default function PermissionHealthScreen() {
  const [status, setStatus] = useState("Checking...");
  const [statusColor, setStatusColor] = useState("#94a3b8");
  const [result, setResult] = useState("Waiting for test...");

  useEffect(() => {
    checkLocationStatus();
  }, []);

  const getPermissionType = () => {
    return Platform.OS === "ios"
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  };

  const checkLocationStatus = async () => {
    const permission = getPermissionType();
    const res = await check(permission);

    if (res === RESULTS.GRANTED) {
      setStatus("Granted");
      setStatusColor("#16a34a");
    } else if (res === RESULTS.DENIED) {
      setStatus("Not Requested");
      setStatusColor("#94a3b8");
    } else if (res === RESULTS.BLOCKED) {
      setStatus("Blocked");
      setStatusColor("#ef4444");
    } else {
      setStatus("Unavailable");
      setStatusColor("#ef4444");
    }
  };

  const requestAndGetLocation = async () => {
    const permission = getPermissionType();
    const res = await request(permission);
    if (res === RESULTS.GRANTED) {
      setStatus("Granted");
      setStatusColor("#16a34a");

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setResult(`Lat: ${latitude}, Long: ${longitude}`);
        },
        error => {
          setResult("Error fetching location");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    } else {
      setStatus("Denied");
      setStatusColor("#ef4444");
      setResult("Permission denied");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.header}>Permission & System Health</Text> */}

        <PermissionCard
          icon="map-pin"
          title="Location"
          status={status}
          statusColor={statusColor}
          buttonLabel="Test"
          result={result}
          onPress={requestAndGetLocation}
        />
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
});