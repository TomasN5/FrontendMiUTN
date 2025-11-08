import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import styles from './AnnouncementModal.css.js'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnnouncementModal = ({ 
  visible, 
  onClose, 
  announcement 
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current;
  
  // Estados para manejo de imágenes
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // URL base de la API
  const API_BASE_URL = 'https://e13217bbfd70.ngrok-free.app/api/v1/miUTN';

  // Función para descargar imagen desde el endpoint
  const downloadImage = async (imagePath) => {
    if (!imagePath) return null;
    
    try {
      setImageLoading(true);
      setImageError(false);
      
      const downloadUrl = `${API_BASE_URL}/publication/download?path=${encodeURIComponent(imagePath)}`;
     
      
      // Verificar que la URL es válida
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      // Si la respuesta es exitosa, usar la URL de descarga
      return downloadUrl;
    } catch (error) {
     
      setImageError(true);
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  // Efecto para manejar la descarga de imagen cuando el modal se abre
  useEffect(() => {
    if (visible && announcement?.imagePath) {
      downloadImage(announcement.imagePath).then(url => {
        if (url) {
          setImageUrl(url);
        }
      });
    } else if (visible && announcement?.imageUrl) {
      // Si ya tiene imageUrl, usarla directamente
      setImageUrl(announcement.imageUrl);
    } else {
      // Resetear estados
      setImageUrl(null);
      setImageError(false);
      setImageLoading(false);
    }
  }, [visible, announcement]);

  React.useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!announcement) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.7)" />
      
      {/* Overlay con animación de fade */}
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        {/* Contenido del modal con animación de slide */}
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim 
            }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            
            {/* Header del modal */}
            <View style={styles.header}>
              <Text style={styles.title}>Anuncio</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Contenido scrollable */}
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
              nestedScrollEnabled={true}
            >
              
              {/* Contenido del anuncio con imagen y texto */}
              <View style={styles.announcementContent}>
                
                {/* Título con icono de importancia si es necesario */}
                <View style={styles.titleSection}>
                  <Text style={styles.announcementTitle}>
                    {announcement.title}
                  </Text>
                  {announcement.important && (
                    <View style={styles.importantBadge}>
                      <Text style={styles.importantIcon}>⚠️</Text>
                    </View>
                  )}
                </View>

                {/* Imagen si existe */}
                {announcement.imagePath && (
                  <View style={styles.imageSection}>
                    {imageLoading ? (
                      <View style={styles.imageLoadingContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.imageLoadingText}>Cargando imagen...</Text>
                      </View>
                    ) : imageError ? (
                      <View style={styles.imageErrorContainer}>
                        <Text style={styles.imageErrorText}>⚠️</Text>
                        <Text style={styles.imageErrorText}>Error al cargar la imagen</Text>
                        <TouchableOpacity 
                          style={styles.retryButton}
                          onPress={() => announcement.imagePath && downloadImage(announcement.imagePath)}
                        >
                          <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.imageContainer}>
                        <Image 
                          source={{ 
                            uri: imageUrl || announcement.imageUrl || 'https://via.placeholder.com/300x200' 
                          }}
                          style={styles.announcementImage}
                          resizeMode="cover"
                          onError={() => setImageError(true)}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Descripción completa */}
                <View style={styles.descriptionSection}>
                  <Text style={styles.fullDescriptionText}>
                    {announcement.fullDescription || announcement.description}
                  </Text>
                </View>

              </View>

            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AnnouncementModal;