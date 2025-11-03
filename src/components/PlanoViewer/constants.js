// constants.js

export const AREA_TYPES = {
  AULA: 'aula',
  HALL: 'hall',
  BANO: 'bano',
  ESCALERA: 'escalera',
  PUNTO: 'punto',
  PASILLO: 'pasillo',
  EXTINTOR: 'extintor',
  SALIDA_EMERGENCIA: 'salida_emergencia',
  DESFIBRILADOR: 'desfibrilador',
  BOTIQUIN: 'botiquin',
  ALARMA: 'alarma',
  TOTEM: 'totem'
};

export const COLORS = {
  [AREA_TYPES.AULA]: '#4CAF50',
  [AREA_TYPES.HALL]: '#FF9800',
  [AREA_TYPES.BANO]: '#9C27B0',
  [AREA_TYPES.ESCALERA]: '#795548',
  [AREA_TYPES.PUNTO]: '#607D8B',
  [AREA_TYPES.PASILLO]: '#FFC107',
  [AREA_TYPES.EXTINTOR]: '#FF4444',
  [AREA_TYPES.SALIDA_EMERGENCIA]: '#00AA00',
  [AREA_TYPES.DESFIBRILADOR]: '#FFAA00',
  [AREA_TYPES.BOTIQUIN]: '#4444FF',
  [AREA_TYPES.ALARMA]: '#FF00FF',
  [AREA_TYPES.TOTEM]: '#009688'
};

export const CARRERAS = {
  SISTEMAS: "sistemas",
  QUIMICA: "quimica",
  MECANICA: "mecanica",
  CIVIL: "civil",
  INDUSTRIAL: "industrial",
  ELECTRICA: "electrica"
};

export const PISOS = {
  PLANTA_PRINCIPAL: "Planta Principal",
  PISO1: "Piso 1",
  PISO2: "Piso 2",
  PISO3: "Piso 3",
  PISO4: "Piso 4"
};

export const ICONS = {
  [AREA_TYPES.AULA]: '🏫',
  [AREA_TYPES.HALL]: '🏢',
  [AREA_TYPES.BANO]: '🚻',
  [AREA_TYPES.ESCALERA]: '🪜',
  [AREA_TYPES.PUNTO]: '📍',
  [AREA_TYPES.PASILLO]: '🛣️',
  [AREA_TYPES.EXTINTOR]: '🧯',
  [AREA_TYPES.SALIDA_EMERGENCIA]: '🚪',
  [AREA_TYPES.DESFIBRILADOR]: '💓',
  [AREA_TYPES.BOTIQUIN]: '🩹',
  [AREA_TYPES.ALARMA]: '🚨',
  [AREA_TYPES.TOTEM]: '📟'
};

export const PLANOS_CONFIG = {
  planta_principal: {
    id: 'planta_principal',
    nombre: 'Planta Principal',
    carrera: 'general',
    piso: 'planta_principal',
    src: require('./assets/Dibujo1-Presentación1.png'),
    width: 1012,
    height: 768,
    areas: []
  },
  sistemas_p1: {
    id: 'sistemas_p1',
    nombre: 'Sistemas - Piso 1',
    carrera: CARRERAS.SISTEMAS,
    piso: PISOS.PISO1,
    src: require('./assets/sistemas-piso-1.png'),
    width: 1012,
    height: 768,
    areas: []
  },
  sistemas_p2: {
    id: 'sistemas_p2',
    nombre: 'Sistemas - Piso 2',
    carrera: CARRERAS.SISTEMAS,
    piso: PISOS.PISO2,
    src: require('./assets/sistemas-piso-2.png'),
    width: 1012,
    height: 768,
    areas: []
  }
};

// 🔥 AGREGAR ESTAS FUNCIONES FALTANTES
export const getPlanosByCarrera = (carrera) => {
  return Object.values(PLANOS_CONFIG).filter(plano => 
    carrera === 'general' ? plano.carrera === 'general' : plano.carrera === carrera
  );
};

export const getCarrerasDisponibles = () => {
  const carreras = new Set();
  Object.values(PLANOS_CONFIG).forEach(plano => {
    if (plano.carrera !== 'general') {
      carreras.add(plano.carrera);
    }
  });
  return Array.from(carreras);
};

// Helper para obtener información de un nodo
export const getNodeInfo = (nodeId, areas, points) => {
  const node = areas.find(a => a.id === nodeId) || points.find(p => p.id === nodeId);
  return node || null;
};

export const CONTROL_PANEL_STYLE = {
  position: "absolute",
  top: 20,
  left: 20,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  width: "320px",
  fontFamily: "Inter, Arial, sans-serif",
};

export const ESCALERA_DIRECCIONES = {
  SUBIDA: 'subida',
  BAJADA: 'bajada',
  AMBOS: 'ambos'
};

export const TIPOS_DESTINO_ESCALERA = {
  UNICO: 'unico',
  MULTIPLE: 'multiple'
};