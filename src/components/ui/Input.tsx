import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...restProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          inputStyle,
        ]}
        placeholderTextColor={Colors.textLight}
        autoCapitalize="none"
        {...restProps}
      />
      
      {error && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input; 