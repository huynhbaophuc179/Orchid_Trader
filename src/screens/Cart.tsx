import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
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
import Icon from "react-native-vector-icons/Ionicons";

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
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartWithProduct>();
  const [showModalDeleteAll, setShowModalDeleteAll] = useState(false);

  useEffect(() => {
    const fetchProductById = async (
        productId: string
    ): Promise<Product | null> => {
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

  const showDeleteConfirmationModal = (item: CartWithProduct) => {
    setItemToDelete(item);
    setShowModal(true);
  };

  const handleRemoveItem = (cart: CartWithProduct) => {
    try {
      if (user) {
        const cartRef = doc(
            FirebaseStore,
            "customer",
            user.uid,
            "cart",
            cart.cart.productId
        );

        deleteDoc(cartRef);
        setButtonPressed(true);
        alert("Product Removed");
      } else {
        alert("Error removing cart");
      }
    } catch (error: any) {}
  };

  const handleDeleteConfirmed = () => {
    if (itemToDelete) {
      handleRemoveItem(itemToDelete);
    }
    setShowModal(false);
  };

  const handleShowDeleteAll = () => {
    setShowModalDeleteAll(true);
  };

  const handleConfirmDeleteAll = () => {
    handleDeleteAll();
    setShowModalDeleteAll(false);
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
    } catch (error: any) {
      console.log("error", error);
      alert("error deleting");
    }
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
                <View style={styles.removeIconContainer}>
                  <TouchableOpacity
                      onPress={(data) => {
                        showDeleteConfirmationModal(cart);
                      }}
                  >
                    <Icon name="close-circle-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>

                <View style={styles.imgWrapper}>
                  {cart.product.image ? (
                      <Image
                          style={styles.image}
                          source={{ uri: cart.product.image }}
                      />
                  ) : (
                      <Image
                          style={styles.image}
                          source={require("../../assets/skeleton_plant.png")}
                      />
                  )}
                </View>
                <View style={styles.innerContainer}>
                  <Text style={styles.title}>{cart.product.title}</Text>
                  <Text style={styles.price}>Price: {cart.product.price}</Text>
                  <Text style={styles.count}>In Cart: {cart.cart.count}</Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.total}>Total: {totalPricing} $</Text>
                </View>
              </TouchableOpacity>
          ) : (
              <ActivityIndicator />
          )}
        </>
    );
  };

  const handleOrder = () => {
    navigation.navigate("Order");
  };

  return (
      <>
        {isLoading === true ? (
            <ActivityIndicator size="large" style={styles.loadingIndicator} />
        ) : (
            <View style={styles.container}>
              {cart.length > 0 ? (
                  <>
                    <FlatList
                        data={cart}
                        renderItem={(item) => <CardItem cart={item.item} />}
                        keyExtractor={(item) => item.cart.productId}
                    />
                    <View style={styles.totalAmountContainer}>
                      <Text style={styles.totalAmount}>
                        Total In Cart: {getTotalAmount()} $
                      </Text>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                          style={styles.button1}
                          onPress={handleShowDeleteAll}
                      >
                        <Text style={styles.buttonText1}>Clear all</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          style={styles.button2}
                          onPress={handleOrder}
                      >
                        <Text style={styles.buttonText2}>Order</Text>
                      </TouchableOpacity>
                    </View>
                  </>
              ) : (
                  <Text style={styles.emptyListText}>An Empty List</Text>
              )}
            </View>
        )}

        <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to delete this item?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonDelete]}
                    onPress={handleDeleteConfirmed}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
            visible={showModalDeleteAll}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowModalDeleteAll(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Are you sure you want to delete every item from the shopping cart?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowModalDeleteAll(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonDelete]}
                    onPress={handleConfirmDeleteAll}
                >
                  <Text style={styles.modalButtonText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListText: {
    padding: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    flex: 1,
    flexDirection: "row",
    margin: 10,
    borderColor: "#888",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFF",
    padding: 10,
    alignItems: "center",
  },
  imgWrapper: {},
  image: {
    width: 100,
    aspectRatio: 1,
    borderRadius: 10,
  },
  innerContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  count: {
    fontSize: 14,
    color: "#888",
  },
  totalContainer: {
    flex: 1,
    flexDirection: "column-reverse",
    alignItems: "flex-end",
    marginRight: 10,
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmountContainer: {
    alignSelf: "flex-end",
    padding: 20,
    marginRight: 30,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
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
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
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
  modalButtonCancel: {
    backgroundColor: "#888",
  },
  modalButtonDelete: {
    backgroundColor: "crimson",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Cart;
