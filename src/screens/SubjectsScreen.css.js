import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#006cdfff',
  primaryLight: '#e8f4ff',
  white: '#ffffff',
  grayLight: '#f5f5f5',
  gray: '#666666',
  grayDark: '#333333',
  black: '#000000',
  border: '#e0e0e0',
  success: '#28a745',
  warning: '#ffc107',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.grayLight,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSpacer: {
    width: 40, // Para balancear el diseño
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
    marginTop: 15,
  },
  selectButton: {
    padding: 15,
    backgroundColor: COLORS.grayLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
  },
  selectButtonText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  selectButtonTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectButtonDisabled: {
    backgroundColor: COLORS.grayLight,
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  selectButtonTextDisabled: {
    color: COLORS.gray,
    opacity: 0.5,
  },
  buscarButton: {
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buscarButtonText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  framesSection: {
    marginBottom: 20,
  },
  materiaContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 15,
    position: 'relative',
  },
  materiaContent: {
    // Sin scroll horizontal, todo visible
  },
  materiaNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'left',
  },
  horariosContainer: {
    marginBottom: 12,
  },
  horariosLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 4,
  },
  horarioText: {
    fontSize: 13,
    color: COLORS.grayDark,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.grayDark,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 8,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emailIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#006cdfff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emailIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.white,
  },
});

export default styles;