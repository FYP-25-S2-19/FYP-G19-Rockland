import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { rockData, Rock } from '../../data/rocks';
import BackIcon from '../../assets/images/back.svg';
import ThumbUpIcon from '../../assets/images/thumbup.svg';

export default function ViewRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const rock: Rock | undefined = rockData.find((r) => r.id === id);

  const [likedComments, setLikedComments] = React.useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = React.useState<Record<string, number>>(() => {
    const initialCounts: Record<string, number> = {};
    rock?.comments.forEach((comment) => {
      initialCounts[comment.id] = comment.likes;
      comment.replies?.forEach((reply) => {
        initialCounts[reply.id] = reply.likes;
      });
    });
    return initialCounts;
  });

  const toggleLike = (id: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [id]: prev[id] + (likedComments[id] ? -1 : 1),
    }));
  };

  if (!rock) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-lg text-gray-600">Rock not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        className="flex-1 bg-white p-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white border border-gray-600 rounded-xl items-center justify-center"
        >
          <BackIcon width={20} height={20} />
        </TouchableOpacity>

        {/* Rock Image */}
        <View className="w-full aspect-square rounded-xl overflow-hidden mb-2">
          <Image
            source={rock.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Title & Rarity */}
        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold text-gray-900">{rock.name}</Text>
          <Text
            className="text-sm font-semibold text-white px-3 py-1 rounded-full"
            style={{
              backgroundColor:
                rock.rarity === 'Common'
                  ? '#6D6D6D'
                  : rock.rarity === 'Rare'
                  ? '#459B6C'
                  : '#EF9E1C',
            }}
          >
            Rarity: {rock.rarity}
          </Text>
        </View>

        {/* Rock Type */}
        <Text className="text-xl text-gray-600 mt-1">
          Type: {rock.type} Rock
        </Text>

        {/* Description */}
        <Text className="text-xl font-bold mt-5 mb-2">Description</Text>
        <Text className="text-base text-gray-800">{rock.description}</Text>

        {/* Properties */}
        <Text className="text-xl font-bold mt-5 mb-2">Properties</Text>
        {Object.entries(rock.properties).map(([key, value]) => {
        const isHighlight = key === 'Color' || key === 'Composition';
        return (
            <View
            key={key}
            className="flex-row justify-between items-center rounded-lg px-4 py-4 mb-2"
            style={isHighlight ? { backgroundColor: '#DBF0DF' } : undefined}
            >
            <Text className="font-semibold text-gray-800">{key}</Text>
            <Text className="text-gray-700 text-right">{value}</Text>
            </View>
        );
        })}

        {/* Common Location */}
        <Text className="text-xl font-bold mt-5 mb-2">Common Location</Text>
        <View className="pl-2">
          {rock.commonLocations.map((location, idx) => (
            <Text key={idx} className="text-base text-gray-700">
              • {location}
            </Text>
          ))}
        </View>

        {/* Fun Fact */}
        <Text className="text-xl font-bold mt-5 mb-2">Fun Fact</Text>
        <Text className="text-base text-gray-800">{rock.funFact}</Text>

        {/* Comments Section */}
        <View className="mt-6 pt-4 border-t border-gray-300">
          <Text className="text-xl font-bold mb-4">
            {rock.comments.length} Comments
          </Text>

          {rock.comments.map((comment) => (
            <View key={comment.id} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <Text className="font-semibold text-gray-900">
                {comment.user}{' '}
                <Text className="text-sm text-gray-400">{comment.time}</Text>
              </Text>
              <Text className="text-base text-gray-800 mt-1">
                {comment.text}
              </Text>

              <View className="flex-row items-center mt-2 space-x-4">
                <TouchableOpacity
                  onPress={() => toggleLike(comment.id.toString())}
                  className="flex-row items-center space-x-1"
                >
                  <ThumbUpIcon
                    width={16}
                    height={16}
                    fill={likedComments[comment.id] ? '#459B6C' : '#9CA3AF'}
                  />
                  <Text className="ml-1 text-sm text-gray-700">{likeCounts[comment.id]}</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                </TouchableOpacity>
              </View>

              {/* Replies */}
              {comment.replies?.map((reply) => (
                <View
                  key={reply.id}
                  className="mt-4 ml-4 pl-3 border-l-2 border-gray-200"
                >
                  <Text className="font-semibold text-gray-900">
                    {reply.user}{' '}
                    <Text className="text-sm text-gray-400">{reply.time}</Text>
                  </Text>
                  <Text className="text-base text-gray-800 mt-1">
                    {reply.text}
                  </Text>

                  <View className="flex-row items-center mt-2 space-x-4">
                    <TouchableOpacity
                      onPress={() => toggleLike(reply.id.toString())}
                      className="flex-row items-center space-x-1"
                    >
                      <ThumbUpIcon
                        width={16}
                        height={16}
                        fill={likedComments[reply.id] ? '#459B6C' : '#9CA3AF'}
                      />
                      <Text className="ml-1 text-sm text-gray-700">{likeCounts[reply.id]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Comment Input */}
        <View className="flex-row items-center border-t border-gray-300 pt-4 mt-2 bg-white">
          <TextInput
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
          />
          <TouchableOpacity className="ml-2 bg-black px-4 py-2 rounded-lg">
            <Text className="text-white">Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
