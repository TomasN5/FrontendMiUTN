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
  // Estilo para items importantes - Diseño destacado
  importantItem: {
    backgroundColor: '#fff5f5', // Fondo rosa muy suave para resaltar
    borderWidth: 4,
    borderColor: '#e53e3e', // Borde rojo más grueso
    shadowColor: '#e53e3e', // Sombra con color rojo
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4, // Sombra más pronunciada
    shadowRadius: 4,
    elevation: 10, // Elevación mayor en Android
  },
  sliderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderItemTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
    textAlign: 'center',
  },
  // Estilos para título de items importantes
  importantTitle: {
    color: '#c53030', // Color rojo oscuro para el título
    fontSize: 26, // Título ligeramente más grande
  },
  sliderItemDescription: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Estilos para descripción de items importantes
  importantDescription: {
    fontSize: 16, // Color más oscuro para mejor legibilidad
    fontWeight: '500', // Texto ligeramente más bold
  },
  // Badge de importancia con estilo de botón mejorado
  importantBadge: {
    position: 'absolute',
    top: 16, // Posición desde arriba
    right: 20, // Posición desde la derecha
    zIndex: 10, // Asegurar que esté por encima
  },
  importantBadgeContainer: {
    backgroundColor: '#e53e3e', // Fondo rojo
    borderWidth: 2,
    borderColor: '#c53030', // Borde rojo más oscuro
    borderRadius: 20, // Bordes más redondeados
    paddingLeft: 16, // Más padding a la izquierda para mover el texto a la derecha
    paddingRight: 12,
    paddingVertical: 5,
    shadowColor: '#e53e3e',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4, // Sombra más pronunciada
    shadowRadius: 4,
    elevation: 6, // Mayor elevación
    minWidth: 80, // Ancho mínimo reducido
    alignItems: 'center',
    justifyContent: 'center',
  },
  importantBadgeText: {
    color: '#ffffff', // Texto blanco
    fontSize: 11,
    fontWeight: '700', // Más bold
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default sliderItemStyles;