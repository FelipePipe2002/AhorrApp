import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import GlobalText from './GlobalText';

interface HeaderProps {
  title: string;
  showLogout?: boolean;
  showReloadButton?: boolean;
  onLogout?: () => void;
  onReload?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showLogout, showReloadButton, onLogout, onReload }) => {
  return (
    <View style={styles.headerContainer}>
      
      {/* Title */}
      <GlobalText style={styles.title}>{title}</GlobalText>

      {/* Reload Button */}
      {showReloadButton && (
        <TouchableOpacity onPress={onReload} style={styles.reloadButton}>
          <GlobalText style={styles.reloadText}>Reload</GlobalText>
        </TouchableOpacity>
      )}

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
  reloadButton: {
    position: 'absolute',
    left: 10,
  },
  reloadText: {
    fontSize: 18,
    color: '#4caf50', // Green for reload button
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
