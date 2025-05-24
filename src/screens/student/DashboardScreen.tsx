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
import QRCodeScanner from '../../components/student/QRCodeScanner';
import { Ionicons } from '@expo/vector-icons';

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
}

const StudentDashboardScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Fetch classes
  const fetchClasses = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await axios.get('/classes/student');
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
    fetchClasses(false);
  };

  // Navigate to join class screen
  const handleJoinClass = () => {
    navigation.navigate('JoinClass');
  };

  // Show QR scanner
  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  // Close QR scanner
  const handleCloseScanner = () => {
    setShowScanner(false);
    // Refresh classes after potential attendance scan
    fetchClasses(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.name}</Text>
          <Text style={styles.subtitle}>Explore your classes and lessons</Text>
        </View>

        <View style={styles.actionButtons}>
          {/* <Button
            title="Join New Class"
            onPress={handleJoinClass}
            buttonStyle={styles.joinButton}
          />
          <Button
            title="Scan Attendance QR"
            onPress={handleOpenScanner}
            variant="outline"
            buttonStyle={styles.scanButton}
          /> */}
        </View>

        {classes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Classes Yet</Text>
            <Text style={styles.emptyText}>
              You haven't joined any classes yet. Join a class to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ClassCard classData={item} isTeacher={false} />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
              />
            }
          />
        )}
      </View>

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
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  joinButton: {
    flex: 1,
    marginRight: 10,
  },
  scanButton: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudentDashboardScreen;