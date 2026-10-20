import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmpresaHomeScreen from './screens/EmpresaHomeScreen';
import CandidatoHomeScreen from './screens/CandidatoHomeScreen';
import CandidatosHomeScreen from './screens/CandidatosHomeScreen';
import GestionVacantesScreen from './screens/GestionVacantesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="EmpresaHome" component={EmpresaHomeScreen} />
        <Stack.Screen name="CandidatoHome" component={CandidatoHomeScreen} />
        <Stack.Screen name="Vacantes" component={CandidatosHomeScreen} />
        <Stack.Screen name="GestionVacantes" component={GestionVacantesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}