import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Button from '../../components/ui/Button';
import LessonQRCode from '../../components/teacher/LessonQRCode';
import AttendanceList from '../../components/teacher/AttendanceList';

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: string;
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  teacher: {
    _id: string;
    name: string;
  };
  class: {
    _id: string;
    name: string;
    code: string;
  };
  qrCode?: {
    data: string;
    expiresAt: string;
    isActive: boolean;
  };
}

type LessonRouteProp = RouteProp<
  {
    Lesson: {
      lessonId: string;
    };
  },
  'Lesson'
>;

const TeacherLessonScreen = () => {
  const route = useRoute<LessonRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(false);

  // Fetch lesson details
  const fetchLesson = async () => {
    try {
      const response = await axios.get(`/lessons/${lessonId}`);
      setLesson(response.data.lesson);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      Alert.alert('Error', 'Failed to load lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  // Set header title
  useEffect(() => {
    if (lesson) {
      navigation.setOptions({
        title: lesson.title,
      });
    }
  }, [lesson, navigation]);

  // Handle opening attachments
  const handleOpenAttachment = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this attachment.');
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
      Alert.alert('Error', 'Failed to open attachment.');
    }
  };

  // Handle editing lesson
  const handleEditLesson = () => {
    navigation.navigate('EditLesson', { lessonId: lesson?._id });
  };

  // Handle deleting lesson
  const handleDeleteLesson = () => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/lessons/${lessonId}`);
              Alert.alert('Success', 'Lesson deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get icon for attachment type
  const getAttachmentIcon = (type: string) => {
    if (type.includes('image')) {
      return 'image-outline';
    } else if (type.includes('pdf')) {
      return 'document-text-outline';
    } else if (type.includes('video')) {
      return 'videocam-outline';
    } else if (type.includes('audio')) {
      return 'musical-notes-outline';
    } else {
      return 'document-outline';
    }
  };

  // Show attendance list
  const handleShowAttendance = () => {
    setShowAttendance(true);
  };

  // Hide attendance list
  const handleCloseAttendance = () => {
    setShowAttendance(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.date}>
            {formatDate(lesson.createdAt)}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Edit Lesson"
            onPress={handleEditLesson}
            variant="outline"
            size="small"
            buttonStyle={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={handleDeleteLesson}
            variant="outline"
            size="small"
            buttonStyle={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
          />
        </View>

        <View style={styles.classContainer}>
          <Ionicons name="book" size={16} color={Colors.text} />
          <Text style={styles.classLabel}>Class:</Text>
          <Text style={styles.className}>{lesson.class.name}</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrCodeSection}>
          <LessonQRCode lessonId={lessonId} onRefresh={fetchLesson} />
          
          <Button
            title="View Attendance"
            onPress={handleShowAttendance}
            buttonStyle={styles.attendanceButton}
          />
        </View>

        <View style={styles.divider} />

        <Text style={styles.contentTitle}>Lesson Content</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{lesson.content.replace(/<[^>]*>/g, '')}</Text>
        </View>

        <View style={styles.divider} />
        <Text style={styles.attachmentsTitle}>Attachments</Text>
        
        {lesson.attachments.length === 0 ? (
          <View style={styles.emptyAttachments}>
            <Text style={styles.emptyText}>No attachments added to this lesson yet.</Text>
          </View>
        ) : (
          <View style={styles.attachmentsContainer}>
            {lesson.attachments.map((attachment) => (
              <TouchableOpacity
                key={attachment._id}
                style={styles.attachmentItem}
                onPress={() => handleOpenAttachment(attachment.url)}
              >
                <Ionicons
                  name={getAttachmentIcon(attachment.type) as any}
                  size={24}
                  color={Colors.primary}
                  style={styles.attachmentIcon}
                />
                <View style={styles.attachmentDetails}>
                  <Text style={styles.attachmentName}>{attachment.name}</Text>
                  <Text style={styles.attachmentType}>
                    {attachment.type.split('/')[1]?.toUpperCase() || 'File'}
                  </Text>
                </View>
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={Colors.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Attendance Modal */}
      <Modal
        visible={showAttendance}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseAttendance}
      >
        <AttendanceList lessonId={lessonId} onClose={handleCloseAttendance} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    marginRight: 10,
  },
  deleteButton: {
    borderColor: Colors.danger,
  },
  deleteButtonText: {
    color: Colors.danger,
  },
  classContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  classLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 4,
  },
  className: {
    fontSize: 14,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  attachmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  attachmentsContainer: {
    marginBottom: 16,
  },
  emptyAttachments: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentIcon: {
    marginRight: 12,
  },
  attachmentDetails: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  attachmentType: {
    fontSize: 12,
    color: Colors.textLight,
  },
  qrCodeSection: {
    marginVertical: 16,
  },
  attendanceButton: {
    marginTop: 10,
  }
});

export default TeacherLessonScreen; 