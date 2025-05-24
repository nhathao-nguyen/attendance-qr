import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface QRScannerProps {
  isVisible: boolean;
  onClose: () => void;
}

const QRCodeScannerComponent = ({ isVisible, onClose }: QRScannerProps) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle successful QR scan
  const onSuccess = async (e: { data: string }) => {
    try {
      setIsSubmitting(true);

      // Submit QR code data to server
      await axios.post('/lessons/scan-qrcode', {
        qrData: e.data
      });

      Alert.alert(
        'Success',
        'Your attendance has been recorded successfully!',
        [
          {
            text: 'OK',
            onPress: onClose
          }
        ]
      );
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.message ||
        'Failed to record attendance. Please try again.';
      
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setIsSubmitting(false);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: onClose
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Processing QR code...</Text>
          </View>
        ) : (
          <>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={onSuccess}
              barcodeScannerSettings={{
                barcodeTypes: ['qr']
              }}
            />
            <View style={styles.overlay}>
              <Text style={styles.instructionText}>
                Point your camera at the QR code displayed by your teacher
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    padding: 16,
    marginTop: 40,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  closeButton: {
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QRCodeScannerComponent;