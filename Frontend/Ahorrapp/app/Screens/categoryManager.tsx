import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import GlobalText from '@/components/GlobalText';
import appStore from '@/services/appStore';
import colors from '@/utils/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import transactionService from '@/services/transactionService';

export default function CategoryManager() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleMergeCategories = async () => {
    if (selectedCategories.length < 2) {
      Alert.alert('Error', 'Select at least two categories to merge');
      return;
    }

    setShowMergeModal(true);
  };

  const confirmMerge = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'You must enter a new category name');
      return;
    }

    try {
      await transactionService.changeCategoriesTo(newCategory, selectedCategories);
      appStore.reload();
      appStore.selectedScreenChange('Transactions');
      Alert.alert('Success', 'Categories merged successfully');


      setSelectedCategories([]);
      setShowMergeModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to merge categories');
    }
  };

  const handleEditCategory = (categoryName : string) => {
    setEditCategory(categoryName);
    setShowEditModal(true);
  }

  const confirmEdit = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'You must enter a new category name');
      return;
    }

    try {
      await transactionService.changeCategoriesTo(newCategory, [editCategory]);
      appStore.reload();
      appStore.selectedScreenChange('Transactions');
      Alert.alert('Success', 'Category edited successfully');

      setEditCategory('');
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to edit category');
    }
  }

  return (
    <View style={styles.container}>
      <GlobalText style={styles.title}>Categories</GlobalText>

      <FlatList
        data={appStore.categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.categoryContainer}>
            <GlobalText style={styles.categoryText}>{item}</GlobalText>
            <View style={{ flexDirection: 'row' }}>
              <Icon
                name={selectedCategories.includes(item) ? "check-box" : "check-box-outline-blank"}
                size={24}
                style={styles.icon}
                onPress={() => {
                  setSelectedCategories((prev) =>
                    prev.includes(item)
                      ? prev.filter(category => category !== item)
                      : [...prev, item]
                  );
                }}
              />
              <TouchableOpacity onPress={() => handleEditCategory(item)}>
                <Icon name="edit" size={24} style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {selectedCategories.length > 1 && (
        <View style={styles.footerSelected}>
          <GlobalText style={styles.categoryText}>
            Selected: {selectedCategories.length}
          </GlobalText>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSelectedCategories([])}>
              <Icon name="clear" size={24} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleMergeCategories}>
              <Icon name="merge-type" size={24} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GlobalText style={styles.title}>Cambiar nombre de Categoria</GlobalText>
            <GlobalText>La categoria seleccionada es: {editCategory}</GlobalText>
            <TextInput
              style={styles.input}
              placeholder="Nuevo nombre"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => confirmEdit()}>
              <GlobalText>Save</GlobalText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowEditModal(false)}>
              <GlobalText>Cancel</GlobalText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showMergeModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GlobalText style={styles.title}>Combinar Categorias</GlobalText>
            <GlobalText>Elegi un nuevo nombre o selecciona uno de la lista</GlobalText>
            <TextInput
              style={styles.input}
              placeholder="Enter new category name"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <FlatList
              data={selectedCategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setNewCategory(item)}>
                  <GlobalText style={styles.categoryOption}>{item}</GlobalText>
                </TouchableOpacity>
              )}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowMergeModal(false)}>
                <GlobalText>Cancel</GlobalText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmMerge}>
                <GlobalText>Merge</GlobalText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.text,
  },
  categoryText: {
    fontSize: 16,
  },
  icon: {
    color: colors.text,
    marginHorizontal: 5,
  },
  footerSelected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: colors.component,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: colors.component,
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  categoryOption: {
    padding: 10,
    fontSize: 16,
    color: colors.text,
  },
  modalButton: {
    padding: 10,
    backgroundColor: colors.middle,
    borderRadius: 5,
    marginTop: 10,
  },
});
