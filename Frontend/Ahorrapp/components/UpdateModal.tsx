// app/components/UpdateModal.tsx
import React from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

interface UpdateModalProps {
  visible: boolean;
  versionName: string;
  releaseNotes: string;
  onUpdate: () => void;
  onCancel: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  versionName,
  releaseNotes,
  onUpdate,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Nueva versión disponible: {versionName}</Text>
          <Text style={styles.releaseNotes}>{releaseNotes}</Text>
          <Button title="Actualizar" onPress={onUpdate} />
          <Button title="Cancelar" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  releaseNotes: {
    fontSize: 14,
    marginBottom: 20,
  },
});