// src/components/SelectModal.jsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  StyleSheet 
} from 'react-native';
import styles from './SelectModal.css.js';

const SelectModal = ({ 
  visible, 
  onClose, 
  options, 
  onSelect, 
  title,
  selectedValue 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <FlatList
            data={options}
            keyExtractor={(item, index) => {
              return item.id ? item.id.toString() : index.toString();
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedValue && (
                    item.id ? selectedValue.id === item.id : selectedValue === item
                  ) && styles.optionItemSelected
                ]}
                onPress={() => onSelect(item.id || item)} // Pasar solo el ID o el valor
              >
                <Text style={[
                  styles.optionText,
                  selectedValue && (
                    item.id ? selectedValue.id === item.id : selectedValue === item
                  ) && styles.optionTextSelected
                ]}>
                  {item.nombre || item} {/* Mostrar nombre si es objeto, o el valor si es string */}
                </Text>
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SelectModal;