
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    ['Cod producător', 'producerCode'],
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
    ['Cod producător', 'producerCode'],
  ],
  suspensie: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Poziție', 'position'],
    ['Cod OEM', 'oemCode'],
    ['Cod producător', 'producerCode'],
  ],
  mecanica: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['Motorizare', 'engine'],
    ['Cod motor', 'engineCode'],
    ['An fabricație', 'year'],
    ['Cod OEM', 'oemCode'],
    ['Cod producător', 'producerCode'],
  ],
  punti: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Punte față / spate', 'axlePosition'],
    ['Cod OEM', 'oemCode'],
    ['Cod producător', 'producerCode'],
  ],
  frane: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Poziție', 'position'],
    ['Cod OEM', 'oemCode'],
    ['Cod producător', 'producerCode'],
  ],
  interior: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Culoare / cod culoare', 'colorCode'],
    ['Cod OEM', 'oemCode'],
    ['Cod producător', 'producerCode'],
  ],
  caroserie: [
    ['Denumire piesă', 'partName'],
    ['Marcă auto', 'carMake'],
    ['Model', 'carModel'],
    ['An fabricație', 'year'],
    ['Culoare / cod culoare', 'colorCode'],
    ['Poziție / parte', 'position'],
    ['Cod OEM', 'oemCode'],
    ['Cod producător', 'producerCode'],
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
    ['Cod producător', 'producerCode'],
  ],
};

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
  qrCode: '',
  price: '',
  currency: 'EUR',
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
}) {
  const [category, setCategory] = useState('');
const [caroserieOpen, setCaroserieOpen] = useState(false);
const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [photos, setPhotos] = useState([]);
  const [qrValidated, setQrValidated] = useState(false);

  const update = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }));

    if (key === 'qrCode') {
      setQrValidated(false);
    }
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
  // SELECTARE FOTOGRAFII DIN GALERIE
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

  // FOTOGRAFIERE CU CAMERA
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

  // ELIMINARE FOTOGRAFIE
  const removePhoto = index => {
    setPhotos(current =>
      current.filter((_, i) => i !== index)
    );
  };

  // SELECTARE LOCAȚIE
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

  // CONFIRMARE COD QR INTRODUS MANUAL
  const validateQr = () => {
    const code = form.qrCode.trim();

    if (!code) {
      Alert.alert(
        'Cod QR lipsă',
        'Introdu codul de pe eticheta piesei.'
      );
      return;
    }

    setQrValidated(true);
  };

  // SALVARE PIESĂ
  const savePart = () => {
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

    const newPart = {
      ...form,
      id: form.qrCode.trim(),
      qrCode: form.qrCode.trim(),
      category,
      subcategory: selectedSubcategory?.id || '',
      subcategoryName: selectedSubcategory?.name || '',
      partName: form.partName.trim(),
      location,
      price: form.price
        ? `${form.price} ${form.currency}`
        : `0 ${form.currency}`,
      photos,
      dateAdded: new Date().toLocaleDateString('ro-RO'),
      quantity: 1,
    };

    if (typeof onSavePartToStock !== 'function') {
      Alert.alert(
        'Eroare',
        'Funcția de salvare nu este disponibilă.'
      );
      return;
    }

    onSavePartToStock(newPart);

    Alert.alert(
      'Salvat',
      'Piesa a fost înregistrată în stoc.'
    );

    goBack();
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
    category === 'caroserie' && selectedSubcategory?.id === 'bara_fata'
      ? fields.filter(([, key]) =>
          ['partName', 'position', 'producerCode'].includes(key)
        )
      : fields;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Adaugă piesă
        </Text>

        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. FOTOGRAFII ȘI QR */}
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
                <Image
                  source={{ uri }}
                  style={styles.photo}
                />
                <Text style={styles.removePhoto}>
                  Elimină
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.helper}>
            Atinge o fotografie pentru a o elimina.
          </Text>

          <Text style={styles.label}>
            Cod QR unic al piesei
          </Text>

          <TextInput
            style={styles.input}
            value={form.qrCode}
            onChangeText={value =>
              update('qrCode', value)
            }
            placeholder="Introdu codul de pe etichetă"
            placeholderTextColor="#7C8494"
            autoCapitalize="characters"
          />

          <ActionButton
            label="✓ Confirmă codul QR"
            onPress={validateQr}
          />

          {qrValidated ? (
            <Text style={styles.validQr}>
              ✓ Cod confirmat: {form.qrCode}
            </Text>
          ) : null}

          <Text style={styles.helper}>
            Scanarea automată cu camera și citirea codului
            dintr-o fotografie vor fi implementate ulterior.
          </Text>
        </Section>

        {/* 2. CATEGORII */}
        <Section title="2. Categoria principală">

          <View style={styles.categoryGrid}>
            {CATEGORIES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryButton,
                  category === item.id &&
                    styles.categorySelected,
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
                <Text style={styles.categoryIcon}>
                  {item.icon}
                </Text>

                <Text style={styles.categoryText}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* 3. DATELE SPECIFICE CATEGORIEI */}
        {category ? (
          <Section title="3. Datele piesei">

           {visibleFields.map(([label, key]) => (
              <Field
                key={key}
                label={label}
                value={form[key]}
                onChangeText={value =>
                  update(key, value)
                }
                keyboardType={
                  key === 'year'
                    ? 'numeric'
                    : 'default'
                }
              />
            ))}

            <Field
              label="Lot / proveniență"
              value={form.lot}
              onChangeText={value =>
                update('lot', value)
              }
            />

            <Field
              label="Mașina donatoare"
              value={form.car}
              onChangeText={value =>
                update('car', value)
              }
            />

          </Section>
        ) : null}

        {/* 4. LOCAȚIE */}
        <Section title="4. Locația piesei">

          <View style={styles.choiceRow}>
            {[
              'Depozit',
              'Afară',
              'Pe mașină',
              'Curte',
            ].map(item => (
              <Choice
                key={item}
                label={item}
                selected={form.locationType === item}
                onPress={() => chooseLocation(item)}
              />
            ))}
          </View>

          {['Depozit', 'Afară'].includes(
            form.locationType
          ) ? (
            <View style={styles.threeFields}>
              <View style={styles.smallField}>
                <Field
                  label="Raft"
                  value={form.shelf}
                  onChangeText={value =>
                    update('shelf', value)
                  }
                />
              </View>

              <View style={styles.smallField}>
                <Field
                  label="Coloană"
                  value={form.column}
                  onChangeText={value =>
                    update('column', value)
                  }
                />
              </View>

              <View style={styles.smallField}>
                <Field
                  label="Nivel"
                  value={form.level}
                  onChangeText={value =>
                    update('level', value)
                  }
                />
              </View>
            </View>
          ) : null}

          {['Pe mașină', 'Curte'].includes(
            form.locationType
          ) ? (
            <Field
              label="Detalii locație"
              value={form.locationDetails}
              onChangeText={value =>
                update('locationDetails', value)
              }
              placeholder="Descrie locația..."
            />
          ) : null}

        </Section>

        {/* 5. STARE ȘI VERIFICARE */}
        <Section title="5. Stare și verificare">

          <Text style={styles.label}>
            Starea piesei
          </Text>

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
              onChangeText={value =>
                update('defectDetails', value)
              }
              multiline
              placeholder="Descrie defectul..."
            />
          ) : null}

          <Text style={styles.label}>
            Verificare
          </Text>

          <View style={styles.choiceRow}>
            {['Verificat', 'Neverificat'].map(item => (
              <Choice
                key={item}
                label={item}
                selected={form.verification === item}
                onPress={() =>
                  update('verification', item)
                }
              />
            ))}
          </View>

        </Section>

        {/* 6. PREȚ */}
        <Section title="6. Preț">

          <Field
            label="Preț de vânzare"
            value={form.price}
            onChangeText={value =>
              update('price', value)
            }
            keyboardType="decimal-pad"
            placeholder="0,00"
          />

          <View style={styles.choiceRow}>
            {['EUR', 'RON'].map(item => (
              <Choice
                key={item}
                label={item}
                selected={form.currency === item}
                onPress={() =>
                  update('currency', item)
                }
              />
            ))}
          </View>

        </Section>

        {/* 7. OBSERVAȚII */}
        <Section title="7. Observații generale">

          <Field
            label="Observații suplimentare"
            value={form.observations}
            onChangeText={value =>
              update('observations', value)
            }
            multiline
            placeholder="Alte detalii despre piesă..."
          />

        </Section>

        {/* SALVARE */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={savePart}
        >
          <Text style={styles.saveButtonText}>
            ✓ Salvează piesa în stoc
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// COMPONENTĂ SECȚIUNE
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// COMPONENTĂ CÂMP
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
      <Text style={styles.label}>
        {label}
      </Text>

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

// BUTON ACȚIUNE
function ActionButton({ label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// OPȚIUNE SELECTABILĂ
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

// STILURI
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

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
