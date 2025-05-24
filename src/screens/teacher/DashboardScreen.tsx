import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import ClassCard from '../../components/classes/ClassCard';
import Button from '../../components/ui/Button';

interface Class {
  _id: string;
  name: string;
  description: string;
  code: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  studentsCount: number;
}

const TeacherDashboardScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get('/classes/teacher');
      setClasses(response.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert(
        'Error',
        'Failed to load classes. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  // Navigate to create class screen
  const handleCreateClass = () => {
    navigation.navigate('CreateClass');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name}</Text>
        <Text style={styles.subtitle}>Manage your classes and lessons</Text>
      </View>

      {classes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You have no classes yet. Create your first class to get started.
          </Text>
          <Button
            title="Create Class"
            onPress={handleCreateClass}
            buttonStyle={styles.createButton}
          />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ClassCard classData={item} isTeacher={true} />
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
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Your Classes</Text>
              <Button
                title="Create New"
                onPress={handleCreateClass}
                size="small"
                variant="outline"
              />
            </View>
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: Colors.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    width: '80%',
  },
});

export default TeacherDashboardScreen; 