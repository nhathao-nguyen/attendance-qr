import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Colors } from '../../constants/Colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type CreateClassFormData = {
  name: string;
  description: string;
};

const createClassSchema = yup.object().shape({
  name: yup.string().required('Class name is required'),
  description: yup.string().required('Description is required'),
});

const CreateClassScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateClassFormData>({
    resolver: yupResolver(createClassSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post('/classes', data);
      
      Alert.alert(
        'Success',
        'Class created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              // Navigate back to dashboard
              navigation.navigate('Dashboard');
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create class. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create a New Class</Text>
          <Text style={styles.subtitle}>
            Fill out the form below to create a new class for your students
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Class Name"
                  placeholder="Enter class name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Description"
                  placeholder="Enter class description"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.description?.message}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  inputStyle={{ height: 120 }}
                />
              )}
            />

            <Button
              title="Create Class"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              buttonStyle={styles.createButton}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>About Creating Classes</Text>
            <Text style={styles.infoText}>
              • Each class you create will have a unique join code
            </Text>
            <Text style={styles.infoText}>
              • Share this code with your students so they can join your class
            </Text>
            <Text style={styles.infoText}>
              • You can create lessons for each class that you create
            </Text>
            <Text style={styles.infoText}>
              • You can view all your classes on the Dashboard
            </Text>
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
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  createButton: {
    marginTop: 16,
  },
  infoContainer: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
});

export default CreateClassScreen; 