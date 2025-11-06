import React, { useCallback, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import AreaPolygon from './AreaPolygon';
import GraphConnections from './GraphConnections';
import { useCoordinateAdapter } from './useCoordinateAdapter';
import { useZoomPan } from './useZoomPan';

const PlanoMap = ({ 
  plano, 
  areas = [], 
  points = [], 
  rutaActual = [], 
  graphConnections = [], 
  getRouteNodes,
  getGraphConnectionsForPlano,
  showNavigationPanel = false,
  onToggleControlPanel,
  showBackButton = false,
  onBackPress
}) => {
  const { 
    adaptNode, 
    onImageLayout, 
    imageLayout, 
    isReady,
  } = useCoordinateAdapter();

  const {
    scale,
    offsetX,
    offsetY,
    zoomIn,
    zoomOut,
    reset,
    handleTouchMove,
    handleTouchStart,
    handleTouchEnd,
  } = useZoomPan();

  const [showZoomControls, setShowZoomControls] = useState(true);

  // Adaptar áreas y puntos
  const adaptedAreas = areas.map(area => adaptNode(area, scale, offsetX, offsetY, plano));
  const adaptedPoints = points.map(point => adaptNode(point, scale, offsetX, offsetY, plano));

  // Determinar si un nodo está en la ruta y su posición
  const getNodeRouteInfo = useCallback((nodeId) => {
    if (!rutaActual || rutaActual.length === 0) return { isRouteNode: false, isRouteStart: false, isRouteEnd: false };
    
    const nodeIndex = rutaActual.findIndex(node => node && node.id === nodeId);
    if (nodeIndex === -1) return { isRouteNode: false, isRouteStart: false, isRouteEnd: false };
    
    return {
      isRouteNode: true,
      isRouteStart: nodeIndex === 0,
      isRouteEnd: nodeIndex === rutaActual.length - 1
    };
  }, [rutaActual]);

  // Preparar conexiones
  const prepareGraphConnections = useCallback(() => {
    if (!graphConnections || graphConnections.length === 0) return [];
    
    if (getGraphConnectionsForPlano && plano?.id) {
      return getGraphConnectionsForPlano(plano.id);
    }

    return graphConnections
      .map(connection => {
        if (!connection.from || !connection.to) return null;

        const fromAdapted = adaptedAreas.find(a => a.id === connection.from.id) || 
                           adaptedPoints.find(p => p.id === connection.from.id);
        const toAdapted = adaptedAreas.find(a => a.id === connection.to.id) || 
                         adaptedPoints.find(p => p.id === connection.to.id);

        if (!fromAdapted || !toAdapted) {
          return null;
        }

        const fromPlano = fromAdapted.planoId || connection.from.planoId;
        const toPlano = toAdapted.planoId || connection.to.planoId;
        
        if (fromPlano !== plano?.id || toPlano !== plano?.id) {
          return null;
        }

        return {
          ...connection,
          from: fromAdapted,
          to: toAdapted
        };
      })
      .filter(Boolean);
  }, [graphConnections, adaptedAreas, adaptedPoints, plano?.id, getGraphConnectionsForPlano]);

  // Preparar ruta
  const prepareRouteNodes = useCallback(() => {
    if (!rutaActual || rutaActual.length === 0) return [];

    if (getRouteNodes) {
      const routeIds = rutaActual.map(node => node.id);
      const routeNodes = getRouteNodes(routeIds);
      
      return routeNodes.map(node => {
        const adaptedNode = adaptedAreas.find(a => a.id === node.id) || 
                           adaptedPoints.find(p => p.id === node.id) ||
                           adaptNode(node, scale, offsetX, offsetY, plano);
        return adaptedNode;
      }).filter(Boolean);
    } else {
      return rutaActual.map(node => {
        const adaptedNode = adaptedAreas.find(a => a.id === node.id) || 
                           adaptedPoints.find(p => p.id === node.id);
        
        if (!adaptedNode) {
          return null;
        }
        
        return adaptedNode;
      }).filter(Boolean);
    }
  }, [rutaActual, getRouteNodes, adaptedAreas, adaptedPoints, adaptNode, scale, offsetX, offsetY, plano]);

  const preparedConnections = prepareGraphConnections();
  const preparedRouteNodes = prepareRouteNodes();

  // Handler para gestos con información de imagen
  const handleTouchMoveWithImage = useCallback((event) => {
    if (imageLayout) {
      handleTouchMove(event, imageLayout.width, imageLayout.height);
    }
  }, [handleTouchMove, imageLayout]);

  // Handler para zoom con información de imagen
  const handleZoomIn = useCallback(() => {
    if (imageLayout) {
      zoomIn(imageLayout.width, imageLayout.height);
    }
  }, [zoomIn, imageLayout]);

  const handleZoomOut = useCallback(() => {
    if (imageLayout) {
      zoomOut(imageLayout.width, imageLayout.height);
    }
  }, [zoomOut, imageLayout]);

  const handleResetZoom = useCallback(() => {
    reset();
  }, [reset]);

  if (!plano) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando plano...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View 
        style={styles.gestureContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMoveWithImage}
        onTouchEnd={handleTouchEnd}
      >
        {/* IMAGEN CON ZOOM APLICADO */}
        <View style={[
          styles.imageContainer,
          {
            transform: [
              { scale: scale },
              { translateX: -offsetX * scale },
              { translateY: -offsetY * scale }
            ]
          }
        ]}>
          <Image
            source={plano.src}
            style={styles.planoImage}
            resizeMode="contain"
            onLayout={onImageLayout}
          />
        </View>
        
        {/* OVERLAY CON PUNTOS - también con zoom */}
        {isReady && (
          <View style={[
            styles.overlayContainer,
            {
              transform: [
                { scale: scale },
                { translateX: -offsetX * scale },
                { translateY: -offsetY * scale }
              ]
            }
          ]}>
            {/* Graph Connections con escala */}
            <GraphConnections
              rutaActual={preparedRouteNodes}
              graphConnections={preparedConnections}
              planoActual={plano}
              showRoute={preparedRouteNodes.length > 0}
              showGraphConnections={true}
              scale={scale}
            />
            
            {/* MOSTRAR TODAS LAS ÁREAS */}
            {adaptedAreas.map((area) => {
              const routeInfo = getNodeRouteInfo(area.id);
              return (
                <AreaPolygon
                  key={area.id}
                  area={area}
                  isAdapted={true}
                  pointScale={area.pointScale || 1}
                  showLabels={true}
                  isRouteNode={routeInfo.isRouteNode}
                  isRouteStart={routeInfo.isRouteStart}
                  isRouteEnd={routeInfo.isRouteEnd}
                />
              );
            })}
            
            {/* MOSTRAR SOLO PUNTOS ESPECIALES */}
            {adaptedPoints
              .filter(punto => punto.tipo !== 'punto')
              .map((punto) => {
                const routeInfo = getNodeRouteInfo(punto.id);
                return (
                  <AreaPolygon
                    key={punto.id}
                    area={punto}
                    isAdapted={true}
                    pointScale={punto.pointScale || 1}
                    showLabels={true}
                    isRouteNode={routeInfo.isRouteNode}
                    isRouteStart={routeInfo.isRouteStart}
                    isRouteEnd={routeInfo.isRouteEnd}
                  />
                );
              })}
          </View>
        )}
      </View>
      
      {/* 🔥 SOLO CAMBIÉ LA UBICACIÓN DEL BOTÓN VOLVER - Los demás se quedan igual */}
      {showBackButton && !showNavigationPanel && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Text style={styles.backButtonIcon}>←</Text>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      )}
      
      {/* 🔥 CONTROLES DE ZOOM Y BOTÓN PARA PANEL - SE MANTIENEN IGUAL */}
      {!showNavigationPanel && showZoomControls && (
        <View style={styles.controlsContainer}>
          {/* Botón para mostrar/ocultar ControlPanel */}
          <TouchableOpacity 
            style={styles.panelButton}
            onPress={onToggleControlPanel}
          >
            <Text style={styles.panelButtonIcon}>🧭</Text>
          </TouchableOpacity>

          {/* Controles de Zoom */}
          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomButtonIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomButtonIcon}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleResetZoom}>
              <Text style={styles.zoomButtonIcon}>⟲</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Botón para mostrar controles cuando están ocultos */}
      {!showNavigationPanel && !showZoomControls && (
        <TouchableOpacity 
          style={styles.showControlsButton}
          onPress={() => setShowZoomControls(true)}
        >
          <Text style={styles.showControlsIcon}>🔍</Text>
        </TouchableOpacity>
      )}

      {!isReady && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingOverlayText}>
            Calculando posiciones...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gestureContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  planoImage: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  // 🔥 SOLO MODIFIQUÉ EL BOTÓN VOLVER - Los demás estilos igual
  backButton: {
    position: 'absolute',
    left: 20,
    top: 30, // 🔥 MOVIDO MÁS ABAJO para no interferir con otros elementos
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    zIndex: 100,
  },
  backButtonIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  // 🔥 LOS DEMÁS CONTROLES SE MANTIENEN IGUAL
  controlsContainer: {
    position: 'absolute',
    right: 20,
    top: '25%',
    alignItems: 'center',
    zIndex: 100,
  },
  panelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  panelButtonIcon: {
    fontSize: 20,
  },
  zoomControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButtonIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  showControlsButton: {
    position: 'absolute',
    right: 20,
    top: '30%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 100,
  },
  showControlsIcon: {
    color: 'white',
    fontSize: 18,
  },
  loadingText: {
    fontSize: 18,
    color: '#666'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  loadingOverlayText: {
    fontSize: 16,
    color: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10
  }
});

export default PlanoMap;