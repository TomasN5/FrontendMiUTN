import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  style = {}, 
  textStyle = {},
  imageSource = null 
}) => {
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
    >
      {imageSource && (
        <Image 
          source={imageSource} 
          style={styles.buttonImage}
          resizeMode="contain"
        />
      )}
      <Text style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Estilos locales para el botón
const styles = {
  buttonImage: {
    width: 65,
    height: 65,
    marginBottom: 8,
  }
};

export default Button;