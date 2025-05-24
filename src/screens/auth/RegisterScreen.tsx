import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthContext } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  role: 'student' | 'teacher';
};

const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phoneNumber: yup.string().optional(),
  role: yup
    .string()
    .oneOf(['student', 'teacher'], 'Role must be either student or teacher')
    .required('Role is required'),
});

const RegisterScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { register } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      role: 'student',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      await register(
        data.name,
        data.email,
        data.password,
        data.role,
        data.phoneNumber
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', errorMessage);
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
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

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

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'student' && styles.roleButtonActive,
                ]}
                onPress={() => setValue('role', 'student')}
              >
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'student' && styles.roleTextActive,
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'teacher' && styles.roleButtonActive,
                ]}
                onPress={() => setValue('role', 'teacher')}
              >
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'teacher' && styles.roleTextActive,
                  ]}
                >
                  Teacher
                </Text>
              </TouchableOpacity>
            </View>
            {errors.role && (
              <Text style={styles.errorText}>{errors.role.message}</Text>
            )}

            <Button
              title="Register"
              onPress={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              buttonStyle={styles.registerButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    color: Colors.text,
    fontWeight: '500',
  },
  roleTextActive: {
    color: 'white',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterScreen; 