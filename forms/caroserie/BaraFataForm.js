
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const INITIAL_DATA = {
  type: 'completa',
  carMake: '',
  carModel: '',
  year: '',
  compatibleFrom: '',
  compatibleTo: '',
  oemCodes: [''],
  colorCode: '',
  color: '',
  bumperType: 'Standard',

  sensorsEnabled: false,
  sensorCount: '4',
  sensorCodes: [''],

  washers: {
    left: { enabled: false, code: '' },
    right: { enabled: false, code: '' },
  },

  fogLights: {
    left: { enabled: false, code: '' },
    right: { enabled: false, code: '' },
  },

  grillesEnabled: false,
  grilles: [
    { name: '', codes: [''] },
  ],

  observations: '',
  extraFeatures: [],
};

function buildFormData(value) {
  return {
    ...INITIAL_DATA,
    ...(value || {}),
    washers: {
      ...INITIAL_DATA.washers,
      ...(value?.washers || {}),
      left: {
        ...INITIAL_DATA.washers.left,
        ...(value?.washers?.left || {}),
      },
      right: {
        ...INITIAL_DATA.washers.right,
        ...(value?.washers?.right || {}),
      },
    },
    fogLights: {
      ...INITIAL_DATA.fogLights,
      ...(value?.fogLights || {}),
      left: {
        ...INITIAL_DATA.fogLights.left,
        ...(value?.fogLights?.left || {}),
      },
      right: {
        ...INITIAL_DATA.fogLights.right,
        ...(value?.fogLights?.right || {}),
      },
    },
    oemCodes: Array.isArray(value?.oemCodes)
      ? value.oemCodes
      : [''],
    sensorCodes: Array.isArray(value?.sensorCodes)
      ? value.sensorCodes
      : [''],
    grilles: Array.isArray(value?.grilles)
      ? value.grilles
      : [{ name: '', codes: [''] }],
    extraFeatures: Array.isArray(value?.extraFeatures)
      ? value.extraFeatures
      : [],
  };
}

