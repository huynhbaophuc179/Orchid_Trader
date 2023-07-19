import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
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
          // Get the "orders" collection reference
          const ordersRef = collection(FirebaseStore, "orders");

          // Create a query to filter orders by user UID

          const userOrdersQuery = query(
            ordersRef,
            where("userID", "==", user.uid)
          );

          // Execute the query and get the documents
          const userOrdersQuerySnapshot = await getDocs(userOrdersQuery);

          // Parse the orders data and set it to the state
          const userOrders: OrderState[] = userOrdersQuerySnapshot.docs.map(
            (doc) => doc.data() as OrderState
          );
          console.log(userOrders);
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
    // Render each item in the FlatList, you can customize how you want to display the orders
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
          keyExtractor={(item) => item.cart[0].cart.productId} // Replace "id" with the unique identifier property of each order
        />
      ) : (
        <Text>No orders found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  orderContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderText: {
    fontSize: 14,
    marginBottom: 5,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  cartItemContainer: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cartItemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  cartItemPrice: {
    fontSize: 12,
    color: "#666",
  },
});

export default OrderList;
