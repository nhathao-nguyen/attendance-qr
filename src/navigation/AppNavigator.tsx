import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Student Screens
import StudentDashboardScreen from '../screens/student/DashboardScreen';
import JoinClassScreen from '../screens/student/JoinClassScreen';
import StudentClassDetailsScreen from '../screens/student/ClassDetailsScreen';
import StudentLessonScreen from '../screens/student/LessonScreen';

// Teacher Screens
import TeacherDashboardScreen from '../screens/teacher/DashboardScreen';
import CreateClassScreen from '../screens/teacher/CreateClassScreen';
import TeacherClassDetailsScreen from '../screens/teacher/ClassDetailsScreen';
import CreateLessonScreen from '../screens/teacher/CreateLessonScreen';
import TeacherLessonScreen from '../screens/teacher/LessonScreen';
import EditLessonScreen from '../screens/teacher/EditLessonScreen';

// Common Screens
import ProfileScreen from '../screens/common/ProfileScreen';
import EditProfileScreen from '../screens/common/EditProfileScreen';

// Context
import { AuthContext } from '../contexts/AuthContext';

// Types
import { Colors } from '../constants/Colors';

// Navigation Types
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type StudentTabParamList = {
  Dashboard: undefined;
  JoinClass: undefined;
  Profile: undefined;
};

type TeacherTabParamList = {
  Dashboard: undefined;
  CreateClass: undefined;
  Profile: undefined;
};

type StudentStackParamList = {
  StudentTab: undefined;
  ClassDetails: { classId: string };
  Lesson: { lessonId: string };
  EditProfile: undefined;
};

type TeacherStackParamList = {
  TeacherTab: undefined;
  ClassDetails: { classId: string };
  CreateLesson: { classId: string };
  Lesson: { lessonId: string };
  EditLesson: { lessonId: string };
  EditProfile: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const StudentTab = createBottomTabNavigator<StudentTabParamList>();
const TeacherTab = createBottomTabNavigator<TeacherTabParamList>();
const StudentStack = createStackNavigator<StudentStackParamList>();
const TeacherStack = createStackNavigator<TeacherStackParamList>();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Student Tab Navigator
const StudentTabNavigator = () => (
  <StudentTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        
        if (route.name === 'Dashboard') {
          iconName = 'home';
        } else if (route.name === 'JoinClass') {
          iconName = 'add-circle';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textLight,
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: '#fff',
    })}
  >
    <StudentTab.Screen name="Dashboard" component={StudentDashboardScreen} />
    <StudentTab.Screen name="JoinClass" component={JoinClassScreen} />
    <StudentTab.Screen name="Profile" component={ProfileScreen} />
  </StudentTab.Navigator>
);

// Teacher Tab Navigator
const TeacherTabNavigator = () => (
  <TeacherTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        
        if (route.name === 'Dashboard') {
          iconName = 'home';
        } else if (route.name === 'CreateClass') {
          iconName = 'add-circle';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textLight,
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: '#fff',
    })}
  >
    <TeacherTab.Screen name="Dashboard" component={TeacherDashboardScreen} />
    <TeacherTab.Screen name="CreateClass" component={CreateClassScreen} />
    <TeacherTab.Screen name="Profile" component={ProfileScreen} />
  </TeacherTab.Navigator>
);

// Student Stack Navigator
const StudentStackNavigator = () => (
  <StudentStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <StudentStack.Screen
      name="StudentTab"
      component={StudentTabNavigator}
      options={{ headerShown: false }}
    />
    <StudentStack.Screen
      name="ClassDetails"
      component={StudentClassDetailsScreen}
    />
    <StudentStack.Screen
      name="Lesson"
      component={StudentLessonScreen}
    />
    <StudentStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
  </StudentStack.Navigator>
);

// Teacher Stack Navigator
const TeacherStackNavigator = () => (
  <TeacherStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <TeacherStack.Screen
      name="TeacherTab"
      component={TeacherTabNavigator}
      options={{ headerShown: false }}
    />
    <TeacherStack.Screen
      name="ClassDetails"
      component={TeacherClassDetailsScreen}
    />
    <TeacherStack.Screen
      name="CreateLesson"
      component={CreateLessonScreen}
      options={{ title: 'Create Lesson' }}
    />
    <TeacherStack.Screen
      name="Lesson"
      component={TeacherLessonScreen}
    />
    <TeacherStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <TeacherStack.Screen
      name="EditLesson"
      component={EditLessonScreen}
      options={{ title: 'Edit Lesson' }}
    />
  </TeacherStack.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'teacher' ? (
        <TeacherStackNavigator />
      ) : (
        <StudentStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;