import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';

export default function MedicineScreen({ navigation }) {
  const { medications, toggleMedication } = useApp();
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');

  const handleAddMed = () => {
    if (!newMedName || !newMedTime) {
      Alert.alert('Incomplete Info', 'Please enter at least a medication name and time.');
      return;
    }
    // Simulation logic - normally we would add to Context/Backend
    Alert.alert('Feature Active', `${newMedName} schedule created successfully!`);
    setNewMedName('');
    setNewMedTime('');
    setNewMedDosage('');
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Medication Planner</Text>
          <Text style={styles.subtitle}>Manage your daily prescription schedule.</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.addCard}>
          <Text style={styles.sectionTitle}>Add New Medicine</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medicine Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Atorvastatin" 
              value={newMedName}
              onChangeText={setNewMedName}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Dosage</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 20mg" 
                value={newMedDosage}
                onChangeText={setNewMedDosage}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Time</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 08:30 AM" 
                value={newMedTime}
                onChangeText={setNewMedTime}
              />
            </View>
          </View>
          <PrimaryButton title="Add to Schedule" onPress={handleAddMed} />
        </Card>

        <View style={styles.currentSection}>
          <Text style={styles.sectionTitle}>Active Schedule</Text>
          {medications.map((med) => (
            <Card key={med.id} style={styles.medCard}>
              <View style={[styles.iconWrap, { backgroundColor: med.color + '15' }]}>
                <Ionicons name={med.icon} size={22} color={med.color} />
              </View>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medMeta}>{med.dosage} • {med.time}</Text>
              </View>
              <TouchableOpacity style={styles.trashBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        <Card style={styles.warningCard}>
          <Ionicons name="information-circle" size={24} color="#D97706" />
          <Text style={styles.warningText}>
            Ensure your relative is informed about any changes to your critical medications.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  addCard: {
    padding: 20,
    borderRadius: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
  },
  currentSection: {
    marginTop: 24,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  trashBtn: {
    padding: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
});
