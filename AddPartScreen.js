import React, { useState, useRef } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import QrScannerScreen from './QrScannerScreen';
import CaroserieExterior from './forms/caroserie/CaroserieExterior';
import BaraFataForm from './forms/caroserie/BaraFataForm';

const CATEGORIES = [
  { id: 'motor', label: 'Motor și anexe', icon: '⚙️' },
  { id: 'transmisie', label: 'Transmisie', icon: '🔩' },
  { id: 'suspensie', label: 'Suspensie și direcție', icon: '🛞' },
  { id: 'mecanica', label: 'Mecanică', icon: '🔧' },
  { id: 'punti', label: 'Punți', icon: '🚙' },
  { id: 'frane', label: 'Sistem frânare', icon: '🛑' },
  { id: 'interior', label: 'Interior', icon: '💺' },
  { id: 'caroserie', label: 'Caroserie și exterior', icon: '🚗' },
  { id: 'roti', label: 'Jante și anvelope', icon: '🛞' },
];

const CATEGORY_FIELDS = {
  motor: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['Motorizare', 'engine'],
    ['Cod motor', 'engineCode'],
    ['An fabricație', 'year'],
    ['Cod OEM', 'oemCode'],
  ],
  transmisie: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['Motorizare', 'engine'],
    ['Cod motor', 'engineCode'],
    ['An fabricație', 'year'],
    ['Tip transmisie / cutie', 'transmissionType'],
    ['Cod cutie', 'transmissionCode'],
    ['Cod OEM', 'oemCode'],
  ],
  suspensie: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Poziție', 'position'],
    ['Cod OEM', 'oemCode'],
  ],
  mecanica: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['Motorizare', 'engine'],
    ['Cod motor', 'engineCode'],
    ['An fabricație', 'year'],
    ['Cod OEM', 'oemCode'],
  ],
  punti: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Punte față / spate', 'axlePosition'],
    ['Cod OEM', 'oemCode'],
  ],
  frane: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Poziție', 'position'],
    ['Cod OEM', 'oemCode'],
  ],
  interior: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Culoare / cod culoare', 'colorCode'],
    ['Cod OEM', 'oemCode'],
  ],
  caroserie: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Culoare / cod culoare', 'colorCode'],
    ['Poziție / parte', 'position'],
    ['Cod OEM', 'oemCode'],
  ],
  roti: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['Tip', 'wheelType'],
    ['Diametru (ex. R17)', 'diameter'],
    ['Lățime jantă (J)', 'rimWidth'],
    ['ET', 'offset'],
    ['PCD', 'pcd'],
    ['Dimensiune anvelopă', 'tireSize'],
    ['Cod OEM', 'oemCode'],
  ],
};

const BUMPER_POSITIONS = [
  'stânga',
  'dreapta',
  'față',
  'spate',
  'stânga față',
  'stânga spate',
  'dreapta față',
  'dreapta spate',
  'mijloc',
  'sus',
  'jos',
];

const INITIAL_FORM = {
  partName: '',
  baraFata: null,
  carMake: '',
  carModel: '',
  engine: '',
  engineCode: '',
  year: '',
  oemCode: '',
  producerCode: '',
  transmissionType: '',
  transmissionCode: '',
  position: '',
  axlePosition: '',
  colorCode: '',
  wheelType: '',
  diameter: '',
  rimWidth: '',
  offset: '',
  pcd: '',
  tireSize: '',
  lot: '',
  car: '',
  lotId: null,
  donorCarId: null,
  qrCode: '',
  price: '',
  quantity: '1',
  currency: 'RON',
  condition: 'Stare bună',
  verification: 'Neverificat',
  defectDetails: '',
  observations: '',
  locationType: '',
  shelf: '',
  column: '',
  level: '',
  locationDetails: '',
};

