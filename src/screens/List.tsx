import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { FirebaseStore } from "../../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Detail from "./Detail";

interface RouterProp {
  navigation: NavigationProp<any, any>;
}

const List = ({ navigation }: RouterProp) => {
  const [product, setProduct] = useState<Product[]>([]);
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const productList: Product[] = [];
        const data = await getDocs(collection(FirebaseStore, "product"));

        data.forEach((doc) => {
          const productData = doc.data();
          const product: Product = { id: doc.id, ...productData } as Product;

          console.log("image", productData.image);

          console.log(product);
          productList.push(product);
        });

        console.log("Data from Firestore");
        console.log(productList);
        // Do something with the productList, such as updating state using setState
        setProduct(productList);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();

    return () => {
      // Clean up any resources if needed
    };
  }, []);

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
      </TouchableOpacity>
    );
  };

  return (
    <View style={{}}>
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
