import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  abrirCV,
  elegirYSubirPDF,
  listarPostulaciones,
  obtenerCandidatoAutenticado,
  registrarPostulacion,
  Postulacion,
  EstadoPostulacion,
} from '../services/postulacionesService';

const ESTADOS: EstadoPostulacion[] = ['En proceso', 'Entrevista', 'Rechazada', 'Contratada'];

export default function PostulacionesScreen({ navigation, route }: { navigation: any; route: any }) {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [estado, setEstado] = useState<EstadoPostulacion>('En proceso');
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [candidatoId, setCandidatoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const vacanteId = route?.params?.vacanteId ? String(route.params.vacanteId) : '';
  const vacanteTitulo = route?.params?.VacanteTitulo || '';

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const ids = await obtenerCandidatoAutenticado();
      setCandidatoId(ids.candidatoId);
      setUsuarioId(ids.usuarioId);
      const registros = await listarPostulaciones(ids.candidatoId);
      setPostulaciones(registros);
      setMensaje('');
    } catch (e: any) {
      setMensaje(e.message || 'No se pudieron cargar las postulaciones.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const aviso = (texto: string) => {
    if (Platform.OS === 'web') alert(texto);
    else Alert.alert('KADAF', texto);
  };

  const postular = async () => {
    if (!vacanteId || !usuarioId || !candidatoId || enviando) return;
    setEnviando(true);
    try {
      const rutaPDF = await elegirYSubirPDF(usuarioId);
      if (!rutaPDF) return;
      await registrarPostulacion(candidatoId, vacanteId, rutaPDF);
      aviso('Postulación registrada correctamente.');
      setEstado('En proceso');
      navigation.setParams({ vacanteId: undefined });
      await cargar();
    } catch (e: any) {
      aviso(e.message || 'Ocurrió un error.');
    } finally {
      setEnviando(false);
    }
  };

  const verPDF = async (ruta: string) => {
    try {
      const url = await abrirCV(ruta);
      await Linking.openURL(url);
    } catch (e: any) {
      aviso(e.message || 'No fue posible abrir el PDF.');
    }
  };

  const filtradas = postulaciones.filter(p => p.estado === estado);

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.volver}>← Volver</Text></Pressable>
        <Text style={styles.titulo}>Mis postulaciones</Text>
        <Text style={styles.subtitulo}>Consulta el estado de tus solicitudes y tu CV.</Text>
      </View>

      {vacanteId !== '' && (
        <View style={styles.seccion}>
          <Text style={styles.texto}>Vacante seleccionada: {vacanteTitulo || vacanteId}</Text>
          <Pressable onPress={postular} disabled={enviando || !usuarioId} style={styles.boton}>
            {enviando ? <ActivityIndicator color="white" /> : <Text style={styles.botonTexto}>Seleccionar CV en PDF y postularme</Text>}
          </Pressable>
        </View>
      )}

      <View style={styles.estados}>
        {ESTADOS.map(item => (
          <Pressable key={item} onPress={() => setEstado(item)} style={[styles.pestana, estado === item && styles.activa]}>
            <Text style={[styles.pestanaTexto, estado === item && styles.activaTexto]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {!!mensaje && <Text style={styles.error}>{mensaje}</Text>}
      {cargando ? <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 24 }} /> : (
        <FlatList
          data={filtradas}
          keyExtractor={item => item.id}
          refreshing={cargando}
          onRefresh={cargar}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.vacio}>No tienes postulaciones en este estado.</Text>}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>Vacante: {item.vacantes?.titulo || item.vacante_id}</Text>
              <Text style={styles.dato}>Estado: {item.estado}</Text>
              <Text style={styles.dato}>Fecha: {new Date(item.created_at).toLocaleDateString()}</Text>
              <Pressable style={styles.botonPDF} onPress={() => verPDF(item.cv_path)}>
                <Text style={styles.botonPDFTexto}>Ver CV (PDF)</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F6FA'
  },

  encabezado: {
    backgroundColor: '#263A75',
    padding: 20,
    paddingTop: 26,
    gap: 8
  },

  volver: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800'
  },

  subtitulo: {
    color: '#E8EDFF'
  },

  seccion: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFE4EE'
  },

  texto: {
    color: '#20283B',
    marginBottom: 10,
    fontWeight: '600'
  },

  boton: {
    backgroundColor: '#263A75',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center'
  },

  botonTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center'
  },

  estados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 16
  },

  pestana: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DFE4EE'
  },

  activa: {
    backgroundColor: '#263A75',
    borderColor: '#263A75'
  },

  pestanaTexto: {
    color: '#68738A',
    fontSize: 12,
    fontWeight: '700'
  },

  activaTexto: {
    color: '#FFFFFF'
  },

  lista: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 7,
    borderWidth: 1,
    borderColor: '#DFE4EE'
  },

  nombre: {
    color: '#20283B',
    fontSize: 16,
    fontWeight: '700'
  },

  dato: {
    color: '#68738A'
  },

  botonPDF: {
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: '#E8EDFF',
    alignSelf: 'flex-start'
  },

  botonPDFTexto: {
    color: '#263A75',
    fontWeight: '700'
  },

  error: {
    color: '#DC2626',
    paddingHorizontal: 16,
    marginBottom: 10
  },

  vacio: {
    color: '#68738A',
    textAlign: 'center',
    marginTop: 30
  }
});
