import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import GlobalText from '@/components/GlobalText';
import { User } from '@/models/user';
import { Transaction } from '@/models/transaction';

type TransactionsProps = {
  transactions: Transaction[];
  user: User;
};

export default function Statistics({ transactions, user }: TransactionsProps) {
  return (
    <View style={styles.container}>
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
});
