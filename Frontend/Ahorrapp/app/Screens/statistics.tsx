import React from 'react';
import { View, StyleSheet } from 'react-native';
import GlobalText from '@/components/GlobalText';
import { formatNumber } from '@/services/generalMethods';
import appStore from '@/store/app.store';

export default function Statistics() {
  // Calculate totals
  const totalIncome = appStore.transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = appStore.transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <GlobalText style={styles.title}>Estadisticas</GlobalText>
      <GlobalText style={styles.income}>Ingresos Totales: ${formatNumber(totalIncome)}</GlobalText>
      <GlobalText style={styles.expense}>Gastos Totales: ${formatNumber(totalExpenses)}</GlobalText>
      <GlobalText style={styles.balance}>Balance: ${formatNumber(balance)}</GlobalText>
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
  income: {
    fontSize: 18,
    color: 'green',
    marginBottom: 5,
  },
  expense: {
    fontSize: 18,
    color: 'red',
    marginBottom: 5,
  },
  balance: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
