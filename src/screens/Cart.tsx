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
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
import { User } from "firebase/auth";
import { ActivityIndicator } from "react-native-paper";
// import { Cart } from "../interface";
interface RouterProp {
  navigation: NavigationProp<any, any>;
}

interface CartWithProduct {
  cart: Cart;
  product: Product | null;
}
const Cart = ({ navigation }: RouterProp) => {
  const [cart, setCart] = useState<CartWithProduct[]>([]);
  const isFocused = useIsFocused();
  const [user, setUser] = useState<User | null>(FirebaseAuth.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchProductById = async (
      productId: string
    ): Promise<Product | null> => {
      try {
        console.log("cai nay cung chay ne");
        const productRef = doc(FirebaseStore, "product", productId);
        const productSnapshot = await getDoc(productRef);

        if (productSnapshot.exists()) {
          const productData = productSnapshot.data();
          const product: Product = {
            id: productSnapshot.id,
            ...productData,
          } as Product;
          return product;
        } else {
          // Document does not exist
          return null;
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        return null;
      }
    };
    const fetchData = async (): Promise<void> => {
      console.log("this thing just ran");
      try {
        const cartList: CartWithProduct[] = [];
        const curUser: User | null = FirebaseAuth.currentUser;
        if (curUser) {
          const data = await getDocs(
            collection(FirebaseStore, "customer", curUser.uid, "cart")
          );
          console.log(data);
          data.forEach((item) => {
            const cartData = item.data();

            const cart: Cart = { ...cartData } as Cart;
            console.log("fetching ", cart);
            fetchProductById(cart.productId).then((fetchedProduct) => {
              cartList.push({ cart: cart, product: fetchedProduct });
            });
            // cartList.push(cart);
          });

          setCart(cartList);
        } else {
          console.log("not logged in");
        }
        console.log(cartList);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData().then(() => {
      setIsLoading(false);
    });
  }, [isFocused]);
  function handleDetailPress(product: Product | null) {
    console.log(product);
    navigation.navigate("Detail", { product });
  }
  const CardItem = ({ cart }: { cart: CartWithProduct }) => {
    return (
      <>
        {cart.product ? (
          <TouchableOpacity
            style={styles.card}
            onPress={(event) => {
              handleDetailPress(cart.product);
            }}
          >
            <View style={styles.imgWrapper}>
              <Image
                style={styles.image}
                source={{ uri: cart.product.image }}
              />
            </View>
            <Text>{cart.product.title}</Text>
            <Text>Price: {cart.product.price}</Text>
            <Text>In Cart: {cart.cart.count}</Text>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator />
        )}
      </>
    );
  };
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <>
      {isLoading === true ? (
        <ActivityIndicator size={"large"} />
      ) : (
        <View style={{}}>
          {/* <Button onPress={handleSignOut}>Sign Out</Button> */}
          <FlatList
            data={cart}
            renderItem={(item) => <CardItem cart={item.item}></CardItem>}
            keyExtractor={(item) => item.cart.productId}
            numColumns={2}
            contentContainerStyle={{ padding: 16 }}
            columnWrapperStyle={{ justifyContent: "center" }}
          ></FlatList>
        </View>
      )}
    </>
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
