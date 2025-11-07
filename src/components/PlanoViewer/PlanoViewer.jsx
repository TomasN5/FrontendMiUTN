// PlanoViewer.jsx - VERSIÓN COMPLETA RESTAURADA
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [planoDataActual, setPlanoDataActual] = useState({ areas: [], puntos: [] });
  const [origenFijo, setOrigenFijo] = useState(null);

  useEffect(() => {
    planoManager.inicializarPlanosCarrera('general');
  }, []);

  useEffect(() => {
    if (planoManager.planoActual && !mapData.loading) {
      const datos = mapData.getPlanoData(planoManager.planoActual.id);
      setPlanoDataActual(datos);
    }
  }, [planoManager.planoActual, mapData.loading]);

  // 🔥 RESTAURADO: Lógica completa para establecer origen fijo
  useEffect(() => {
    const buscarYEstablecerOrigenFijo = () => {
      if (!mapData.getAllNodes || typeof mapData.getAllNodes !== 'function') {
        console.log('⚠️ mapData.getAllNodes no está disponible aún');
        return;
      }

      const todosLosNodos = mapData.getAllNodes();
      if (!todosLosNodos || todosLosNodos.length === 0) {
        console.log('⚠️ No hay nodos disponibles aún');
        return;
      }

      console.log('🔍 Buscando origen fijo entre', todosLosNodos.length, 'nodos');
      
      let totem = null;

      // 1. Buscar por tipo 'totem'
      totem = todosLosNodos.find(node => 
        node && node.tipo === 'totem'
      );
      
      // 2. Buscar por nombre que contenga "totem"
      if (!totem) {
        totem = todosLosNodos.find(node => 
          node && node.nombre && node.nombre.toLowerCase().includes('totem')
        );
      }
      
      // 3. Buscar por nombre que contenga "recepción" o "entrada"
      if (!totem) {
        totem = todosLosNodos.find(node => 
          node && node.nombre && (
            node.nombre.toLowerCase().includes('recepcion') ||
            node.nombre.toLowerCase().includes('recepción') ||
            node.nombre.toLowerCase().includes('entrada') ||
            node.nombre.toLowerCase().includes('principal')
          )
        );
      }
      
      // 4. Buscar cualquier nodo de tipo común
      if (!totem && todosLosNodos.length > 0) {
        totem = todosLosNodos.find(node => 
          node && node.tipo && 
          ['aula', 'hall', 'departamento', 'area_generica', 'escalera'].includes(node.tipo)
        ) || todosLosNodos[0];
      }

      if (totem) {
        console.log('✅ Origen fijo encontrado:', totem.nombre, '- ID:', totem.id);
        setOrigenFijo(totem.id);
        
        // Establecer automáticamente el origen en GPS
        if (gpsNavigation.setOrigen) {
          gpsNavigation.setOrigen(totem.id);
        }
      } else {
        console.log('⚠️ No se encontró origen fijo, usando valor por defecto');
        setOrigenFijo('totem_principal');
      }
    };

    // Solo ejecutar si tenemos datos y no tenemos un origen fijo ya establecido
    if (mapData.getAllNodes && 
        typeof mapData.getAllNodes === 'function' && 
        !mapData.loading && 
        !origenFijo) {
      buscarYEstablecerOrigenFijo();
    }
  }, [mapData.getAllNodes, mapData.loading, origenFijo, gpsNavigation.setOrigen]);

  const handleShowNavigation = () => {
    setShowNavigationPanel(true);
    setShowZoomControls(false);
    setShowControlPanel(false);
  };

  const handleCloseNavigation = () => {
    setShowNavigationPanel(false);
    setShowZoomControls(true);
  };

  const handleCalcularRuta = () => {
    gpsNavigation.calcularRuta();
    handleCloseNavigation();
  };

  const handleToggleControlPanel = () => {
    setShowControlPanel(!showControlPanel);
  };

  // 🔥 RESTAURADO: Función getOrigenFijoInfo completa
  const getOrigenFijoInfo = () => {
    try {
      if (!mapData.getAllNodes || typeof mapData.getAllNodes !== 'function') {
        throw new Error('mapData.getAllNodes no disponible');
      }

      const todosLosNodos = mapData.getAllNodes();
      const origen = todosLosNodos.find(n => n && n.id === origenFijo);
      
      if (origen) {
        return origen;
      }
      
      // Fallback si no se encuentra el origen
      return {
        id: origenFijo || 'totem_principal',
        nombre: 'Punto de Inicio',
        tipo: 'totem',
        piso: 'Planta Principal'
      };
    } catch (error) {
      console.error('Error en getOrigenFijoInfo:', error);
      return {
        id: 'totem_principal',
        nombre: 'Punto de Inicio',
        tipo: 'totem',
        piso: 'Planta Principal'
      };
    }
  };

  if (mapData.loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (mapData.error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
              style={styles.backButtonError}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" />
        
        <PlanoMap
          plano={planoManager.planoActual}
          areas={planoDataActual.areas}
          points={planoDataActual.puntos}
          rutaActual={gpsNavigation.rutaActual}
          graphConnections={gpsNavigation.graphConnections}
          getGraphConnectionsForPlano={gpsNavigation.getGraphConnectionsForPlano}
          getRouteNodes={gpsNavigation.getRouteNodes}
          showNavigationPanel={showNavigationPanel}
          onToggleControlPanel={handleToggleControlPanel}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        
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
            planoActual={planoManager.planoActual}
            getOrigenFijoInfo={getOrigenFijoInfo}
            origenFijo={origenFijo}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  backButtonError: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
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