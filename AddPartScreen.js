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
import * as ImagePicker from 'expo-image-picker';

const INITIAL_LOTS = [
  { id: 'L1', name: 'Lot #1 - Anglia' },
  { id: 'L2', name: 'Lot #2 - Germania' },
];

const INITIAL_CARS = [
  { id: 'C1', name: 'VW Golf 5 - 2.0 TDI (2006)', lotId: 'L1' },
  { id: 'C2', name: 'Audi A4 B7 - 2.0 TDI (2007)', lotId: 'L2' },
];

const INITIAL_CATEGORIES = {
  'Motor și anexe': ['Alternator', 'Chiulasă', 'Electromotor', 'Injectoare', 'Turbosuflantă'].sort(),
  'Transmisie': ['Cardan', 'Cutie viteze', 'Grup', 'Planetară', 'Volantă'].sort(),
  'Punți': ['Braț', 'Fuzetă', 'Punte față', 'Punte spate'].sort(),
  'Caroserie și exterior': ['Aripă', 'Bară față', 'Capotă', 'Far', 'Haion', 'Portieră'].sort(),
  'Interior': ['Ceasuri bord', 'Cotieră', 'Planșă bord', 'Scaune', 'Volan'].sort(),
  'Suspensie și direcție': ['Amortizor', 'Arc', 'Casetă direcție', 'Pompă servo'].sort(),
  'Sistem frânare': ['Disc frână', 'Etrier', 'Pompă ABS', 'Servofrână'].sort(),
  'Electrice': ['Calculator ECU', 'Macara geam', 'Panou siguranțe', 'Senzor'].sort(),
};

const POSITIONS_LIST = [
  'Stânga', 'Dreapta', 'Față', 'Spate', 'Mijloc', 'Sus', 'Jos',
  'Stânga față', 'Stânga spate', 'Dreapta față', 'Dreapta spate',
];

