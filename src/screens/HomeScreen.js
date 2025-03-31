import { useUser } from "@clerk/clerk-expo";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen() {
  const { user, isSignedIn } = useUser();
  
  if (!isSignedIn) {
    return null; // Or redirect to AuthScreen
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.emailAddresses[0]?.email}</Text>
      <Button 
        title="Sign Out" 
        onPress={() => {
          const { signOut } = useAuth();
          signOut();
        }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});