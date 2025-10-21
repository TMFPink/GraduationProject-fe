import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");
const TABS = ["Posts", "Portfolio", "Collections"];

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const handleTabPress = (index) => {
    setActiveTab(index);
    scrollRef.current.scrollTo({ x: index * width, animated: true });
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.container}>
      {/* Cover */}
      <View style={styles.coverContainer}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1503264116251-35a269479413",
          }}
          style={styles.coverImage}
        />
        <TouchableOpacity style={[styles.editButton, {
          position: 'absolute',
          right: 16,
          bottom: 16,
          backgroundColor: 'white'
        }]}>
          <Text style={styles.editText}>Edit Info</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info Row */}
      <View style={styles.profileRow}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
          }}
          style={styles.avatar}
        />


      </View>
      <View>
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>Username</Text>
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>Lv. 36</Text>
            </View>
          </View>

          <Text style={styles.userTag}>@username_xyz</Text>
          <Text style={styles.bio}>Bio ja kasjdkjkd</Text>
          <Text style={styles.link}>https://shopabcxyz.xyz</Text>

          <View style={styles.followRow}>
            <Text style={styles.followText}>
              <Text style={styles.bold}>420</Text> Followers
            </Text>
            <Text style={styles.followText}>
              <Text style={styles.bold}>69</Text> Following
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(index)}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: [0, width, width * 2],
                    outputRange: [0, width / 3, (width / 3) * 2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* Tab Content */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveTab(index);
        }}
        scrollEventThrottle={16}
      >
        {/* Posts */}
        <View style={styles.tabPage}>
          <Text style={styles.tabHeader}>Posts</Text>
          <Text style={styles.tabContent}>User’s posts appear here.</Text>
        </View>

        {/* Portfolio */}
        <View style={styles.tabPage}>
          <Text style={styles.tabHeader}>Portfolio</Text>
          <Text style={styles.tabContent}>Showcase your main items.</Text>
        </View>

        {/* Collections */}
        <View style={styles.tabPage}>
          <Text style={styles.tabHeader}>Collections</Text>
          <Text style={styles.tabContent}>Display your card sets here.</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverContainer: { width: "100%", height: 120, backgroundColor: "#d95c47" },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginTop: -30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  username: { fontSize: 18, fontWeight: "700", color: "#222" },
  levelTag: {
    backgroundColor: "#eee",
    borderRadius: 6,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: { fontSize: 12, color: "#333", fontWeight: "600" },
  userTag: { color: "#666", fontSize: 14, marginBottom: 4 },
  bio: { color: "#444", fontSize: 14 },
  link: { color: "#1a73e8", fontSize: 14, marginTop: 4 },
  followRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 12,
  },
  followText: { fontSize: 14, color: "#555" },
  bold: { fontWeight: "700", color: "#000" },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "flex-start",
  },
  editText: { fontSize: 13, color: "#333" },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
    marginTop: 10,
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 15, color: "#888" },
  tabTextActive: { color: "#000", fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width / 3,
    height: 3,
    backgroundColor: "#000",
    borderRadius: 2,
  },
  tabPage: { width, padding: 16 },
  tabHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  tabContent: { fontSize: 15, color: "#555" },
});