export default function AddPartScreen({ goBack, onSavePartToStock }) {
  const [step, setStep] = useState('menu');
  const [photos, setPhotos] = useState([]);
  const [qrCode, setQrCode] = useState('');

  const [partName, setPartName] = useState('');
  const [partNameHistory] = useState(['Alternator 2.0 TDI', 'Far stânga H7', 'Bară față Golf 5', 'Clapetă accelerație']);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

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
  const [oemHistory] = useState(['03G903023', '8E0941003', '1K0807221']);
  const [showOemSuggestions, setShowOemSuggestions] = useState(false);
  const [compatibleOems, setCompatibleOems] = useState([]);
  const [newCompatOem, setNewCompatOem] = useState('');
      const [brandsList, setBrandsList] = useState(['Volkswagen', 'Audi', 'Skoda', 'BMW', 'Mercedes'].sort());
  const [modelsList, setModelsList] = useState(['Golf 5', 'Passat B6', 'Octavia 2', 'A4 B7', 'E90'].sort());
  const [yearsList] = useState(['2004', '2005', '2006', '2007', '2008', '2009', '2010']);

  const [compatBrand, setCompatBrand] = useState('');
  const [compatModel, setCompatModel] = useState('');
  const [compatYear, setCompatYear] = useState('');
  const [compatibleVehicles, setCompatibleVehicles] = useState([]);

  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [customBrandInput, setCustomBrandInput] = useState('');
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');

  const [producerCode, setProducerCode] = useState('');
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
  const [otherDetails, setOtherDetails] = useState('');

  const handlePickGalleryImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setPhotos([...photos, ...result.assets.map(a => a.uri)]);
    }
  };

  const handleCameraCapture = async () => {
    let perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Eroare', 'Permisiune cameră refuzată!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleScanQrCamera = () => {
    const generated = `QR-KOW-${Math.floor(1000 + Math.random() * 9000)}`;
    setQrCode(generated);
  };

  const addSubcategory = () => {
    if (!newSubcatText.trim() || !activeCategoryModal) return;
    const trimmed = newSubcatText.trim();
    const updatedList = Array.from(new Set([...(categoriesData[activeCategoryModal] || []), trimmed])).sort();
    setCategoriesData({ ...categoriesData, [activeCategoryModal]: updatedList });
    if (!selectedSubcategories.includes(trimmed)) setSelectedSubcategories([...selectedSubcategories, trimmed]);
    if (!selectedCategories.includes(activeCategoryModal)) setSelectedCategories([...selectedCategories, activeCategoryModal]);
    setNewSubcatText('');
  };

  const toggleSubcategory = (cat, sub) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
      if (!selectedCategories.includes(cat)) setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const togglePosition = (pos) => {
    setSelectedPositions(selectedPositions.includes(pos) ? selectedPositions.filter(p => p !== pos) : [...selectedPositions, pos]);
  };

  const addCompatVehicle = () => {
    if (!compatBrand.trim() && !compatModel.trim()) return;
    const entry = `${compatBrand.trim()} ${compatModel.trim()} ${compatYear ? `(${compatYear.trim()})` : ''}`.trim();
    if (!compatibleVehicles.includes(entry)) setCompatibleVehicles([...compatibleVehicles, entry]);
    setCompatBrand(''); setCompatModel(''); setCompatYear('');
  };

  const handleSavePart = () => {
    if (!partName.trim()) {
      Alert.alert('Atenție', 'Completează numele piesei!');
      return;
    }
    const newPartData = {
      id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      partName,
      lot: selectedLot ? selectedLot.name : null,
      car: selectedCar ? selectedCar.name : null,
      manualVehicle: !selectedCar && !selectedLot ? `${manualBrand} ${manualModel} (${manualYear})` : null,
      categories: selectedCategories,
      subcategories: selectedSubcategories,
      colorCode: colorCode || null,
      oemCode, compatibleOems, compatibleVehicles, producerCode,
      positions: selectedPositions, condition,
      defectDetails: condition === 'Stare ok cu defect' ? defectDetails : null,
      price: price ? `${price} ${currency}` : '0 RON',
      location: locationType === 'Depozit' ? `Depozit: Raft ${locRaft}, Col ${locColoana}, Niv ${locNivel}` : locationType === 'Curte' ? `Curte: ${yardCustomLoc}` : 'Mașină',
      otherDetails, qrCode: qrCode || 'Fără QR', photosCount: photos.length,
      dateAdded: new Date().toLocaleDateString('ro-RO'),
    };
    if (onSavePartToStock) onSavePartToStock(newPartData);
    Alert.alert('✅ Salvat!', `Piesa "${partName}" a fost adăugată.`);
    goBack();
  };
        if (step === 'menu') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}><Text style={styles.backButtonText}>⬅ Acasă</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Intrare Stoc Piese</Text><View style={{ width: 60 }} />
        </View>
        <View style={styles.menuCenter}>
          <Text style={styles.menuSubtitle}>Alege modul de adăugare:</Text>
          <TouchableOpacity style={styles.bigMenuBtnPrimary} onPress={() => setStep('form')}><Text style={styles.bigMenuIcon}>➕</Text><View><Text style={styles.bigMenuTitle}>Adaugă piesă</Text><Text style={styles.bigMenuDesc}>Formular detalii</Text></View></TouchableOpacity>
          <TouchableOpacity style={styles.bigMenuBtn} onPress={() => setStep('select_car')}><Text style={styles.bigMenuIcon}>🚗</Text><View><Text style={styles.bigMenuTitle}>Selectează mașină</Text><Text style={styles.bigMenuDesc}>Preia mașina și lotul</Text></View></TouchableOpacity>
          <TouchableOpacity style={styles.bigMenuBtn} onPress={() => setStep('select_lot')}><Text style={styles.bigMenuIcon}>📦</Text><View><Text style={styles.bigMenuTitle}>Selectează lot</Text><Text style={styles.bigMenuDesc}>Asociază la lot</Text></View></TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'select_car') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backButton}><Text style={styles.backButtonText}>⬅ Înapoi</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Selectează Mașina</Text><View style={{ width: 60 }} />
        </View>
        <ScrollView>{INITIAL_CARS.map(car => (<TouchableOpacity key={car.id} style={styles.selectListItem} onPress={() => { setSelectedCar(car); const l = INITIAL_LOTS.find(x => x.id === car.lotId); if (l) setSelectedLot(l); setStep('form'); }}><Text style={styles.selectListTitle}>🚗 {car.name}</Text></TouchableOpacity>))}</ScrollView>
      </View>
    );
  }

  if (step === 'select_lot') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backButton}><Text style={styles.backButtonText}>⬅ Înapoi</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Selectează Lotul</Text><View style={{ width: 60 }} />
        </View>
        <ScrollView>{INITIAL_LOTS.map(lot => (<TouchableOpacity key={lot.id} style={styles.selectListItem} onPress={() => { setSelectedLot(lot); setSelectedCar(null); setStep('form'); }}><Text style={styles.selectListTitle}>📦 {lot.name}</Text></TouchableOpacity>))}</ScrollView>
      </View>
    );
  }

  if (step === 'qr_picker') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backButton}><Text style={styles.backButtonText}>⬅ Înapoi</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Selectează Poză QR</Text><View style={{ width: 60 }} />
        </View>
        <ScrollView>
          {photos.length === 0 ? <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>Nicio poză adăugată!</Text> : photos.map((uri, idx) => (<TouchableOpacity key={idx} style={styles.selectListItem} onPress={() => { setQrCode(`QR-PHOTO-${idx + 1}`); setStep('form'); }}><Text style={styles.selectListTitle}>🖼️ Poză #{idx + 1}</Text></TouchableOpacity>))}
        </ScrollView>
      </View>
    );
  }

  const hasCarrosserie = selectedCategories.includes('Caroserie și exterior');
  const filteredNameSuggestions = partName.trim() ? partNameHistory.filter(i => i.toLowerCase().includes(partName.toLowerCase())) : [];
  const filteredOemSuggestions = oemCode.trim() ? oemHistory.filter(i => i.toLowerCase().includes(oemCode.toLowerCase())) : [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('menu')} style={styles.backButton}><Text style={styles.backButtonText}>⬅ Meniu</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalii Piesă</Text><View style={{ width: 60 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📸 Multimedia & QR</Text>
        <View style={styles.grid2}>
          <TouchableOpacity style={styles.mediaBtn} onPress={handlePickGalleryImages}><Text style={styles.mediaBtnText}>🖼️ Galerie ({photos.length})</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={handleCameraCapture}><Text style={styles.mediaBtnText}>📷 Cameră</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={handleScanQrCamera}><Text style={styles.mediaBtnText}>📱 Scanează QR</Text></TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => setStep('qr_picker')}><Text style={styles.mediaBtnText}>🔍 Poză QR</Text></TouchableOpacity>
        </View>
        {qrCode !== '' && (<View style={styles.qrSuccessBadge}><Text style={styles.qrSuccessText}>✅ {qrCode}</Text><TouchableOpacity onPress={() => setQrCode('')}><Text style={styles.qrRemoveText}>✕</Text></TouchableOpacity></View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>1. Nume piesă *</Text>
        <TextInput style={styles.input} placeholder="Nume piesă..." placeholderTextColor="#6B7280" value={partName} onChangeText={t => { setPartName(t); setShowNameSuggestions(true); }} />
        {showNameSuggestions && filteredNameSuggestions.length > 0 && (
          <View style={styles.suggestionsBox}>{filteredNameSuggestions.map((s, i) => (<TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => { setPartName(s); setShowNameSuggestions(false); }}><Text style={styles.suggestionText}>💡 {s}</Text></TouchableOpacity>))}</View>
        )}
        <Text style={[styles.label, { marginTop: 12 }]}>2 & 3. Lot / Mașină</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.selectorBox, { flex: 1, marginRight: 6 }]} onPress={() => setStep('select_lot')}><Text style={styles.selectorBoxLabel}>Lot:</Text><Text style={styles.selectorBoxValue} numberOfLines={1}>{selectedLot ? selectedLot.name : 'Alege...'}</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.selectorBox, { flex: 1, marginLeft: 6 }]} onPress={() => setStep('select_car')}><Text style={styles.selectorBoxLabel}>Mașină:</Text><Text style={styles.selectorBoxValue} numberOfLines={1}>{selectedCar ? selectedCar.name : 'Alege...'}</Text></TouchableOpacity>
        </View>
        {!selectedCar && !selectedLot && (
          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackTitle}>Alte date vehicul:</Text>
            <TextInput style={styles.input} placeholder="Marcă" placeholderTextColor="#6B7280" value={manualBrand} onChangeText={setManualBrand} />
            <TextInput style={styles.input} placeholder="Model" placeholderTextColor="#6B7280" value={manualModel} onChangeText={setManualModel} />
            <TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="An" placeholderTextColor="#6B7280" keyboardType="numeric" value={manualYear} onChangeText={setManualYear} />
          </View>
        )}
      </View>
                <View style={styles.card}>
        <Text style={styles.label}>4. Categorii Principale</Text>
        <View style={styles.chipsWrap}>{Object.keys(categoriesData).map(cat => (<TouchableOpacity key={cat} style={[styles.catChip, selectedCategories.includes(cat) && styles.catChipActive]} onPress={() => setActiveCategoryModal(cat)}><Text style={[styles.catChipText, selectedCategories.includes(cat) && styles.catChipTextActive]}>{cat}</Text></TouchableOpacity>))}</View>
        {selectedSubcategories.length > 0 && (<View style={styles.selectedTagsBox}><Text style={styles.subLabel}>Subcategorii:</Text><View style={styles.chipsWrap}>{selectedSubcategories.map(sub => (<TouchableOpacity key={sub} style={styles.subTagActive} onPress={() => setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub))}><Text style={styles.subTagText}>✓ {sub} ✕</Text></TouchableOpacity>))}</View></View>)}
        {hasCarrosserie && (<View style={styles.colorBox}><Text style={styles.colorLabel}>🎨 Cod Culoare</Text><TextInput style={[styles.input, { marginBottom: 0 }]} placeholder="Ex: LA7W..." placeholderTextColor="#6B7280" value={colorCode} onChangeText={setColorCode} /></View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>5. Cod OEM</Text>
        <TextInput style={styles.input} placeholder="OEM..." placeholderTextColor="#6B7280" value={oemCode} onChangeText={t => { setOemCode(t); setShowOemSuggestions(true); }} />
        {showOemSuggestions && filteredOemSuggestions.length > 0 && (
          <View style={styles.suggestionsBox}>{filteredOemSuggestions.map((s, i) => (<TouchableOpacity key={i} style={styles.suggestionItem} onPress={() => { setOemCode(s); setShowOemSuggestions(false); }}><Text style={styles.suggestionText}>💡 {s}</Text></TouchableOpacity>))}</View>
        )}
        <Text style={[styles.label, { marginTop: 12 }]}>5.1 Coduri OEM Compatibile</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]} placeholder="OEM echivalent..." placeholderTextColor="#6B7280" value={newCompatOem} onChangeText={setNewCompatOem} />
          <TouchableOpacity style={styles.addPlusBtn} onPress={() => { if (newCompatOem.trim()) { setCompatibleOems([...compatibleOems, newCompatOem.trim()]); setNewCompatOem(''); } }}><Text style={styles.addPlusBtnText}>+</Text></TouchableOpacity>
        </View>
        <View style={[styles.chipsWrap, { marginTop: 8 }]}>{compatibleOems.map((c, i) => (<TouchableOpacity key={i} style={styles.subTagActive} onPress={() => setCompatibleOems(compatibleOems.filter((_, idx) => idx !== i))}><Text style={styles.subTagText}>{c} ✕</Text></TouchableOpacity>))}</View>

        <Text style={[styles.label, { marginTop: 14 }]}>5.2 Compatibilitate Vehicule</Text>
        <View style={{ gap: 8 }}>
          <View style={styles.row}><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginRight: 8 }}>{brandsList.map(b => (<TouchableOpacity key={b} style={[styles.memoryPill, compatBrand === b && { backgroundColor: '#DC2626' }]} onPress={() => setCompatBrand(b)}><Text style={[styles.memoryPillText, compatBrand === b && { color: '#FFF' }]}>{b}</Text></TouchableOpacity>))}</ScrollView><TouchableOpacity style={styles.addPlusBtn} onPress={() => setShowAddBrandModal(true)}><Text style={styles.addPlusBtnText}>+</Text></TouchableOpacity></View>
          <View style={styles.row}><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginRight: 8 }}>{modelsList.map(m => (<TouchableOpacity key={m} style={[styles.memoryPill, compatModel === m && { backgroundColor: '#DC2626' }]} onPress={() => setCompatModel(m)}><Text style={[styles.memoryPillText, compatModel === m && { color: '#FFF' }]}>{m}</Text></TouchableOpacity>))}</ScrollView><TouchableOpacity style={styles.addPlusBtn} onPress={() => setShowAddModelModal(true)}><Text style={styles.addPlusBtnText}>+</Text></TouchableOpacity></View>
          <View style={styles.row}><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginRight: 8 }}>{yearsList.map(y => (<TouchableOpacity key={y} style={[styles.memoryPill, compatYear === y && { backgroundColor: '#DC2626' }]} onPress={() => setCompatYear(y)}><Text style={[styles.memoryPillText, compatYear === y && { color: '#FFF' }]}>{y}</Text></TouchableOpacity>))}</ScrollView><TouchableOpacity style={[styles.addPlusBtn, { backgroundColor: '#10B981' }]} onPress={addCompatVehicle}><Text style={styles.addPlusBtnText}>✓</Text></TouchableOpacity></View>
        </View>
        <View style={[styles.chipsWrap, { marginTop: 10 }]}>{compatibleVehicles.map((v, i) => (<TouchableOpacity key={i} style={styles.subTagActive} onPress={() => setCompatibleVehicles(compatibleVehicles.filter((_, idx) => idx !== i))}><Text style={styles.subTagText}>🚘 {v} ✕</Text></TouchableOpacity>))}</View>

        <Text style={[styles.label, { marginTop: 14 }]}>6. Cod Producător</Text>
        <TextInput style={styles.input} placeholder="Producător..." placeholderTextColor="#6B7280" value={producerCode} onChangeText={setProducerCode} />
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setShowPositionsList(!showPositionsList)}><Text style={styles.label}>7. Poziție ({selectedPositions.length})</Text><Text style={styles.dropdownArrow}>{showPositionsList ? '▲' : '▼'}</Text></TouchableOpacity>
        {showPositionsList && (<View style={[styles.chipsWrap, { marginTop: 10 }]}>{POSITIONS_LIST.map(pos => (<TouchableOpacity key={pos} style={[styles.catChip, selectedPositions.includes(pos) && styles.catChipActive]} onPress={() => togglePosition(pos)}><Text style={[styles.catChipText, selectedPositions.includes(pos) && styles.catChipTextActive]}>{pos}</Text></TouchableOpacity>))}</View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>8. Stare Piesă</Text>
        <View style={styles.chipsWrap}>{['Neverificat', 'Verificat', 'Stare bună', 'Stare ok cu defect'].map(st => (<TouchableOpacity key={st} style={[styles.catChip, condition === st && styles.catChipActive]} onPress={() => setCondition(st)}><Text style={[styles.catChipText, condition === st && styles.catChipTextActive]}>{st}</Text></TouchableOpacity>))}</View>
        {condition === 'Stare ok cu defect' && (<View style={{ marginTop: 12 }}><Text style={styles.defectLabel}>Defect:</Text><TextInput style={[styles.input, { borderColor: '#EF4444', marginBottom: 0 }]} placeholder="Descrie defectul..." placeholderTextColor="#6B7280" value={defectDetails} onChangeText={setDefectDetails} /></View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>9. Preț</Text>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 10, marginBottom: 0 }]} placeholder="Suma..." placeholderTextColor="#6B7280" keyboardType="numeric" value={price} onChangeText={setPrice} />
          <TouchableOpacity style={[styles.currencyBtn, currency === 'LEI' && styles.currencyBtnActive]} onPress={() => setCurrency('LEI')}><Text style={styles.currencyBtnText}>LEI</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.currencyBtn, currency === 'EURO' && styles.currencyBtnActive]} onPress={() => setCurrency('EURO')}><Text style={styles.currencyBtnText}>EURO</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>10. Locație</Text>
        <View style={styles.row}>{['Depozit', 'Curte', 'Mașină'].map(loc => (<TouchableOpacity key={loc} style={[styles.locTabBtn, locationType === loc && styles.locTabBtnActive]} onPress={() => setLocationType(loc)}><Text style={[styles.locTabText, locationType === loc && styles.locTabTextActive]}>{loc}</Text></TouchableOpacity>))}</View>
        {(locationType === 'Depozit' || locationType === 'Curte') && (
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 6, marginBottom: 0 }]} placeholder="Raft" placeholderTextColor="#6B7280" value={locRaft} onChangeText={setLocRaft} />
            <TextInput style={[styles.input, { flex: 1, marginHorizontal: 6, marginBottom: 0 }]} placeholder="Col" placeholderTextColor="#6B7280" value={locColoana} onChangeText={setLocColoana} />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 6, marginBottom: 0 }]} placeholder="Niv" placeholderTextColor="#6B7280" value={locNivel} onChangeText={setLocNivel} />
          </View>
        )}
        {locationType === 'Curte' && (<View style={{ marginTop: 12 }}><TextInput style={styles.input} placeholder="Zonă curte..." placeholderTextColor="#6B7280" value={yardCustomLoc} onChangeText={setYardCustomLoc} /></View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📝 Alte detalii</Text>
        <TextInput style={[styles.input, { height: 70, paddingTop: 8, marginBottom: 0 }]} placeholder="Observații..." placeholderTextColor="#6B7280" multiline={true} value={otherDetails} onChangeText={setOtherDetails} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePart}><Text style={styles.saveButtonText}>💾 Salvează piesa</Text></TouchableOpacity>

      <Modal visible={activeCategoryModal !== null} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{activeCategoryModal}</Text><TouchableOpacity onPress={() => setActiveCategoryModal(null)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity></View>
            <ScrollView style={{ maxHeight: 180, marginVertical: 8 }}><View style={styles.chipsWrap}>{(categoriesData[activeCategoryModal] || []).map(sub => (<TouchableOpacity key={sub} style={[styles.catChip, selectedSubcategories.includes(sub) && styles.catChipActive]} onPress={() => toggleSubcategory(activeCategoryModal, sub)}><Text style={[styles.catChipText, selectedSubcategories.includes(sub) && styles.catChipTextActive]}>{sub}</Text></TouchableOpacity>))}</View></ScrollView>
            <View style={styles.row}><TextInput style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]} placeholder="Subcategorie nouă..." placeholderTextColor="#6B7280" value={newSubcatText} onChangeText={setNewSubcatText} /><TouchableOpacity style={styles.addPlusBtn} onPress={addSubcategory}><Text style={styles.addPlusBtnText}>+</Text></TouchableOpacity></View>
            <TouchableOpacity style={[styles.saveButton, { marginTop: 12, height: 40 }]} onPress={() => setActiveCategoryModal(null)}><Text style={styles.saveButtonText}>Gata</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddBrandModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalCard}><Text style={styles.modalTitle}>Marcă Nouă</Text><TextInput style={[styles.input, { marginVertical: 10 }]} placeholder="Marcă..." placeholderTextColor="#6B7280" value={customBrandInput} onChangeText={setCustomBrandInput} /><View style={styles.row}><TouchableOpacity style={[styles.currencyBtn, { flex: 1, marginRight: 6, backgroundColor: '#374151' }]} onPress={() => setShowAddBrandModal(false)}><Text style={styles.currencyBtnText}>Anulează</Text></TouchableOpacity><TouchableOpacity style={[styles.saveButton, { flex: 1, marginLeft: 6, height: 40, marginTop: 0 }]} onPress={() => { if (customBrandInput.trim()) { const b = customBrandInput.trim(); setBrandsList([...brandsList, b].sort()); setCompatBrand(b); setCustomBrandInput(''); } setShowAddBrandModal(false); }}><Text style={styles.saveButtonText}>Adaugă</Text></TouchableOpacity></View></View></View>
      </Modal>

      <Modal visible={showAddModelModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}><View style={styles.modalCard}><Text style={styles.modalTitle}>Model Nou</Text><TextInput style={[styles.input, { marginVertical: 10 }]} placeholder="Model..." placeholderTextColor="#6B7280" value={customModelInput} onChangeText={setCustomModelInput} /><View style={styles.row}><TouchableOpacity style={[styles.currencyBtn, { flex: 1, marginRight: 6, backgroundColor: '#374151' }]} onPress={() => setShowAddModelModal(false)}><Text style={styles.currencyBtnText}>Anulează</Text></TouchableOpacity><TouchableOpacity style={[styles.saveButton, { flex: 1, marginLeft: 6, height: 40, marginTop: 0 }]} onPress={() => { if (customModelInput.trim()) { const m = customModelInput.trim(); setModelsList([...modelsList, m].sort()); setCompatModel(m); setCustomModelInput(''); } setShowAddModelModal(false); }}><Text style={styles.saveButtonText}>Adaugă</Text></TouchableOpacity></View></View></View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 16 },
  scrollContainer: { backgroundColor: '#0F1115', padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937', paddingBottom: 12 },
  backButton: { backgroundColor: '#161920', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1F2937' },
  backButtonText: { color: '#E2E8F0', fontSize: 13, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  menuCenter: { flex: 1, justifyContent: 'center' },
  menuSubtitle: { color: '#9CA3AF', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  bigMenuBtnPrimary: { backgroundColor: 'rgba(220, 38, 38, 0.15)', borderWidth: 1, borderColor: '#DC2626', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bigMenuBtn: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  bigMenuIcon: { fontSize: 28, marginRight: 16 },
  bigMenuTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  bigMenuDesc: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  selectListItem: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 10 },
  selectListTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  card: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#1F2937', borderRadius: 14, padding: 14, marginBottom: 14 },
  sectionHeader: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  mediaBtn: { width: '48%', backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  mediaBtnText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  qrSuccessBadge: { marginTop: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qrSuccessText: { color: '#10B981', fontSize: 13, fontWeight: 'bold' },
  qrRemoveText: { color: '#10B981', fontSize: 14, fontWeight: 'bold', paddingLeft: 10 },
  label: { color: '#E2E8F0', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  subLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 10, color: '#FFFFFF', paddingHorizontal: 12, height: 44, fontSize: 14, marginBottom: 10 },
  suggestionsBox: { backgroundColor: '#1F2937', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#374151' },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#374151' },
  suggestionText: { color: '#E2E8F0', fontSize: 13 },
  memoryPill: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  memoryPillText: { color: '#9CA3AF', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  selectorBox: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 10, padding: 10 },
  selectorBoxLabel: { color: '#9CA3AF', fontSize: 11 },
  selectorBoxValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 2 },
  fallbackBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1F2937' },
  fallbackTitle: { color: '#F59E0B', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  catChipActive: { backgroundColor: 'rgba(220, 38, 38, 0.2)', borderColor: '#DC2626' },
  catChipText: { color: '#9CA3AF', fontSize: 12 },
  catChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  selectedTagsBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1F2937' },
  subTagActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  subTagText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  colorBox: { marginTop: 12, padding: 10, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: 10 },
  colorLabel: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  addPlusBtn: { backgroundColor: '#DC2626', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  addPlusBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownArrow: { color: '#9CA3AF', fontSize: 14 },
  defectLabel: { color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  currencyBtn: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 10, paddingHorizontal: 14, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  currencyBtnActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  currencyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  locTabBtn: { flex: 1, backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginHorizontal: 3 },
  locTabBtnActive: { backgroundColor: 'rgba(220, 38, 38, 0.2)', borderColor: '#DC2626' },
  locTabText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  locTabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#DC2626', borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#161920', borderWidth: 1, borderColor: '#374151', borderRadius: 16, padding: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  modalClose: { color: '#9CA3AF', fontSize: 20, fontWeight: 'bold' },
});
