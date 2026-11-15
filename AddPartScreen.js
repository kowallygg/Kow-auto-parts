import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddPartScreen({ goBack }) {
  const [partName, setPartName] = useState('');
  const [oemCode, setOemCode] = useState('');
  const [producerCode, setProducerCode] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');

  const handleSavePart = () => {
    alert(`Piesa "${partName || 'Nouă'}" a fost salvată! S-a generat codul intern unic și eticheta QR.`);
    goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER CU BUTON DE ÎNAPOI */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adaugă Piesă Nouă</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* FORMULARUL DE ADAUGARE */}
      <View style={styles.card}>
        
        <Text style={styles.label}>Denumire Piesă *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Alternator 2.0 TDI, Far stânga..." 
          placeholderTextColor="#6B7280"
          value={partName}
          onChangeText={setPartName}
        />

        <Text style={styles.label}>Cod OEM</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: 03G903023" 
          placeholderTextColor="#6B7280"
          value={oemCode}
          onChangeText={setOemCode}
        />

        <Text style={styles.label}>Cod Producător / Marcă</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Bosch / Valeo" 
          placeholderTextColor="#6B7280"
          value={producerCode}
          onChangeText={setProducerCode}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Preț Vânzare (RON)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 350" 
              placeholderTextColor="#6B7280"
              keyboardDataType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Locație / Raft</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Raft B2" 
              placeholderTextColor="#6B7280"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* SECȚIUNE FOTO & QR */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoButton} onPress={() => alert('Deschide camera pentru poze și generare QR')}>
            <Text style={styles.photoButtonText}>📷 Adaugă Poze & Scanează QR</Text>
          </TouchableOpacity>
        </View>

        {/* BUTON SALVARE FINALĂ */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePart}>
          <Text style={styles.saveButtonText}>💾 Salvează Piesa în Stoc</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0F1115',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 12,
  },
  backButton: {
    backgroundColor: '#161920',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  backButtonText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoSection: {
    marginVertical: 10,
  },
  photoButton: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
    
