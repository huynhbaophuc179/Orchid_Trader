import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  NavigationProp,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
import { User } from "firebase/auth";

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
      try {
        const curUser: User | null = FirebaseAuth.currentUser;
        if (curUser) {
          const data = await getDocs(
            collection(FirebaseStore, "customer", curUser.uid, "cart")
          );

          const fetchPromises = data.docs.map(async (item) => {
            const cartData = item.data();
            const cart: Cart = { ...cartData } as Cart;
            const fetchedProduct = await fetchProductById(cart.productId);
            return { cart, product: fetchedProduct };
          });

          const results = await Promise.all(fetchPromises);
          setCart(results);
        } else {
          console.log("Not logged in");
        }

        setIsLoading(false);
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
  const getTotalAmount = (): number => {
    let total = 0;
    cart.forEach((item) => {
      if (item.product) {
        total += item.cart.count * item.product.price;
      }
    });
    return total;
  };
  const CardItem = ({ cart }: { cart: CartWithProduct }) => {
    const totalPricing = cart.product
      ? cart.cart.count * cart.product?.price
      : "N/A";
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
            <View style={styles.innerContainer}>
              <Text>Name: {cart.product.title}</Text>
              <Text>Price: {cart.product.price}</Text>
              <Text>In Cart: {cart.cart.count}</Text>
            </View>
            <View style={styles.priceTotalContainer}>
              <Text>Total: {totalPricing} $</Text>
            </View>
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
          ></FlatList>
          <View
            style={{
              alignSelf: "flex-end",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              padding: 20,
            }}
          >
            <Text>Total In Cart: {getTotalAmount()} $</Text>
          </View>
        </View>
      )}
    </>
  );
};

export default Cart;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    margin: 10,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
  },
  imgWrapper: {},
  image: {
    width: 100,
    aspectRatio: 1,
    borderRadius: 10,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  priceTotalContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    alignItems: "flex-end",
    marginHorizontal: 20,
  },
});
