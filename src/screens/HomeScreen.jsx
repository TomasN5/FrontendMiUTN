import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
  RefreshControl
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
  
  // Estados para la API
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // URL base de la API - ajustar según tu configuración
  // IMPORTANTE: Cambiar esta URL por la URL real de tu API
  // Ejemplo: 'https://tu-dominio.ngrok.io/api/announcements' o 'http://localhost:3000/api/announcements'
  const API_BASE_URL = 'https://8d13dfce1445.ngrok-free.app/api/v1/miUTN/publication'; // Cambiar por tu URL real
  
  // Configuración de actualización automática
  const AUTO_UPDATE_CONFIG = {
    enabled: true,        // Habilitar/deshabilitar actualización automática
    interval: 30000,      // Intervalo en milisegundos (30 segundos)
    onAppFocus: true,     // Actualizar cuando la app vuelve al primer plano
    onPullRefresh: true,  // Permitir pull-to-refresh
  };
  
  const navigateToSubjects = () => {
    console.log('Navegando a pantalla de Materias');
    navigation.navigate('Subjects');
  };

  // FETCH: Obtener anuncios publicados con mejor manejo de errores
  const fetchAnnouncements = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      console.log('Iniciando fetch a:', `${API_BASE_URL}/findAll`);
      
      // Agregar timeout para evitar esperas infinitas
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(`${API_BASE_URL}/findAll`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      function quitarHora(fechaConHora) {
        if(fechaConHora != null)
          return fechaConHora.split('T')[0];
        else
          return null;
      }

      // Filtrar solo los anuncios publicados y mapear datos
      const publishedAnnouncements = data
        .filter(item => item.hidden) // Solo anuncios publicados
        .map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          fullDescription: item.content || item.description,
          date: quitarHora(item.creationDate) || "Sin fecha",
          important: item.priority,
          content: item.content,
          imagePath: item.imagePath,
          expirationDate: quitarHora(item.expirationDate)
        }))
        .slice(0, 6); // Limitar a 6 anuncios para el slider

      console.log('Anuncios publicados mapeados:', publishedAnnouncements);
      setAnnouncements(publishedAnnouncements);
      
    } catch (err) {
      console.error('Error completo en fetch:', err);
      
      if (err.name === 'AbortError') {
        setError('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
      } else if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Error de conexión. Verifica: 1) Tu conexión a internet, 2) Que la URL de la API sea correcta, 3) Que ngrok esté activo');
      } else {
        setError(`Error al cargar los anuncios: ${err.message}`);
      }
      
      // Datos de ejemplo en caso de error
      setAnnouncements([
        {
          id: 1,
          title: "Sistema en Mantenimiento",
          description: "Estamos teniendo dificultades técnicas. Los anuncios se cargarán pronto.",
          fullDescription: "Estamos experimentando dificultades técnicas con el servidor. Los anuncios se cargarán automáticamente una vez que se resuelva el problema. Disculpe las molestias.",
          date: new Date().toISOString().split('T')[0],
          important: true,
          image: false
        },
        {
          id: 2,
          title: "Bienvenido al Sistema",
          description: "Usa los botones superiores para gestionar anuncios, materias y profesores.",
          fullDescription: "Bienvenido a MiUTN. Utiliza los botones superiores para navegar entre las diferentes secciones: Mapa para ubicaciones, Materias para gestión académica, y otros servicios disponibles.",
          date: new Date().toISOString().split('T')[0],
          important: false,
          image: false
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Usar anuncios de la API o datos de fallback
  const sliderItems = announcements.length > 0 ? announcements : [
    {
      id: 1,
      title: "Cargando anuncios...",
      description: "Por favor espera mientras cargamos los anuncios más recientes.",
      fullDescription: "Estamos cargando los anuncios más recientes del sistema. Esto puede tomar unos momentos.",
      important: false,
      image: false
    }
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

  // Función para refresh manual
  const onRefresh = () => {
    fetchAnnouncements(true);
  };

  // Cargar anuncios al montar el componente
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Actualización periódica configurable
  useEffect(() => {
    if (!AUTO_UPDATE_CONFIG.enabled) return;

    const interval = setInterval(() => {
      console.log('Actualizando anuncios automáticamente...');
      fetchAnnouncements(true);
    }, AUTO_UPDATE_CONFIG.interval);

    return () => clearInterval(interval);
  }, []);

  // Actualizar al volver a la pantalla (cuando la app vuelve del background)
  useEffect(() => {
    if (!AUTO_UPDATE_CONFIG.onAppFocus) return;

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App activa, actualizando anuncios...');
        fetchAnnouncements(true);
      }
    };

    // Importar AppState dinámicamente para evitar problemas de importación
    const { AppState } = require('react-native');
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, []);

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
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando anuncios...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Reintentar"
              onPress={fetchAnnouncements}
              style={styles.retryButton}
              textStyle={styles.retryButtonText}
            />
          </View>
        ) : (
          <>
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
          </>
        )}
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