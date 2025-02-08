
import React from 'react';
import { Button, Keyboard, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import GlobalText from './GlobalText';
import { formatNumber, formatDate } from '@/services/functionalMehods';
import TransactionForm from './transactionForm';
import { Transaction } from '@/models/transaction';
import { User } from '@/models/user';
import transactionService from '@/services/transactionService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '@/utils/colors';

interface TransactionProps {
    item: Transaction;
    User?: User;
    onDelete: (id: number) => void;
    onAdd: (transaction: Transaction) => void;
    onUpdate: (transaction: Transaction) => void;
}

const TransactionComponent: React.FC<TransactionProps> = ({ item, User, onDelete, onAdd, onUpdate }) => {

    const [showModal, setShowModal] = React.useState(false);

    const handleDeleteTransaction = async (id: number) => {
        try {
            await transactionService.deleteTransaction(id);
            onDelete?.(id);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }

    const formatDate = (date: string) => {
        date = date.split(' ')[0];
       const newDate = date.split('-').reverse().join('/');
        return newDate;
    }

    return (
        <View style={[styles.container]}>
             <View style={styles.iconContainer}>
                <Icon 
                    name="delete" 
                    size={24} 
                    onPress={() => handleDeleteTransaction(item.id)} 
                    style={styles.icon}
                />
                <Icon 
                    name="edit" 
                    size={24} 
                    onPress={() => setShowModal(true)} 
                    style={styles.icon}
                />
            </View>

            <GlobalText style={[styles.amountText, item.type === 'EXPENSE' ? { color: colors.false } : { color: colors.true }]}>
                ${item.type === 'EXPENSE' ? '- ' : ''}{formatNumber(item.amount)}
            </GlobalText>

            <GlobalText style={styles.categoryText}>{item.category}</GlobalText>

            {item.description !== '' ? <GlobalText style={styles.descriptionText}>{item.description}</GlobalText> : null}

            <GlobalText style={styles.dateText}>{formatDate(item.date)}</GlobalText>

            <Modal visible={showModal} animationType="slide" transparent={true}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        setShowModal(false);
                        Keyboard.dismiss();
                    }}
                >
                    <TransactionForm showModal={setShowModal} onAddTransaction={onAdd} onUpdateTransaction={onUpdate} User={User} item={item} />
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
});

export default TransactionComponent;
