import { BlurView } from "expo-blur";
import { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { usePortfolio } from "../context/PortfolioContext";

const { width, height } = Dimensions.get("window");

const CATEGORIES = [
  "Stock",
  "Mutual Fund",
  "Real Estate",
  "Fixed Income",
  "Gold",
  "Silver",
  "Cash",
  "Other Assets",
  "Liability",
];

const SORT_OPTIONS = ["Highest Value", "Lowest Value", "A - Z", "Z - A"];

export default function ManageScreen() {
  const { assets, addAsset, updateAsset, deleteAsset } = usePortfolio();

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("Self");
  const [category, setCategory] = useState("Stock");
  const [value, setValue] = useState("");
  const [pl, setPl] = useState("");

  const [weightGrams, setWeightGrams] = useState("");
  const [carat, setCarat] = useState("24");
  const [pricePer10g, setPricePer10g] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Highest Value");

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setName("");
    setOwner("Self");
    setCategory("Stock");
    setValue("");
    setPl("");
    setWeightGrams("");
    setCarat("24");
    setPricePer10g("");
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setEditId(item.id);
    setName(item.name);
    setOwner(item.owner);
    setCategory(item.category);
    setValue(Math.abs(item.value).toString());
    setPl(item.pl.toString());
    setWeightGrams(item.weightGrams ? item.weightGrams.toString() : "");
    setCarat(item.carat ? item.carat.toString() : "24");
    setPricePer10g(item.pricePer10g ? item.pricePer10g.toString() : "");
    setModalVisible(true);
  };

  const getCalculatedMetalValue = () => {
    const w = parseFloat(weightGrams) || 0;
    const p = parseFloat(pricePer10g) || 0;
    const c = parseFloat(carat) || 24;
    return (w / 10) * p * (c / 24);
  };

  const handleSave = () => {
    let numericValue = parseFloat(value) || 0;
    const isPreciousMetal = category === "Gold" || category === "Silver";

    if (isPreciousMetal) numericValue = getCalculatedMetalValue();
    else if (category === "Liability" && numericValue > 0)
      numericValue = -numericValue;

    const assetData = {
      name,
      owner,
      category,
      value: numericValue,
      pl: parseFloat(pl) || 0,
      weightGrams: isPreciousMetal ? parseFloat(weightGrams) || 0 : undefined,
      carat: isPreciousMetal ? parseFloat(carat) || 24 : undefined,
      pricePer10g: isPreciousMetal ? parseFloat(pricePer10g) || 0 : undefined,
    };

    isEditing && editId ? updateAsset(editId, assetData) : addAsset(assetData);
    setModalVisible(false);
  };

  const formatCurrency = (num: number) =>
    "₹" + (num / 100000).toFixed(2) + " L";
  const formatStandardCurrency = (num: number) =>
    "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Just now";
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const processedAssets = assets
    .filter((asset: any) => {
      const matchesSearch = asset.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || asset.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a: any, b: any) => {
      if (sortOption === "Highest Value") return b.value - a.value;
      if (sortOption === "Lowest Value") return a.value - b.value;
      if (sortOption === "A - Z") return a.name.localeCompare(b.name);
      if (sortOption === "Z - A") return b.name.localeCompare(a.name);
      return 0;
    });

  const isPreciousMetal = category === "Gold" || category === "Silver";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. True Ambient Glow using SVG Radial Gradients */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height={height+60} width={width} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Top Left Blue Glow */}
            <RadialGradient id="glow1" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </RadialGradient>
            {/* Bottom Right Purple Glow */}
            <RadialGradient id="glow2" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
            </RadialGradient>
            {/* Middle Teal Glow */}
            <RadialGradient id="glow3" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </RadialGradient>
            {/* Bottom Left Rose/Pink Glow */}
            <RadialGradient id="glow4" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={0} cy={height * 0.1} r={width * 0.7} fill="url(#glow1)" />
          <Circle
            cx={width}
            cy={height * 0.8}
            r={width * 0.8}
            fill="url(#glow2)"
          />
          <Circle
            cx={width * 0.7}
            cy={height * 0.4}
            r={width * 0.5}
            fill="url(#glow3)"
          />
          <Circle
            cx={width * 0.1}
            cy={height * 0.7}
            r={width * 0.6}
            fill="url(#glow4)"
          />
        </Svg>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Holdings</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add Asset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        {/* Glass Search Bar */}
        <BlurView intensity={30} tint="dark" style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </BlurView>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {["All", ...CATEGORIES].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                filterCategory === cat && styles.activeFilterChip,
              ]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategory === cat && styles.activeFilterChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {processedAssets.length === 0 ? (
          <Text style={styles.emptyText}>
            No assets found matching your criteria.
          </Text>
        ) : (
          processedAssets.map((acc: any) => (
            // 2. Improved Glass Card with lighter backing to let blur shine through
            <View key={acc.id} style={styles.cardWrapper}>
              <BlurView intensity={45} tint="dark" style={styles.cardBlur}>
                <TouchableOpacity
                  style={styles.cardTouchable}
                  onPress={() => openEditModal(acc)}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.name} numberOfLines={1}>
                      {acc.name}
                    </Text>
                    <Text style={styles.owner}>
                      {acc.owner} • {acc.category}
                    </Text>
                    <Text style={styles.dateText}>
                      Updated: {formatDate(acc.lastModified)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.value,
                        acc.category === "Liability" && styles.textRed,
                      ]}
                    >
                      {formatCurrency(acc.value)}
                    </Text>
                    <Text style={styles.editHint}>Edit ✎</Text>
                  </View>
                </TouchableOpacity>
              </BlurView>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal with Frosted Glass Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <BlurView intensity={50} tint="dark" style={styles.modalView}>
            <ScrollView
              contentContainerStyle={{
                paddingBottom: 24,
                paddingTop: 24,
                paddingHorizontal: 24,
              }}
            >
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Item" : "New Item"}
              </Text>

              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.activeChip]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === cat && styles.activeChipText,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#64748b"
                placeholder="e.g. Primary Residence"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Owner</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#64748b"
                placeholder="Self / Spouse"
                value={owner}
                onChangeText={setOwner}
              />

              {isPreciousMetal ? (
                <>
                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Weight (Grams)</Text>
                      <TextInput
                        style={styles.input}
                        placeholderTextColor="#64748b"
                        placeholder="0"
                        value={weightGrams}
                        onChangeText={setWeightGrams}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={styles.col}>
                      <Text style={styles.label}>Purity (Carat)</Text>
                      <TextInput
                        style={styles.input}
                        placeholderTextColor="#64748b"
                        placeholder="24"
                        value={carat}
                        onChangeText={setCarat}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col}>
                      <Text style={styles.label}>Market Rate / 10g (₹)</Text>
                      <TextInput
                        style={styles.input}
                        placeholderTextColor="#64748b"
                        placeholder="0.00"
                        value={pricePer10g}
                        onChangeText={setPricePer10g}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={styles.col}>
                      <Text style={styles.label}>Calculated Value</Text>
                      <View style={[styles.input, styles.calculatedInput]}>
                        <Text style={styles.calculatedText}>
                          {formatStandardCurrency(getCalculatedMetalValue())}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Text style={styles.label}>
                      {category === "Liability"
                        ? "Loan Amount (₹)"
                        : "Current Value (₹)"}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholderTextColor="#64748b"
                      placeholder="0.00"
                      value={value}
                      onChangeText={setValue}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {category !== "Liability" && (
                <>
                  <Text style={styles.label}>Total Gain / Loss (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#64748b"
                    placeholder="0.00 or -0.00"
                    value={pl}
                    onChangeText={setPl}
                    keyboardType="numeric"
                  />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    if (editId) deleteAsset(editId);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.deleteBtnText}>Delete {category}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617", // Very dark navy base
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },

  controlsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    paddingBottom: 8,
  },
  // Updated Search Bar for Glass Look
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 50,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(15, 23, 42, 0.3)", // Slight tint so it's not totally transparent
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, color: "#ffffff", fontSize: 15 },
  clearIcon: { color: "#94a3b8", fontSize: 18, padding: 4 },

  filterRow: { marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  activeFilterChip: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  filterChipText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  activeFilterChipText: { color: "#ffffff" },

  container: { flex: 1 },
  content: { 
    padding: 20, 
    paddingBottom: 100 // Extra padding so bottom items aren't hidden by the floating tab bar
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },

  // --- Glass Card Styling ---
  cardWrapper: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)", // The literal "glass edge" reflection
  },
  cardBlur: {
    flex: 1,
  },
  cardTouchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Translucent to allow blur and SVG to show through
  },
  cardLeft: { flex: 1, paddingRight: 16 },
  name: { color: "#f8fafc", fontSize: 17, fontWeight: "bold", marginBottom: 6 },
  owner: { color: "#cbd5e1", fontSize: 13 },
  dateText: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  value: { color: "#ffffff", fontSize: 18, fontWeight: "800", marginBottom: 4 },
  textRed: { color: "#ef4444" },
  editHint: { color: "#60a5fa", fontSize: 12, fontWeight: "600", marginTop: 4 },

  // --- Glass Modal Styling ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Darker backdrop
    justifyContent: "flex-end",
  },
  modalView: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)", // Glass rim on the modal
    backgroundColor: "rgba(15, 23, 42, 0.7)", // Needs to be slightly dark so text is readable
    maxHeight: "90%",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  label: { color: "#cbd5e1", fontSize: 13, marginBottom: 8, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Inset glass look
    color: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  calculatedInput: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    justifyContent: "center",
  },
  calculatedText: { color: "#60a5fa", fontWeight: "bold", fontSize: 16 },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 16,
    marginRight: 8,
    alignItems: "center",
  },
  cancelBtnText: { color: "#f8fafc", fontWeight: "bold", fontSize: 16 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 16,
    marginLeft: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 16 },
  deleteBtn: {
    marginTop: 24,
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
  },
  deleteBtnText: { color: "#fca5a5", fontWeight: "bold", fontSize: 16 },

  chip: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  activeChip: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  chipText: { color: "#94a3b8", fontWeight: "bold" },
  activeChipText: { color: "#ffffff" },
});
