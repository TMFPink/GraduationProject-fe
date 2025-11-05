import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { cardApi } from '@/src/api/card-api';
import { ownedCardApi } from '@/src/api/ownedcard-api'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CardDetailPage() {
  const params = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [relatedCards, setRelatedCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const passedCard = params.card ? JSON.parse(params.card) : null;

  // ✅ Add card to owned cards
  const addCardToCollection = async () => {
    if (!card) return;
    
    try {
      // Add card to owned cards using ownedCardApi
      await ownedCardApi.addOwnedCards(
        card.card_id,
        card.card_domain_id
      );
      console.log("Sending to backend:", {
        card_id: card.card_id,
        card_domain_id: card.card_domain_id,
      });

      Alert.alert('Success', 'Card added to your collection!');
      console.log('✅ Card added to Owned Cards');
    } catch (error) {
      console.error('❌ Failed to add card:', error);
      console.log("Sending to backend:", {
        card_id: card.card_id,
        card_domain_id: card.card_domain_id,
      });

      Alert.alert('Error', 'Failed to add card to collection');
    }
  };

  // ✅ Fetch card details
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (passedCard) {
        setCard(passedCard);
        setLoading(false);
      } else if (params.card_id) {
        try {
          const response = await cardApi.getCardById(params.card_id);
          if (response.statusCode === 200 && response.metadata) {
            setCard(response.metadata);
          }
        } catch (error) {
          console.error('Failed to load card:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchCardDetails();
  }, []);

  // ✅ Fetch related cards by archetype
  useEffect(() => {
    if (card && card.meta_data?.archetype) {
      const fetchRelatedCards = async () => {
        try {
          const response = await cardApi.getMetadataCard(20, 1, '', {
            archetype: card.meta_data.archetype,
          });

          if (response.metadata?.cards) {
            setRelatedCards(
              response.metadata.cards.filter(
                (relCard) => relCard.card_id !== card.card_id
              )
            );
          }
        } catch (error) {
          console.error('Failed to load related cards:', error);
        }
      };
      fetchRelatedCards();
    }
  }, [card]);

  // ✅ Loading UI
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#EA6C5D" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading card details...</Text>
      </View>
    );
  }

  // ✅ No card found
  if (!card) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#666' }}>Card not found.</Text>
      </View>
    );
  }

  const meta = card.meta_data || {};
  const banlist = meta.banlist_info || {};
  const hasBanlist = banlist.ban_ocg || banlist.ban_tcg;

  const getBanColor = (status) => {
    switch (status) {
      case 'Forbidden':
        return '#B71C1C';
      case 'Limited':
        return '#F57C00';
      case 'Semi-Limited':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>

        {/* Image + Status */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: card.image_large_url || card.image_normal_url }}
            style={styles.cardImage}
            resizeMode="contain"
          />

          {/* Banlist + Genesys */}
          {(hasBanlist || true) && (
            <View style={[styles.section, styles.statusSection]}>
              {banlist.ban_ocg && (
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: getBanColor(banlist.ban_ocg) },
                  ]}
                >
                  <Text style={styles.statusText}>OCG: {banlist.ban_ocg}</Text>
                </View>
              )}
              {banlist.ban_tcg && (
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: getBanColor(banlist.ban_tcg) },
                  ]}
                >
                  <Text style={styles.statusText}>TCG: {banlist.ban_tcg}</Text>
                </View>
              )}
              <View style={[styles.statusTag, { backgroundColor: '#D4AF37' }]}>
                <Text style={styles.statusText}>
                  Genesys: {meta.genesys_points ?? 0}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Card Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.cardName}>{card.name}</Text>
          <Text style={styles.rarity}>{meta.type || '—'}</Text>

          <View style={styles.metaContainer}>
            {meta.attribute && <Text style={styles.metaText}>Attribute: {meta.attribute}</Text>}
            {meta.archetype && <Text style={styles.metaText}>Archetype: {meta.archetype}</Text>}
            {meta.level && <Text style={styles.metaText}>Level/Rank: {meta.level}</Text>}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {meta.atk !== null && <Text style={styles.metaText}>ATK: {meta.atk}</Text>}
              {meta.def !== null && <Text style={styles.metaText}>DEF: {meta.def}</Text>}
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Description:</Text>
            <Text style={styles.cardText}>{meta.desc || 'No description available.'}</Text>
          </View>
        </View>

        {/* Related cards */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Cards</Text>
          {relatedCards.length === 0 ? (
            <Text style={{ color: '#666', paddingVertical: 12, textAlign: 'center' }}>
              No related cards found.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedCards.map((relCard) => (
                <TouchableOpacity
                  key={relCard.card_id}
                  onPress={() =>
                    router.push({
                      pathname: '/cardDetail',
                      params: { card: JSON.stringify(relCard) },
                    })
                  }
                  style={styles.relatedCard}
                >
                  <Image
                    source={{ uri: relCard.image_small_url || relCard.image_normal_url }}
                    style={styles.relatedImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.relatedName}>{relCard.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* Fixed Add Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addCardToCollection}>
          <Text style={styles.addButtonText}>Add to Collection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  imageContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cardImage: { width: SCREEN_WIDTH - 64, height: 380, borderRadius: 10 },
  contentContainer: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16 },
  cardName: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  rarity: { fontSize: 15, color: '#666', marginBottom: 10 },
  metaContainer: { marginBottom: 12 },
  metaText: { fontSize: 14, color: '#444', marginBottom: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  cardText: { fontSize: 15, color: '#444', lineHeight: 21 },
  statusSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  statusTag: {
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
  },
  addButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  relatedSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16 },
  relatedScroll: { paddingHorizontal: 0 },
  relatedCard: { width: 120, alignItems: 'center', marginRight: 12 },
  relatedImage: { width: 100, height: 146, borderRadius: 5 },
  relatedName: { marginTop: 4, textAlign: 'center', fontSize: 12, color: '#1a1a1a' },
});