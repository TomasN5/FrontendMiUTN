import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#006cdfff',
  primaryLight: '#e8f4ff',
  white: '#ffffff',
  grayLight: '#f5f5f5',
  gray: '#666666',
  grayDark: '#333333',
  black: '#000000',
};

export const SIZES = {
  width,
  height,
};

// Variables para el slider
const SLIDER_ITEM_WIDTH = width * 0.85;
const SLIDER_ITEM_MARGIN = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  time: {
    fontSize: 18,
    color: COLORS.black,
  },
  buttonsContainer: {
    height: height * 0.40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
  },
   giantButton: {
    width: width * 0.45,
    height: height * 0.18, // Aumenté la altura para que quepa la imagen
    borderRadius: 15,
    backgroundColor:COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 15, // Agregar padding para mejor espaciado
  },
  giantButtonText: {
    fontSize: 18, // Reducir un poco el texto
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 8, // Espacio entre imagen y texto
  },
  sliderContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sliderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.black,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
  },
  // Exportar variables para el cálculo del scroll
  sliderItemWidth: SLIDER_ITEM_WIDTH,
  sliderItemMargin: SLIDER_ITEM_MARGIN,
});

export default styles;