import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function StockScreen({ goBack }) {
  const [searchStock, setSearchStock] = useState('');

  // Listă exemplu de piese active în stoc (pe viitor va fi legată de baza de date)
  const activeStock = [
    { id: '1', internalCode: 'P-001', name: 'Alternator 2.0 TDI (BKC)', car: 'VW Golf 5', price: '350 RON', location: 'Raft A1' },
    { id: '2', internalCode: 'P-002', name: 'Far Stânga H7', car: 'Ford Focus 2', price: '200 RON', location: 'Raft B3' },
    { id: '3', internalCode: 'P-003', name: 'Capotă Motor Negru LC9X', car: 'VW Passat B6', price: '600 RON', location: 'Depozit Spate' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER CU BUTON DE ÎNAPOI */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stoc Piese Active</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* CĂUTARE ÎN STOC */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Filtrează stocul după cod intern P..., denumire..."
          placeholderTextColor="#6B7280"
          value={searchStock}
          onChangeText={setSearchStock}
        />
      </View>

      {/* LISTA DE PIESE DIN STOC */}
      <View style={styles.listContainer}>
        {activeStock.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.partCard}
            onPress={() => alert(`Ai selectat piesa ${item.internalCode}: ${item.name}\nAici vei putea vedea detaliile complete și butonul "Vinde Piesa".`)}
          >
            <View style={styles.partHeader}>
              <Text style={styles.internalBadge}>{item.internalCode}</Text>
              <Text style={styles.partPrice}>{item.price}</Text>
            </View>
            <Text style={styles.partName}>{item.name}</Text>
            <View style={styles.partFooter}>
              <Text style={styles.partMeta}>🚗 {item.car}</Text>
              <Text style={styles.partMeta}>📍 {item.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    marginBottom: 16,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    height: 46,
    fontSize: 13,
  },
  listContainer: {
    gap: 12,
  },
  partCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  internalBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    color: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  partPrice: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: 'bold',
  },
  partName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  partFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 8,
  },
  partMeta: {
    color: '#9CA3AF',
    fontSize: 11,
  },
});
              
