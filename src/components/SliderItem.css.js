import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../screens/HomeScreen.css.js';

const { width } = Dimensions.get('window');

const sliderItemStyles = StyleSheet.create({
  sliderItem: {
    width: width * 0.85, // 85% DEL ANCHO
    height: '90%', // 90% del alto del contenedor
    marginHorizontal: 10, // Margen entre items
    backgroundColor: '#e8f4ff',
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
});

export default sliderItemStyles;