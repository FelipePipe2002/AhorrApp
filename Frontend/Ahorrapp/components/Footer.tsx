import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import GlobalText from './GlobalText';
import colors from '@/utils/colors';
import appStore from '@/services/appStore';


const Footer: React.FC = () => {
  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => appStore.selectedScreenChange('Transactions')}
      >
        <GlobalText style={styles.icon}>💰</GlobalText>
        <GlobalText style={styles.label}>Transactions</GlobalText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button]}
        onPress={() => appStore.selectedScreenChange('Statistics')}
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
    backgroundColor: colors.darkest,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 5,
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
