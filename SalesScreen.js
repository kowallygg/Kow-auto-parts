import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SalesScreen({ goBack }) {
  const [activeTab, setActiveTab] = useState('returns');

  const pendingReturns = [
    { id: '1', internalCode: 'P-025', name: 'Injectoare 2.0 TDI', client: 'Client Direct', soldDate: '10 Feb 2026', daysLeft: '26 zile rămase' },
  ];

  const finalArchive = [
    { id: '10', internalCode: 'P-012', name: 'Compresor AC', status: 'success', statusText: 'Piesă Vândută (Verde)', date: '15 Ian 2026' },
    { id: '11', internalCode: 'P-018', name: 'Electromotor Golf 5', status: 'defective', statusText: 'Piesă Defectă / Retur (Roșu)', date: '22 Ian 2026' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* HEADER CU BUTON DE ÎNAPOI */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vânzări & Retururi (30 Zile)</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* TABS DE NAVIGARE INTERNĂ */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'returns' && styles.activeTabButton]}
          onPress={() => setActiveTab('returns')}
        >
          <Text style={[styles.tabText, activeTab === 'returns' && styles.activeTabText]}>⏳ În Așteptare (30 Zile)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'archive' && styles.activeTabButton]}
          onPress={() => setActiveTab('archive')}
        >
          <Text style={[styles.tabText, activeTab === 'archive' && styles.activeTabText]}>📁 Arhivă Definitivă</Text>
        </TouchableOpacity>
      </View>

      {/* CONȚINUT TAB 1: RETURURI ÎN AȘTEPTARE 30 ZILE */}
      {activeTab === 'returns' && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionHint}>Piesele de aici pot reveni în stoc cu același QR sau pot deveni defecte.</Text>
          {pendingReturns.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.internalBadge}>{item.internalCode}</Text>
                <Text style={styles.timerBadge}>{item.daysLeft}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>Vândut către: {item.client} | Data: {item.soldDate}</Text>
              
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.returnStockBtn} onPress={() => alert(`Piesa ${item.internalCode} revine în stoc cu același QR și cod intern!`)}>
                  <Text style={styles.btnTextGreen}>🔄 Revenire Stoc</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.returnDefectBtn} onPress={() => alert(`Piesa ${item.internalCode} marcată ca defectă și mutată în roșu!`)}>
                  <Text style={styles.btnTextRed}>⚠️ Piesă Defectă</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* CONȚINUT TAB 2: ARHIVĂ DEFINITIVĂ (VERDE / ROȘU) */}
      {activeTab === 'archive' && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionHint}>🟢 Verde = Vândute cu succes | 🔴 Roșu = Defecte / Casate. Poți reactiva un anunț verde cu un QR nou!</Text>
          {finalArchive.map((item) => (
            <View key={item.id} style={[styles.card, item.status === 'success' ? styles.borderGreen : styles.borderRed]}>
              <View style={styles.cardHeader}>
                <Text style={styles.internalBadge}>{item.internalCode}</Text>
                <Text style={item.status === 'success' ? styles.textGreen : styles.textRed}>{item.statusText}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>Finalizat la data: {item.date}</Text>

              {item.status === 'success' && (
                <TouchableOpacity style={styles.reactivateBtn} onPress={() => alert(`Reactivare piesă ${item.internalCode}: Se preiau pozele vechi, se generează un nou cod intern și se cere un nou QR!`)}>
                  <Text style={styles.reactivateText}>♻️ Reactivează în Stoc (Păstrează Poze, QR Nou)</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

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
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#161920',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#1F2937',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionHint: {
    color: '#6B7280',
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 15,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
  },
  borderGreen: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  borderRed: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  cardHeader: {
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
  timerBadge: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: 'bold',
  },
  textGreen: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  textRed: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardMeta: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 10,
  },
  returnStockBtn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  returnDefectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnTextGreen: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnTextRed: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reactivateBtn: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  reactivateText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
