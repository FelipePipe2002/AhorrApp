import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Modal, TextInput } from 'react-native';
import transactionService from '@/services/transactionService';
import { Transaction } from '@/models/transaction';
import authService from '@/services/authService';
import { useRouter } from 'expo-router';
import { deleteAuthToken } from '@/services/tokenStorage';
import GlobalText from '@/components/GlobalText';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [showModal, setShowModal] = useState(false);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      let valid = await authService.verifyToken();
      if (!valid) {
        router.push('/');
        deleteAuthToken();
      } else {
        const user = await authService.getUserInfo();
        setUsername(user?.name);
      }
    };

    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactionsByUser();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    checkToken();
    fetchTransactions();
  }, []);

  useEffect(() => {
    const calculateIncomeAndExpense = () => {
      let income = 0;
      let expense = 0;

      transactions.forEach((transaction) => {
        if (transaction.type === 'INCOME') {
          income += transaction.amount;
        } else {
          expense += transaction.amount;
        }
      });

      income = parseFloat(income.toFixed(2));
      expense = parseFloat(expense.toFixed(2));

      setIncome(income);
      setExpense(expense);
    };

    calculateIncomeAndExpense();
  }, [transactions]);

  // Pagination
  const totalPages = Math.ceil(transactions.length / pageSize);
  const currentTransactions = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  // Transaction CRUD
  const handleDeleteTransaction = async (id: number) => {
    try {
      await transactionService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  const handleAddTransaction = async () => {
    const newTransaction: Transaction = {
      id: 0, // the backend will generate the id
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      description,
      userId: 0, // the backend will set the user id
    };

    try {
      const data = await transactionService.addTransaction(newTransaction);
      setTransactions((prev) => [data.transaction, ...prev]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setType('INCOME');
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <GlobalText style={styles.title}>Hello, {username || 'User'}!</GlobalText>
        <GlobalText> Total Balance: ${(income - expense).toFixed(2)}</GlobalText>
        <GlobalText> Income: ${income}</GlobalText>
        <GlobalText> Expense: ${expense}</GlobalText>
        <Button title="Add Transaction" onPress={() => setShowModal(true)} />
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <GlobalText style={styles.modalTitle}>Add New Transaction</GlobalText>
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />
            <TextInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />
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
              <Button title="Add" onPress={handleAddTransaction} />
              <Button title="Cancel" onPress={() => setShowModal(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={currentTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.transactionCard]}>
            <GlobalText style={[styles.amountText, item.type === 'EXPENSE' ? { color: 'red' } : { color: 'green' }]}>
              {item.type === 'EXPENSE' ? '- ' : ''}${item.amount}
            </GlobalText>
            <GlobalText style={styles.categoryText}>{item.category}</GlobalText>
            <GlobalText style={styles.dateText}>{item.date}</GlobalText>
            <GlobalText style={styles.descriptionText}>{item.description}</GlobalText>
            <Button title="Delete" onPress={() => handleDeleteTransaction(item.id)} />
          </View>
        )}
      />
      <View style={styles.paginationButtons}>
        <Button title="Previous" onPress={handlePreviousPage} disabled={currentPage === 1} />
        <Button title="Next" onPress={handleNextPage} disabled={currentPage === totalPages} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  transactionCard: {
    backgroundColor: '#454c56',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  summaryCard: {
    backgroundColor: '#454c56',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  idText: {
    fontWeight: 'bold',
  },
  amountText: {
    fontSize: 18,
    color: '#007700',
  },
  typeText: {
    fontSize: 16,
    color: '#0077cc',
  },
  categoryText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 14,
    color: '#777',
  },
  descriptionText: {
    marginTop: 5,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

