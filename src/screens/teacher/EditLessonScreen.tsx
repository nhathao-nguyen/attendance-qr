import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
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

type EditLessonFormData = {
  title: string;
  content: string;
};

type EditLessonRouteProp = RouteProp<
  {
    EditLesson: {
      lessonId: string;
    };
  },
  'EditLesson'
>;

const editLessonSchema = yup.object().shape({
  title: yup.string().required('Lesson title is required'),
  content: yup.string().required('Lesson content is required'),
});

const EditLessonScreen = () => {
  const route = useRoute<EditLessonRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { lessonId } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditLessonFormData>({
    resolver: yupResolver(editLessonSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Fetch lesson details
  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/lessons/${lessonId}`);
        const lesson = response.data.lesson;
        
        // Set form values
        reset({
          title: lesson.title,
          content: lesson.content,
        });

        // Set header title
        navigation.setOptions({
          title: `Edit: ${lesson.title}`,
        });
      } catch (error) {
        console.error('Error fetching lesson:', error);
        Alert.alert('Error', 'Failed to load lesson. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonDetails();
  }, [lessonId, reset, navigation]);

  const onSubmit = async (data: EditLessonFormData) => {
    try {
      setIsSubmitting(true);
      await axios.put(`/lessons/${lessonId}`, data);
      
      Alert.alert(
        'Success',
        'Lesson updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the lesson screen
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update lesson. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
          <Text style={styles.title}>Edit Lesson</Text>
          <Text style={styles.subtitle}>
            Update your lesson content and information
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

            <View style={styles.buttonContainer}>
              <Button
                title="Save Changes"
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                buttonStyle={styles.saveButton}
              />
              
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="outline"
                buttonStyle={styles.cancelButton}
              />
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  textArea: {
    height: 200,
    paddingTop: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});

export default EditLessonScreen; 