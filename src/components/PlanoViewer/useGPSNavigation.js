// useGPSNavigation.js - VERSIÓN CORREGIDA PARA PLANOS MULTICARRERA
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { geometryUtils } from './geometry';

export const useGPSNavigation = (areas = [], points = [], planos = []) => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [rutaActual, setRutaActual] = useState([]);
  const [isCalculando, setIsCalculando] = useState(false);
  const [rutaCompleta, setRutaCompleta] = useState([]);
  const [segmentosRuta, setSegmentosRuta] = useState([]);
  const [segmentoActualIndex, setSegmentoActualIndex] = useState(0);
  const [mostrarContinuar, setMostrarContinuar] = useState(false);

  const getAllNodes = useCallback(() => {
    return [...areas, ...points];
  }, [areas, points]);

  // 🔥 CORREGIDO: Filtrar conexiones por plano actual - incluir todas las carreras
  const getGraphConnectionsForPlano = useCallback((planoActualId) => {
    if (!planoActualId) return [];
    
    const connections = generateGraphConnections();
    
    const filteredConnections = connections.filter(connection => {
      if (!connection.from || !connection.to) return false;
      
      const fromPlano = connection.from.planoId;
      const toPlano = connection.to.planoId;
      
      // 🔥 MODIFICADO: Mostrar conexiones donde AL MENOS UNO de los nodos está en el plano actual
      const shouldShow = fromPlano === planoActualId || toPlano === planoActualId;
      
      return shouldShow;
    });
    
    return filteredConnections;
  }, [generateGraphConnections]);

  // 🔥 CORREGIDO: Generar conexiones entre diferentes carreras
  const generateGraphConnections = useCallback(() => {
    const connections = [];
    const connectionKeys = new Set();
    
    const addUniqueConnection = (from, to, type) => {
      if (!from || !to || !from.id || !to.id) {
        return false;
      }

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

    // 1. CONEXIÓN DE ESCALERAS ENTRE PISOS Y CARRERAS
    const escaleras = areas.filter(a => a && a.tipo === "escalera");
    
    escaleras.forEach((escalera) => {
      if (!escalera.carreraDestino || !escalera.pisoDestino) {
        return;
      }

      // 🔥 MODIFICADO: Buscar escaleras gemelas sin importar la carrera
      const escaleraGemela = escaleras.find(e => 
        e && e.id && e.id !== escalera.id &&
        // 🔥 ELIMINADO: e.carreraActual === escalera.carreraDestino &&
        e.pisoActual === escalera.pisoDestino &&
        // Conectar escaleras que tengan relación definida
        (e.carreraActual === escalera.carreraDestino || 
         // También conectar escaleras entre planta principal y otras carreras
         escalera.carreraActual === 'general' || 
         e.carreraActual === 'general')
      );
      
      if (escaleraGemela) {
        addUniqueConnection(escalera, escaleraGemela, 'escalera');
      }
    });

    // 2. CONEXIONES DE PASILLOS (mantener igual)
    const pasillos = areas.filter(a => a && a.tipo === "pasillo");
    
    pasillos.forEach(pasillo => {
      if (pasillo.from && pasillo.to && pasillo.from.id && pasillo.to.id) {
        addUniqueConnection(pasillo.from, pasillo.to, 'pasillo');
      }
    });

    return connections;
  }, [areas]);

  // 🔥 CORREGIDO: Construir grafo con conexiones entre carreras
  const buildGraphWithExplicitConnections = useCallback(() => {
    const graph = {};
    const todosLosNodos = getAllNodes();

    // 1. Agregar todos los nodos al grafo
    todosLosNodos.forEach(n => {
      if (n && n.id) {
        graph[n.id] = {};
      }
    });

    // 2. CONEXIÓN DE ESCALERAS ENTRE PISOS Y CARRERAS
    const escaleras = areas.filter(a => a && a.tipo === "escalera");
    
    escaleras.forEach((escalera) => {
      if (!graph[escalera.id]) {
        return;
      }

      // 🔥 MODIFICADO: Buscar escaleras gemelas sin restricción de carrera
      const escaleraGemela = escaleras.find(e => 
        e && e.id && graph[e.id] &&
        e.id !== escalera.id &&
        // 🔥 ELIMINADO: e.carreraActual === escalera.carreraDestino &&
        e.pisoActual === escalera.pisoDestino &&
        // Conectar escaleras que tengan relación definida o con planta principal
        (e.carreraActual === escalera.carreraDestino ||
         escalera.carreraActual === 'general' ||
         e.carreraActual === 'general')
      );
      
      if (escaleraGemela) {
        const distancia = 10;
        graph[escalera.id][escaleraGemela.id] = distancia;
        graph[escaleraGemela.id][escalera.id] = distancia;
      }
    });

    // 3. CONEXIONES DE PASILLOS (mantener igual)
    areas
      .filter(a => a && a.tipo === "pasillo")
      .forEach(pasillo => {
        if (pasillo.from && pasillo.to && 
            pasillo.from.id && pasillo.to.id &&
            graph[pasillo.from.id] && graph[pasillo.to.id]) {
          
          const fromX = pasillo.from.x || 0;
          const fromY = pasillo.from.y || 0;
          const toX = pasillo.to.x || 0;
          const toY = pasillo.to.y || 0;
          
          const distancia = geometryUtils.calculateDistance([fromX, fromY], [toX, toY]);
          
          graph[pasillo.from.id][pasillo.to.id] = distancia;
          graph[pasillo.to.id][pasillo.from.id] = distancia;
        }
      });

    return graph;
  }, [getAllNodes, areas]);

  // 🔥 NUEVA FUNCIÓN: Obtener información del plano por ID
  const getPlanoInfo = useCallback((planoId) => {
    // Buscar en los planos disponibles
    const plano = planos.find(p => p.id === planoId);
    if (plano) return plano;
    
    // Si no se encuentra, crear información básica
    return {
      id: planoId,
      nombre: `Plano ${planoId}`,
      carrera: planoId.includes('general') ? 'general' : 
               planoId.includes('sistemas') ? 'sistemas' :
               planoId.includes('quimica') ? 'quimica' :
               planoId.includes('mecanica') ? 'mecanica' :
               planoId.includes('civil') ? 'civil' :
               planoId.includes('industrial') ? 'industrial' :
               planoId.includes('electrica') ? 'electrica' : 'general'
    };
  }, [planos]);

  // 🔥 MODIFICADO: Dividir ruta por planos - manejar diferentes carreras
  const dividirRutaPorPlanos = useCallback((rutaNodos) => {
    if (!rutaNodos || rutaNodos.length === 0) return [];
    
    const segmentos = [];
    let segmentoActual = [];
    let planoActual = null;

    rutaNodos.forEach((nodo, index) => {
      const nodoPlano = nodo.planoId || nodo.plano;
      
      if (!planoActual) {
        planoActual = nodoPlano;
      }
      
      if (nodoPlano !== planoActual) {
        // Cambio de plano - guardar segmento actual y empezar nuevo
        if (segmentoActual.length > 0) {
          const planoInfo = getPlanoInfo(planoActual);
          segmentos.push({
            planoId: planoActual,
            planoInfo: planoInfo,
            nodos: [...segmentoActual],
            tieneEscalera: segmentoActual.some(n => n.tipo === 'escalera')
          });
        }
        
        segmentoActual = [nodo];
        planoActual = nodoPlano;
      } else {
        segmentoActual.push(nodo);
      }
      
      // Último nodo
      if (index === rutaNodos.length - 1 && segmentoActual.length > 0) {
        const planoInfo = getPlanoInfo(planoActual);
        segmentos.push({
          planoId: planoActual,
          planoInfo: planoInfo,
          nodos: segmentoActual,
          tieneEscalera: segmentoActual.some(n => n.tipo === 'escalera')
        });
      }
    });
    
    return segmentos;
  }, [getPlanoInfo]);

  const getRouteNodes = useCallback((rutaIds) => {
    const todosLosNodos = getAllNodes();
    
    if (!rutaIds || !Array.isArray(rutaIds)) {
      return [];
    }
    
    return rutaIds.map(nodeId => {
      const node = todosLosNodos.find(n => n && n.id === nodeId);
      return node;
    }).filter(Boolean);
  }, [getAllNodes]);

  // 🔥 MODIFICADO: calcularRuta con información mejorada de planos
  const calcularRuta = useCallback(async (destinoParam = null, origenParam = null) => {
    const destinoFinal = destinoParam !== null ? destinoParam : destino;
    const origenFinal = origenParam !== null ? origenParam : origen;
    
    if (!origenFinal || !destinoFinal) {
      Alert.alert("Error", "Selecciona origen y destino");
      return;
    }
    
    setIsCalculando(true);
    
    try {
      const graph = buildGraphWithExplicitConnections();
      
      if (!graph || Object.keys(graph).length === 0) {
        Alert.alert("Error", "No hay caminos disponibles en el mapa");
        return;
      }
      
      const rutaIds = findShortestPath(graph, origenFinal, destinoFinal);
      
      if (rutaIds.length > 0) {
        const rutaNodos = getRouteNodes(rutaIds);
        const segmentos = dividirRutaPorPlanos(rutaNodos);
        
        console.log('🔍 Ruta calculada:', {
          totalNodos: rutaNodos.length,
          segmentos: segmentos.length,
          segmentosDetalle: segmentos.map(s => ({
            plano: s.planoId,
            carrera: s.planoInfo.carrera,
            nodos: s.nodos.length,
            tieneEscalera: s.tieneEscalera
          }))
        });
        
        setRutaCompleta(rutaNodos);
        setSegmentosRuta(segmentos);
        setSegmentoActualIndex(0);
        
        if (segmentos.length > 0) {
          setRutaActual(segmentos[0].nodos);
          
          // Mostrar botón continuar si hay más segmentos
          if (segmentos.length > 1) {
            setMostrarContinuar(true);
          }
        }
        
      } else {
        setRutaActual([]);
        setRutaCompleta([]);
        setSegmentosRuta([]);
        setMostrarContinuar(false);
        Alert.alert("Error", "No se encontró ruta. Los puntos pueden no estar conectados por pasillos o escaleras.");
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      Alert.alert("Error", "Error calculando la ruta");
    } finally {
      setIsCalculando(false);
    }
  }, [origen, destino, buildGraphWithExplicitConnections, findShortestPath, getRouteNodes, dividirRutaPorPlanos]);
  
  // 🔥 NUEVO: Función para establecer destino y calcular ruta en una sola operación
  const setDestinoYCalcularRuta = useCallback(async (nuevoDestino) => {
    setDestino(nuevoDestino);
    // Usar setTimeout para asegurar que el estado se actualice, o mejor aún, pasar el destino directamente
    await calcularRuta(nuevoDestino, origen);
  }, [calcularRuta, origen]);

  // 🔥 NUEVA FUNCIÓN: Obtener plano por ID para cambiar
  const getPlanoParaCambiar = useCallback((planoId) => {
    return getPlanoInfo(planoId);
  }, [getPlanoInfo]);

  // 🔥 MODIFICADO: Avanzar al siguiente segmento con información de plano
  const avanzarSiguienteSegmento = useCallback(() => {
    if (segmentosRuta.length === 0 || segmentoActualIndex >= segmentosRuta.length - 1) {
      return null;
    }
    
    const siguienteIndex = segmentoActualIndex + 1;
    setSegmentoActualIndex(siguienteIndex);
    setRutaActual(segmentosRuta[siguienteIndex].nodos);
    
    // Ocultar botón si es el último segmento
    if (siguienteIndex === segmentosRuta.length - 1) {
      setMostrarContinuar(false);
    }
    
    // 🔥 RETORNAR información completa del segmento
    return {
      ...segmentosRuta[siguienteIndex],
      index: siguienteIndex,
      total: segmentosRuta.length
    };
  }, [segmentosRuta, segmentoActualIndex]);

  // 🔥 NUEVA FUNCIÓN: Obtener información del segmento actual
  const getInfoSegmentoActual = useCallback(() => {
    if (segmentosRuta.length === 0) return null;
    
    const segmento = segmentosRuta[segmentoActualIndex];
    const esUltimoSegmento = segmentoActualIndex === segmentosRuta.length - 1;
    const tieneSiguiente = segmentoActualIndex < segmentosRuta.length - 1;
    
    return {
      segmento,
      numero: segmentoActualIndex + 1,
      total: segmentosRuta.length,
      esUltimoSegmento,
      tieneSiguiente,
      planoId: segmento.planoId,
      planoInfo: segmento.planoInfo,
      tieneEscalera: segmento.tieneEscalera
    };
  }, [segmentosRuta, segmentoActualIndex]);

  // Algoritmo Dijkstra (mantener igual)
  const findShortestPath = useCallback((graph, start, end) => {
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
      const distances = {};
      const visited = new Set();
      const prev = {};
      
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

  const limpiarRuta = useCallback(() => {
    setRutaActual([]);
    setRutaCompleta([]);
    setSegmentosRuta([]);
    setSegmentoActualIndex(0);
    setMostrarContinuar(false);
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
    setDestinoYCalcularRuta,
    limpiarRuta,
    graphConnections: generateGraphConnections(),
    getGraphConnectionsForPlano,
    getRouteNodes,
    
    // 🔥 NUEVAS FUNCIONES PARA NAVEGACIÓN ENTRE PISOS Y CARRERAS
    rutaCompleta,
    segmentosRuta,
    segmentoActualIndex,
    mostrarContinuar,
    avanzarSiguienteSegmento,
    getInfoSegmentoActual,
    getPlanoParaCambiar
  };
};