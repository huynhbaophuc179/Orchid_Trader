import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  NavigationProp,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
interface RouterProp {
  navigation: NavigationProp<any, any>;
}

const Cart = ({ navigation }: RouterProp) => {
  const [product, setProduct] = useState<Product[]>([]);

  function handleDetailPress(product: Product) {
    navigation.navigate("Detail", { product });
  }
  const CardItem = ({ product }: { product: Product }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={(event) => {
          handleDetailPress(product);
        }}
      >
        <View style={styles.imgWrapper}>
          <Image style={styles.image} source={{ uri: product.image }} />
        </View>
        <Text>{product.title}</Text>
        <Text>Price: {product.price}</Text>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <View style={{}}>
      {/* <Button onPress={handleSignOut}>Sign Out</Button> */}
      <FlatList
        data={product}
        renderItem={(item) => <CardItem product={item.item}></CardItem>}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: "center" }}
      ></FlatList>
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    // alignItems: "center",
    margin: 10,
    borderColor: "black",
    borderWidth: 1,

    borderRadius: 10,
  },
  imgWrapper: {},
  image: {
    width: "100%", // Set the desired width
    // height: 100,
    aspectRatio: 1,
    borderRadius: 10,
  },
});
