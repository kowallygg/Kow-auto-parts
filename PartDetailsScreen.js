
import React, { useState } from 'react';
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

const FIELD_LABELS = {
  partName: 'Denumire piesă',
  carMake: 'Marcă auto',
  carModel: 'Model',
  engine: 'Motorizare',
  engineCode: 'Cod motor',
  year: 'An fabricație',
  oemCode: 'Cod OEM',
  producerCode: 'Cod producător',
  price: 'Preț',
  transmissionType: 'Tip transmisie',
  transmissionCode: 'Cod cutie',
  position: 'Poziție',
  axlePosition: 'Punte',
  colorCode: 'Cod vopsea / culoare',
  wheelType: 'Tip roată',
  diameter: 'Diametru',
  rimWidth: 'Lățime jantă',
  offset: 'ET',
  pcd: 'PCD',
  tireSize: 'Dimensiune anvelopă',
  qrCode: 'Cod QR',
  condition: 'Stare piesă',
  verification: 'Verificare',
  defectDetails: 'Detalii defect',
  observations: 'Observații',
  location: 'Locație',
  locationType: 'Tip locație',
  shelf: 'Raft',
  column: 'Coloană',
  level: 'Nivel',
  locationDetails: 'Detalii locație',
  subcategoryName: 'Subcategorie',
  dateAdded: 'Data adăugării',
};

const BUMPER_LABELS = {
  type: 'Tip bară',
  carMake: 'Marcă auto',
  carModel: 'Model',
  year: 'An fabricație',
  color: 'Culoare',
  colorCode: 'Cod vopsea',
  bumperType: 'Tip bară',
  sensors: 'Senzori parcare',
  washers: 'Spălătoare faruri',
  fogLights: 'Proiectoare ceață',
  grilles: 'Grile',
  observations: 'Observații',
  extraFeatures: 'Dotări suplimentare',
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    return value
      .map(item => formatValue(item))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([key, item]) => {
        const formatted = formatValue(item);
        return formatted
          ? `${BUMPER_LABELS[key] || key}: ${formatted}`
          : '';
      })
      .filter(Boolean)
      .join('\n');
  }

  if (typeof value === 'boolean') {
    return value ? 'Da' : 'Nu';
  }

  return String(value);
}

function DetailRow({ label, value }) {
  const formatted = formatValue(value);

  if (!formatted) return null;

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{formatted}</Text>
    </View>
  );
}

function getSideEquipmentText(items) {
  if (!items) return '';

  return ['left', 'right']
    .map(side => {
      const item = items[side] || {};
      const code = String(item.code || '').trim();

      if (!item.enabled && !code) return '';

      const label = side === 'left' ? 'Stânga' : 'Dreapta';
      return code ? `${label}: ${code}` : label;
    })
    .filter(Boolean)
    .join('\n');
}

function getGrilleText(grilles) {
  return (grilles || [])
    .map(grille => {
      if (typeof grille === 'string') return grille.trim();
      if (!grille || typeof grille !== 'object') return '';

      const name = String(grille.name || '').trim();

      const codes = (Array.isArray(grille.codes) ? grille.codes : [])
        .map(code => String(code || '').trim())
        .filter(Boolean)
        .join(', ');

      if (name && codes) return `${name}: ${codes}`;
      return name || codes;
    })
    .filter(Boolean)
    .join('\n');
}

function getExtraFeaturesText(items) {
  return (items || [])
    .map(item => {
      if (typeof item === 'string') return item.trim();
      if (!item || typeof item !== 'object') return '';

      return [
        String(item.name || '').trim(),
        String(item.value || '').trim(),
      ]
        .filter(Boolean)
        .join(': ');
    })
    .filter(Boolean)
    .join('\n');
}

function BumperDetailRows({ data }) {
  const bumperType = data.bumperType === 'Alt tip'
    ? (
        String(data.customBumperType || '').trim()
        || 'Alt tip'
      )
    : data.bumperType;

  const sensorCodes = (data.sensorCodes || [])
    .map(code => String(code || '').trim())
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <DetailRow
        label="Tip piesă"
        value={
          data.type === 'completa'
            ? 'Bară față completă'
            : data.type === 'goala'
              ? 'Bară față goală'
              : data.type
        }
      />

      <DetailRow label="Culoare" value={data.color} />
      <DetailRow label="Tip bară" value={bumperType} />

      {data.sensorsEnabled ? (
        <>
          <DetailRow
            label="Senzori parcare"
            value={
              data.sensorCount
                ? `Da — ${data.sensorCount} buc.`
                : 'Da'
            }
          />
          <DetailRow label="Coduri senzori" value={sensorCodes} />
        </>
      ) : null}

      <DetailRow
        label="Spălătoare faruri"
        value={getSideEquipmentText(data.washers)}
      />

      <DetailRow
        label="Proiectoare ceață"
        value={getSideEquipmentText(data.fogLights)}
      />

      <DetailRow
        label="Grile"
        value={getGrilleText(data.grilles)}
      />

      <DetailRow
        label="Dotări suplimentare"
        value={getExtraFeaturesText(data.extraFeatures)}
      />

      <DetailRow label="Observații" value={data.observations} />
    </>
  );
}

