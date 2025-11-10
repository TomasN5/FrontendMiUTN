// GraphConnections.jsx - VERSIÓN CON ANIMACIÓN MEJORADA
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const GraphConnections = ({ 
  rutaActual = [],
  graphConnections = [],
  planoActual,
  showRoute = true,
  showGraphConnections = true,
  scale = 1
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pathProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const movingDotProgress = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animación de progreso para la ruta (más rápida para líneas)
    if (rutaActual.length > 0) {
      pathProgress.setValue(0);
      movingDotProgress.setValue(0);
      waveAnim.setValue(0);
      
      // Animación de líneas que se dibujan
      Animated.timing(pathProgress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      // Animación del punto móvil (más lenta para que sea visible)
      Animated.timing(movingDotProgress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      // Animación de ondas continuas desde el punto móvil
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          })
        ])
      ).start();
    }

    // Animación de pulso para nodos importantes
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [rutaActual, graphConnections]);

  const getNodeCoordinates = (node) => {
    if (!node) return null;
    const x = node.adaptedX || node.x;
    const y = node.adaptedY || node.y;
    if (x === undefined || y === undefined) return null;
    return { x, y };
  };

  const nodeBelongsToCurrentPlano = (node) => {
    if (!planoActual || !planoActual.id) return false;
    const nodePlano = node.planoId || node.plano;
    return nodePlano === planoActual.id;
  };

  const isSpecialNode = (node) => {
    if (!node || !node.tipo) return false;
    
    const specialTypes = [
      'escalera', 'bano', 'hall', 'departamento', 'area_generica',
      'extintor', 'salida_emergencia', 'botiquin', 'desfibrilador', 
      'alarma', 'totem', 'aula', 'pasillo'
    ];
    
    return specialTypes.includes(node.tipo);
  };

  // 🔥 NUEVO: Renderizar punto móvil simplificado
  const renderMovingDot = () => {
    if (rutaActual.length < 2 || !showRoute) return null;

    const nodes = rutaActual.filter(node => node && nodeBelongsToCurrentPlano(node));
    if (nodes.length < 2) return null;

    // Obtener coordenadas de todos los nodos
    const coordinates = nodes
      .map(node => getNodeCoordinates(node))
      .filter(coord => coord !== null);

    if (coordinates.length < 2) return null;

    // Crear interpolaciones para cada segmento
    const segments = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const fromCoord = coordinates[i];
      const toCoord = coordinates[i + 1];
      const segmentStart = i / (coordinates.length - 1);
      const segmentEnd = (i + 1) / (coordinates.length - 1);
      
      segments.push({
        start: segmentStart,
        end: segmentEnd,
        from: fromCoord,
        to: toCoord,
      });
    }

    const waveOpacity = waveAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0]
    });

    // Renderizar un punto móvil por segmento (solo el activo será visible)
    return segments.map((segment, idx) => {
      return (
        <Animated.View
          key={`moving-dot-${idx}`}
          style={[
            styles.movingDotContainer,
            {
              left: movingDotProgress.interpolate({
                inputRange: [segment.start, segment.end],
                outputRange: [segment.from.x - 12, segment.to.x - 12]
              }),
              top: movingDotProgress.interpolate({
                inputRange: [segment.start, segment.end],
                outputRange: [segment.from.y - 12, segment.to.y - 12]
              }),
              opacity: movingDotProgress.interpolate({
                inputRange: [
                  Math.max(0, segment.start - 0.05),
                  segment.start,
                  segment.end,
                  Math.min(1, segment.end + 0.05)
                ],
                outputRange: [0, 1, 1, 0]
              })
            }
          ]}
        >
          {/* Ondas de expansión */}
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [
                  {
                    scale: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 2.5]
                    })
                  }
                ],
                opacity: waveOpacity,
              }
            ]}
          />
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [
                  {
                    scale: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 2.0]
                    })
                  }
                ],
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 0.3, 0]
                }),
              }
            ]}
          />
          {/* Punto móvil principal */}
          <View style={styles.movingDot} />
          <View style={styles.movingDotInner} />
        </Animated.View>
      );
    });
  };

  // 🔥 NUEVO: Renderizar puntos de ruta animados (más simple y funcional)
  const renderAnimatedLines = () => {
    if (rutaActual.length < 2 || !showRoute) return null;

    const routeDots = [];
    
    for (let i = 0; i < rutaActual.length; i++) {
      const node = rutaActual[i];
      if (!node || !nodeBelongsToCurrentPlano(node)) continue;

      const coords = getNodeCoordinates(node);
      if (!coords) continue;

      const isIntermediate = i > 0 && i < rutaActual.length - 1;
      const isSpecial = isSpecialNode(node);
      
      // Solo mostrar puntos intermedios que no sean especiales
      if (isIntermediate && !isSpecial) {
        const progressThreshold = i / rutaActual.length;
        
        routeDots.push(
          <Animated.View
            key={`route-dot-${i}`}
            style={[
              styles.routeDot,
              {
                left: coords.x - 4,
                top: coords.y - 4,
                opacity: pathProgress.interpolate({
                  inputRange: [0, progressThreshold, Math.min(progressThreshold + 0.1, 1)],
                  outputRange: [0, 0, 1]
                })
              }
            ]}
          />
        );
      }
    }

    return routeDots;
  };


  const renderSpecialNodes = () => {
    if (rutaActual.length === 0) return null;

    const specialNodes = [];
    
    // Nodo de origen (siempre se anima aunque sea especial)
    const origenNode = rutaActual[0];
    if (origenNode && nodeBelongsToCurrentPlano(origenNode)) {
      const coords = getNodeCoordinates(origenNode);
      if (coords) {
        specialNodes.push(
          <Animated.View
            key="origen-node"
            style={[
              styles.origenNode,
              {
                left: coords.x - 12, // 🔥 REDUCIDO: Tamaño más pequeño
                top: coords.y - 12, // 🔥 REDUCIDO: Tamaño más pequeño
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <View style={styles.origenNodeInner} />
            <View style={styles.origenNodePulse} />
          </Animated.View>
        );
      }
    }

    // Nodo de destino (siempre se anima aunque sea especial)
    const destinoNode = rutaActual[rutaActual.length - 1];
    if (destinoNode && nodeBelongsToCurrentPlano(destinoNode)) {
      const coords = getNodeCoordinates(destinoNode);
      if (coords) {
        specialNodes.push(
          <Animated.View
            key="destino-node"
            style={[
              styles.destinoNode,
              {
                left: coords.x - 16, // 🔥 REDUCIDO: Tamaño más pequeño
                top: coords.y - 16, // 🔥 REDUCIDO: Tamaño más pequeño
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <View style={styles.destinoNodeInner} />
            <View style={styles.destinoNodePulse} />
          </Animated.View>
        );
      }
    }

    return specialNodes;
  };

  const animatedLines = renderAnimatedLines();
  const movingDot = renderMovingDot();
  const specialNodes = renderSpecialNodes();

  const hasLines = animatedLines && animatedLines.length > 0;
  const hasMovingDot = movingDot && (Array.isArray(movingDot) ? movingDot.length > 0 : true);
  const hasSpecialNodes = specialNodes && specialNodes.length > 0;

  if (!hasLines && !hasMovingDot && !hasSpecialNodes) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {hasLines && animatedLines}
      {hasMovingDot && movingDot}
      {hasSpecialNodes && specialNodes}
    </View>
  );
};

// 🔥 MEJORADO: Estilos con elementos más pequeños y prolijos
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
  },
  // 🔥 PUNTOS DE RUTA ANIMADOS
  routeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    borderWidth: 1.5,
    borderColor: 'white',
    zIndex: 11,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  // 🔥 PUNTO MÓVIL CON ONDAS
  movingDotContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 13,
  },
  wave: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  movingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 15,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  movingDotInner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    zIndex: 16,
  },
  // 🔥 PUNTOS ESPECIALES ANIMADOS (más pequeños)
  origenNode: {
    position: 'absolute',
    width: 24, // 🔥 REDUCIDO: Tamaño más pequeño
    height: 24, // 🔥 REDUCIDO: Tamaño más pequeño
    borderRadius: 12, // 🔥 REDUCIDO: Borde más pequeño
    backgroundColor: 'rgba(76, 217, 100, 0.15)', // 🔥 REDUCIDO: Transparencia más sutil
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  origenNodeInner: {
    width: 10, // 🔥 REDUCIDO: Tamaño más pequeño
    height: 10, // 🔥 REDUCIDO: Tamaño más pequeño
    borderRadius: 5, // 🔥 REDUCIDO: Borde más pequeño
    backgroundColor: '#4CD964',
    borderWidth: 1.5, // 🔥 REDUCIDO: Borde más fino
    borderColor: 'white',
  },
  origenNodePulse: {
    position: 'absolute',
    width: 24, // 🔥 REDUCIDO: Tamaño más pequeño
    height: 24, // 🔥 REDUCIDO: Tamaño más pequeño
    borderRadius: 12, // 🔥 REDUCIDO: Borde más pequeño
    borderWidth: 1.5, // 🔥 REDUCIDO: Borde más fino
    borderColor: '#4CD964',
    opacity: 0.4, // 🔥 REDUCIDO: Transparencia más sutil
  },
  destinoNode: {
    position: 'absolute',
    width: 32, // 🔥 REDUCIDO: Tamaño más pequeño
    height: 32, // 🔥 REDUCIDO: Tamaño más pequeño
    borderRadius: 16, // 🔥 REDUCIDO: Borde más pequeño
    backgroundColor: 'rgba(255, 59, 48, 0.15)', // 🔥 REDUCIDO: Transparencia más sutil
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  destinoNodeInner: {
    width: 12, // 🔥 REDUCIDO: Tamaño más pequeño
    height: 12, // 🔥 REDUCIDO: Tamaño más pequeño
    borderRadius: 6, // 🔥 REDUCIDO: Borde más pequeño
    backgroundColor: '#FF3B30',
    borderWidth: 1.5, // 🔥 REDUCIDO: Borde más fino
    borderColor: 'white',
  },
  destinoNodePulse: {
    position: 'absolute',
    width: 32, // 🔥 REDUCIDO: Tamaño más pequeño
    height: 32, // 🔥 REDUCIDO: Tamaño más pequeño
    borderRadius: 16, // 🔥 REDUCIDO: Borde más pequeño
    borderWidth: 1.5, // 🔥 REDUCIDO: Borde más fino
    borderColor: '#FF3B30',
    opacity: 0.4, // 🔥 REDUCIDO: Transparencia más sutil
  },
});

export default GraphConnections;