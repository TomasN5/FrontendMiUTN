// src/utils/Animations.js
import { Animated } from 'react-native';

export const Animations = {
  fadeIn: (value, duration = 300) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });
  },

  fadeOut: (value, duration = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    });
  },

  slideIn: (value, fromValue = 100, duration = 400) => {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    });
  },

  slideOut: (value, toValue = 100, duration = 400) => {
    return Animated.timing(value, {
      toValue: toValue,
      duration,
      useNativeDriver: true,
    });
  },

  bounce: (value) => {
    return Animated.sequence([
      Animated.spring(value, {
        toValue: 1.1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(value, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]);
  },

  pulse: (value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    );
  }
};