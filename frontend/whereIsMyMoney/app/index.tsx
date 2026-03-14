import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getToken } from "../services/authStorage";
import './globals.css'

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        router.replace("/Dashboard");
      } else {
        router.replace("/Login");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <ActivityIndicator size="large" color="#2718fe" />
    </View>
  );
}
