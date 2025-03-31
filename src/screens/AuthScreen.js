import { SignIn, SignUp } from '@clerk/clerk-expo'; 
console.log(SignIn, SignUp);
// or default imports depending on your setup
import { StyleSheet, Text, View } from 'react-native'; // Add Text import here

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      {/* Check if SignIn and SignUp components are available */}
      {SignIn ? <SignIn /> : <Text>Error: SignIn component not found</Text>}
      {SignUp ? <SignUp /> : <Text>Error: SignUp component not found</Text>}
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
