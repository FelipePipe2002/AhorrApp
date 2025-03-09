import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import Modal from 'react-native-modal';
import GlobalText from './GlobalText';
import colors from '@/utils/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import appStore from '@/utils/appStore';
import authService from '@/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [showModal, setShowModal] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const UserConfig = () => {
    if (!showModal) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  };

  useEffect(() => {
    appStore.checkBiometricEnabled().then(() => {
      return setBiometricEnabled(appStore.biometricEnabled ?? false);
    });
  }, []);

  const toggleBiometric = async () => {
    setBiometricEnabled(!biometricEnabled);
    if (await appStore.forceBiometricAuth()) {
      await AsyncStorage.setItem('biometricEnabled', (!biometricEnabled).toString());
    }

  };

  const handleLogout = async () => {
    await authService.logout();
    appStore.logout();
  };

  return (
    <View style={styles.headerContainer}>

      <TouchableOpacity onPress={UserConfig}>
        <Icon
          name="perm-identity"
          size={24}
          style={[styles.icon, { paddingHorizontal: 5 }]}
        />
      </TouchableOpacity>

      <Modal
        useNativeDriver={false}
        isVisible={showModal}
        animationIn="fadeInLeft"
        animationOut="fadeOutLeft"
        backdropTransitionOutTiming={1}
        onBackdropPress={() => {
          setShowModal(false);
        }}
        style={{ margin: 0 }}
      >
        <View style={styles.panel}>
          {/* Activar/Desactivar Biometría */}
          <TouchableOpacity onPress={toggleBiometric}>
            <View style={styles.button}>
              <Icon name="fingerprint" size={24} style={styles.icon} />
              <GlobalText style={styles.buttonText}>Usar Biometría</GlobalText>
              <Switch value={biometricEnabled} onValueChange={toggleBiometric} />
            </View>
          </TouchableOpacity>

          {/* Modificar Categorías */}
          <TouchableOpacity onPress={() => Alert.alert('Modificar categorías')}>
            <View style={styles.button}>
              <Icon name="category" size={24} style={styles.icon} />
              <GlobalText style={styles.buttonText}>Modificar Categorías</GlobalText>
            </View>
          </TouchableOpacity>

          {/* Modificar Notificaciones */}
          <TouchableOpacity onPress={() => Alert.alert('Modificar notificaciones')}>
            <View style={styles.button}>
              <Icon name="notifications" size={24} style={styles.icon} />
              <GlobalText style={styles.buttonText}>Notificaciones</GlobalText>
            </View>
          </TouchableOpacity>

          {/* Generar Reporte */}
          <TouchableOpacity onPress={() => Alert.alert('Generar Reporte')}>
            <View style={styles.button}>
              <Icon name="bar-chart" size={24} style={styles.icon} />
              <GlobalText style={styles.buttonText}>Generar Reporte</GlobalText>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Title */}
      <GlobalText style={styles.title}>{title}</GlobalText>

      <View style={styles.iconsLeft}>
        <TouchableOpacity onPress={appStore.reload}>
          <Icon
            name="autorenew"
            size={24}
            style={styles.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Icon
            name="logout"
            size={24}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkest,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: colors.component,
  },
  title: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  iconsLeft: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 5,
    flexDirection: 'row',
  },
  icon: {
    color: colors.text,
    marginHorizontal: 5,
  },
  panel: {
    height: '100%',
    width: '60%',
    backgroundColor: colors.component,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.component,
  },
  buttonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
});

export default Header;
