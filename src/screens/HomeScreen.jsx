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
  
  const navigateToSubjects = () => {
    console.log('Navegando a pantalla de Materias');
    navigation.navigate('Subjects');
  };


  // Datos de ejemplo para el slider de anuncios (más items para efecto infinito)
  const sliderItems = [
    { 
      id: 1, 
      title: 'Paro de Transporte', 
      description: 'El dictado de clases será normal' 
    },
    { 
      id: 2, 
      title: 'Cambio de Aula', 
      description: 'Matemática II se dictará en Aula 105' 
    },
    { 
      id: 3, 
      title: 'Novedades Exámenes', 
      description: 'Fechas de exámenes actualizadas' 
    },
    { 
      id: 4, 
      title: 'Inscripciones Abiertas', 
      description: 'Período de inscripción para materias' 
    },
    { 
      id: 5, 
      title: 'Biblioteca Cerrada', 
      description: 'La biblioteca permanecerá cerrada' 
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
    </SafeAreaView>
  );
};

export default HomeScreen;