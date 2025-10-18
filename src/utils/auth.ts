import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/auth-api";
import { LoginRequest, User } from "../types/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error setting token:", error);
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const setUserData = async (userData: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Error setting user data:", error);
  }
};

export const removeUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

export const login = async (credentials: LoginRequest) => {
  try {
    const response = await authApi.login(
      credentials.email,
      credentials.password
    );

    // Store token and user data
    console.log("response in login utils:", response);
    await setToken(response.metadata.accessToken);
    const userData = await authApi.getCurrentUser();
    await setUserData(userData.metadata);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await authApi.getCurrentUser();
    console.log("getCurrentUser in auth utils:", response);
    return response.metadata;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await removeToken();
    await removeUserData();
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};
