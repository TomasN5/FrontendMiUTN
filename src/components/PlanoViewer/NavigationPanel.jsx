import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { AREA_TYPES, ICONS } from './constants';

const { width } = Dimensions.get('window');

const NavigationPanel = ({ 
  gpsNavigation, 
  todosLosNodos = [], 
  onClose 
}) => {
  
  // Filtrar nodos que se pueden usar como origen/destino
  const nodosDisponibles = todosLosNodos.filter(node => 
    node && 
    node.id && 
    node.nombre && 
    node.tipo !== 'pasillo' &&  // No mostrar pasillos
    node.tipo !== 'punto'       // No mostrar puntos normales (solo especiales)
  );

  // Obtener información del nodo seleccionado
  const getNodoInfo = (nodoId) => {
    return nodosDisponibles.find(n => n.id === nodoId);
  };

  const origenInfo = getNodoInfo(gpsNavigation.origen);
  const destinoInfo = getNodoInfo(gpsNavigation.destino);

  // 🔥 CORREGIDO: Funciones para manejar la selección
  const handleSelectOrigen = (nodeId) => {
    console.log('📍 Seleccionando origen:', nodeId);
    if (gpsNavigation.setOrigen) {
      gpsNavigation.setOrigen(nodeId);
    } else {
      console.error('❌ setOrigen no está definido en gpsNavigation');
    }
  };

  const handleSelectDestino = (nodeId) => {
    console.log('🎯 Seleccionando destino:', nodeId);
    if (gpsNavigation.setDestino) {
      gpsNavigation.setDestino(nodeId);
    } else {
      console.error('❌ setDestino no está definido en gpsNavigation');
    }
  };

  const handleCalcularRuta = () => {
    console.log('🧭 Calculando ruta...');
    if (gpsNavigation.calcularRuta) {
      gpsNavigation.calcularRuta();
    } else {
      console.error('❌ calcularRuta no está definido en gpsNavigation');
    }
  };

  const handleLimpiarRuta = () => {
    console.log('🗑️ Limpiando ruta...');
    if (gpsNavigation.limpiarRuta) {
      gpsNavigation.limpiarRuta();
    } else {
      console.error('❌ limpiarRuta no está definido en gpsNavigation');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧭 Navegación GPS</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selector de Origen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Origen</Text>
          <View style={styles.selectedInfoContainer}>
            <Text style={styles.selectedInfo}>
              {origenInfo ? (
                <Text>
                  <Text style={styles.selectedIcon}>{ICONS[origenInfo.tipo] || '📍'}</Text>
                  {' '}{origenInfo.nombre}
                  {'\n'}
                  <Text style={styles.selectedDetails}>
                    {origenInfo.carrera} • {origenInfo.piso}
                  </Text>
                </Text>
              ) : (
                'Selecciona un origen'
              )}
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.nodesScroll}
          >
            <View style={styles.nodesContainer}>
              {nodosDisponibles.map(node => (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeButton,
                    gpsNavigation.origen === node.id && styles.nodeButtonSelected
                  ]}
                  onPress={() => handleSelectOrigen(node.id)} // 🔥 CORREGIDO
                >
                  <Text style={styles.nodeIcon}>
                    {ICONS[node.tipo] || '📍'}
                  </Text>
                  <Text style={styles.nodeName} numberOfLines={2}>
                    {node.nombre}
                  </Text>
                  <Text style={styles.nodeDetails} numberOfLines={1}>
                    {node.piso}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Selector de Destino */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destino</Text>
          <View style={styles.selectedInfoContainer}>
            <Text style={styles.selectedInfo}>
              {destinoInfo ? (
                <Text>
                  <Text style={styles.selectedIcon}>{ICONS[destinoInfo.tipo] || '📍'}</Text>
                  {' '}{destinoInfo.nombre}
                  {'\n'}
                  <Text style={styles.selectedDetails}>
                    {destinoInfo.carrera} • {destinoInfo.piso}
                  </Text>
                </Text>
              ) : (
                'Selecciona un destino'
              )}
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.nodesScroll}
          >
            <View style={styles.nodesContainer}>
              {nodosDisponibles.map(node => (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeButton,
                    gpsNavigation.destino === node.id && styles.nodeButtonSelected
                  ]}
                  onPress={() => handleSelectDestino(node.id)} // 🔥 CORREGIDO
                >
                  <Text style={styles.nodeIcon}>
                    {ICONS[node.tipo] || '📍'}
                  </Text>
                  <Text style={styles.nodeName} numberOfLines={2}>
                    {node.nombre}
                  </Text>
                  <Text style={styles.nodeDetails} numberOfLines={1}>
                    {node.piso}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Información de la ruta */}
        {gpsNavigation.rutaActual.length > 0 && (
          <View style={styles.rutaSection}>
            <Text style={styles.sectionTitle}>Ruta Encontrada 🎉</Text>
            <View style={styles.rutaInfo}>
              <Text style={styles.rutaSteps}>
                {gpsNavigation.rutaActual.length} pasos
              </Text>
              <View style={styles.rutaDetails}>
                <Text style={styles.rutaDetailItem}>
                  <Text style={styles.rutaLabel}>Desde:</Text> {origenInfo?.nombre}
                </Text>
                <Text style={styles.rutaDetailItem}>
                  <Text style={styles.rutaLabel}>Hasta:</Text> {destinoInfo?.nombre}
                </Text>
                <Text style={styles.rutaDetailItem}>
                  <Text style={styles.rutaLabel}>Pisos:</Text> {origenInfo?.piso} → {destinoInfo?.piso}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Disponibles</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{nodosDisponibles.length}</Text>
              <Text style={styles.statLabel}>Locaciones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {nodosDisponibles.filter(n => n.tipo === AREA_TYPES.AULA).length}
              </Text>
              <Text style={styles.statLabel}>Aulas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {nodosDisponibles.filter(n => n.tipo === AREA_TYPES.ESCALERA).length}
              </Text>
              <Text style={styles.statLabel}>Escaleras</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.calculateButton,
            (!gpsNavigation.origen || !gpsNavigation.destino) && styles.buttonDisabled
          ]}
          onPress={handleCalcularRuta} // 🔥 CORREGIDO
          disabled={!gpsNavigation.origen || !gpsNavigation.destino || gpsNavigation.isCalculando}
        >
          {gpsNavigation.isCalculando ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>🚀 Calcular Ruta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleLimpiarRuta} // 🔥 CORREGIDO
        >
          <Text style={styles.actionButtonText}>🗑️ Limpiar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  content: {
    flex: 1
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  selectedInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  selectedInfo: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  selectedIcon: {
    fontSize: 16
  },
  selectedDetails: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  nodesScroll: {
    maxHeight: 120
  },
  nodesContainer: {
    flexDirection: 'row',
    paddingVertical: 5
  },
  nodeButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginRight: 10,
    width: 100,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  nodeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC'
  },
  nodeIcon: {
    fontSize: 20,
    marginBottom: 6
  },
  nodeName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2
  },
  nodeDetails: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center'
  },
  rutaSection: {
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  rutaInfo: {
    marginTop: 5
  },
  rutaSteps: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8
  },
  rutaDetails: {
    marginLeft: 5
  },
  rutaDetailItem: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18
  },
  rutaLabel: {
    fontWeight: '600',
    color: '#007AFF'
  },
  statsSection: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 10
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50
  },
  calculateButton: {
    backgroundColor: '#34C759'
  },
  clearButton: {
    backgroundColor: '#FF3B30'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  }
});

export default NavigationPanel;