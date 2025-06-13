import { View, Text, TouchableOpacity, Image } from "react-native";

export default function ArticleCard({ article }: { article: any }) {
  const handleLike = () => {
    console.log("Like pressed for:", article.title);
  };

  const handleArticlePress = () => {
    console.log("Article pressed:", article.title);
  };

  return (
    <TouchableOpacity onPress={handleArticlePress} activeOpacity={0.8} className="bg-white rounded-xl p-4 mb-4 shadow shadow-black/10">
      {/* Author */}
      <View className="flex-row items-center mb-3">
        <Image source={{ uri: article.authorImage }} className="w-10 h-10 rounded-full mr-3" />
        <View className="flex-row justify-between flex-1 items-center">
          <Text className="text-base font-semibold text-gray-900">{article.authorName}</Text>
          <View className={`px-2 py-1 rounded-full ${article.isPremium ? "bg-yellow-400" : "bg-gray-200"}`}>
            <Text className={`text-xs font-medium ${article.isPremium ? "text-white" : "text-gray-500"}`}>
              {article.isPremium ? "Premium" : "Free"}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-row mb-3">
        <Image source={{ uri: article.thumbnail }} className="w-20 h-20 rounded-lg mr-3" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-2 leading-5">{article.title}</Text>
          <View className="self-start bg-green-100 px-2 py-1 rounded-lg mb-2">
            <Text className="text-xs font-medium text-green-600">{article.category}</Text>
          </View>
          <Text className="text-sm text-gray-500 leading-5">{article.preview}</Text>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center">
        <TouchableOpacity onPress={handleLike} activeOpacity={0.7} className="flex-row items-center">
          <Text className="text-base mr-1">❤️</Text>
          <Text className="text-sm font-medium text-gray-500">{article.likes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
