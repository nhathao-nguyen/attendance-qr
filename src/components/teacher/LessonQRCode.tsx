import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface LessonQRCodeProps {
  lessonId: string;
  onRefresh?: () => void;
}

const LessonQRCode = ({ lessonId, onRefresh }: LessonQRCodeProps) => {
  const [qrData, setQRData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate QR code
  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/lessons/${lessonId}/qrcode`);
      
      setQRData(response.data.qrCode.data);
      setExpiresAt(new Date(response.data.qrCode.expiresAt));
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate QR code';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate time left and update timer
  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft(0);
        setQRData(null);
        setExpiresAt(null);
        return;
      }
      
      setTimeLeft(Math.floor(diff / 1000));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance QR Code</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating QR code...</Text>
        </View>
      ) : qrData ? (
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={200}
            color="#000"
            backgroundColor="#fff"
          />
          
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.timerText}>
              Expires in: {formatTimeLeft()}
            </Text>
          </View>
          
          <Text style={styles.instructionText}>
            Students can scan this QR code to record their attendance
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateQRCode}
          disabled={isLoading}
        >
          <Ionicons name="qr-code-outline" size={24} color="#fff" />
          <Text style={styles.generateButtonText}>Generate QR Code</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    marginLeft: 8,
    fontWeight: '600',
    color: Colors.primary,
  },
  instructionText: {
    textAlign: 'center',
    marginTop: 16,
    color: Colors.textLight,
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LessonQRCode; 