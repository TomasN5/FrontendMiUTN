import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator
} from 'react-native';
import { usePlanoManager } from './usePlanoManager';
import { useMapData } from './useMapData';
import { useGPSNavigation } from './useGPSNavigation';
import PlanoMap from './PlanoMap';
import ControlPanel from './ControlPanel';
import NavigationPanel from './NavigationPanel';
import { useCoordinateAdapter } from './useCoordinateAdapter';

const PlanoViewer = ({ navigation }) => {
  const planoManager = usePlanoManager();
  const mapData = useMapData(); // Solo carga datos, sin edición
  const gpsNavigation = useGPSNavigation(mapData.areas, mapData.puntos, mapData.planos);
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [planoDataActual, setPlanoDataActual] = useState({ areas: [], puntos: [] });
  const { screenWidth, screenHeight } = useCoordinateAdapter();

  // Inicializar planos
  useEffect(() => {
    planoManager.inicializarPlanosCarrera('general');
  }, []);
useEffect(() => {
  console.log('📱 Tamaño de pantalla:', { screenWidth, screenHeight });
}, [screenWidth, screenHeight]);
  // Actualizar datos cuando cambia el plano
  useEffect(() => {
    if (planoManager.planoActual && !mapData.loading) {
      const datos = mapData.getPlanoData(planoManager.planoActual.id);
      setPlanoDataActual(datos);
      console.log(`📍 Plano ${planoManager.planoActual.nombre}: ${datos.areas.length} áreas, ${datos.puntos.length} puntos`);
    }
  }, [planoManager.planoActual, mapData.loading]);

  if (mapData.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (mapData.error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error cargando el mapa</Text>
          <Text style={styles.errorDetail}>{mapData.error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={mapData.refresh}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Botón de volver */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>
      
      {/* Mapa del plano con datos reales */}
      <PlanoMap
        plano={planoManager.planoActual}
        areas={planoDataActual.areas}
        points={planoDataActual.puntos}
        rutaActual={gpsNavigation.rutaActual}
      />
      
      {/* Panel de control de navegación */}
      <ControlPanel
        planoActual={planoManager.planoActual}
        infoPlanoActual={planoManager.infoPlanoActual()}
        carreraActual={planoManager.carreraActual}
        carrerasDisponibles={planoManager.carrerasDisponibles}
        onCambiarCarrera={planoManager.cambiarCarrera}
        onCambiarPlano={planoManager.cambiarPlano}
        onAvanzarPlano={planoManager.avanzarPlano}
        onRetrocederPlano={planoManager.retrocederPlano}
        onShowNavigation={() => setShowNavigationPanel(true)}
        stats={{
          areas: planoDataActual.areas.length,
          puntos: planoDataActual.puntos.length
        }}
      />
      
      {/* Panel de navegación GPS */}
      {showNavigationPanel && (
        <NavigationPanel
            gpsNavigation={{
              origen: gpsNavigation.origen,
              destino: gpsNavigation.destino,
              rutaActual: gpsNavigation.rutaActual,
              isCalculando: gpsNavigation.isCalculando,
              setOrigen: gpsNavigation.setOrigen,        // 🔥 Asegurar que esté
              setDestino: gpsNavigation.setDestino,      // 🔥 Asegurar que esté
              calcularRuta: gpsNavigation.calcularRuta,  // 🔥 Asegurar que esté
              limpiarRuta: gpsNavigation.limpiarRuta     // 🔥 Asegurar que esté
            }}
            todosLosNodos={mapData.getAllNodes()}
            onClose={() => setShowNavigationPanel(false)}
          />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: '600',
    marginBottom: 10
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default PlanoViewer;