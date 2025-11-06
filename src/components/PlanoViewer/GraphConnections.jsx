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

  // 🔥 Verificar si un nodo es especial (NO debe tener punto azul animado)
  const isSpecialNode = (node) => {
    if (!node || !node.tipo) return false;
    
    // Tipos de nodos especiales que NO deben tener puntos azules animados
    const specialTypes = [
      'escalera', 'bano', 'hall', 'extintor', 
      'salida_emergencia', 'botiquin', 'desfibrilador', 
      'alarma', 'totem', 'aula', 'pasillo'
    ];
    
    return specialTypes.includes(node.tipo);
  };

  // 🔥 PUNTOS AZULES SOLO PARA NODOS NO ESPECIALES
  const renderRouteDots = () => {
    if (rutaActual.length < 2 || !showRoute) return null;

    const routeDots = [];
    
    for (let i = 0; i < rutaActual.length; i++) {
      const node = rutaActual[i];
      if (!node || !nodeBelongsToCurrentPlano(node)) continue;

      const coords = getNodeCoordinates(node);
      if (!coords) continue;

      // Solo puntos intermedios (no inicio ni fin)
      const isIntermediate = i > 0 && i < rutaActual.length - 1;
      
      if (isIntermediate) {
        // 🔥 VERIFICAR: Si es nodo especial, NO crear punto azul
        const isSpecial = isSpecialNode(node);
        
        if (!isSpecial) {
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
        // 🔥 Si es nodo especial (matafuego, desfibrilador, etc.), NO se crea punto azul
      }
    }

    return routeDots;
  };

  // 🔥 PUNTOS ESPECIALES ANIMADOS SOLO INICIO Y FINAL
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
                left: coords.x - 15,
                top: coords.y - 15,
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
                left: coords.x - 20,
                top: coords.y - 20,
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8,
  },
  // 🔥 PUNTOS AZULES DE LA RUTA (solo para nodos NO especiales)
  routeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 11,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  // 🔥 PUNTOS ESPECIALES ANIMADOS (SOLO INICIO Y FINAL)
  origenNode: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(76, 217, 100, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  origenNodeInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: 'white',
  },
  origenNodePulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4CD964',
    opacity: 0.5,
  },
  destinoNode: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
  },
  destinoNodeInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'white',
  },
  destinoNodePulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF3B30',
    opacity: 0.5,
  },
});

export default GraphConnections;