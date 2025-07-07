import React, { useState } from 'react';
import {
  ScrollView,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { sampleArticles } from '../../data/article'; // centralized articles data
import { rockData } from '../../data/rocks';    // centralized rocks data

function Card({ image, title, type }: { image: any; title: string; type?: string }) {
  return (
    <View style={homeStyles.card}>
      <View style={homeStyles.cardImageContainer}>
        <Image source={image} style={homeStyles.cardImage} />
      </View>
      <View style={homeStyles.cardTitleContainer}>
        <Text style={homeStyles.cardTitle}>{title}</Text>
        {type && <Text style={homeStyles.cardType}>Type: {type}</Text>}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Use centralized rocks data here
  
  const rockEntries = rockData.map(rock => ({
    id: rock.id,
    image: rock.image,
    title: rock.name,
    type: rock.type,
    rarity: rock.rarity,
  }));

  const toggleFloatingMenu = () => {
    setIsExpanded((prev) => !prev);
  };

  const articles = sampleArticles; // Use centralized articles

  const renderHorizontalGrid = (
    items: { image: any; title: string; type?: string; rarity?: string; id?: string | number }[],
    isArticle = false
  ) => {
    const columnCount = Math.ceil(items.length / 2);
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={homeStyles.horizontalScroll}
      >
        <View style={{ flexDirection: 'row' }}>
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <View key={colIndex} style={homeStyles.column}>
              {items.slice(colIndex * 2, colIndex * 2 + 2).map((item, rowIndex) => {
                const key = colIndex * 2 + rowIndex;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isArticle) {
                        router.push({
                          pathname: "/expert/article/[id]",
                          params: { id: item.id?.toString() ?? '' },
                        });
                      } else {
                        router.push({
                          pathname: "/expert/viewrock/[id]",
                          params: { id: item.id?.toString() ?? '' },
                        });
                      }
                    }}
                  >
                    <Card image={item.image} title={item.title} type={item.type} />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={homeStyles.container}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.mainTitle}>ROCKLAND</Text>
          <Text style={homeStyles.subTitle}>#1 Download App Store</Text>
        </View>

        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>My Articles</Text>
          <TouchableOpacity onPress={() => router.push('/expert/AllArticleScreen')}>
            <Text style={homeStyles.seeMore}>See More</Text>
          </TouchableOpacity>
        </View>
        {renderHorizontalGrid(
          articles.map(article => ({
            image: article.thumbnail,  // map thumbnail to image
            title: article.title,
            type: article.category,
            id: article.id,
          })),
          true
        )}

        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>My Rock Entries</Text>
          <TouchableOpacity onPress={() => router.push('/expert/AllRockScreen')}>
            <Text style={homeStyles.seeMore}>See More</Text>
          </TouchableOpacity>
        </View>
        {renderHorizontalGrid(rockEntries)}
      </ScrollView>

      <View style={homeStyles.floatingContainer}>
        {isExpanded && (
          <>
            <TouchableOpacity
              style={homeStyles.miniButton}
              onPress={() => router.push('/expert/AddArticleScreen')}
            >
              <Image
                source={require('../../assets/icons/article.png')}
                style={homeStyles.miniButtonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.miniButton}
              onPress={() => router.push('/expert/AddRockScreen')}
            >
              <Image
                source={require('../../assets/icons/rock.png')}
                style={homeStyles.miniButtonImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={homeStyles.floatingButton} onPress={toggleFloatingMenu}>
          <Text style={homeStyles.plusIcon}>{isExpanded ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 33,
    fontWeight: '800',
    color: '#000000',
    marginTop: 30,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#000000',
  },
  seeMore: {
    fontSize: 14,
    color: '#505050',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  horizontalScroll: {
    marginBottom: 12,
  },
  column: {
    marginLeft: 10,
    marginRight: 15,
    flexDirection: 'column',
  },
  card: {
    width: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImageContainer: {
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardTitleContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  cardType: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  floatingContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  floatingButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#459B6C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  plusIcon: {
    color: '#ffffff',
    fontSize: 40,
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 55 : 50,
  },
  miniButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#459B6C',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniButtonImage: {
    width: 30,
    height: 30,
  },
});
