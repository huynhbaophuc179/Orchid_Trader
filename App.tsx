import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
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
import Icon from "react-native-vector-icons/Ionicons";
import Cart from "./src/screens/Cart";
import Order from "./src/screens/Order";
import OrderList from "./src/screens/OrderList";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const InnerStack = createNativeStackNavigator();

function HomeLayout() {
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
      <InnerStack.Screen
        // initialParams={ product: Product }}

        name="OrderScreen"
        component={Order}
        options={{}}
      ></InnerStack.Screen>
      <InnerStack.Screen
        // initialParams={ product: Product }}

        name="Cart"
        component={Cart}
        options={{}}
      ></InnerStack.Screen>
    </InnerStack.Navigator>
  );
}
function InsideLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Orchid Home"
        component={HomeLayout}
        options={{
          headerShown: false,
          headerTintColor: "black",
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"ios-home"} size={25} color="black" />
          ),
        }}
      ></Tab.Screen>
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          headerShown: true,
          headerTintColor: "black",
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"cart"} size={25} color="black" />
          ),
        }}
      ></Tab.Screen>
      <Tab.Screen
        name="Order"
        component={OrderList}
        options={{
          headerShown: true,
          headerTintColor: "black",
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"list"} size={25} color="black" />
          ),
        }}
      ></Tab.Screen>
    </Tab.Navigator>
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
