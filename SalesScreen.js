import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SalesScreen({ goBack }) {
  // Stare pentru a comuta între secțiuni: 'returns' (în așteptare 30 zile) și 'archive' (definitiv verde/roșu)
  const [activeTab, setActiveTab] = useState('returns');

  // Exemple de piese în cele 30 de zile de retur (în așteptare)
  const pendingReturns = [
    { id: '1', internalCode: 'P-025', name: 'Injectoare 2.0 TDI', client: 'Client Direct', soldDate: '10 Feb 2026', daysLeft: '26 zile rămase' },
  ];

  // Exemple de arhivă definitivă (Verde = vândut cu succes, Roșu = piesă defectă)
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
              
              {/* Cele două butoane de retur cerute de tine */}
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

      {/* CONȚINUT TAB 2: ARHIVĂ DEFINITIVĂ (VERDE / ROȘU) ȘI REACTIVARE */}
      {activeTab === 'archive' && (
        <View style={styles.listContainer}>
          <Text style={styles.sectionHint}>🟢 Verde = Vândute cu succes | 🔴 Roșu = Defecte / Casate. Poți reactiva un anunț verde cu un QR nou!</Text>
          {finalArchive.map((item) => (
            <View key={item.id} style={[styles.card, item.status === 'success' ? styles.borderGreen : styles.borderRed]}>
              <View style={styles.cardHeader}>
                <Text style={styles.internalBadge}>{item.internalCode}</Text>
                <Text style={item.status === 'success' ? styles.textGreen
