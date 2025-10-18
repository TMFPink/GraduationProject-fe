import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface Card {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  status: 'active' | 'completed' | 'pending';
}

export default function CardListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [cards] = useState<Card[]>([
    {
      id: '1',
      title: 'Project Alpha',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      category: 'Development',
      date: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      title: 'Design System',
      description: 'Building a comprehensive design system for the application.',
      category: 'UI/UX',
      date: '2024-01-10',
      status: 'completed',
    },
    {
      id: '3',
      title: 'API Integration',
      description: 'Integrating third-party APIs for enhanced functionality.',
      category: 'Backend',
      date: '2024-01-20',
      status: 'pending',
    },
    {
      id: '4',
      title: 'User Testing',
      description: 'Conducting user testing sessions to improve UX.',
      category: 'Research',
      date: '2024-01-25',
      status: 'active',
    },
    {
      id: '5',
      title: 'Performance Optimization',
      description: 'Optimizing app performance and reducing load times.',
      category: 'Development',
      date: '2024-01-30',
      status: 'pending',
    },
  ]);

  const getStatusColor = (status: Card['status']) => {
    switch (status) {
      case 'active':
        return colors.tint;
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      default:
        return colors.icon;
    }
  };

  const handleCardPress = (card: Card) => {
    Alert.alert(card.title, `Status: ${card.status}\nCategory: ${card.category}\nDate: ${card.date}\n\n${card.description}`);
  };

  const renderCard = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={[styles.card, { 
        backgroundColor: colorScheme === 'dark' ? '#374151' : '#FFFFFF',
        shadowColor: colorScheme === 'dark' ? '#000000' : '#000000',
      }]}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={[styles.cardDescription, { color: colors.icon }]}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.tint + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.tint }]}>{item.category}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.icon }]}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <View style={styles.headerContent}>
          <View>
            <ThemedText type="title" style={styles.headerText}>Card List</ThemedText>
          </View>
        </View>
      </View>
      
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        style={styles.cardList}
        contentContainerStyle={styles.cardListContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardList: {
    flex: 1,
  },
  cardListContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
  },
});
