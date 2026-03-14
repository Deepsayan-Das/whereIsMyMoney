import { Stack, useRouter, useSegments, useFocusEffect } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { getToken } from "../services/authStorage";
import './globals.css'

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);


  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken();
      const inAuthGroup = segments[0] === "Login" || segments[0] === "Signup";
      const isRoot = !segments[0];

      console.log("Auth Check:", { token: !!token, segments, inAuthGroup, isRoot });

      if (!token && !inAuthGroup) {
        console.log("Redirecting to Login...");
        router.replace("/Login");
      } else if (token && inAuthGroup) {
        console.log("Redirecting to Home...");
        router.replace("/");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      if (!initialCheckDone) setInitialCheckDone(true);
    }
  }, [segments, router, initialCheckDone]);

  // Use useFocusEffect to trigger checkAuth whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [checkAuth])
  );

  if (!initialCheckDone) {
    return (
      <View className='flex-1 justify-center items-center bg-[#f1f1f3]'>
        <ActivityIndicator size="large" color="#2718fe" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}



