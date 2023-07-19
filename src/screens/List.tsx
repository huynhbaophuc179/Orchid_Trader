import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions, TextInput } from "react-native";
import { NavigationProp, useNavigation, useIsFocused } from "@react-navigation/native";
import { FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Icon, Card, Header } from "react-native-elements";

interface RouterProp {
    navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProp) => {
    const [product, setProduct] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const isFocused = useIsFocused();

    useEffect(() => {
        fetchData();
    }, [isFocused]);

    function handleDetailPress(product: Product) {
        navigation.navigate("Detail", { product });
    }

    const fetchData = async (): Promise<void> => {
        try {
            const productList: Product[] = [];
            const data = await getDocs(collection(FirebaseStore, "product"));

            data.forEach((doc) => {
                const productData = doc.data();
                const product: Product = { id: doc.id, ...productData } as Product;
                productList.push(product);
            });

            setProduct(productList);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);

        // Filter the product list based on the search query
        if (text.trim() === "") {
            // If search query is empty, display the whole list
            fetchData();
        } else {
            const filteredProducts = product.filter((p) =>
                p.title.toLowerCase().includes(text.toLowerCase())
            );
            setProduct(filteredProducts);
        }
    };

    const CardItem = ({ product }: { product: Product }) => {
        const { width } = Dimensions.get("window");
        const cardSize = width / 2 - 24;
        const imageHeight = cardSize * 0.75;

        return (
            <TouchableOpacity
                style={[styles.card, { width: cardSize, aspectRatio: 1 }]}
                onPress={() => {
                    handleDetailPress(product);
                }}
            >
                <View style={styles.imageContainer}>
                    {product.image ? (
                        <Image style={[styles.image, { height: imageHeight }]} source={{ uri: product.image }} />
                    ) : (
                        <Image style={[styles.image, { height: imageHeight }]} source={require("../../assets/skeleton_plant.png")} />
                    )}
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.title}>{product.title}</Text>
                    <Text style={styles.price}>Price: {product.price}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                centerComponent={{ text: "Product List", style: { fontSize: 20, fontWeight: "bold", color: "#fff" } }}
                containerStyle={styles.header}
            />
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                <Icon
                    name="search"
                    type="material"
                    color="#888"
                    size={20}
                    containerStyle={styles.searchIconContainer}
                />
            </View>
            <FlatList
                data={product}
                renderItem={({ item }) => <CardItem product={item} />}
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
        backgroundColor: "#F9F9F9",
    },
    header: {
        backgroundColor: "#FFFFFF",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#888",
        marginRight: 8,
    },
    searchIconContainer: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 8,
    },
    contentContainer: {
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    card: {
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#FFF",
    },
    imageContainer: {
        flex: 1,
        overflow: "hidden",
    },
    image: {
        flex: 1,
        resizeMode: "center",
    },
    cardContent: {
        padding: 8,
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
    columnWrapper: {
        justifyContent: "space-between",
    },
});
