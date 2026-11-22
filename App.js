import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddPartScreen from './AddPartScreen';
import StockScreen from './StockScreen';
import PartDetailsScreen from './PartDetailsScreen';
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'add', 'stock', 'cars', 'sales', 'scan'
  const [stockParts, setStockParts] = useState([]);
const [selectedPart, setSelectedPart] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      const saved = await AsyncStorage.getItem('@kow_stock_parts');
      if (saved) {
        setStockParts(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Eroare la citirea stocului', e);
    }
  };

  const saveStockToStorage = async (newList) => {
    try {
      await AsyncStorage.setItem('@kow_stock_parts', JSON.stringify(newList));
    } catch (e) {
      console.log('Eroare la salvarea stocului', e);
    }
  };

  const handleSavePartToStock = (newPart) => {
    const updated = [newPart, ...stockParts];
    setStockParts(updated);
    saveStockToStorage(updated);
  };

  const handleDeletePart = (id) => {
    const updated = stockParts.filter(p => p.id !== id);
    setStockParts(updated);
    saveStockToStorage(updated);
  };

  if (currentScreen === 'add') {
    return <AddPartScreen goBack={() => setCurrentScreen('home')} onSavePartToStock={handleSavePartToStock} />;
  }

  if (currentScreen === 'details') {
  return (
    <PartDetailsScreen
      part={selectedPart}
      goBack={() => setCurrentScreen('stock')}
    />
  );
}

if (currentScreen === 'stock') {
  return (
    <StockScreen
      stockParts={stockParts}
      goBack={() => setCurrentScreen('home')}
      onDeletePart={handleDeletePart}
      onOpenPart={part => {
        setSelectedPart(part);
        setCurrentScreen('details');
      }}
    />
  );
}

  return (
    <View style={styles.container}>
      {/* Antetul scris frumos sus */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>KOW Auto Parts</Text>
        <Text style={styles.headerSub}>Gestionare Stoc & Piese Auto</Text>
      </View>

      {/* Bara de căutare sus */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Caută piese, cod OEM, mașini..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Butonul Mașinile mele */}
      <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('cars')}>
        <Text style={styles.navButtonIcon}>🚗</Text>
        <Text style={styles.navButtonText}>Mașinile mele</Text>
      </TouchableOpacity>

      {/* Butonul Vânzări */}
      <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('sales')}>
        <Text style={styles.navButtonIcon}>💰</Text>
        <Text style={styles.navButtonText}>Vânzări</Text>
      </TouchableOpacity>

      {/* Butonul Scanează cod QR */}
      <TouchableOpacity style={styles.navButtonScan} onPress={() => setCurrentScreen('scan')}>
        <Text style={styles.navButtonIcon}>📷</Text>
        <Text style={styles.navButtonTextScan}>Scanează cod QR</Text>
      </TouchableOpacity>

      {/* Butonul Adaugă Piesă */}
      <TouchableOpacity style={styles.primaryButton} onPress={() => setCurrentScreen('add')}>
        <Text style={styles.primaryButtonIcon}>➕</Text>
        <View>
          <Text style={styles.primaryButtonTitle}>Adaugă piesă</Text>
          <Text style={styles.primaryButtonDesc}>Formular detalii și poze</Text>
        </View>
      </TouchableOpacity>

      {/* Butonul Stoc */}
      <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentScreen('stock')}>
        <Text style={styles.secondaryButtonIcon}>📦</Text>
        <View>
          <Text style={styles.secondaryButtonTitle}>Stoc piese ({stockParts.length})</Text>
          <Text style={styles.secondaryButtonDesc}>Vezi piesele salvate</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 16, paddingTop: 50 },
  headerBox: { alignItems: 'center', marginBottom: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', letterSpacing: 0.5 },
  headerSub: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  searchContainer: { marginBottom: 16 },
  searchInput: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 14, height: 46, fontSize: 14 },
  navButton: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  navButtonIcon: { fontSize: 20, marginRight: 12 },
  navButtonText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  navButtonScan: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderWidth: 1, borderColor: '#3B82F6', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  navButtonTextScan: { color: '#60A5FA', fontSize: 14, fontWeight: 'bold' },
  primaryButton: { backgroundColor: 'rgba(220, 38, 38, 0.15)', borderWidth: 1, borderColor: '#DC2626', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  primaryButtonIcon: { fontSize: 24, marginRight: 14 },
  primaryButtonTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  primaryButtonDesc: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  secondaryButton: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  secondaryButtonIcon: { fontSize: 24, marginRight: 14 },
  secondaryButtonTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButtonDesc: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
});
