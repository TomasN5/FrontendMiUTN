export const geometryUtils = {
  toPointsAttr: (pts) => pts.map(([x, y]) => `${x},${y}`).join(" "),

  getPolygonCenter: (points) => {
    // 🔥 AGREGAR VALIDACIÓN PARA EVITAR ERROR
    if (!points || !Array.isArray(points) || points.length === 0) {
      return [0, 0]; // Retornar coordenadas por defecto
    }
    
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const x = xs.reduce((a, b) => a + b, 0) / xs.length;
    const y = ys.reduce((a, b) => a + b, 0) / ys.length;
    return [x, y];
  },

  calculateDistance: (point1, point2) => {
    return Math.hypot(point2[0] - point1[0], point2[1] - point1[1]);
  },

  // 🔥 NUEVA FUNCIÓN: Calcular bounding box de un polígono
  getPolygonBoundingBox: (points) => {
    if (!points || points.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
    }

    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  // 🔥 NUEVA FUNCIÓN: Verificar si un punto está dentro de un polígono
  isPointInPolygon: (point, polygon) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  }
};