
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kow_caroserie_subcategorii';

// Subcategoriile principale
const DEFAULT_SUBCATEGORIES = [
  { id: 'bara_fata', name: 'Bară față', form: null },
  { id: 'bara_spate', name: 'Bară spate', form: null },
  { id: 'fata_completa', name: 'Față completă', form: null },
  { id: 'aripa_fata', name: 'Aripă față', form: null },
  { id: 'aripa_spate', name: 'Aripă spate', form: null },
  { id: 'capota', name: 'Capotă', form: null },
  { id: 'portbagaj', name: 'Portbagaj / Haion', form: null },
  { id: 'usa', name: 'Ușă', form: null },
  { id: 'prag', name: 'Prag', form: null },
  { id: 'grila', name: 'Grilă', form: null },
  { id: 'carenaj', name: 'Carenaj roată', form: null },
  { id: 'scuturi', name: 'Scuturi', form: null },
  { id: 'geamuri', name: 'Geamuri', form: null },
  { id: 'oglinzi', name: 'Oglinzi exterioare', form: null },
  { id: 'faruri', name: 'Faruri', form: null },
  { id: 'stopuri', name: 'Stopuri', form: null },
  { id: 'maner', name: 'Mâner exterior', form: null },
  { id: 'eleron', name: 'Eleron', form: null },
  { id: 'ornament', name: 'Ornament exterior', form: null },
  { id: 'bandou', name: 'Bandou', form: null },
];

export default function CaroserieExterior({ onSelectSubcategory, goBack }) {
  const [subcategories, setSubcategories] = useState(
    DEFAULT_SUBCATEGORIES
  );

  const [newSubcategory, setNewSubcategory] = useState('');

  useEffect(() => {
    loadSubcategories();
  }, []);

  const loadSubcategories = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const custom = JSON.parse(saved);

        setSubcategories([
          ...DEFAULT_SUBCATEGORIES,
          ...custom,
        ]);
      }
    } catch (error) {
      console.log('Eroare la încărcarea subcategoriilor:', error);
    }
  };

  const addSubcategory = async () => {
    const name = newSubcategory.trim();

    if (!name) {
      Alert.alert('Atenție', 'Introdu numele subcategoriei.');
      return;
    }

    const exists = subcategories.some(
      item => item.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      Alert.alert('Atenție', 'Această subcategorie există deja.');
      return;
    }

    const newItem = {
      id: `custom_${Date.now()}`,
      name,
      form: null,
      custom: true,
    };

    const updated = [...subcategories, newItem];

    try {
      const customOnly = updated.filter(item => item.custom);

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(customOnly)
      );

      setSubcategories(updated);
      setNewSubcategory('');

      Alert.alert('Succes', 'Subcategoria a fost adăugată.');
    } catch (error) {
      Alert.alert('Eroare', 'Subcategoria nu a putut fi salvată.');
    }
  };

  const selectSubcategory = (item) => {
    if (onSelectSubcategory) {
      onSelectSubcategory(item);
    } else {
      Alert.alert(
        item.name,
        'Formularul acestei subcategorii va fi conectat în etapa următoare.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Caroserie și exterior</Text>
        <Text style={styles.subtitle}>
          Alege subcategoria piesei
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {subcategories.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.categoryButton}
              onPress={() => selectSubcategory(item)}
            >
              <Text style={styles.categoryText}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.addSection}>
          <Text style={styles.addTitle}>
            + Adaugă subcategorie nouă
          </Text>

          <TextInput
            style={styles.input}
            value={newSubcategory}
            onChangeText={setNewSubcategory}
            placeholder="Numele subcategoriei"
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={addSubcategory}
          >
            <Text style={styles.addButtonText}>
              Salvează subcategoria
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
  },
  header: {
    padding: 20,
    paddingTop: 45,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#55B8FF',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 6,
  },
  content: {
    padding: 15,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    minHeight: 65,
    backgroundColor: '#202D38',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#344653',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  addSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#202D38',
    borderRadius: 12,
  },
  addTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#101820',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 13,
    borderWidth: 1,
    borderColor: '#40515F',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#168B58',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
