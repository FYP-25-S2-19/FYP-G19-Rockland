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
import BackIcon from "../assets/images/back.svg";

const TradeAccept = () => {
  const router = useRouter();
  const rawParams = useLocalSearchParams();

  const rawTradeId = (rawParams.tradeId as string || "").trim();
  const tradeId = parseInt(rawTradeId, 10);

  const [trade, setTrade] = useState<any>(null);
  const [userRocks, setUserRocks] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"give" | "receive">("give");
  const [hasRequiredRock, setHasRequiredRock] = useState(true);

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
        const fetchedTrade = tradeRes.data;

        const rocksRes = await axios.get(`${API_URL}/api/collection/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const collection = rocksRes.data?.collection || [];
        console.log("Fetched collection:", collection);
        setUserRocks(collection);

        const currentUserId = collection.length > 0 ? collection[0].user_id : null;
        const isOfferer = fetchedTrade.user_id_offerer === currentUserId;

        if (!isOfferer) {
          console.log("✅ youGive object:", fetchedTrade.youGive);
          setTrade(fetchedTrade);
        } else {
          setTrade(fetchedTrade);
        }

        type Rock = {
        rock_id: number;
        collection_id: number;
        // Add more fields if needed
      };

      const typedCollection = collection as Rock[];

        const matchingRock = typedCollection.find(
          (rock) => rock.rock_id === fetchedTrade.rock_id_requested
      );
      

      if (matchingRock) {
        setHasRequiredRock(true);
        setSelectedCollectionId(matchingRock.collection_id); 
      } else {
        setHasRequiredRock(false);
      }

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
        { text: "OK", onPress: () => router.replace("/tradelist?tab=available") },
      ]);
    } catch (err: any) {
      console.error("❌ Accept error:", err.message);
      Alert.alert("Error", "Failed to accept trade.");
    }
  };

  if (loading || !trade || !trade.youGive || !trade.youReceive) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading trade details...</Text>
      </View>
    );
  }

  const eligibleRocks =
    trade?.youGive?.rock_id != null
      ? userRocks.filter((rock) => Number(rock.rock_id) === Number(trade.youGive.rock_id))
      : [];

  console.log("Eligible rocks:", eligibleRocks);
  console.log("Trade youGive rock_id:", trade.youGive.rock_id);
  console.log("User collection rock_ids:", userRocks.map(r => r.rock_id));

  console.log("Trade requires rock_id:", trade.youGive.rock_id);
  console.log("Your collection rock_ids:", userRocks.map((r) => r.rock_id));

return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/tradelist?tab=available&from=create")} style={styles.backButton}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trade Offer</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tradeBox}>
        <View style={styles.tradeRow}>
          {/* You Receive */}
          <View style={styles.tradeColumn}>
            <Text style={styles.sectionLabel}>You Receive</Text>
            <Image source={{ uri: trade.youReceive.rockImage }} style={styles.rockImage} />
            <Text style={styles.rockName}>{trade.youReceive.rockName}</Text>
          </View>

          {/* You Give */}
          <View style={styles.tradeColumn}>
            <Text style={styles.sectionLabel}>You Give</Text>
            <FlatList
              data={eligibleRocks}
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
            {eligibleRocks.length === 0 && (
              <Text style={{ textAlign: "center", color: "red", marginTop: 10 }}>
                You don’t have the required rock to accept this trade.
              </Text>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTrade}>
        <Text style={styles.acceptText}>Accept Trade</Text>
      </TouchableOpacity>
    </View>
  );
};

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
header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
  padding: 8,
},
  headerContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 16,
  paddingTop: 20, // adjust to move higher
  paddingBottom: 10,
},

headerButton: {
  width: 30, // same width for left and right to center the title
  alignItems: "flex-start",
},

headerTitle: {
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
  flex: 1,
},
});



