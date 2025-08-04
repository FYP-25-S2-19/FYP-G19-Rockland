import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackIcon from '../../assets/images/back.svg';
import ThumbUpIcon from '../../assets/images/thumbup.svg';
import LikeIcon from '../../assets/images/like.svg';
import NoLikeIcon from '../../assets/images/nolike.svg';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { timeAgo } from "../../utils/timeAgo";

export default function ViewRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [rock, setRock] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchRockDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/api/viewrock/${id}`, { headers });

      if (res.data.success) {
        setRock(res.data.rock);
        setComments(res.data.comments);
        setTotalComments(res.data.total_comments);

        const counts: Record<string, number> = {};
        const liked: Record<string, boolean> = {};
        res.data.comments.forEach((c: any) => {
          counts[String(c.comment_rock_id)] = c.like_count;
          liked[String(c.comment_rock_id)] = Boolean(c.is_liked);

          c.replies.forEach((r: any) => {
            counts[String(r.comment_rock_id)] = r.like_count;
            liked[String(r.comment_rock_id)] = Boolean(r.is_liked);
          });
        });

        setLikedComments({ ...liked });
        console.log("💚 likedComments map:", liked);
        console.log("🐛 API response:", res.data);
        setLikeCounts({ ...counts }); 
        
        
      }
    } catch (err) {
      console.error('Failed to load rock detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRockDetails();
  }, [id]);

  const toggleLike = async (commentId: number) => {
    const currentLiked = likedComments[String(commentId)]; 
  
    if (currentLiked === undefined) {
      console.warn("Skipping toggle, like status unknown");
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
  
      await axios.post(`${API_URL}/api/comments/${commentId}/like`, {}, { headers });
  
      const newLiked = !currentLiked; // ✅ toggle from snapshot
      console.log(`[TOGGLE] Comment ${commentId} like changed: ${!currentLiked} (was ${currentLiked})`);
  
      // Update liked state
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: newLiked,
      }));
  
      // Update count
      setLikeCounts((prevCounts) => ({
        ...prevCounts,
        [commentId]: prevCounts[commentId] + (newLiked ? 1 : -1),
      }));
      
    } catch (err) {
      console.error('Failed to toggle like:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not toggle like',
      });
    }
  };
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        rock_id: id,
        content: newComment,
        ...(replyTo ? { parent_comment_rock_id: replyTo.comment_rock_id } : {}),
      };

      await axios.post(`${API_URL}/api/comments/create`, body, { headers });
      await fetchRockDetails();
      setNewComment('');
      setReplyTo(null);
      Toast.show({ type: 'success', text1: 'Comment posted' });
      fetchRockDetails();
    } catch (err) {
      console.error('Failed to post comment:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not post comment',
      });
    }
  };

  if (loading || !rock) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          className="bg-white p-4"
          contentContainerStyle={{ paddingBottom: 180 + keyboardHeight }}
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
        <View className="flex-row items-start rounded-lg px-4 py-4 mb-2" style={{ backgroundColor: '#DBF0DF' }}>
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

        <View className="flex-row items-start rounded-lg px-4 py-4 mb-2" style={{ backgroundColor: '#DBF0DF' }}>
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
            
            <View key={`comment-${comment.comment_rock_id}`} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <View className="flex-row items-center mb-1">
                <Image
                  source={{ uri: comment.profile_picture }}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <Text className="font-semibold text-gray-900">
                  {comment.username}{' '}
                  <Text className="text-sm text-gray-400">{timeAgo(comment.created_at)}</Text>
                </Text>
              </View>
              <Text className="text-base text-gray-800 mt-1">{comment.content}</Text>

              <View className="flex-row items-center mt-2 space-x-4">
              <TouchableOpacity
                onPress={() => toggleLike(comment.comment_rock_id)}
                disabled={likedComments[String(comment.comment_rock_id)] === undefined}
                className="flex-row items-center space-x-1"
              >
                {likedComments[String(comment.comment_rock_id)] ? (
                  <LikeIcon width={16} height={16} />
                ) : (
                  <NoLikeIcon width={16} height={16} />
                )}
                <Text className="ml-1 text-sm text-gray-700">
                  {likeCounts[String(comment.comment_rock_id)] ?? 0}
                </Text>
              </TouchableOpacity>
                <TouchableOpacity onPress={() => setReplyTo(comment)}>
                  <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                </TouchableOpacity>
                
              </View>

              {comment.replies.map((reply: any) => (
                <View
                  key={`reply-${reply.comment_rock_id}`}
                  className="mt-4 ml-4 pl-3 border-l-2 border-gray-200"
                >
                  <View className="flex-row items-center mb-1">
                    <Image
                      source={{ uri: reply.profile_picture }}
                      className="w-7 h-7 rounded-full mr-2"
                    />
                    <Text className="font-semibold text-gray-900">
                      {reply.username}{' '}
                      <Text className="text-sm text-gray-400">{timeAgo(reply.created_at)}</Text>
                    </Text>
                  </View>
                  <Text className="text-base text-gray-800 mt-1">{reply.content}</Text>

                  <View className="flex-row items-center mt-2 space-x-4">
                  <TouchableOpacity
                        onPress={() => toggleLike(reply.comment_rock_id)}
                        className="flex-row items-center space-x-1"
                      >
                        {likedComments[reply.comment_rock_id] ? (
                          <LikeIcon width={16} height={16} />
                        ) : (
                          <NoLikeIcon width={16} height={16} />
                        )}
                        <Text className="ml-1 text-sm text-gray-700">
                          {likeCounts[reply.comment_rock_id] ?? 0}
                        </Text>
                      </TouchableOpacity>
                    <TouchableOpacity onPress={() => setReplyTo(comment)}>
                      <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
        </ScrollView>

         {/* Fixed input section above keyboard */}
         <View
          className="absolute left-0 right-0 bg-white px-4 py-2 border-t border-gray-300"
          style={{ bottom: keyboardHeight }}
        >
          {replyTo && (
            <View className="mb-1 bg-green-100 px-3 py-2 rounded">
              <Text className="text-sm text-gray-800">
                Replying to <Text className="font-semibold">{replyTo.username}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Text className="text-sm text-red-500 mt-1">Cancel Reply</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center">
            <TextInput
              ref={inputRef}
              onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              placeholder={replyTo ? `Replying to ${replyTo.username}...` : 'Add a comment...'}
              value={newComment}
              onChangeText={setNewComment}
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
              style={{ maxHeight: 100 }}
              multiline
            />
            <TouchableOpacity onPress={handlePostComment} className="ml-2 bg-black px-4 py-2 rounded-lg">
              <Text className="text-white">Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
}
