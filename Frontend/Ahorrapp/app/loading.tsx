import GlobalText from '@/components/GlobalText';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0077cc" />
      <GlobalText style={styles.text}>Loading, please wait...</GlobalText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242b3e',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff',
  },
});

export default Loading;
