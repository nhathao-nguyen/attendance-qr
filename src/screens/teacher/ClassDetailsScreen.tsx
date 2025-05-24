import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import LessonCard from '../../components/lessons/LessonCard';
import Button from '../../components/ui/Button';

interface ClassDetails {
  _id: string;
  name: string;
  description: string;
  code: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: {
    _id: string;
    name: string;
    email: string;
  }[];
  createdAt: string;
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  attachments: {
    _id: string;
    name: string;
    url: string;
    type: string;
  }[];
  createdAt: string;
  teacher: {
    _id: string;
    name: string;
  };
}

type ClassDetailsRouteProp = RouteProp<
  {
    ClassDetails: {
      classId: string;
    };
  },
  'ClassDetails'
>;

const TeacherClassDetailsScreen = () => {
  const route = useRoute<ClassDetailsRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { classId } = route.params;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudentsList, setShowStudentsList] = useState(false);

  // Fetch class details and lessons
  const fetchClassData = async () => {
    try {
      // Fetch class details
      const classResponse = await axios.get(`/classes/${classId}`);
      setClassDetails(classResponse.data.class);

      // Fetch lessons for this class
      const lessonsResponse = await axios.get(`/lessons/class/${classId}`);
      setLessons(lessonsResponse.data.lessons);
    } catch (error) {
      console.error('Error fetching class data:', error);
      Alert.alert(
        'Error',
        'Failed to load class information. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClassData();
  }, [classId]);

  // Set header title
  useEffect(() => {
    if (classDetails) {
      navigation.setOptions({
        title: classDetails.name,
      });
    }
  }, [classDetails, navigation]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchClassData();
  };

  // Navigate to create lesson screen
  const handleCreateLesson = () => {
    navigation.navigate('CreateLesson', { classId });
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

  // Toggle students list
  const toggleStudentsList = () => {
    setShowStudentsList(!showStudentsList);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!classDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Class not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lessons}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <LessonCard lessonData={item} isTeacher={true} />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.classInfoContainer}>
            <View style={styles.header}>
              <Text style={styles.className}>{classDetails.name}</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Code:</Text>
                <Text style={styles.code}>{classDetails.code}</Text>
              </View>
            </View>

            {classDetails.description && (
              <Text style={styles.description}>{classDetails.description}</Text>
            )}

            <Text style={styles.dateInfo}>
              Created on {formatDate(classDetails.createdAt)}
            </Text>

            <TouchableOpacity
              style={styles.studentsSection}
              onPress={toggleStudentsList}
            >
              <View style={styles.studentsSummary}>
                <Ionicons name="people" size={18} color={Colors.text} />
                <Text style={styles.studentsCount}>
                  {classDetails.students.length} Student
                  {classDetails.students.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons
                name={showStudentsList ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textLight}
              />
            </TouchableOpacity>

            {showStudentsList && (
              <View style={styles.studentsList}>
                {classDetails.students.length === 0 ? (
                  <Text style={styles.noStudentsText}>
                    No students have joined this class yet.
                  </Text>
                ) : (
                  classDetails.students.map((student) => (
                    <View key={student._id} style={styles.studentItem}>
                      <View style={styles.studentAvatar}>
                        <Text style={styles.studentInitial}>
                          {student.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentEmail}>{student.email}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.lessonsHeader}>
              <Text style={styles.sectionTitle}>Lessons</Text>
              <Button
                title="Create Lesson"
                onPress={handleCreateLesson}
                size="small"
                variant="outline"
              />
            </View>

            {/* {lessons.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  You haven't created any lessons for this class yet.
                </Text>
                <Button
                  title="Create First Lesson"
                  onPress={handleCreateLesson}
                  size="small"
                  buttonStyle={styles.createLessonButton}
                />
              </View>
            )} */}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You haven't created any lessons for this class yet.
              </Text>
              <Button
                title="Create First Lesson"
                onPress={handleCreateLesson}
                size="small"
                buttonStyle={styles.createLessonButton}
              />
            </View>
          )
        }
      />
    </View>
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
  },
  listContainer: {
    padding: 16,
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
  classInfoContainer: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  className: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginRight: 4,
  },
  code: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  dateInfo: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 16,
  },
  studentsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  studentsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 8,
  },
  studentsList: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  studentEmail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  noStudentsText: {
    padding: 8,
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  lessonsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  createLessonButton: {
    marginTop: 0,
  },
});

export default TeacherClassDetailsScreen; 