export default function AddPartScreen({
  goBack,
  onSavePartToStock,
  lots = [],
  donorCars = [],
  stockParts = [],
}) {
  const [category, setCategory] = useState('');
  const [caroserieOpen, setCaroserieOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [photos, setPhotos] = useState([]);
  const [qrValidated, setQrValidated] = useState(false);
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [provenanceMode, setProvenanceMode] = useState('none');
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const savingRef = useRef(false);

  const update = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }));

    if (key === 'qrCode') {
      setQrValidated(false);
    }
  };

  const acceptQrCode = rawCode => {
    const code = String(rawCode || '').trim();

    if (!code) {
      Alert.alert('Cod QR invalid', 'Nu am putut citi codul QR.');
      return false;
    }

    const normalizedCode = code.toUpperCase();

    const duplicate = stockParts.find(part => {
      const existingCode = String(
        part.qrCode || part.id || ''
      ).trim().toUpperCase();

      return existingCode === normalizedCode;
    });

    if (duplicate) {
      Alert.alert(
        'Cod QR deja folosit',
        `Codul ${code} aparține deja piesei „${duplicate.partName || 'fără denumire'}”.`
      );
      setQrValidated(false);
      return false;
    }

    setForm(current => ({
      ...current,
      qrCode: code,
    }));

    setQrValidated(true);
    return true;
  };

  const validateQr = () => {
    acceptQrCode(form.qrCode);
  };

  const readQrFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permisiune necesară',
          'Permite accesul la fotografii.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageUri = result.assets[0].uri;

      const codes = await Camera.scanFromURLAsync(
        imageUri,
        ['qr']
      );

      if (!codes || codes.length === 0) {
        Alert.alert(
          'Cod QR negăsit',
          'Fotografia selectată nu conține un cod QR care poate fi citit. Încearcă o fotografie mai clară.'
        );
        return;
      }

      acceptQrCode(codes[0].data);
    } catch (error) {
      console.log('Eroare la citirea QR din fotografie:', error);
      Alert.alert(
        'Eroare',
        'Nu am putut citi codul QR din fotografie.'
      );
    }
  };

  const selectedCar = donorCars.find(
    car => String(car.id) === String(selectedCarId)
  );

  const selectedLot = lots.find(
    lot => String(lot.id) === String(selectedLotId)
  );

  const chooseLot = lot => {
    setProvenanceMode('lot');
    setSelectedLotId(lot.id);
    setSelectedCarId(null);
  };

  const chooseCar = car => {
    setProvenanceMode('car');
    setSelectedCarId(car.id);
    setSelectedLotId(car.lotId || null);
  };

  const clearProvenance = () => {
    setProvenanceMode('none');
    setSelectedLotId(null);
    setSelectedCarId(null);
  };

  const continueFromBaraFata = () => {
    const bumper = form.baraFata;

    if (!bumper) {
      Alert.alert(
        'Date lipsă',
        'Completează datele barei față.'
      );
      return;
    }

    const oemCodes = (bumper.oemCodes || [])
      .map(code => String(code).trim())
      .filter(Boolean);

    setForm(current => ({
      ...current,
      partName: current.partName.trim()
        || `Bară față ${bumper.carMake || ''} ${bumper.carModel || ''}`.trim(),
      carMake: bumper.carMake || '',
      carModel: bumper.carModel || '',
      year: bumper.year || '',
      colorCode: bumper.colorCode || '',
      oemCode: oemCodes.join(', '),
    }));

    setCaroserieOpen(false);
  };

  const pickPhotos = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permisiune necesară',
          'Permite accesul la fotografii.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.8,
        });

      if (!result.canceled) {
        setPhotos(current => [
          ...current,
          ...result.assets.map(asset => asset.uri),
        ]);
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut deschide galeria.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permisiune necesară',
          'Permite accesul la cameră.'
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          quality: 0.8,
        });

      if (!result.canceled) {
        setPhotos(current => [
          ...current,
          ...result.assets.map(asset => asset.uri),
        ]);
      }
    } catch (error) {
      Alert.alert('Eroare', 'Nu am putut deschide camera.');
    }
  };

  const removePhoto = index => {
    setPhotos(current =>
      current.filter((_, i) => i !== index)
    );
  };

  const chooseLocation = type => {
    setForm(current => ({
      ...current,
      locationType: type,
      shelf: '',
      column: '',
      level: '',
      locationDetails: '',
    }));
  };

  const savePart = async () => {
    if (savingRef.current) return;

    if (!category) {
      Alert.alert('Atenție', 'Selectează categoria piesei.');
      return;
    }

    if (!form.partName.trim()) {
      Alert.alert('Atenție', 'Completează denumirea piesei.');
      return;
    }

    if (!form.qrCode.trim() || !qrValidated) {
      Alert.alert(
        'Cod QR',
        'Introdu și confirmă codul QR înainte de salvare.'
      );
      return;
    }

    const normalizedQr = form.qrCode.trim().toUpperCase();

    const qrAlreadyUsed = stockParts.some(part => {
      const existingCode = String(
        part.qrCode || part.id || ''
      ).trim().toUpperCase();

      return existingCode === normalizedQr;
    });

    if (qrAlreadyUsed) {
      Alert.alert(
        'Cod QR duplicat',
        'Acest cod QR există deja în stoc. Folosește un cod diferit.'
      );
      setQrValidated(false);
      return;
    }

    if (!form.locationType) {
      Alert.alert(
        'Atenție',
        'Selectează locația piesei.'
      );
      return;
    }

    const location =
      form.locationType === 'Depozit' ||
      form.locationType === 'Afară'
        ? `${form.locationType} - Raft: ${form.shelf || '-'}, Coloană: ${form.column || '-'}, Nivel: ${form.level || '-'}`
        : `${form.locationType} - ${form.locationDetails || '-'}`;

    const quantity = Number.parseInt(form.quantity, 10);

    if (!Number.isInteger(quantity) || quantity < 1) {
      Alert.alert(
        'Cantitate invalidă',
        'Introdu o cantitate validă, mai mare decât zero.'
      );
      return;
    }

    const priceNumber = Number(
      String(form.price || '0').replace(',', '.')
    );

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      Alert.alert(
        'Preț invalid',
        'Introdu un preț valid în RON.'
      );
      return;
    }

    const linkedCar = selectedCarId
      ? donorCars.find(
          car => String(car.id) === String(selectedCarId)
        )
      : null;

    const finalLotId = linkedCar
      ? linkedCar.lotId || null
      : provenanceMode === 'lot'
        ? selectedLotId
        : null;

    const newPart = {
      ...form,
      id: form.qrCode.trim(),
      qrCode: form.qrCode.trim(),
      category,
      subcategory: selectedSubcategory?.id || '',
      subcategoryName: selectedSubcategory?.name || '',
      partName: form.partName.trim(),
      lotId: finalLotId,
      donorCarId: linkedCar ? linkedCar.id : null,
      lotName: lots.find(
        lot => String(lot.id) === String(finalLotId)
      )?.name || '',
      donorCarName: linkedCar
        ? `${linkedCar.brand || ''} ${linkedCar.model || ''}`.trim()
        : '',
      location,
      price: `${priceNumber} RON`,
      currency: 'RON',
      photos,
      dateAdded: new Date().toLocaleDateString('ro-RO'),
      quantity,
    };

    if (typeof onSavePartToStock !== 'function') {
      Alert.alert(
        'Eroare',
        'Funcția de salvare nu este disponibilă.'
      );
      return;
    }

    savingRef.current = true;
    setIsSaving(true);

    try {
      await onSavePartToStock(newPart);

      savingRef.current = false;
      setIsSaving(false);

      Alert.alert(
        'Salvat',
        'Piesa a fost înregistrată în stoc.'
      );

      goBack();
    } catch (error) {
      console.log('Eroare la salvarea piesei:', error);

      savingRef.current = false;
      setIsSaving(false);

      Alert.alert(
        'Salvarea a eșuat',
        'Piesa nu a fost salvată. Datele formularului au fost păstrate. Verifică memoria telefonului și încearcă din nou.'
      );
    }
  };
    if (category === 'caroserie' && caroserieOpen) {
    if (selectedSubcategory) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setSelectedSubcategory(null)}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹ Înapoi</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {selectedSubcategory.name}
            </Text>

            <View style={{ width: 64 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {selectedSubcategory.id === 'bara_fata' ? (
              <>
                <BaraFataForm
                  value={form.baraFata}
                  onChange={value => update('baraFata', value)}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={continueFromBaraFata}
                >
                  <Text style={styles.saveButtonText}>
                    ✓ Salvează datele și continuă
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{ color: '#FFFFFF' }}>
                Formularul acestei subcategorii va fi construit ulterior.
              </Text>
            )}
          </ScrollView>
        </View>
      );
    }

    return (
      <CaroserieExterior
        onSelectSubcategory={item =>
          setSelectedSubcategory(item)
        }
        goBack={() => {
          setCaroserieOpen(false);
          setCategory('');
        }}
      />
    );
  }

  const fields = CATEGORY_FIELDS[category] || [];

  const visibleFields =
    category === 'caroserie' &&
    selectedSubcategory?.id === 'bara_fata'
      ? fields.filter(([, key]) => key === 'partName')
      : fields;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
          disabled={isSaving}
        >
          <Text style={styles.backText}>‹ Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Adaugă piesă</Text>

        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="1. Fotografii și cod QR">
          <View style={styles.buttonRow}>
            <ActionButton
              label="＋ Adaugă poze"
              onPress={pickPhotos}
            />
            <ActionButton
              label="📷 Fotografiază"
              onPress={takePhoto}
            />
          </View>

          <View style={styles.photoRow}>
            {photos.map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                onPress={() => removePhoto(index)}
              >
                <Image source={{ uri }} style={styles.photo} />
                <Text style={styles.removePhoto}>Elimină</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.helper}>
            Atinge o fotografie pentru a o elimina.
          </Text>

          <Text style={styles.label}>Cod QR unic al piesei</Text>

          <TextInput
            style={styles.input}
            value={form.qrCode}
            onChangeText={value => update('qrCode', value)}
            placeholder="Introdu codul de pe etichetă"
            placeholderTextColor="#7C8494"
            autoCapitalize="characters"
          />

          <View style={styles.buttonRow}>
            <ActionButton
              label="📷 Scanează cu camera"
              onPress={() => setQrScannerVisible(true)}
            />

            <ActionButton
              label="🖼️ Citește din galerie"
              onPress={readQrFromGallery}
            />
          </View>

          <ActionButton
            label="✓ Confirmă codul QR"
            onPress={validateQr}
          />

          {qrValidated ? (
            <Text style={styles.validQr}>
              ✓ Cod confirmat: {form.qrCode}
            </Text>
          ) : null}
        </Section>

        <Section title="2. Proveniență">
          <Text style={styles.helper}>
            Alege de unde provine piesa. Poți selecta un lot sau o mașină
            donatoare. Dacă alegi o mașină, lotul ei este preluat automat.
          </Text>

          <View style={styles.choiceRow}>
            <Choice
              label="Fără asociere"
              selected={provenanceMode === 'none'}
              onPress={clearProvenance}
            />
            <Choice
              label="Dintr-un lot"
              selected={provenanceMode === 'lot'}
              onPress={() => {
                setProvenanceMode('lot');
                setSelectedCarId(null);
              }}
            />
            <Choice
              label="Dintr-o mașină"
              selected={provenanceMode === 'car'}
              onPress={() => {
                setProvenanceMode('car');
                setSelectedLotId(null);
              }}
            />
          </View>

          {provenanceMode === 'lot' ? (
            <>
              {lots.length === 0 ? (
                <Text style={styles.helper}>
                  Nu ai loturi înregistrate. Adaugă mai întâi un lot în
                  secțiunea Proveniență.
                </Text>
              ) : (
                <View style={styles.selectorList}>
                  {lots.map(lot => (
                    <TouchableOpacity
                      key={lot.id}
                      style={[
                        styles.selector,
                        selectedLotId === lot.id &&
                          styles.selectorSelected,
                      ]}
                      onPress={() => chooseLot(lot)}
                    >
                      <View style={styles.selectorInfo}>
                        <Text style={styles.selectorTitle}>
                          {lot.name}
                        </Text>
                        <Text style={styles.selectorMeta}>
                          {lot.acquisitionDate || 'Dată nespecificată'}
                        </Text>
                      </View>
                      {selectedLotId === lot.id ? (
                        <Text style={styles.selectedMark}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : null}

          {provenanceMode === 'car' ? (
            <>
              {donorCars.length === 0 ? (
                <Text style={styles.helper}>
                  Nu ai mașini donatoare înregistrate. Adaugă mai întâi
                  o mașină în secțiunea Proveniență.
                </Text>
              ) : (
                <View style={styles.selectorList}>
                  {donorCars.map(car => {
                    const parentLot = lots.find(
                      lot => String(lot.id) === String(car.lotId)
                    );

                    return (
                      <TouchableOpacity
                        key={car.id}
                        style={[
                          styles.selector,
                          selectedCarId === car.id &&
                            styles.selectorSelected,
                        ]}
                        onPress={() => chooseCar(car)}
                      >
                        <View style={styles.selectorInfo}>
                          <Text style={styles.selectorTitle}>
                            {car.brand} {car.model}
                          </Text>
                          <Text style={styles.selectorMeta}>
                            {car.year || 'An nespecificat'}
                            {car.engineCode ? ` · ${car.engineCode}` : ''}
                          </Text>
                          <Text style={styles.selectorMeta}>
                            Lot: {parentLot?.name || 'Fără lot asociat'}
                          </Text>
                        </View>
                        {selectedCarId === car.id ? (
                          <Text style={styles.selectedMark}>✓</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          ) : null}

          {provenanceMode === 'lot' && selectedLot ? (
            <Text style={styles.provenanceSelected}>
              Lot selectat: {selectedLot.name}
            </Text>
          ) : null}

          {provenanceMode === 'car' && selectedCar ? (
            <Text style={styles.provenanceSelected}>
              Mașină selectată: {selectedCar.brand} {selectedCar.model}
              {selectedLot ? ` · Lot: ${selectedLot.name}` : ''}
            </Text>
          ) : null}
        </Section>

        <Section title="3. Categoria principală">
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryButton,
                  category === item.id && styles.categorySelected,
                ]}
                onPress={() => {
                  setCategory(item.id);

                  if (item.id === 'caroserie') {
                    setCaroserieOpen(true);
                    setSelectedSubcategory(null);
                  } else {
                    setCaroserieOpen(false);
                  }
                }}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text style={styles.categoryText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {category ? (
          <Section title="4. Datele piesei">
            {visibleFields.map(([label, key]) => (
              <Field
                key={key}
                label={label}
                value={form[key]}
                onChangeText={value => update(key, value)}
                keyboardType={key === 'year' ? 'numeric' : 'default'}
              />
            ))}

            {category === 'caroserie' &&
            selectedSubcategory?.id === 'bara_fata' ? (
              <View style={styles.positionSection}>
                <Text style={styles.label}>Poziție / parte</Text>

                <View style={styles.positionGrid}>
                  {BUMPER_POSITIONS.map(item => {
                    const selected = Array.isArray(form.position)
                      ? form.position.includes(item)
                      : false;

                    return (
                      <TouchableOpacity
                        key={item}
                        style={styles.positionOption}
                        onPress={() => {
                          const current = Array.isArray(form.position)
                            ? form.position
                            : [];

                          const next = selected
                            ? current.filter(value => value !== item)
                            : [...current, item];

                          update('position', next);
                        }}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selected && styles.checkboxSelected,
                          ]}
                        >
                          {selected ? (
                            <Text style={styles.checkmark}>✓</Text>
                          ) : null}
                        </View>
                        <Text style={styles.positionText}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.helper}>
                  Poți selecta mai multe poziții.
                </Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        <Section title="5. Locația piesei">
          <View style={styles.choiceRow}>
            {['Depozit', 'Afară', 'Pe mașină', 'Curte'].map(item => (
              <Choice
                key={item}
                label={item}
                selected={form.locationType === item}
                onPress={() => chooseLocation(item)}
              />
            ))}
          </View>

          {['Depozit', 'Afară'].includes(form.locationType) ? (
            <View style={styles.threeFields}>
              <View style={styles.smallField}>
                <Field
                  label="Raft"
                  value={form.shelf}
                  onChangeText={value => update('shelf', value)}
                />
              </View>
              <View style={styles.smallField}>
                <Field
                  label="Coloană"
                  value={form.column}
                  onChangeText={value => update('column', value)}
                />
              </View>
              <View style={styles.smallField}>
                <Field
                  label="Nivel"
                  value={form.level}
                  onChangeText={value => update('level', value)}
                />
              </View>
            </View>
          ) : null}

          {['Pe mașină', 'Curte'].includes(form.locationType) ? (
            <Field
              label="Detalii locație"
              value={form.locationDetails}
              onChangeText={value => update('locationDetails', value)}
              placeholder="Descrie locația..."
            />
          ) : null}
        </Section>
        <Section title="6. Stare și verificare">
          <Text style={styles.label}>Starea piesei</Text>

          <View style={styles.choiceRow}>
            {['Stare bună', 'Mic defect'].map(item => (
              <Choice
                key={item}
                label={item}
                selected={form.condition === item}
                onPress={() => update('condition', item)}
              />
            ))}
          </View>

          {form.condition === 'Mic defect' ? (
            <Field
              label="Descriere defect"
              value={form.defectDetails}
              onChangeText={value => update('defectDetails', value)}
              multiline
              placeholder="Descrie defectul..."
            />
          ) : null}

          <Text style={styles.label}>Verificare</Text>

          <View style={styles.choiceRow}>
            {['Verificat', 'Neverificat'].map(item => (
              <Choice
                key={item}
                label={item}
                selected={form.verification === item}
                onPress={() => update('verification', item)}
              />
            ))}
          </View>
        </Section>

        <Section title="7. Preț">
          <Field
            label="Cantitate în stoc"
            value={form.quantity}
            onChangeText={value => update('quantity', value)}
            keyboardType="number-pad"
            placeholder="1"
          />

          <Field
            label="Preț de vânzare (RON)"
            value={form.price}
            onChangeText={value => update('price', value)}
            keyboardType="decimal-pad"
            placeholder="0,00"
          />

          <Text style={styles.helper}>
            Prețurile pieselor și vânzările sunt înregistrate în RON.
          </Text>
        </Section>

        <Section title="8. Observații generale">
          <Field
            label="Observații suplimentare"
            value={form.observations}
            onChangeText={value => update('observations', value)}
            multiline
            placeholder="Alte detalii despre piesă..."
          />
        </Section>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={savePart}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving
              ? 'Se salvează...'
              : '✓ Salvează piesa în stoc'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={qrScannerVisible}
        animationType="slide"
        onRequestClose={() => setQrScannerVisible(false)}
      >
        <QrScannerScreen
          onClose={() => setQrScannerVisible(false)}
          onCodeScanned={code => {
            const accepted = acceptQrCode(code);

            if (accepted) {
              setQrScannerVisible(false);
            }
          }}
        />
      </Modal>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  placeholder,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
        value={value == null ? '' : String(value)}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        multiline={!!multiline}
        placeholder={placeholder || label}
        placeholderTextColor="#7C8494"
      />
    </View>
  );
}

function ActionButton({ label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Choice({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.choice,
        selected && styles.choiceSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.choiceText,
          selected && styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10141D',
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#293241',
  },
  backButton: {
    width: 64,
  },
  backText: {
    color: '#AAB7CA',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#19212E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2B3748',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#26364B',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#EAF2FF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 8,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#303B4B',
  },
  removePhoto: {
    color: '#FCA5A5',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
  },
  helper: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  label: {
    color: '#B9C5D6',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 9,
  },
  multilineInput: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  validQr: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryButton: {
    width: '31.5%',
    minHeight: 92,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelected: {
    borderColor: '#36B37E',
    backgroundColor: '#18372F',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryText: {
    color: '#DCE5F2',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 7,
  },
  choice: {
    borderWidth: 1,
    borderColor: '#435168',
    backgroundColor: '#101722',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  choiceSelected: {
    backgroundColor: '#174B3A',
    borderColor: '#36B37E',
  },
  choiceText: {
    color: '#C4CFDE',
    fontSize: 12,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: '#8EF0BD',
  },
  selectorList: {
    marginTop: 6,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    borderRadius: 9,
    padding: 11,
    marginBottom: 7,
  },
  selectorSelected: {
    backgroundColor: '#174B3A',
    borderColor: '#36B37E',
  },
  selectorInfo: {
    flex: 1,
  },
  selectorTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  selectorMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
  },
  selectedMark: {
    color: '#4ADE80',
    fontWeight: '900',
    fontSize: 18,
    marginLeft: 8,
  },
  provenanceSelected: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  positionSection: {
    marginTop: 8,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  positionOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 9,
    marginBottom: 7,
  },
  positionText: {
    color: '#DCE5F2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#64748B',
    backgroundColor: '#101722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#16865D',
    borderColor: '#36B37E',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  threeFields: {
    flexDirection: 'row',
    gap: 7,
  },
  smallField: {
    flex: 1,
  },
  fieldWrap: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#16865D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#52665F',
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
