import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CandidatosHomeScreen from './screens/CandidatosHomeScreen';
import GestionVacantesScreen from './screens/GestionVacantesScreen';
import PanelReclutadorScreen from './screens/PanelReclutadorScreen';
import PostulacionesScreen from './screens/PostulacionesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  let pantallaInicial = 'Login';

  if(Platform.OS === 'web' && typeof window !== 'undefined'){
    const rol = localStorage.getItem('kadaf_rol');
    if (rol === 'trabajador'){
      pantallaInicial = 'PanelReclutador';
    }else if (rol === 'candidato'){
      pantallaInicial = 'Vacantes';
    }
  } 

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={pantallaInicial} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Vacantes" component={CandidatosHomeScreen} />
        <Stack.Screen name="GestionVacantes" component={GestionVacantesScreen} />
        <Stack.Screen name="PanelReclutador" component={PanelReclutadorScreen}/>
        <Stack.Screen name="Postulaciones" component={PostulacionesScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}