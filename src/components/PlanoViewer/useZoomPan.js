// src/hooks/useZoomPan.js
import { useState, useCallback } from 'react';
import { Dimensions } from 'react-native';

export const useZoomPan = () => {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [lastTouch, setLastTouch] = useState(null);
  const [isZooming, setIsZooming] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const minScale = 0.5;
  const maxScale = 3.0;

  // Calcular límites basados en el tamaño de la imagen y escala actual
  const calculateBounds = useCallback((imageWidth, imageHeight) => {
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;
    
    const maxOffsetX = Math.max(0, (scaledWidth - screenWidth) / 2 / scale);
    const maxOffsetY = Math.max(0, (scaledHeight - screenHeight) / 2 / scale);
    
    return {
      minX: -maxOffsetX,
      maxX: maxOffsetX,
      minY: -maxOffsetY,
      maxY: maxOffsetY
    };
  }, [scale, screenWidth, screenHeight]);

  // Aplicar límites a los offsets
  const applyBounds = useCallback((newOffsetX, newOffsetY, imageWidth, imageHeight) => {
    const bounds = calculateBounds(imageWidth, imageHeight);
    
    return {
      x: Math.max(bounds.minX, Math.min(newOffsetX, bounds.maxX)),
      y: Math.max(bounds.minY, Math.min(newOffsetY, bounds.maxY))
    };
  }, [calculateBounds]);

  // Zoom in
  const zoomIn = useCallback((imageWidth, imageHeight) => {
    setScale(prev => {
      const newScale = Math.min(prev * 1.5, maxScale);
      
      // Ajustar offsets para mantener el centro
      const bounds = calculateBounds(imageWidth, imageHeight);
      const boundedOffset = applyBounds(offsetX, offsetY, imageWidth, imageHeight);
      
      setOffsetX(boundedOffset.x);
      setOffsetY(boundedOffset.y);
      
      return newScale;
    });
  }, [calculateBounds, applyBounds, offsetX, offsetY]);

  // Zoom out
  const zoomOut = useCallback((imageWidth, imageHeight) => {
    setScale(prev => {
      const newScale = Math.max(prev / 1.5, minScale);
      
      // Si volvemos a escala 1, centrar
      if (newScale === 1) {
        setOffsetX(0);
        setOffsetY(0);
      } else {
        // Ajustar offsets para mantener límites
        const boundedOffset = applyBounds(offsetX, offsetY, imageWidth, imageHeight);
        setOffsetX(boundedOffset.x);
        setOffsetY(boundedOffset.y);
      }
      
      return newScale;
    });
  }, [applyBounds, offsetX, offsetY]);

  // Reset
  const reset = useCallback(() => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  }, []);

  // Manejar gestos
  const handleTouchMove = useCallback((event, imageWidth, imageHeight) => {
    const touches = event.nativeEvent.touches;
    
    if (touches.length === 2) {
      // Pinch to zoom
      setIsZooming(true);
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.pageX - touch1.pageX, 2) + 
        Math.pow(touch2.pageY - touch1.pageY, 2)
      );

      if (lastTouch && lastTouch.distance) {
        const scaleFactor = distance / lastTouch.distance;
        setScale(prev => {
          const newScale = Math.max(minScale, Math.min(prev * scaleFactor, maxScale));
          return newScale;
        });
      }
      
      setLastTouch({ distance });
    } else if (touches.length === 1 && !isZooming) {
      // Pan
      const touch = touches[0];
      if (lastTouch && lastTouch.x && lastTouch.y) {
        const deltaX = (touch.pageX - lastTouch.x) / scale;
        const deltaY = (touch.pageY - lastTouch.y) / scale;
        
        const newOffsetX = offsetX - deltaX;
        const newOffsetY = offsetY - deltaY;
        
        // Aplicar límites
        const boundedOffset = applyBounds(newOffsetX, newOffsetY, imageWidth, imageHeight);
        
        setOffsetX(boundedOffset.x);
        setOffsetY(boundedOffset.y);
      }
      setLastTouch({ x: touch.pageX, y: touch.pageY });
    }
  }, [lastTouch, isZooming, scale, offsetX, offsetY, applyBounds]);

  const handleTouchStart = useCallback((event) => {
    const touches = event.nativeEvent.touches;
    if (touches.length === 1) {
      const touch = touches[0];
      setLastTouch({ x: touch.pageX, y: touch.pageY });
    } else if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.pageX - touch1.pageX, 2) + 
        Math.pow(touch2.pageY - touch1.pageY, 2)
      );
      setLastTouch({ distance });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setLastTouch(null);
    setIsZooming(false);
  }, []);

  return {
    scale,
    offsetX,
    offsetY,
    zoomIn,
    zoomOut,
    reset,
    handleTouchMove,
    handleTouchStart,
    handleTouchEnd,
    isZooming,
    calculateBounds,
    applyBounds
  };
};