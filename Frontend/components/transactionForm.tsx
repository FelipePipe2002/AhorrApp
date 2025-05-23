import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Button, StyleSheet, TextInput, View, Platform, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import DynamicCategorySelector from './DynamicCategorySelector';
import { Transaction } from '@/models/transaction';
import transactionService from '@/services/transaction.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import appStore from '@/store/app.store';
import { parseDate } from '@/services/generalMethods';

interface TransactionProps {
    item?: Transaction;
    showModal: (show: boolean) => void;
}

const TransactionForm: React.FC<TransactionProps> = ({ item, showModal}) => {

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
    
            if (compressed.base64) {
                setImage(compressed.base64);
            }
        }
    };

    const [type, setType] = useState(item?.type || 'EXPENSE');
    const [amount, setAmount] = useState(item?.amount !== undefined ? item.amount.toString().replace('.', ',') : '');
    const [category, setCategory] = useState(item?.category || '');
    const [description, setDescription] = useState(item?.description || '');
    const [date, setDate] = useState(item?.date ? parseDate(item.date) : new Date(new Date().setHours(new Date().getHours() - 3)));
    const [image, setImage] = useState(item?.image || null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const editing = !!item;

    const handleTransaction = useCallback(async () => {
        if (!amount || !category) {
            Alert.alert('Validation Error', 'Amount and category are required!');
            return;
        }

        const parsedAmount = parseFloat(amount.replace('.', '').replace(',', '.'));
        if (isNaN(parsedAmount)) {
            Alert.alert('Validation Error', 'Invalid amount format!');
            return;
        }

        //TODO: Bug: cuando se carga la fecha se carga con EST y no EST-3
        const transaction: Transaction = {
            id: item?.id || 0,
            amount: parsedAmount,
            type,
            category: category.toLowerCase(),
            date: date.toISOString().replace('T', ' ').substring(0, 19),
            description,
            image,
            userId: appStore.user?.id || 0,
        };

        try {
            let data;
            if (editing) {
                data = await transactionService.updateTransaction(transaction);
                appStore.updateTransaction(data.transaction);
            } else {
                data = await transactionService.addTransaction(transaction);
                appStore.addTransaction(data.transaction);
            }
            showModal(false);
        } catch (error) {
            console.error(editing ? 'Error updating transaction:' : 'Error adding transaction:', error);
        }
    }, [amount, category, date, description, editing, item?.id, image, showModal, type]);


    const handleCategoryChange = (category: string) => {
        setCategory(category);
    };

    return (
        <View style={styles.modalContent}>
            <TextInput style={styles.modalTitle}>
                {editing ? "Edit Transaction" : "Add New Transaction"}
            </TextInput>
            <TextInput
                placeholder="Amount"
                keyboardType="numeric"
                value={amount.toString()}
                onChangeText={(text) => setAmount(text || "")}
                style={styles.input}
            />
            <DynamicCategorySelector
                selectedCategory={category}
                categories={appStore.categories}
                onCategoryChange={handleCategoryChange}
                style={styles.input}
            />
            <View style={styles.datePickerContainer}>
                <TextInput
                    placeholder="Date"
                    value={date.toLocaleDateString('en-GB')}
                    style={{ flex: 1, paddingHorizontal: 10, }}
                    editable={false}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.calendarButton}>
                    <Icon name="event" size={24} color="black" />
                </TouchableOpacity>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
            />
            <Button
                title={image ? "Change Image" : "Add Image"}
                onPress={pickImage}
            />
            {image && (
                <View style={{ alignItems: 'center', marginTop: 10 }}>
                    <Image source={{ uri: `data:image/jpeg;base64,${image}` }} style={{ width: 100, height: 100 }} />
                </View>
            )}
            <View style={styles.typeButtons}>
                <Button title="Income" onPress={() => setType('INCOME')} color={type === 'INCOME' ? 'green' : 'gray'} />
                <Button title="Expense" onPress={() => setType('EXPENSE')} color={type === 'EXPENSE' ? 'red' : 'gray'} />
            </View>
            <View style={styles.modalButtons}>
                <Button
                    title={editing ? "Save" : "Add"}
                    onPress={handleTransaction}
                />
                <Button
                    title="Cancel"
                    onPress={() => { showModal(false); }}
                    color="red"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
        width: '80%',
        height: 'auto',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    typeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    datePickerContainer: {
        height: 40,
        flexDirection: 'row',
        marginBottom: 20,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
    },
    calendarButton: {
        padding: 7,
        borderLeftWidth: 1,
        borderLeftColor: 'gray',
    },
});

export default TransactionForm;