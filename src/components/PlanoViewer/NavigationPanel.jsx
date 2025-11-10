// NavigationPanel.jsx - VERSIÓN UNIFICADA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

const { width, height } = Dimensions.get('window');

const NavigationPanel = ({ 
  gpsNavigation, 
  todosLosNodos = [], 
  onClose,
  planoActual,
  getOrigenFijoInfo,
  origenFijo,
  onOrigenFijoChange
}) => {
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOrigenSelector, setShowOrigenSelector] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    destacados: true, // 🔥 MODIFICADO: Sección destacados expandida por defecto
    aulas: false,
    departamentos: false,
    escaleras: false,
    servicios: false,
    emergencias: false,
    otros: false
  });

  const [origenFijoLocal, setOrigenFijoLocal] = useState(origenFijo);

  useEffect(() => {
    setOrigenFijoLocal(origenFijo);
  }, [origenFijo]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        tension: 70,
        friction: 12
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: height,
        duration: 400,
        useNativeDriver: true,
        tension: 70,
        friction: 12
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => onClose());
  };

  const nodosDisponibles = todosLosNodos.filter(node => 
    node && 
    node.id && 
    node.nombre && 
    node.tipo !== 'pasillo' &&
    node.tipo !== 'punto' &&
    (node.tipo === 'aula' || node.tipo === 'hall' || node.tipo === 'departamento' || 
     node.tipo === 'area_generica' || node.tipo === 'bano' || node.tipo === 'escalera' ||
     node.tipo === 'extintor' || node.tipo === 'salida_emergencia' || 
     node.tipo === 'botiquin' || node.tipo === 'desfibrilador' || 
     node.tipo === 'alarma' || node.tipo === 'totem') &&
    node.id !== origenFijoLocal
  );

  // 🔥 MODIFICADO: Obtener nodos destacados por el atributo "destacado"
  const getDestacados = () => {
    return nodosDisponibles.filter(node => 
      node && node.destacado === true // 🔥 CAMBIO: Usar atributo destacado en lugar de solo departamentos
    );
  };

  // 🔥 MODIFICADO: Obtener información de carrera del nodo
  const getCarreraInfo = (node) => {
    if (!node) return 'General';
    
    if (node.carrera && node.carrera !== 'general') {
      return node.carrera;
    }
    
    if (node.planoId) {
      const planoId = node.planoId.toLowerCase();
      if (planoId.includes('sistemas')) return 'Sistemas';
      if (planoId.includes('quimica')) return 'Química';
      if (planoId.includes('mecanica')) return 'Mecánica';
      if (planoId.includes('civil')) return 'Civil';
      if (planoId.includes('industrial')) return 'Industrial';
      if (planoId.includes('electrica')) return 'Eléctrica';
    }
    
    return 'General';
  };

  // 🔥 MODIFICADO: Organizar nodos por tipo, piso Y carrera
  const getNodosOrganizados = () => {
    const organizados = {
      aulas: [],
      departamentos: [],
      escaleras: [],
      servicios: [],
      emergencias: [],
      otros: []
    };

    nodosDisponibles.forEach(node => {
      if (!node || !node.tipo) return;

      if (node.tipo === 'escalera') {
        const nodePiso = node.piso || '';
        const planoPiso = planoActual?.piso || '';
        
        if (!planoPiso || nodePiso.includes(planoPiso) || planoPiso.includes(nodePiso) || !nodePiso) {
          organizados.escaleras.push(node);
        }
        return;
      }

      switch (node.tipo) {
        case 'aula':
          organizados.aulas.push(node);
          break;
        case 'departamento':
          organizados.departamentos.push(node);
          break;
        case 'bano':
        case 'hall':
        case 'area_generica':
          organizados.servicios.push(node);
          break;
        case 'extintor':
        case 'salida_emergencia':
        case 'botiquin':
        case 'desfibrilador':
        case 'alarma':
          organizados.emergencias.push(node);
          break;
        default:
          organizados.otros.push(node);
          break;
      }
    });

    return organizados;
  };

  // 🔥 MODIFICADO: Agrupar nodos por piso Y carrera
  const getNodosPorPiso = (nodos) => {
    const porPiso = {};
    
    nodos.forEach(node => {
      const piso = node.piso || 'Sin especificar';
      const carrera = getCarreraInfo(node);
      
      const clavePiso = `${piso} • ${carrera}`;
      
      if (!porPiso[clavePiso]) {
        porPiso[clavePiso] = {
          nodos: [],
          carrera: carrera,
          pisoBase: piso
        };
      }
      porPiso[clavePiso].nodos.push(node);
    });

    return porPiso;
  };

  const origenInfo = getOrigenFijoInfo ? getOrigenFijoInfo() : {
    id: origenFijoLocal || 'totem_principal',
    nombre: 'Punto de Inicio',
    tipo: 'totem',
    piso: 'Planta Principal'
  };

  const getNodoInfo = (nodoId) => nodosDisponibles.find(n => n.id === nodoId);
  const destinoInfo = getNodoInfo(gpsNavigation.destino);
  const destacados = getDestacados(); // 🔥 CAMBIO: Usar destacados en lugar de departamentos
  const nodosOrganizados = getNodosOrganizados();

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
    setOrigenFijoLocal(nuevoOrigenId);
    
    if (onOrigenFijoChange) {
      onOrigenFijoChange(nuevoOrigenId);
    }
    
    if (gpsNavigation.setOrigen) {
      gpsNavigation.setOrigen(nuevoOrigenId);
    }
    
    setShowOrigenSelector(false);
    setIsAuthenticated(false);
    
    Alert.alert('✅ Origen actualizado', 'El punto de origen ha sido cambiado exitosamente');
  };

  // 🔥 NUEVO: Renderizar información de segmentos de ruta
  const renderSegmentInfo = () => {
    if (!gpsNavigation.segmentosRuta || gpsNavigation.segmentosRuta.length <= 1) {
      return null;
    }

    const totalSegmentos = gpsNavigation.segmentosRuta.length;
    const segmentoActual = (gpsNavigation.segmentoActualIndex || 0) + 1;

    return (
      <View style={styles.segmentInfoContainer}>
        <View style={styles.segmentInfoHeader}>
          <Text style={styles.segmentInfoIcon}>🔄</Text>
          <Text style={styles.segmentInfoTitle}>Ruta Multiplanta</Text>
        </View>
        <Text style={styles.segmentInfoText}>
          La ruta está dividida en {totalSegmentos} segmentos
        </Text>
        <Text style={styles.segmentInfoSubtext}>
          Usa el botón "Continuar" en el mapa para navegar entre pisos ({segmentoActual}/{totalSegmentos})
        </Text>
        
        <View style={styles.segmentsList}>
          {gpsNavigation.segmentosRuta.map((segmento, index) => (
            <View 
              key={index} 
              style={[
                styles.segmentItem,
                index === gpsNavigation.segmentoActualIndex && styles.segmentItemActive
              ]}
            >
              <View style={styles.segmentIndicator}>
                <Text style={styles.segmentNumber}>{index + 1}</Text>
              </View>
              <View style={styles.segmentInfo}>
                <Text style={styles.segmentPlano}>
                  Plano: {segmento.planoId || 'Sin ID'}
                </Text>
                <Text style={styles.segmentDetails}>
                  {segmento.nodos.length} nodos • 
                  {segmento.tieneEscalera ? ' Con escalera' : ' Sin escalera'}
                </Text>
              </View>
              {index === gpsNavigation.segmentoActualIndex && (
                <Text style={styles.segmentCurrent}>Actual</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // 🔥 MODIFICADO: Renderizar sección destacados con áreas y puntos destacados
  const renderDestacadosSection = () => {
    if (destacados.length === 0) {
      return null;
    }

    return (
      <View style={styles.categoriaSection}>
        <TouchableOpacity 
          style={[
            styles.categoriaHeader,
            expandedSections.destacados && styles.categoriaHeaderExpanded
          ]}
          onPress={() => toggleSection('destacados')}
        >
          <View style={styles.categoriaTitleContainer}>
            <View style={[styles.categoriaIconContainer, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.categoriaIcon}>⭐</Text>
            </View>
            <View style={styles.categoriaTextContainer}>
              <Text style={styles.categoriaTitle}>Destacados</Text>
              <Text style={styles.categoriaSubtitle}>{destacados.length} elementos destacados</Text>
            </View>
          </View>
          <View style={[
            styles.expandButton,
            expandedSections.destacados && styles.expandButtonExpanded
          ]}>
            <Text style={styles.expandIcon}>
              {expandedSections.destacados ? '▼' : '►'}
            </Text>
          </View>
        </TouchableOpacity>

        {expandedSections.destacados && (
          <View style={styles.categoriaContent}>
            <View style={styles.destacadosGrid}>
              {destacados.map((node, index) => (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.destacadoCard,
                    gpsNavigation.destino === node.id && styles.destacadoCardSelected
                  ]}
                  onPress={() => handleSelectDestino(node.id)}
                >
                  <View style={styles.destacadoCardContent}>
                    <View style={[
                      styles.destacadoIconContainer,
                      { backgroundColor: getCardColor(node.tipo) }
                    ]}>
                      <Text style={styles.destacadoIcon}>
                        {ICONS[node.tipo] || '⭐'}
                      </Text>
                    </View>
                    <View style={styles.destacadoTextContainer}>
                      <Text style={styles.destacadoName} numberOfLines={2}>
                        {getNombreCorto(node.nombre, node.tipo)}
                      </Text>
                      <Text style={styles.destacadoLocation} numberOfLines={1}>
                        {node.piso || 'Planta Principal'}
                      </Text>
                      <View style={styles.destacadoMetaContainer}>
                        <Text style={styles.destacadoCarrera} numberOfLines={1}>
                          {getCarreraInfo(node)}
                        </Text>
                        <Text style={styles.destacadoTipo} numberOfLines={1}>
                          {getTipoDisplayName(node.tipo)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {gpsNavigation.destino === node.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  // 🔥 MODIFICADO: Renderizar sección organizada con información de carrera
  const renderSeccionOrganizada = (titulo, icono, nodos, sectionKey, color) => {
    if (nodos.length === 0) return null;

    const isExpanded = expandedSections[sectionKey];
    const nodosPorPiso = getNodosPorPiso(nodos);

    return (
      <View style={styles.categoriaSection}>
        <TouchableOpacity 
          style={[
            styles.categoriaHeader,
            isExpanded && styles.categoriaHeaderExpanded
          ]}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.categoriaTitleContainer}>
            <View style={[styles.categoriaIconContainer, { backgroundColor: color }]}>
              <Text style={styles.categoriaIcon}>{icono}</Text>
            </View>
            <View style={styles.categoriaTextContainer}>
              <Text style={styles.categoriaTitle}>{titulo}</Text>
              <Text style={styles.categoriaSubtitle}>{nodos.length} elementos</Text>
            </View>
          </View>
          <View style={[
            styles.expandButton,
            isExpanded && styles.expandButtonExpanded
          ]}>
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '►'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoriaContent}>
            {Object.entries(nodosPorPiso).map(([clavePiso, dataPiso]) => (
              <View key={clavePiso} style={styles.pisoSection}>
                <View style={styles.pisoHeader}>
                  <View style={styles.pisoDot} />
                  <View style={styles.pisoTitleContainer}>
                    <Text style={styles.pisoTitle}>{dataPiso.pisoBase}</Text>
                    <Text style={styles.pisoCarrera}>{dataPiso.carrera}</Text>
                  </View>
                  <Text style={styles.pisoCount}>{dataPiso.nodos.length}</Text>
                </View>
                <View style={styles.pisoGrid}>
                  {dataPiso.nodos.map((node, index) => (
                    <TouchableOpacity
                      key={node.id}
                      style={[
                        styles.nodoCard,
                        gpsNavigation.destino === node.id && styles.nodoCardSelected
                      ]}
                      onPress={() => handleSelectDestino(node.id)}
                    >
                      <View style={[
                        styles.nodoIconContainer,
                        { backgroundColor: getCardColor(node.tipo) }
                      ]}>
                        <Text style={styles.nodoIcon}>
                          {ICONS[node.tipo] || '📍'}
                        </Text>
                      </View>
                      <Text style={styles.nodoName} numberOfLines={2}>
                        {getNombreCorto(node.nombre, node.tipo)}
                      </Text>
                      {gpsNavigation.destino === node.id && (
                        <View style={styles.selectedBadgeSmall}>
                          <Text style={styles.selectedBadgeText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // 🔥 MODIFICADO: Renderizar todas las secciones en una sola vista
  const renderTodasLasSecciones = () => {
    if (nodosDisponibles.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No hay destinos disponibles</Text>
          <Text style={styles.emptyStateText}>No se encontraron destinos en este plano</Text>
        </View>
      );
    }

    return (
      <View style={styles.todasLasSecciones}>
        {/* 🔥 DESTACADOS PRIMERO - Ahora muestra todos los nodos con atributo destacado */}
        {renderDestacadosSection()}
        
        {/* 🔥 TODAS LAS OTRAS CATEGORÍAS DESPUÉS */}
        {renderSeccionOrganizada('Aulas', '🏫', nodosOrganizados.aulas, 'aulas', '#4CAF50')}
        {renderSeccionOrganizada('Departamentos', '🏛️', nodosOrganizados.departamentos, 'departamentos', '#2196F3')}
        {renderSeccionOrganizada(`Escaleras`, '🪜', nodosOrganizados.escaleras, 'escaleras', '#795548')}
        {renderSeccionOrganizada('Servicios', '🔧', nodosOrganizados.servicios, 'servicios', '#FF9800')}
        {renderSeccionOrganizada('Seguridad', '🚨', nodosOrganizados.emergencias, 'emergencias', '#FF4444')}
        {nodosOrganizados.otros.length > 0 && renderSeccionOrganizada('Otros', '📦', nodosOrganizados.otros, 'otros', '#9E9E9E')}
      </View>
    );
  };

  const renderSelectedNode = (nodoInfo, tipo, esOrigenFijo = false) => {
    if (!nodoInfo) {
      return (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>
            {tipo === 'origen' ? '🏁' : '🎯'}
          </Text>
          <View style={styles.placeholderTextContainer}>
            <Text style={styles.placeholderTitle}>
              {tipo === 'origen' ? 'Buscando origen...' : 'Selecciona destino'}
            </Text>
            <Text style={styles.placeholderSubtitle}>
              {tipo === 'origen' ? 'Estableciendo punto de partida' : 'Elige tu destino final'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[
        styles.selectedNode,
        esOrigenFijo && styles.selectedNodeOrigen
      ]}>
        <View style={[
          styles.selectedIconContainer,
          { backgroundColor: getCardColor(nodoInfo.tipo) }
        ]}>
          <Text style={styles.selectedIcon}>
            {esOrigenFijo ? '🏁' : ICONS[nodoInfo.tipo] || '📍'}
          </Text>
        </View>
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedName}>
            {nodoInfo.nombre}
            {esOrigenFijo && <Text style={styles.fixedBadge}> • Origen fijo</Text>}
          </Text>
          <Text style={styles.selectedDetails}>
            {nodoInfo.piso || 'Planta Principal'}
            {getCarreraInfo(nodoInfo) !== 'General' && ` • ${getCarreraInfo(nodoInfo)}`}
          </Text>
        </View>
      </View>
    );
  };

  if (!origenFijoLocal) {
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Navegación</Text>
          <Text style={styles.subtitle}>Encuentra tu camino fácilmente</Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Información de segmentos de ruta */}
        {renderSegmentInfo()}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📍 Punto de Partida</Text>
            <View style={styles.originBadge}>
              <Text style={styles.originBadgeText}>Fijo</Text>
            </View>
          </View>
          {renderSelectedNode(origenInfo, 'origen', true)}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🎯 Destino Final</Text>
            {destinoInfo && (
              <View style={styles.destinationBadge}>
                <Text style={styles.destinationBadgeText}>Seleccionado</Text>
              </View>
            )}
          </View>
          {renderSelectedNode(destinoInfo, 'destino')}
        </View>

        {/* 🔥 UNIFICADO: Todas las secciones en una vista */}
        {renderTodasLasSecciones()}

      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleLimpiarRuta}
          disabled={!gpsNavigation.destino}
        >
          <Text style={styles.actionButtonText}>
            {gpsNavigation.destino ? 'Limpiar Destino' : 'Sin Destino'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            (!origenFijoLocal || !gpsNavigation.destino) && styles.buttonDisabled
          ]}
          onPress={handleCalcularRuta}
          disabled={!origenFijoLocal || !gpsNavigation.destino || gpsNavigation.isCalculando}
        >
          {gpsNavigation.isCalculando ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.actionButtonText}>Calcular Ruta</Text>
            </>
          )}
        </TouchableOpacity>

      </View>

      {/* Modales (mantener igual) */}
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
                      origenFijoLocal === node.id && styles.adminNodeCardSelected
                    ]}
                    onPress={() => handleCambiarOrigen(node.id)}
                  >
                    <Text style={styles.adminNodeIcon}>
                      {ICONS[node.tipo] || '📍'}
                    </Text>
                    <Text style={styles.adminNodeName}>{node.nombre}</Text>
                    <Text style={styles.adminNodeLocation}>
                      {node.piso || 'Sin piso'} • {getCarreraInfo(node)}
                    </Text>
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

// 🔥 NUEVA FUNCIÓN: Obtener nombre display para el tipo
const getTipoDisplayName = (tipo) => {
  const tipoNombres = {
    'aula': 'Aula',
    'departamento': 'Departamento',
    'escalera': 'Escalera',
    'bano': 'Baño',
    'hall': 'Hall',
    'area_generica': 'Área',
    'extintor': 'Extintor',
    'salida_emergencia': 'Salida',
    'botiquin': 'Botiquín',
    'desfibrilador': 'Desfibrilador',
    'alarma': 'Alarma',
    'totem': 'Tótem'
  };
  return tipoNombres[tipo] || tipo;
};

// FUNCIONES AUXILIARES (mantener igual)
const getNombreCorto = (nombre, tipo) => {
  if (!nombre) return '';
  
  if (tipo === 'aula' && nombre.toLowerCase().includes('aula')) {
    return nombre.replace(/aula\s*/i, '');
  }
  
  if (tipo === 'departamento') {
    if (nombre.toLowerCase().includes('departamento')) {
      return nombre.replace(/departamento\s*/i, 'Depto.');
    }
    return nombre;
  }
  
  if (tipo === 'extintor') {
    return nombre.replace(/extintor\s*/i, 'Matafuego');
  }
  
  if (nombre.length > 20) {
    return nombre.substring(0, 18) + '...';
  }
  
  return nombre;
};

const getCardColor = (tipo) => {
  const colors = {
    'aula': '#4CAF50',
    'departamento': '#2196F3',
    'escalera': '#795548',
    'bano': '#9C27B0',
    'hall': '#FF9800',
    'area_generica': '#9E9E9E',
    'extintor': '#FF4444',
    'salida_emergencia': '#00AA00',
    'botiquin': '#4444FF',
    'desfibrilador': '#FFAA00',
    'alarma': '#FF00FF',
    'totem': '#009688'
  };
  return colors[tipo] || '#607D8B';
};

// ESTILOS COMPLETOS CON CAMBIOS MINIMOS
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonIcon: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  // 🔥 ELIMINADO: tabsContainer styles
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 16,
  },
  // 🔥 NUEVO: Contenedor para todas las secciones
  todasLasSecciones: {
    marginTop: 8,
  },
  // ... el resto de los estilos se mantienen igual ...
  // (segmentInfoContainer, card, selectedNode, categoriaSection, etc.)
  segmentInfoContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  segmentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentInfoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  segmentInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  segmentInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  segmentInfoSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  segmentsList: {
    marginTop: 8,
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  segmentItemActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007AFF',
  },
  segmentIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  segmentNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  segmentInfo: {
    flex: 1,
  },
  segmentPlano: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  segmentDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  segmentCurrent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  originBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  originBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  destinationBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  destinationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  selectedNode: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedNodeOrigen: {
    backgroundColor: '#F0F9FF',
    borderColor: '#007AFF',
  },
  selectedIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  fixedBadge: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  selectedDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
  },
  placeholderIcon: {
    fontSize: 24,
    marginRight: 16,
    opacity: 0.5,
  },
  placeholderTextContainer: {
    flex: 1,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoriaSection: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  categoriaHeaderExpanded: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoriaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoriaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoriaIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoriaTextContainer: {
    flex: 1,
  },
  categoriaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  categoriaSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonExpanded: {
    backgroundColor: '#007AFF',
  },
  expandIcon: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  categoriaContent: {
    padding: 16,
  },
  destacadosGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  destacadoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  destacadoCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
    transform: [{ scale: 1.02 }],
  },
  destacadoCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destacadoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  destacadoIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  destacadoTextContainer: {
    flex: 1,
  },
  destacadoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'left',
    marginBottom: 4,
  },
  destacadoLocation: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'left',
    marginBottom: 4,
  },
  destacadoMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destacadoCarrera: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'left',
    fontStyle: 'italic',
  },
  destacadoTipo: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'left',
  },
  pisoSection: {
    marginBottom: 16,
  },
  pisoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  pisoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  pisoTitleContainer: {
    flex: 1,
  },
  pisoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pisoCarrera: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
    fontStyle: 'italic',
  },
  pisoCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pisoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nodoCard: {
    width: (width - 112) / 3,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  nodoCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#007AFF',
  },
  nodoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  nodoIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nodoName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    minHeight: 28,
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBadgeSmall: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    marginVertical: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6B7280',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#FFFFFF',
  },
  actionButtonText: {
    color: '#FFFFFF',
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
    color: '#6B7280',
    textAlign: 'center',
  },
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