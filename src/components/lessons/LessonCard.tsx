import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/Colors';

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: string;
}

interface LessonData {
  _id: string;
  title: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  teacher: {
    _id: string;
    name: string;
  };
}

interface LessonCardProps {
  lessonData: LessonData;
  containerStyle?: StyleProp<ViewStyle>;
  isTeacher?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({
  lessonData,
  containerStyle,
  isTeacher = false,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handlePress = () => {
    navigation.navigate(
      isTeacher ? 'Lesson' : 'Lesson',
      { lessonId: lessonData._id }
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.lessonTitle}>{lessonData.title}</Text>
        <Text style={styles.date}>{formatDate(lessonData.createdAt)}</Text>
      </View>

      <Text style={styles.content} numberOfLines={2}>
        {lessonData.content.replace(/<[^>]*>/g, '')}
      </Text>

      <View style={styles.footer}>
        <View style={styles.teacherContainer}>
          <Ionicons name="person" size={14} color={Colors.textLight} />
          <Text style={styles.teacherName}>{lessonData.teacher.name}</Text>
        </View>

        {lessonData.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Ionicons name="document-attach" size={14} color={Colors.textLight} />
            <Text style={styles.attachmentsCount}>
              {lessonData.attachments.length} attachment{lessonData.attachments.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.textLight,
  },
  content: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherName: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 4,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentsCount: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 4,
  },
});

export default LessonCard; 