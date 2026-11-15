import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddCarScreen({ goBack }) {
  const [lotName, setLotName] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [totalCost, setTotalCost] = useState('');

  const handleSaveCar = () => {
    alert(`Mașina / Lotul "${carBrand} ${carModel} (${lotName || 'Lot Nou'})" a fost înregistrat cu succes!`);
    goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER CU BUTON DE ÎNAPOI */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adaugă Mașină / Lot Donator</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* FORMULARUL DE LOTURI & MAȘINI */}
      <View style={styles.card}>
        
        <Text style={styles.label}>Nume Lot / Identificare *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: Lot Germania #4 / Achiziție Octombrie" 
          placeholderTextColor="#6B7280"
          value={lotName}
          onChangeText={setLotName}
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Marcă Auto</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Volkswagen" 
              placeholderTextColor="#6B7280"
              value={carBrand}
              onChangeText={setCarBrand}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Model</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Golf 5" 
              placeholderTextColor="#6B7280"
              value={carModel}
              onChangeText={setCarModel}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>An Fabricație</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 2008" 
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={carYear}
              onChangeText={setCarYear}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Cost Total Achiziție + Transport (RON)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 4500" 
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={totalCost}
              onChangeText={setTotalCost}
            />
          </View>
        </View>

        <Text style={styles.label}>Cod Motor / Cutie de Viteză / Culoare Caroserie</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ex: BKC / Manuală 6 trepte / Negru LC9X" 
          placeholderTextColor="#6B7280"
        />

        {/* SECȚIUNE JANTE & ANVELOPE INTEGRATE */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>⚙️ Specificații Jante / Anvelope</Text>
          <Text style={styles.sectionDesc}>Dimensiuni 13"-24", PCD, ET (memorie integrată)</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => alert('Setări avansate jante și anvelope')}>
            <Text style={styles.secondaryButtonText}>Configurează Jantele Donatoare</Text>
          </TouchableOpacity>
        </View>

        {/* BUTON SALVARE FINALĂ */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCar}>
          <Text style={styles.saveButtonText}>💾 Salvează Mașina / Lotul</Text>
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
    fontSize: 15,
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
  sectionBox: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  sectionDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
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
        
