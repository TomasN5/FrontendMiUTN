import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

const ControlPanel = ({
  planoActual,
  infoPlanoActual,
  carreraActual,
  carrerasDisponibles,
  onCambiarCarrera,
  onCambiarPlano,
  onAvanzarPlano,
  onRetrocederPlano,
  onShowNavigation,
  stats = {}
}) => {
  return (
    <View style={styles.container}>
      {/* Selector de carrera */}
      <View style={styles.section}>
        <Text style={styles.label}>Carrera:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.carreraScroll}
        >
          <View style={styles.carreraContainer}>
            {carrerasDisponibles.map(carrera => (
              <TouchableOpacity
                key={carrera}
                style={[
                  styles.carreraButton,
                  carreraActual === carrera && styles.carreraButtonActive
                ]}
                onPress={() => onCambiarCarrera(carrera)}
              >
                <Text style={[
                  styles.carreraText,
                  carreraActual === carrera && styles.carreraTextActive
                ]}>
                  {carrera.charAt(0).toUpperCase() + carrera.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Navegación entre planos */}
      <View style={styles.planoNavigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            !infoPlanoActual?.tieneAnterior && styles.navButtonDisabled
          ]}
          onPress={onRetrocederPlano}
          disabled={!infoPlanoActual?.tieneAnterior}
        >
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>

        <View style={styles.planoInfo}>
          <Text style={styles.planoNombre} numberOfLines={1}>
            {planoActual?.nombre}
          </Text>
          {infoPlanoActual && (
            <Text style={styles.planoContador}>
              {infoPlanoActual.numero}/{infoPlanoActual.total}
            </Text>
          )}
          <Text style={styles.planoStats}>
            {stats.areas} áreas • {stats.puntos} puntos
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            !infoPlanoActual?.tieneSiguiente && styles.navButtonDisabled
          ]}
          onPress={onAvanzarPlano}
          disabled={!infoPlanoActual?.tieneSiguiente}
        >
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de navegación GPS */}
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={onShowNavigation}
      >
        <Text style={styles.gpsButtonText}>🧭 Navegación GPS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  section: {
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333'
  },
  carreraScroll: {
    maxHeight: 40
  },
  carreraContainer: {
    flexDirection: 'row'
  },
  carreraButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center'
  },
  carreraButtonActive: {
    backgroundColor: '#007AFF'
  },
  carreraText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333'
  },
  carreraTextActive: {
    color: 'white'
  },
  planoNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  navButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center'
  },
  navButtonDisabled: {
    backgroundColor: '#ccc'
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  planoInfo: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10
  },
  planoNombre: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333'
  },
  planoContador: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  gpsButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  gpsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default ControlPanel;