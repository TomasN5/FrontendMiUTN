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

const SubjectsScreen = ({ navigation }) => {
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [selectedAnio, setSelectedAnio] = useState(null);
  const [selectedComision, setSelectedComision] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentModal, setCurrentModal] = useState(null);
  const [showMaterias, setShowMaterias] = useState(false);
  const [materias, setMaterias] = useState([]);
  
  // Estados para manejar las carreras del endpoint
  const [carreras, setCarreras] = useState([]);
  const [loadingCarreras, setLoadingCarreras] = useState(false);
  const [errorCarreras, setErrorCarreras] = useState(null);

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

  // Función para obtener carreras desde el endpoint
  const fetchCarreras = async () => {
    try {
      setLoadingCarreras(true);
      setErrorCarreras(null);
      
      const response = await fetch('https://d8083c3ae966.ngrok-free.app/api/v1/MiUTN/career/');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setCarreras(data);
      
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      setErrorCarreras(error.message);
      
      // En caso de error, usar datos por defecto
      setCarreras(mapCarreras);
    } finally {
      setLoadingCarreras(false);
    }
  };

  // Función para refrescar carreras
  const handleRefreshCarreras = () => {
    handleUserActivity(); // Resetear timer
    fetchCarreras();
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

  // Efecto para cargar carreras al montar el componente
  useEffect(() => {
    fetchCarreras();
  }, []);

  // Datos para los selects
  const anios = ['1', '2', '3', '4', '5'];

  // Función para obtener materias según la comisión seleccionada
  const getMateriasByComision = (comision) => {
    switch (comision) {
      case 'Q11':
        return materiasQ11;
      case 'C11':
        return materiasC11;
      case 'M11':
        return materiasM11;
      case 'E11':
        return materiasE11;
      case 'I11':
        return materiasI11;
      case 'S11':
        return materiasS11;
      case 'S51':
        return materiasS51;
      default:
        return [];
    }
  };

  const mapCarreras =  [
    { id: 1, nombre: 'Sistemas' },
    { id: 2, nombre: 'Química' },
    { id: 3, nombre: 'Mecánica' },
    { id: 4, nombre: 'Civil' },
    { id: 5, nombre: 'Industrial' },
    { id: 6, nombre: 'Eléctrica' }
  ]

  const comisionesSistemas = [
    'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S21', 'S22', 'S23', 'S24', 'S31', 'S32', 'S33', 'S41', 'S51'
  ]
  
  const comisionesQuimica = [
    'Q11', 'Q21', 'Q31', 'Q41', 'Q51'
  ]
  
  const comisionesCivil = [
    'C11', 'C12', 'C21', 'C31', 'C41', 'C51'
  ]
  
  const comisionesMecanica = [
    'M11', 'M12', 'M21', 'M22', 'M31', 'M41', 'M51'
  ]
  
  const comisionesIndustrial = [
    'I11', 'I12', 'I21', 'I22', 'I31', 'I41', 'I51'
  ]
  
  const comisionesElectrica = [
    'E11', 'E21', 'E31', 'E41', 'E51'
  ]

  // Función para obtener comisiones según carrera y año
const getComisionesByCarreraYAnio = (carrera, anio) => {
  const anioNum = parseInt(anio);

  switch (carrera){
    case 1:
      const filtrados = comisionesSistemas.filter(comision => {
        const primerDigito = parseInt(comision.charAt(1));
        return primerDigito === anioNum;
      });
      return filtrados;
    
    case 2:
      return comisionesQuimica.filter(comision => {
        const primerDigito = parseInt(comision.charAt(1));
        return primerDigito === anioNum;
      });
    
    case 3:
      return comisionesCivil.filter(comision => {
        const primerDigito = parseInt(comision.charAt(1));
        return primerDigito === anioNum;
      });
    
    case 4:
      return comisionesMecanica.filter(comision => {
        const primerDigito = parseInt(comision.charAt(1));
        return primerDigito === anioNum;
      });
    
    case 5:
      return comisionesIndustrial.filter(comision => {
        const primerDigito = parseInt(comision.charAt(1));
        return primerDigito === anioNum;
      });
    
    case 6:
      return comisionesElectrica.filter(comision => {
        const primerDigito = parseInt(comision.charAt(1));
        return primerDigito === anioNum;
      });
    
    default:
      return [];
  }
};

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
    handleUserActivity(); // Resetear timer al selecciona
    console.log('Valor recibido en handleSelect:', value);

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
      // Obtener las materias según la comisión seleccionada
      const materiasFiltradas = getMateriasByComision(selectedComision);
      setMaterias(materiasFiltradas);
      setShowMaterias(true);
    } else {
      alert('Por favor, complete todos los campos: Carrera, Año y Comisión');
    }
  };

  // Obtener opciones según el modal actual
  const getCurrentOptions = () => {
    switch (currentModal) {
      case 'carrera': return carreras.length > 0 ? carreras : mapCarreras;
      case 'anio': return anios;
      case 'comision': return getComisionesByCarreraYAnio(selectedCarrera, selectedAnio);;
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

    // Función para obtener el nombre de la carrera seleccionada para mostrar
    const getSelectedCarreraName = () => {
      if (!selectedCarrera) return 'Seleccionar carrera';
      const carrerasList = carreras.length > 0 ? carreras : mapCarreras;
      const carrera = carrerasList.find(c => c.id === selectedCarrera);
      return carrera ? carrera.nombre : 'Seleccionar carrera';
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
          
          {/* Mostrar error si hay problema cargando carreras */}
          {errorCarreras && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error al cargar carreras: {errorCarreras}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshCarreras}
              >
                <Text style={styles.refreshButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

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