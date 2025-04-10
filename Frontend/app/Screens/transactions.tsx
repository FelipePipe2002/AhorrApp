import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Button, Modal, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import GlobalText from '@/components/GlobalText';
import { formatNumber } from '@/services/generalMethods';
import TransactionComponent from '@/components/transactionComponent';
import TransactionForm from '@/components/transactionForm';
import colors from '@/utils/colors';
import DynamicCategorySelector from '@/components/DynamicCategorySelector';
import appStore from '@/store/app.store';


export default function Transactions() {
  // Summary
  const [balance, setbalance] = useState<number>(0);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  // Transaction Add
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState<string>('');

  const handleCategoryChange = (category: string) => {
    setCategory(category);
    if(appStore.categories.includes(category) || category==='')  setCurrentPage(1);
  };

  const filteredTransactions = category && appStore.categories.includes(category)
    ? appStore.transactions.filter((transaction) => transaction.category === category)
    : appStore.transactions;


  // Summary
  useEffect(() => {
    setbalance(appStore.transactions.reduce((acc, transaction) => {
      if (transaction.type === 'INCOME') {
        return acc + transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        return acc - transaction.amount;
      }
      return acc;
    }, 0));
  }, [appStore.transactions]);

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
  

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <GlobalText style={styles.title}>Hola, {appStore.user?.name || 'User'}!</GlobalText>
        <GlobalText> Balance Total: ${formatNumber(balance)}</GlobalText>
        <GlobalText />
        <Button title="Agregar Transaccion" onPress={() => setShowModal(true)} />
      </View>
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback
          onPress={() => {
            setShowModal(false);
            Keyboard.dismiss();
          }}
        >
          <TransactionForm showModal={setShowModal}/>
        </TouchableWithoutFeedback>
      </Modal>

      <DynamicCategorySelector
        selectedCategory={category}
        categories={appStore.categories}
        onCategoryChange={handleCategoryChange}
        style={styles.input}
      />

      <FlatList
        data={currentTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionComponent item={item}/>
        )}
      />
      <View style={styles.paginationButtons}>
        <Button title="Anterior" onPress={handlePreviousPage} disabled={currentPage === 1} />
        <GlobalText style={styles.paginationText}>{currentPage} / {totalPages}</GlobalText>
        <Button title="Siguiente" onPress={handleNextPage} disabled={currentPage === totalPages} />
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

