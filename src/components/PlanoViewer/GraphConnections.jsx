// GraphConnections.jsx - VERSIÓN CON PUNTOS MÁS PEQUEÑOS
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

  useEffect(() => {
    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animación de progreso para la ruta
    if (rutaActual.length > 0) {
      pathProgress.setValue(0);
      Animated.timing(pathProgress, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }

    // Animación de pulso para nodos importantes
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1, // 🔥 REDUCIDO: Pulso más sutil
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

  const renderRouteDots = () => {
    if (rutaActual.length < 2 || !showRoute) return null;

    const routeDots = [];
    
    for (let i = 0; i < rutaActual.length; i++) {
      const node = rutaActual[i];
      if (!node || !nodeBelongsToCurrentPlano(node)) continue;

      const coords = getNodeCoordinates(node);
      if (!coords) continue;

      const isIntermediate = i > 0 && i < rutaActual.length - 1;
      
      if (isIntermediate) {
        const isSpecial = isSpecialNode(node);
        
        if (!isSpecial) {
          const progressThreshold = i / rutaActual.length;
          
          routeDots.push(
            <Animated.View
              key={`route-dot-${i}`}
              style={[
                styles.routeDot,
                {
                  left: coords.x - 3, // 🔥 REDUCIDO: Ajuste de posición
                  top: coords.y - 3, // 🔥 REDUCIDO: Ajuste de posición
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

  const routeDots = renderRouteDots();
  const specialNodes = renderSpecialNodes();

  if ((!routeDots || routeDots.length === 0) && 
      (!specialNodes || specialNodes.length === 0)) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {routeDots}
      {specialNodes}
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
  // 🔥 PUNTOS AZULES DE LA RUTA (más pequeños)
  routeDot: {
    position: 'absolute',
    width: 6, // 🔥 REDUCIDO: Punto más pequeño
    height: 6, // 🔥 REDUCIDO: Punto más pequeño
    borderRadius: 3, // 🔥 REDUCIDO: Borde más pequeño
    backgroundColor: '#007AFF',
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 11,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, // 🔥 REDUCIDO: Sombra más sutil
    shadowRadius: 1.5, // 🔥 REDUCIDO: Sombra más sutil
    elevation: 2, // 🔥 REDUCIDO: Elevación más sutil
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