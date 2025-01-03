import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '..';
import AddTransactionScreen from '../add-transaction';
import ReportsScreen from '../reports';

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="index">
      <Stack.Screen name="index" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="add-transaction" component={AddTransactionScreen} options={{ title: 'Nueva Transacción' }} />
      <Stack.Screen name="reports" component={ReportsScreen} options={{ title: 'Reportes' }} />
    </Stack.Navigator>
  );
}
