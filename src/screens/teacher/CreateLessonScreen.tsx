import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Colors } from '../../constants/Colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type CreateLessonFormData = {
  title: string;
  content: string;
};

type CreateLessonRouteProp = RouteProp<
  {
    CreateLesson: {
      classId: string;
    };
  },
  'CreateLesson'
>;

const createLessonSchema = yup.object().shape({
  title: yup.string().required('Lesson title is required'),
  content: yup.string().required('Lesson content is required'),
});

const CreateLessonScreen = () => {
  const route = useRoute<CreateLessonRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { classId } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLessonFormData>({
    resolver: yupResolver(createLessonSchema) as any,
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = async (data: CreateLessonFormData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post('/lessons', {
        ...data,
        classId,
      });
      
      Alert.alert(
        'Success',
        'Lesson created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              // Navigate back to the class details screen
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create lesson. Please try again.';
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
          <Text style={styles.title}>Create New Lesson</Text>
          <Text style={styles.subtitle}>
            Add a new lesson to your class with educational content
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Lesson Title"
                  placeholder="Enter lesson title"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="content"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Lesson Content"
                  placeholder="Enter lesson content"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.content?.message}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  inputStyle={styles.textArea}
                />
              )}
            />

            <Button
              title="Create Lesson"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              buttonStyle={styles.createButton}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Tip:</Text>
            <Text style={styles.infoText}>
              You can add attachments to your lesson after creation by editing the lesson.
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
    marginBottom: 24,
  },
  textArea: {
    height: 160,
    paddingTop: 12,
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
  },
});

export default CreateLessonScreen; 