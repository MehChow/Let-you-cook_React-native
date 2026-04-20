import { Home as HomeIcon } from "@/components/Icon";
import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-red-200">
      <Text>Home</Text>
      <HomeIcon size={28} color="black" />
    </View>
  );
}
