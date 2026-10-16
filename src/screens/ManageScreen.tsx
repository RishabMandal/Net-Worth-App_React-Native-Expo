import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Modal, 
  TextInput, ScrollView, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView
} from 'react-native';
import { usePortfolio } from '../context/PortfolioContext';

const CATEGORIES = [
  'Stock', 'Mutual Fund', 'Real Estate', 'Fixed Income', 
  'Gold', 'Silver', 'Cash', 'Other Assets', 'Liability'
];

const SORT_OPTIONS = ['Highest Value', 'Lowest Value', 'A - Z', 'Z - A'];

export default function ManageScreen() {
  const { assets, addAsset, updateAsset, deleteAsset } = usePortfolio();
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Standard Form State
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('Self');
  const [category, setCategory] = useState('Stock');
  const [value, setValue] = useState('');
  const [pl, setPl] = useState('');

  // Precious Metals Form State
  const [weightGrams, setWeightGrams] = useState('');
  const [carat, setCarat] = useState('24');
  const [pricePer10g, setPricePer10g] = useState('');

  // List Controls State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Highest Value');

  const openAddModal = () => {
    setIsEditing(false); setEditId(null);
    setName(''); setOwner('Self'); setCategory('Stock'); setValue(''); setPl('');
    setWeightGrams(''); setCarat('24'); setPricePer10g('');
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true); setEditId(item.id);
    setName(item.name); setOwner(item.owner); setCategory(item.category);
    setValue(Math.abs(item.value).toString()); 
    setPl(item.pl.toString());
    
    // Load precious metal data if it exists
    setWeightGrams(item.weightGrams ? item.weightGrams.toString() : '');
    setCarat(item.carat ? item.carat.toString() : '24');
    setPricePer10g(item.pricePer10g ? item.pricePer10g.toString() : '');
    
    setModalVisible(true);
  };

  // Live calculation for precious metals
  const getCalculatedMetalValue = () => {
    const w = parseFloat(weightGrams) || 0;
    const p = parseFloat(pricePer10g) || 0;
    const c = parseFloat(carat) || 24;
    // Formula applies carat purity ratio to the 24k base rate per 10g
    return (w / 10) * p * (c / 24);
  };

  const handleSave = () => {
    let numericValue = parseFloat(value) || 0;
    const isPreciousMetal = category === 'Gold' || category === 'Silver';
    
    if (isPreciousMetal) {
      numericValue = getCalculatedMetalValue();
    } else if (category === 'Liability' && numericValue > 0) {
      numericValue = -numericValue;
    }
    
    const assetData = { 
      name, owner, category, 
      value: numericValue, 
      pl: parseFloat(pl) || 0,
      // Save these fields so they reload when you edit
      weightGrams: isPreciousMetal ? parseFloat(weightGrams) || 0 : undefined,
      carat: isPreciousMetal ? parseFloat(carat) || 24 : undefined,
      pricePer10g: isPreciousMetal ? parseFloat(pricePer10g) || 0 : undefined,
    };

    isEditing && editId ? updateAsset(editId, assetData) : addAsset(assetData);
    setModalVisible(false);
  };

  const formatCurrency = (num: number) => '₹' + (num / 100000).toFixed(2) + ' L';
  const formatStandardCurrency = (num: number) => '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Process Assets: Filter -> Sort
  const processedAssets = assets
    .filter((asset: any) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      if (sortOption === 'Highest Value') return b.value - a.value;
      if (sortOption === 'Lowest Value') return a.value - b.value;
      if (sortOption === 'A - Z') return a.name.localeCompare(b.name);
      if (sortOption === 'Z - A') return b.name.localeCompare(a.name);
      return 0;
    });

  const isPreciousMetal = category === 'Gold' || category === 'Silver';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Holdings</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add Asset</Text>
        </TouchableOpacity>
      </View>

      {/* Search, Filter, and Sort Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['All', ...CATEGORIES].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.filterChip, filterCategory === cat && styles.activeFilterChip]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.filterChipText, filterCategory === cat && styles.activeFilterChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity 
              key={opt} 
              style={[styles.sortChip, sortOption === opt && styles.activeSortChip]}
              onPress={() => setSortOption(opt)}
            >
              <Text style={[styles.sortChipText, sortOption === opt && styles.activeSortChipText]}>
                {sortOption === opt ? '↓ ' : ''}{opt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Asset List */}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {processedAssets.length === 0 ? (
          <Text style={styles.emptyText}>No assets found matching your criteria.</Text>
        ) : (
          processedAssets.map((acc: any) => (
            <TouchableOpacity key={acc.id} style={styles.card} onPress={() => openEditModal(acc)}>
              <View style={styles.cardLeft}>
                <Text style={styles.name} numberOfLines={1}>{acc.name}</Text>
                <Text style={styles.owner}>{acc.owner} • {acc.category}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.value, acc.category === 'Liability' && styles.textRed]}>
                  {formatCurrency(acc.value)}
                </Text>
                <Text style={styles.editHint}>Edit ✎</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Editor Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'New Item'}</Text>

              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.chip, category === cat && styles.activeChip]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Item Name</Text>
              <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="e.g. Primary Residence" value={name} onChangeText={setName} />
              
              <Text style={styles.label}>Owner</Text>
              <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="Self / Spouse" value={owner} onChangeText={setOwner} />

              {/* Conditional Inputs for Precious Metals */}
              {isPreciousMetal ? (
                <>
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Weight (Grams)</Text>
                      <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="0" value={weightGrams} onChangeText={setWeightGrams} keyboardType="numeric" />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={styles.col}>
                      <Text style={styles.label}>Purity (Carat)</Text>
                      <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="24" value={carat} onChangeText={setCarat} keyboardType="numeric" />
                    </View>
                  </View>
                  
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Market Rate / 10g (₹)</Text>
                      <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="0.00" value={pricePer10g} onChangeText={setPricePer10g} keyboardType="numeric" />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={styles.col}>
                      <Text style={styles.label}>Calculated Value</Text>
                      <View style={[styles.input, styles.calculatedInput]}>
                        <Text style={styles.calculatedText}>{formatStandardCurrency(getCalculatedMetalValue())}</Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>{category === 'Liability' ? 'Loan Amount (₹)' : 'Current Value (₹)'}</Text>
                    <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="0.00" value={value} onChangeText={setValue} keyboardType="numeric" />
                  </View>
                </View>
              )}

              {category !== 'Liability' && (
                <>
                  <Text style={styles.label}>Total Gain / Loss (₹)</Text>
                  <TextInput style={styles.input} placeholderTextColor="#64748b" placeholder="0.00 or -0.00" value={pl} onChangeText={setPl} keyboardType="numeric" />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              </View>

              {isEditing && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => { if (editId) deleteAsset(editId); setModalVisible(false); }}>
                  <Text style={styles.deleteBtnText}>Delete {category}</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  
  // Controls (Search, Filter, Sort)
  controlsContainer: { paddingHorizontal: 20, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12, height: 44 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14 },
  clearIcon: { color: '#64748b', fontSize: 16, padding: 4 },
  
  filterRow: { marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  activeFilterChip: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  filterChipText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  activeFilterChipText: { color: '#ffffff' },

  sortRow: { marginBottom: 8 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  activeSortChip: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  sortChipText: { color: '#64748b', fontSize: 12, fontWeight: '500' },
  activeSortChipText: { color: '#3b82f6', fontWeight: 'bold' },

  container: { flex: 1 },
  content: { padding: 20 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 14 },
  
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 16, marginBottom: 12, borderColor: '#1e293b', borderWidth: 1 },
  cardLeft: { flex: 1, paddingRight: 16 },
  name: { color: '#f8fafc', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  owner: { color: '#64748b', fontSize: 12 },
  value: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  textRed: { color: '#ef4444' },
  editHint: { color: '#3b82f6', fontSize: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalView: { backgroundColor: '#0f172a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#1e293b', color: '#ffffff', padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 16, height: 50 },
  calculatedInput: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', borderWidth: 1, justifyContent: 'center' },
  calculatedText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginRight: 8, alignItems: 'center' },
  cancelBtnText: { color: '#f8fafc', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { flex: 1, backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, marginLeft: 8, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  deleteBtn: { marginTop: 24, alignItems: 'center', padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 },
  deleteBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  
  chip: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, height: 40, marginBottom: 16 },
  activeChip: { backgroundColor: '#3b82f6' },
  chipText: { color: '#94a3b8', fontWeight: 'bold' },
  activeChipText: { color: '#ffffff' },
});