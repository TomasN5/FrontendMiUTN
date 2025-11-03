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

  const API_BASE_URL = 'http://192.168.0.13:8080/api/map';

  // Cargar todos los datos del mapa
  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando datos del mapa desde API...');

      const response = await fetch(`${API_BASE_URL}/getPoint`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const datos = await response.json();
      
      console.log(datos)

      if (!datos || !datos.planos) {
        console.log("📭 API respondió pero sin datos");
        setMapData({ planos: [], areas: [], puntos: [] });
        return;
      }
      
      console.log('✅ Datos del mapa cargados:');
      console.log('   📋 Planos:', Object.keys(datos.planos).length);
      
      // Procesar datos
      const todasAreas = [];
      const todosPuntos = [];
      
      Object.values(datos.planos).forEach(planoData => {
        if (planoData.areas) todasAreas.push(...planoData.areas);
        if (planoData.points) todosPuntos.push(...planoData.points);
      });
      
      console.log('   🏢 Áreas:', todasAreas.length);
      console.log('   📍 Puntos:', todosPuntos.length);

      setMapData({
        planos: Object.values(datos.planos),
        areas: todasAreas,
        puntos: todosPuntos
      });

    } catch (err) {
      console.error('❌ Error cargando datos del mapa:', err);
      setError(err.message);
      Alert.alert('Error', 'No se pudieron cargar los datos del mapa');
    } finally {
      setLoading(false);
    }
  }, []);

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