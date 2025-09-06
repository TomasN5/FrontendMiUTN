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

// Importar estilos
import styles, { COLORS } from './SubjectsScreen.css.js';

const SubjectsScreen = ({ navigation }) => {
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [selectedAnio, setSelectedAnio] = useState(null);
  const [selectedComision, setSelectedComision] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [showMaterias, setShowMaterias] = useState(false);

  // Referencias para el timer de inactividad
  const inactivityTimer = useRef(null);
  const appState = useRef(AppState.currentState);

  // Configuración del timeout (1 minuto = 60,000 ms)
  const INACTIVITY_TIMEOUT = 60 * 3000; // 3 minutos en milisegundos

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = () => {
    // Limpiar timer existente
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Crear nuevo timer
    inactivityTimer.current = setTimeout(() => {
      // Navegar a la pantalla principal
      navigation.navigate('Home');
    }, INACTIVITY_TIMEOUT);
  };

  // Función para limpiar el timer
  const clearInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  };

  // Función para manejar la actividad del usuario
  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  // ===== EFECTOS =====

  // Configurar timer de inactividad al montar el componente
  useEffect(() => {
    // Iniciar el timer cuando se monta el componente
    resetInactivityTimer();

    // Listener para cambios de estado de la app
    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App volvió al foreground, resetear timer
        resetInactivityTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        // App va al background, limpiar timer
        clearInactivityTimer();
      }
      appState.current = nextAppState;
    };

    // Suscribirse a cambios de estado de la app
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup al desmontar
    return () => {
      clearInactivityTimer();
      subscription?.remove();
    };
  }, []);

  // Datos para los selects
  const carreras = ['Sistemas', 'Química', 'Mecánica', 'Civil', 'Eléctrica'];
  const anios = ['1', '2', '3', '4', '5'];
  const comisiones = ['A', 'B', 'C', 'D'];

  // Datos de ejemplo para los frames (materias)
  const materias = [
    {
      nombre: 'Proyecto Final (Anual)',
      horarios: [
        { dia: 'Martes', hora: '20:15-22:15' },
        { dia: 'Jueves', hora: '20:30-22:30' }
      ],
      aula: '131',
      profesor: 'Sergio Antonini'
    },
    {
      nombre: 'Base de Datos II',
      horarios: [
        { dia: 'Lunes', hora: '18:00-20:00' },
        { dia: 'Miércoles', hora: '18:00-20:00' }
      ],
      aula: '205',
      profesor: 'María Rodriguez'
    },
    {
      nombre: 'Inteligencia Artificial',
      horarios: [
        { dia: 'Viernes', hora: '16:00-19:00' }
      ],
      aula: '310',
      profesor: 'Carlos López'
    }
  ];

  // Función para navegar a Home
  const goToHome = () => {
    clearInactivityTimer();
    navigation.navigate('Home');
  };

  // Abrir modal específico
  const openModal = (modalType) => {
    handleUserActivity(); // Resetear timer al abrir modal
    setCurrentModal(modalType);
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    handleUserActivity(); // Resetear timer al cerrar modal
    setModalVisible(false);
    setCurrentModal(null);
  };

  // Seleccionar opción
  const handleSelect = (value) => {
    handleUserActivity(); // Resetear timer al seleccionar
    
    switch (currentModal) {
      case 'carrera':
        setSelectedCarrera(value);
        // Resetear año y comisión cuando cambia la carrera
        setSelectedAnio(null);
        setSelectedComision(null);
        setShowMaterias(false);
        break;
      case 'anio':
        setSelectedAnio(value);
        // Resetear comisión cuando cambia el año
        setSelectedComision(null);
        setShowMaterias(false);
        break;
      case 'comision':
        setSelectedComision(value);
        break;
    }
    closeModal();
  };

  // Función para buscar materias
  const handleBuscar = () => {
    handleUserActivity(); // Resetear timer al buscar
    
    if (selectedCarrera && selectedAnio && selectedComision) {
      setShowMaterias(true);
    } else {
      alert('Por favor, complete todos los campos: Carrera, Año y Comisión');
    }
  };

  // Obtener opciones según el modal actual
  const getCurrentOptions = () => {
    switch (currentModal) {
      case 'carrera': return carreras;
      case 'anio': return anios;
      case 'comision': return comisiones;
      default: return [];
    }
  };

  // Obtener título según el modal actual
  const getModalTitle = () => {
    switch (currentModal) {
      case 'carrera': return 'Seleccionar Carrera';
      case 'anio': return 'Seleccionar Año';
      case 'comision': return 'Seleccionar Comisión';
      default: return 'Seleccionar';
    }
  };

  // Obtener valor seleccionado actual
  const getSelectedValue = () => {
    switch (currentModal) {
      case 'carrera': return selectedCarrera;
      case 'anio': return selectedAnio;
      case 'comision': return selectedComision;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header con flecha de volver y título */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToHome} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MiUTN</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenido principal */}
      <ScrollView 
        style={styles.content}
        onTouchStart={handleUserActivity} // Resetear timer al tocar la pantalla
        onScroll={handleUserActivity} // Resetear timer al hacer scroll
      >
        {/* Sección de selección - Carrera, Año, Comisión */}
        <View style={styles.selectionSection}>
          {/* Select de Carrera */}
          <Text style={styles.sectionTitle}>Carrera</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => openModal('carrera')}
          >
            <Text style={[
              styles.selectButtonText,
              selectedCarrera && styles.selectButtonTextSelected
            ]}>
              {selectedCarrera || 'Seleccionar carrera'}
            </Text>
          </TouchableOpacity>

          {/* Select de Año */}
          <Text style={styles.sectionTitle}>Año</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              !selectedCarrera && styles.selectButtonDisabled
            ]}
            onPress={() => selectedCarrera && openModal('anio')}
            disabled={!selectedCarrera}
          >
            <Text style={[
              styles.selectButtonText,
              selectedAnio && styles.selectButtonTextSelected,
              !selectedCarrera && styles.selectButtonTextDisabled
            ]}>
              {selectedAnio || 'Seleccionar año'}
            </Text>
          </TouchableOpacity>

          {/* Select de Comisión */}
          <Text style={styles.sectionTitle}>Comisión</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              (!selectedCarrera || !selectedAnio) && styles.selectButtonDisabled
            ]}
            onPress={() => selectedCarrera && selectedAnio && openModal('comision')}
            disabled={!selectedCarrera || !selectedAnio}
          >
            <Text style={[
              styles.selectButtonText,
              selectedComision && styles.selectButtonTextSelected,
              (!selectedCarrera || !selectedAnio) && styles.selectButtonTextDisabled
            ]}>
              {selectedComision || 'Seleccionar comisión'}
            </Text>
          </TouchableOpacity>

          {/* Botón Buscar */}
          <TouchableOpacity
            style={styles.buscarButton}
            onPress={handleBuscar}
          >
            <Text style={styles.buscarButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Sección de Frames - Solo se muestra después de buscar */}
        {showMaterias && (
          <View style={styles.framesSection}>
            <Text style={styles.sectionTitle}>Materias</Text>
            
            {materias.map((materia, index) => (
              <View key={index} style={styles.materiaContainer}>
                {/* Contenedor de la materia SIN scroll horizontal */}
                <View style={styles.materiaContent}>
                  {/* Nombre de la materia */}
                  <Text style={styles.materiaNombre}>{materia.nombre}</Text>
                  
                  {/* Horarios */}
                  <View style={styles.horariosContainer}>
                    <Text style={styles.horariosLabel}>Horarios:</Text>
                    {materia.horarios.map((horario, idx) => (
                      <Text key={idx} style={styles.horarioText}>
                        {horario.dia} {horario.hora}
                      </Text>
                    ))}
                  </View>

                  {/* Aula y Profesor */}
                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Aula: </Text>
                      <Text style={styles.infoValue}>{materia.aula}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Profesor: </Text>
                      <Text style={styles.infoValue}>{materia.profesor}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal para selects */}
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