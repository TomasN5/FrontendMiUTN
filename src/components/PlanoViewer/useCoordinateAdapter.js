// src/hooks/useCoordinateAdapter.js
import { useState, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';

export const useCoordinateAdapter = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [imageLayout, setImageLayout] = useState(null);

  const PLANO_REFERENCE = {
    width: 1280,
    height: 971
  };

  const onImageLayout = useCallback((event) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  }, []);

  const adaptCoordinates = useCallback((x, y, zoomScale = 1, panOffsetX = 0, panOffsetY = 0, planoWidth = PLANO_REFERENCE.width, planoHeight = PLANO_REFERENCE.height) => {
    if (!imageLayout) {
      const scaleX = screenWidth / planoWidth;
      const scaleY = screenHeight / planoHeight;
      const scale = Math.min(scaleX, scaleY);
      
      return {
        x: x * scale,
        y: y * scale,
        scale,
        pointScale: 1,
        isApproximate: true
      };
    }

    const imageAspectRatio = planoWidth / planoHeight;
    const screenAspectRatio = screenWidth / screenHeight;
    
    let renderedWidth, renderedHeight, imageOffsetX, imageOffsetY;

    if (screenAspectRatio > imageAspectRatio) {
      renderedHeight = imageLayout.height;
      renderedWidth = renderedHeight * imageAspectRatio;
      imageOffsetX = imageLayout.x + (imageLayout.width - renderedWidth) / 2;
      imageOffsetY = imageLayout.y;
    } else {
      renderedWidth = imageLayout.width;
      renderedHeight = renderedWidth / imageAspectRatio;
      imageOffsetX = imageLayout.x;
      imageOffsetY = imageLayout.y + (imageLayout.height - renderedHeight) / 2;
    }

    const baseScaleX = renderedWidth / planoWidth;
    const baseScaleY = renderedHeight / planoHeight;

    // Posición base sin zoom/pan
    const baseX = (x * baseScaleX) + imageOffsetX;
    const baseY = (y * baseScaleY) + imageOffsetY;

    // 🔥 INVERTIR: Los puntos se hacen MÁS PEQUEÑOS cuando el zoom AUMENTA
    const pointScale = Math.max(0.2, Math.min(1, 1 / zoomScale));

    return {
      x: baseX,
      y: baseY,
      scale: baseScaleX,
      pointScale: pointScale,
      baseScaleX,
      baseScaleY,
      imageOffsetX,
      imageOffsetY,
      isApproximate: false
    };
  }, [imageLayout, screenWidth, screenHeight]);

  const adaptPointsArray = useCallback((points, zoomScale = 1, panOffsetX = 0, panOffsetY = 0, planoWidth = PLANO_REFERENCE.width, planoHeight = PLANO_REFERENCE.height) => {
    return points.map(point => {
      const adapted = adaptCoordinates(point[0], point[1], zoomScale, panOffsetX, panOffsetY, planoWidth, planoHeight);
      return [adapted.x, adapted.y];
    });
  }, [adaptCoordinates]);

  const adaptNode = useCallback((node, zoomScale = 1, panOffsetX = 0, panOffsetY = 0, plano) => {
    if (!node) return null;

    const planoWidth = plano?.width || PLANO_REFERENCE.width;
    const planoHeight = plano?.height || PLANO_REFERENCE.height;

    if (node.x !== undefined && node.y !== undefined) {
      const adapted = adaptCoordinates(node.x, node.y, zoomScale, panOffsetX, panOffsetY, planoWidth, planoHeight);
      return {
        ...node,
        adaptedX: adapted.x,
        adaptedY: adapted.y,
        scale: adapted.scale,
        pointScale: adapted.pointScale,
        isApproximate: adapted.isApproximate
      };
    }

    if (node.points && Array.isArray(node.points)) {
      const adaptedPoints = adaptPointsArray(node.points, zoomScale, panOffsetX, panOffsetY, planoWidth, planoHeight);
      const adapted = adaptCoordinates(0, 0, zoomScale, panOffsetX, panOffsetY, planoWidth, planoHeight);
      return {
        ...node,
        adaptedPoints: adaptedPoints,
        scale: adapted.scale,
        pointScale: adapted.pointScale,
        isApproximate: adapted.isApproximate
      };
    }

    return node;
  }, [adaptCoordinates, adaptPointsArray]);

  return {
    adaptCoordinates,
    adaptPointsArray,
    adaptNode,
    onImageLayout,
    imageLayout,
    screenWidth,
    screenHeight,
    referenceSize: PLANO_REFERENCE,
    isReady: !!imageLayout
  };
};