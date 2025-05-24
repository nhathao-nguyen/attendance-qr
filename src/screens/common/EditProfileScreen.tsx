import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { API_URL } from '../../config/api';

type EditProfileFormData = {
  name: string;
  email: string;
  phoneNumber?: string;
  studentCode?: string;
};

const DEFAULT_PROFILE_IMAGE = 'https://ui-avatars.com/api/?background=random';

const editProfileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phoneNumber: yup.string().optional(),
  studentCode: yup.string().optional(),
});

const EditProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { user, updateProfile } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profilePicture || null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(editProfileSchema) as any,
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      studentCode: user?.studentCode || '',
    },
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        studentCode: user.studentCode || '',
      });
      setProfileImage(user.profilePicture || null);
    }
  }, [user, reset]);

  // Handle image selection
  const handleSelectImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Sorry, we need camera roll permissions to change your profile picture.'
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Generate profile image source
  const getProfileImageSource = () => {
    if (profileImage) {
      // Check if it's already a full URL
      if (profileImage.startsWith('http') || profileImage.startsWith('file')) {
        return { uri: profileImage };
      }
      // Extract the base URL without the /api part
      const baseUrl = API_URL.replace('/api', '');
      return { uri: `${baseUrl}${profileImage}` };
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

  // Handle form submission
  const onSubmit = async (data: EditProfileFormData) => {
    try {
      setIsSubmitting(true);
      
      // Prepare update data
      const updateData: any = {
        name: data.name,
        email: data.email,
      };
      
      if (data.phoneNumber) {
        updateData.phoneNumber = data.phoneNumber;
      }

      if (data.studentCode) {
        updateData.studentCode = data.studentCode;
      }
      
      if (profileImage && profileImage !== user?.profilePicture) {
        const fileName = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(fileName || '');
        const type = match ? `image/${match[1]}` : `image`;
  
        updateData.profilePicture = {
          uri: profileImage,
          name: fileName,
          type,
        } as any;
      }
      
      // Call update profile
      await updateProfile(updateData);
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={getProfileImageSource()}
            style={styles.profileImage}
          />
          
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={handleSelectImage}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />

          {user?.role === 'student' && (
            <Controller
              control={control}
              name="studentCode"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Student Code"
                  placeholder="Enter your student code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.studentCode?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Phone Number (Optional)"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phoneNumber?.message}
              />
            )}
          />

          

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              buttonStyle={styles.cancelButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  form: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default EditProfileScreen; 