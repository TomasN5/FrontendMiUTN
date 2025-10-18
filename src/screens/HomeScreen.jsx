import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';

// Importar componentes
import Button from '../components/Button';
import SliderItem from '../components/SliderItem';
import AnnouncementModal from '../components/AnnoucementModal.jsx';

// Importar estilos
import styles from './HomeScreen.css.js';

// Importar imagenes
const mapaIcon = require('../assets/images/mapa-icon.png');
const materiasIcon = require('../assets/images/materias-icon.png');

const HomeScreen = ({ navigation }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const navigateToSubjects = () => {
    console.log('Navegando a pantalla de Materias');
    navigation.navigate('Subjects');
  };

  // Datos de ejemplo con los nuevos atributos
  const sliderItems = [
    { 
      id: 1, 
      title: 'Paro de Transporte', 
      description: 'El dictado de clases será normal',
      fullDescription: 'Debido al paro de transporte programado para el día de mañana, se informa a toda la comunidad educativa que el dictado de clases se desarrollará con normalidad. Se recomienda a los estudiantes planificar su traslado con anticipación y considerar medios de transporte alternativos. Las autoridades estarán monitoreando la situación.',
      important: true,
      image: false
    },
    { 
      id: 2, 
      title: 'Cambio de Aula', 
      description: 'Matemática II se dictará en Aula 105',
      fullDescription: 'Por trabajos de mantenimiento programados en el Aula 203, la materia Matemática II se dictará temporalmente en el Aula 105 del edificio principal. Este cambio será efectivo a partir del lunes próximo y hasta nuevo aviso. Los horarios de las clases permanecen sin cambios.',
      important: false,
      image: false
    },
    { 
      id: 3, 
      title: 'Novedades Exámenes', 
      description: 'Fechas de exámenes actualizadas',
      fullDescription: 'Se han actualizado las fechas de exámenes finales para el período diciembre 2024 - febrero 2025. Los estudiantes pueden consultar el nuevo calendario en el sistema académico. Se recomienda verificar las fechas específicas de cada materia.',
      important: true,
      image: false
    },
    { 
      id: 4, 
      title: 'Inscripciones Abiertas', 
      description: 'Período de inscripción para materias',
      fullDescription: 'Se encuentra abierto el período de inscripción para las materias del primer cuatrimestre 2025. Los estudiantes podrán inscribirse a través del sistema online hasta el 30 de noviembre. No se aceptarán inscripciones fuera de término.',
      important: false,
      image: false
    },
    { 
      id: 5, 
      title: 'Biblioteca Cerrada', 
      description: 'La biblioteca permanecerá cerrada',
      fullDescription: 'La biblioteca central permanecerá cerrada este viernes 15 de noviembre por tareas de inventario general. El servicio se reanudará normalmente el lunes 18 de noviembre. Durante este período, el servicio de biblioteca digital estará disponible las 24 horas.',
      important: false,
      image: false
    },
  ];

  // Duplicar items para efecto infinito
  const infiniteItems = [...sliderItems, ...sliderItems, ...sliderItems];

  // Auto-scroll infinito
  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (scrollViewRef.current) {
        const newIndex = (currentIndex + 1) % sliderItems.length;
        setCurrentIndex(newIndex);
        
        scrollViewRef.current.scrollTo({
          x: (newIndex + sliderItems.length) * (styles.sliderItemWidth + styles.sliderItemMargin),
          animated: true
        });
      }
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(autoScroll);
  }, [currentIndex, sliderItems.length]);

  // Actualizar hora cada minuto
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSliderPress = (item) => {
    console.log('Anuncio presionado:', item.title);
    setSelectedAnnouncement(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedAnnouncement(null);
  };

  // Manejar scroll manual
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffsetX / viewSize);
    setCurrentIndex(index % sliderItems.length);
  };

  // Formatear hora en HH:mm
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MiUTN</Text>
        <Text style={styles.time}>{formatTime(currentTime)}</Text>
      </View>
      
      {/* Botones principales */}
      <View style={styles.buttonsContainer}>
        <Button
          title="Mapa"
          onPress={() => console.log('Mapa presionado')}
          style={styles.giantButton}
          textStyle={styles.giantButtonText}
          imageSource={mapaIcon}
        />
        
        <Button
          title="Materias"
          onPress={navigateToSubjects}
          style={styles.giantButton}
          textStyle={styles.giantButtonText}
          imageSource={materiasIcon}
        />
      </View>
      
      {/* Slider Infinito */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderTitle}>Anuncios</Text>
        
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          scrollEventThrottle={16}
          style={styles.slider}
        >
          {infiniteItems.map((item, index) => (
            <SliderItem
              key={`${item.id}-${index}`}
              item={item}
              onPress={handleSliderPress}
              isImportant={item.important}
            />
          ))}
        </Animated.ScrollView>

        {/* Indicadores de paginación */}
        <View style={styles.pagination}>
          {sliderItems.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Modal de Anuncio */}
      <AnnouncementModal
        visible={modalVisible}
        onClose={handleCloseModal}
        announcement={selectedAnnouncement}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;