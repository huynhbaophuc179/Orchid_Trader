import { NavigationContainer } from "@react-navigation/native";
import "react-native-gesture-handler";
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
import Profile from "./src/screens/Profile";
import {
  createDrawerNavigator,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Button } from "react-native-paper";
import Constants from "expo-constants";
import OrderList from "./src/screens/OrderList";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function HomeLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Orchid Home" component={List} />
      <Stack.Screen name="Detail" component={Detail} />
    </Stack.Navigator>
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
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"ios-home"} size={25} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"cart"} size={25} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Order"
        component={OrderList}
        options={{
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"list"} size={25} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabelStyle: {
            color: "black",
            fontWeight: "bold",
          },
          tabBarIcon: ({ focused }) => (
            <Icon name={"person"} size={25} color="black" />
          ),
        }}
      />
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

  const handleSignOut = async () => {
    try {
      await FirebaseAuth.signOut();
      console.log("User signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const DrawerContent = (props: any) => (
    <View style={styles.drawerContainer}>
      <DrawerItemList {...props} />
      <DrawerItem label={"Signout"} onPress={handleSignOut} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <NavigationContainer>
        {user ? (
          <Drawer.Navigator drawerContent={DrawerContent}>
            <Drawer.Screen name="Home" component={InsideLayout} />
            <Drawer.Screen name="Profile" component={Profile} />
          </Drawer.Navigator>
        ) : (
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={Login} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  drawerContainer: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
});
