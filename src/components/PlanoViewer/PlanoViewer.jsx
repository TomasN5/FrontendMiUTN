// PlanoViewer.jsx - VERSIÓN CORREGIDA PARA CAMBIOS ENTRE CARRERAS
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated
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
  const [showContinuarButton, setShowContinuarButton] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    planoManager.inicializarPlanosCarrera('general');
  }, []);

  useEffect(() => {
    if (planoManager.planoActual && !mapData.loading) {
      const datos = mapData.getPlanoData(planoManager.planoActual.id);
      setPlanoDataActual(datos);
    }
  }, [planoManager.planoActual, mapData.loading]);

  // 🔥 CORREGIDO: Sincronizar plano actual con segmento de ruta - manejar cambios de carrera
  useEffect(() => {
    if (gpsNavigation.mostrarContinuar && gpsNavigation.getInfoSegmentoActual) {
      const infoSegmento = gpsNavigation.getInfoSegmentoActual();
      if (infoSegmento && infoSegmento.planoId !== planoManager.planoActual?.id) {
        console.log('🔄 Segmento requiere cambio de plano:', {
          planoActual: planoManager.planoActual?.id,
          planoRequerido: infoSegmento.planoId,
          carreraRequerida: infoSegmento.planoInfo?.carrera
        });
        
        // 🔥 MODIFICADO: Cambiar a la carrera correcta si es necesario
        const carreraRequerida = infoSegmento.planoInfo?.carrera;
        if (carreraRequerida && carreraRequerida !== planoManager.carreraActual) {
          console.log('🏗️ Cambiando carrera a:', carreraRequerida);
          planoManager.cambiarCarrera(carreraRequerida);
        }
        
        // Cambiar al plano específico
        setTimeout(() => {
          planoManager.cambiarPlano(infoSegmento.planoId);
        }, 100);
      }
    }
  }, [gpsNavigation.mostrarContinuar, gpsNavigation.getInfoSegmentoActual, planoManager]);

  // 🔥 NUEVO: Mostrar/ocultar botón continuar
  useEffect(() => {
    setShowContinuarButton(gpsNavigation.mostrarContinuar);
    
    if (gpsNavigation.mostrarContinuar) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [gpsNavigation.mostrarContinuar, fadeAnim]);

  // Lógica de origen fijo (mantener igual)
  useEffect(() => {
    const buscarYEstablecerOrigenFijo = () => {
      if (!mapData.getAllNodes || typeof mapData.getAllNodes !== 'function') {
        return;
      }

      const todosLosNodos = mapData.getAllNodes();
      if (!todosLosNodos || todosLosNodos.length === 0) {
        return;
      }
      
      let totem = null;

      totem = todosLosNodos.find(node => 
        node && node.tipo === 'totem'
      );
      
      if (!totem) {
        totem = todosLosNodos.find(node => 
          node && node.nombre && node.nombre.toLowerCase().includes('totem')
        );
      }
      
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
      
      if (!totem && todosLosNodos.length > 0) {
        totem = todosLosNodos.find(node => 
          node && node.tipo && 
          ['aula', 'hall', 'departamento', 'area_generica', 'escalera'].includes(node.tipo)
        ) || todosLosNodos[0];
      }

      if (totem) {
        setOrigenFijo(totem.id);
        
        if (gpsNavigation.setOrigen) {
          gpsNavigation.setOrigen(totem.id);
        }
      } else {
        setOrigenFijo('totem_principal');
      }
    };

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

  // 🔥 NUEVO: Función para iniciar navegación desde un item del mapa
  const handleStartNavigation = async (destinationId) => {
    // Usar la función que establece el destino y calcula la ruta en una sola operación
    if (gpsNavigation.setDestinoYCalcularRuta) {
      await gpsNavigation.setDestinoYCalcularRuta(destinationId);
    } else if (gpsNavigation.calcularRuta) {
      // Fallback: pasar el destino directamente a calcularRuta
      await gpsNavigation.calcularRuta(destinationId, gpsNavigation.origen);
      if (gpsNavigation.setDestino) {
        gpsNavigation.setDestino(destinationId);
      }
    }
  };

  const handleToggleControlPanel = () => {
    setShowControlPanel(!showControlPanel);
  };

  // 🔥 CORREGIDO: Manejar clic en botón continuar con cambio de carrera
  const handleContinuar = () => {
    const siguienteSegmento = gpsNavigation.avanzarSiguienteSegmento();
    if (siguienteSegmento && siguienteSegmento.planoId) {
      console.log('🚀 Continuando al siguiente segmento:', {
        plano: siguienteSegmento.planoId,
        carrera: siguienteSegmento.planoInfo?.carrera,
        segmento: siguienteSegmento.index + 1,
        total: siguienteSegmento.total
      });
      
      // 🔥 MODIFICADO: Cambiar a la carrera correcta si es necesario
      const carreraRequerida = siguienteSegmento.planoInfo?.carrera;
      if (carreraRequerida && carreraRequerida !== planoManager.carreraActual) {
        console.log('🏗️ Cambiando carrera a:', carreraRequerida);
        planoManager.cambiarCarrera(carreraRequerida);
      }
      
      // Cambiar al plano específico
      setTimeout(() => {
        planoManager.cambiarPlano(siguienteSegmento.planoId);
      }, 100);
    }
  };

  // 🔥 CORREGIDO: Obtener texto del botón continuar con información de carrera
  const getContinuarButtonText = () => {
    if (!gpsNavigation.getInfoSegmentoActual) return 'Continuar';
    
    const info = gpsNavigation.getInfoSegmentoActual();
    if (!info || !info.tieneSiguiente) return 'Continuar';
    
    const totalSegmentos = info.total;
    const segmentoActual = info.numero;
    const siguienteCarrera = info.planoInfo?.carrera;
    
    let texto = `Continuar (${segmentoActual}/${totalSegmentos})`;
    
    if (siguienteCarrera && siguienteCarrera !== planoManager.carreraActual) {
      texto += ` → ${siguienteCarrera.charAt(0).toUpperCase() + siguienteCarrera.slice(1)}`;
    }
    
    return texto;
  };

  // Función getOrigenFijoInfo (mantener igual)
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
      
      return {
        id: origenFijo || 'totem_principal',
        nombre: 'Punto de Inicio',
        tipo: 'totem',
        piso: 'Planta Principal'
      };
    } catch (error) {
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
          showControlPanel={showControlPanel}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          onStartNavigation={handleStartNavigation}
          rutaCompleta={gpsNavigation.rutaCompleta}
          segmentosRuta={gpsNavigation.segmentosRuta}
          onCancelarViaje={() => {
            // Limpiar la ruta
            if (gpsNavigation.limpiarRuta) {
              gpsNavigation.limpiarRuta();
            }
            // Volver al mapa general
            if (planoManager.cambiarCarrera) {
              planoManager.cambiarCarrera('general');
            }
            if (planoManager.inicializarPlanosCarrera) {
              planoManager.inicializarPlanosCarrera('general');
            }
          }}
        />
        
        {/* 🔥 MEJORADO: Botón Continuar con información de carrera */}
        {showContinuarButton && (
          <Animated.View style={[styles.continuarContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={styles.continuarButton}
              onPress={handleContinuar}
            >
              <View style={styles.continuarTextContainer}>
                <Text style={styles.continuarText}>
                  {getContinuarButtonText()}
                </Text>
                <Text style={styles.continuarSubtext}>
                  {(() => {
                    const info = gpsNavigation.getInfoSegmentoActual();
                    if (info && info.planoInfo?.carrera !== planoManager.carreraActual) {
                      return `Cambiando a ${info.planoInfo?.carrera}`;
                    }
                    return 'Toca para ir al siguiente piso de la ruta';
                  })()}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        
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
              rutaCompleta: gpsNavigation.rutaCompleta,
              isCalculando: gpsNavigation.isCalculando,
              setOrigen: gpsNavigation.setOrigen,
              setDestino: gpsNavigation.setDestino,
              calcularRuta: handleCalcularRuta,
              limpiarRuta: gpsNavigation.limpiarRuta,
              // 🔥 AGREGADO: Pasar nuevas propiedades
              segmentosRuta: gpsNavigation.segmentosRuta,
              segmentoActualIndex: gpsNavigation.segmentoActualIndex,
              mostrarContinuar: gpsNavigation.mostrarContinuar,
              getInfoSegmentoActual: gpsNavigation.getInfoSegmentoActual
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

// Estilos (mantener igual)
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
  },
  continuarContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  continuarButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  continuarTextContainer: {
    flex: 1,
  },
  continuarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  continuarSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

export default PlanoViewer;