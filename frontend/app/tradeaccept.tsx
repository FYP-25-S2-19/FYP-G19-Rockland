import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const TradeAccept = () => {
  const router = useRouter();
  const rawParams = useLocalSearchParams();

  const rawTradeId = (rawParams.tradeId as string || "").trim();
  const tradeId = parseInt(rawTradeId, 10);

  const [trade, setTrade] = useState<any>(null);
  const [userRocks, setUserRocks] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    if (!tradeId || isNaN(tradeId)) {
      Alert.alert("Invalid Trade ID");
      router.back();
      return;
    }

    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        const tradeRes = await axios.get(`${API_URL}/trade-offer/${tradeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Trade fetched:", tradeRes.data);
        setTrade(tradeRes.data);

        const rocksRes = await axios.get(`${API_URL}/api/collection/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRocks(rocksRes.data);

        setLoading(false);
      } catch (err: any) {
        console.error("❌ Failed to fetch trade:", err.message);
        Alert.alert("Error", "Could not load trade data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAcceptTrade = async () => {
    if (!selectedCollectionId) {
      Alert.alert("Select a rock to offer in return.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");

      await axios.post(
        `${API_URL}/trade-offer/accept/${tradeId}`,
        { collection_id_received: selectedCollectionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Trade accepted!", [
        { text: "OK", onPress: () => router.replace("/tradelist?tab=myoffers") },
      ]);
    } catch (err: any) {
      console.error("❌ Accept error:", err.message);
      Alert.alert("Error", "Failed to accept trade.");
    }
  };

  if (loading || !trade || !trade.youGive) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Loading trade details...</Text>
    </View>
  );
}

return (
  <View style={styles.container}>
    <Text style={styles.title}>Trade Offer</Text>

    <View style={styles.tradeBox}>
      <View style={styles.tradeRow}>
        {/* You Get */}
        <View style={styles.tradeColumn}>
          <Text style={styles.sectionLabel}>You Get</Text>
          <Image source={{ uri: trade.youGive.rockImage }} style={styles.rockImage} />
          <Text style={styles.rockName}>{trade.youGive.rockName}</Text>
        </View>

        {/* You Give */}
        <View style={styles.tradeColumn}>
          <Text style={styles.sectionLabel}>You Give</Text>
          <FlatList
            data={userRocks}
            horizontal
            keyExtractor={(item) => item.collection_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCollectionId(item.collection_id)}
                style={[
                  styles.rockOption,
                  selectedCollectionId === item.collection_id && styles.rockSelected,
                ]}
              >
                <Image source={{ uri: item.signed_url }} style={styles.rockImage} />
                <Text style={styles.rockName}>{item.rock_name}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </View>

    <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTrade}>
      <Text style={styles.acceptText}>Accept Trade</Text>
    </TouchableOpacity>
  </View>
);}

export default TradeAccept;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  tradeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  rockImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "center",
  },
  rockName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },
  rockOption: {
    alignItems: "center",
    marginRight: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  rockSelected: {
    borderColor: "#FFA500",
    backgroundColor: "#FFF3E0",
  },
  acceptButton: {
    backgroundColor: "#FFA500",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  rockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tradeRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 16,
},
tradeColumn: {
  flex: 1,
  alignItems: "center",
},
});



