import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FirebaseAuth, FirebaseStore } from "../../firebaseConfig";


interface CartWithProduct {
  cart: Cart;
  product: Product | null;
}

interface OrderState {
  name: string;
  address: string;
  phoneNumber: string;
  cart: CartWithProduct[];
  userId: string;
}


const OrderList = () => {
  const [orders, setOrders] = useState<OrderState[]>([]);
  const [user, setUser] = useState<User | null>(FirebaseAuth.currentUser);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user) {
          const ordersRef = collection(FirebaseStore, "orders");

          const userOrdersQuery = query(
              ordersRef,
              where("userID", "==", user.uid)
          );

          const userOrdersQuerySnapshot = await getDocs(userOrdersQuery);

          const userOrders: OrderState[] = userOrdersQuerySnapshot.docs.map(
              (doc) => doc.data() as OrderState
          );
          setOrders(userOrders);
        } else {
          alert("Signed Out");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [user]);

  const renderItem = ({ item }: { item: OrderState }) => {
    return (
        <View style={styles.orderContainer}>
          <Text style={styles.orderTitle}>Order for: {item.name}</Text>
          <Text style={styles.orderText}>Address: {item.address}</Text>
          <Text style={styles.orderText}>Phone Number: {item.phoneNumber}</Text>

          <Text style={styles.cartTitle}>Cart Items:</Text>
          <FlatList
              data={item.cart}
              renderItem={({ item: cartItem }) => (
                  <View style={styles.cartItemContainer}>
                    <Text style={styles.cartItemName}>{cartItem.product?.title}</Text>
                    <Text style={styles.cartItemQuantity}>
                      Quantity: {cartItem.cart.count}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      Price: {cartItem.product?.price}
                    </Text>
                  </View>
              )}
              keyExtractor={(cartItem) => cartItem.cart.productId}
          />
        </View>
    );
  };

  return (
      <View style={styles.container}>
        <Text style={styles.heading}>Order History</Text>
        {orders.length > 0 ? (
            <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={(item) => item.cart[0].cart.productId}
            />
        ) : (
            <Text style={styles.noOrdersText}>No orders found.</Text>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  orderContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  orderText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  cartItemContainer: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  cartItemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#666",
  },
  noOrdersText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default OrderList;
