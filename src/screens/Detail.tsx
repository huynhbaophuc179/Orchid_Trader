import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationProp, RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/routers";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
import { User } from "firebase/auth";

interface detailProps {
  navigation: NavigationProp<any, any>;
}

interface routeParam {
  product: Product;
}

const Detail: React.FunctionComponent<detailProps> = ({ navigation }) => {
  const route = useRoute();
  const [count, setCount] = useState(0);
  const { product } = route.params as routeParam;
  const [user, setUser] = useState<User | null>(FirebaseAuth.currentUser);
  const [productFetched, setProductFetched] = useState<Product | null>(null);
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
    fetchProductById(product.id).then((data) => {
      console.log(data);
      setProductFetched(data);
    });
  }, []);

  const getCart = async (user: User) => {
    try {
      const cartRef = doc(
        FirebaseStore,
        "customer",
        user.uid,
        "cart",
        product.id
      );

      const cartSnapshot = await getDoc(cartRef);
      console.log(cartSnapshot);
      if (cartSnapshot.exists()) {
        console.log("object exist");
        const cartData = cartSnapshot.data();
        const cart: Cart = {
          ...cartData,
        } as Cart;
        // console.log("cack", cart);
        return { cartRef, cart, cartData };
      } else {
        console.log("nothing there");
        // Document does not exist
        return { cartRef, cart: null };
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  };

  const handleAddToCart = async (user: User | null) => {
    if (!user) return;
    else {
      const data = await getCart(user);
      console.log(data?.cart);
      if (data) {
        if (data.cart) {
          // console.log(data.cart);
          console.log(data.cart);
          const newCount = data.cart.count + count;
          data.cart.count = newCount;
          // const updatedData ;
          try {
            setDoc(data?.cartRef, { ...data.cart }, { merge: true });
            console.log("co gi do do");
          } catch (error: any) {
            console.log(error);
          }
        } else {
          const customerRef = doc(FirebaseStore, "customer", user.uid);
          const customerSnapShot = getDoc(customerRef);
          console.log((await customerSnapShot).exists);
          try {
            setDoc(
              data?.cartRef,
              { prodcutId: product.id, count: 1 },
              { merge: true }
            );
          } catch (error: any) {
            console.log(error);
          }

          console.log("cha co gi ca");
        }
      } else {
        console.log("loi roi");
      }
    }
  };
  const handleAmountChange = (option: number) => {
    if (option === 1 && count < 100) {
      setCount(count + 1);
    } else if (count > 0 && option === 0) setCount(count - 1);
  };
  const displayLoader = () => {
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <ActivityIndicator style={{ marginTop: 20 }} size={"large"} />
        </View>
      </View>
    );
  };
  const displayProductDetail = () => {
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <View style={styles.lowerContainer}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={{ uri: product.image }} />
            <Button
              title="Add to cart"
              onPress={(e) => {
                handleAddToCart(user);
              }}
            ></Button>
            <View style={styles.containerButton}>
              <TouchableOpacity
                onPress={(e) => {
                  handleAmountChange(0);
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.countText}>{count}</Text>
              <TouchableOpacity
                onPress={(e) => {
                  handleAmountChange(1);
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Product Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </View>
    );
  };
  return <>{!productFetched ? displayLoader() : displayProductDetail()}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  upperContainer: {
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
  lowerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  image: {
    width: "90%",
    aspectRatio: 1.5,
    borderColor: "black",
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  category: {
    fontSize: 15,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    textAlign: "left",
  },
  descriptionTitle: {
    marginTop: 10,
    fontWeight: "bold",
  },
  description: {
    // marginTop: 10,
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  containerButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    padding: 8,
    backgroundColor: "lightgray",
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  countText: {
    marginHorizontal: 16,
    fontSize: 18,
  },
});

export default Detail;
