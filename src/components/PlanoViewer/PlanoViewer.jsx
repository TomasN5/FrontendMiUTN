import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanoManager } from './usePlanoManager';
import { useMapData } from './useMapData';
import { useGPSNavigation } from './useGPSNavigation';
import PlanoMap from './PlanoMap';
import ControlPanel from './ControlPanel';
import NavigationPanel from './NavigationPanel';

const PlanoViewer = ({ navigation }) => {
  const planoManager = usePlanoManager();
  const mapData = useMapData();
  const gpsNavigation = useGPSNavigation(mapData.areas, mapData.puntos, mapData.planos);
  
  const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(true);
  // 🔥 NUEVO: Estado para controlar visibilidad del ControlPanel
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [planoDataActual, setPlanoDataActual] = useState({ areas: [], puntos: [] });

  useEffect(() => {
    planoManager.inicializarPlanosCarrera('general');
  }, []);

  useEffect(() => {
    if (planoManager.planoActual && !mapData.loading) {
      const datos = mapData.getPlanoData(planoManager.planoActual.id);
      setPlanoDataActual(datos);
    }
  }, [planoManager.planoActual, mapData.loading]);

  const handleShowNavigation = () => {
    setShowNavigationPanel(true);
    setShowZoomControls(false);
    setShowControlPanel(false); // 🔥 Ocultar panel al abrir navegación
  };

  const handleCloseNavigation = () => {
    setShowNavigationPanel(false);
    setShowZoomControls(true);
  };

  const handleCalcularRuta = () => {
    gpsNavigation.calcularRuta();
    handleCloseNavigation();
  };

  // 🔥 NUEVA FUNCIÓN: Alternar visibilidad del ControlPanel
  const handleToggleControlPanel = () => {
    setShowControlPanel(!showControlPanel);
  };

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
      
      <PlanoMap
        plano={planoManager.planoActual}
        areas={planoDataActual.areas}
        points={planoDataActual.puntos}
        rutaActual={gpsNavigation.rutaActual}
        graphConnections={gpsNavigation.graphConnections}
        getGraphConnectionsForPlano={gpsNavigation.getGraphConnectionsForPlano}
        getRouteNodes={gpsNavigation.getRouteNodes}
        showNavigationPanel={showNavigationPanel}
        onToggleControlPanel={handleToggleControlPanel} // 🔥 Nueva prop
      />
      
      {/* 🔥 ControlPanel ahora es condicional */}
      {showControlPanel && (
        <ControlPanel
          planoActual={planoManager.planoActual}
          infoPlanoActual={planoManager.infoPlanoActual}
          carreraActual={planoManager.carreraActual}
          carrerasDisponibles={planoManager.carrerasDisponibles}
          planosCarreraActual={planoManager.planosCarreraActual}
          onCambiarCarrera={planoManager.cambiarCarrera}
          onCambiarPlano={planoManager.cambiarPlano}
          onAvanzarPlano={planoManager.avanzarPlano}
          onRetrocederPlano={planoManager.retrocederPlano}
          onShowNavigation={handleShowNavigation}
        />
      )}
      
      {showNavigationPanel && (
        <NavigationPanel
          gpsNavigation={{
            origen: gpsNavigation.origen,
            destino: gpsNavigation.destino,
            rutaActual: gpsNavigation.rutaActual,
            isCalculando: gpsNavigation.isCalculando,
            setOrigen: gpsNavigation.setOrigen,
            setDestino: gpsNavigation.setDestino,
            calcularRuta: handleCalcularRuta,
            limpiarRuta: gpsNavigation.limpiarRuta
          }}
          todosLosNodos={mapData.getAllNodes()}
          onClose={handleCloseNavigation}
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
    top: 10,
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