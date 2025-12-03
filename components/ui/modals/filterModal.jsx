// components/ui/FilterModal.jsx
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose, onApply, defaultFilters = {}, domain = 'ygo' }) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [expandedDropdown, setExpandedDropdown] = useState(null);

  const handleInputChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleColorToggle = (color) => {
    setFilters((prev) => {
      const currentColors = prev.colors || [];
      const newColors = currentColors.includes(color)
        ? currentColors.filter((c) => c !== color)
        : [...currentColors, color];
      return { ...prev, colors: newColors };
    });
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

  // Custom Dropdown Component
  const CustomDropdown = ({ label, value, options, onChange, borderColor }) => {
    const isExpanded = expandedDropdown === label;
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, { borderColor }]}
          onPress={() => setExpandedDropdown(isExpanded ? null : label)}
        >
          <Text style={[styles.dropdownButtonText, !value && styles.placeholderText]}>
            {selectedOption?.label || `Select ${label}`}
          </Text>
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={[styles.dropdownList, { borderColor }]}>
            <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    value === option.value && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setExpandedDropdown(null);
                  }}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    value === option.value && styles.dropdownOptionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <MaterialCommunityIcons name="check" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // === Yu-Gi-Oh Filters ===
  const renderYugiohFilters = () => (
    <>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Archetype</Text>
        <TextInput
          style={[styles.input, { borderColor: '#8B0000' }]}
          placeholder="e.g., Blue-Eyes, Dark Magician"
          placeholderTextColor="#999"
          value={filters.archetype || ''}
          onChangeText={(text) => handleInputChange('archetype', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>ATK</Text>
        <TextInput
          style={[styles.input, { borderColor: '#DC2626' }]}
          placeholder="e.g., 2500"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={filters.atk || ''}
          onChangeText={(text) => handleInputChange('atk', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>DEF</Text>
        <TextInput
          style={[styles.input, { borderColor: '#2563EB' }]}
          placeholder="e.g., 2000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={filters.def || ''}
          onChangeText={(text) => handleInputChange('def', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Race</Text>
        <TextInput
          style={[styles.input, { borderColor: '#7C3AED' }]}
          placeholder="e.g., Dragon, Spellcaster"
          placeholderTextColor="#999"
          value={filters.race || ''}
          onChangeText={(text) => handleInputChange('race', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Type</Text>
        <TextInput
          style={[styles.input, { borderColor: '#EA580C' }]}
          placeholder="e.g., Effect, Fusion"
          placeholderTextColor="#999"
          value={filters.type || ''}
          onChangeText={(text) => handleInputChange('type', text)}
        />
      </View>
    </>
  );

  // === Pokemon Filters ===
  const renderPokemonFilters = () => {
    const stageOptions = [
      { label: 'All Stages', value: '' },
      { label: 'Basic', value: 'Basic' },
      { label: 'Stage 1', value: 'Stage1' },
      { label: 'Stage 2', value: 'Stage2' },
    ];

    const typeOptions = [
      { label: 'All Types', value: '' },
      { label: 'Colorless', value: 'Colorless' },
      { label: 'Darkness', value: 'Darkness' },
      { label: 'Dragon', value: 'Dragon' },
      { label: 'Grass', value: 'Grass' },
      { label: 'Fairy', value: 'Fairy' },
      { label: 'Fire', value: 'Fire' },
      { label: 'Fighting', value: 'Fighting' },
      { label: 'Lightning', value: 'Lightning' },
      { label: 'Metal', value: 'Metal' },
      { label: 'Psychic', value: 'Psychic' },
      { label: 'Water', value: 'Water' },
    ];

    return (
      <>
        <CustomDropdown
          label="Stage"
          value={filters.stage || ''}
          options={stageOptions}
          onChange={(value) => handleInputChange('stage', value)}
          borderColor="#FFCB05"
        />

        <CustomDropdown
          label="Type"
          value={filters.types || ''}
          options={typeOptions}
          onChange={(value) => handleInputChange('types', value)}
          borderColor="#3B4CCA"
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Set</Text>
          <TextInput
            style={[styles.input, { borderColor: '#EF4444' }]}
            placeholder="e.g., Scarlet & Violet"
            placeholderTextColor="#999"
            value={filters.set || ''}
            onChangeText={(text) => handleInputChange('set', text)}
          />
        </View>
      </>
    );
  };

  // === Riftbound Filters ===
  const renderRiftboundFilters = () => {
    const colorOptions = ['Fury', 'Calm', 'Mind', 'Body', 'Chaos', 'Order'];
    const selectedColors = filters.colors || [];

    const typeOptions = [
      { label: 'All Types', value: '' },
      { label: 'Battlefield', value: 'Battlefield' },
      { label: 'Champion', value: 'Champion' },
      { label: 'Gear', value: 'Gear' },
      { label: 'Legend', value: 'Legend' },
      { label: 'Rune', value: 'Rune' },
      { label: 'Signature', value: 'Signature' },
      { label: 'Spell', value: 'Spell' },
      { label: 'Token', value: 'Token' },
      { label: 'Unit', value: 'Unit' },
    ];

    const colorMap = {
      Fury: '#DC2626',
      Calm: '#15AA71',
      Mind: '#24769A',
      Body: '#F59E0B',
      Chaos: '#8B5CF6',
      Order: '#d36424ff',
    };

    return (
      <>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={[styles.input, { borderColor: '#8B5CF6' }]}
            placeholder="e.g., Ahri, Ionia"
            placeholderTextColor="#999"
            value={filters.tags || ''}
            onChangeText={(text) => handleInputChange('tags', text)}
          />
        </View>

        <CustomDropdown
          label="Type"
          value={filters.type || ''}
          options={typeOptions}
          onChange={(value) => handleInputChange('type', value)}
          borderColor="#06B6D4"
        />

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Might</Text>
          <TextInput
            style={[styles.input, { borderColor: '#DC2626' }]}
            placeholder="e.g., 3"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={filters.might || ''}
            onChangeText={(text) => handleInputChange('might', text)}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Power</Text>
          <TextInput
            style={[styles.input, { borderColor: '#2563EB' }]}
            placeholder="e.g., 2"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={filters.power || ''}
            onChangeText={(text) => handleInputChange('power', text)}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Colors (Select up to 6)</Text>
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => {
              const isSelected = selectedColors.includes(color);
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorChip,
                    { 
                      backgroundColor: isSelected ? colorMap[color] : '#F3F4F6',
                      borderColor: colorMap[color],
                    },
                  ]}
                  onPress={() => handleColorToggle(color)}
                >
                  <Text
                    style={[
                      styles.colorChipText,
                      { color: isSelected ? '#fff' : colorMap[color] },
                    ]}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.title}>Filter Cards</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {domain === 'ygo' && renderYugiohFilters()}
            {domain === 'pkm' && renderPokemonFilters()}
            {domain === 'rb' && renderRiftboundFilters()}
          </ScrollView>

          {/* Fixed Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={handleClear}
            >
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.applyButton]} 
              onPress={handleApply}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '70%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    flex: 1,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: '#fff',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionSelected: {
    backgroundColor: '#ECFDF5',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#374151',
  },
  dropdownOptionTextSelected: {
    fontWeight: '600',
    color: '#10B981',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 90,
  },
  colorChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  clearButton: {
    backgroundColor: '#6B7280',
  },
  applyButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});