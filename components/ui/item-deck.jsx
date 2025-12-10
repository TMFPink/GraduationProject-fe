import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Animated, 
  Pressable 
} from 'react-native';

const ItemDeck = ({ 
  name, 
  images = [], // Expecting array of [img1, img2, img3]
  isCreateNew, 
  onPress, 
  onDelete, 
  isEditMode 
}) => {
  const placeholder = 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';
  
  // Animation value: 0 = stacked, 1 = spread
  const spreadAnim = useRef(new Animated.Value(0)).current;

  // Handle interaction animations
  const handlePressIn = () => {
    if (isCreateNew) return;
    Animated.spring(spreadAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    if (isCreateNew) return;
    Animated.spring(spreadAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
      tension: 40,
    }).start();
  };

  // Helper to render individual card layers
  const renderCardLayer = (imageUrl, index, totalCards) => {
    if (!imageUrl) return null;

    // We reverse index for visual stacking: 
    // index 0 (First Card) should be on TOP (highest zIndex)
    // index 2 (Third Card) should be on BOTTOM
    const stackIndex = totalCards - 1 - index;
    
    // Interpolation Logic
    // Bottom card (index 2 in data, 0 in stack): Rotates Left, Moves Left
    // Middle card: Stays roughly center
    // Top card (index 0 in data, 2 in stack): Rotates Right, Moves Right

    let rotateRange = ['0deg', '0deg'];
    let translateXRange = [0, 0];
    let translateYRange = [0, 0];
    let scaleRange = [1, 1];

    if (index === 0) {
      // First Card (The Cover) - Moves Right
      rotateRange = ['0deg', '15deg']; 
      translateXRange = [0, 30]; 
      translateYRange = [0, 5];
      scaleRange = [1, 1.05];
    } else if (index === 1) {
      // Second Card (Middle) - Stays / Slight Tilt
      rotateRange = ['0deg', '0deg'];
      translateXRange = [-4, 0];
      translateYRange = [2, -10]; // Pops up slightly
    } else if (index === 2) {
      // Third Card (Bottom) - Moves Left
      rotateRange = ['0deg', '-15deg'];
      translateXRange = [-8, -30];
      translateYRange = [4, 5];
    }

    const animatedStyle = {
      zIndex: stackIndex,
      transform: [
        { rotate: spreadAnim.interpolate({ inputRange: [0, 1], outputRange: rotateRange }) },
        { translateX: spreadAnim.interpolate({ inputRange: [0, 1], outputRange: translateXRange }) },
        { translateY: spreadAnim.interpolate({ inputRange: [0, 1], outputRange: translateYRange }) },
        { scale: spreadAnim.interpolate({ inputRange: [0, 1], outputRange: scaleRange }) },
      ]
    };

    return (
      <Animated.View 
        key={`card-${index}`} 
        style={[styles.cardLayer, animatedStyle]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.deckImage}
          resizeMode="cover"
        />
        {/* Dark overlay for cards behind to add depth, fades out on spread */}
        {index > 0 && (
          <Animated.View style={[
            styles.shadowOverlay,
            {
              opacity: spreadAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0] // Darker when stacked, clear when spread
              })
            }
          ]} />
        )}
      </Animated.View>
    );
  };

  // Prepare images to display (max 3)
  const displayImages = images.length > 0 ? images.slice(0, 3) : [placeholder];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        { transform: [{ scale: pressed && isCreateNew ? 0.96 : 1 }] }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={200} // Trigger hover effect slightly faster on hold
    >
      <View style={styles.innerCard}>
        <View style={styles.imageContainer}>
          {isCreateNew ? (
            <View style={styles.createDeckIcon}>
              <View style={styles.plusIconCircle}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
            </View>
          ) : (
            <View style={styles.stackContainer}>
               {displayImages.map((img, idx) => renderCardLayer(img, idx, displayImages.length))}
            </View>
          )}
        </View>
        
        <Text style={styles.deckName} numberOfLines={2}>
          {name}
        </Text>
      </View>

      {/* Optional: Add a subtle indicator if in edit mode */}
      {isEditMode && <View style={styles.editOverlay} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 130,
    backgroundColor: '#212121',
    borderRadius: 12, // Slightly rounder
    borderWidth: 3,
    borderColor: '#F2CC0F',
    padding: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.12,
    // shadowRadius: 4,
    // elevation: 3,
    marginBottom: 12,
    marginHorizontal: 6,
  },
  innerCard: {
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    marginBottom: 10,
    zIndex: 1,
    // Note: We removed overflow: hidden to allow cards to pop out slightly
    // but we use a wrapper to keep the layout clean
  },
  stackContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLayer: {
    position: 'absolute',
    width: '90%', // Slightly smaller than container to allow movement
    height: '90%',
    borderRadius: 6,
    borderWidth: 1,
    // borderColor: '#fff', // White border defines edges in stack
    // backgroundColor: '#f3f3f3',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  createDeckIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
    borderRadius: 8,
    borderWidth: 5,
    borderColor: '#F2CC0F',
    borderStyle: 'dashed',
    width: '100%',
    height: '100%'
  },
  plusIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2CC0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 30,
    fontWeight: '400',
    color: '#212121',
    marginTop: -2,
  },
  deckImage: {
    width: '100%',
    height: '100%',
  },
  deckName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#F2CC0F',
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
});

export default ItemDeck;