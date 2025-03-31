import { SignIn, SignUp } from "@clerk/clerk-expo";
import { View, StyleSheet } from "react-native";

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      <SignIn />
      <SignUp />
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
});