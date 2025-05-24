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

interface ClassData {
  _id: string;
  name: string;
  description?: string;
  code: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  studentsCount?: number;
}

interface ClassCardProps {
  classData: ClassData;
  containerStyle?: StyleProp<ViewStyle>;
  isTeacher?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classData,
  containerStyle,
  isTeacher = false,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handlePress = () => {
    navigation.navigate(
      isTeacher ? 'ClassDetails' : 'ClassDetails',
      { classId: classData._id }
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.className}>{classData.name}</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.code}>{classData.code}</Text>
        </View>
      </View>

      {classData.description && (
        <Text style={styles.description} numberOfLines={2}>
          {classData.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.teacherContainer}>
          <Ionicons name="person" size={14} color={Colors.textLight} />
          <Text style={styles.teacherName}>{classData.teacher.name}</Text>
        </View>

        {isTeacher && classData.studentsCount !== undefined && (
          <View style={styles.studentsContainer}>
            <Ionicons name="people" size={14} color={Colors.textLight} />
            <Text style={styles.studentsCount}>
              {classData.studentsCount} student{classData.studentsCount !== 1 ? 's' : ''}
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
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
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
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentsCount: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 4,
  },
});

export default ClassCard; 