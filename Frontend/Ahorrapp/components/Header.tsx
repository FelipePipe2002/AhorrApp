import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import GlobalText from './GlobalText';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
  showBackButton?: boolean;
  onLogout?: () => void;
  onBackPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showLogout, showBackButton, onLogout, onBackPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      {showBackButton && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <GlobalText style={styles.backText}>←</GlobalText>
        </TouchableOpacity>
      )}

      {/* Title */}
      <GlobalText style={styles.title}>{title}</GlobalText>

      {/* Logout Button */}
      {showLogout && (
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <GlobalText style={styles.logoutText}>Logout</GlobalText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#22222c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#444',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 10,
  },
  backText: {
    fontSize: 18,
    color: 'white',
  },
  logoutButton: {
    position: 'absolute',
    right: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4d4d',
  },
});

export default Header;
