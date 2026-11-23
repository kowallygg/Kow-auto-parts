
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

const normalizeText = value =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

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

  return path
    .replace(/\[(\d+)\]/g, ' $1')
    .split('.')
    .filter(Boolean)
    .map(part => labels[part] || part)
    .join(' → ');
};

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

const getPartCodeMatches = part => {
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

    if (typeof value !== 'object' || visited.has(value)) return;

    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, `${path}[${index}]`, parentIsCode);
      });
      return;
    }

    Object.entries(value).forEach(([key, child]) => {
      const childPath = path ? `${path}.${key}` : key;
      walk(child, childPath, isCodeField(key) || parentIsCode);
    });
  };

  walk(part);

  const unique = [];
  const seen = new Set();

  matches.forEach(match => {
    const key = `${normalizeText(match.value)}|${match.path}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(match);
    }
  });

  [
    ['oemCode', part.oemCode],
    ['producerCode', part.producerCode],
    ['qrCode', part.qrCode],
  ].forEach(([key, value]) => {
    if (!value) return;

    const normalized = normalizeText(value);

    if (
      !unique.some(
        item =>
          normalizeText(item.value) === normalized &&
          item.path === key
      )
    ) {
      unique.push({
        value: String(value).trim(),
        label: getCodeLabel(key),
        path: key,
      });
    }
  });

  return unique;
};

const getPartSearchText = item => {
  const bumper = item.baraFata || {};

  const generalValues = [
    item.partName,
    item.qrCode,
    item.id,
    item.oemCode,
    item.producerCode,
    item.carMake,
    item.carModel,
    item.engine,
    item.engineCode,
    item.year,
    item.transmissionType,
    item.transmissionCode,
    item.position,
    item.axlePosition,
    item.colorCode,
    item.wheelType,
    item.diameter,
    item.rimWidth,
    item.offset,
    item.pcd,
    item.tireSize,
    item.category,
    item.subcategoryName,
    item.car,
    bumper.carMake,
    bumper.carModel,
    bumper.year,
    bumper.colorCode,
  ];

  const codes = getPartCodeMatches(item).map(match => match.value);

  return normalizeText(
    [...generalValues, ...codes].filter(Boolean).join(' ')
  );
};

export default function StockScreen({
  stockParts = [],
  goBack,
  onDeletePart,
  onOpenPart,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getOemCode = item => {
    if (item.baraFata?.oemCodes?.length) {
      return item.baraFata.oemCodes.filter(Boolean).join(', ');
    }
    return item.oemCode || '';
  };

  const getCarName = item => {
    const make = item.baraFata?.carMake || item.carMake || '';
    const model = item.baraFata?.carModel || item.carModel || '';
    const year = item.baraFata?.year || item.year || '';
    const car = item.car || '';

    const details = [make, model, year].filter(Boolean).join(' ');
    return details || car || 'Nespecificată';
  };

  const getColorCode = item =>
    item.baraFata?.colorCode || item.colorCode || '';

  const normalizedSearch = normalizeText(searchQuery);

  const filteredParts = normalizedSearch
    ? stockParts.filter(item =>
        getPartSearchText(item).includes(normalizedSearch)
      )
    : stockParts;

  const confirmDelete = item => {
    if (deletingId !== null) return;

    Alert.alert(
      'Confirmare ștergere',
      `Sigur vrei să ștergi piesa „${item.partName || 'fără denumire'}” din stoc?`,
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            if (deletingId !== null) return;

            setDeletingId(item.id);

            try {
              if (typeof onDeletePart === 'function') {
                await onDeletePart(item.id);
              }
            } catch (error) {
              console.log('Eroare la ștergerea piesei:', error);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Stoc piese ({stockParts.length})
        </Text>

        <View style={{ width: 60 }} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Caută piesă, OEM, senzor, grilă..."
        placeholderTextColor="#6B7280"
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {normalizedSearch ? (
        <Text style={styles.resultCount}>
          {filteredParts.length > 0
            ? `${filteredParts.length} rezultate găsite`
            : 'Nu am găsit nicio piesă'}
        </Text>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      >
        {stockParts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              Nu ai nicio piesă salvată în stoc momentan.
            </Text>
            <Text style={styles.emptySub}>
              Adaugă prima piesă folosind formularul!
            </Text>
          </View>
        ) : filteredParts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyText}>
              Nu există piese care să corespundă căutării.
            </Text>
          </View>
        ) : (
          filteredParts.map(item => {
            const oemCode = getOemCode(item);
            const colorCode = getColorCode(item);
            const isBodywork = item.category === 'caroserie';
            const isDeleting = deletingId === item.id;

            const matchedCodes = normalizedSearch
              ? getPartCodeMatches(item).filter(match =>
                  normalizeText(match.value).includes(normalizedSearch)
                )
              : [];

            return (
              <View key={String(item.id)} style={styles.partCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onOpenPart && onOpenPart(item)}
                  disabled={isDeleting}
                >
                  <Text style={styles.partTitle}>
                    {item.partName || 'Piesă fără denumire'}
                  </Text>

                  <View style={styles.photoRow}>
                    {(item.photos || []).slice(0, 4).map((uri, index) => (
                      <Image
                        key={`${uri}-${index}`}
                        source={{ uri }}
                        style={styles.stockThumb}
                      />
                    ))}
                  </View>

                  {oemCode ? (
                    <Text style={styles.partMeta}>
                      OEM: {oemCode}
                    </Text>
                  ) : null}

                  {item.producerCode ? (
                    <Text style={styles.partMeta}>
                      Cod producător: {item.producerCode}
                    </Text>
                  ) : null}

                  {matchedCodes.map((match, index) => (
                    <Text
                      key={`${match.path}-${index}`}
                      style={styles.matchText}
                    >
                      Potrivire: {match.label}: {match.value}
                    </Text>
                  ))}

                  <Text style={styles.partMeta}>
                    Mașină: {getCarName(item)}
                  </Text>

                  {isBodywork && colorCode ? (
                    <Text style={styles.partMeta}>
                      Cod vopsea: {colorCode}
                    </Text>
                  ) : null}

                  <View style={styles.bottomRow}>
                    <Text style={styles.quantity}>
                      În stoc: {item.quantity ?? 1} buc.
                    </Text>

                    <Text style={styles.partPrice}>
                      {item.price || ''}
                    </Text>
                  </View>

                  <Text style={styles.openHint}>
                    Apasă pentru toate detaliile →
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    isDeleting && styles.deleteBtnDisabled,
                  ]}
                  onPress={() => confirmDelete(item)}
                  disabled={isDeleting || deletingId !== null}
                >
                  <Text style={styles.deleteBtnText}>
                    {isDeleting
                      ? 'Se șterge...'
                      : '🗑️ Șterge din stoc'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    padding: 16,
  },
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
  backButtonText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    marginBottom: 8,
  },
  resultCount: {
    color: '#60A5FA',
    fontSize: 12,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySub: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  partCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  partTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  stockThumb: {
    width: '23%',
    height: 68,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#0F1115',
  },
  partMeta: {
    color: '#B8C1CE',
    fontSize: 12,
    marginTop: 4,
  },
  matchText: {
    color: '#60A5FA',
    fontSize: 11,
    marginTop: 5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  quantity: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: 'bold',
  },
  partPrice: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  openHint: {
    color: '#60A5FA',
    fontSize: 11,
    marginTop: 10,
  },
  deleteBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.5,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
