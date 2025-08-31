import { StyleSheet } from 'react-native';
import { COLORS } from '../screens/HomeScreen.css.js';

const buttonStyles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.gray,
  },
});

export default buttonStyles;