import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const INITIAL_LOTS = [
  { id: 'L1', name: 'Lot #1 - Anglia Septembrie' },
  { id: 'L2', name: 'Lot #2 - Germania Octombrie' },
];

const INITIAL_CARS = [
  { id: 'C1', name: 'VW Golf 5 - 2.0 TDI BKC (2006)', lotId: 'L1' },
  { id: 'C2', name: 'Audi A4 B7 - 2.0 TDI BLB (2007)', lotId: 'L2' },
  { id: 'C3', name: 'BMW E90 - 320d M47 (2006)', lotId: null },
];

const INITIAL_CATEGORIES = {
  'Motor și anexe': ['Alternator', 'Electromotor', 'Turbosuflantă', 'Injectoare', 'Chiulasă'],
  'Transmisie': ['Cutie viteze', 'Cardan', 'Grup diferențial', 'Planetară', 'Volantă'],
  'Punți': ['Punte față', 'Punte spate', 'Fuzetă', 'Braț suspensie'],
  'Caroserie și exterior': ['Bară față', 'Capotă', 'Far', 'Aripă', 'Portieră', 'Haion'],
  'Interior': ['Scaune', 'Volan', 'Planșă bord', 'Ceasuri bord', 'Cotieră'],
  'Suspensie și direcție': ['Casetă direcție', 'Amortizor', 'Arc', 'Pompă servodirecție'],
  'Sistem frânare': ['Etrier', 'Pompă ABS', 'Disc frână', 'Servofrână'],
  'Electrice': ['Calculator motor (ECU)', 'Panou siguranțe', 'Senzor', 'Macara geam'],
};

const POSITIONS_LIST = [
  'Stânga', 'Dreapta', 'Față', 'Spate', 'Mijloc', 'Sus', 'Jos',
  'Stânga față', 'Stânga spate', 'Dreapta față', 'Dreapta spate',
];

const PAST_PARTS_MEMORY = [
  {
    oem: '03G903023',
    partName: 'Alternator 140A Bosch',
    producer: 'Bosch 0124525050',
    compatibleOems: ['03G903023A', '03L903023F'],
    compatibleVehicles: ['VW Golf 5 (2004-2009)', 'Skoda Octavia 2 (2004-2010)'],
    price: '350',
    currency: 'LEI',
  },
];

