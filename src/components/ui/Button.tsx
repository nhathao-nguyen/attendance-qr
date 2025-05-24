import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  isLoading = false,
  disabled = false,
  buttonStyle,
  textStyle,
  ...restProps 
}) => {
  
  const getButtonStyles = () => {
    const buttonStyles: StyleProp<ViewStyle>[] = [styles.button];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        buttonStyles.push(styles.primaryButton);
        break;
      case 'secondary':
        buttonStyles.push(styles.secondaryButton);
        break;
      case 'outline':
        buttonStyles.push(styles.outlineButton);
        break;
      case 'danger':
        buttonStyles.push(styles.dangerButton);
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        buttonStyles.push(styles.smallButton);
        break;
      case 'medium':
        buttonStyles.push(styles.mediumButton);
        break;
      case 'large':
        buttonStyles.push(styles.largeButton);
        break;
    }
    
    // Add disabled style
    if (disabled || isLoading) {
      buttonStyles.push(styles.disabledButton);
    }
    
    // Add custom style
    if (buttonStyle) {
      buttonStyles.push(buttonStyle);
    }
    
    return buttonStyles;
  };
  
  const getTextStyles = () => {
    const textStyles: StyleProp<TextStyle>[] = [styles.buttonText];
    
    // Add variant-specific text styles
    switch (variant) {
      case 'primary':
        textStyles.push(styles.primaryText);
        break;
      case 'secondary':
        textStyles.push(styles.secondaryText);
        break;
      case 'outline':
        textStyles.push(styles.outlineText);
        break;
      case 'danger':
        textStyles.push(styles.dangerText);
        break;
    }
    
    // Add size-specific text styles
    switch (size) {
      case 'small':
        textStyles.push(styles.smallText);
        break;
      case 'large':
        textStyles.push(styles.largeText);
        break;
    }
    
    // Add disabled text style
    if (disabled) {
      textStyles.push(styles.disabledText);
    }
    
    // Add custom text style
    if (textStyle) {
      textStyles.push(textStyle);
    }
    
    return textStyles;
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={getButtonStyles()}
      activeOpacity={0.7}
      {...restProps}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? Colors.primary : 'white'} 
        />
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
  },
  
  // Size styles
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  
  // Disabled style
  disabledButton: {
    opacity: 0.5,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: Colors.primary,
  },
  dangerText: {
    color: 'white',
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button; 