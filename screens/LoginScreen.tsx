import React, { useState } from 'react';

import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '../services/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      alert('Por favor ingresa correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      alert('No se pudo iniciar sesión: ' + error.message);
      return;
    }

    const usuarioId = data.user?.id;

    if (!usuarioId) {
      alert('No se encontró el usuario.');
      return;
    }

    const { data: trabajador, error: errorTrabajador } = await supabase
      .from('trabajadores')
      .select('id')
      .eq('user_id', usuarioId)
      .maybeSingle();

    if (errorTrabajador) {
      throw errorTrabajador;
    }

    if (trabajador) {
      if (Platform.OS === 'web') {
        localStorage.setItem('kadaf_rol', 'trabajador');
      }

      navigation.replace('PanelReclutador');
      return;
    }

    const { data: candidato, error: errorCandidato } = await supabase
      .from('candidatos')
      .select('id')
      .eq('user_id', usuarioId)
      .maybeSingle();

    if (errorCandidato) {
      throw errorCandidato;
    }

    if (candidato) {
      if (Platform.OS === 'web') {
        localStorage.setItem('kadaf_rol', 'candidato');
      }

      navigation.replace('Vacantes');
      return;
    }

    await supabase.auth.signOut();
    alert('Tu cuenta no tiene un perfil vinculado. Contacta al administrador.');

  } catch (error: any) {
    alert('Error al iniciar sesión: ' + error.message);
  } finally {
    setLoading(false);
  }
  };

  return (
    <KeyboardAvoidingView style={styles.flexContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>KADAF</Text>
          <Text style={styles.tagline}>Sistema de Gestión de Reclutamiento</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>INGRESAR</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation && navigation.navigate('Register')}>
            <Text style={styles.secondaryButtonText}>
              ¿Eres Candidato? <Text style={styles.linkBold}>Crea tu cuenta aquí</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1, backgroundColor: '#0F172A' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems:'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  appName: { fontSize: 42, fontWeight: '900', color: '#38BDF8', letterSpacing: 4 },
  tagline: { fontSize: 13, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#334155', width:'100%', maxWidth: 450},
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#CBD5E1', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingHorizontal: 14, height: 48, color: '#F8FAFC', fontSize: 15 },
  primaryButton: { backgroundColor: '#0284C7', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  secondaryButton: { marginTop: 20, alignItems: 'center' },
  secondaryButtonText: { color: '#94A3B8', fontSize: 14 },
  linkBold: { color: '#38BDF8', fontWeight: '700' },
});