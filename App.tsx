import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Login from "./src/screens/Login";
import List from "./src/screens/List";
import Detail from "./src/screens/Detail";
import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { FirebaseAuth } from "./firebaseConfig";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const InnerStack = createNativeStackNavigator();

type Product = {
  image: string;
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
};
function InsideLayout() {
  return (
    <InnerStack.Navigator>
      <InnerStack.Screen
        name="Orchid Home"
        component={List}
      ></InnerStack.Screen>
      <InnerStack.Screen
        // initialParams={ product: Product }}

        name="Detail"
        component={Detail}
        options={{}}
      ></InnerStack.Screen>
      <Tab.Navigator>
        <Tab.Screen name="Orchid Home" component={List}></Tab.Screen>
      </Tab.Navigator>
    </InnerStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    onAuthStateChanged(FirebaseAuth, (user) => {
      setUser(user);
      console.log("user", user);
    });

    return () => {};
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ? (
          <Stack.Screen
            name="Home"
            component={InsideLayout}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: true }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
