import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import Button from '../../components/ui/Button';
import { API_URL } from '../../config/api';

const DEFAULT_PROFILE_IMAGE = 'https://ui-avatars.com/api/?background=random';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user, logout } = useContext(AuthContext);

  // Navigate to edit profile screen
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Get profile image source
  const getProfileImageSource = () => {
    if (user?.profilePicture) {
      // Check if the profile picture is already a full URL
      if (user.profilePicture.startsWith('http')) {
        return { uri: user.profilePicture };
      }
      // Extract the base URL without the /api part
      const baseUrl = API_URL.replace('/api', '');
      return { uri: `${baseUrl}${user.profilePicture}` };
    }
    
    // Generate a default avatar with the user's initials
    const name = user?.name || '';
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    
    return { uri: `${DEFAULT_PROFILE_IMAGE}&name=${initials}` };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={getProfileImageSource()}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={styles.editImageButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'teacher' ? 'Teacher' : 'Student'}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={22} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={22} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>
              {user?.phoneNumber || 'Not provided'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Edit Profile"
          onPress={handleEditProfile}
          // icon="create-outline"
          buttonStyle={styles.editButton}
        />
        
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          // icon="log-out-outline"
          buttonStyle={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: Colors.primary,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 10,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  editButton: {
    marginBottom: 12,
  },
  logoutButton: {
    borderColor: Colors.danger,
  },
});

export default ProfileScreen; 