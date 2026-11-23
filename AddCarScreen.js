
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
  rate: '',
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
  rate: '',
  notes: '',
};

const emptyExpense = {
  date: new Date().toISOString().slice(0, 10),
  category: 'Transport',
  description: '',
  amount: '',
  currency: 'EUR',
  rate: '',
};

const toNumber = value => {
  const number = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
};

const money = value => `${toNumber(value).toFixed(2)} RON`;

const formatOriginalMoney = (amount, currency) =>
  `${toNumber(amount).toFixed(2)} ${currency || 'RON'}`;

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
  expenses = [],
  onSaveLot,
  onSaveDonorCar,
  onSaveExpense,
  onDeleteExpense,
  onDeleteLot,
  onDeleteDonorCar,
}) {
  const [tab, setTab] = useState('lots');
  const [showLotForm, setShowLotForm] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [lotForm, setLotForm] = useState(emptyLot);
  const [carForm, setCarForm] = useState(emptyCar);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [expenseTarget, setExpenseTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateLot = (key, value) => {
    setLotForm(current => ({ ...current, [key]: value }));
  };

  const updateCar = (key, value) => {
    setCarForm(current => ({ ...current, [key]: value }));
  };

  const updateExpense = (key, value) => {
    setExpenseForm(current => ({ ...current, [key]: value }));
  };

  const selectedExpenseOwner = useMemo(() => {
    if (!expenseTarget) return null;

    if (expenseTarget.type === 'lot') {
      return lots.find(
        item => String(item.id) === String(expenseTarget.id)
      ) || null;
    }

    return donorCars.find(
      item => String(item.id) === String(expenseTarget.id)
    ) || null;
  }, [expenseTarget, lots, donorCars]);

  const getOwnerCurrency = owner => owner?.currency || 'RON';

  const getOwnerRate = owner => {
    if (!owner || getOwnerCurrency(owner) === 'RON') return '1';
    return String(owner.exchangeRate || '1');
  };

  const openExpenseForm = (type, owner) => {
    const currency = getOwnerCurrency(owner);
    const rate = getOwnerRate(owner);

    setExpenseTarget({
      type,
      id: owner.id,
    });

    setExpenseForm({
      ...emptyExpense,
      currency,
      rate,
    });
  };

  const changeExpenseCurrency = currency => {
    const owner = selectedExpenseOwner;
    const ownerCurrency = getOwnerCurrency(owner);

    setExpenseForm(current => ({
      ...current,
      currency,
      rate:
        currency === 'RON'
          ? '1'
          : currency === ownerCurrency
            ? getOwnerRate(owner)
            : '',
    }));
  };

  const closeExpenseForm = () => {
    setExpenseTarget(null);
    setExpenseForm(emptyExpense);
  };

  const getExpenseRon = expense => {
    const rate =
      expense.currency === 'RON'
        ? 1
        : toNumber(expense.exchangeRate);

    return toNumber(expense.amount) * rate;
  };

  const getOwnerExpenses = (type, id) => {
    return expenses.filter(expense => {
      if (type === 'lot') {
        return (
          String(expense.lotId) === String(id) &&
          !expense.donorCarId
        );
      }

      return String(expense.donorCarId) === String(id);
    });
  };

  const getOwnerExpenseTotal = (type, id) => {
    return getOwnerExpenses(type, id).reduce(
      (sum, expense) => sum + getExpenseRon(expense),
      0
    );
  };

  const getLotLegacyCosts = lot => {
    const rate = toNumber(lot.exchangeRate || 1);

    return (
      toNumber(lot.transportAmount) * rate +
      toNumber(lot.customsAmount) * rate +
      toNumber(lot.otherExpensesAmount) * rate
    );
  };

  const getLotTotalRon = lot => {
    const acquisition = toNumber(
      lot.acquisitionRon ??
      (
        toNumber(lot.acquisitionAmount) *
        toNumber(lot.exchangeRate || 1)
      )
    );

    return (
      acquisition +
      getLotLegacyCosts(lot) +
      getOwnerExpenseTotal('lot', lot.id)
    );
  };

  const getCarDirectTotal = car => {
    const acquisition = toNumber(
      car.acquisitionRon ??
      (
        toNumber(car.acquisitionAmount) *
        toNumber(car.exchangeRate || 1)
      )
    );

    return (
      acquisition +
      getOwnerExpenseTotal('car', car.id)
    );
  };

  const saveLot = async () => {
    if (saving) return;

    if (!lotForm.name.trim()) {
      Alert.alert('Date lipsă', 'Introdu numele lotului.');
      return;
    }

    const amount = toNumber(lotForm.amount);
    const rate =
      lotForm.currency === 'RON'
        ? 1
        : toNumber(lotForm.rate);

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
      exchangeRate: rate,
      acquisitionRon: amount * rate,
      transportAmount: 0,
      customsAmount: 0,
      otherExpensesAmount: 0,
      expenses: [],
      notes: lotForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      await onSaveLot(lot);
      setLotForm(emptyLot);
      setShowLotForm(false);
      Alert.alert(
        'Salvat',
        'Lotul a fost înregistrat. Transportul și taxele pot fi adăugate separat la cheltuieli.'
      );
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
    const rate =
      carForm.currency === 'RON'
        ? 1
        : toNumber(carForm.rate);

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
      exchangeRate: rate,
      acquisitionRon: amount * rate,
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
      Alert.alert(
        'Salvat',
        'Mașina donatoare a fost înregistrată.'
      );
    } catch (error) {
      Alert.alert('Eroare', 'Mașina nu a putut fi salvată.');
    } finally {
      setSaving(false);
    }
  };

  const saveExpense = async () => {
    if (saving) return;

    if (!expenseTarget || !selectedExpenseOwner) {
      Alert.alert('Eroare', 'Nu este selectată o înregistrare.');
      return;
    }

    const amount = toNumber(expenseForm.amount);
    const rate =
      expenseForm.currency === 'RON'
        ? 1
        : toNumber(expenseForm.rate);

    if (amount <= 0 || rate <= 0) {
      Alert.alert(
        'Valori incorecte',
        'Introdu o sumă și un curs valutar valid.'
      );
      return;
    }

    const owner =
      expenseTarget.type === 'lot'
        ? null
        : selectedExpenseOwner;

    const lotId =
      expenseTarget.type === 'lot'
        ? selectedExpenseOwner.id
        : selectedExpenseOwner.lotId || null;

    const expense = {
      id: `EXP-${Date.now()}`,
      lotId,
      donorCarId: owner ? owner.id : null,
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount,
      currency: expenseForm.currency,
      exchangeRate: rate,
      amountRon: amount * rate,
      createdAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      await onSaveExpense(expense);
      closeExpenseForm();
      Alert.alert('Salvat', 'Cheltuiala a fost înregistrată.');
    } catch (error) {
      Alert.alert('Eroare', 'Cheltuiala nu a putut fi salvată.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteExpense = expense => {
    Alert.alert(
      'Ștergere cheltuială',
      `Ștergi cheltuiala „${expense.category || 'Cheltuială'}”?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => onDeleteExpense && onDeleteExpense(expense.id),
        },
      ]
    );
  };

  const confirmDeleteLot = lot => {
    const linkedCars = donorCars.filter(
      car => String(car.lotId) === String(lot.id)
    );

    const linkedExpenses = expenses.some(
      expense => String(expense.lotId) === String(lot.id)
    );

    if (linkedCars.length > 0 || linkedExpenses) {
      Alert.alert(
        'Lot utilizat',
        'Nu poți șterge lotul cât timp are mașini sau cheltuieli asociate.'
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
    const linkedExpenses = expenses.some(
      expense => String(expense.donorCarId) === String(car.id)
    );

    if (linkedExpenses) {
      Alert.alert(
        'Mașină cu cheltuieli',
        'Șterge mai întâi cheltuielile asociate acestei mașini.'
      );
      return;
    }

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

  const renderExpenseList = (type, id) => {
    const list = getOwnerExpenses(type, id);

    if (list.length === 0) {
      return (
        <Text style={styles.helper}>
          Nu există cheltuieli înregistrate separat.
        </Text>
      );
    }

    return list.map(expense => (
      <View key={expense.id} style={styles.expenseLine}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseTitle}>
            {expense.category || 'Cheltuială'}
            {expense.description ? ` · ${expense.description}` : ''}
          </Text>
          <Text style={styles.meta}>
            {expense.date || 'Dată nespecificată'} ·{' '}
            {formatOriginalMoney(expense.amount, expense.currency)}
            {' · '}curs {toNumber(expense.exchangeRate || 1).toFixed(4)}
          </Text>
          <Text style={styles.expenseRon}>
            {money(expense.amountRon ?? getExpenseRon(expense))}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.smallDeleteButton}
          onPress={() => confirmDeleteExpense(expense)}
        >
          <Text style={styles.deleteText}>Șterge</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const renderExpenseForm = () => {
    if (!expenseTarget) return null;

    return (
      <View style={styles.expenseForm}>
        <Text style={styles.cardTitle}>
          Cheltuială nouă
        </Text>

        <Text style={styles.label}>Tip cheltuială</Text>
        <ChoiceRow
          values={[
            'Transport',
            'Taxe vamale',
            'Import',
            'Reparații',
            'Altele',
          ]}
          selected={expenseForm.category}
          onSelect={value => updateExpense('category', value)}
        />

        <Field
          label="Data cheltuielii"
          value={expenseForm.date}
          onChangeText={value => updateExpense('date', value)}
          placeholder="AAAA-LL-ZZ"
        />

        <Field
          label="Descriere"
          value={expenseForm.description}
          onChangeText={value => updateExpense('description', value)}
          placeholder="Ex.: transport Germania – România"
        />

        <Field
          label="Sumă"
          value={expenseForm.amount}
          onChangeText={value => updateExpense('amount', value)}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Monedă cheltuială</Text>
        <ChoiceRow
          values={CURRENCIES}
          selected={expenseForm.currency}
          onSelect={changeExpenseCurrency}
        />

        {expenseForm.currency !== 'RON' ? (
          <Field
            label={`Curs ${expenseForm.currency} → RON`}
            value={expenseForm.rate}
            onChangeText={value => updateExpense('rate', value)}
            keyboardType="decimal-pad"
          />
        ) : null}

        <Text style={styles.calculated}>
          Valoare convertită: {money(
            toNumber(expenseForm.amount) *
            (
              expenseForm.currency === 'RON'
                ? 1
                : toNumber(expenseForm.rate)
            )
          )}
        </Text>

        <Text style={styles.helper}>
          Dacă moneda este aceeași cu moneda achiziției, cursul este preluat automat.
          Dacă alegi altă monedă, introdu cursul separat. Cursul se salvează
          definitiv pentru această cheltuială.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={saveExpense}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Se salvează...' : 'Salvează cheltuiala'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={closeExpenseForm}
        >
          <Text style={styles.cancelText}>Renunță</Text>
        </TouchableOpacity>
      </View>
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
        onSelect={value =>
          setLotForm(current => ({
            ...current,
            currency: value,
            rate: value === 'RON' ? '1' : '',
          }))
        }
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
        label="Observații"
        value={lotForm.notes}
        onChangeText={value => updateLot('notes', value)}
        multiline
      />

      <Text style={styles.calculated}>
        Achiziție convertită: {money(
          toNumber(lotForm.amount) *
          (
            lotForm.currency === 'RON'
              ? 1
              : toNumber(lotForm.rate)
          )
        )}
      </Text>

      <Text style={styles.helper}>
        Transportul, taxele și celelalte cheltuieli se vor adăuga separat
        după salvarea lotului. Fiecare cheltuială poate avea propria monedă
        și propriul curs, păstrat la data înregistrării.
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
        onSelect={value =>
          setCarForm(current => ({
            ...current,
            currency: value,
            rate: value === 'RON' ? '1' : '',
          }))
        }
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
          (
            carForm.currency === 'RON'
              ? 1
              : toNumber(carForm.rate)
          )
        )}
      </Text>

      <Text style={styles.helper}>
        Cursul se salvează pentru această mașină și nu se modifică atunci
        când înregistrezi alte achiziții. Cheltuielile mașinii se adaugă
        separat după salvare.
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
            setExpenseTarget(null);
          }}
        >
          <Text style={styles.tabText}>LOTURI ({lots.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'cars' && styles.tabActive]}
          onPress={() => {
            setTab('cars');
            setShowLotForm(false);
            setExpenseTarget(null);
          }}
        >
          <Text style={styles.tabText}>MAȘINI ({donorCars.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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
                      Achiziție: {formatOriginalMoney(
                        lot.acquisitionAmount,
                        lot.currency
                      )}
                    </Text>

                    <Text style={styles.meta}>
                      Curs achiziție: {toNumber(lot.exchangeRate || 1).toFixed(4)}
                    </Text>

                    <Text style={styles.total}>
                      Cost total lot: {money(total)}
                    </Text>

                    <Text style={styles.meta}>
                      Mașini asociate: {cars.length}
                    </Text>

                    {cars.map(car => (
                      <Text key={car.id} style={styles.carLine}>
                        🚗 {car.brand} {car.model} {car.year}
                      </Text>
                    ))}

                    <View style={styles.expenseSection}>
                      <Text style={styles.expenseHeading}>
                        Cheltuieli ale lotului
                      </Text>

                      {renderExpenseList('lot', lot.id)}

                      <Text style={styles.meta}>
                        Total cheltuieli: {money(
                          getOwnerExpenseTotal('lot', lot.id)
                        )}
                      </Text>

                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => openExpenseForm('lot', lot)}
                      >
                        <Text style={styles.secondaryActionText}>
                          ＋ Adaugă transport / taxe / cheltuială
                        </Text>
                      </TouchableOpacity>
                    </View>

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

                    <Text style={styles.meta}>
                      Achiziție: {formatOriginalMoney(
                        car.acquisitionAmount,
                        car.currency
                      )}
                    </Text>

                    <Text style={styles.meta}>
                      Curs achiziție: {toNumber(car.exchangeRate || 1).toFixed(4)}
                    </Text>

                    <Text style={styles.total}>
                      Cost direct mașină: {money(getCarDirectTotal(car))}
                    </Text>

                    <Text style={styles.meta}>
                      Cost comun alocat: {money(car.allocatedLotCostRon)}
                    </Text>

                    <View style={styles.expenseSection}>
                      <Text style={styles.expenseHeading}>
                        Cheltuieli directe ale mașinii
                      </Text>

                      {renderExpenseList('car', car.id)}

                      <Text style={styles.meta}>
                        Total cheltuieli directe: {money(
                          getOwnerExpenseTotal('car', car.id)
                        )}
                      </Text>

                      <TouchableOpacity
                        style={styles.secondaryAction}
                        onPress={() => openExpenseForm('car', car)}
                      >
                        <Text style={styles.secondaryActionText}>
                          ＋ Adaugă cheltuială pentru mașină
                        </Text>
                      </TouchableOpacity>
                    </View>

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

        {expenseTarget ? renderExpenseForm() : null}
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
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
    fontWeight: '700',
    fontSize: 12,
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
  secondaryAction: {
    backgroundColor: '#26364B',
    borderRadius: 8,
    padding: 11,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryActionText: {
    color: '#EAF2FF',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
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
  expenseSection: {
    borderTopWidth: 1,
    borderTopColor: '#354255',
    marginTop: 12,
    paddingTop: 12,
  },
  expenseHeading: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 8,
  },
  expenseLine: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2B3748',
    paddingVertical: 8,
    gap: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  expenseRon: {
    color: '#4ADE80',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 3,
  },
  smallDeleteButton: {
    borderWidth: 1,
    borderColor: '#9B3434',
    borderRadius: 7,
    padding: 7,
  },
  expenseForm: {
    backgroundColor: '#19212E',
    borderWidth: 1,
    borderColor: '#36B37E',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 12,
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
