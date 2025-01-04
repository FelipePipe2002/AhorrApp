import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import transactionService from '../services/transactionService';
import { Transaction } from '../models/transaction';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactionsByUser();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Transactions</Text>
      <Text style={styles.subtitle}>Here are your transactions:</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <Text style={styles.idText}>ID: {item.id}</Text>
            <Text style={[styles.amountText, item.type === 'EXPENSE' && { color: 'red' }]}>
              Amount: ${item.amount}
            </Text>
            <Text style={styles.typeText}>Type: {item.type}</Text>
            <Text style={styles.categoryText}>Category: {item.category}</Text>
            <Text style={styles.dateText}>Date: {item.date}</Text>
            <Text style={styles.descriptionText}>Description: {item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    backgroundColor: '#f9f9f9',
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
});
