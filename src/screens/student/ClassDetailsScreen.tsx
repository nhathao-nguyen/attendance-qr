import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import LessonCard from '../../components/lessons/LessonCard';

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

const StudentClassDetailsScreen = () => {
  const route = useRoute<ClassDetailsRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { classId } = route.params;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          <LessonCard lessonData={item} isTeacher={false} />
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

            <View style={styles.teacherContainer}>
              <Ionicons name="person" size={16} color={Colors.text} />
              <Text style={styles.teacherLabel}>Teacher:</Text>
              <Text style={styles.teacherName}>{classDetails.teacher.name}</Text>
            </View>

            <Text style={styles.dateInfo}>
              Created on {formatDate(classDetails.createdAt)}
            </Text>

            <View style={styles.divider} />

            {/* <Text style={styles.sectionTitle}>Lessons</Text>
            {lessons.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No lessons available yet. Check back later.
                </Text>
              </View>
            )} */}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No lessons available yet. Check back later.
            </Text>
          </View>
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
  dateInfo: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
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
  },
});

export default StudentClassDetailsScreen; 