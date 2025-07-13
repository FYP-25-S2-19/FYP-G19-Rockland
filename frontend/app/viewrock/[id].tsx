import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackIcon from '../../assets/images/back.svg';
import ThumbUpIcon from '../../assets/images/thumbup.svg';
import axios from 'axios';

export default function ViewRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [rock, setRock] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRockDetails = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/viewrock/${id}`);
        if (res.data.success) {
          setRock(res.data.rock);
          setComments(res.data.comments);
          setTotalComments(res.data.total_comments);

          const counts: Record<string, number> = {};
          res.data.comments.forEach((c: any) => {
            counts[c.comment_id] = c.total_likes;
            c.replies.forEach((r: any) => {
              counts[r.comment_id] = r.total_likes;
            });
          });
          setLikeCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load rock detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRockDetails();
  }, [id]);

  const toggleLike = (commentId: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [commentId]: prev[commentId] + (likedComments[commentId] ? -1 : 1),
    }));
  };

  if (loading || !rock) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
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
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white border border-gray-600 rounded-xl items-center justify-center"
        >
          <BackIcon width={20} height={20} />
        </TouchableOpacity>

        <View className="w-full aspect-square rounded-xl overflow-hidden mb-2">
          <Image
            source={{ uri: rock.signed_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-3xl font-bold text-gray-900">{rock.rock_name}</Text>
          <Text
            className="text-sm font-semibold text-white px-3 py-1 rounded-full"
            style={{
              backgroundColor:
                rock.rarity === 'common'
                  ? '#6D6D6D'
                  : rock.rarity === 'rare'
                  ? '#459B6C'
                  : '#EF9E1C',
            }}
          >
            Rarity: {rock.rarity.charAt(0).toUpperCase() + rock.rarity.slice(1)}
          </Text>
        </View>

        <Text className="text-xl text-gray-600 mt-1">Type: {rock.rock_type}</Text>

        <Text className="text-xl font-bold mt-5 mb-2">Description</Text>
        <Text className="text-base text-gray-800">{rock.description}</Text>

        <Text className="text-xl font-bold mt-5 mb-2">Properties</Text>
        <View
            className="flex-row items-start rounded-lg px-4 py-4 mb-2"
            style={{ backgroundColor: '#DBF0DF' }}
          >
            <View className="w-[40%] pr-2">
              <Text className="font-semibold text-gray-800">Color</Text>
            </View>
            <View className="w-[60%]">
              <Text className="text-gray-700 text-right">{rock.color}</Text>
            </View>
          </View>

          <View className="flex-row items-start rounded-lg px-4 py-4 mb-2">
            <View className="w-[40%] pr-2">
              <Text className="font-semibold text-gray-800">Hardness</Text>
            </View>
            <View className="w-[60%]">
              <Text className="text-gray-700 text-right">{rock.hardness}</Text>
            </View>
          </View>

          <View
            className="flex-row items-start rounded-lg px-4 py-4 mb-2"
            style={{ backgroundColor: '#DBF0DF' }}
          >
            <View className="w-[40%] pr-2">
              <Text className="font-semibold text-gray-800">Composition</Text>
            </View>
            <View className="w-[60%]">
              <Text className="text-gray-700 text-right">{rock.composition}</Text>
            </View>
          </View>

          <View className="flex-row items-start rounded-lg px-4 py-4 mb-2">
            <View className="w-[40%] pr-2">
              <Text className="font-semibold text-gray-800">Density</Text>
            </View>
            <View className="w-[60%]">
              <Text className="text-gray-700 text-right">{rock.density}</Text>
            </View>
          </View>

          <Text className="text-xl font-bold mt-5 mb-2">Common Location</Text>
            <View className="pl-2">
              {rock.common_location && rock.common_location.trim() !== '' ? (
                rock.common_location
                  .split(',')
                  .filter((loc: string) => loc.trim() !== '')
                  .map((loc: string, idx: number) => (
                    <Text key={idx} className="text-base text-gray-700">• {loc.trim()}</Text>
                  ))
              ) : (
                <Text className="text-base text-gray-500 italic">Not available</Text>
              )}
            </View>

        <Text className="text-xl font-bold mt-5 mb-2">Fun Fact</Text>
        <Text className="text-base text-gray-800">{rock.fun_fact}</Text>

        <View className="mt-6 pt-4 border-t border-gray-300">
          <Text className="text-xl font-bold mb-4">{totalComments} Comments</Text>

          {comments.map((comment) => (
            <View key={comment.comment_id} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <Text className="font-semibold text-gray-900">
                {comment.user_name}{' '}
                <Text className="text-sm text-gray-400">{comment.created_at}</Text>
              </Text>
              <Text className="text-base text-gray-800 mt-1">{comment.description}</Text>

              <View className="flex-row items-center mt-2 space-x-4">
                <TouchableOpacity
                  onPress={() => toggleLike(comment.comment_id.toString())}
                  className="flex-row items-center space-x-1"
                >
                  <ThumbUpIcon
                    width={16}
                    height={16}
                    fill={likedComments[comment.comment_id] ? '#459B6C' : '#9CA3AF'}
                  />
                  <Text className="ml-1 text-sm text-gray-700">{likeCounts[comment.comment_id]}</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                </TouchableOpacity>
              </View>

              {comment.replies.map((reply: any) => (
                <View
                  key={reply.comment_id}
                  className="mt-4 ml-4 pl-3 border-l-2 border-gray-200"
                >
                  <Text className="font-semibold text-gray-900">
                    {reply.user_name}{' '}
                    <Text className="text-sm text-gray-400">{reply.created_at}</Text>
                  </Text>
                  <Text className="text-base text-gray-800 mt-1">{reply.description}</Text>

                  <View className="flex-row items-center mt-2 space-x-4">
                    <TouchableOpacity
                      onPress={() => toggleLike(reply.comment_id.toString())}
                      className="flex-row items-center space-x-1"
                    >
                      <ThumbUpIcon
                        width={16}
                        height={16}
                        fill={likedComments[reply.comment_id] ? '#459B6C' : '#9CA3AF'}
                      />
                      <Text className="ml-1 text-sm text-gray-700">{likeCounts[reply.comment_id]}</Text>
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
