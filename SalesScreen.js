
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const toNumber = value => {
  const number = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
};

const money = value => `${toNumber(value).toFixed(2)} RON`;

const formatDate = value => {
  if (!value) return 'Dată indisponibilă';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Dată indisponibilă';

  return date.toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const originalMoney = (amount, currency) =>
  `${toNumber(amount).toFixed(2)} ${currency || 'RON'}`;

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

function Metric({ label, value, color }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export default function SalesScreen({
  sales = [],
  lots = [],
  donorCars = [],
  expenses = [],
  stockParts = [],
  goBack,
}) {
  const [tab, setTab] = useState('overview');

  const getSaleTotal = sale => toNumber(sale.total);

  const getLotSales = lotId =>
    sales.filter(sale => String(sale.lotId) === String(lotId));

  const getCarSales = carId =>
    sales.filter(sale => String(sale.donorCarId) === String(carId));

  const getExpenseRon = expense => {
    if (expense.amountRon !== undefined && expense.amountRon !== null) {
      return toNumber(expense.amountRon);
    }

    const rate =
      expense.currency === 'RON'
        ? 1
        : toNumber(expense.exchangeRate || 0);

    return toNumber(expense.amount) * rate;
  };

  const getLotExpenses = lotId =>
    expenses.filter(
      expense =>
        String(expense.lotId) === String(lotId) &&
        !expense.donorCarId
    );

  const getCarExpenses = carId =>
    expenses.filter(
      expense => String(expense.donorCarId) === String(carId)
    );

  const getLotInvestment = lot => {
    const acquisition =
      lot.acquisitionRon !== undefined && lot.acquisitionRon !== null
        ? toNumber(lot.acquisitionRon)
        : toNumber(lot.acquisitionAmount) *
          toNumber(lot.exchangeRate || 1);

    const legacyCosts =
      (
        toNumber(lot.transportAmount) +
        toNumber(lot.customsAmount) +
        toNumber(lot.otherExpensesAmount)
      ) * toNumber(lot.exchangeRate || 1);

    const separateExpenses = getLotExpenses(lot.id).reduce(
      (sum, expense) => sum + getExpenseRon(expense),
      0
    );

    return acquisition + legacyCosts + separateExpenses;
  };

  const getCarInvestment = car => {
    const acquisition =
      car.acquisitionRon !== undefined && car.acquisitionRon !== null
        ? toNumber(car.acquisitionRon)
        : toNumber(car.acquisitionAmount) *
          toNumber(car.exchangeRate || 1);

    const directExpenses = getCarExpenses(car.id).reduce(
      (sum, expense) => sum + getExpenseRon(expense),
      0
    );

    return acquisition + directExpenses;
  };

  const totalRevenue = useMemo(
    () => sales.reduce((sum, sale) => sum + getSaleTotal(sale), 0),
    [sales]
  );

  const totalLotInvestment = useMemo(
    () => lots.reduce((sum, lot) => sum + getLotInvestment(lot), 0),
    [lots, expenses]
  );

  const totalCarInvestment = useMemo(
    () => donorCars.reduce((sum, car) => sum + getCarInvestment(car), 0),
    [donorCars, expenses]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + getExpenseRon(expense), 0),
    [expenses]
  );

  const totalQuantitySold = useMemo(
    () =>
      sales.reduce(
        (sum, sale) => sum + toNumber(sale.quantity),
        0
      ),
    [sales]
  );

  const unlinkedSales = sales.filter(
    sale => !sale.lotId && !sale.donorCarId
  );

  const unlinkedRevenue = unlinkedSales.reduce(
    (sum, sale) => sum + getSaleTotal(sale),
    0
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      {[
        { id: 'overview', label: 'GENERAL' },
        { id: 'lots', label: 'LOTURI' },
        { id: 'cars', label: 'MAȘINI' },
        { id: 'history', label: 'ISTORIC' },
      ].map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => setTab(item.id)}
          style={[styles.tab, tab === item.id && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              tab === item.id && styles.tabTextActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverview = () => (
    <>
      <SectionTitle>Rezumat financiar</SectionTitle>

      <View style={styles.summaryGrid}>
        <Metric
          label="Total încasări"
          value={money(totalRevenue)}
          color="#4ADE80"
        />
        <Metric
          label="Număr vânzări"
          value={String(sales.length)}
        />
        <Metric
          label="Bucăți vândute"
          value={String(totalQuantitySold)}
        />
        <Metric
          label="Cheltuieli înregistrate"
          value={money(totalExpenses)}
          color="#FBBF24"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Investiții înregistrate</Text>
        <InfoRow
          label="Costuri directe ale loturilor"
          value={money(totalLotInvestment)}
        />
        <InfoRow
          label="Achiziții și cheltuieli mașini"
          value={money(totalCarInvestment)}
        />
        <InfoRow
          label="Cheltuieli introduse separat"
          value={money(totalExpenses)}
        />
        <Text style={styles.helper}>
          Cheltuielile separate sunt deja incluse în totalurile loturilor
          sau mașinilor. Nu le aduna din nou la investiții.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vânzări fără proveniență</Text>
        <InfoRow
          label="Vânzări fără lot sau mașină asociată"
          value={String(unlinkedSales.length)}
        />
        <InfoRow
          label="Încasări aferente"
          value={money(unlinkedRevenue)}
        />
        <Text style={styles.helper}>
          Aceste vânzări sunt incluse în încasările totale, dar nu pot fi
          atribuite unui lot sau unei mașini.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cum sunt calculate rezultatele</Text>
        <Text style={styles.helper}>
          • Vânzările sunt înregistrate în RON.
        </Text>
        <Text style={styles.helper}>
          • Achizițiile și cheltuielile sunt convertite folosind cursul
          salvat la înregistrarea lor.
        </Text>
        <Text style={styles.helper}>
          • Costul lotului rămâne la nivelul lotului. Nu este împărțit
          automat între mașinile donatoare.
        </Text>
        <Text style={styles.helper}>
          • Rezultatul unei mașini este calculat înainte de eventuala
          alocare manuală a unei părți din costul lotului.
        </Text>
      </View>
    </>
  );

  const renderLots = () => (
    <>
      <SectionTitle>Rezultate pe loturi</SectionTitle>

      {lots.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nu există loturi</Text>
          <Text style={styles.helper}>
            Loturile înregistrate vor apărea aici împreună cu încasările
            și costurile lor directe.
          </Text>
        </View>
      ) : (
        lots.map(lot => {
          const lotSales = getLotSales(lot.id);
          const revenue = lotSales.reduce(
            (sum, sale) => sum + getSaleTotal(sale),
            0
          );
          const investment = getLotInvestment(lot);
          const difference = revenue - investment;
          const lotExpenses = getLotExpenses(lot.id);
          const cars = donorCars.filter(
            car => String(car.lotId) === String(lot.id)
          );

          return (
            <View key={lot.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {lot.name || 'Lot fără nume'}
              </Text>
              <Text style={styles.meta}>
                Achiziție: {lot.acquisitionDate || 'Nespecificată'}
              </Text>

              <InfoRow
                label="Cost achiziție inițial"
                value={originalMoney(
                  lot.acquisitionAmount,
                  lot.currency
                )}
              />
              <InfoRow
                label="Curs achiziție"
                value={toNumber(lot.exchangeRate || 1).toFixed(4)}
              />
              <InfoRow
                label="Investiție directă lot"
                value={money(investment)}
              />
              <InfoRow
                label="Cheltuieli separate"
                value={money(
                  lotExpenses.reduce(
                    (sum, expense) => sum + getExpenseRon(expense),
                    0
                  )
                )}
              />
              <InfoRow
                label="Încasări din piese"
                value={money(revenue)}
                valueColor="#4ADE80"
              />
              <InfoRow
                label="Diferență încasări - cost lot"
                value={money(difference)}
                valueColor={difference >= 0 ? '#4ADE80' : '#F87171'}
              />
              <InfoRow
                label="Număr vânzări"
                value={String(lotSales.length)}
              />
              <InfoRow
                label="Mașini asociate"
                value={String(cars.length)}
              />

              <Text style={styles.helper}>
                Diferența de mai sus este înainte de costurile individuale
                ale mașinilor și nu reprezintă profitul final al lotului.
              </Text>
            </View>
          );
        })
      )}
    </>
  );

  const renderCars = () => (
    <>
      <SectionTitle>Rezultate pe mașini donatoare</SectionTitle>

      {donorCars.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nu există mașini donatoare</Text>
          <Text style={styles.helper}>
            Înregistrează mașinile în secțiunea Proveniență.
          </Text>
        </View>
      ) : (
        donorCars.map(car => {
          const carSales = getCarSales(car.id);
          const revenue = carSales.reduce(
            (sum, sale) => sum + getSaleTotal(sale),
            0
          );
          const investment = getCarInvestment(car);
          const result = revenue - investment;
          const carExpenses = getCarExpenses(car.id);
          const parentLot = lots.find(
            lot => String(lot.id) === String(car.lotId)
          );

          return (
            <View key={car.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {car.brand} {car.model} {car.year}
              </Text>
              <Text style={styles.meta}>
                {car.engine || 'Motorizare nespecificată'}
                {car.engineCode ? ` · ${car.engineCode}` : ''}
              </Text>
              <Text style={styles.meta}>
                Lot: {parentLot?.name || 'Fără lot asociat'}
              </Text>

              <InfoRow
                label="Achiziție inițială"
                value={originalMoney(
                  car.acquisitionAmount,
                  car.currency
                )}
              />
              <InfoRow
                label="Curs achiziție"
                value={toNumber(car.exchangeRate || 1).toFixed(4)}
              />
              <InfoRow
                label="Investiție directă mașină"
                value={money(investment)}
              />
              <InfoRow
                label="Cheltuieli directe"
                value={money(
                  carExpenses.reduce(
                    (sum, expense) => sum + getExpenseRon(expense),
                    0
                  )
                )}
              />
              <InfoRow
                label="Încasări din piesele mașinii"
                value={money(revenue)}
                valueColor="#4ADE80"
              />
              <InfoRow
                label="Rezultat înainte de costul lotului"
                value={money(result)}
                valueColor={result >= 0 ? '#4ADE80' : '#F87171'}
              />
              <InfoRow
                label="Număr vânzări"
                value={String(carSales.length)}
              />

              <Text style={styles.helper}>
                Rezultatul nu include o eventuală cotă din costul comun
                al lotului. Aceasta trebuie alocată separat, manual.
              </Text>
            </View>
          );
        })
      )}
    </>
  );

  const renderHistory = () => (
    <>
      <SectionTitle>Istoric vânzări</SectionTitle>

      {sales.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyTitle}>Nu există încă vânzări</Text>
          <Text style={styles.helper}>
            Vânzările înregistrate din detaliile pieselor vor apărea aici.
          </Text>
        </View>
      ) : (
        sales.map(sale => {
          const car = donorCars.find(
            item => String(item.id) === String(sale.donorCarId)
          );
          const lot = lots.find(
            item => String(item.id) === String(sale.lotId)
          );

          return (
            <View key={sale.id} style={styles.saleCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.saleBadge}>VÂNZARE</Text>
                <Text style={styles.saleDate}>
                  {formatDate(sale.date)}
                </Text>
              </View>

              <Text style={styles.cardTitle}>
                {sale.partName || 'Piesă fără denumire'}
              </Text>

              <InfoRow
                label="Cantitate vândută"
                value={String(sale.quantity ?? 0)}
              />
              <InfoRow
                label="Preț / bucată"
                value={money(sale.unitPrice)}
              />
              <InfoRow
                label="Client"
                value={sale.customerName || 'Nespecificat'}
              />
              <InfoRow
                label="Telefon"
                value={sale.customerPhone || 'Nespecificat'}
              />

              {sale.qrCode ? (
                <InfoRow label="Cod QR" value={sale.qrCode} />
              ) : null}

              <InfoRow
                label="Lot"
                value={lot?.name || 'Neasociat'}
              />
              <InfoRow
                label="Mașină donatoare"
                value={
                  car
                    ? `${car.brand || ''} ${car.model || ''}`.trim()
                    : 'Neasociată'
                }
              />

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total încasat</Text>
                <Text style={styles.totalValue}>
                  {money(sale.total)}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>⬅ Înapoi</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financiar</Text>
        <View style={{ width: 60 }} />
      </View>

      {renderTabs()}

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'overview' ? renderOverview() : null}
        {tab === 'lots' ? renderLots() : null}
        {tab === 'cars' ? renderCars() : null}
        {tab === 'history' ? renderHistory() : null}
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
    paddingTop: 42,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  backButton: {
    backgroundColor: '#161920',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  backButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 15,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metric: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 11,
    padding: 13,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 7,
  },
  card: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#293241',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  saleCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 9,
  },
  meta: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#252D3A',
    gap: 10,
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    flex: 1,
  },
  infoValue: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  helper: {
    color: '#8993A3',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  emptyCard: {
    backgroundColor: '#161920',
    borderWidth: 1,
    borderColor: '#293241',
    borderRadius: 12,
    padding: 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
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
    fontSize: 10,
    flexShrink: 1,
    textAlign: 'right',
  },
  totalBox: {
    backgroundColor: '#101722',
    borderRadius: 9,
    padding: 12,
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
