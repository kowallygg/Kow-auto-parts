import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigateTo }) {
  const [searchText, setSearchText] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      
      {/* HEADER / ANTET */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRed}>
            <Text style={styles.logoRedText}>KOW</Text>
          </View>
          <View style={styles.logoDark}>
            <Text style={styles.logoDarkText}>AUTO PARTS</Text>
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ Depozit Activ</Text>
        </View>
      </View>

      {/* BARA DE CĂUTARE INTELIGENTĂ */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Caută OEM, cod intern P..., culoare..."
            placeholderTextColor="#6B7280"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BUTON RAPID: SCANEAZĂ COD QR (Imediat sub căutare) */}
      <TouchableOpacity 
        style={styles.qrButton} 
        onPress={() => alert('Se deschide camera pentru scanarea codului QR din depozit...')}
      >
        <View style={styles.qrContent}>
          <View style={styles.qrIconBox}>
            <Text style={{ fontSize: 20 }}>📷</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.qrTitle}>Scanează Cod QR</Text>
            <Text style={styles.qrSubtitle}>Scanează pe loc sau alege poză din galerie</Text>
          </View>
          <Text style={styles.qrArrow}>➔</Text>
        </View>
      </TouchableOpacity>

      {/* CELE 5 CARDURI PRINCIPALE */}
      <View style={styles.gridContainer}>
        
        {/* Card 1: Adaugă Piesă */}
        <TouchableOpacity style={styles.card} onPress={() => navigateTo('addPart')}>
          <Text style={styles.cardEmoji}>🔩</Text>
          <Text style={styles.cardTitle}>Adaugă Piesă</Text>
          <Text style={styles.cardDesc}>Cod intern P..., OEM, poze și QR rapid.</Text>
        </TouchableOpacity>

        {/* Card 2: Adaugă Mașină / Lot */}
        <TouchableOpacity style={styles.card} onPress={() => navigateTo('addCar')}>
          <Text style={styles.cardEmoji}>🚗</Text>
          <Text style={styles.cardTitle}>Adaugă Mașină / Lot</Text>
          <Text style={styles.cardDesc}>Loturi, cheltuieli, donatoare și jante.</Text>
        </TouchableOpacity>

        {/* Card 3: Stoc Piese */}
        <TouchableOpacity style={styles.card} onPress={() => navigateTo('stock')}>
          <Text style={styles.cardEmoji}>📦</Text>
          <Text style={styles.cardTitle}>Stoc Piese</Text>
          <Text style={styles.cardDesc}>Stoc activ, filtre și vânzare rapidă.</Text>
        </TouchableOpacity>

        {/* Card 4: Vânzări & Retururi */}
        <TouchableOpacity style={styles.card} onPress={() => navigateTo('sales')}>
          <Text style={styles.cardEmoji}>📈</Text>
          <Text style={styles.cardTitle}>Vânzări & Retururi</Text>
          <Text style={styles.cardDesc}>Gestiune 30 zile, verde (vândut) / roșu (defect).</Text>
        </TouchableOpacity>

        {/* Card 5: Setări & Backup */}
        <TouchableOpacity style={[styles.card, styles.fullWidthCard]} onPress={() => alert('Setări și Export Date')}>
          <Text style={styles.cardEmoji}>💾</Text>
          <Text style={styles.cardTitle}>Setări și Backup</Text>
          <Text style={styles.cardDesc}>Memorii salvate și configurare sistem.</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 12,
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRed: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  logoRedText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  logoDark: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  logoDarkText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#161920',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  badgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  searchRow: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    height: 48,
    fontSize: 14,
  },
  clearIcon: {
    color: '#6B7280',
    fontSize: 16,
    padding: 4,
  },
  qrButton: {
    backgroundColor: '#161920',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.6)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  qrContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrIconBox: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  qrTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  qrSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  qrArrow: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  fullWidthCard: {
    width: '100%',
  },
  cardEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 15,
  },
});
