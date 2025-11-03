import React, { useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import AreaPolygon from './AreaPolygon';
import { useCoordinateAdapter } from './useCoordinateAdapter';
import { useZoomPan } from './useZoomPan';

const PlanoMap = ({ plano, areas = [], points = [], rutaActual }) => {
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

  const [showZoomControls, setShowZoomControls] = React.useState(true);

  const adaptedAreas = areas.map(area => adaptNode(area, scale, offsetX, offsetY, plano));
  const adaptedPoints = points.map(point => adaptNode(point, scale, offsetX, offsetY, plano));

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
            {adaptedAreas.map((area) => (
              <AreaPolygon
                key={area.id}
                area={area}
                isAdapted={true}
                pointScale={area.pointScale || 1}
              />
            ))}
            
            {adaptedPoints.map((punto) => (
              <AreaPolygon
                key={punto.id}
                area={punto}
                isAdapted={true}
                pointScale={punto.pointScale || 1}
              />
            ))}
          </View>
        )}
      </View>
      
      {/* Controles de Zoom */}
      {showZoomControls && (
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={reset}>
            <Text style={styles.zoomButtonText}>⟲</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.zoomButton} 
            onPress={() => setShowZoomControls(false)}
          >
            <Text style={styles.zoomButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showZoomControls && (
        <TouchableOpacity 
          style={styles.showControlsButton}
          onPress={() => setShowZoomControls(true)}
        >
          <Text style={styles.showControlsText}>🎛️</Text>
        </TouchableOpacity>
      )}

      {/* Información del Zoom */}
      <View style={styles.zoomInfo}>
        <Text style={styles.zoomInfoText}>
          Zoom: {(scale * 100).toFixed(0)}%
        </Text>
      </View>

      {rutaActual.length > 0 && (
        <View style={styles.rutaOverlay}>
          <Text style={styles.rutaText}>
            🧭 Ruta activa: {rutaActual.length} pasos
          </Text>
        </View>
      )}
      
      <View style={styles.planoInfo}>
        <Text style={styles.planoNombre}>{plano.nombre}</Text>
        <Text style={styles.planoStats}>
          {areas.length} áreas • {points.length} puntos
        </Text>
      </View>

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
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  showControlsText: {
    color: 'white',
    fontSize: 18,
  },
  zoomInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 100,
  },
  zoomInfoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: '#666'
  },
  rutaOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    padding: 10,
    alignItems: 'center',
    zIndex: 20
  },
  rutaText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  planoInfo: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20
  },
  planoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  planoStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
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