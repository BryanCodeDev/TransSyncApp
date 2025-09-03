import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../utils/constants';

const CustomIcon = ({ 
  name, 
  size = 24, 
  color = COLORS.secondary[600], 
  backgroundColor,
  containerSize,
  style,
  ...props 
}) => {
  const iconElement = (
    <Icon 
      name={name} 
      size={size} 
      color={color} 
      {...props} 
    />
  );

  if (backgroundColor || containerSize) {
    const containerStyle = [
      styles.container,
      {
        backgroundColor: backgroundColor || 'transparent',
        width: containerSize || size + 8,
        height: containerSize || size + 8,
        borderRadius: (containerSize || size + 8) / 2,
      },
      style
    ];

    return (
      <View style={containerStyle}>
        {iconElement}
      </View>
    );
  }

  return iconElement;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomIcon;