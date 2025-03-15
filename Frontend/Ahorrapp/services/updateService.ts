import { Alert, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { downloadFile, DocumentDirectoryPath } from 'react-native-fs';
import { showMessage } from 'react-native-flash-message';
import FileViewer from 'react-native-file-viewer';

const APK_PATH = `${DocumentDirectoryPath}/app-release-signed.apk`;
const VERSION_URL = 'https://updates.felipebertoldi.com.ar/version.json';

export const checkForUpdate = async () => {
  try {
    const response = await fetch(VERSION_URL);
    const { versionName, releaseNotes, apkUrl } = await response.json();

    const currentVersionName = await DeviceInfo.getVersion();

    if (versionName > currentVersionName) {
      return { updateAvailable: true, versionName, releaseNotes, apkUrl };
    } else {
      console.log('No hay actualizaciones disponibles');
    }
  } catch (error) {
    console.error('Error al verificar actualización:', error);
    showMessage({
      message: 'Error al verificar actualización',
      description: 'No se pudo verificar si hay una nueva versión disponible.',
      type: 'danger',
    });
  }

  return { updateAvailable: false };
};

export const downloadAndInstallUpdate = async (apkUrl: string) => {
  try {
    if (Platform.OS === 'android') {
      console.log('Descargando actualización:', apkUrl);
      Alert.alert('Descargando actualización', 'Por favor, espere unos segundos.');

      // Descargar el archivo en el directorio privado de la app
      const downloadResult = await downloadFile({
        fromUrl: apkUrl,
        toFile: APK_PATH,
      }).promise;

      Alert.alert('Descarga completada', 'El archivo se descargó correctamente.');
      console.log('Archivo descargado en:', APK_PATH);

      if (downloadResult.statusCode === 200) {
        // Abrir el archivo usando react-native-file-viewer
        await FileViewer.open(APK_PATH, { showOpenWithDialog: true });
      } else {
        showMessage({
          message: 'Error al descargar el archivo',
          description: 'No se pudo descargar el archivo de actualización.',
          type: 'danger',
        });
      }
    }
  } catch (error) {
    console.error('Error al descargar o instalar la actualización:', error);
    showMessage({
      message: 'Error al descargar la actualización',
      description: 'No se pudo descargar o instalar la actualización.',
      type: 'danger',
    });
  }
};