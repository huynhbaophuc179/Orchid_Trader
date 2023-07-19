import React, {useState, useEffect} from "react";
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, FlatList} from "react-native";
import {NavigationProp, useNavigation, useIsFocused} from "@react-navigation/native";
import Cart from "./Cart";
import {User} from "firebase/auth";
import {FirebaseAuth, FirebaseStore} from "../../firebaseConfig";
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs} from "firebase/firestore";

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

const Order = ({navigation}: RouterProp) => {
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
                    const cartRef = doc(FirebaseStore, "customer", user.uid, "cart", element.cart.productId);
                    deleteDoc(cartRef);
                });

                setCart([]);
                alert("Your cart has been emptied");
            } else {
                alert("Error removing cart");
            }
        } catch (error: any) {
            console.log("error", error);
            alert("Error deleting cart");
        }
    };

    useEffect(() => {
        const fetchProductById = async (productId: string): Promise<Product | null> => {
            try {
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
                    const data = await getDocs(collection(FirebaseStore, "customer", curUser.uid, "cart"));

                    const fetchPromises = data.docs.map(async (item) => {
                        const cartData = item.data();
                        const cart: Cart = {...cartData} as Cart;
                        const fetchedProduct = await fetchProductById(cart.productId);
                        return {cart, product: fetchedProduct};
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

        fetchData();
    }, []);

    const CardItem = ({cart}: { cart: CartWithProduct }) => {
        const totalPricing = cart.product ? cart.cart.count * cart.product?.price : "N/A";

        return (
            <TouchableOpacity style={styles.card} onPress={(event) => {
            }}>
                <View style={styles.removeIconContainer}></View>
                <View style={styles.imgWrapper}>
                    {
                        cart.product?.image ?
                            <Image style={styles.image} source={{uri: cart.product?.image}}/> :
                            <Image style={styles.image} source={require("../../assets/skeleton_plant.png")}
                            />
                    }
                </View>
                <View style={styles.innerContainer}>
                    <Text>Name: {cart.product?.title}</Text>
                    <Text>Price: {cart.product?.price}</Text>
                    <Text>In Cart: {cart.cart.count}</Text>
                </View>
                <View style={styles.priceTotalContainer}>
                    <Text>Total: {totalPricing} $</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const sendOrderToFirebase = async (order: OrderState) => {
        try {
            if (user && cart.length > 0) {
                const dataToSave = {
                    ...order,
                    userID: user.uid,
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
            <View style={styles.cartListContainer}>
                {isLoading === true ? (
                    <ActivityIndicator size="large"/>
                ) : (
                    <>
                        {cart.length > 0 ? (
                            <>
                                <Text style={styles.cartListTitle}>Items in Cart:</Text>
                                <FlatList
                                    data={cart}
                                    renderItem={(item) => <CardItem cart={item.item}/>}
                                    keyExtractor={(item) => item.cart.productId}
                                />
                            </>
                        ) : (
                            <Text style={styles.emptyCartText}>Your cart is empty.</Text>
                        )}
                        <Text style={styles.totalAmountText}>Total: {getTotalAmount()} $</Text>
                    </>
                )}
            </View>
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
            {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}
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
            <CartList/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f2f2f2",
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    submitButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    errorText: {
        color: "red",
        marginBottom: 5,
    },
    cartListContainer: {
        flex: 1,
        marginTop: 20,
    },
    cartListTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    emptyCartText: {
        fontSize: 16,
        textAlign: "center",
    },
    totalAmountText: {
        fontSize: 18,
        fontWeight: "bold",
        alignSelf: "flex-end",
        marginTop: 10,
    },
    card: {
        flexDirection: "row",
        margin: 10,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 10,
    },
    removeIconContainer: {
        position: "absolute",
        top: 5,
        right: 5,
        zIndex: 1,
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

export default Order;
