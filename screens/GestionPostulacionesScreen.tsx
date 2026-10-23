import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking
} from 'react-native';
import { supabase } from '../services/supabase';

type Postulacion = {
  id: string;
  candidato: string;
  email: string;
  vacante: string;
  estado: string;
  cv_path: string;
};

const estados = ['En proceso', 'Entrevista', 'Rechazada', 'Contratada'];

export default function GestionPostulacionesScreen() {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarPostulaciones = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from('postulaciones')
      .select(`
        id,
        estado,
        cv_path,
        candidatos(nombre_completo, email),
        vacantes(titulo)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error al consultar: ' + error.message);
    } else {
      const lista = (data || []).map((item: any) => {
        const candidato = Array.isArray(item.candidatos)
          ? item.candidatos[0]
          : item.candidatos;

        const vacante = Array.isArray(item.vacantes)
          ? item.vacantes[0]
          : item.vacantes;

        return {
          id: item.id,
          candidato: candidato?.nombre_completo || 'Sin nombre',
          email: candidato?.email || '',
          vacante: vacante?.titulo || 'Sin título',
          estado: item.estado,
          cv_path: item.cv_path
        };
      });

      setPostulaciones(lista);
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from('postulaciones')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }

    alert('Estado actualizado correctamente');
    cargarPostulaciones();
  };

  const verCV = async (ruta: string) => {
    const { data, error } = await supabase.storage
      .from('cv-postulaciones')
      .createSignedUrl(ruta, 60);

    if (error || !data?.signedUrl) {
      alert('No se pudo abrir el CV');
      return;
    }

    try {
      await Linking.openURL(data.signedUrl);
    } catch {
      alert('No se pudo abrir el documento PDF');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gestión de Postulaciones</Text>
      <Text style={styles.subtitulo}>
        Revisa candidatos, currículums y estados
      </Text>

      <TouchableOpacity
        style={styles.actualizar}
        onPress={cargarPostulaciones}
      >
        <Text style={styles.textoActualizar}>Actualizar lista</Text>
      </TouchableOpacity>

      {cargando ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <ScrollView style={styles.lista}>
          {postulaciones.length === 0 && (
            <Text style={styles.vacio}>
              No hay postulaciones registradas.
            </Text>
          )}

          {postulaciones.map(item => (
            <View key={item.id} style={styles.tarjeta}>
              <Text style={styles.nombre}>{item.candidato}</Text>
              <Text style={styles.texto}>{item.email}</Text>
              <Text style={styles.texto}>
                Vacante: {item.vacante}
              </Text>
              <Text style={styles.estado}>
                Estado actual: {item.estado}
              </Text>

              <TouchableOpacity
                style={styles.botonCV}
                onPress={() => verCV(item.cv_path)}
              >
                <Text style={styles.textoBoton}>Ver CV (PDF)</Text>
              </TouchableOpacity>

              <Text style={styles.etiqueta}>Cambiar estado:</Text>

              <View style={styles.estados}>
                {estados.map(estado => (
                  <TouchableOpacity
                    key={estado}
                    style={[
                      styles.botonEstado,
                      item.estado === estado && styles.seleccionado
                    ]}
                    onPress={() => cambiarEstado(item.id, estado)}
                  >
                    <Text style={styles.textoEstado}>
                      {estado}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    padding: 16
  },
  titulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#172033'
  },
  subtitulo: {
    fontSize: 13,
    color: '#667085',
    marginTop: 5,
    marginBottom: 15
  },
  actualizar: {
    backgroundColor: '#2563EB',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  textoActualizar: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  lista: {
    flex: 1
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172033',
    marginBottom: 5
  },
  texto: {
    fontSize: 14,
    color: '#475467',
    marginBottom: 5
  },
  estado: {
    fontWeight: 'bold',
    color: '#2563EB',
    marginVertical: 10
  },
  botonCV: {
    backgroundColor: '#087E8B',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#172033',
    marginBottom: 8
  },
  estados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7
  },
  botonEstado: {
    backgroundColor: '#667085',
    padding: 9,
    borderRadius: 7
  },
  seleccionado: {
    backgroundColor: '#2563EB'
  },
  textoEstado: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  vacio: {
    color: '#667085',
    textAlign: 'center',
    marginTop: 30
  }
});
