import React, {useEffect, useState} from "react";
import {View, Text, FlatList, StyleSheet, Image, TouchableOpacity} from "react-native";
import {NavigationProp, useNavigation, useIsFocused} from "@react-navigation/native";
import {FirebaseAuth, FirebaseStore} from "../../firebaseConfig";
import {collection, getDocs} from "firebase/firestore";
import { createDrawerNavigator } from '@react-navigation/drawer';

import Detail from "./Detail";
import {Button, Card} from "react-native-paper";
import Profile from "./Profile";

interface RouterProp {
    navigation: NavigationProp<any, any>;
}

const List = ({navigation}: RouterProp) => {
    const [product, setProduct] = useState<Product[]>([]);
    const isFocused = useIsFocused();
    const Drawer = createDrawerNavigator();

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            console.log("this thing just ran");
            try {
                const productList: Product[] = [];
                const data = await getDocs(collection(FirebaseStore, "product"));

                data.forEach((doc) => {
                    const productData = doc.data();
                    const product: Product = {id: doc.id, ...productData} as Product;
                    productList.push(product);
                });

                setProduct(productList);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [isFocused]);

    function handleDetailPress(product: Product) {
        navigation.navigate("Detail", {product});
    }
    function MyDrawer() {
        return (
            <Drawer.Navigator>
                <Drawer.Screen name="Feed" component={Detail}/>
                <Drawer.Screen name="Article" component={Profile}/>
            </Drawer.Navigator>
        );
    }
    const CardItem = ({product}: { product: Product }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    handleDetailPress(product);
                }}
            >
                <Card>
                    <Card.Cover style={styles.image} source={{uri: product.image}}/>
                    <Card.Content>
                        <Text style={styles.title}>{product.title}</Text>
                        <Text style={styles.price}>Price: {product.price}</Text>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={product}
                renderItem={({item}) => <CardItem product={item}/>}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.contentContainer}
                columnWrapperStyle={styles.columnWrapper}
            />
        </View>
    );
};

export default List;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "#F9F9F9",
    },
    card: {
        flex: 1,
        margin: 8,
        borderRadius: 10,
        overflow: "hidden",
    },
    image: {
        height: 150,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
    },
    price: {
        fontSize: 14,
        color: "#888",
        marginBottom: 8,
    },
    contentContainer: {
        flexGrow: 1,
    },
    columnWrapper: {
        justifyContent: "space-between",
    },
    signOutButton: {
        marginBottom: 16,
    },
});