export default function BaraFataForm({
  value,
  onChange,
}) {
  const [data, setData] = useState(() => buildFormData(value));

  useEffect(() => {
    setData(buildFormData(value));
  }, [value]);

  const update = (key, newValue) => {
    const next = {
      ...data,
      [key]: newValue,
    };

    setData(next);

    if (onChange) {
      onChange(next);
    }
  };

  const updateNested = (section, key, field, newValue) => {
    const nextSection = {
      ...data[section],
      [key]: {
        ...data[section][key],
        [field]: newValue,
      },
    };

    update(section, nextSection);
  };

  const updateCode = (key, index, newValue) => {
    const codes = [...data[key]];
    codes[index] = newValue;
    update(key, codes);
  };

  const addCode = key => {
    update(key, [...data[key], '']);
  };

  const removeCode = (key, index) => {
    update(
      key,
      data[key].filter((_, i) => i !== index)
    );
  };

  const updateGrille = (index, field, newValue) => {
    const grilles = [...data.grilles];

    grilles[index] = {
      ...grilles[index],
      [field]: newValue,
    };

    update('grilles', grilles);
  };

  const updateGrilleCode = (grilleIndex, codeIndex, newValue) => {
    const grilles = [...data.grilles];
    const codes = [...grilles[grilleIndex].codes];

    codes[codeIndex] = newValue;

    grilles[grilleIndex] = {
      ...grilles[grilleIndex],
      codes,
    };

    update('grilles', grilles);
  };

  const addGrilleCode = grilleIndex => {
    const grilles = [...data.grilles];

    grilles[grilleIndex] = {
      ...grilles[grilleIndex],
      codes: [...grilles[grilleIndex].codes, ''],
    };

    update('grilles', grilles);
  };

  const addGrille = () => {
    update('grilles', [
      ...data.grilles,
      { name: '', codes: [''] },
    ]);
  };

  const removeGrille = index => {
    update(
      'grilles',
      data.grilles.filter((_, i) => i !== index)
    );
  };

  const addExtraFeature = () => {
    update('extraFeatures', [
      ...data.extraFeatures,
      { name: '', value: '', codes: [''] },
    ]);
  };

  const updateExtraFeature = (index, field, newValue) => {
    const items = [...data.extraFeatures];

    items[index] = {
      ...items[index],
      [field]: newValue,
    };

    update('extraFeatures', items);
  };

  const removeExtraFeature = index => {
    update(
      'extraFeatures',
      data.extraFeatures.filter((_, i) => i !== index)
    );
  };

  return (
    <View style={styles.container}>

      {/* TIP BARĂ */}
      <Section title="1. Tipul piesei">

        <View style={styles.choiceRow}>
          <Choice
            label="Bară față completă"
            selected={data.type === 'completa'}
            onPress={() => update('type', 'completa')}
          />

          <Choice
            label="Bară față goală"
            selected={data.type === 'goala'}
            onPress={() => update('type', 'goala')}
          />
        </View>

      </Section>

      {/* IDENTIFICARE AUTO */}
      <Section title="2. Identificarea mașinii">

        <Field
          label="Marcă auto"
          value={data.carMake}
          onChangeText={v => update('carMake', v)}
        />

        <Field
          label="Model"
          value={data.carModel}
          onChangeText={v => update('carModel', v)}
        />

        <Field
          label="An fabricație"
          value={data.year}
          onChangeText={v => update('year', v)}
          keyboardType="numeric"
          placeholder="Ex. 2006"
        />

        <Text style={styles.subheading}>
          Compatibilitate între ani
        </Text>

        <View style={styles.yearRow}>
          <View style={styles.yearField}>
            <Field
              label="De la anul"
              value={data.compatibleFrom}
              onChangeText={v => update('compatibleFrom', v)}
              keyboardType="numeric"
              placeholder="2005"
            />
          </View>

          <View style={styles.yearField}>
            <Field
              label="Până la anul"
              value={data.compatibleTo}
              onChangeText={v => update('compatibleTo', v)}
              keyboardType="numeric"
              placeholder="2010"
            />
          </View>
        </View>

        <Text style={styles.helper}>
          Exemplu: piesă fabricată în 2006, compatibilă
          cu modelele din 2005 până în 2010.
        </Text>

      </Section>

      {/* CODURI SI CULOARE */}
      <Section title="3. Coduri și culoare">

        <CodeList
          label="Cod OEM"
          values={data.oemCodes}
          onChange={v => update('oemCodes', v)}
        />

        <Field
          label="Cod culoare"
          value={data.colorCode}
          onChangeText={v => update('colorCode', v)}
          placeholder="Codul culorii, dacă este cunoscut"
        />

        <Field
          label="Culoare"
          value={data.color}
          onChangeText={v => update('color', v)}
          placeholder="Ex. Negru, gri, argintiu..."
        />

        <Text style={styles.subheading}>
          Tip bară
        </Text>

        <View style={styles.choiceRow}>
          {['Standard', 'M-Paket', 'AMG', 'S-Line', 'Alt tip'].map(item => (
            <Choice
              key={item}
              label={item}
              selected={data.bumperType === item}
              onPress={() => update('bumperType', item)}
            />
          ))}
        </View>

        {data.bumperType === 'Alt tip' ? (
          <Field
            label="Descrie tipul barei"
            value={data.customBumperType || ''}
            onChangeText={v => update('customBumperType', v)}
          />
        ) : null}

      </Section>

      {/* ECHIPARE */}
      {data.type === 'completa' ? (
        <>
          <Section title="4. Senzori parcare">

            <Toggle
              label="Bara are senzori de parcare?"
              value={data.sensorsEnabled}
              onChange={v => update('sensorsEnabled', v)}
            />

            {data.sensorsEnabled ? (
              <>
                <Text style={styles.label}>
                  Număr senzori
                </Text>

                <View style={styles.choiceRow}>
                  {['4', '5', '6', '7', '8'].map(item => (
                    <Choice
                      key={item}
                      label={item}
                      selected={data.sensorCount === item}
                      onPress={() => update('sensorCount', item)}
                    />
                  ))}
                </View>

                <CodeList
                  label="Coduri senzori"
                  values={data.sensorCodes}
                  onChange={v => update('sensorCodes', v)}
                />
              </>
            ) : null}

          </Section>

          <Section title="5. Spălătoare faruri">

            <SideOption
              label="Stânga"
              data={data.washers.left}
              onChange={v =>
                updateNested('washers', 'left', 'enabled', v)
              }
              onCodeChange={v =>
                updateNested('washers', 'left', 'code', v)
              }
            />

            <SideOption
              label="Dreapta"
              data={data.washers.right}
              onChange={v =>
                updateNested('washers', 'right', 'enabled', v)
              }
              onCodeChange={v =>
                updateNested('washers', 'right', 'code', v)
              }
            />

          </Section>

          <Section title="6. Proiectoare ceață">

            <SideOption
              label="Stânga"
              data={data.fogLights.left}
              onChange={v =>
                updateNested('fogLights', 'left', 'enabled', v)
              }
              onCodeChange={v =>
                updateNested('fogLights', 'left', 'code', v)
              }
            />

            <SideOption
              label="Dreapta"
              data={data.fogLights.right}
              onChange={v =>
                updateNested('fogLights', 'right', 'enabled', v)
              }
              onCodeChange={v =>
                updateNested('fogLights', 'right', 'code', v)
              }
            />

          </Section>

          <Section title="7. Grile">

            <Toggle
              label="Bara are grile?"
              value={data.grillesEnabled}
              onChange={v => update('grillesEnabled', v)}
            />

            {data.grillesEnabled ? (
              <>
                {data.grilles.map((grille, index) => (
                  <View key={index} style={styles.dynamicCard}>

                    <View style={styles.dynamicHeader}>
                      <Text style={styles.subheading}>
                        Grilă {index + 1}
                      </Text>

                      {data.grilles.length > 1 ? (
                        <RemoveButton
                          onPress={() => removeGrille(index)}
                        />
                      ) : null}
                    </View>

                    <Field
                      label="Denumire grilă"
                      value={grille.name}
                      onChangeText={v =>
                        updateGrille(index, 'name', v)
                      }
                      placeholder="Ex. Grilă centrală sus"
                    />

                    <CodeList
                      label="Coduri grilă"
                      values={grille.codes}
                      onChange={v =>
                        updateGrille(index, 'codes', v)
                      }
                    />

                  </View>
                ))}

                <AddButton
                  label="+ Adaugă altă grilă"
                  onPress={addGrille}
                />
              </>
            ) : null}

          </Section>
        </>
      ) : (
        <Section title="4. Echipare">
          <Text style={styles.helper}>
            Ai selectat bară față goală. Nu este necesar
            să completezi senzorii, spălătoarele,
            proiectoarele sau grilele.
          </Text>
        </Section>
      )}

      {/* ALTE CARACTERISTICI */}
      <Section title="8. Alte caracteristici">

        {data.extraFeatures.map((item, index) => (
          <View key={index} style={styles.dynamicCard}>

            <View style={styles.dynamicHeader}>
              <Text style={styles.subheading}>
                Caracteristică {index + 1}
              </Text>

              <RemoveButton
                onPress={() => removeExtraFeature(index)}
              />
            </View>

            <Field
              label="Denumire"
              value={item.name}
              onChangeText={v =>
                updateExtraFeature(index, 'name', v)
              }
              placeholder="Ex. Suport număr"
            />

            <Field
              label="Detalii"
              value={item.value}
              onChangeText={v =>
                updateExtraFeature(index, 'value', v)
              }
              placeholder="Ex. Cu iluminare"
            />

            <CodeList
              label="Coduri piesă"
              values={item.codes}
              onChange={v =>
                updateExtraFeature(index, 'codes', v)
              }
            />

          </View>
        ))}

        <AddButton
          label="+ Adaugă altă caracteristică"
          onPress={addExtraFeature}
        />

      </Section>

      {/* OBSERVATII */}
      <Section title="9. Observații">

        <Field
          label="Observații suplimentare"
          value={data.observations}
          onChangeText={v => update('observations', v)}
          multiline
          placeholder="Alte detalii despre bară..."
        />

      </Section>

    </View>
  );
}

