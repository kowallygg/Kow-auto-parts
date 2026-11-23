
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CURRENCIES = ['RON', 'EUR', 'GBP'];

const emptyLot = {
  name: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  currency: 'EUR',
  rate: '1',
  transport: '',
  customs: '',
  otherExpenses: '',
  notes: '',
};

const emptyCar = {
  lotId: '',
  brand: '',
  model: '',
  year: '',
  engine: '',
  engineCode: '',
  vin: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  currency: 'EUR',
  rate: '1',
  notes: '',
};

const toNumber = value => {
  const number = Number(String(value || '0').replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
};

const money = value =>
  `${toNumber(value).toFixed(2)} RON`;

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={String(value ?? '')}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#748094"
        keyboardType={keyboardType || 'default'}
        multiline={!!multiline}
      />
    </View>
  );
}

function ChoiceRow({ values, selected, onSelect }) {
  return (
    <View style={styles.choiceRow}>
      {values.map(value => (
        <TouchableOpacity
          key={value}
          onPress={() => onSelect(value)}
          style={[
            styles.choice,
            selected === value && styles.choiceSelected,
          ]}
        >
          <Text
            style={[
              styles.choiceText,
              selected === value && styles.choiceTextSelected,
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AddCarScreen({
  goBack,
  lots = [],
  donorCars = [],
  onSaveLot,
  onSaveDonorCar,
  onDeleteLot,
  onDeleteDonorCar,
}) {
  const [tab, setTab] = useState('lots');
  const [showLotForm, setShowLotForm] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [lotForm, setLotForm] = useState(emptyLot);
  const [carForm, setCarForm] = useState(emptyCar);
  const [saving, setSaving] = useState(false);

  const selectedLot = useMemo(
    () => lots.find(item => String(item.id) === String(selectedLotId)),
    [lots, selectedLotId]
  );

  const updateLot = (key, value) => {
    setLotForm(current => ({ ...current, [key]: value }));
  };

  const updateCar = (key, value) => {
    setCarForm(current => ({ ...current, [key]: value }));
  };

  const getLotTotalRon = lot => {
    const rate = toNumber(lot.exchangeRate || lot.rate || 1);
    const acquisition = toNumber(lot.acquisitionAmount);
    const transport = toNumber(lot.transportAmount);
    const customs = toNumber(lot.customsAmount);
    const other = toNumber(lot.otherExpensesAmount);

    return (
      acquisition * rate +
      transport * rate +
      customs * rate +
      other * rate
    );
  };

  const saveLot = async () => {
    if (saving) return;

    if (!lotForm.name.trim()) {
      Alert.alert('Date lipsă', 'Introdu numele lotului.');
      return;
    }

    const amount = toNumber(lotForm.amount);
    const rate = toNumber(lotForm.rate);

    if (amount < 0 || rate <= 0) {
      Alert.alert(
        'Valori incorecte',
        'Verifică suma achiziției și cursul valutar.'
      );
      return;
    }

    const lot = {
      id: `LOT-${Date.now()}`,
      type: 'lot',
      name: lotForm.name.trim(),
      acquisitionDate: lotForm.date,
      acquisitionAmount: amount,
      currency: lotForm.currency,
      exchangeRate: lotForm.currency === 'RON' ? 1 : rate,
      acquisitionRon: amount * (
        lotForm.currency === 'RON' ? 1 : rate
      ),
      transportAmount: toNumber(lotForm.transport),
      customsAmount: toNumber(lotForm.customs),
      otherExpensesAmount: toNumber(lotForm.otherExpenses),
      expenses: [],
      notes: lotForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      await onSaveLot(lot);
      setLotForm(emptyLot);
      setShowLotForm(false);
      Alert.alert('Salvat', 'Lotul a fost înregistrat.');
    } catch (error) {
      Alert.alert('Eroare', 'Lotul nu a putut fi salvat.');
    } finally {
      setSaving(false);
    }
  };

  const saveCar = async () => {
    if (saving) return;

    if (!carForm.brand.trim() || !carForm.model.trim()) {
      Alert.alert(
        'Date lipsă',
        'Completează marca și modelul mașinii.'
      );
      return;
    }

    if (lots.length > 0 && !carForm.lotId) {
      Alert.alert(
        'Lot lipsă',
        'Selectează lotul din care provine mașina.'
      );
      return;
    }

    const amount = toNumber(carForm.amount);
    const rate = toNumber(carForm.rate);

    if (amount < 0 || rate <= 0) {
      Alert.alert(
        'Valori incorecte',
        'Verifică suma și cursul valutar.'
      );
      return;
    }

    const car = {
      id: `CAR-${Date.now()}`,
      type: 'donorCar',
      lotId: carForm.lotId || null,
      brand: carForm.brand.trim(),
      model: carForm.model.trim(),
      year: carForm.year.trim(),
      engine: carForm.engine.trim(),
      engineCode: carForm.engineCode.trim(),
      vin: carForm.vin.trim(),
      acquisitionDate: carForm.date,
      acquisitionAmount: amount,
      currency: carForm.currency,
      exchangeRate: carForm.currency === 'RON' ? 1 : rate,
      acquisitionRon: amount * (
        carForm.currency === 'RON' ? 1 : rate
      ),
      allocatedLotCostRon: 0,
      directExpenses: [],
      notes: carForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      await onSaveDonorCar(car);
      setCarForm({
        ...emptyCar,
        lotId: carForm.lotId,
      });
      setShowCarForm(false);
      Alert.alert('Salvat', 'Mașina donatoare a fost înregistrată.');
    } catch (error) {
      Alert.alert('Eroare', 'Mașina nu a putut fi salvată.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteLot = lot => {
    const linkedCars = donorCars.filter(
      car => String(car.lotId) === String(lot.id)
    );

    if (linkedCars.length > 0) {
      Alert.alert(
        'Lotul are mașini asociate',
        'Nu poți șterge lotul cât timp are mașini donatoare asociate.'
      );
      return;
    }

    Alert.alert(
      'Ștergere lot',
      `Ștergi lotul „${lot.name}”?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => onDeleteLot && onDeleteLot(lot.id),
        },
      ]
    );
  };

  const confirmDeleteCar = car => {
    Alert.alert(
      'Ștergere mașină',
      `Ștergi ${car.brand} ${car.model}?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => onDeleteDonorCar && onDeleteDonorCar(car.id),
        },
      ]
    );
  };

  const renderLotForm = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Înregistrare lot nou</Text>

      <Field
        label="Nume lot *"
        value={lotForm.name}
        onChangeText={value => updateLot('name', value)}
        placeholder="Ex.: Lot Germania noiembrie"
      />

      <Field
        label="Data achiziției"
        value={lotForm.date}
        onChangeText={value => updateLot('date', value)}
        placeholder="AAAA-LL-ZZ"
      />

      <Field
        label="Cost achiziție"
        value={lotForm.amount}
        onChangeText={value => updateLot('amount', value)}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Monedă achiziție</Text>
      <ChoiceRow
        values={CURRENCIES}
        selected={lotForm.currency}
        onSelect={value => updateLot('currency', value)}
      />

      {lotForm.currency !== 'RON' ? (
        <Field
          label={`Curs ${lotForm.currency} → RON`}
          value={lotForm.rate}
          onChangeText={value => updateLot('rate', value)}
          keyboardType="decimal-pad"
        />
      ) : null}

      <Field
        label="Transport (în moneda achiziției)"
        value={lotForm.transport}
        onChangeText={value => updateLot('transport', value)}
        keyboardType="decimal-pad"
      />

      <Field
        label="Taxe vamale / import"
        value={lotForm.customs}
        onChangeText={value => updateLot('customs', value)}
        keyboardType="decimal-pad"
      />

      <Field
        label="Alte cheltuieli"
        value={lotForm.otherExpenses}
        onChangeText={value => updateLot('otherExpenses', value)}
        keyboardType="decimal-pad"
      />

      <Field
        label="Observații"
        value={lotForm.notes}
        onChangeText={value => updateLot('notes', value)}
        multiline
      />

      <Text style={styles.calculated}>
        Achiziție convertită: {money(
          toNumber(lotForm.amount) *
          (lotForm.currency === 'RON' ? 1 : toNumber(lotForm.rate))
        )}
      </Text>

      <Text style={styles.helper}>
        Transportul, taxele și celelalte cheltuieli sunt păstrate separat
        și incluse în costul total al lotului.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={saveLot}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>
          {saving ? 'Se salvează...' : 'Salvează lotul'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setShowLotForm(false)}
      >
        <Text style={styles.cancelText}>Renunță</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCarForm = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Înregistrare mașină donatoare</Text>

      <Text style={styles.label}>Lot de proveniență</Text>

      {lots.length === 0 ? (
        <Text style={styles.helper}>
          Nu există loturi. Poți înregistra mașina ca achiziție individuală.
        </Text>
      ) : (
        <View style={styles.selectorList}>
          {lots.map(lot => (
            <TouchableOpacity
              key={lot.id}
              style={[
                styles.selector,
                carForm.lotId === lot.id && styles.selectorSelected,
              ]}
              onPress={() => updateCar('lotId', lot.id)}
            >
              <Text style={styles.selectorText}>{lot.name}</Text>
              {carForm.lotId === lot.id ? (
                <Text style={styles.selectedMark}>✓</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Field
        label="Marcă *"
        value={carForm.brand}
        onChangeText={value => updateCar('brand', value)}
        placeholder="BMW"
      />

      <Field
        label="Model *"
        value={carForm.model}
        onChangeText={value => updateCar('model', value)}
        placeholder="E65 740d"
      />

      <Field
        label="An fabricație"
        value={carForm.year}
        onChangeText={value => updateCar('year', value)}
        keyboardType="numeric"
      />

      <Field
        label="Motorizare"
        value={carForm.engine}
        onChangeText={value => updateCar('engine', value)}
        placeholder="4.0 diesel"
      />

      <Field
        label="Cod motor"
        value={carForm.engineCode}
        onChangeText={value => updateCar('engineCode', value)}
      />

      <Field
        label="Serie șasiu (VIN)"
        value={carForm.vin}
        onChangeText={value => updateCar('vin', value)}
        autoCapitalize="characters"
      />

      <Field
        label="Data achiziției"
        value={carForm.date}
        onChangeText={value => updateCar('date', value)}
        placeholder="AAAA-LL-ZZ"
      />

      <Field
        label="Cost achiziție individuală"
        value={carForm.amount}
        onChangeText={value => updateCar('amount', value)}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Monedă achiziție</Text>
      <ChoiceRow
        values={CURRENCIES}
        selected={carForm.currency}
        onSelect={value => updateCar('currency', value)}
      />

      {carForm.currency !== 'RON' ? (
        <Field
          label={`Curs ${carForm.currency} → RON`}
          value={carForm.rate}
          onChangeText={value => updateCar('rate', value)}
          keyboardType="decimal-pad"
        />
      ) : null}

      <Field
        label="Observații"
        value={carForm.notes}
        onChangeText={value => updateCar('notes', value)}
        multiline
      />

      <Text style={styles.calculated}>
        Achiziție convertită: {money(
          toNumber(carForm.amount) *
          (carForm.currency === 'RON' ? 1 : toNumber(carForm.rate))
        )}
      </Text>

      <Text style={styles.helper}>
        Dacă mașina aparține unui lot, costul ei individual este separat
        de costul comun al lotului. Cota din costul comun se va aloca manual.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={saveCar}
        disabled={saving}
      >
        <Text style={styles.primaryButtonText}>
          {saving ? 'Se salvează...' : 'Salvează mașina'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setShowCarForm(false)}
      >
        <Text style={styles.cancelText}>Renunță</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Înapoi</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proveniență</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'lots' && styles.tabActive]}
          onPress={() => {
            setTab('lots');
            setShowCarForm(false);
          }}
        >
          <Text style={styles.tabText}>LOTURI ({lots.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'cars' && styles.tabActive]}
          onPress={() => {
            setTab('cars');
            setShowLotForm(false);
          }}
        >
          <Text style={styles.tabText}>MAȘINI ({donorCars.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'lots' ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowLotForm(value => !value)}
            >
              <Text style={styles.primaryButtonText}>
                {showLotForm ? 'Închide formularul' : '＋ Adaugă lot'}
              </Text>
            </TouchableOpacity>

            {showLotForm ? renderLotForm() : null}

            {lots.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Nu există loturi</Text>
                <Text style={styles.helper}>
                  Înregistrează un lot pentru a putea asocia mașinile și piesele.
                </Text>
              </View>
            ) : (
              lots.map(lot => {
                const cars = donorCars.filter(
                  car => String(car.lotId) === String(lot.id)
                );

                const total = getLotTotalRon(lot);

                return (
                  <View key={lot.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{lot.name}</Text>
                    <Text style={styles.meta}>
                      Data: {lot.acquisitionDate || 'Nespecificată'}
                    </Text>
                    <Text style={styles.meta}>
                      Achiziție: {toNumber(lot.acquisitionAmount).toFixed(2)} {lot.currency || 'RON'}
                    </Text>
                    <Text style={styles.meta}>
                      Curs folosit: {toNumber(lot.exchangeRate || 1).toFixed(4)}
                    </Text>
                    <Text style={styles.total}>
                      Cost lot înregistrat: {money(total)}
                    </Text>
                    <Text style={styles.meta}>
                      Mașini asociate: {cars.length}
                    </Text>

                    {cars.map(car => (
                      <Text key={car.id} style={styles.carLine}>
                        🚗 {car.brand} {car.model} {car.year}
                      </Text>
                    ))}

                    {lot.notes ? (
                      <Text style={styles.meta}>{lot.notes}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmDeleteLot(lot)}
                    >
                      <Text style={styles.deleteText}>Șterge lotul</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowCarForm(value => !value)}
            >
              <Text style={styles.primaryButtonText}>
                {showCarForm ? 'Închide formularul' : '＋ Adaugă mașină donatoare'}
              </Text>
            </TouchableOpacity>

            {showCarForm ? renderCarForm() : null}

            {donorCars.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  Nu există mașini donatoare
                </Text>
                <Text style={styles.helper}>
                  Înregistrează o mașină și asociaz-o unui lot, dacă este cazul.
                </Text>
              </View>
            ) : (
              donorCars.map(car => {
                const lot = lots.find(
                  item => String(item.id) === String(car.lotId)
                );

                return (
                  <View key={car.id} style={styles.card}>
                    <Text style={styles.cardTitle}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={styles.meta}>
                      An: {car.year || 'Nespecificat'}
                    </Text>
                    <Text style={styles.meta}>
                      Motor: {[car.engine, car.engineCode].filter(Boolean).join(' · ') || 'Nespecificat'}
                    </Text>
                    <Text style={styles.meta}>
                      VIN: {car.vin || 'Nespecificat'}
                    </Text>
                    <Text style={styles.meta}>
                      Lot: {lot ? lot.name : 'Achiziție individuală / fără lot'}
                    </Text>
                    {toNumber(car.acquisitionAmount) > 0 ? (
                      <Text style={styles.total}>
                        Achiziție individuală: {money(car.acquisitionRon)}
                      </Text>
                    ) : null}
                    <Text style={styles.meta}>
                      Cost comun alocat: {money(car.allocatedLotCostRon)}
                    </Text>
                    {car.notes ? (
                      <Text style={styles.meta}>{car.notes}</Text>
                    ) : null}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => confirmDeleteCar(car)}
                    >
                      <Text style={styles.deleteText}>Șterge mașina</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 14,
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
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#19212E',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#174B3A',
    borderWidth: 1,
    borderColor: '#36B37E',
  },
  tabText: {
    color: '#E2E8F0',
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#19212E',
    borderWidth: 1,
    borderColor: '#2B3748',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  label: {
    color: '#B9C5D6',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  field: {
    marginBottom: 10,
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
  },
  multiline: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  choice: {
    borderWidth: 1,
    borderColor: '#435168',
    backgroundColor: '#101722',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  choiceSelected: {
    backgroundColor: '#174B3A',
    borderColor: '#36B37E',
  },
  choiceText: {
    color: '#C4CFDE',
    fontWeight: '700',
  },
  choiceTextSelected: {
    color: '#8EF0BD',
  },
  primaryButton: {
    backgroundColor: '#16865D',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FCA5A5',
    fontWeight: '700',
  },
  helper: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  calculated: {
    color: '#4ADE80',
    fontWeight: '800',
    marginVertical: 8,
  },
  meta: {
    color: '#B9C5D6',
    fontSize: 12,
    marginBottom: 6,
  },
  total: {
    color: '#4ADE80',
    fontWeight: '800',
    marginVertical: 7,
  },
  carLine: {
    color: '#DCE5F2',
    fontSize: 12,
    marginTop: 5,
  },
  emptyCard: {
    backgroundColor: '#19212E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2B3748',
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 6,
  },
  selectorList: {
    marginBottom: 12,
  },
  selector: {
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    padding: 12,
    borderRadius: 8,
    marginBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectorSelected: {
    borderColor: '#36B37E',
    backgroundColor: '#174B3A',
  },
  selectorText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  selectedMark: {
    color: '#4ADE80',
    fontWeight: '900',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#9B3434',
    borderRadius: 8,
    padding: 9,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 12,
  },
});
