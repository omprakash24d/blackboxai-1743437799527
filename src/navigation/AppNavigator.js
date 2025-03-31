import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "@clerk/clerk-expo";
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import ViewerScreen from "../screens/ViewerScreen"; // Import ViewerScreen

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isSignedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isSignedIn ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Welcome' }}
            />
            <Stack.Screen 
              name="Viewer" 
              component={ViewerScreen} 
              options={{ title: 'PDF Viewer' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