// COMPONENTE REUTILIZABILE

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
          multiline && styles.multiline,
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

function Toggle({ label, value, onChange }) {
  return (
    <TouchableOpacity
      style={styles.toggleRow}
      onPress={() => onChange(!value)}
    >
      <View style={[
        styles.checkbox,
        value && styles.checkboxSelected,
      ]}>
        {value ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>

      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function SideOption({
  label,
  data,
  onChange,
  onCodeChange,
}) {
  return (
    <View style={styles.sideOption}>
      <Toggle
        label={label}
        value={data.enabled}
        onChange={onChange}
      />

      {data.enabled ? (
        <Field
          label={`Cod piesă ${label.toLowerCase()}`}
          value={data.code}
          onChangeText={onCodeChange}
        />
      ) : null}
    </View>
  );
}

function CodeList({ label, values, onChange }) {
  const safeValues = values && values.length ? values : [''];

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      {safeValues.map((code, index) => (
        <View key={index} style={styles.codeRow}>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            onChangeText={v => {
              const next = [...safeValues];
              next[index] = v;
              onChange(next);
            }}
            placeholder={`Cod ${index + 1}`}
            placeholderTextColor="#7C8494"
          />

          {safeValues.length > 1 ? (
            <RemoveButton
              onPress={() =>
                onChange(safeValues.filter((_, i) => i !== index))
              }
            />
          ) : null}
        </View>
      ))}

      <AddButton
        label="+ Adaugă cod"
        onPress={() => onChange([...safeValues, ''])}
      />
    </View>
  );
}

function AddButton({ label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={onPress}
    >
      <Text style={styles.addButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function RemoveButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.removeButton}
      onPress={onPress}
    >
      <Text style={styles.removeButtonText}>−</Text>
    </TouchableOpacity>
  );
}

// STILURI

const styles = StyleSheet.create({
  container: {
    width: '100%',
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

  subheading: {
    color: '#DCE5F2',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 9,
  },

  label: {
    color: '#B9C5D6',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 5,
  },

  helper: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
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
    marginBottom: 10,
  },

  multiline: {
    minHeight: 85,
    textAlignVertical: 'top',
  },

  fieldWrap: {
    flex: 1,
  },

  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 8,
  },

  choice: {
    borderWidth: 1,
    borderColor: '#435168',
    backgroundColor: '#101722',
    paddingVertical: 10,
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
    fontWeight: '700',
  },

  choiceTextSelected: {
    color: '#8EF0BD',
  },

  yearRow: {
    flexDirection: 'row',
    gap: 9,
  },

  yearField: {
    flex: 1,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginVertical: 7,
  },

  checkbox: {
    width: 22,
    height: 22,
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
    fontSize: 15,
    fontWeight: '900',
  },

  sideOption: {
    borderBottomWidth: 1,
    borderBottomColor: '#2B3748',
    paddingBottom: 8,
    marginBottom: 8,
  },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  codeInput: {
    flex: 1,
  },

  addButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#26364B',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 9,
  },

  addButtonText: {
    color: '#8ECFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#4A252D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  removeButtonText: {
    color: '#FFAAAA',
    fontSize: 22,
    fontWeight: '700',
  },

  dynamicCard: {
    backgroundColor: '#101722',
    borderWidth: 1,
    borderColor: '#354255',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  dynamicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
