import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const COLORS = {
  primary: '#006cdfff',
  white: '#ffffff',
  grayLight: '#f8f9fa',
  gray: '#6c757d',
  grayDark: '#343a40',
  black: '#000000',
  danger: '#e53e3e',
  dangerLight: '#fed7d7',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  borderLight: '#e9ecef',
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: screenHeight * 0.85,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.grayDark,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  /* Estilos para contenido de imagen */
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  /* Estilos para contenido de texto */
  textContent: {
    flex: 1,
    padding: 24,
  },
  titleSection: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  announcementTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  /* Estilos para badge de importancia */
  importantBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: COLORS.danger,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  importantIcon: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '800',
  },
  importantText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  /* Estilos para descripción */
  descriptionSection: {
    flex: 1,
  },
  fullDescriptionText: {
    fontSize: 17,
    color: COLORS.grayDark,
    lineHeight: 28,
    textAlign: 'left',
    letterSpacing: 0.1,
  },
  /* Nuevos estilos para metadata */
  metadataSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
});

export default styles;