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

export default function RegisterScreen({ navigation }: { navigation?: any }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanNombre = nombre.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanNombre || !cleanEmail || !password) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      
      const { error } = await supabase
        .from('candidatos')
        .insert([
          {
            nombre_completo: cleanNombre,
            email: cleanEmail,
            password: password,
          }
        ]);

      if (error) throw error;

      
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      setLoading(false);

      if (navigation) {
        navigation.replace('Login'); 
      }

    } catch (error: any) {
      alert('Error al registrar: ' + (error.message || 'Inténtalo de nuevo.'));
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.flexContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>KADAF</Text>
          <Text style={styles.tagline}>Registro de Candidatos</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crear Cuenta de Candidato</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#A0AEC0"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#A0AEC0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>CREAR CUENTA</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation && navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>
              ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia Sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1, backgroundColor: '#0F172A' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 28 },
  appName: { fontSize: 38, fontWeight: '900', color: '#38BDF8', letterSpacing: 3 },
  tagline: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#334155', width:'100%', maxWidth: 450 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 16, textAlign: 'center' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: '#CBD5E1', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#334155', borderRadius: 10, paddingHorizontal: 14, height: 48, color: '#F8FAFC', fontSize: 15 },
  primaryButton: { backgroundColor: '#0284C7', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  secondaryButton: { marginTop: 18, alignItems: 'center' },
  secondaryButtonText: { color: '#94A3B8', fontSize: 14 },
  linkBold: { color: '#38BDF8', fontWeight: '700' },
});