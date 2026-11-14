import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PIESE: '@kow_piese',
  CATEGORII: '@kow_categorii',
};

const POZITII_DISPONIBILE = [
  'Stânga', 'Dreapta', 'Față', 'Spate', 'Jumătate',
  'Sus', 'Jos', 'Stânga față', 'Stânga spate', 'Dreapta față', 'Dreapta spate'
];

export default function App() {
  const [ecranCurent, setEcranCurent] = useState('ACASA');
  const [subEcranAdaugare, setSubEcranAdaugare] = useState(null);

  const [piese, setPiese] = useState([]);
  const [categorii, setCategorii] = useState(['Motor', 'Caroserie', 'Electrică', 'Suspensie', 'Interior']);
  
  // Formular piesă
  const [denumire, setDenumire] = useState('');
  const [categorie, setCategorie] = useState('');
  const [categorieNoua, setCategorieNoua] = useState('');
  const [lot, setLot] = useState('Lot General');
  const [codOem, setCodOem] = useState('');
  const [codProducator, setCodProducator] = useState('');
  const [pozitiiSelectate, setPozitiiSelectate] = useState([]);
  const [locatie, setLocatie] = useState('Depozit');
  const [pret, setPret] = useState('');
  const [moneda, setMoneda] = useState('RON');
  const [alteInfo, setAlteInfo] = useState('');

  const [textCautare, setTextCautare] = useState('');

  useEffect(() => {
    incarcaDateLocale();
  }, []);

  const incarcaDateLocale = async () => {
    try {
      const pieseSalvate = await AsyncStorage.getItem(STORAGE_KEYS.PIESE);
      const catSalvate = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORII);

      if (pieseSalvate) setPiese(JSON.parse(pieseSalvate));
      if (catSalvate) setCategorii(JSON.parse(catSalvate));
    } catch (e) {
      console.log('Eroare la încărcare:', e);
    }
  };

  const adaugaCategorieNoua = async () => {
    const val = categorieNoua.trim();
    if (!val) return;
    if (!categorii.includes(val)) {
      const listaNoua = [...categorii, val].sort();
      setCategorii(listaNoua);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORII, JSON.stringify(listaNoua));
    }
    setCategorie(val);
    setCategorieNoua('');
  };

  const togglePozitie = (poz) => {
    if (pozitiiSelectate.includes(poz)) {
      setPozitiiSelectate(pozitiiSelectate.filter((p) => p !== poz));
    } else {
      setPozitiiSelectate([...pozitiiSelectate, poz]);
    }
  };

  const salveazaPiesa = async () => {
    if (!denumire.trim()) {
      Alert.alert('Atenție', 'Introdu denumirea piesei!');
      return;
    }

    const codQrUnic = `P${String(piese.length + 1).padStart(6, '0')}`;

    const piesaNoua = {
      id: Date.now().toString(),
      qr: codQrUnic,
      denumire: denumire.trim(),
      categorie: categorie || 'Necategorizat',
      lot: lot || 'Lot General',
      codOem: codOem.trim(),
      codProducator: codProducator.trim(),
      pozitie: pozitiiSelectate.join(', '),
      locatie: locatie.trim() || 'Depozit',
      pret: pret.trim() || '0',
      moneda,
      alteInfo: alteInfo.trim(),
      dataAdaugare: new Date().toLocaleDateString('ro-RO'),
    };

    const listaActualizata = [piesaNoua, ...piese];
    setPiese(listaActualizata);
    await AsyncStorage.setItem(STORAGE_KEYS.PIESE, JSON.stringify(listaActualizata));

    setDenumire('');
    setCodOem('');
    setCodProducator('');
    setPozitiiSelectate([]);
    setPret('');
    setAlteInfo('');
    Alert.alert('Succes!', `Piesa a fost salvată local cu codul ${codQrUnic}`);
    setSubEcranAdaugare(null);
    setEcranCurent('STOC');
  };

  const menuItems = [
    { id: 'ADAUGA_PIESA', titlu: '1. Adaugă piesă' },
    { id: 'STOC', titlu: `2. Stoc (${piese.length})` },
    { id: 'CAUTA', titlu: '3. Caută piesă' },
    { id: 'ADAUGA_MASINA', titlu: '4. Adaugă mașină' },
    { id: 'MASINILE_MELE', titlu: '5. Mașinile mele' },
    { id: 'JANTE', titlu: '6. Jante și anvelope' },
    { id: 'VANZARI', titlu: '7. Vânzări' },
    { id: 'RETURURI', titlu: '8. Retururi și piese defecte' },
    { id: 'LOTURI', titlu: '9. Loturi' },
    { id: 'CATEGORII', titlu: '10. Categorii și valori' },
    { id: 'STATISTICI', titlu: '11. Statistici' },
    { id: 'SETARI', titlu: '12. Setări și backup' },
  ];

  const pieseFiltrate = piese.filter((p) => {
    const q = textCautare.toLowerCase();
    return (
      p.denumire.toLowerCase().includes(q) ||
      p.codOem.toLowerCase().includes(q) ||
      p.codProducator.toLowerCase().includes(q) ||
      p.qr.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KOW AUTO PARTS</Text>
        <Text style={styles.headerSubtitle}>Android Offline-First</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {ecranCurent === 'ACASA' && (
          <ScrollView contentContainerStyle={styles.scroll}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuBtn}
                onPress={() => {
                  setSubEcranAdaugare(null);
                  setEcranCurent(item.id);
                }}
              >
                <Text style={styles.menuBtnText}>{item.titlu}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {ecranCurent === 'ADAUGA_PIESA' && !subEcranAdaugare && (
          <View style={styles.scroll}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setEcranCurent('ACASA')}>
              <Text style={styles.backTxt}>← Înapoi</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Adăugare Piesă</Text>
            <TouchableOpacity style={styles.bigBtn} onPress={() => setSubEcranAdaugare('INDIVIDUALA')}>
              <Text style={styles.bigBtnTxt}>+ ADĂUGĂ PIESĂ INDIVIDUALĂ</Text>
            </TouchableOpacity>
          </View>
        )}

        {ecranCurent === 'ADAUGA_PIESA' && subEcranAdaugare === 'INDIVIDUALA' && (
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSubEcranAdaugare(null)}>
              <Text style={styles.backTxt}>← Înapoi</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Formular Piesă</Text>

            <Text style={styles.label}>Denumire *</Text>
            <TextInput style={styles.input} placeholder="Ex: Far stânga" placeholderTextColor="#666" value={denumire} onChangeText={setDenumire} />

            <Text style={styles.label}>Categorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {categorii.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.chip, categorie === cat && styles.chipAct]} onPress={() => setCategorie(cat)}>
                  <Text style={[styles.chipTxt, categorie === cat && styles.chipTxtAct]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Categorie nouă..." placeholderTextColor="#666" value={categorieNoua} onChangeText={setCategorieNoua} />
              <TouchableOpacity style={styles.plusBtn} onPress={adaugaCategorieNoua}><Text style={{ color: '#000', fontSize: 20, fontWeight: 'bold' }}>+</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>Cod OEM</Text>
            <TextInput style={styles.input} placeholder="Ex: 1K0941006P" placeholderTextColor="#666" value={codOem} onChangeText={setCodOem} />

            <Text style={styles.label}>Poziție</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {POZITII_DISPONIBILE.map((poz) => {
                const sel = pozitiiSelectate.includes(poz);
                return (
                  <TouchableOpacity key={poz} style={[styles.chip, sel && styles.chipAct]} onPress={() => togglePozitie(poz)}>
                    <Text style={[styles.chipTxt, sel && styles.chipTxtAct]}>{poz}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Preț (RON)</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor="#666" value={pret} onChangeText={setPret} />

            <TouchableOpacity style={styles.saveBtn} onPress={salveazaPiesa}>
              <Text style={styles.saveTxt}>SALVEAZĂ ÎN STOC LOCAL</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {(ecranCurent === 'STOC' || ecranCurent === 'CAUTA') && (
          <View style={{ flex: 1, padding: 15 }}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setEcranCurent('ACASA')}>
              <Text style={styles.backTxt}>← Înapoi</Text>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="🔍 Caută piese..." placeholderTextColor="#888" value={textCautare} onChangeText={setTextCautare} />
            <ScrollView>
              {pieseFiltrate.length === 0 ? (
                <Text style={{ color: '#777', textAlign: 'center', marginTop: 30 }}>Nicio piesă salvată local.</Text>
              ) : (
                pieseFiltrate.map((p) => (
                  <View key={p.id} style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#ff9800', fontWeight: 'bold' }}>{p.qr}</Text>
                      <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>{p.pret} {p.moneda}</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginVertical: 4 }}>{p.denumire}</Text>
                    <Text style={{ color: '#aaa', fontSize: 13 }}>Cat: {p.categorie} {p.pozitie ? `• ${p.pozitie}` : ''}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {!['ACASA', 'ADAUGA_PIESA', 'STOC', 'CAUTA'].includes(ecranCurent) && (
          <View style={styles.scroll}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setEcranCurent('ACASA')}>
              <Text style={styles.backTxt}>← Înapoi</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Secțiunea: {ecranCurent}</Text>
            <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>În curând...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 15, backgroundColor: '#1f1f1f', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { color: '#ff9800', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#888', fontSize: 11, marginTop: 2 },
  scroll: { padding: 15, paddingBottom: 40 },
  menuBtn: { backgroundColor: '#242424', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  menuBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  backBtn: { backgroundColor: '#2c2c2c', padding: 10, borderRadius: 8, marginBottom: 15, alignSelf: 'flex-start' },
  backTxt: { color: '#ff9800', fontWeight: 'bold', fontSize: 13 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  bigBtn: { backgroundColor: '#ff9800', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  bigBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  label: { color: '#bbb', fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', marginBottom: 10, fontSize: 15 },
  chip: { backgroundColor: '#262626', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#444' },
  chipAct: { backgroundColor: '#ff9800', borderColor: '#ff9800' },
  chipTxt: { color: '#ccc', fontSize: 13 },
  chipTxtAct: { color: '#000', fontWeight: 'bold' },
  plusBtn: { backgroundColor: '#ff9800', width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { backgroundColor: '#4caf50', padding: 16, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  saveTxt: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  card: { backgroundColor: '#1e1e1e', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
});
    
