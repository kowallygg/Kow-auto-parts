
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SalesScreen({ sales = [], goBack }) {
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Dată indisponibilă';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Dată indisponibilă';
    }

    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMoney = (value, currency) => {
    const amount = Number(value) || 0;
    return `${amount.toFixed(2)} ${currency || 'EUR'}`;
  };

  const totalSales = sales.reduce(
    (sum, sale) => sum + (Number(sale.total) || 0),
    0
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Istoric vânzări</Text>

        <View style={{ width: 60 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          Număr total de vânzări
        </Text>
        <Text style={styles.summaryValue}>
          {sales.length}
        </Text>
        <Text style={styles.summaryHint}>
          Totalurile sunt afișate individual în moneda fiecărei vânzări.
        </Text>
      </View>

      {sales.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyTitle}>
            Nu există încă vânzări
          </Text>
          <Text style={styles.emptyText}>
            După ce înregistrezi prima vânzare din detaliile unei piese,
            aceasta va apărea aici.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>
            Vânzări înregistrate
          </Text>

          {sales.map((sale) => (
            <View key={sale.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.saleBadge}>
                  VÂNZARE
                </Text>
                <Text style={styles.saleDate}>
                  {formatDate(sale.date)}
                </Text>
              </View>

              <Text style={styles.partName}>
                {sale.partName || 'Piesă fără denumire'}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cantitate vândută</Text>
                <Text style={styles.infoValue}>
                  {sale.quantity}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Preț / bucată</Text>
                <Text style={styles.infoValue}>
                  {formatMoney(sale.unitPrice, sale.currency)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Client</Text>
                <Text style={styles.infoValue}>
                  {sale.customerName || 'Nespecificat'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefon</Text>
                <Text style={styles.infoValue}>
                  {sale.customerPhone || 'Nespecificat'}
                </Text>
              </View>

              {sale.qrCode ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Cod QR</Text>
                  <Text style={styles.infoValue}>
                    {sale.qrCode}
                  </Text>
                </View>
              ) : null}

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>
                  Total încasat
                </Text>
                <Text style={styles.totalValue}>
                  {formatMoney(sale.total, sale.currency)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#0F1115',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
  summaryCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 5,
  },
  summaryHint: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  listContainer: {
    gap: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 12,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  saleBadge: {
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
  },
  saleDate: {
    color: '#9CA3AF',
    fontSize: 11,
    flexShrink: 1,
    textAlign: 'right',
  },
  partName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#252D3A',
    gap: 12,
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    flex: 1,
  },
  infoValue: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  totalBox: {
    backgroundColor: '#101722',
    borderRadius: 9,
    padding: 13,
    marginTop: 12,
  },
  totalLabel: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  totalValue: {
    color: '#4ADE80',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 4,
  },
});
