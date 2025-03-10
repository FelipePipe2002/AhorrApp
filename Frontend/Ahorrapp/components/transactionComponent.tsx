
import React, { useEffect } from 'react';
import { Button, Keyboard, Modal, StyleSheet, TouchableWithoutFeedback, View, Image, Alert } from 'react-native';
import GlobalText from './GlobalText';
import { formatNumber, formatDate } from '@/services/generalMethods';
import TransactionForm from './transactionForm';
import { Transaction } from '@/models/transaction';
import transactionService from '@/services/transactionService';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '@/utils/colors';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import appStore from '@/services/appStore';

interface TransactionProps {
    item: Transaction;
}

const TransactionComponent: React.FC<TransactionProps> = ({ item}) => {
    const [showModal, setShowModal] = React.useState(false);
    const [showImageModal, setShowImageModal] = React.useState(false);

    const handleDeleteTransaction = async (id: number) => {
        try {
            await transactionService.deleteTransaction(id);
            appStore.deleteTransaction(id);

        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }

    const pickImage = async () => {
        const options = [
            { text: "Tomar foto", action: "camera" },
            { text: "Elegir de la galería", action: "library" },
            { text: "Cancelar", action: "cancel" }
        ];
    
        Alert.alert("Seleccionar imagen", "¿Qué deseas hacer?", [
            {
                text: options[0].text,
                onPress: async () => {
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        quality: 0.7,
                        base64: true,
                    });
    
                    handleImageResult(result);
                }
            },
            {
                text: options[1].text,
                onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        quality: 0.7,
                        base64: true,
                    });
    
                    handleImageResult(result);
                }
            },
            { text: options[2].text, style: "cancel" }
        ]);
    };

    const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
        if (!result.canceled) {
            const compressed = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 500 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
    
            const updatedTransaction: Transaction = { ...item, image: compressed.base64 };
            const data = await transactionService.updateTransaction(updatedTransaction);
            appStore.updateTransaction(data.transaction);
        }
    };
    
    return (
        <View style={[styles.container]}>
            <View style={styles.iconContainer}>
                <MaterialIcon
                    name="delete"
                    size={24}
                    onPress={() => handleDeleteTransaction(item.id)}
                    style={styles.icon}
                />
                <MaterialIcon
                    name="edit"
                    size={24}
                    onPress={() => setShowModal(true)}
                    style={styles.icon}
                />
                {item.image && (
                    <CommunityIcon
                        name="image"
                        size={24}
                        onPress={() => setShowImageModal(true)}
                        style={styles.icon}
                    />
                )}
                {!item.image &&
                    <CommunityIcon
                        name="image-plus"
                        size={24}
                        onPress={pickImage}
                        style={styles.icon}
                    />}
            </View>
            
            <GlobalText style={[styles.amountText, item.type === 'EXPENSE' ? { color: colors.false } : { color: colors.true }]}>
                ${item.type === 'EXPENSE' ? '- ' : ''}{formatNumber(item.amount)}
            </GlobalText>
            
            <GlobalText style={styles.categoryText}>{item.category}</GlobalText>

            {item.description !== '' ? <GlobalText style={styles.descriptionText}>{item.description}</GlobalText> : null}
            {item.description === '' ? <GlobalText style={styles.descriptionText}>Sin descripción</GlobalText> : null}

            <GlobalText style={styles.dateText}>{formatDate(item.date)}</GlobalText>

            <Modal visible={showModal} animationType="slide" transparent={true}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        setShowModal(false);
                        Keyboard.dismiss();
                    }}
                >
                    <TransactionForm showModal={setShowModal} item={item} />
                </TouchableWithoutFeedback>
            </Modal>

            <Modal
                visible={showImageModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowImageModal(false)}>
                    <View style={styles.imageModalContainer}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${item.image}` }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                        <CommunityIcon
                            name="image-remove"
                            size={40}
                            color={colors.text}
                            onPress={() => Alert.alert( // Alerta para confirmar la eliminación de la imagen
                                'Eliminar imagen',
                                '¿Estás seguro de que deseas eliminar la imagen?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Eliminar',
                                        onPress: async () => {
                                            const updatedTransaction: Transaction = { ...item, image: null };
                                            const data = await transactionService.updateTransaction(updatedTransaction);
                                            appStore.updateTransaction(data.transaction);
                                            setShowImageModal(false);
                                        },
                                    },
                                ],
                            )}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.component,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        height: 'auto',
        position: 'relative',
    },
    amountText: {
        fontSize: 18,
    },
    categoryText: {
        fontSize: 16,
        fontStyle: 'italic',
    },
    dateText: {
        fontSize: 14,
    },
    descriptionText: {

        fontSize: 14,
    },
    button: {
        backgroundColor: 'red',
        color: 'white',
    },
    iconContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    icon: {
        marginBottom: 10,
        color: colors.text,
    },
    imageModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '80%',
    },
});

export default TransactionComponent;

