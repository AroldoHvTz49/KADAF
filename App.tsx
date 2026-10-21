import React from 'react';
import { Platform } from 'react-native';
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
  let pantallaInicial = 'Login';

  if(Platform.OS === 'web' && typeof window !== 'undefined'){
    const rol = localStorage.getItem('kadaf_rol');
    if (rol === 'trabajador'){
      pantallaInicial = 'GestionVacantes';
    }else if (rol === 'candidato'){
      pantallaInicial = 'Vacantes';
    }
  } 

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={pantallaInicial} screenOptions={{ headerShown: false }}>
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