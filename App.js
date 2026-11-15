import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddPartScreen from './AddPartScreen';
import StockScreen from './StockScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'add', 'stock'
  const [stockParts, setStockParts] = useState([]);

  // Încărcăm stocul salvat în memoria telefonului la pornire
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

  if (currentScreen === 'stock') {
    return <StockScreen stockParts={stockParts} goBack={() => setCurrentScreen('home')} onDeletePart={handleDeletePart} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroBox}>
        <Text style={styles.heroTitle}>KOW Auto Parts</Text>
        <Text style={styles.heroSub}>Gestionare Inteligentă Stoc Piese</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButtonPrimary} onPress={() => setCurrentScreen('add')}>
          <Text style={styles.menuIcon}>➕</Text>
          <View>
            <Text style={styles.menuBtnTitle}>Adaugă Piesă Nouă</Text>
            <Text style={styles.menuBtnDesc}>Formular complet cu poze și QR</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => setCurrentScreen('stock')}>
          <Text style={styles.menuIcon}>📦</Text>
          <View>
            <Text style={styles.menuBtnTitle}>Vezi Stocul ({stockParts.length})</Text>
            <Text style={styles.menuBtnDesc}>Piese salvate și memorate</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 20, justifyContent: 'center' },
  heroBox: { alignItems: 'center', marginBottom: 40 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  heroSub: { color: '#9CA3AF', fontSize: 14, marginTop: 6 },
  menuContainer: { gap: 16 },
  menuButtonPrimary: { backgroundColor: 'rgba(220, 38, 38, 0.15)', borderWidth: 1, borderColor: '#DC2626', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' },
  menuButton: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 32, marginRight: 16 },
  menuBtnTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  menuBtnDesc: { color: '#9CA3AF', fontSize: 12, marginTop: 3 },
});
      
