
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AddPartScreen from './AddPartScreen';
import AddCarScreen from './AddCarScreen';
import StockScreen from './StockScreen';
import PartDetailsScreen from './PartDetailsScreen';
import SalesScreen from './SalesScreen';
import QrScannerScreen from './QrScannerScreen';

const STORAGE_KEYS = {
  stock: '@kow_stock_parts',
  sales: '@kow_sales',
  lots: '@kow_lots',
  donorCars: '@kow_donor_cars',
  expenses: '@kow_expenses',
};

const readArray = async key => {
  const saved = await AsyncStorage.getItem(key);
  const parsed = saved ? JSON.parse(saved) : [];

  if (!Array.isArray(parsed)) {
    throw new Error(`Date invalide pentru ${key}`);
  }

  return parsed;
};

const normalizeText = value => {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Transformă numele câmpurilor în etichete lizibile.
const getCodeLabel = path => {
  const labels = {
    oemCode: 'Cod OEM',
    oemCodes: 'Coduri OEM',
    producerCode: 'Cod producător',
    manufacturerCode: 'Cod producător',
    manufacturerCodes: 'Coduri producător',
    sensorCodes: 'Coduri senzori',
    sensorCode: 'Cod senzor',
    grilleCodes: 'Coduri grile',
    codes: 'Coduri componente',
    code: 'Cod componentă',
    colorCode: 'Cod culoare',
    left: 'Stânga',
    right: 'Dreapta',
    washers: 'Spălătoare faruri',
    fogLights: 'Proiectoare',
    grilles: 'Grile',
    sensors: 'Senzori',
    extraFeatures: 'Dotări suplimentare',
  };

  const parts = path
    .replace(/\[(\d+)\]/g, ' $1')
    .split('.')
    .filter(Boolean);

  return parts
    .map(part => labels[part] || part)
    .join(' → ');
};

// Verifică dacă un câmp reprezintă un cod.
const isCodeField = key => {
  const normalized = normalizeText(key).replace(/[^a-z0-9]/g, '');

  return (
    normalized === 'code' ||
    normalized.includes('oem') ||
    normalized.includes('producercode') ||
    normalized.includes('manufacturercode') ||
    normalized.includes('sensorcode') ||
    normalized.includes('grillecode') ||
    normalized.includes('partcode') ||
    normalized.includes('componentcode') ||
    normalized.includes('cod')
  );
};

// Caută recursiv codurile din toate obiectele și subcategoriile.
const getNestedCodeMatches = part => {
  const matches = [];
  const visited = new Set();

  const walk = (value, path = '', parentIsCode = false) => {
    if (value === null || value === undefined) return;

    if (typeof value === 'string' || typeof value === 'number') {
      if (parentIsCode && String(value).trim()) {
        matches.push({
          value: String(value).trim(),
          label: getCodeLabel(path),
          path,
        });
      }
      return;
    }

    if (typeof value !== 'object') return;
    if (visited.has(value)) return;

    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, `${path}[${index}]`, parentIsCode);
      });
      return;
    }

    Object.entries(value).forEach(([key, child]) => {
      const childPath = path ? `${path}.${key}` : key;
      const codeField = isCodeField(key);

      // Câmpurile cu nume explicite de cod sunt preluate.
      // În interiorul unui câmp de cod, sunt acceptate și valorile
      // din obiecte sau liste.
      walk(child, childPath, codeField || parentIsCode);
    });
  };

  walk(part);

  // Elimină doar duplicatele identice din aceeași înregistrare.
  const unique = [];
  const seen = new Set();

  matches.forEach(match => {
    const key = `${normalizeText(match.value)}|${match.path}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(match);
    }
  });

  return unique;
};

const getPartCodeMatches = part => {
  const matches = getNestedCodeMatches(part);

  // Câmpurile principale sunt tratate separat pentru compatibilitate
  // cu înregistrările mai vechi din aplicație.
  const mainFields = [
    ['oemCode', part.oemCode],
    ['producerCode', part.producerCode],
    ['qrCode', part.qrCode],
  ];

  mainFields.forEach(([key, value]) => {
    if (!value) return;

    const normalized = normalizeText(value);

    if (
      !matches.some(
        item =>
          normalizeText(item.value) === normalized &&
          item.path === key
      )
    ) {
      matches.push({
        value: String(value).trim(),
        label: getCodeLabel(key),
        path: key,
      });
    }
  });

  return matches;
};

const getPartSearchText = part => {
  const bumper = part.baraFata || {};

  const values = [
    part.partName,
    part.qrCode,
    part.id,
    part.oemCode,
    part.producerCode,
    part.carMake,
    part.carModel,
    part.engine,
    part.engineCode,
    part.year,
    part.transmissionType,
    part.transmissionCode,
    part.position,
    part.axlePosition,
    part.colorCode,
    part.wheelType,
    part.diameter,
    part.rimWidth,
    part.offset,
    part.pcd,
    part.tireSize,
    part.category,
    part.subcategoryName,
    part.car,
    bumper.carMake,
    bumper.carModel,
    bumper.year,
    bumper.colorCode,
  ];

  const nestedCodes = getPartCodeMatches(part).map(item => item.value);

  return normalizeText(
    [...values, ...nestedCodes].filter(Boolean).join(' ')
  );
};

const getPartSearchMatches = (part, query) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return [];

  return getPartCodeMatches(part).filter(match =>
    normalizeText(match.value).includes(normalizedQuery)
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [stockParts, setStockParts] = useState([]);
  const [sales, setSales] = useState([]);
  const [lots, setLots] = useState([]);
  const [donorCars, setDonorCars] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsReturnScreen, setDetailsReturnScreen] = useState('home');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const [
        parsedStock,
        parsedSales,
        parsedLots,
        parsedDonorCars,
        parsedExpenses,
      ] = await Promise.all([
        readArray(STORAGE_KEYS.stock),
        readArray(STORAGE_KEYS.sales),
        readArray(STORAGE_KEYS.lots),
        readArray(STORAGE_KEYS.donorCars),
        readArray(STORAGE_KEYS.expenses),
      ]);

      setStockParts(parsedStock);
      setSales(parsedSales);
      setLots(parsedLots);
      setDonorCars(parsedDonorCars);
      setExpenses(parsedExpenses);
    } catch (e) {
      console.log('Eroare la citirea datelor', e);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const saveArray = async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const saveStockToStorage = async newList => {
    try {
      await saveArray(STORAGE_KEYS.stock, newList);
    } catch (e) {
      console.log('Eroare la salvarea stocului', e);
      throw e;
    }
  };

  const handleSavePartToStock = async newPart => {
    const updated = [newPart, ...stockParts];

    await saveStockToStorage(updated);
    setStockParts(updated);
  };

  const handleDeletePart = async id => {
    try {
      const updated = stockParts.filter(
        part => String(part.id) !== String(id)
      );

      await saveStockToStorage(updated);
      setStockParts(updated);

      if (
        selectedPart &&
        String(selectedPart.id) === String(id)
      ) {
        setSelectedPart(null);
        setCurrentScreen('stock');
      }
    } catch (e) {
      console.log('Eroare la ștergerea piesei', e);
      Alert.alert(
        'Eroare',
        'Piesa nu a putut fi ștearsă. Datele au rămas neschimbate.'
      );
    }
  };

  // LOTURI

  const handleSaveLot = async newLot => {
    const updated = [newLot, ...lots];

    await saveArray(STORAGE_KEYS.lots, updated);
    setLots(updated);
  };

  const handleDeleteLot = async id => {
    const hasCars = donorCars.some(
      car => String(car.lotId) === String(id)
    );

    const hasParts = stockParts.some(part => {
      if (String(part.lotId) === String(id)) return true;

      const car = donorCars.find(
        item => String(item.id) === String(part.donorCarId)
      );

      return car && String(car.lotId) === String(id);
    });

    const hasSales = sales.some(
      sale => String(sale.lotId) === String(id)
    );

    if (hasCars || hasParts || hasSales) {
      Alert.alert(
        'Lot utilizat',
        'Lotul nu poate fi șters deoarece are mașini, piese sau vânzări asociate.'
      );
      return;
    }

    try {
      const updated = lots.filter(
        lot => String(lot.id) !== String(id)
      );

      await saveArray(STORAGE_KEYS.lots, updated);
      setLots(updated);
    } catch (e) {
      Alert.alert('Eroare', 'Lotul nu a putut fi șters.');
    }
  };

  // MAȘINI DONATOARE

  const handleSaveDonorCar = async newCar => {
    const updated = [newCar, ...donorCars];

    await saveArray(STORAGE_KEYS.donorCars, updated);
    setDonorCars(updated);
  };

  const handleDeleteDonorCar = async id => {
    const hasParts = stockParts.some(
      part => String(part.donorCarId) === String(id)
    );

    const hasSales = sales.some(
      sale => String(sale.donorCarId) === String(id)
    );

    if (hasParts || hasSales) {
      Alert.alert(
        'Mașină utilizată',
        'Mașina nu poate fi ștearsă deoarece are piese sau vânzări asociate.'
      );
      return;
    }

    try {
      const updated = donorCars.filter(
        car => String(car.id) !== String(id)
      );

      await saveArray(STORAGE_KEYS.donorCars, updated);
      setDonorCars(updated);
    } catch (e) {
      Alert.alert('Eroare', 'Mașina nu a putut fi ștearsă.');
    }
  };

  // CHELTUIELI

  const handleSaveExpense = async newExpense => {
    const updated = [newExpense, ...expenses];

    await saveArray(STORAGE_KEYS.expenses, updated);
    setExpenses(updated);
  };

  const handleDeleteExpense = async id => {
    try {
      const updated = expenses.filter(
        expense => String(expense.id) !== String(id)
      );

      await saveArray(STORAGE_KEYS.expenses, updated);
      setExpenses(updated);
    } catch (e) {
      Alert.alert('Eroare', 'Cheltuiala nu a putut fi ștearsă.');
    }
  };

  // VÂNZARE PIESE

  const handleSellPart = async saleData => {
    try {
      const currentPart = stockParts.find(
        part => String(part.id) === String(saleData.partId)
      );

      if (!currentPart) {
        Alert.alert('Eroare', 'Piesa nu mai există în stoc.');
        return;
      }

      const currentQuantity = Number(currentPart.quantity) || 0;

      if (
        !Number.isInteger(saleData.quantity) ||
        saleData.quantity < 1 ||
        saleData.quantity > currentQuantity
      ) {
        Alert.alert(
          'Stoc insuficient',
          'Cantitatea disponibilă s-a modificat.'
        );
        return;
      }

      const updatedPart = {
        ...currentPart,
        quantity: currentQuantity - saleData.quantity,
      };

      const updatedStock = stockParts.map(part =>
        String(part.id) === String(saleData.partId)
          ? updatedPart
          : part
      );

      const newSale = {
        ...saleData,
        lotId: currentPart.lotId || null,
        donorCarId: currentPart.donorCarId || null,
        id: String(Date.now()),
        date: new Date().toISOString(),
      };

      const updatedSales = [newSale, ...sales];

      await AsyncStorage.multiSet([
        [
          STORAGE_KEYS.stock,
          JSON.stringify(updatedStock),
        ],
        [
          STORAGE_KEYS.sales,
          JSON.stringify(updatedSales),
        ],
      ]);

      setStockParts(updatedStock);
      setSales(updatedSales);
      setSelectedPart(updatedPart);

      Alert.alert(
        'Vânzare înregistrată',
        'Stocul a fost actualizat cu succes.'
      );
    } catch (e) {
      console.log('Eroare la înregistrarea vânzării', e);
      Alert.alert(
        'Eroare',
        'Vânzarea nu a putut fi salvată.'
      );
    }
  };

  // SCANARE QR DIN PAGINA PRINCIPALĂ

  const handleMainQrScanned = code => {
    const scannedCode = String(code || '').trim().toUpperCase();

    if (!scannedCode) {
      Alert.alert('Cod invalid', 'Codul QR nu conține date.');
      setCurrentScreen('home');
      return;
    }

    const foundPart = stockParts.find(part => {
      const partQrCode = String(part.qrCode || '').trim().toUpperCase();
      const partId = String(part.id || '').trim().toUpperCase();

      return (
        partQrCode === scannedCode ||
        partId === scannedCode
      );
    });

    if (!foundPart) {
      Alert.alert(
        'Piesa nu a fost găsită',
        `Nu există nicio piesă în stoc cu acest cod QR:\n${scannedCode}`
      );
      setCurrentScreen('home');
      return;
    }

    setSelectedPart(foundPart);
    setDetailsReturnScreen('home');
    setCurrentScreen('details');
  };

  // REZULTATE CĂUTARE

  const normalizedSearch = normalizeText(searchQuery);

  const allSearchResults = normalizedSearch
    ? stockParts.filter(part =>
        getPartSearchText(part).includes(normalizedSearch)
      )
    : [];

  const searchResults = allSearchResults.slice(0, 8);

  const openSearchResult = part => {
    setSelectedPart(part);
    setDetailsReturnScreen('home');
    setSearchQuery('');
    setCurrentScreen('details');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>
          Se încarcă stocul și datele...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>
          Nu s-au putut încărca datele
        </Text>
        <Text style={styles.errorText}>
          Stocul nu a fost deschis pentru a evita modificarea accidentală a datelor.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadStock}
        >
          <Text style={styles.retryButtonText}>
            Încearcă din nou
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ECRAN SCANARE QR

  if (currentScreen === 'scan') {
    return (
      <QrScannerScreen
        onClose={() => setCurrentScreen('home')}
        onCodeScanned={handleMainQrScanned}
      />
    );
  }

  // ADAUGARE PIESE

  if (currentScreen === 'add') {
    return (
      <AddPartScreen
        goBack={() => setCurrentScreen('home')}
        onSavePartToStock={handleSavePartToStock}
        lots={lots}
        donorCars={donorCars}
        stockParts={stockParts}
      />
    );
  }

  // DETALII PIESĂ

  if (currentScreen === 'details') {
    return (
      <PartDetailsScreen
        part={selectedPart}
        goBack={() => setCurrentScreen(detailsReturnScreen)}
        onSellPart={handleSellPart}
        lots={lots}
        donorCars={donorCars}
      />
    );
  }

  // STOC

  if (currentScreen === 'stock') {
    return (
      <StockScreen
        stockParts={stockParts}
        goBack={() => setCurrentScreen('home')}
        onDeletePart={handleDeletePart}
        onOpenPart={part => {
          setSelectedPart(part);
          setDetailsReturnScreen('stock');
          setCurrentScreen('details');
        }}
      />
    );
  }

  // VÂNZĂRI

  if (currentScreen === 'sales') {
    return (
      <SalesScreen
        sales={sales}
        lots={lots}
        donorCars={donorCars}
        expenses={expenses}
        stockParts={stockParts}
        goBack={() => setCurrentScreen('home')}
      />
    );
  }

  // LOTURI ȘI MAȘINI DONATOARE

  if (currentScreen === 'cars') {
    return (
      <AddCarScreen
        goBack={() => setCurrentScreen('home')}
        lots={lots}
        donorCars={donorCars}
        expenses={expenses}
        onSaveLot={handleSaveLot}
        onSaveDonorCar={handleSaveDonorCar}
        onSaveExpense={handleSaveExpense}
        onDeleteExpense={handleDeleteExpense}
        onDeleteLot={handleDeleteLot}
        onDeleteDonorCar={handleDeleteDonorCar}
      />
    );
  }

  // PAGINA PRINCIPALĂ

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>KOW Auto Parts</Text>
        <Text style={styles.headerSub}>
          Gestionare Stoc & Piese Auto
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Caută denumire, OEM, producător, QR..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          returnKeyType="search"
        />

        {normalizedSearch ? (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsTitle}>
              {searchResults.length > 0
                ? `Rezultate (${allSearchResults.length}${allSearchResults.length > 8 ? '+' : ''})`
                : 'Nu am găsit nicio piesă'}
            </Text>

            {searchResults.map(part => {
              const matchedCodes = getPartSearchMatches(
                part,
                searchQuery
              );

              return (
                <TouchableOpacity
                  key={String(part.id)}
                  style={styles.searchResultItem}
                  onPress={() => openSearchResult(part)}
                >
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>
                      {part.partName || 'Piesă fără denumire'}
                    </Text>

                    <Text style={styles.searchResultMeta}>
                      {[
                        part.carMake,
                        part.carModel,
                        part.engineCode,
                      ].filter(Boolean).join(' ')}
                    </Text>

                    {matchedCodes.length > 0 ? (
                      <View style={styles.matchContainer}>
                        {matchedCodes.slice(0, 3).map((match, index) => (
                          <Text
                            key={`${match.path}-${index}`}
                            style={styles.matchText}
                          >
                            {match.label}: {match.value}
                          </Text>
                        ))}
                        {matchedCodes.length > 3 ? (
                          <Text style={styles.matchText}>
                            + încă {matchedCodes.length - 3} potriviri
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={styles.searchResultMeta}>
                        {part.oemCode
                          ? `OEM: ${part.oemCode}`
                          : part.producerCode
                            ? `Producător: ${part.producerCode}`
                            : `QR: ${part.qrCode || part.id}`}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.searchResultArrow}>›</Text>
                </TouchableOpacity>
              );
            })}

            {allSearchResults.length > 8 ? (
              <Text style={styles.moreResultsText}>
                Sunt mai multe rezultate. Deschide Stoc piese pentru lista completă.
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.homeScroll}
        contentContainerStyle={styles.homeScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            setSearchQuery('');
            setCurrentScreen('cars');
          }}
        >
          <Text style={styles.navButtonIcon}>🚗</Text>
          <Text style={styles.navButtonText}>
            Proveniență: loturi și mașini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            setSearchQuery('');
            setCurrentScreen('sales');
          }}
        >
          <Text style={styles.navButtonIcon}>💰</Text>
          <Text style={styles.navButtonText}>
            Vânzări ({sales.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButtonScan}
          onPress={() => {
            setSearchQuery('');
            setCurrentScreen('scan');
          }}
        >
          <Text style={styles.navButtonIcon}>📷</Text>
          <Text style={styles.navButtonTextScan}>
            Scanează cod QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setSearchQuery('');
            setCurrentScreen('add');
          }}
        >
          <Text style={styles.primaryButtonIcon}>➕</Text>
          <View>
            <Text style={styles.primaryButtonTitle}>
              Adaugă piesă
            </Text>
            <Text style={styles.primaryButtonDesc}>
              Formular detalii și poze
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setSearchQuery('');
            setCurrentScreen('stock');
          }}
        >
          <Text style={styles.secondaryButtonIcon}>📦</Text>
          <View>
            <Text style={styles.secondaryButtonTitle}>
              Stoc piese ({stockParts.length})
            </Text>
            <Text style={styles.secondaryButtonDesc}>
              Vezi piesele salvate
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    padding: 16,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F1115',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#E2E8F0',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 16,
    zIndex: 2,
  },
  searchInput: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
  },
  searchResults: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    marginTop: 6,
    padding: 10,
    maxHeight: 300,
  },
  searchResultsTitle: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#293241',
    paddingVertical: 10,
  },
  searchResultInfo: {
    flex: 1,
    paddingRight: 10,
  },
  searchResultName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchResultMeta: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 3,
  },
  matchContainer: {
    marginTop: 4,
  },
  matchText: {
    color: '#60A5FA',
    fontSize: 11,
    marginTop: 3,
  },
  searchResultArrow: {
    color: '#60A5FA',
    fontSize: 25,
    fontWeight: 'bold',
  },
  moreResultsText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  homeScroll: {
    flex: 1,
  },
  homeScrollContent: {
    paddingBottom: 30,
  },
  navButton: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  navButtonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  navButtonScan: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  navButtonTextScan: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  primaryButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  secondaryButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
});
