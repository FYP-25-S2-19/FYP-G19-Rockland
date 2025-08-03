import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../assets/images/back.svg";
import { BackHandler } from "react-native";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TradeList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [tab, setTab] = useState<"available" | "my">(
    params.tab === "myoffers" ? "my" : "available"
  );
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchTrades = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("📦 Token from AsyncStorage:", token);

      if (!token) {
        console.error("❌ No token found in storage!");
        return;
      }

      const res = await axios.get(
        `${API_URL}/trade-offer/${tab === "my" ? "my" : "all"}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Trade offers fetched:", res.data);
      setTrades(res.data);
    } catch (error) {
      console.error("⚠️ Failed to fetch trade offers:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTrades();
}, [tab]);

useEffect(() => {
  const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
    if (params.from === "create") {
      router.replace("/account");
      return true; // prevent default back behavior
    }
    return false;
  });

  return () => backHandler.remove(); // cleanup on unmount
}, [params.from]);

const renderTrade = ({ item }: { item: any }) => {
  const give = item.youGive;
  const receive = item.youReceive;

  return (
    <View style={styles.tradeCard}>
      {/* Top Row: Trader Info + Accept Button */}
      <View style={styles.traderRow}>
        <View>
          <Text style={styles.traderName}>{item.offerer?.name}</Text>
          <Text style={styles.traderMeta}>Trade ID #{item.trade_id}</Text>
          <Text style={styles.traderMeta}>Status: {item.status}</Text>
        </View>
        {tab === "available" && !item.isMyOffer && (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => router.push(`/tradeaccept?tradeId=${item.trade_id}`)}
          >
            <Text style={styles.acceptButtonText}>Accept Trade</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Row: Trade Barter */}
      <View style={styles.tradeRow}>
        <View style={styles.rockBox}>
          {give?.rockImage ? (
            <Image source={{ uri: give.rockImage }} style={styles.rockImage} />
          ) : (
            <Text style={styles.rockLabel}>No image</Text>
          )}
          <Text style={styles.rockName}>{give?.rockName ?? "Unknown"}</Text>
          <Text style={styles.rockLabel}>You Give</Text>
        </View>

        <Text style={styles.arrow}>→</Text>

        <View style={styles.rockBox}>
          {receive?.rockImage ? (
            <Image source={{ uri: receive.rockImage }} style={styles.rockImage} />
          ) : (
            <Text style={styles.rockLabel}>No image</Text>
          )}
          <Text style={styles.rockName}>{receive?.rockName ?? "Unknown"}</Text>
          <Text style={styles.rockLabel}>You Receive</Text>
        </View>
      </View>
    </View>
  );
};
  return (
    <View style={styles.container}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (params.from === "create") {
            router.replace("/account");
          } else {
            router.back();
          }
        }}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trade Collection</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === "available" && styles.activeTab]}
          onPress={() => setTab("available")}
        >
          <Text style={[styles.tabText, tab === "available" && styles.activeTabText]}>
            Available Trades
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "my" && styles.activeTab]}
          onPress={() => setTab("my")}
        >
          <Text style={[styles.tabText, tab === "my" && styles.activeTabText]}>
            My Trade Offers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trade List */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => item.trade_id.toString()}
          renderItem={renderTrade}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No trades found.</Text>
          }
        />
      )}

      {/* Button to Create Trade */}
      {tab === "my" && (
        <TouchableOpacity
          onPress={() => router.push("/tradecreate")}
          style={styles.createButton}
        >
          <Text style={styles.createText}>Create Trade Offers</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#555",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#000",
  },
  tabCount: {
    fontSize: 12,
    textAlign: "center",
    color: "gray",
  },
  
  arrow: {
    fontSize: 20,
    marginHorizontal: 10,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
  createButton: {
    backgroundColor: "#459B6C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  createText: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    color: "#000", // optional
  },
  tradeCard: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 12,
  marginVertical: 8,
  marginHorizontal: 16,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},

traderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
},

traderName: {
  fontSize: 16,
  fontWeight: "bold",
},

traderMeta: {
  fontSize: 12,
  color: "gray",
},

tradeRow: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
},

rockBox: {
  alignItems: "center",
  width: "40%",
},

rockImage: {
  width: 60,
  height: 60,
  borderRadius: 8,
  marginBottom: 4,
},

rockName: {
  fontWeight: "bold",
  fontSize: 13,
},

rockLabel: {
  fontSize: 11,
  color: "gray",
},


acceptButton: {
  backgroundColor: "#fca311",
  paddingVertical: 6,
  paddingHorizontal: 14,
  borderRadius: 20,
},

acceptButtonText: {
  color: "white",
  fontWeight: "bold",
  fontSize: 14,
},

});

