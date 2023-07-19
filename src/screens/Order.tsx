import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";

import {
  NavigationProp,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import Cart from "./Cart";
import { User } from "firebase/auth";
import { FirebaseAuth, FirebaseStore } from "../../firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
interface RouterProp {
  navigation: NavigationProp<any, any>;
}
interface CartWithProduct {
  cart: Cart;
  product: Product | null;
}

interface OrderState {
  name: string;
  address: string;
  phoneNumber: string;

  cart: CartWithProduct[];
  user: User;
}
const Order = ({ navigation }: RouterProp) => {
  // State to store user inputs
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartWithProduct[]>([]);
  const [user, setUser] = useState<User | null>(FirebaseAuth.currentUser);

  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const handleDeleteAll = async () => {
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
          setCart([]);
          alert("Your cart has been emptied");
        });
      } else {
        alert("Error removing cart");
      }
    } catch (error: any) {
      console.log("error", error);
      alert("error deleting");
    }
  };
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
      //   setButtonPressed(false);
    });
  }, []);

  const CardItem = ({ cart }: { cart: CartWithProduct }) => {
    const totalPricing = cart.product
      ? cart.cart.count * cart.product?.price
      : "N/A";

    return (
      <>
        {cart.product ? (
          <TouchableOpacity style={styles.card} onPress={(event) => {}}>
            <View style={styles.removeIconContainer}></View>

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
  const sendOrderToFirebase = async (order: OrderState) => {
    try {
      // Create a new document in the "orders" collection with the order details

      if (user && cart.length > 0) {
        const dataToSave = {
          ...order,
          userID: user?.uid,
          user: undefined,
        };
        delete dataToSave.user;

        await addDoc(collection(FirebaseStore, "orders"), dataToSave);
        handleDeleteAll();
      }

      console.log(order);
      console.log("Order sent to Firebase successfully!");
      alert("Order has been sent!");
    } catch (error) {
      alert("There has been an error, please try again later!");
      console.error("Error sending order to Firebase:", error);
    }
  };

  // Function to handle the order submission
  const handleOrderSubmit = () => {
    // Validate the input fields
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    } else {
      setNameError("");
    }

    if (!address.trim()) {
      setAddressError("Address is required");
      return;
    } else {
      setAddressError("");
    }

    if (!phoneNumber.trim()) {
      setPhoneNumberError("Phone Number is required");
      return;
    } else {
      setPhoneNumberError("");
    }

    // Create an object containing the order details
    const order: OrderState = {
      name,
      address,
      phoneNumber,
      cart,
      user: user as User, // `user` can be null, so we need to assert its type here
    };

    // Call the function to send the order to Firebase
    sendOrderToFirebase(order);

    // Reset the form after submitting
    setName("");
    setAddress("");
    setPhoneNumber("");
    // Reset the error messages
    setNameError("");
    setAddressError("");
    setPhoneNumberError("");
  };
  const getTotalAmount = (): number => {
    let total = 0;
    cart.forEach((item) => {
      if (item.product) {
        total += item.cart.count * item.product.price;
      }
    });
    return total;
  };
  const CartList = () => {
    return (
      <>
        {isLoading === true ? (
          <ActivityIndicator size={"large"} />
        ) : (
          <View
            style={{
              flex: 0,
              flexDirection: "column",
              justifyContent: "flex-start",
              width: "100%",
              marginBottom: 10,
            }}
          >
            {cart.length > 0 ? (
              <Text></Text>
            ) : (
              <Text style={{ padding: 20 }}>An Empty List</Text>
            )}
            <Text style={{ marginHorizontal: 20 }}>
              Total In Cart: {getTotalAmount()} $
            </Text>
            <FlatList
              data={cart}
              renderItem={(item) => <CardItem cart={item.item}></CardItem>}
              keyExtractor={(item) => item.cart.productId}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={(text) => setAddress(text)}
      />
      {addressError ? (
        <Text style={styles.errorText}>{addressError}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
        keyboardType="phone-pad"
      />
      {phoneNumberError ? (
        <Text style={styles.errorText}>{phoneNumberError}</Text>
      ) : null}
      <TouchableOpacity style={styles.submitButton} onPress={handleOrderSubmit}>
        <Text style={styles.buttonText}>Submit Order</Text>
      </TouchableOpacity>
      <CartList></CartList>
    </View>
  );
};

export default Order;

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginBottom: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: "100%",
  },
  submitButton: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
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
    alignSelf: "flex-end", // Align to the right
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 10, // Adjust bottom padding as needed
    marginHorizontal: 10, // Add
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
  removeIconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonDelete: {
    backgroundColor: "crimsom",
  },
  modalButtonText: {
    color: "black",
    fontWeight: "bold",
  },
});