function getLocationText(part) {
  if (part.location) return part.location;

  const type = part.locationType || '';
  if (!type) return '';

  if (type === 'Depozit' || type === 'Afară') {
    const details = [
      part.shelf ? `raft ${part.shelf}` : '',
      part.column ? `coloana ${part.column}` : '',
      part.level ? `nivel ${part.level}` : '',
    ].filter(Boolean);

    return [type, ...details].join(' – ');
  }

  return [type, part.locationDetails]
    .filter(Boolean)
    .join(' – ');
}

export default function PartDetailsScreen({
  part,
  goBack,
  onSellPart,
  lots = [],
  donorCars = [],
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [saleQuantity, setSaleQuantity] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  if (!part) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Piesa nu a fost găsită.
        </Text>

        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Înapoi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stockQuantity = Math.max(
    0,
    Number.parseInt(part.quantity, 10) || 0
  );

  const priceText = String(part.price || '0');
  const priceMatch = priceText.match(/\d+(?:[.,]\d+)?/);

  const unitPrice = priceMatch
    ? Number(priceMatch[0].replace(',', '.'))
    : 0;

  // Toate vânzările se înregistrează în RON.
  const currency = 'RON';

  const quantityToSell =
    Number.parseInt(saleQuantity, 10) || 0;

  const saleTotal = unitPrice * quantityToSell;

  const linkedCar = donorCars.find(
    car => String(car.id) === String(part.donorCarId)
  );

  const linkedLotId = part.lotId || linkedCar?.lotId;

  const linkedLot = lots.find(
    lot => String(lot.id) === String(linkedLotId)
  );

  const hasProvenance = !!(
    linkedLot ||
    linkedCar ||
    part.lot ||
    part.car ||
    part.lotId ||
    part.donorCarId
  );

  const confirmSale = () => {
    if (
      !Number.isInteger(quantityToSell) ||
      quantityToSell < 1 ||
      quantityToSell > stockQuantity
    ) {
      Alert.alert(
        'Cantitate invalidă',
        'Introdu o cantitate între 1 și cantitatea disponibilă în stoc.'
      );
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Date lipsă', 'Introdu numele clientului.');
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert('Date lipsă', 'Introdu numărul de telefon al clientului.');
      return;
    }

    if (typeof onSellPart !== 'function') {
      Alert.alert(
        'Eroare',
        'Funcția de înregistrare a vânzării nu este disponibilă.'
      );
      return;
    }

    onSellPart({
      partId: part.id,
      partName: part.partName,
      qrCode: part.qrCode,
      quantity: quantityToSell,
      unitPrice,
      total: saleTotal,
      currency: 'RON',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
    });

    setSaleModalVisible(false);
    setSaleQuantity('1');
    setCustomerName('');
    setCustomerPhone('');
  };

  const mainFields = [
    'partName',
    'carMake',
    'carModel',
    'engine',
    'engineCode',
    'year',
    'oemCode',
    'transmissionType',
    'transmissionCode',
    'position',
    'axlePosition',
    'colorCode',
    'wheelType',
    'diameter',
    'rimWidth',
    'offset',
    'pcd',
    'tireSize',
  ];

  const stockFields = [
    'price',
    'condition',
    'verification',
    'defectDetails',
    'observations',
  ];

  const locationText = getLocationText(part);

  const otherFields = [
    'qrCode',
    'subcategoryName',
    'dateAdded',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalii piesă</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datele piesei</Text>

          {mainFields.map(key => (
            <DetailRow
              key={key}
              label={FIELD_LABELS[key] || key}
              value={part[key]}
            />
          ))}

          {part.category === 'caroserie' && part.baraFata ? (
            <>
              <Text style={styles.subTitle}>Detalii bară față</Text>
              <BumperDetailRows data={part.baraFata} />
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stoc și stare</Text>

          <DetailRow
            label="Cantitate în stoc"
            value={`${part.quantity ?? 1} buc.`}
          />

          {stockFields.map(key => (
            <DetailRow
              key={key}
              label={FIELD_LABELS[key] || key}
              value={part[key]}
            />
          ))}
        </View>

        {locationText ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locația piesei</Text>
            <DetailRow label="Locație" value={locationText} />
          </View>
        ) : null}

        {hasProvenance ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proveniență</Text>

            <DetailRow
              label="Lot"
              value={linkedLot?.name || part.lot || 'Lot nespecificat'}
            />

            <DetailRow
              label="Mașină donatoare"
              value={
                linkedCar
                  ? `${linkedCar.brand || ''} ${linkedCar.model || ''}`.trim()
                  : part.car || ''
              }
            />

            {linkedCar?.year ? (
              <DetailRow
                label="An mașină donatoare"
                value={linkedCar.year}
              />
            ) : null}

            {linkedCar?.engineCode ? (
              <DetailRow
                label="Cod motor donatoare"
                value={linkedCar.engineCode}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alte informații</Text>

          {otherFields.map(key => (
            <DetailRow
              key={key}
              label={FIELD_LABELS[key] || key}
              value={part[key]}
            />
          ))}
        </View>

        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>
            Fotografii ({(part.photos || []).length})
          </Text>

          {(part.photos || []).length === 0 ? (
            <Text style={styles.noPhotos}>
              Nu există fotografii pentru această piesă.
            </Text>
          ) : (
            (part.photos || []).map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                activeOpacity={0.9}
                onPress={() => setSelectedPhoto(uri)}
              >
                <Image
                  source={{ uri }}
                  style={styles.detailPhoto}
                  resizeMode="cover"
                />
                <Text style={styles.photoHint}>
                  Fotografia {index + 1} · Apasă pentru mărire
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => setSaleModalVisible(true)}
          disabled={stockQuantity < 1}
        >
          <Text style={styles.sellButtonText}>
            {stockQuantity > 0 ? '💰 Vinde piesa' : 'Stoc epuizat'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={styles.closeModalText}>✕ Închide</Text>
          </TouchableOpacity>

          {selectedPhoto ? (
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.fullPhoto}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={saleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSaleModalVisible(false)}
      >
        <View style={styles.saleOverlay}>
          <View style={styles.saleBox}>
            <Text style={styles.saleTitle}>Înregistrare vânzare</Text>

            <Text style={styles.saleLabel}>
              Cantitate disponibilă: {stockQuantity}
            </Text>

            <Text style={styles.saleLabel}>Cantitate vândută</Text>

            <TextInput
              style={styles.saleInput}
              value={saleQuantity}
              onChangeText={setSaleQuantity}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.saleLabel}>Nume client</Text>

            <TextInput
              style={styles.saleInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Numele clientului"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.saleLabel}>Telefon client</Text>

            <TextInput
              style={styles.saleInput}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              placeholder="Număr de telefon"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total de încasat</Text>
              <Text style={styles.totalValue}>
                {saleTotal.toFixed(2)} RON
              </Text>
            </View>

            <TouchableOpacity
              style={styles.confirmSaleButton}
              onPress={confirmSale}
            >
              <Text style={styles.confirmSaleText}>
                Confirmă vânzarea
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelSaleButton}
              onPress={() => setSaleModalVisible(false)}
            >
              <Text style={styles.cancelSaleText}>Anulează</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#161920',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#293241',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  subTitle: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 6,
  },
  detailRow: {
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#293241',
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  photosSection: {
    marginTop: 4,
  },
  detailPhoto: {
    width: '100%',
    height: 260,
    borderRadius: 10,
    backgroundColor: '#202733',
    marginTop: 10,
  },
  photoHint: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 12,
  },
  noPhotos: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  emptyText: {
    color: '#FFFFFF',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModal: {
    position: 'absolute',
    top: 45,
    right: 18,
    zIndex: 2,
    padding: 12,
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fullPhoto: {
    width: '100%',
    height: '85%',
  },
  sellButton: {
    backgroundColor: '#16865D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  saleOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  saleBox: {
    backgroundColor: '#19212E',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#354255',
  },
  saleTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  saleLabel: {
    color: '#B9C5D6',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  saleInput: {
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    borderRadius: 8,
    color: '#FFFFFF',
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  totalBox: {
    backgroundColor: '#101722',
    padding: 14,
    borderRadius: 9,
    marginVertical: 8,
  },
  totalLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  totalValue: {
    color: '#4ADE80',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 4,
  },
  confirmSaleButton: {
    backgroundColor: '#16865D',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmSaleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  cancelSaleButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelSaleText: {
    color: '#FCA5A5',
    fontWeight: '700',
  },
});
