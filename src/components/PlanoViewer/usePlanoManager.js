import { useState, useCallback } from 'react';
import { PLANOS_CONFIG, getPlanosByCarrera, getCarrerasDisponibles } from './constants';

export const usePlanoManager = () => {
  const [planoActual, setPlanoActual] = useState(PLANOS_CONFIG.planta_principal);
  const [carreraActual, setCarreraActual] = useState('general');
  const [planosCarreraActual, setPlanosCarreraActual] = useState([]);

  const inicializarPlanosCarrera = useCallback((carrera) => {
    const planos = getPlanosByCarrera(carrera);
    setPlanosCarreraActual(planos);
    setCarreraActual(carrera);
    
    if (planos.length > 0) {
      setPlanoActual(planos[0]);
    }
    
    return planos;
  }, []);

  const cambiarCarrera = useCallback((nuevaCarrera) => {
    const planos = inicializarPlanosCarrera(nuevaCarrera);
    
    if (planos.length > 0) {
      setPlanoActual(planos[0]);
    }
  }, [inicializarPlanosCarrera]);

  const cambiarPlano = useCallback((planoId) => {
    const nuevoPlano = PLANOS_CONFIG[planoId];
    if (nuevoPlano) {
      setPlanoActual(nuevoPlano);
    }
  }, []);

  const avanzarPlano = useCallback(() => {
    if (!planoActual || planosCarreraActual.length === 0) return;
    
    const indiceActual = planosCarreraActual.findIndex(p => p.id === planoActual.id);
    const siguienteIndice = (indiceActual + 1) % planosCarreraActual.length;
    setPlanoActual(planosCarreraActual[siguienteIndice]);
  }, [planoActual, planosCarreraActual]);

  const retrocederPlano = useCallback(() => {
    if (!planoActual || planosCarreraActual.length === 0) return;
    
    const indiceActual = planosCarreraActual.findIndex(p => p.id === planoActual.id);
    const anteriorIndice = (indiceActual - 1 + planosCarreraActual.length) % planosCarreraActual.length;
    setPlanoActual(planosCarreraActual[anteriorIndice]);
  }, [planoActual, planosCarreraActual]);

  const infoPlanoActual = useCallback(() => {
    if (!planoActual) return null;
    
    const indice = planosCarreraActual.findIndex(p => p.id === planoActual.id);
    
    return {
      ...planoActual,
      numero: indice + 1,
      total: planosCarreraActual.length,
      tieneSiguiente: planosCarreraActual.length > 1,
      tieneAnterior: planosCarreraActual.length > 1
    };
  }, [planoActual, planosCarreraActual]);

  return {
    planoActual,
    carreraActual,
    planosCarreraActual,
    cambiarCarrera,
    cambiarPlano,
    avanzarPlano,
    retrocederPlano,
    inicializarPlanosCarrera,
    infoPlanoActual,
    carrerasDisponibles: getCarrerasDisponibles()
  };
};