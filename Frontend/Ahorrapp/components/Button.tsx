import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import GlobalText from './GlobalText';

const Button: React.FC<{ onPress: () => void; title: string }> = ({ onPress, title }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <GlobalText style={styles.buttonText}>{title}</GlobalText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Button;
