import React from 'react';
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
  Image
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
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              
              {/* Si es una imagen, mostrar solo la imagen */}
              {announcement.image ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: announcement.imageUrl || 'https://via.placeholder.com/300x200' }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {announcement.important && (
                    <View style={styles.importantBadge}>
                      <Text style={styles.importantIcon}>⚠️</Text>
                    </View>
                  )}
                </View>
              ) : (
                /* Si no es imagen, mostrar título y descripción completa */
                <View style={styles.textContent}>
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

                  {/* Descripción completa */}
                  <View style={styles.descriptionSection}>
                    <Text style={styles.fullDescriptionText}>
                      {announcement.fullDescription || announcement.description}
                    </Text>
                  </View>
                </View>
              )}

            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default AnnouncementModal;