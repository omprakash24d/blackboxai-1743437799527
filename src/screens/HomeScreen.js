import { useUser } from "@clerk/clerk-expo";
import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  const { user, isSignedIn } = useUser();
  
  if (!isSignedIn) {
    return null; // Or redirect to AuthScreen
  }

  // Function to navigate to the ViewerScreen
  const goToViewer = () => {
    // Replace `fileUri` with the actual path to the PDF file
    const fileUri = "path/to/your/pdf/file.pdf"; // Placeholder path
    navigation.navigate("Viewer", { fileUri });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.emailAddresses[0]?.email}</Text>
      <Button 
        title="Go to PDF Viewer"
        onPress={goToViewer} // Navigate to ViewerScreen
      />
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
