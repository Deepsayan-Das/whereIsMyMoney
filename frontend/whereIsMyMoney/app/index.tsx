import { Text, View } from "react-native";
import './globals.css'
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Text className="text-5xl text-blue-500 font-bold">will you work ???</Text>
      <Link href="/Login" className="text-2xl text-secondary mt-4">Login</Link>
      <Link href="/Signup" className="text-2xl text-secondary mt-4">Signup</Link>
      <Link href="/Dashboard" className="text-2xl text-secondary mt-4">Dashboard</Link>
    </View>
  );
}
