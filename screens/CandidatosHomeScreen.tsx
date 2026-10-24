import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Platform
} from 'react-native';
import { supabase } from '../services/supabase';

//PARTE DE ADRIANA

interface Vacante {
  id: string;
  titulo: string;
  empresa: string;
  salario: number;
  ubicacion?: string;
  descripcion?: string;
  activa: boolean;
}

export default function CandidatosHomeScreen({ navigation }: { navigation?: any }) {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [vacantesFiltradas, setVacantesFiltradas] = useState<Vacante[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);


  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState<Vacante | null>(null);

 
  const fetchVacantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vacantes')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) {
        alert('Error al consultar vacantes: ' + error.message);
        return;
      }

      if (data) {
        setVacantes(data);
        setVacantesFiltradas(data);
      }
    } catch (err: any) {
      alert('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacantes();
  }, []);

  
  const handleBusqueda = (texto: string) => {
    setBusqueda(texto);
    
    if (texto.trim() === '') {
      setVacantesFiltradas(vacantes);
    } else {
      const textoMinuscula = texto.toLowerCase();
      const resultado = vacantes.filter((item) => {
        const porTitulo = item.titulo.toLowerCase().includes(textoMinuscula);
        const porEmpresa = item.empresa.toLowerCase().includes(textoMinuscula);
        const porUbicacion = item.ubicacion ? item.ubicacion.toLowerCase().includes(textoMinuscula) : false;
        return porTitulo || porEmpresa || porUbicacion;
      });
      setVacantesFiltradas(resultado);
    }
  };


  const handlePostularme = (item: Vacante) => {
    navigation.navigate('Postulaciones', {vacanteId: String(item.id), VacanteTitulo: item.titulo});
  };

 
  const renderCardVacante = ({ item }: { item: Vacante }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.titulo}</Text>
          <Text style={styles.salaryTag}>Q{item.salario.toLocaleString()}</Text>
        </View>

        <Text style={styles.companyText}>🏢 {item.empresa}</Text>
        
        {item.ubicacion ? (
          <Text style={styles.locationText}>📍 {item.ubicacion}</Text>
        ) : null}

        {item.descripcion ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => handlePostularme(item)}
        >
          <Text style={styles.applyButtonText}>POSTULARME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const cerrarSesion = async () => {
    if(Platform.OS === 'web'){
      localStorage.removeItem('kadaf_rol');
    }
    await supabase.auth.signOut();
    navigation.replace('Login');
};

  return (
    <SafeAreaView style={styles.container}>
    
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>🧑‍💼 MÓDULO CANDIDATO</Text>
          <Text style={styles.title}>Vacantes Disponibles</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={cerrarSesion}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por puesto, empresa o ubicación..."
          placeholderTextColor="#68738A"
          value={busqueda}
          onChangeText={handleBusqueda}
          autoCapitalize="none"
        />
      </View>

      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#263A75" />
          <Text style={styles.loadingText}>Cargando vacantes...</Text>
        </View>
      ) : (
        <FlatList
          data={vacantesFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderCardVacante}
          refreshing={loading} // esto muestra como el circulo de carga mientras se actualiza 
          onRefresh={fetchVacantes} //lo vuelve a ejecutar si el user lo vuelve a pedir deslizando hacia abajo
          style={styles.listStyle}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No se encontraron vacantes disponibles.</Text>
            </View>
          }
        />
      )}

   
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconCheck}>✓</Text>
            </View>

            <Text style={styles.modalTitle}>¡Postulación Registrada!</Text>
            <Text style={styles.modalSubtitle}>
              Tu solicitud ha sido enviada con éxito para la posición:
            </Text>

            {vacanteSeleccionada && (
              <View style={styles.modalJobBox}>
                <Text style={styles.modalJobTitle}>{vacanteSeleccionada.titulo}</Text>
                <Text style={styles.modalCompanyText}>🏢 {vacanteSeleccionada.empresa}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 6,
    width: '100%',
  },
  badge: {
    color: '#263A75',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#20283B',
  },
  logoutButton: {
    backgroundColor: '#DFE4EE',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#263A75',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: 16,
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE4EE',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    color: '#20283B',
    fontSize: 15,
  },
  
  /* ESTILOS DE LA LISTA EXTENDIDA CASI AL 100% */
  listStyle: {
    width: '100%',
  },
  listPadding: {
    paddingBottom: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 1100,       
    alignSelf: 'center',   
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DFE4EE',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#20283B',
    flex: 1,
    marginRight: 8,
  },
  salaryTag: {
    fontSize: 15,
    fontWeight: '800',
    color: '#263A75',
    backgroundColor: '#F4F6FA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#263A75',
  },
  companyText: {
    fontSize: 14,
    color: '#68738A',
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#68738A',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#68738A',
    lineHeight: 18,
    marginBottom: 14,
  },
  applyButton: {
    backgroundColor: '#263A75',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#68738A',
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    color: '#68738A',
    fontSize: 14,
    textAlign: 'center',
  },

  /* ESTILOS DEL MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE4EE',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#064E3B',
    borderWidth: 1.5,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCheck: {
    color: '#34D399',
    fontSize: 26,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20283B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#68738A',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalJobBox: {
    backgroundColor: '#F4F6FA',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DFE4EE',
  },
  modalJobTitle: {
    color: '#263A75',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalCompanyText: {
    color: '#68738A',
    fontSize: 13,
    marginTop: 2,
  },
  modalButton: {
    backgroundColor: '#263A75',
    paddingVertical: 10,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});