export default function AddPartScreen({ goBack }) {
  const [step, setStep] = useState('menu');

  const [photosCount, setPhotosCount] = useState(0);
  const [qrCode, setQrCode] = useState('');

  const [partName, setPartName] = useState('');
  const [partNameHistory, setPartNameHistory] = useState(['Alternator 2.0 TDI', 'Far H7', 'Bară față', 'Cutie viteze 6 trepte']);

  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [manualBrand, setManualBrand] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [manualYear, setManualYear] = useState('');

  const [categoriesData, setCategoriesData] = useState(INITIAL_CATEGORIES);
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [newSubcatText, setNewSubcatText] = useState('');
  const [colorCode, setColorCode] = useState('');

  const [oemCode, setOemCode] = useState('');
  const [oemHistory, setOemHistory] = useState(['03G903023', '8E0941003', '1K0807221']);
  const [compatibleOems, setCompatibleOems] = useState([]);
  const [newCompatOem, setNewCompatOem] = useState('');

  const [compatBrand, setCompatBrand] = useState('');
  const [compatModel, setCompatModel] = useState('');
  const [compatYear, setCompatYear] = useState('');
  const [compatibleVehicles, setCompatibleVehicles] = useState([]);

  const [producerCode, setProducerCode] = useState('');
  const [producerHistory, setProducerHistory] = useState(['Bosch', 'Valeo', 'Luk', 'Delphi']);

  const [selectedPositions, setSelectedPositions] = useState([]);
  const [showPositionsList, setShowPositionsList] = useState(false);

  const [condition, setCondition] = useState('Stare bună');
  const [defectDetails, setDefectDetails] = useState('');

  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('LEI');

  const [locationType, setLocationType] = useState('Depozit');
  const [locRaft, setLocRaft] = useState('');
  const [locColoana, setLocColoana] = useState('');
  const [locNivel, setLocNivel] = useState('');
  const [yardCustomLoc, setYardCustomLoc] = useState('');
  const [yardHistory, setYardHistory] = useState(['Platformă spate', 'După garaj', 'Sub copertină', 'Container 2']);

  const [otherDetails, setOtherDetails] = useState('');

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    if (car.lotId) {
      const foundLot = INITIAL_LOTS.find((l) => l.id === car.lotId);
      if (foundLot) setSelectedLot(foundLot);
    }
    setStep('form');
  };

  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
    setSelectedCar(null);
    setStep('form');
  };

  const handleOemChange = (text) => {
    setOemCode(text);
    const cleanText = text.trim().toUpperCase();
    if (!cleanText) return;

    const match = PAST_PARTS_MEMORY.find(
      (p) => p.oem.toUpperCase() === cleanText || p.compatibleOems.some((c) => c.toUpperCase() === cleanText)
    );

    if (match) {
      if (!partName) setPartName(match.partName);
      if (!producerCode) setProducerCode(match.producer);
      if (!price) setPrice(match.price);
      setCurrency(match.currency);

      const allRelated = Array.from(new Set([match.oem, ...match.compatibleOems])).filter(
        (c) => c.toUpperCase() !== cleanText
      );
      setCompatibleOems(allRelated);
      setCompatibleVehicles(match.compatibleVehicles);
    }
  };

  const addSubcategory = () => {
    if (!newSubcatText.trim() || !activeCategoryModal) return;
    const trimmed = newSubcatText.trim();
    const updatedList = Array.from(new Set([...(categoriesData[activeCategoryModal] || []), trimmed]));
    setCategoriesData({ ...categoriesData, [activeCategoryModal]: updatedList });
    if (!selectedSubcategories.includes(trimmed)) {
      setSelectedSubcategories([...selectedSubcategories, trimmed]);
    }
    if (!selectedCategories.includes(activeCategoryModal)) {
      setSelectedCategories([...selectedCategories, activeCategoryModal]);
    }
    setNewSubcatText('');
  };

  const toggleSubcategory = (cat, sub) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter((s) => s !== sub));
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
      if (!selectedCategories.includes(cat)) {
        setSelectedCategories([...selectedCategories, cat]);
      }
    }
  };

  const togglePosition = (pos) => {
    if (selectedPositions.includes(pos)) {
      setSelectedPositions(selectedPositions.filter((p) => p !== pos));
    } else {
      setSelectedPositions([...selectedPositions, pos]);
    }
  };

  const addCompatVehicle = () => {
    if (!compatBrand.trim() && !compatModel.trim()) return;
    const entry = `${compatBrand.trim()} ${compatModel.trim()} ${compatYear ? `(${compatYear.trim()})` : ''}`.trim();
    if (!compatibleVehicles.includes(entry)) {
      setCompatibleVehicles([...compatibleVehicles, entry]);
    }
    setCompatBrand('');
    setCompatModel('');
    setCompatYear('');
  };

  const handleSavePart = () => {
    if (!partName.trim()) {
      Alert.alert('Atenție', 'Te rog completează numele piesei!');
      return;
    }

    const today = new Date().toLocaleDateString('ro-RO');
    if (!partNameHistory.includes(partName.trim())) {
      setPartNameHistory([partName.trim(), ...partNameHistory]);
    }
    if (locationType === 'Curte' && yardCustomLoc.trim() && !yardHistory.includes(yardCustomLoc.trim())) {
      setYardHistory([yardCustomLoc.trim(), ...yardHistory]);
    }

    Alert.alert(
      '✅ Piesă Salvată în Stoc!',
      `Piesa "${partName}" a fost adăugată ca o bucată nouă pe data de ${today}.\n` +
        (qrCode ? `Cod QR asociat: ${qrCode}\n` : '') +
        (selectedCar ? `Mașină: ${selectedCar.name}\n` : '') +
        (selectedLot ? `Lot: ${selectedLot.name}` : '')
    );
    goBack();
  };

  if (step === 'menu') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>⬅ Acasă</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Intrare Stoc Piese</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.menuCenter}>
          <Text style={styles.menuSubtitle}>Alege modul de adăugare a piesei:</Text>

          <TouchableOpacity style={styles.bigMenuBtnPrimary} onPress={() => setStep('form')}>
            <Text style={styles.bigMenuIcon}>➕</Text>
            <View>
              <Text style={styles.bigMenuTitle}>Adaugă piesă</Text>
              <Text style={styles.bigMenuDesc}>Deschide formularul complet de detalii</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bigMenuBtn} onPress={() => setStep('select_car')}>
            <Text style={styles.bigMenuIcon}>🚗</Text>
            <View>
              <Text style={styles.bigMenuTitle}>Selectează mașină</Text>
              <Text style={styles.bigMenuDesc}>Preia automat mașina și lotul ei</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bigMenuBtn} onPress={() => setStep('select_lot')}>
            <Text style={styles.bigMenuIcon}>📦</Text>
            <View>
              <Text style={styles.bigMenuTitle}>Selectează lot</Text>
              <Text style={styles.bigMenuDesc}>Asociază piesa direct unui lot</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'select_car') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('menu')} style={styles.backButton}>
            <Text style={styles.backButtonText}>⬅ Înapoi</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selectează Mașina</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView>
          {INITIAL_CARS.map((car) => {
            const lot = INITIAL_LOTS.find((l) => l.id === car.lotId);
            return (
              <TouchableOpacity key={car.id} style={styles.selectListItem} onPress={() => handleSelectCar(car)}>
                <Text style={styles.selectListTitle}>🚗 {car.name}</Text>
                <Text style={styles.selectListSub}>
                  {lot ? `Provine din: ${lot.name}` : 'Fără lot asociat'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  if (step === 'select_lot') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('menu')} style={styles.backButton}>
            <Text style={styles.backButtonText}>⬅ Înapoi</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selectează Lotul</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView>
          {INITIAL_LOTS.map((lot) => (
            <TouchableOpacity key={lot.id} style={styles.selectListItem} onPress={() => handleSelectLot(lot)}>
              <Text style={styles.selectListTitle}>📦 {lot.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  const hasCarrosserie = selectedCategories.includes('Caroserie și exterior');

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('menu')} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Meniu</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalii Piesă Nouă</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📸 Multimedia & Identificare QR</Text>
        <View style={styles.grid2}>
          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => setPhotosCount((prev) => prev + 1)}
          >
            <Text style={styles.mediaBtnText}>🖼️ Adaugă poze ({photosCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => setPhotosCount((prev) => prev + 1)}
          >
            <Text style={styles.mediaBtnText}>📷 Fă poze acum</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => setQrCode(`QR-${Math.floor(1000 + Math.random() * 9000)}`)}
          >
            <Text style={styles.mediaBtnText}>📱 Scanează cod QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaBtn}
            onPress={() => setQrCode(`QR-${Math.floor(1000 + Math.random() * 9000)}`)}
          >
            <Text style={styles.mediaBtnText}>🔍 Poză pt cod QR</Text>
          </TouchableOpacity>
        </View>

        {qrCode !== '' && (
          <View style={styles.qrSuccessBadge}>
            <Text style={styles.qrSuccessText}>✅ Cod QR atașat: {qrCode}</Text>
            <TouchableOpacity onPress={() => setQrCode('')}>
              <Text style={styles.qrRemoveText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>1. Nume piesă *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Alternator 2.0 TDI, Far stânga..."
          placeholderTextColor="#6B7280"
          value={partName}
          onChangeText={setPartName}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoryScroll}>
          {partNameHistory.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.memoryPill} onPress={() => setPartName(item)}>
              <Text style={styles.memoryPillText}>🕒 {item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { marginTop: 12 }]}>2. Selectează Lot / 3. Selectează Mașină</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.selectorBox, { flex: 1, marginRight: 6 }]}
            onPress={() => setStep('select_lot')}
          >
            <Text style={styles.selectorBoxLabel}>Lot:</Text>
            <Text style={styles.selectorBoxValue} numberOfLines={1}>
              {selectedLot ? selectedLot.name : 'Alege lot...'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectorBox, { flex: 1, marginLeft: 6 }]}
            onPress={() => setStep('select_car')}
          >
            <Text style={styles.selectorBoxLabel}>Mașină:</Text>
            <Text style={styles.selectorBoxValue} numberOfLines={1}>
              {selectedCar ? selectedCar.name : 'Alege mașină...'}
            </Text>
          </TouchableOpacity>
        </View>

        {(selectedCar || selectedLot) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedCar(null);
              setSelectedLot(null);
            }}
            style={styles.clearSelectionBtn}
          >
            <Text style={styles.clearSelectionText}>✕ Resetează selecția Mașină / Lot</Text>
          </TouchableOpacity>
        )}

        {!selectedCar && !selectedLot && (
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackTitle}>Date vehicul (dacă nu e din lot/mașină):</Text>
            <TextInput
              style={styles.input}
              placeholder="A. Marcă (ex: Volkswagen, BMW...)"
              placeholderTextColor="#6B7280"
              value={manualBrand}
              onChangeText={setManualBrand}
            />
            <TextInput
              style={styles.input}
              placeholder="B. Model (ex: Passat B6, E90...)"
              placeholderTextColor="#6B7280"
              value={manualModel}
              onChangeText={setManualModel}
            />
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              placeholder="C. An fabricație (ex: 2008)"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={manualYear}
              onChangeText={setManualYear}
            />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>4. Categorii Principale (Apasă pentru subcategorii)</Text>
        <View style={styles.chipsWrap}>
          {Object.keys(categoriesData).map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setActiveCategoryModal(cat)}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedSubcategories.length > 0 && (
          <View style={styles.selectedTagsBox}>
            <Text style={styles.subLabel}>Subcategorii selectate:</Text>
            <View style={styles.chipsWrap}>
              {selectedSubcategories.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={styles.subTagActive}
                  onPress={() => setSelectedSubcategories(selectedSubcategories.filter((s) => s !== sub))}
                >
                  <Text style={styles.subTagText}>✓ {sub} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {hasCarrosserie && (
          <View style={styles.colorBox}>
            <Text style={styles.colorLabel}>🎨 12. Cod Culoare / Denumire Culoare *</Text>
            <TextInput
              style={[styles.input, { marginBottom: 0 }]}
              placeholder="Ex: LA7W, LC9X, Negru metalizat..."
              placeholderTextColor="#6B7280"
              value={colorCode}
              onChangeText={setColorCode}
            />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>5. Cod OEM (Auto-recunoaștere & Memorie)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 03G903023 (încearcă acest cod pt test)"
          placeholderTextColor="#6B7280"
          value={oemCode}
          onChangeText={handleOemChange}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoryScroll}>
          {oemHistory.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.memoryPill} onPress={() => handleOemChange(item)}>
              <Text style={styles.memoryPillText}>🔖 {item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.label, { marginTop: 12 }]}>5.1 Compatibil cu (Alte coduri OEM)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
            placeholder="Adaugă cod OEM echivalent..."
            placeholderTextColor="#6B7280"
            value={newCompatOem}
            onChangeText={setNewCompatOem}
          />
          <TouchableOpacity
            style={styles.addPlusBtn}
            onPress={() => {
              if (newCompatOem.trim()) {
                setCompatibleOems([...compatibleOems, newCompatOem.trim()]);
                setNewCompatOem('');
              }
            }}
          >
            <Text style={styles.addPlusBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.chipsWrap, { marginTop: 8 }]}>
          {compatibleOems.map((c, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.subTagActive}
              onPress={() =>
