import React, { useState, useEffect } from 'react';
import {
  View,
  Text, // 🔥 Asegurar que Text está importado
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { AREA_TYPES, ICONS } from './constants';

const { width } = Dimensions.get('window');

const NavigationPanel = ({ 
  gpsNavigation, 
  todosLosNodos = [], 
  onClose 
}) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [selectedTab, setSelectedTab] = useState('destino');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOrigenSelector, setShowOrigenSelector] = useState(false);

  // 🔥 BUSCAR AUTOMÁTICAMENTE UN TÓTEM EXISTENTE
  const [origenFijo, setOrigenFijo] = useState(null);

  useEffect(() => {
    // 🔥 BUSCAR TÓTEM EN LOS NODOS EXISTENTES
    const buscarTotem = () => {
      // Buscar por tipo 'totem'
      let totem = todosLosNodos.find(node => 
        node && node.tipo === 'totem'
      );
      
      // Si no hay totem, buscar por nombre que contenga "totem"
      if (!totem) {
        totem = todosLosNodos.find(node => 
          node && node.nombre && node.nombre.toLowerCase().includes('totem')
        );
      }
      
      // Si no hay, buscar por nombre que contenga "recepción" o "entrada"
      if (!totem) {
        totem = todosLosNodos.find(node => 
          node && node.nombre && (
            node.nombre.toLowerCase().includes('recepcion') ||
            node.nombre.toLowerCase().includes('recepción') ||
            node.nombre.toLowerCase().includes('entrada') ||
            node.nombre.toLowerCase().includes('principal')
          )
        );
      }
      
      // Si todavía no hay, usar el primer nodo disponible
      if (!totem && todosLosNodos.length > 0) {
        totem = todosLosNodos.find(node => 
          node && node.tipo && 
          ['aula', 'hall', 'escalera'].includes(node.tipo)
        ) || todosLosNodos[0];
      }

      if (totem) {
        setOrigenFijo(totem.id);
        
        // Establecer automáticamente el origen en GPS
        if (gpsNavigation.setOrigen) {
          gpsNavigation.setOrigen(totem.id);
        }
      } else {
        // Usar un ID por defecto como fallback
        setOrigenFijo('totem_principal');
      }
    };

    if (todosLosNodos.length > 0 && !origenFijo) {
      buscarTotem();
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [todosLosNodos, origenFijo]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => onClose());
  };

  // 🔥 FILTRAR NODOS DISPONIBLES (EXCLUYENDO EL ORIGEN FIJO)
  const nodosDisponibles = todosLosNodos.filter(node => 
    node && 
    node.id && 
    node.nombre && 
    node.tipo !== 'pasillo' &&
    node.tipo !== 'punto' &&
    node.id !== origenFijo
  );

  // 🔥 OBTENER INFORMACIÓN DEL ORIGEN FIJO
  const getOrigenFijoInfo = () => {
    const origen = todosLosNodos.find(n => n.id === origenFijo);
    if (origen) {
      return origen;
    }
    
    return {
      id: origenFijo,
      nombre: 'Punto de Inicio',
      tipo: 'totem',
      piso: 'Planta Principal'
    };
  };

  const origenInfo = getOrigenFijoInfo();
  const getNodoInfo = (nodoId) => nodosDisponibles.find(n => n.id === nodoId);
  const destinoInfo = getNodoInfo(gpsNavigation.destino);

  // 🔥 HANDLERS
  const handleSelectDestino = (nodeId) => {
    if (gpsNavigation.setDestino) {
      gpsNavigation.setDestino(nodeId);
    }
  };

  const handleCalcularRuta = () => {
    if (gpsNavigation.calcularRuta) {
      gpsNavigation.calcularRuta();
    }
  };

  const handleLimpiarRuta = () => {
    if (gpsNavigation.limpiarRuta) {
      gpsNavigation.limpiarRuta();
    }
  };

  // 🔥 AUTENTICACIÓN ADMIN
  const handleAdminLogin = () => {
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setShowAdminModal(false);
      setShowOrigenSelector(true);
      setUsername('');
      setPassword('');
      Alert.alert('✅ Acceso concedido', 'Ahora puedes cambiar el origen');
    } else {
      Alert.alert('❌ Error', 'Usuario o contraseña incorrectos');
    }
  };

  const handleCambiarOrigen = (nuevoOrigenId) => {
    setOrigenFijo(nuevoOrigenId);
    if (gpsNavigation.setOrigen) {
      gpsNavigation.setOrigen(nuevoOrigenId);
    }
    setShowOrigenSelector(false);
    setIsAuthenticated(false);
    Alert.alert('✅ Origen actualizado', 'El punto de origen ha sido cambiado');
  };

  // 🔥 RENDERIZAR TARJETAS DE NODOS
  const renderNodeCards = (tipo) => {
    if (tipo === 'origen' && !isAuthenticated) {
      return (
        <View style={styles.adminRequired}>
          <Text style={styles.adminRequiredIcon}>🔒</Text>
          <Text style={styles.adminRequiredText}>Se requiere acceso de administrador</Text>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => setShowAdminModal(true)}
          >
            <Text style={styles.adminButtonText}>Acceder como Admin</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return nodosDisponibles.map(node => (
      <TouchableOpacity
        key={node.id}
        style={[
          styles.nodeCard,
          ((tipo === 'origen' && origenFijo === node.id) || 
           (tipo === 'destino' && gpsNavigation.destino === node.id)) && styles.nodeCardSelected
        ]}
        onPress={() => {
          if (tipo === 'origen') {
            handleCambiarOrigen(node.id);
          } else {
            handleSelectDestino(node.id);
          }
        }}
      >
        <Text style={styles.nodeIcon}>
          {ICONS[node.tipo] || '📍'}
        </Text>
        <Text style={styles.nodeName} numberOfLines={1}>
          {node.nombre}
        </Text>
        <Text style={styles.nodeLocation} numberOfLines={1}>
          {node.piso || 'Planta Principal'}
        </Text>
      </TouchableOpacity>
    ));
  };

  // 🔥 RENDERIZAR INFORMACIÓN DEL NODO SELECCIONADO
  const renderSelectedNode = (nodoInfo, tipo, esOrigenFijo = false) => {
    if (!nodoInfo) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>
            {tipo === 'origen' ? '🏁' : '🎯'}
          </Text>
          <Text style={styles.placeholderText}>
            {tipo === 'origen' ? 'Buscando origen...' : 'Selecciona destino'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.selectedNode}>
        <Text style={styles.selectedIcon}>
          {esOrigenFijo ? '🏁' : ICONS[nodoInfo.tipo] || '📍'}
        </Text>
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedName}>
            {nodoInfo.nombre}
            {esOrigenFijo && <Text style={styles.fixedBadge}> (Origen fijo)</Text>}
          </Text>
          <Text style={styles.selectedDetails}>
            {nodoInfo.piso || 'Planta Principal'}
            {nodoInfo.carrera && nodoInfo.carrera !== 'general' && ` • ${nodoInfo.carrera}`}
          </Text>
        </View>
        {esOrigenFijo && (
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowAdminModal(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Mostrar loading si no se ha encontrado el origen
  if (!origenFijo) {
    return (
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim
          }
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Buscando punto de inicio...</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim
        }
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🧭 Navegación</Text>
          <Text style={styles.subtitle}>Desde punto fijo</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.settingsButtonHeader}
            onPress={() => setShowAdminModal(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ORIGEN FIJO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏁 Punto de Partida</Text>
            <TouchableOpacity 
              style={[styles.tabButton, selectedTab === 'origen' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('origen')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'origen' && styles.tabButtonTextActive]}>
                Cambiar
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.selectedContainer, styles.fixedOriginContainer]}>
            {renderSelectedNode(origenInfo, 'origen', true)}
          </View>

          {selectedTab === 'origen' && (
            <Animated.View style={styles.nodesContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.nodesScroll}
              >
                <View style={styles.nodesRow}>
                  {renderNodeCards('origen')}
                </View>
              </ScrollView>
            </Animated.View>
          )}
        </View>

        {/* DESTINO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Destino Final</Text>
            <TouchableOpacity 
              style={[styles.tabButton, selectedTab === 'destino' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('destino')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'destino' && styles.tabButtonTextActive]}>
                Seleccionar
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectedContainer}>
            {renderSelectedNode(destinoInfo, 'destino')}
          </View>

          {selectedTab === 'destino' && (
            <Animated.View style={styles.nodesContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.nodesScroll}
              >
                <View style={styles.nodesRow}>
                  {renderNodeCards('destino')}
                </View>
              </ScrollView>
            </Animated.View>
          )}
        </View>

        {/* INFORMACIÓN DE RUTA */}
        {gpsNavigation.rutaActual && gpsNavigation.rutaActual.length > 0 && (
          <View style={styles.rutaSection}>
            <View style={styles.rutaHeader}>
              <Text style={styles.rutaTitle}>✅ Ruta Encontrada</Text>
              <View style={styles.rutaBadge}>
                <Text style={styles.rutaSteps}>{gpsNavigation.rutaActual.length} pasos</Text>
              </View>
            </View>
            
            <View style={styles.rutaDetails}>
              <View style={styles.rutaDetail}>
                <Text style={styles.rutaLabel}>Desde:</Text>
                <Text style={styles.rutaValue}>{origenInfo?.nombre}</Text>
              </View>
              <View style={styles.rutaDetail}>
                <Text style={styles.rutaLabel}>Hasta:</Text>
                <Text style={styles.rutaValue}>{destinoInfo?.nombre}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* BOTONES DE ACCIÓN */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleLimpiarRuta}
        >
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <Text style={styles.actionButtonText}>Limpiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            (!origenFijo || !gpsNavigation.destino) && styles.buttonDisabled
          ]}
          onPress={handleCalcularRuta}
          disabled={!origenFijo || !gpsNavigation.destino || gpsNavigation.isCalculando}
        >
          {gpsNavigation.isCalculando ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.actionButtonIcon}>🚀</Text>
              <Text style={styles.actionButtonText}>Calcular Ruta</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL DE AUTENTICACIÓN */}
      <Modal
        visible={showAdminModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔐 Acceso de Administrador</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAdminModal(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Para cambiar el origen fijo</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleAdminLogin}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
              
              <Text style={styles.credentialsHint}>
                Usuario: admin | Contraseña: admin
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE SELECCIÓN DE ORIGEN */}
      <Modal
        visible={showOrigenSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrigenSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Seleccionar Nuevo Origen</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowOrigenSelector(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Elige el nuevo punto de origen fijo</Text>
              
              <View style={styles.adminNodesGrid}>
                {nodosDisponibles.map(node => (
                  <TouchableOpacity
                    key={node.id}
                    style={[
                      styles.adminNodeCard,
                      origenFijo === node.id && styles.adminNodeCardSelected
                    ]}
                    onPress={() => handleCambiarOrigen(node.id)}
                  >
                    <Text style={styles.adminNodeIcon}>
                      {ICONS[node.tipo] || '📍'}
                    </Text>
                    <Text style={styles.adminNodeName}>{node.nombre}</Text>
                    <Text style={styles.adminNodeLocation}>{node.piso}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

// Los estilos se mantienen exactamente igual que en la versión anterior
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  settingsButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonIcon: {
    fontSize: 20,
    fontWeight: '300',
    color: '#666',
  },
  settingsIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  selectedContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  fixedOriginContainer: {
    backgroundColor: '#e8f4fd',
    borderLeftColor: '#34C759',
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
    marginRight: 12,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  selectedNode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  fixedBadge: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  selectedDetails: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 8,
  },
  nodesContainer: {
    marginTop: 8,
  },
  nodesScroll: {
    maxHeight: 140,
  },
  nodesRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  nodeCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginRight: 12,
    width: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  nodeCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC',
  },
  nodeIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  nodeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  nodeLocation: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  adminRequired: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    marginHorizontal: 10,
  },
  adminRequiredIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  adminRequiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    textAlign: 'center',
    marginBottom: 12,
  },
  adminButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adminButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  rutaSection: {
    padding: 20,
    backgroundColor: '#e8f4fd',
    borderRadius: 20,
    marginBottom: 20,
  },
  rutaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rutaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  rutaBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rutaSteps: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  rutaDetails: {
    marginLeft: 4,
  },
  rutaDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  rutaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    width: 60,
  },
  rutaValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#666',
  },
  modalBody: {
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  credentialsHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  adminNodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  adminNodeCard: {
    width: (width - 120) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  adminNodeCardSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: '#007AFF',
  },
  adminNodeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  adminNodeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  adminNodeLocation: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default NavigationPanel;