import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  TouchableOpacity,
  AppState
} from 'react-native';

// Importar componentes
import SelectModal from '../components/SelectModal';

// Importar datos de materias
import { 
  materiasQ11, 
  materiasC11, 
  materiasM11, 
  materiasE11, 
  materiasI11, 
  materiasS11, 
  materiasS51 
} from '../assets/Materias.js';

// Importar estilos
import styles, { COLORS } from './SubjectsScreen.css.js';

const uriApi = "https://a6c56c126a30.ngrok-free.app"


const SubjectsScreen = ({ navigation }) => {
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [selectedAnio, setSelectedAnio] = useState(null);
  const [selectedComision, setSelectedComision] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [showMaterias, setShowMaterias] = useState(false);
  const [materias, setMaterias] = useState([]);

  const [carreras, setCarreras] = useState([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [errorCarreras, setErrorCarreras] = useState(null);

  const inactivityTimer = useRef(null);
  const appState = useRef(AppState.currentState);
  const INACTIVITY_TIMEOUT = 60 * 3000; // 3 minutos

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => navigation.navigate('Home'), INACTIVITY_TIMEOUT);
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  };

  const handleUserActivity = () => resetInactivityTimer();

  // ========================
  // API para cargar carreras
  // ========================
  const fetchCarreras = async () => {
    try {
      setLoadingCarreras(true);
      setErrorCarreras(null);

      const response = await fetch(uriApi+'/api/v1/MiUTN/career/');

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Datos de la API:', data);
      
      const carrerasarray = Object.entries(data).map(([id, nombre]) => ({
        id: parseInt(id),
        nombre: nombre
      }));

      setCarreras(carrerasarray);
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      setErrorCarreras(error.message);
      setCarreras(mapCarreras);
    } finally {
      setLoadingCarreras(false);
    }
  };

  const handleRefreshCarreras = () => {
    handleUserActivity();
    fetchCarreras();
  };

  useEffect(() => {
    resetInactivityTimer();

    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        resetInactivityTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        clearInactivityTimer();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      clearInactivityTimer();
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    fetchCarreras();
  }, []);

  // ========================
  // Datos y funciones locales
  // ========================
  const anios = ['1','2','3','4','5'];
  const mapCarreras = [
    { id: 1, nombre: 'Sistemas' },
    { id: 2, nombre: 'Química' },
    { id: 3, nombre: 'Civil' },
    { id: 4, nombre: 'Mecánica' },

    { id: 5, nombre: 'Industrial' },
    { id: 6, nombre: 'Eléctrica' }
  ];

  const comisionesSistemas = ['S11','S12','S13','S14','S15','S16','S21','S22','S23','S24','S31','S32','S33','S41','S51'];
  const comisionesQuimica = ['Q11','Q21','Q31','Q41','Q51'];
  const comisionesCivil = ['C11','C12','C21','C31','C41','C51'];
  const comisionesMecanica = ['M11','M12','M21','M22','M31','M41','M51'];
  const comisionesIndustrial = ['I11','I12','I21','I22','I31','I41','I51'];
  const comisionesElectrica = ['E11','E21','E31','E41','E51'];

  const getComisionesByCarreraYAnio = (carrera, anio) => {
    const anioNum = parseInt(anio);
    const map = {
      1: comisionesSistemas,
      2: comisionesQuimica,
      3: comisionesCivil,
      4: comisionesMecanica,
      5: comisionesIndustrial,
      6: comisionesElectrica
    };
    return (map[carrera] || []).filter(c => parseInt(c.charAt(1)) === anioNum);
  };

  const getSelectedCarreraName = () => {
    if (!selectedCarrera) return 'Seleccionar carrera';
    const lista = carreras.length > 0 ? carreras : mapCarreras;
    const carrera = lista.find(c => c.id === selectedCarrera);
    return carrera ? carrera.nombre : 'Seleccionar carrera';
  };

  const goToHome = () => {
    clearInactivityTimer();
    navigation.navigate('Home');
  };

  const openModal = (modalType) => {
    handleUserActivity();
    setCurrentModal(modalType);
    setModalVisible(true);
  };

  const closeModal = () => {
    handleUserActivity();
    setModalVisible(false);
    setCurrentModal(null);
  };

  const handleSelect = (value) => {
    handleUserActivity();
    switch (currentModal) {
      case 'carrera':
        setSelectedCarrera(value.id);
        setSelectedAnio(null);
        setSelectedComision(null);
        setShowMaterias(false);
        break;
      case 'anio':
        setSelectedAnio(value);
        setSelectedComision(null);
        setShowMaterias(false);
        break;
      case 'comision':
        setSelectedComision(value);
        break;
    }
    closeModal();
  };

  // ========================
  // Función para mapear API al front
  // ========================
const mapApiMateriasToFrontend = (apiData) => {
  return apiData.flatMap(subject => 
    subject.commissions.map(com => ({
      nombre: subject.name,
      horarios: com.dates.map(date => ({
        dia: date.day,
        hora: date.time
      })),
      aula: com.classroom,
      profesor: com.professor
    }))
  );
};


  const getMateriasByComisionLocal = (comision) => {
    switch (comision) {
      case 'Q11': return materiasQ11;
      case 'C11': return materiasC11;
      case 'M11': return materiasM11;
      case 'E11': return materiasE11;
      case 'I11': return materiasI11;
      case 'S11': return materiasS11;
      case 'S51': return materiasS51;
      default: return [];
    }
  };

  const fetchMateriasBySelection = async () => {
    if (!selectedCarrera || !selectedAnio || !selectedComision) return [];

    try {
      const response = await fetch(
        uriApi+`/api/v1/MiUTN/subject/filtered?careerName=${encodeURIComponent(getSelectedCarreraName())}&year=${selectedAnio}&commissionName=${selectedComision}`
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      console.log('Datos API materias:', data);
      return mapApiMateriasToFrontend(data);

    } catch (error) {
      console.error('Error API materias:', error);
      return getMateriasByComisionLocal(selectedComision);
    }
  };

  const handleBuscar = async () => {
    handleUserActivity();
    if (selectedCarrera && selectedAnio && selectedComision) {
      const materiasFiltradas = await fetchMateriasBySelection();
      setMaterias(materiasFiltradas);
      setShowMaterias(true);
    } else {
      alert('Por favor, complete todos los campos: Carrera, Año y Comisión');
    }
  };

  const getCurrentOptions = () => {
    switch (currentModal){
      case 'carrera': return carreras.length > 0 ? carreras : mapCarreras;
      case 'anio': return anios;
      case 'comision': return getComisionesByCarreraYAnio(selectedCarrera, selectedAnio);
      default: return [];
    }
  };

  const getModalTitle = () => {
    switch (currentModal){
      case 'carrera': return 'Seleccionar Carrera';
      case 'anio': return 'Seleccionar Año';
      case 'comision': return 'Seleccionar Comisión';
      default: return 'Seleccionar';
    }
  };

  const getSelectedValue = () => {
    switch (currentModal){
      case 'carrera': 
        if (selectedCarrera) {
          const lista = carreras.length > 0 ? carreras : mapCarreras;
          return lista.find(c => c.id === selectedCarrera) || null;
        }
        return null;
      case 'anio': return selectedAnio;
      case 'comision': return selectedComision;
      default: return null;
    }
  };

  const getCarreraBackground = () => {
  if (!selectedCarrera) return COLORS.background || '#FFFFFF'; // color default
  return carreraColors[selectedCarrera] || '#FFFFFF';
};

  // ========================
  // Render
  // ========================
  return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" />
    <View style={styles.header}>
      <TouchableOpacity onPress={goToHome} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>MiUTN</Text>
      <View style={styles.headerSpacer} />
    </View>

    <ScrollView 
      style={styles.content}
      onTouchStart={handleUserActivity}
      onScroll={handleUserActivity}
    >
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Carrera</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => openModal('carrera')}
          disabled={loadingCarreras}
        >
          <Text style={[
            styles.selectButtonText,
            selectedCarrera && styles.selectButtonTextSelected,
            loadingCarreras && styles.selectButtonTextDisabled
          ]}>
            {loadingCarreras ? 'Cargando carreras...' : getSelectedCarreraName()}
          </Text>
        </TouchableOpacity>

        {errorCarreras && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error al cargar carreras: {errorCarreras}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefreshCarreras}>
              <Text style={styles.refreshButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Año</Text>
        <TouchableOpacity
          style={[styles.selectButton, !selectedCarrera && styles.selectButtonDisabled]}
          onPress={() => selectedCarrera && openModal('anio')}
          disabled={!selectedCarrera}
        >
          <Text style={[styles.selectButtonText, selectedAnio && styles.selectButtonTextSelected]}>
            {selectedAnio || 'Seleccionar año'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Comisión</Text>
        <TouchableOpacity
          style={[styles.selectButton, (!selectedCarrera || !selectedAnio) && styles.selectButtonDisabled]}
          onPress={() => selectedCarrera && selectedAnio && openModal('comision')}
          disabled={!selectedCarrera || !selectedAnio}
        >
          <Text style={[styles.selectButtonText, selectedComision && styles.selectButtonTextSelected]}>
            {selectedComision || 'Seleccionar comisión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buscarButton} onPress={handleBuscar}>
          <Text style={styles.buscarButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      {showMaterias && (
        <View style={styles.framesSection}>
          <Text style={styles.sectionTitle}>Materias</Text>
          {materias.map((materia, index) => {
            const carreraColors = {
              1: { bg: '#E6F0FA', border: '#1E90FF' }, // Sistemas (azules)
              2: { bg: '#F3E6FF', border: '#8A2BE2' }, // Química (violetas)
              3: { bg: '#E6F9E6', border: '#228B22' }, // Civil (verdes)
              4: { bg: '#E6F9F6', border: '#20B2AA' }, // Mecánica (celeste verdoso)
              5: { bg: '#FFF5E6', border: '#FF8C00' }, // Industrial (naranjas)
              6: { bg: '#FDECEC', border: '#B22222' }, // Eléctrica (rojos)
            };


            const colors = carreraColors[selectedCarrera] || { bg: '#FFFFFF', border: '#000000' };

            return (
              <View 
                key={index} 
                style={[
                  styles.materiaContainer,
                  { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 2 }
                ]}
              >
                <View style={styles.materiaContent}>
                  <Text style={styles.materiaNombre}>{materia.nombre}</Text>
                  <View style={styles.horariosContainer}>
                    <Text style={styles.horariosLabel}>Horarios:</Text>
                    {materia.horarios.map((horario, idx) => (
                      <Text key={idx} style={styles.horarioText}>
                        {horario.dia} {horario.hora}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Aula: </Text>
                      <Text style={styles.infoValue}>{materia.aula}</Text>
                    </View>
                  </View>
                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Profesor: </Text>
                      <Text style={styles.infoValue}>{materia.profesor}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>

    <SelectModal
      visible={modalVisible}
      onClose={closeModal}
      options={getCurrentOptions()}
      onSelect={handleSelect}
      title={getModalTitle()}
      selectedValue={getSelectedValue()}
    />
  </SafeAreaView>
);
};

export default SubjectsScreen;
