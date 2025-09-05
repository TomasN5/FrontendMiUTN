import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  TouchableOpacity
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
    navigation.navigate('Home');
  };

  // Abrir modal específico
  const openModal = (modalType) => {
    setCurrentModal(modalType);
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setCurrentModal(null);
  };

  // Seleccionar opción
  const handleSelect = (value) => {
    switch (currentModal) {
      case 'carrera':
        setSelectedCarrera(value);
        break;
      case 'anio':
        setSelectedAnio(value);
        break;
      case 'comision':
        setSelectedComision(value);
        break;
    }
    closeModal();
  };

  // Función para buscar materias
  const handleBuscar = () => {
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
      <ScrollView style={styles.content}>
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
            style={styles.selectButton}
            onPress={() => openModal('anio')}
          >
            <Text style={[
              styles.selectButtonText,
              selectedAnio && styles.selectButtonTextSelected
            ]}>
              {selectedAnio || 'Seleccionar año'}
            </Text>
          </TouchableOpacity>

          {/* Select de Comisión */}
          <Text style={styles.sectionTitle}>Comisión</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => openModal('comision')}
          >
            <Text style={[
              styles.selectButtonText,
              selectedComision && styles.selectButtonTextSelected
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