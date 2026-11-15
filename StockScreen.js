import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StockScreen({ stockParts, goBack, onDeletePart }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi la Meniu</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stoc Piese ({stockParts.length})</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {stockParts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Nu ai nicio piesă salvată în stoc momentan.</Text>
            <Text style={styles.emptySub}>Adaugă prima piesă folosind formularul!</Text>
          </View>
        ) : (
          stockParts.map((item) => (
            <View key={item.id} style={styles.partCard}>
              <View style={styles.cardTopRow}>
                <Text style={styles.partTitle}>{item.partName}</Text>
                <Text style={styles.partPrice}>{item.price}</Text>
              </View>

              <Text style={styles.partMeta}>📦 Lot: {item.lot}</Text>
              <Text style={styles.partMeta}>🚗 Mașină: {item.car}</Text>
              {item.oemCode ? <Text style={styles.partMeta}>🏷️ OEM: {item.oemCode}</Text> : null}
              <Text style={styles.partMeta}>📍 Locație: {item.location}</Text>
              <Text style={styles.partMeta}>📱 QR: {item.qrCode}</Text>
              <Text style={styles.partMeta}>📅 Adăugată la: {item.dateAdded}</Text>

              {/* Previzualizare poze în stoc */}
              {item.photos && item.photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {item.photos.map((uri, idx) => (
                      <Image key={idx} source={{ uri }} style={styles.stockThumb} />
                    ))}
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => onDeletePart(item.id)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Șterge din stoc</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937', paddingBottom: 12 },
  backButton: { backgroundColor: '#161920', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1F2937' },
  backButtonText: { color: '#E2E8F0', fontSize: 13, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyBox: { marginTop: 80, alignItems: 'center', padding: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 10 },
  emptyText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  emptySub: { color: '#9CA3AF', fontSize: 13, marginTop: 4, textAlign: 'center' },
  partCard: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  partTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  partPrice: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  partMeta: { color: '#9CA3AF', fontSize: 13, marginTop: 3 },
  stockThumb: { width: 50, height: 50, borderRadius: 6, borderWidth: 1, borderColor: '#374151' },
  deleteBtn: { marginTop: 12, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: '#EF4444', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  deleteBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
});
