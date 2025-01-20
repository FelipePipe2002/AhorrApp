import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GlobalText from './GlobalText';

interface FooterProps {
  onSelect: (screen: 'transactions' | 'statistics') => void;
  selectedScreen: 'transactions' | 'statistics' | 'loading';
}

const Footer: React.FC<FooterProps> = ({ onSelect, selectedScreen }) => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => onSelect('transactions')}
      >
        <GlobalText style={styles.icon}>💰</GlobalText>
        <GlobalText style={styles.label}>Transactions</GlobalText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => onSelect('statistics')}
      >
        <GlobalText style={styles.icon}>📊</GlobalText>
        <GlobalText style={styles.label}>Statistics</GlobalText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#22222c',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default Footer;
