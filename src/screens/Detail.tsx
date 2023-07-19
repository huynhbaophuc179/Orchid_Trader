import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Button,
} from "react-native";
import {
    NavigationProp,
    RouteProp,
    useRoute,
} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {ParamListBase} from "@react-navigation/routers";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {FirebaseAuth, FirebaseStore} from "../../firebaseConfig";
import {User} from "firebase/auth";

interface DetailProps {
    navigation: NavigationProp<any, any>;
}

interface RouteParam {
    product: Product;
}

const Detail: React.FunctionComponent<DetailProps> = ({navigation}) => {
    const route = useRoute();
    const [count, setCount] = useState(0);
    const {product} = route.params as RouteParam;
    const [user, setUser] = useState<User | null>(FirebaseAuth.currentUser);
    const [productFetched, setProductFetched] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProductById = async (
            productId: string
        ): Promise<Product | null> => {
            try {
                console.log("this thing just ran");
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

            if (cartSnapshot.exists()) {
                const cartData = cartSnapshot.data();
                const cart: Cart = {
                    ...cartData,
                } as Cart;
                return {cartRef, cart, cartData};
            } else {
                // Document does not exist
                return {cartRef, cart: null};
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
            alert("Added to cart");
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
              { productId: product.id, count: count },
              { merge: true }
            );
          } catch (error: any) {
            console.log(error);
          }
          alert("Added new item to cart");
          console.log("cha co gi ca");
        }
      } else {
        alert("Error adding to cart, please try again later");
        console.log("loi roi");
      }
    }
  };
  const handleAmountChange = (option: number) => {
    if (option === 1 && count < 100) {
      setCount(count + 1);
    } else if (count > 1 && option === 0) setCount(count - 1);
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
                        <Image style={styles.image} source={{uri: product.image}}/>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => handleAddToCart(user)}
                        >
                            <Text style={styles.buttonText}>Add to Cart</Text>
                        </TouchableOpacity>
                        <View style={styles.counterContainer}>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => handleAmountChange(0)}
                            >
                                <Text style={styles.counterButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.counterText}>{count}</Text>
                            <TouchableOpacity
                                style={styles.counterButton}
                                onPress={() => handleAmountChange(1)}
                            >
                                <Text style={styles.counterButtonText}>+</Text>
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

    return (
        <>
            {!productFetched ? displayLoader() : displayProductDetail()}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        padding: 16,
    },
    upperContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    lowerContainer: {
        flex: 1,
        alignItems: "center",
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    image: {
        width: "100%",
        aspectRatio: 1.5,
        borderRadius: 10,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textDecorationLine: "underline",
        marginBottom: 8,
    },
    category: {
        fontSize: 18,
        color: "#888",
        marginBottom: 16,
    },
    descriptionContainer: {
        width: "100%",
        paddingHorizontal: 16,
    },
    descriptionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
    },
    button: {
        backgroundColor: "#6C63FF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        marginBottom: 16,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    counterContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    counterButton: {
        backgroundColor: "#E0E0E0",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    counterButtonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    counterText: {
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Detail;
