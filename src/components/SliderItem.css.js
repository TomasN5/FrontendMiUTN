import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../screens/HomeScreen.css.js';

const { width } = Dimensions.get('window');

const sliderItemStyles = StyleSheet.create({
  sliderItem: {
    width: width * 0.85, // 85% DEL ANCHO
    height: '90%', // 90% del alto del contenedor
    marginHorizontal: 10, // Margen entre items
    backgroundColor: '#e8f4ff', // Color celeste para todos los items
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    borderWidth: 0, // Por defecto sin borde
  },
  // Estilo para items importantes - SOLO el marco rojo
  importantItem: {
    borderWidth: 3,
    borderColor: COLORS.danger,
  },
  sliderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
    textAlign: 'center',
  },
  sliderItemDescription: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Badge de importancia con estilo de botón
  importantBadge: {
    position: 'absolute',
    top: 12,
    right: 10,
    backgroundColor: '#e53e3e', // Fondo blanco como un botón
    borderWidth: 2,
    borderColor: '#e53e3e',
    borderRadius: 20, // Bordes más redondeados
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
    minWidth: 80, // Ancho mínimo para que se vea como botón
    alignItems: 'center',
    justifyContent: 'center',
  },
  importantBadgeText: {
    color: '#ffffffff', // Texto rojo para contrastar con fondo blanco
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default sliderItemStyles;