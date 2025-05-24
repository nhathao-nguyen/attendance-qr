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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Button from '../../components/ui/Button';
import QRCodeScanner from '../../components/student/QRCodeScanner';

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
}

type LessonRouteProp = RouteProp<
  {
    Lesson: {
      lessonId: string;
    };
  },
  'Lesson'
>;

const StudentLessonScreen = () => {
  const route = useRoute<LessonRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

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

  // Open QR code scanner
  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  // Close QR code scanner
  const handleCloseScanner = () => {
    setShowScanner(false);
    // Refresh lesson data after scanning
    fetchLesson();
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

        <View style={styles.teacherContainer}>
          <Ionicons name="person" size={16} color={Colors.text} />
          <Text style={styles.teacherLabel}>Teacher:</Text>
          <Text style={styles.teacherName}>{lesson.teacher.name}</Text>
        </View>

        <View style={styles.classContainer}>
          <Ionicons name="book" size={16} color={Colors.text} />
          <Text style={styles.classLabel}>Class:</Text>
          <Text style={styles.className}>{lesson.class.name}</Text>
        </View>

        {/* Attendance section */}
        <View style={styles.attendanceSection}>
          <Button
            title="Scan Attendance QR Code"
            onPress={handleOpenScanner}
            buttonStyle={styles.scanButton}
          />
          <Text style={styles.scanInfo}>
            Scan the QR code displayed by your teacher to mark your attendance for this lesson
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.contentTitle}>Lesson Content</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{lesson.content.replace(/<[^>]*>/g, '')}</Text>
        </View>

        {lesson.attachments.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.attachmentsTitle}>Attachments</Text>
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
          </>
        )}
      </ScrollView>

      {/* QR Code Scanner */}
      <QRCodeScanner 
        isVisible={showScanner} 
        onClose={handleCloseScanner} 
      />
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
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 4,
  },
  teacherName: {
    fontSize: 14,
    color: Colors.text,
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
  attendanceSection: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  scanButton: {
    marginBottom: 12,
  },
  scanInfo: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
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
});

export default StudentLessonScreen; 