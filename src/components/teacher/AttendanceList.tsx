import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentCode: string;
  profilePicture?: string;
}

interface AttendanceRecord {
  _id: string;
  student: Student;
  ipAddress: string;
  scannedAt: string;
}

interface AttendanceListProps {
  lessonId: string;
  onClose?: () => void;
}

const DEFAULT_PROFILE_IMAGE = 'https://ui-avatars.com/api/?background=random';

const AttendanceList = ({ lessonId, onClose }: AttendanceListProps) => {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch attendance list
  const fetchAttendanceList = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const response = await axios.get(`/lessons/${lessonId}/attendance`);
      setAttendanceList(response.data.attendanceList);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load attendance list';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAttendanceList();
  }, [lessonId]);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    fetchAttendanceList(false);
  };

  // Get profile image source
  const getProfileImageSource = (student: Student) => {
    if (student.profilePicture) {
      return { uri: student.profilePicture };
    }
    
    // Generate a default avatar with the user's initials
    const initials = student.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    
    return { uri: `${DEFAULT_PROFILE_IMAGE}&name=${initials}` };
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading attendance records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Records</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {attendanceList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No attendance records yet</Text>
          <Text style={styles.emptySubtext}>
            Students will appear here after they scan the QR code
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceList}
          keyExtractor={(item) => item._id}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <View style={styles.attendanceItem}>
              <Image
                source={getProfileImageSource(item.student)}
                style={styles.studentImage}
              />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.student.name}</Text>
                <Text style={styles.studentCode}>
                  Student ID: {item.student.studentCode || 'N/A'}
                </Text>
                <View style={styles.attendanceDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.textLight} />
                    <Text style={styles.detailText}>
                      {formatDate(item.scannedAt)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="wifi-outline" size={14} color={Colors.textLight} />
                    <Text style={styles.detailText}>{item.ipAddress}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  attendanceItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  studentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  studentCode: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  attendanceDetails: {
    flexDirection: 'column',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
  },
});

export default AttendanceList; 