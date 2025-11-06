import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { geometryUtils } from './geometry';

export const useGPSNavigation = (areas = [], points = [], planos = []) => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [rutaActual, setRutaActual] = useState([]);
  const [isCalculando, setIsCalculando] = useState(false);

  const getAllNodes = useCallback(() => {
    return [...areas, ...points];
  }, [areas, points]);

  // 🔥 NUEVA FUNCIÓN: Filtrar conexiones por plano actual
  const getGraphConnectionsForPlano = useCallback((planoActualId) => {
    if (!planoActualId) return [];
    
    const connections = generateGraphConnections();
    
    // Filtrar conexiones donde AMBOS nodos pertenecen al plano actual
    const filteredConnections = connections.filter(connection => {
      if (!connection.from || !connection.to) return false;
      
      const fromPlano = connection.from.planoId;
      const toPlano = connection.to.planoId;
      
      // Solo mostrar conexiones donde ambos nodos están en el mismo plano
      const shouldShow = fromPlano === planoActualId && toPlano === planoActualId;
      
      if (!shouldShow) {
      }
      
      return shouldShow;
    });
    
    return filteredConnections;
  }, [generateGraphConnections]);

  // 🔥 CORREGIDO: Generar conexiones con validación robusta
  const generateGraphConnections = useCallback(() => {
    const connections = [];
    const connectionKeys = new Set();
    

    // Función auxiliar para agregar conexiones sin duplicados
    const addUniqueConnection = (from, to, type) => {
      // 🔥 VALIDACIÓN ROBUSTA: Verificar que los nodos existen
      if (!from || !to || !from.id || !to.id) {
        return false;
      }

      // Ordenar IDs para evitar duplicados (A-B vs B-A)
      const sortedIds = [from.id, to.id].sort();
      const connectionKey = `${sortedIds[0]}-${sortedIds[1]}-${type}`;
      
      if (!connectionKeys.has(connectionKey)) {
        connectionKeys.add(connectionKey);
        connections.push({
          from: from,
          to: to,
          type: type
        });
        return true;
      }
      return false;
    };

    // 1. CONEXIÓN DE ESCALERAS ENTRE PISOS (solo las que están configuradas)
    const escaleras = areas.filter(a => a && a.tipo === "escalera");
    
    escaleras.forEach((escalera) => {
      // 🔥 VALIDAR QUE LA ESCALERA TENGA CONFIGURACIÓN VÁLIDA
      if (!escalera.carreraDestino || !escalera.pisoDestino) {
        return;
      }

      // Buscar escalera gemela según la configuración
      const escaleraGemela = escaleras.find(e => 
        e && e.id && e.id !== escalera.id &&
        e.carreraActual === escalera.carreraDestino &&
        e.pisoActual === escalera.pisoDestino
      );
      
      if (escaleraGemela) {
        const added = addUniqueConnection(escalera, escaleraGemela, 'escalera');
        if (added) {
        }
      } else {
      }
    });

    // 2. CONEXIONES DE PASILLOS (solo los que están definidos en el JSON)
    const pasillos = areas.filter(a => a && a.tipo === "pasillo");
    
    pasillos.forEach(pasillo => {
      // 🔥 VALIDAR QUE EL PASILLO TENGA FROM Y TO VÁLIDOS
      if (pasillo.from && pasillo.to && pasillo.from.id && pasillo.to.id) {
        const added = addUniqueConnection(pasillo.from, pasillo.to, 'pasillo');
        if (added) {
        }
      } else {
      }
    });

    
    // Debug detallado
    connections.forEach(conn => {
    });

    return connections;
  }, [areas]);

  // 🔥 CORREGIDO: Construir grafo con validación robusta
  const buildGraphWithExplicitConnections = useCallback(() => {
    const graph = {};
    const todosLosNodos = getAllNodes();



    // 1. Agregar todos los nodos al grafo (solo si tienen ID)
    todosLosNodos.forEach(n => {
      if (n && n.id) {
        graph[n.id] = {};
      }
    });

    // 2. CONEXIÓN DE ESCALERAS ENTRE PISOS (solo las configuradas)
    const escaleras = areas.filter(a => a && a.tipo === "escalera");

    
    escaleras.forEach((escalera) => {
      // 🔥 VALIDAR QUE EXISTA EN EL GRAFO
      if (!graph[escalera.id]) {
     
        return;
      }

      const escaleraGemela = escaleras.find(e => 
        e && e.id && graph[e.id] &&
        e.id !== escalera.id &&
        e.carreraActual === escalera.carreraDestino &&
        e.pisoActual === escalera.pisoDestino
      );
      
      if (escaleraGemela) {
        const distancia = 10; // Distancia fija para conexiones entre pisos
        graph[escalera.id][escaleraGemela.id] = distancia;
        graph[escaleraGemela.id][escalera.id] = distancia;

      }
    });

    // 3. CONEXIONES DE PASILLOS (solo los definidos en JSON)
    areas
      .filter(a => a && a.tipo === "pasillo")
      .forEach(pasillo => {
        // 🔥 VALIDACIÓN ROBUSTA
        if (pasillo.from && pasillo.to && 
            pasillo.from.id && pasillo.to.id &&
            graph[pasillo.from.id] && graph[pasillo.to.id]) {
          
          // Calcular distancia real basada en coordenadas
          const fromX = pasillo.from.x || 0;
          const fromY = pasillo.from.y || 0;
          const toX = pasillo.to.x || 0;
          const toY = pasillo.to.y || 0;
          
          const distancia = geometryUtils.calculateDistance([fromX, fromY], [toX, toY]);
          
          graph[pasillo.from.id][pasillo.to.id] = distancia;
          graph[pasillo.to.id][pasillo.from.id] = distancia;
          
        } else {
        }
      });

    
    // Debug del grafo
    let totalConexiones = 0;
    Object.keys(graph).forEach(nodeId => {
      const conexiones = Object.keys(graph[nodeId]);
      if (conexiones.length > 0) {
        totalConexiones += conexiones.length;
      }
    });

    return graph;
  }, [getAllNodes, areas]);

  // 🔥 CORREGIDO: Algoritmo Dijkstra con validación
  const findShortestPath = useCallback((graph, start, end) => {
    
    // 🔥 VALIDACIÓN ROBUSTA
    if (!graph || typeof graph !== 'object') {
      return [];
    }
    
    if (!graph[start]) {
      return [];
    }
    if (!graph[end]) {
      return [];
    }

    try {
      // Algoritmo Dijkstra
      const distances = {};
      const visited = new Set();
      const prev = {};
      
      // Inicializar distancias
      Object.keys(graph).forEach(n => {
        distances[n] = Infinity;
      });
      distances[start] = 0;

      while (visited.size < Object.keys(graph).length) {
        let current = null;
        let smallest = Infinity;
        
        Object.keys(distances).forEach(n => {
          if (!visited.has(n) && distances[n] < smallest) {
            smallest = distances[n];
            current = n;
          }
        });

        if (current === null) break;
        if (current === end) break;

        visited.add(current);

        // 🔥 VALIDAR QUE graph[current] EXISTA
        if (graph[current] && typeof graph[current] === 'object') {
          for (const neighbor in graph[current]) {
            const newDistance = distances[current] + graph[current][neighbor];
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance;
              prev[neighbor] = current;
            }
          }
        }
      }

      const path = [];
      let node = end;
      while (node) {
        path.unshift(node);
        node = prev[node];
      }
      
      return path.length > 1 ? path : [];
    } catch (error) {
      return [];
    }
  }, []);

  const getRouteNodes = useCallback((rutaIds) => {
    const todosLosNodos = getAllNodes();
    
    // 🔥 VALIDACIÓN ROBUSTA
    if (!rutaIds || !Array.isArray(rutaIds)) {
      return [];
    }
    
    return rutaIds.map(nodeId => {
      const node = todosLosNodos.find(n => n && n.id === nodeId);
      if (!node) {
      }
      return node;
    }).filter(Boolean);
  }, [getAllNodes]);

  const calcularRuta = useCallback(async () => {
    if (!origen || !destino) {
      Alert.alert("Error", "Selecciona origen y destino");
      return;
    }
    

    setIsCalculando(true);
    
    try {
      const graph = buildGraphWithExplicitConnections();
      
      // 🔥 VALIDAR QUE EL GRAFO SE CONSTRUYÓ CORRECTAMENTE
      if (!graph || Object.keys(graph).length === 0) {
   
        Alert.alert("Error", "No hay caminos disponibles en el mapa");
        return;
      }
      
      const rutaIds = findShortestPath(graph, origen, destino);
      
      if (rutaIds.length > 0) {
        const rutaNodos = getRouteNodes(rutaIds);
        setRutaActual(rutaNodos);
        
        // Mostrar detalles de la ruta
        rutaNodos.forEach((node, index) => {
          if (node) {
            const tipoInfo = node.tipo === 'escalera' ? ' 🪜' : node.tipo === 'pasillo' ? ' 🛣️' : '';
          
          }
        });
        
        Alert.alert("Éxito", `Ruta encontrada con ${rutaNodos.length} pasos`);
      } else {
        setRutaActual([]);
        Alert.alert("Error", "No se encontró ruta. Los puntos pueden no estar conectados por pasillos o escaleras.");
      }
    } catch (error) {
      Alert.alert("Error", "Error calculando la ruta");
    } finally {
      setIsCalculando(false);
    }
  }, [origen, destino, buildGraphWithExplicitConnections, findShortestPath, getRouteNodes]);

  const limpiarRuta = useCallback(() => {
    setRutaActual([]);
    setOrigen("");
    setDestino("");
  }, []);

  return {
    origen,
    destino,
    rutaActual,
    isCalculando,
    setOrigen,
    setDestino,
    calcularRuta,
    limpiarRuta,
    graphConnections: generateGraphConnections(),
    getGraphConnectionsForPlano, // 🔥 NUEVO: para filtrar por plano
    getRouteNodes
  };
};