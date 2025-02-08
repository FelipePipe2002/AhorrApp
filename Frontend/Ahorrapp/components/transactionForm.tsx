import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Button, StyleSheet, TextInput, View, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DynamicCategorySelector from './DynamicCategorySelector';
import { Transaction } from '@/models/transaction';
import transactionService from '@/services/transactionService';
import { User } from '@/models/user';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TransactionProps {
    item?: Transaction;
    User?: User;
    showModal: (show: boolean) => void;
    onAddTransaction?: (transaction: Transaction) => void;
    onUpdateTransaction?: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionProps> = ({ item, User, showModal, onAddTransaction, onUpdateTransaction }) => {

    const parseDate = (dateString: string) => {
        const [datePart, timePart] = dateString.split(" ");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);

        const parsedDate = new Date(year, month - 1, day, hour, minute, 0);
        parsedDate.setHours(parsedDate.getHours() - 3);

        return parsedDate;
    };

    const [type, setType] = useState(item?.type || 'EXPENSE');
    const [amount, setAmount] = useState(item?.amount !== undefined ? item.amount.toString().replace('.', ',') : '');
    const [category, setCategory] = useState(item?.category || '');
    const [description, setDescription] = useState(item?.description || '');
    const [date, setDate] = useState(item?.date ? parseDate(item.date) : new Date(new Date().setHours(new Date().getHours() - 3)));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fetchedCategories, setFetchedCategories] = useState<string[]>([]);
    const editing = !!item;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await transactionService.getCategories();
                setFetchedCategories(categories.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);


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

        const transaction: Transaction = {
            id: item?.id || 0,
            amount: parsedAmount,
            type,
            category,
            date: date.toISOString().replace('T', ' ').substring(0, 19),
            description,
            userId: User?.id || 0
        };

        try {
            let data;
            if (editing) {
                data = await transactionService.updateTransaction(transaction);
                onUpdateTransaction?.(data.transaction);
            } else {
                data = await transactionService.addTransaction(transaction);
                onAddTransaction?.(data.transaction);
            }
            showModal(false);
        } catch (error) {
            console.error(editing ? 'Error updating transaction:' : 'Error adding transaction:', error);
        }
    }, [amount, category, date, description, editing, item?.id, onAddTransaction, onUpdateTransaction, showModal, type, User?.id]);


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
                categories={fetchedCategories}
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
                    onPress={() => {showModal(false); }}
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