
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';

export default function QrScannerScreen({ onCodeScanned, onClose }) {
  const [permission, setPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    let mounted = true;

    const requestPermission = async () => {
      try {
        const result = await Camera.requestCameraPermissionsAsync();
        if (mounted) setPermission(result.granted);
      } catch (error) {
        if (mounted) setPermission(false);
      }
    };

    requestPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBarcodeScanned = ({ data }) => {
    if (scanned || !data) return;

    setScanned(true);

    if (typeof onCodeScanned === 'function') {
      onCodeScanned(String(data).trim());
    }
  };

  if (permission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.message}>Se solicită accesul la cameră...</Text>
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Aplicația nu are permisiunea de a utiliza camera.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Înapoi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>Scanează codul QR</Text>
        <Text style={styles.subtitle}>
          Încadrează codul QR în zona centrală.
        </Text>

        <View style={styles.scanFrame} />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>✕ Închide scanarea</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    backgroundColor: '#0F1115',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 65,
    paddingBottom: 45,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: -45,
  },
  scanFrame: {
    width: 245,
    height: 245,
    borderWidth: 3,
    borderColor: '#60A5FA',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  closeButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
