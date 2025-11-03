// src/hooks/useGPSNavigation.js
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

  const buildGraphWithExplicitConnections = useCallback(() => {
    const graph = {};
    const todosLosNodos = getAllNodes();

    console.log("=== 🏗️ CONSTRUYENDO GRAFO ===");
    console.log(`📊 Total de nodos: ${todosLosNodos.length}`);

    // 1. Agregar todos los nodos al grafo
    todosLosNodos.forEach(n => {
      if (n && n.id) graph[n.id] = {};
    });

    // 2. CONEXIÓN DE ESCALERAS ENTRE PISOS
    const escaleras = areas.filter(a => a && a.tipo === "escalera");
    console.log(`🪜 ESCALERAS ENCONTRADAS: ${escaleras.length}`);
    
    escaleras.forEach((escalera) => {
      // Buscar escalera gemela
      const escaleraGemela = escaleras.find(e => 
        e.id !== escalera.id &&
        e.carreraActual === escalera.carreraDestino &&
        e.pisoActual === escalera.pisoDestino
      );
      
      if (escaleraGemela) {
        const distancia = 10;
        graph[escalera.id][escaleraGemela.id] = distancia;
        graph[escaleraGemela.id][escalera.id] = distancia;
        console.log(`🔗 CONECTADA: ${escalera.id} <-> ${escaleraGemela.id}`);
      }
    });

    // 3. CONEXIONES ENTRE NODOS EN EL MISMO PLANO
    areas
      .filter(a => a && a.tipo === "pasillo")
      .forEach(pasillo => {
        if (pasillo.from && pasillo.to && graph[pasillo.from.id] && graph[pasillo.to.id]) {
          const distancia = geometryUtils.calculateDistance(
            [pasillo.from.x || 0, pasillo.from.y || 0],
            [pasillo.to.x || 0, pasillo.to.y || 0]
          );
          
          graph[pasillo.from.id][pasillo.to.id] = distancia;
          graph[pasillo.to.id][pasillo.from.id] = distancia;
        }
      });

    console.log("✅ GRAFO CONSTRUIDO CON ÉXITO");
    return graph;
  }, [getAllNodes, areas]);

  const findShortestPath = useCallback((graph, start, end) => {
    console.log(`🔍 Buscando ruta: ${start} -> ${end}`);
    
    if (!graph[start] || !graph[end]) {
      console.log(`❌ Origen o destino no está en el grafo`);
      return [];
    }

    // Algoritmo Dijkstra simplificado
    const distances = {};
    const visited = new Set();
    const prev = {};
    
    Object.keys(graph).forEach(n => distances[n] = Infinity);
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

      for (const neighbor in graph[current]) {
        const newDistance = distances[current] + graph[current][neighbor];
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          prev[neighbor] = current;
        }
      }
    }

    const path = [];
    let node = end;
    while (node) {
      path.unshift(node);
      node = prev[node];
    }
    
    console.log(`📏 Ruta encontrada: ${path.length} pasos`);
    return path.length > 1 ? path : [];
  }, []);

  const calcularRuta = useCallback(async () => {
    if (!origen || !destino) {
      Alert.alert("Error", "Selecciona origen y destino");
      return;
    }
    
    console.log("🎯 ===== CALCULANDO RUTA =====");
    console.log(`   Origen: ${origen}, Destino: ${destino}`);

    setIsCalculando(true);
    
    try {
      const graph = buildGraphWithExplicitConnections();
      const ruta = findShortestPath(graph, origen, destino);
      
      if (ruta.length > 0) {
        setRutaActual(ruta);
        console.log("✅ RUTA ENCONTRADA!");
        
        // Mostrar detalles de la ruta
        const todosLosNodos = getAllNodes();
        console.log("🗺️ DETALLES DE LA RUTA:");
        ruta.forEach((nodeId, index) => {
          const node = todosLosNodos.find(n => n.id === nodeId);
          if (node) {
            console.log(`   ${index + 1}. ${node.nombre} (${node.piso})`);
          }
        });
        
        Alert.alert("Éxito", `Ruta encontrada con ${ruta.length} pasos`);
      } else {
        setRutaActual([]);
        console.log("❌ NO SE ENCONTRÓ RUTA");
        Alert.alert("Error", "No se encontró ruta entre los puntos seleccionados");
      }
    } catch (error) {
      console.error("💥 Error calculando ruta:", error);
      Alert.alert("Error", "Error calculando la ruta");
    } finally {
      setIsCalculando(false);
    }
  }, [origen, destino, buildGraphWithExplicitConnections, findShortestPath, getAllNodes]);

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
  setOrigen,      // 🔥 Esta debe estar
  setDestino,     // 🔥 Esta debe estar  
  calcularRuta,   // 🔥 Esta debe estar
  limpiarRuta     // 🔥 Esta debe estar
};
};