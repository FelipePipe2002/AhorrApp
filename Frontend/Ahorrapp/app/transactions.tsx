import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Button, Modal, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Transaction } from '@/models/transaction';
import GlobalText from '@/components/GlobalText';
import { User } from '@/models/user';
import { formatNumber } from '@/services/functionalMehods';
import TransactionComponent from '@/components/transactionComponent';
import TransactionForm from '@/components/transactionForm';
import colors from '@/utils/colors';
import transactionService from '@/services/transactionService';
import DynamicCategorySelector from '@/components/DynamicCategorySelector';

type TransactionsProps = {
  transactions: Transaction[];
  user: User;
  onAddTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: number) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
};

export default function Transactions({ transactions, user, onAddTransaction = () => { }, onDeleteTransaction = () => { }, onUpdateTransaction = () => { } }: TransactionsProps) {
  // Summary
  const [balance, setbalance] = useState<number>(0);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  // Transaction Add
  const [showModal, setShowModal] = useState(false);

  const [fetchedCategories, setFetchedCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');

  const fetchCategories = async () => {
    try {
      const categories = await transactionService.getCategories();
      setFetchedCategories(categories.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (category: string) => {
    setCategory(category);
  };

  const filteredTransactions = category && fetchedCategories.includes(category)
    ? transactions.filter((transaction) => transaction.category === category)
    : transactions;

  // Summary
  useEffect(() => {
    setbalance(transactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        return acc + transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        return acc - transaction.amount;
      }
      return acc;
    }, 0));
  }, [transactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    onDeleteTransaction(id);
    fetchCategories();
  }

  const handleUpdateTransaction = async (transaction: Transaction) => {
    onUpdateTransaction(transaction);
    fetchCategories();
  }

  const handleAddTransaction = async (transaction: Transaction) => {
    onAddTransaction(transaction);
    fetchCategories();
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <GlobalText style={styles.title}>Hello, {user.name || 'User'}!</GlobalText>
        <GlobalText> Total Balance: ${formatNumber(balance)}</GlobalText>
        <GlobalText />
        <Button title="Add Transaction" onPress={() => setShowModal(true)} />
      </View>
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            setShowModal(false);
            Keyboard.dismiss();
          }}
        >
          <TransactionForm onAddTransaction={handleAddTransaction} showModal={setShowModal} User={user} />
        </TouchableWithoutFeedback>
      </Modal>

      <DynamicCategorySelector
        selectedCategory={category}
        categories={fetchedCategories}
        onCategoryChange={handleCategoryChange}
        style={styles.input}
      />

      <FlatList
        data={currentTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionComponent item={item} onDelete={handleDeleteTransaction} onAdd={handleAddTransaction} onUpdate={handleUpdateTransaction} User={user} />
        )}
      />
      <View style={styles.paginationButtons}>
        <Button title="Previous" onPress={handlePreviousPage} disabled={currentPage === 1} />
        <GlobalText style={styles.paginationText}>{currentPage} / {totalPages}</GlobalText>
        <Button title="Next" onPress={handleNextPage} disabled={currentPage === totalPages} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: colors.component,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  paginationText: {
    fontSize: 16,
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: '-50%' }],
  },
  input: {
    height: 40,
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

