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
          <TouchableOpacity style={styles.mediaBtn} onPress={() => setPhotosCount((prev) => prev + 1)}>
            <Text style={styles.mediaBtnText}>🖼️ Adaugă poze ({photosCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => setPhotosCount((prev) => prev + 1)}>
            <Text style={styles.mediaBtnText}>📷 Fă poze acum</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => setQrCode(`QR-${Math.floor(1000 + Math.random() * 9000)}`)}>
            <Text style={styles.mediaBtnText}>📱 Scanează cod QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => setQrCode(`QR-${Math.floor(1000 + Math.random() * 9000)}`)}>
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
          <TouchableOpacity style={[styles.selectorBox, { flex: 1, marginRight: 6 }]} onPress={() => setStep('select_lot')}>
            <Text style={styles.selectorBoxLabel}>Lot:</Text>
            <Text style={styles.selectorBoxValue} numberOfLines={1}>{selectedLot ? selectedLot.name : 'Alege lot...'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.selectorBox, { flex: 1, marginLeft: 6 }]} onPress={() => setStep('select_car')}>
            <Text style={styles.selectorBoxLabel}>Mașină:</Text>
            <Text style={styles.selectorBoxValue} numberOfLines={1}>{selectedCar ? selectedCar.name : 'Alege mașină...'}</Text>
          </TouchableOpacity>
        </View>

        {(selectedCar || selectedLot) && (
          <TouchableOpacity onPress={() => { setSelectedCar(null); setSelectedLot(null); }} style={styles.clearSelectionBtn}>
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
              onPress={() => setCompatibleOems(compatibleOems.filter((_, i) => i !== idx))}
            >
              <Text style={styles.subTagText}>{c} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 14 }]}>5.2 Compatibilitate Vehicule (Marcă, Model, An)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 4, marginBottom: 0 }]}
            placeholder="Marcă"
            placeholderTextColor="#6B7280"
            value={compatBrand}
            onChangeText={setCompatBrand}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginHorizontal: 4, marginBottom: 0 }]}
            placeholder="Model"
            placeholderTextColor="#6B7280"
            value={compatModel}
            onChangeText={setCompatModel}
          />
          <TextInput
            style={[styles.input, { width: 70, marginLeft: 4, marginBottom: 0 }]}
            placeholder="An"
            placeholderTextColor="#6B7280"
            value={compatYear}
            onChangeText={setCompatYear}
          />
          <TouchableOpacity style={[styles.addPlusBtn, { marginLeft: 6 }]} onPress={addCompatVehicle}>
            <Text style={styles.addPlusBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.chipsWrap, { marginTop: 8 }]}>
          {compatibleVehicles.map((v, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.subTagActive}
              onPress={() => setCompatibleVehicles(compatibleVehicles.filter((_, i) => i !== idx))}
            >
              <Text style={styles.subTagText}>🚘 {v} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 14 }]}>6. Cod Producător (Memorie)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Bosch, Valeo, Luk..."
          placeholderTextColor="#6B7280"
          value={producerCode}
          onChangeText={setProducerCode}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoryScroll}>
          {producerHistory.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.memoryPill} onPress={() => setProducerCode(item)}>
              <Text style={styles.memoryPillText}>🏭 {item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.card}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setShowPositionsList(!showPositionsList)}>
          <Text style={styles.label}>7. Poziție pe mașină ({selectedPositions.length} selectate)</Text>
          <Text style={styles.dropdownArrow}>{showPositionsList ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showPositionsList && (
          <View style={[styles.chipsWrap, { marginTop: 10 }]}>
            {POSITIONS_LIST.map((pos) => {
              const active = selectedPositions.includes(pos);
              return (
                <TouchableOpacity
                  key={pos}
                  style={[styles.catChip, active && styles.catChipActive]}
                  onPress={() => togglePosition(pos)}
                >
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>{pos}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>8. Stare Piesă</Text>
        <View style={styles.chipsWrap}>
          {['Neverificat', 'Verificat', 'Stare bună', 'Stare ok cu defect'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.catChip, condition === st && styles.catChipActive]}
              onPress={() => setCondition(st)}
            >
              <Text style={[styles.catChipText, condition === st && styles.catChipTextActive]}>{st}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {condition === 'Stare ok cu defect' && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.defectLabel}>⚠️ Menționează defectul piesei:</Text>
            <TextInput
              style={[styles.input, { borderColor: '#EF4444', marginBottom: 0 }]}
              placeholder="Ex: Ureche prindere dreapta fisurată..."
              placeholderTextColor="#6B7280"
              value={defectDetails}
              onChangeText={setDefectDetails}
            />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>9. Preț Vânzare</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10, marginBottom: 0 }]}
            placeholder="Introdu suma..."
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TouchableOpacity
            style={[styles.currencyBtn, currency === 'LEI' && styles.currencyBtnActive]}
            onPress={() => setCurrency('LEI')}
          >
            <Text style={styles.currencyBtnText}>LEI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.currencyBtn, currency === 'EURO' && styles.currencyBtnActive]}
            onPress={() => setCurrency('EURO')}
          >
            <Text style={styles.currencyBtnText}>EURO €</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>10. Locație în Depozit</Text>
        <View style={styles.row}>
          {['Depozit', 'Curte', 'Mașină'].map((loc) => (
            <TouchableOpacity
              key={loc}
              style={[styles.locTabBtn, locationType === loc && styles.locTabBtnActive]}
              onPress={() => setLocationType(loc)}
            >
              <Text style={[styles.locTabText, locationType === loc && styles.locTabTextActive]}>{loc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {(locationType === 'Depozit' || locationType === 'Curte') && (
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 6, marginBottom: 0 }]}
              placeholder="Raft"
              placeholderTextColor="#6B7280"
              value={locRaft}
              onChangeText={setLocRaft}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginHorizontal: 6, marginBottom: 0 }]}
              placeholder="Coloană"
              placeholderTextColor="#6B7280"
              value={locColoana}
              onChangeText={setLocColoana}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 6, marginBottom: 0 }]}
              placeholder="Nivel"
              placeholderTextColor="#6B7280"
              value={locNivel}
              onChangeText={setLocNivel}
            />
          </View>
        )}

        {locationType === 'Curte' && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.subLabel}>Zonă specifică în curte (cu memorie):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Platformă, După garaj, Container..."
              placeholderTextColor="#6B7280"
              value={yardCustomLoc}
              onChangeText={setYardCustomLoc}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoryScroll}>
              {yardHistory.map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.memoryPill} onPress={() => setYardCustomLoc(item)}>
                  <Text style={styles.memoryPillText}>📍 {item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📝 Alte detalii / Observații generale</Text>
        <TextInput
          style={[styles.input, { height: 85, textAlignVertical: 'top', paddingTop: 10, marginBottom: 0 }]}
          placeholder="Ex: Merge și pe Passat B6 / Octavia 2, număr pini mufă, accesorii incluse..."
          placeholderTextColor="#6B7280"
          multiline={true}
          value={otherDetails}
          onChangeText={setOtherDetails}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePart}>
        <Text style={styles.saveButtonText}>💾 Salvează piesa în stoc</Text>
      </TouchableOpacity>

      <Modal visible={activeCategoryModal !== null} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeCategoryModal}</Text>
              <TouchableOpacity onPress={() => setActiveCategoryModal(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subLabel}>Selectează una sau mai multe subcategorii:</Text>
            <ScrollView style={{ maxHeight: 220, marginVertical: 10 }}>
              <View style={styles.chipsWrap}>
                {(categoriesData[activeCategoryModal] || []).map((sub) => {
                  const isSubSelected = selectedSubcategories.includes(sub);
                  return (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.catChip, isSubSelected && styles.catChipActive]}
                      onPress={() => toggleSubcategory(activeCategoryModal, sub)}
                    >
                      <Text style={[styles.catChipText, isSubSelected && styles.catChipTextActive]}>
                        {isSubSelected ? `✓ ${sub}` : sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.subLabel}>Nu există? Adaugă subcategorie definitiv:</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
                placeholder="Nume subcategorie nouă..."
                placeholderTextColor="#6B7280"
                value={newSubcatText}
                onChangeText={setNewSubcatText}
              />
              <TouchableOpacity style={styles.addPlusBtn} onPress={addSubcategory}>
                <Text style={styles.addPlusBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { marginTop: 16, height: 44 }]}
              onPress={() => setActiveCategoryModal(null)}
            >
              <Text style={styles.saveButtonText}>Confirmă Selecția</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115', padding: 16 },
  scrollContainer: { backgroundColor: '#0F1115', padding: 16, paddingBottom: 40 },
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
  backButtonText: { color: '#E2E8F0', fontSize: 13, fontWeight: 'bold' },
  headerTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  menuCenter: { flex: 1, justifyContent: 'center' },
  menuSubtitle: { color: '#9CA3AF', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  bigMenuBtnPrimary: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bigMenuBtn: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bigMenuIcon: { fontSize: 28, marginRight: 16 },
  bigMenuTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  bigMenuDesc: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  selectListItem: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  selectListTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  selectListSub: { color: '#10B981', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  mediaBtn: {
    width: '48%',
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  mediaBtnText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  qrSuccessBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrSuccessText: { color: '#10B981', fontSize: 13, fontWeight: 'bold' },
  qrRemoveText: { color: '#10B981', fontSize: 14, fontWeight: 'bold', paddingLeft: 10 },
  label: { color: '#E2E8F0', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  subLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    marginBottom: 10,
  },
  memoryScroll: { flexDirection: 'row', marginBottom: 4 },
  memoryPill: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
  },
  memoryPillText: { color: '#9CA3AF', fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'center' },
  selectorBox: { backgroundColor: '#0F1115', borderWidth: 1, borderColor: '#374151', borderRadius: 10, padding: 10 },
  selectorBoxLabel: { color: '#9CA3AF', fontSize: 11 },
  selectorBoxValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginTop: 2 },
  clearSelectionBtn: { marginTop: 8, alignSelf: 'flex-end' },
  clearSelectionText: { color: '#EF4444', fontSize: 12 },
  fallbackBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1F2937' },
  fallbackTitle: { color: '#F59E0B', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  catChipActive: { backgroundColor: 'rgba(220, 38, 38, 0.2)', borderColor: '#DC2626' },
  catChipText: { color: '#9CA3AF', fontSize: 12 },
  catChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  selectedTagsBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1F2937' },
  subTagActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  subTagText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  colorBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
  },
  colorLabel: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  addPlusBtn: {
    backgroundColor: '#DC2626',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlusBtnText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownArrow: { color: '#9CA3AF', fontSize: 14 },
  defectLabel: { color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  currencyBtn: {
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  currencyBtnActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  currencyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  locTabBtn: {
    flex: 1,
    backgroundColor: '#0F1115',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  locTabBtnActive: { backgroundColor: 'rgba(220, 38, 38, 0.2)', borderColor: '#DC2626' },
  locTabText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  locTabTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 16 },
  modalCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  modalClose: { color: '#9CA3AF', fontSize: 20, fontWeight: 'bold' },
});
                    
