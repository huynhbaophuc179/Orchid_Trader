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
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { FirebaseApp, FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
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
  const [buttonPressed, setButtonPressed] = useState(false);
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
      setButtonPressed(false);
    });
  }, [isFocused, buttonPressed]);

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
  const handleDeleteAll = () => {
    try {
      if (user) {
        cart.forEach((element) => {
          const cartRef = doc(
            FirebaseStore,
            "customer",
            user.uid,
            "cart",
            element.cart.productId
          );

          deleteDoc(cartRef);
          setButtonPressed(true);
          alert("Your cart has been emptied");
        });
      } else {
        alert("Error removing cart");
      }
    } catch (error: any) {}
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
        <View style={{ flex: 1 }}>
          <FlatList
            data={cart}
            renderItem={(item) => <CardItem cart={item.item}></CardItem>}
            keyExtractor={(item) => item.cart.productId}
          />
          <View style={styles.totalAmountContainer}>
            <Text>Total In Cart: {getTotalAmount()} $</Text>
          </View>
          <View style={styles.buttonContainer}>
            <View>
              <TouchableOpacity
                style={styles.button1}
                onPress={() => {
                  // Handle the action for the first button here
                  handleDeleteAll();
                }}
              >
                <Text style={styles.buttonText1}>Remove Cart</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.button2}
              onPress={() => {
                // Handle the action for the second button here
              }}
            >
              <Text style={styles.buttonText2}>Order</Text>
            </TouchableOpacity>
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
  totalAmountContainer: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 20,
    marginHorizontal: 30,
  },
  buttonContainer: {
    flexDirection: "row",

    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },
  button1: {
    backgroundColor: "crimson",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  button2: {
    backgroundColor: "black",
    // width: 40,
    // height: "auto",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText1: {
    color: "white",
    fontWeight: "bold",
  },
  buttonText2: {
    color: "white",
    fontWeight: "bold",
  },
});
