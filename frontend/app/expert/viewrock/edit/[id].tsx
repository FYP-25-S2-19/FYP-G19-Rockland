import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const rockTypes = ["Igneous Rock", "Sedimentary Rock", "Metamorphic Rock"];
const rarityOptions = ["common", "rare", "legendary"];

type Photo = {
  uri: string;
  width: number;
  height: number;
  loading?: boolean;
};

type RockType = {
  rock_id: number;
  rock_name: string;
  rock_type: string;
  rarity?: string | null;
  description?: string | null;
  fun_fact?: string | null;
  hardness?: string | null;
  color?: string | null;
  composition?: string | null;
  density?: string | null;
  common_location?: string | null;
  photo_url?: string | null;
  signed_url?: string | null;
};

export default function EditRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const rockId = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [rockName, setRockName] = useState<string>("");
  const [rockType, setRockType] = useState<string>("Igneous Rock");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [rarity, setRarity] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [hardness, setHardness] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [composition, setComposition] = useState<string>("");
  const [density, setDensity] = useState<string>("");
  const [commonLocation, setCommonLocation] = useState<string>("");
  const [funFact, setFunFact] = useState<string>("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // backend supports base64 photo in JSON update
  const INCLUDE_PHOTO_IN_UPDATE = true;

  useEffect(() => {
    const load = async () => {
      try {
        if (!rockId) {
          Alert.alert("Error", "Missing rock id.");
          router.back();
          return;
        }
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/api/viewrock/${rockId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.rock) {
          Alert.alert("Error", data.message || "Rock not found.");
          router.back();
          return;
        }

        const r: RockType = data.rock;

        setRockName(r.rock_name ?? "");
        setRockType(r.rock_type ?? "Igneous Rock");
        setRarity((r.rarity ?? "").toString().toLowerCase());
        setDescription(r.description ?? "");
        setFunFact(r.fun_fact ?? "");
        setCommonLocation(r.common_location ?? "");

        setHardness(r.hardness ?? "");
        setColor(r.color ?? "");
        setComposition(r.composition ?? "");
        setDensity(r.density ?? "");

        const img = r.signed_url || r.photo_url || null;
        if (img) {
          Image.getSize(
            img,
            (w, h) => setPhotos([{ uri: img, width: w, height: h }]),
            () => setPhotos([{ uri: img, width: 800, height: 600 }])
          );
        }
      } catch {
        Alert.alert("Error", "Failed to load rock.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rockId, router]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectRockType = (type: string) => {
    setRockType(type);
    setDropdownOpen(false);
  };
  const selectRarity = (option: string) => {
    setRarity((prev) => (prev === option ? "" : option));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      const loadingPhoto = { uri, width: 1, height: 1, loading: true };
      setPhotos([loadingPhoto]);

      setTimeout(() => {
        Image.getSize(uri, (width, height) => {
          setPhotos((prev) =>
            prev.map((p) => (p.uri === uri ? { uri, width, height, loading: false } : p))
          );
        });
      }, 300);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!rockName.trim()) newErrors.rockName = "Rock name is required";
    if (!rockType.trim()) newErrors.rockType = "Rock type is required";
    if (!rarity.trim()) newErrors.rarity = "Please select rarity";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!funFact.trim()) newErrors.funFact = "Fun fact is required";
    if (!(hardness.trim() || color.trim() || composition.trim() || density.trim())) {
      newErrors.details =
        "At least one detail is required (hardness, color, composition, or density)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toTitle = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s);

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No access token found");

      let photoBase64: string | undefined;
      if (INCLUDE_PHOTO_IN_UPDATE && photos.length > 0 && !photos[0].uri.startsWith("http")) {
        const fileUri = photos[0].uri;
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        photoBase64 = `data:image/jpeg;base64,${fileBase64}`;
      }

      const payload: any = {
        rock_name: rockName,
        rock_type: rockType,
        rarity: toTitle(rarity), // "Common" | "Rare" | "Legendary"
        description,
        fun_fact: funFact,
        common_location: commonLocation,
        hardness,
        color,
        composition,
        density,
      };
      if (photoBase64) payload.photo = photoBase64;

      const res = await fetch(`${API_URL}/api/rocks/update/${rockId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        // non-JSON response
      }

      if (res.ok && result?.success) {
        Alert.alert("✅ Success", "Rock updated successfully!", [
          {
            text: "OK",
            onPress: () =>
              router.replace({ pathname: "/expert/viewrock/[id]", params: { id: String(rockId) } }),
          },
        ]);
      } else if (res.status === 401 || res.status === 403) {
        Alert.alert(
          "Unauthorized",
          "You need expert permission to update rocks. Please log in with an expert account."
        );
      } else {
        Alert.alert("❌ Error", result?.message || `Failed to update (status ${res.status}).`);
      }
    } catch (err: any) {
      Alert.alert("❌ Error", err?.message || "Something went wrong while updating.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
        <Text className="mt-2 text-gray-700">Loading rock...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120, paddingHorizontal: 16, paddingTop: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 16, color: "black" }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUpdate} disabled={updating}>
            <Text style={{ fontSize: 16, color: updating ? "#999" : "green", fontWeight: "bold" }}>
              {updating ? "Saving..." : "Update"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo Section */}
        <Text className="text-sm font-semibold text-gray-600 pt-5 mb-2">Rock Photo</Text>
        <View
          className={`min-h-[100px] border border-dashed border-gray-300 rounded-lg items-center justify-center w-[93%] self-center px-3 py-2 mb-4 ${
            photos.length > 0 ? "border-0" : ""
          }`}
        >
          {photos.length === 0 ? (
            <Text className="text-gray-400 italic">Photos will appear here...</Text>
          ) : (
            <View className="w-full">
              {photos.map((photo, index) => (
                <View key={index} className="mb-4 relative">
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: "100%", aspectRatio: photo.width / photo.height, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-black/60 rounded-full w-6 h-6 items-center justify-center z-10"
                    onPress={() => removePhoto(photo.uri)}
                  >
                    <Text className="text-white text-sm font-bold">×</Text>
                  </TouchableOpacity>
                  {photo.loading && (
                    <View className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 items-center justify-center rounded-lg">
                      <ActivityIndicator size="small" color="#000" />
                      <Text className="text-xs text-gray-700 mt-2">Uploading...</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Upload Buttons */}
        <View className="flex-row justify-end pr-2 mb-4">
          <TouchableOpacity className="ml-3 p-1" onPress={() => Alert.alert("Camera", "Not implemented yet")}>
            <Image source={require("../../../../assets/images/camera.png")} className="w-[18px] h-[18px]" />
          </TouchableOpacity>
          <TouchableOpacity className="ml-3 p-1" onPress={pickImage}>
            <Image source={require("../../../../assets/images/picture.png")} className="w-[18px] h-[18px]" />
          </TouchableOpacity>
        </View>

        {/* Form fields */}
        <Text className="text-sm font-semibold text-gray-600 mb-1">Rock Name</Text>
        <TextInput
          className="mb-1 px-4 py-3 rounded-lg border border-gray-200 text-base"
          placeholder="e.g. Granite"
          placeholderTextColor="#bcbcbc"
          value={rockName}
          onChangeText={setRockName}
        />
        {errors.rockName && <Text className="text-red-500 text-xs mb-2">{errors.rockName}</Text>}

        <Text className="text-sm font-semibold text-gray-600 mb-1">Rock Type</Text>
        <TouchableOpacity
          className="flex-row justify-between items-center border border-black rounded-xl py-3 px-4 mb-1 bg-white"
          onPress={toggleDropdown}
        >
          <Text className="text-base text-black">{rockType}</Text>
          <Text className="text-base text-black">{dropdownOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {dropdownOpen && (
          <View className="border border-black rounded-lg bg-white shadow mb-2">
            {rockTypes.map((type) => (
              <TouchableOpacity key={type} onPress={() => selectRockType(type)} className="px-4 py-3">
                <Text className={`text-base text-black ${type === rockType ? "font-bold" : ""}`}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.rockType && <Text className="text-red-500 text-xs mb-2">{errors.rockType}</Text>}

        <Text className="text-sm font-semibold text-gray-600 mb-2">Rarity</Text>
        <View className="flex-row justify-between mb-2">
          {rarityOptions.map((key) => (
            <TouchableOpacity key={key} className="flex-row items-center" onPress={() => selectRarity(key)}>
              <View
                className={`w-4 h-4 border rounded mr-2 items-center justify-center border-[#76472D] ${
                  rarity === key ? "bg-[#76472D]" : ""
                }`}
              >
                {rarity === key && <Text className="text-white text-[14px] font-bold">✓</Text>}
              </View>
              <Text className={`text-base text-[#76472D] ${rarity === key ? "font-bold" : ""}`}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.rarity && <Text className="text-red-500 text-xs mb-2">{errors.rarity}</Text>}

        <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
        <TextInput
          className="mb-1 px-4 py-3 rounded-lg border border-gray-200 text-base min-h-[80px]"
          placeholder="e.g. Granite is a coarse-grained intrusive rock..."
          placeholderTextColor="#bcbcbc"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
        {errors.description && <Text className="text-red-500 text-xs mb-2">{errors.description}</Text>}

        <Text className="text-sm font-semibold text-gray-600 mb-1">Hardness</Text>
        <TextInput
          className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
          placeholder="e.g. 6 - 7"
          placeholderTextColor="#bcbcbc"
          value={hardness}
          onChangeText={setHardness}
        />

        <Text className="text-sm font-semibold text-gray-600 mb-1">Color</Text>
        <TextInput
          className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
          placeholder="e.g. White, Pink, Gray"
          placeholderTextColor="#bcbcbc"
          value={color}
          onChangeText={setColor}
        />

        <Text className="text-sm font-semibold text-gray-600 mb-1">Composition</Text>
        <TextInput
          className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
          placeholder="e.g. Quartz, Feldspar, Mica"
          placeholderTextColor="#bcbcbc"
          value={composition}
          onChangeText={setComposition}
        />

        <Text className="text-sm font-semibold text-gray-600 mb-1">Density</Text>
        <TextInput
          className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
          placeholder="e.g. 2.65 - 2.75 g/cm³"
          placeholderTextColor="#bcbcbc"
          value={density}
          onChangeText={setDensity}
        />
        {errors.details && <Text className="text-red-500 text-xs mb-2">{errors.details}</Text>}

        <Text className="text-sm font-semibold text-gray-600 mb-1">Common Location</Text>
        <TextInput
          className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
          placeholder="e.g. Bukit Timah, Pulau Ubin, etc."
          placeholderTextColor="#bcbcbc"
          value={commonLocation}
          onChangeText={setCommonLocation}
        />

        <Text className="text-sm font-semibold text-gray-600 mb-1">Fun Fact</Text>
        <TextInput className="mb-10 px-4 py-3 rounded-lg border border-gray-200 text-base min-h-[80px]"
          placeholder="e.g. Pulau Ubin once had multiple granite quarries..."
          placeholderTextColor="#bcbcbc"
          value={funFact}
          onChangeText={setFunFact}
          multiline
          textAlignVertical="top"
        />
        {errors.funFact && <Text className="text-red-500 text-xs mb-4">{errors.funFact}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
