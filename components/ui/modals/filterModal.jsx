// components/ui/FilterModal.jsx
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';

const FilterModal = ({ visible, onClose, onApply, defaultFilters = {} }) => {
  const [filters, setFilters] = useState(defaultFilters);

  const handleInputChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onApply({});
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.title}>Filter Cards</Text>

            {/* Example filter fields — extend as needed */}
            <TextInput
              style={styles.input}
              placeholder="Archetype"
              value={filters.archetype || ''}
              onChangeText={(text) => handleInputChange('archetype', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="ATK"
              keyboardType="numeric"
              value={filters.atk || ''}
              onChangeText={(text) => handleInputChange('atk', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="DEF"
              keyboardType="numeric"
              value={filters.def || ''}
              onChangeText={(text) => handleInputChange('def', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Race"
              value={filters.race || ''}
              onChangeText={(text) => handleInputChange('race', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Type"
              value={filters.type || ''}
              onChangeText={(text) => handleInputChange('type', text)}
            />

            {/* Apply / Clear buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApply}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearButton: {
    backgroundColor: '#ccc',
  },
  applyButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
