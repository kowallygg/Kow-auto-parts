
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StockScreen({
  stockParts,
  goBack,
  onDeletePart,
  onOpenPart,
}) {
  const [deletingId, setDeletingId] = useState(null);

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

  const getColorCode = item => {
    return item.baraFata?.colorCode || item.colorCode || '';
  };

  const confirmDelete = item => {
    if (deletingId !== null) {
      return;
    }

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
            if (deletingId !== null) {
              return;
            }

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

      <ScrollView contentContainerStyle={styles.listContent}>
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
        ) : (
          stockParts.map(item => {
            const oemCode = getOemCode(item);
            const colorCode = getColorCode(item);
            const isBodywork = item.category === 'caroserie';
            const isDeleting = deletingId === item.id;

            return (
              <View key={item.id} style={styles.partCard}>
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
