import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, ICONS } from './constants';

const AreaPolygon = ({ area, isAdapted = false, pointScale = 1 }) => {
  if (!area) return null;

  const displayX = isAdapted ? area.adaptedX : area.x;
  const displayY = isAdapted ? area.adaptedY : area.y;
  const displayPoints = isAdapted ? area.adaptedPoints : area.points;
  const isApproximate = area.isApproximate;

  // Aplicar escala INVERSA a los tamaños
  const baseSize = 30;
  const baseIconSize = 14;
  const baseBorder = 2;

  const scaledSize = baseSize * pointScale;
  const scaledIconSize = baseIconSize * pointScale;
  const scaledBorder = baseBorder * pointScale;

  // Si es un punto (coordenadas x, y)
  if (displayX !== undefined && displayY !== undefined) {
    return (
      <View style={[
        styles.point,
        { 
          left: displayX - (scaledSize / 2), 
          top: displayY - (scaledSize / 2),
          width: scaledSize,
          height: scaledSize,
          borderRadius: scaledSize / 2,
          backgroundColor: COLORS[area.tipo] || '#CCCCCC',
          borderWidth: scaledBorder,
          borderColor: isApproximate ? '#FF9500' : 'white',
        }
      ]}>
        <Text style={[styles.pointIcon, { fontSize: scaledIconSize }]}>
          {ICONS[area.tipo] || '📍'}
        </Text>
        {isApproximate && <View style={[styles.approximateDot, { width: 6 * pointScale, height: 6 * pointScale }]} />}
        <Text style={[styles.pointName, { fontSize: 10 * pointScale }]}>
          {area.nombre}
        </Text>
      </View>
    );
  }

  // Si es un área (polygon con points)
  if (displayPoints && displayPoints.length > 0) {
    const centerX = displayPoints.reduce((sum, point) => sum + point[0], 0) / displayPoints.length;
    const centerY = displayPoints.reduce((sum, point) => sum + point[1], 0) / displayPoints.length;

    const baseAreaSize = 40;
    const baseAreaIconSize = 18;

    const areaScaledSize = baseAreaSize * pointScale;
    const areaIconSize = baseAreaIconSize * pointScale;

    return (
      <View style={[
        styles.areaMarker,
        { 
          left: centerX - (areaScaledSize / 2), 
          top: centerY - (areaScaledSize / 2),
        }
      ]}>
        <View style={[
          styles.areaIconContainer,
          { 
            width: areaScaledSize,
            height: areaScaledSize,
            borderRadius: areaScaledSize / 2,
            backgroundColor: COLORS[area.tipo] || '#CCCCCC',
            borderWidth: scaledBorder,
            borderColor: isApproximate ? '#FF9500' : 'white'
          }
        ]}>
          <Text style={[styles.areaIcon, { fontSize: areaIconSize }]}>
            {ICONS[area.tipo] || '🏢'}
          </Text>
          {isApproximate && <View style={[styles.approximateDot, { width: 6 * pointScale, height: 6 * pointScale }]} />}
        </View>
        <Text style={[styles.areaName, { fontSize: 10 * pointScale }]}>
          {area.nombre}
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  point: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pointIcon: {
    color: 'white',
    fontWeight: 'bold'
  },
  pointName: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  areaMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5
  },
  areaIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative'
  },
  areaIcon: {
    color: 'white',
    fontWeight: 'bold'
  },
  areaName: {
    marginTop: 4,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  approximateDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    borderWidth: 1,
    borderColor: 'white'
  }
});

export default AreaPolygon;