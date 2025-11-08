// AreaPolygon.jsx - ARCHIVO COMPLETO CORREGIDO
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { COLORS, ICONS } from './constants';
import { geometryUtils } from './geometry';

const AreaPolygon = ({ 
  area, 
  isAdapted = false, 
  pointScale = 1, 
  showLabels = true,
  isRouteNode = false,
  isRouteStart = false,
  isRouteEnd = false,
  onStartNavigation
}) => {
  if (!area) return null;

  const displayX = isAdapted ? area.adaptedX : area.x;
  const displayY = isAdapted ? area.adaptedY : area.y;
  const displayPoints = isAdapted ? area.adaptedPoints : area.points;
  const isApproximate = area.isApproximate;
  
  const [showModal, setShowModal] = useState(false);
  const routePulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRouteNode) {
      // Animación de pulso para nodos en la ruta
      Animated.loop(
        Animated.sequence([
          Animated.timing(routePulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(routePulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [isRouteNode, routePulseAnim]);

  // Si es un área con puntos (polígono)
  if (displayPoints && displayPoints.length >= 3) {
    const center = geometryUtils.getPolygonCenter(displayPoints);
    const centerX = center[0];
    const centerY = center[1];

    const boundingBox = geometryUtils.getPolygonBoundingBox(displayPoints);
    const { minX, maxX, minY, maxY, width, height } = boundingBox;

    const areaSize = Math.max(width, height);
    const baseAreaSize = Math.max(24, Math.min(40, areaSize * 0.08));
    const areaScaledSize = baseAreaSize * pointScale;
    const areaIconSize = 14 * pointScale;

    const getLabelPosition = () => {
      if (height > 200) {
        return { top: minY - 30, left: centerX - 40 };
      }
      if (width > height * 1.5) {
        return { top: maxY + 5, left: centerX - 40 };
      }
      if (height > width * 1.5) {
        return { top: centerY - 15, left: maxX + 5 };
      }
      return { top: minY - 30, left: centerX - 40 };
    };

    const labelPosition = getLabelPosition();

    return (
      <View style={styles.areaContainer}>
        {/* Polígono del área */}
        <View style={[
          styles.polygonContainer,
          { 
            left: minX,
            top: minY,
            width: width,
            height: height,
          }
        ]}>
          <View style={styles.polygonLines}>
            {displayPoints.map((point, index) => {
              const nextPoint = displayPoints[(index + 1) % displayPoints.length];
              const distance = geometryUtils.calculateDistance(point, nextPoint);
              const angle = Math.atan2(
                nextPoint[1] - point[1], 
                nextPoint[0] - point[0]
              ) * (180 / Math.PI);
              
              return (
                <View
                  key={index}
                  style={[
                    styles.polygonLine,
                    {
                      left: point[0] - minX,
                      top: point[1] - minY,
                      width: distance,
                      transform: [{ rotate: `${angle}deg` }],
                      backgroundColor: COLORS[area.tipo] || '#CCCCCC',
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Ícono en el centro del área */}
        <Animated.View
          style={[
            styles.areaIconContainer,
            { 
              left: centerX - (areaScaledSize / 2),
              top: centerY - (areaScaledSize / 2),
              width: areaScaledSize,
              height: areaScaledSize,
              borderRadius: areaScaledSize / 2,
              backgroundColor: COLORS[area.tipo] || '#CCCCCC',
              borderWidth: 2 * pointScale,
              borderColor: isRouteNode ? '#007AFF' : 'white',
              zIndex: 6,
              transform: isRouteNode ? [{ scale: routePulseAnim }] : [],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.areaIconTouchable}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.areaIcon, { fontSize: areaIconSize }]}>
              {ICONS[area.tipo] || '🏢'}
            </Text>
            {isApproximate && <View style={[styles.approximateDot, { width: 6 * pointScale, height: 6 * pointScale }]} />}
            
            {(isRouteStart || isRouteEnd) && (
              <View style={[
                styles.routeIndicator,
                isRouteStart ? styles.routeStartIndicator : styles.routeEndIndicator
              ]}>
                <Text style={styles.routeIndicatorText}>
                  {isRouteStart ? '🏁' : '🎯'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Distintivo "Usted está aquí" para el totem */}
        {area.tipo === 'totem' && (
          <View style={[
            styles.youAreHereContainer,
            {
              left: centerX - 60,
              top: centerY + (areaScaledSize / 2) + 5,
            }
          ]}>
            <View style={styles.youAreHereArrow} />
            <View style={styles.youAreHereBubble}>
              <Text style={styles.youAreHereText}>Usted está aquí</Text>
            </View>
          </View>
        )}

        {/* Modal con información del área */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalBody}>
                <View style={styles.modalContentRow}>
                  <Text style={styles.modalIcon}>
                    {ICONS[area.tipo] || '📍'}
                  </Text>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalName} numberOfLines={2}>
                      {area.nombre}
                    </Text>
                    {area.tipo && (
                      <Text style={styles.modalType}>
                        {getAreaTypeDisplayName(area.tipo)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                {/* 🔥 NUEVO: Botón de navegación para áreas */}
                {onStartNavigation && (
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={() => {
                      if (onStartNavigation && area.id) {
                        onStartNavigation(area.id);
                        setShowModal(false);
                      }
                    }}
                  >
                    <Text style={styles.navigationButtonIcon}>🧭</Text>
                    <Text style={styles.navigationButtonText}>Iniciar navegación</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Si es un punto individual
  if (displayX !== undefined && displayY !== undefined && (!displayPoints || displayPoints.length === 0)) {
    const baseSize = 28;
    const baseIconSize = 12;
    const scaledSize = baseSize * pointScale;
    const scaledIconSize = baseIconSize * pointScale;

    return (
      <View style={styles.pointContainer}>
        <Animated.View
          style={[
            styles.point,
            { 
              left: displayX - (scaledSize / 2), 
              top: displayY - (scaledSize / 2),
              width: scaledSize,
              height: scaledSize,
              borderRadius: scaledSize / 2,
              backgroundColor: COLORS[area.tipo] || '#CCCCCC',
              borderWidth: 2 * pointScale,
              borderColor: isRouteNode ? '#007AFF' : (isApproximate ? '#FF9500' : 'white'),
              zIndex: 10,
              transform: isRouteNode ? [{ scale: routePulseAnim }] : [],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.pointTouchable}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pointIcon, { fontSize: scaledIconSize }]}>
              {ICONS[area.tipo] || '📍'}
            </Text>
            {isApproximate && <View style={[styles.approximateDot, { width: 6 * pointScale, height: 6 * pointScale }]} />}
            
            {(isRouteStart || isRouteEnd) && (
              <View style={[
                styles.routeIndicator,
                isRouteStart ? styles.routeStartIndicator : styles.routeEndIndicator
              ]}>
                <Text style={styles.routeIndicatorText}>
                  {isRouteStart ? '🏁' : '🎯'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Distintivo "Usted está aquí" para el totem */}
        {area.tipo === 'totem' && (
          <View style={[
            styles.youAreHereContainer,
            {
              left: displayX - 60,
              top: displayY + (scaledSize / 2) + 5,
            }
          ]}>
            <View style={styles.youAreHereArrow} />
            <View style={styles.youAreHereBubble}>
              <Text style={styles.youAreHereText}>Usted está aquí</Text>
            </View>
          </View>
        )}

        {/* Modal con información del punto */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalBody}>
                <View style={styles.modalContentRow}>
                  <Text style={styles.modalIcon}>
                    {ICONS[area.tipo] || '📍'}
                  </Text>
                  <View style={styles.modalTextContainer}>
                    <Text style={styles.modalName} numberOfLines={2}>
                      {area.nombre}
                    </Text>
                    {area.tipo && (
                      <Text style={styles.modalType}>
                        {getAreaTypeDisplayName(area.tipo)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                {/* 🔥 NUEVO: Botón de navegación para puntos */}
                {onStartNavigation && (
                  <TouchableOpacity
                    style={styles.navigationButton}
                    onPress={() => {
                      if (onStartNavigation && area.id) {
                        onStartNavigation(area.id);
                        setShowModal(false);
                      }
                    }}
                  >
                    <Text style={styles.navigationButtonIcon}>🧭</Text>
                    <Text style={styles.navigationButtonText}>Iniciar navegación</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return null;
};

// Funciones auxiliares
const getAreaTypeDisplayName = (type) => {
  const typeNames = {
    'aula': 'Aula',
    'hall': 'Hall',
    'departamento': 'Departamento',
    'area_generica': 'Área Genérica',
    'bano': 'Baño',
    'escalera': 'Escalera',
    'pasillo': 'Pasillo',
    'extintor': 'Extintor',
    'salida_emergencia': 'Salida Emergencia',
    'botiquin': 'Botiquín',
    'desfibrilador': 'Desfibrilador',
    'alarma': 'Alarma',
    'totem': 'Tótem'
  };
  return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const getShortName = (name, type) => {
  if (!name) return '';
  
  if (type === 'aula' && name.toLowerCase().includes('aula')) {
    return name.replace(/aula\s*/i, '');
  }
  
  if (type === 'departamento') {
    if (name.toLowerCase().includes('departamento')) {
      return name.replace(/departamento\s*/i, 'Depto.');
    }
    if (name.toLowerCase().includes('depto')) {
      return name.replace(/depto\.?\s*/i, 'Depto.');
    }
    return 'Depto.';
  }
  
  if (type === 'area_generica') {
    if (name.toLowerCase().includes('area generica') || name.toLowerCase().includes('área genérica')) {
      return 'Área Gen.';
    }
    if (name.toLowerCase().includes('area') || name.toLowerCase().includes('área')) {
      return name.replace(/(area|área)\s*/i, 'Área ');
    }
    return 'Área Gen.';
  }
  
  if (type === 'hall') {
    if (name.toLowerCase().includes('hall')) {
      return name.replace(/hall\s*/i, 'Hall ');
    }
    return 'Hall';
  }
  
  if (type === 'escalera') {
    return 'Escalera';
  }
  
  if (type === 'bano') {
    if (name.toLowerCase().includes('mujer')) return 'Baño M';
    if (name.toLowerCase().includes('hombre')) return 'Baño H';
    return 'Baño';
  }
  
  if (type === 'salida_emergencia') {
    return 'Salida';
  }
  
  if (name.length > 12) {
    const words = name.split(' ');
    if (words.length > 1) {
      return words[0] + (words[1] ? ' ' + words[1].charAt(0) + '.' : '');
    }
    return name.substring(0, 10) + '...';
  }
  
  return name;
};

// Estilos (se mantienen igual)
const styles = StyleSheet.create({
  areaContainer: {
    position: 'absolute',
    zIndex: 5
  },
  pointContainer: {
    position: 'absolute',
    zIndex: 10
  },
  polygonContainer: {
    position: 'absolute',
    zIndex: 4,
  },
  polygonLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  polygonLine: {
    position: 'absolute',
    height: 3,
    transformOrigin: 'left center',
  },
  areaIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  areaIconTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaIcon: {
    color: 'white',
    fontWeight: 'bold'
  },
  point: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pointTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointIcon: {
    color: 'white',
    fontWeight: 'bold'
  },
  areaNameContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  areaNameBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80,
    maxWidth: 120,
    alignItems: 'center',
  },
  areaName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  areaType: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  areaNameSmall: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  areaNameSmallText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#374151',
  },
  pointNameContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pointNameBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 70,
    maxWidth: 100,
    alignItems: 'center',
  },
  pointName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  pointType: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  pointNameSmall: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#F3F4F6',
  },
  pointNameSmallText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#374151',
  },
  arrowDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: -1,
  },
  arrowUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    marginTop: -1,
  },
  approximateDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    borderWidth: 1,
    borderColor: 'white'
  },
  routeIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  routeStartIndicator: {
    backgroundColor: '#4CD964',
  },
  routeEndIndicator: {
    backgroundColor: '#FF3B30',
  },
  routeIndicatorText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  modalBody: {
    padding: 16,
  },
  modalContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  modalTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  modalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  modalType: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  // 🔥 NUEVO: Estilos para botón de navegación
  navigationButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navigationButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Estilos para "Usted está aquí"
  youAreHereContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15,
  },
  youAreHereArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#007AFF',
    marginBottom: -1,
  },
  youAreHereBubble: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  youAreHereText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default AreaPolygon;