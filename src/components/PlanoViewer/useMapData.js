// src/hooks/useMapData.js
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

export const useMapData = () => {
  const [mapData, setMapData] = useState({
    planos: [],
    areas: [],
    puntos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://e13217bbfd70.ngrok-free.app/api/map';

  // Procesar áreas para asegurar que tengan puntos válidos
const procesarAreas = useCallback((areas) => {
  return areas.map(area => {
    // Si el área tiene puntos, asegurarse de que sean válidos
    if (area.points && Array.isArray(area.points)) {
      // Filtrar puntos válidos
      const puntosValidos = area.points.filter(point => 
        point && Array.isArray(point) && point.length === 2
      );
      
      return {
        ...area,
        points: puntosValidos,
        // Agregar centro calculado para el ícono
        center: puntosValidos.length > 0 ? {
          x: puntosValidos.reduce((sum, point) => sum + point[0], 0) / puntosValidos.length,
          y: puntosValidos.reduce((sum, point) => sum + point[1], 0) / puntosValidos.length
        } : null
      };
    }
    
    return area;
  });
}, []);

  // Cargar todos los datos del mapa
  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/getPoint`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const datos = await response.json();
      

      if (!datos || !datos.planos) {
        setMapData({ planos: [], areas: [], puntos: [] });
        return;
      }

      
      // Procesar datos
      const todasAreas = [];
      const todosPuntos = [];
      
      Object.values(datos.planos).forEach(planoData => {
        if (planoData.areas) {
          const areasProcesadas = procesarAreas(planoData.areas);
          todasAreas.push(...areasProcesadas);
        }
        if (planoData.points) todosPuntos.push(...planoData.points);
      });
      


      // Log de áreas con polígonos
      const areasConPoligonos = todasAreas.filter(area => area.points && area.points.length > 0);


      setMapData({
        planos: Object.values(datos.planos),
        areas: todasAreas,
        puntos: todosPuntos
      });

    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'No se pudieron cargar los datos del mapa');
    } finally {
      setLoading(false);
    }
  }, [procesarAreas]);

  // Obtener datos de un plano específico
  const getPlanoData = useCallback((planoId) => {
    const areas = mapData.areas.filter(area => area.planoId === planoId);
    const puntos = mapData.puntos.filter(punto => punto.planoId === planoId);
    const plano = mapData.planos.find(p => p.id === planoId);
    
    return {
      areas,
      puntos,
      plano
    };
  }, [mapData]);

  // Obtener todos los nodos para el GPS
  const getAllNodes = useCallback(() => {
    return [...mapData.areas, ...mapData.puntos];
  }, [mapData]);

  // Cargar datos al iniciar
  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  return {
    // Datos
    ...mapData,
    loading,
    error,
    
    // Acciones
    loadMapData,
    getPlanoData,
    getAllNodes,
    
    // Refrescar
    refresh: loadMapData
  };
};