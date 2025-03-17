import { Alert, Linking, Platform } from 'react-native';
import FileViewer from 'react-native-file-viewer';
import DeviceInfo from 'react-native-device-info';
import { downloadFile} from 'react-native-fs';
import * as FileSystem from 'expo-file-system';

const APK_PATH = `${FileSystem.documentDirectory}app-release-signed.apk`;
const VERSION_URL = 'https://updates.felipebertoldi.com.ar/version.json';

export const checkForUpdate = async () => {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    const { versionName, releaseNotes, apkUrl } = await response.json();
    const currentVersionName = await DeviceInfo.getVersion();
    //const currentVersionCode = await DeviceInfo.getBuildNumber();
    if (versionName > currentVersionName) {
      return { updateAvailable: true, versionName, releaseNotes, apkUrl };
    } else {
      console.log('No hay actualizaciones disponibles');
    }
  } catch (error) {
    console.error('Error al verificar actualización:', error);
    Alert.alert('Error al verificar actualización', 'No se pudo verificar si hay una nueva versión disponible.');
  }

  return { updateAvailable: false };
};


export const downloadAndInstallUpdate = async (apkUrl: string) => {
  try {
    if (Platform.OS === 'android') {
      Alert.alert('Descargando actualización', 'Por favor, espere unos segundos.');

      // Descargar el archivo en el directorio privado de la app
      let lastProgress = 0;
      const progressCallback = (res: { bytesWritten: number; contentLength: number }) => {
        const percentage = Math.round((res.bytesWritten / res.contentLength) * 100);
        if (percentage !== lastProgress) {
          lastProgress = percentage;
          console.log(`Download progress: ${percentage}%`);
        }
      };

      const downloadResult = await downloadFile({
        fromUrl: apkUrl,
        toFile: APK_PATH,
        progress: progressCallback,
        begin: () => console.log('Download started'),
        background: true,
      }).promise;

      //TODO: cambiar el screen a la pantalla de loading y que muestre el progreso de la descarga

      Alert.alert('Descarga completada', 'El archivo se descargó correctamente.');

      if (downloadResult.statusCode === 200) {
        // Abrir el archivo usando react-native-file-viewer
        await FileViewer.open(APK_PATH, { showOpenWithDialog: true });
      } else {
        Alert.alert('Error al descargar', 'No se pudo descargar el archivo.');
      }
    }
  } catch (error) {
    console.error('Error al descargar o instalar la actualización:', error);
    Alert.alert('Error al descargar o instalar la actualización', 'No se pudo descargar o instalar la actualización.');
  }
};