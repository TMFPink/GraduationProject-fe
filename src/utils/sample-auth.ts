import { User } from "../types/chat";
import { setToken, setUserData } from "./auth";

/**
 * Sample function to set up authentication data for testing
 * In a real app, this would be handled by your login flow
 */
export const setupSampleAuth = async () => {
  // Sample JWT token (replace with real token from your authentication API)
  const sampleToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjU0OWI2YjItZTUwMi00MjcyLWFlNjItZjkyNjMyNGRkNzk1Iiwicm9sZV9pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImlhdCI6MTc2MDU4NTM4MCwiZXhwIjoxNzYwODQ0NTgwfQ.8q6mRtGYkEVA_5-c918xYyIZHOL0bU5b6jD_fcDNpDw";

  // Sample user data (replace with real user data from your API)
  const sampleUser: User = {
    user_id: "25492b35-1985-4729-84ea-422040745d80",
    first_name: "hong",
    last_name: "tran",
    email: "hong@gmail.com",
  };

  try {
    console.log("Starting sample auth setup...");
    console.log("Setting token...");
    await setToken(sampleToken);
    console.log("Token set successfully");

    console.log("Setting user data...");
    await setUserData(sampleUser);
    console.log("User data set successfully");

    console.log("Sample authentication data set up successfully");
  } catch (error) {
    console.error("Error setting up sample auth:", error);
    throw error; // Re-throw to let caller handle it
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { getToken, getUserData } = await import("./auth");
    const token = await getToken();
    const userData = await getUserData();
    return !!(token && userData);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
