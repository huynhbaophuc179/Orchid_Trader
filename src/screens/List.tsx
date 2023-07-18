import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  NavigationProp,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { FirebaseApp, FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Detail from "./Detail";
import { Button } from "react-native-paper";

interface RouterProp {
  navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProp) => {
  const [product, setProduct] = useState<Product[]>([]);
  const isFocused = useIsFocused();
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      console.log("this thing just ran");
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

    fetchData();
  }, [isFocused]);
  // const navigator = useNavigation();
  function handleDetailPress(product: Product) {
    navigation.navigate("Detail", { product });
  }
  const CardItem = ({ product }: { product: Product }) => {
    return (
      <TouchableOpacity
        style={style.card}
        onPress={(event) => {
          handleDetailPress(product);
        }}
      >
        <View style={style.imgWrapper}>
          <Image style={style.image} source={{ uri: product.image }} />
        </View>
        <Text>{product.title}</Text>
        <Text>Price: {product.price}</Text>
      </TouchableOpacity>
    );
  };
  const handleSignOut = () => {
    FirebaseAuth.signOut();
  };

  return (
    <View style={{}}>
      <Button onPress={handleSignOut}>Sign Out</Button>
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

export default List;

const style = StyleSheet.create({
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
