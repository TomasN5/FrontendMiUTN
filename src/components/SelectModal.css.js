import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0056b3',
  white: '#ffffff',
  grayLight: '#f5f5f5',
  gray: '#666666',
  grayDark: '#333333',
  black: '#000000',
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  optionItemSelected: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.grayDark,
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: COLORS.grayLight,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
});

export default styles;