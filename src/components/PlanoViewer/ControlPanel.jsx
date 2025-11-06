import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const ControlPanel = ({
  planoActual,
  infoPlanoActual,
  carreraActual,
  carrerasDisponibles,
  planosCarreraActual = [],
  onCambiarCarrera,
  onCambiarPlano,
  onAvanzarPlano,
  onRetrocederPlano,
  onShowNavigation
}) => {
  const [showPlanosModal, setShowPlanosModal] = useState(false);

  const handleSeleccionarPlano = (planoId) => {
    onCambiarPlano(planoId);
    setShowPlanosModal(false);
  };

  const renderPlanos = () => {
    if (planosCarreraActual.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🏗️</Text>
          <Text style={styles.emptyStateText}>No hay planos disponibles</Text>
          <Text style={styles.emptyStateSubtext}>Selecciona otra carrera</Text>
        </View>
      );
    }

    return planosCarreraActual.map((plano, index) => (
      <TouchableOpacity
        key={plano.id}
        style={[
          styles.planoItem,
          planoActual?.id === plano.id && styles.planoItemActive
        ]}
        onPress={() => handleSeleccionarPlano(plano.id)}
      >
        <View style={styles.planoItemContent}>
          <Text style={styles.planoItemName}>{plano.nombre}</Text>
          <Text style={styles.planoItemDetails}>
            {plano.piso || 'Sin piso'} • Plano {index + 1}
          </Text>
        </View>
        {planoActual?.id === plano.id && (
          <Text style={styles.planoItemSelected}>✓</Text>
        )}
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      
      {/* SELECTOR DE PLANTA ARRIBA */}
      <TouchableOpacity 
        style={styles.planoSelector}
        onPress={() => setShowPlanosModal(true)}
      >
        <View style={styles.planoSelectorContent}>
          <Text style={styles.planoSelectorIcon}>🏢</Text>
          <View style={styles.planoSelectorText}>
            <Text style={styles.planoSelectorTitle}>Planta Actual</Text>
            <Text style={styles.planoSelectorName}>
              {planoActual?.nombre || 'Seleccionar plano'}
            </Text>
            <Text style={styles.planoSelectorDetails}>
              {planoActual?.piso || 'General'} • {infoPlanoActual?.numero || 1}/{infoPlanoActual?.total || planosCarreraActual.length}
            </Text>
          </View>
          <Text style={styles.chevron}>⌄</Text>
        </View>
      </TouchableOpacity>

      {/* BOTÓN NAVEGACIÓN CENTRADO */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={onShowNavigation}
      >
        <Text style={styles.navButtonIcon}>🧭</Text>
        <Text style={styles.navButtonText}>Iniciar Navegación</Text>
      </TouchableOpacity>

      {/* CARRERAS */}
      {carrerasDisponibles.length > 1 && (
        <View style={styles.carrerasRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carrerasScroll}>
            {carrerasDisponibles.map(carrera => (
              <TouchableOpacity
                key={carrera}
                style={[
                  styles.carreraBtn,
                  carreraActual === carrera && styles.carreraBtnActive
                ]}
                onPress={() => onCambiarCarrera(carrera)}
              >
                <Text style={[
                  styles.carreraText,
                  carreraActual === carrera && styles.carreraTextActive
                ]}>
                  {carrera === 'general' ? '🏛️ General' : `🎓 ${carrera}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* MODAL */}
      <Modal
        visible={showPlanosModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlanosModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Planta</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowPlanosModal(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* LISTA DE PLANOS */}
            <ScrollView style={styles.modalScroll}>
              {renderPlanos()}
            </ScrollView>

          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: (screenWidth - 320) / 2,
    width: 320,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
  },
  
  // SELECTOR DE PLANTA - ARRIBA
  planoSelector: {
    width: '100%',
    marginBottom: 16,
  },
  planoSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  planoSelectorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  planoSelectorText: {
    flex: 1,
  },
  planoSelectorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  planoSelectorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  planoSelectorDetails: {
    fontSize: 12,
    color: '#666',
  },
  chevron: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '300',
  },
  
  // BOTÓN NAVEGACIÓN - CENTRADO Y MÁS GRANDE
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  
  // CARRERAS
  carrerasRow: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginTop: 16,
  },
  carrerasScroll: {
    justifyContent: 'center',
  },
  carreraBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  carreraBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056cc',
  },
  carreraText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  carreraTextActive: {
    color: 'white',
  },
  
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#666',
  },
  modalScroll: {
    padding: 16,
  },
  
  // ITEMS DE PLANO
  planoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  planoItemActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  planoItemContent: {
    flex: 1,
  },
  planoItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  planoItemDetails: {
    fontSize: 14,
    color: '#666',
  },
  planoItemSelected: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
  },
  
  // ESTADO VACÍO
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default ControlPanel;