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

type JoinClassFormData = {
  code: string;
};

const joinClassSchema = yup.object().shape({
  code: yup.string().required('Class code is required'),
});

const JoinClassScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinClassFormData>({
    resolver: yupResolver(joinClassSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: JoinClassFormData) => {
    try {
      setIsSubmitting(true);
      await axios.post('/classes/join', { code: data.code.trim().toUpperCase() });
      
      Alert.alert('Success', 'You have successfully joined the class.', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            navigation.navigate('Dashboard');
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to join class. Please try again.';
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
          <Text style={styles.title}>Join a Class</Text>
          <Text style={styles.subtitle}>
            Enter the class code provided by your teacher to join a class
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Class Code"
                  placeholder="Enter class code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.code?.message}
                  autoCapitalize="characters"
                />
              )}
            />

            <Button
              title="Join Class"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              buttonStyle={styles.joinButton}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How to join a class?</Text>
            <Text style={styles.infoText}>
              1. Ask your teacher for the class code
            </Text>
            <Text style={styles.infoText}>
              2. Enter the code in the field above
            </Text>
            <Text style={styles.infoText}>
              3. Tap on "Join Class" button
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
    marginBottom: 40,
  },
  joinButton: {
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
    marginBottom: 4,
  },
});

export default JoinClassScreen; 