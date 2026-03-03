//@ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { launchImageLibrary } from "react-native-image-picker";

export default function PhotosPermissionCard() {
  const [status, setStatus] = useState("Not Checked");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const getPermission = () => {
    if (Platform.OS === "android") {
      return Platform.Version >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    }
  };

  const requestPermission = async () => {
    const res = await request(getPermission());

    if (res === RESULTS.GRANTED) {
      setStatus("Granted ✅");
      openGallery();
    } else {
      setStatus("Denied ❌");
    }
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: "photo" },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.log(response.errorMessage);
          return;
        }

        const selectedImage = response.assets[0];
        setImage(selectedImage);
      }
    );
  };

  const uploadImage = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("photo", {
      uri: image.uri,
      type: image.type,
      name: image.fileName || "photo.jpg",
    });

    try {
      setUploading(true);

      const res = await fetch("https://httpbin.org/post", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await res.json();
      console.log("Upload Success:", data);
      alert("Upload Successful ✅");
    } catch (error) {
      console.log(error);
      alert("Upload Failed ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Photos & Media</Text>
      <Text>Status: {status}</Text>

      <TouchableOpacity style={styles.btn} onPress={requestPermission}>
        <Text style={styles.btnText}>Pick Image</Text>
      </TouchableOpacity>

      {image && (
        <>
          <Image source={{ uri: image.uri }} style={styles.preview} />

          <TouchableOpacity style={styles.uploadBtn} onPress={uploadImage}>
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Upload Image</Text>
            )}
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
  uploadBtn: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
  },
  preview: {
    marginTop: 10,
    height: 200,
    borderRadius: 8,
  },
});