import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../assets/images/back.svg";
import { Picker } from "@react-native-picker/picker";
import { Image } from "react-native";
import { BackHandler } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Rock = {
  id?: number;
  rock_id?: number;
  name: string;
  type: string;
  rarity?: string;
  category?: string;
  location?: string;
  photo_url?: string;
};

export default function TradeCreate() {
  const router = useRouter();

  const [step, setStep] = useState<"give" | "receive">("give");
  const [userRocks, setUserRocks] = useState<Rock[]>([]);
  const [allRocks, setAllRocks] = useState<Rock[]>([]);
  const [filteredRocks, setFilteredRocks] = useState<Rock[]>([]);
  const [selectedGive, setSelectedGive] = useState<Rock | null>(null);
  const [selectedReceive, setSelectedReceive] = useState<Rock | null>(null);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "alphabet">("recent");
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    const fetchUserRocks = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await axios.get(`${API_URL}/api/collection/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = res.data.collection.map((rock: any) => ({
        id: rock.collection_id,
        rock_id: rock.rock_id,
        name: rock.rock_name,
        type: rock.rock_type,
        rarity: rock.rock_rarity,
        category: rock.rock_category,
        location: rock.location_name,
        photo_url: rock.signed_url,
      }));

      setUserRocks(normalized);
      setFilteredRocks(normalized);
    };

    const fetchAllRocks = async () => {
      const res = await axios.get(`${API_URL}/api/rocks`);
      const normalized = res.data.data.map((rock: any) => ({
        rock_id: rock.rock_id,
        name: rock.rock_name,
        type: rock.rock_type,
        rarity: rock.rarity,
        category: rock.category,
        location: rock.location_name,
        photo_url: rock.signed_url,
      }));

      setAllRocks(normalized);
    };

    fetchUserRocks();
    fetchAllRocks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [userRocks, allRocks, search, rarity, sortBy, categories, locations, step]);

  const applyFilters = () => {
    let list = step === "give" ? [...userRocks] : [...allRocks];

    list = list.filter((rock) =>
      (rock.name || "").toLowerCase().includes(search.toLowerCase())
    );

    if (rarity) {
      list = list.filter((rock) => (rock.rarity || "").toLowerCase() === rarity.toLowerCase());
    }

    if (categories.length > 0) {
      list = list.filter((rock) => categories.includes(rock.category || ""));
    }

    if (locations.length > 0) {
      list = list.filter((rock) => locations.includes(rock.location || ""));
    }

    if (sortBy === "alphabet") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRocks(list);
  };

  const handleSubmitTrade = async () => {
    const token = await AsyncStorage.getItem("accessToken");

    if (!selectedGive || !selectedReceive) {
      Alert.alert("Please select both rocks before submitting.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/trade/create`,
        {
          collection_id_offered: selectedGive.id,
          rock_id_requested: selectedReceive.rock_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "The trade offer has been created successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/tradelist?tab=myoffers"),
        },
      ]);
    } catch (err: any) {
      console.error("\u274C Error response:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to create trade offer.");
    }
  };

  const toggleChip = (value: string, list: string[], setList: Function) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step === "give") {
              router.replace("/tradelist?tab=myoffers&from=create");
            } else {
              setStep("give");
            }
          }}
          style={styles.backButton}
        >
          <BackIcon width={30} height={24} />
        </TouchableOpacity>

        <Text style={styles.title}>
          {step === "give" ? "Select A Rock to Give" : "Select A Rock to Receive"}
        </Text>
      </View>

      <TextInput
        style={styles.searchBox}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.filterButton}>
        <Text style={styles.filterText}>Filter</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredRocks}
        keyExtractor={(item) => (item.id ?? item.rock_id ?? "").toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.rockItem}
            onPress={() => {
              if (step === "give") {
                setSelectedGive(item);
              } else {
                setSelectedReceive(item);
              }
            }}
          >
            <Image source={{ uri: item.photo_url }} style={styles.rockImage} />
            <View style={styles.rockInfo}>
              <Text style={styles.rockName}>{item.name}</Text>
              <Text style={styles.rockDetails}>Category: {item.type}</Text>
              <Text style={styles.rockDetails}>Rarity: {item.rarity}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {step === "give" && selectedGive && (
        <TouchableOpacity onPress={() => setStep("receive")} style={styles.submitButton}>
          <Text style={styles.submitText}>Select Rock to Giveaway</Text>
        </TouchableOpacity>
      )}

      {step === "receive" && selectedReceive && (
        <TouchableOpacity onPress={handleSubmitTrade} style={styles.submitButton}>
          <Text style={styles.submitText}>Create Trade Offer</Text>
        </TouchableOpacity>
      )}

      <Modal visible={filterVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
          <View style={styles.filterHeader}>
            <Text style={styles.modalTitle}>Filter</Text>
            <TouchableOpacity
              onPress={() => {
                setRarity(null);
                setSortBy("recent");
                setCategories([]);
                setLocations([]);
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Rarity</Text>
          <View style={styles.chipRow}>
            {["Common", "Rare", "Legendary"].map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, rarity === r && styles.chipSelected]}
                onPress={() => setRarity(r)}
              >
                <Text style={rarity === r ? styles.chipTextSelected : styles.chipText}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Sort By</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={sortBy}
              onValueChange={(itemValue) => setSortBy(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Sort by Most Recent" value="recent" />
              <Picker.Item label="Sort by Alphabet (A-Z)" value="alphabet" />
            </Picker>
        </View>

          <TouchableOpacity
            onPress={() => {
              applyFilters();
              setFilterVisible(false);
            }}
            style={styles.applyButton}
          >
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
  },
  filterButton: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  filterText: {
    color: "blue",
  },
  submitButton: {
    backgroundColor: "#459B6C",
    padding: 12,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
  },
  backText: {
    fontSize: 16,
    color: "blue",
    marginLeft: 8,
  },
   header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 10,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  modalContent: {
    padding: 20,
    flexGrow: 1,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  resetText: {
    color: "red",
    fontWeight: "bold",
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: "gray",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "gray",
    borderColor: "gray",
  },
  chipText: {
    color: "black",
  },
  chipTextSelected: {
    color: "white",
  },
  pickerContainer: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: 20,
  backgroundColor: "white", // ensures visibility
  height: 50, // ensure Picker has space
  },
  picker: {
  flex: 1,           // let it fill the parent container
  height: 50,
  width: "100%",
  color: "black",    // ensures text is visible
  backgroundColor: "white", // for visibility on white modal
},
  applyButton: {
    backgroundColor: "#459B6C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  rockItem: {
  flexDirection: "row",
  alignItems: "center",
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ccc",
  gap: 12,
},

rockImage: {
  width: 60,
  height: 60,
  borderRadius: 8,
  backgroundColor: "#eee",
},

rockInfo: {
  flex: 1,
  flexDirection: "column",
  justifyContent: "center",
},

rockName: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 4,
},

rockDetails: {
  fontSize: 14,
  color: "#555",
},
pickerWrapper: {
  height: 50,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#ccc",
  backgroundColor: "white",
  overflow: "hidden",
  marginBottom: 16,
},
});

