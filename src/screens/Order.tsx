import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";

const Order = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleOrderSubmit = () => {
    setName("");
    setAddress("");
    setPhoneNumber("");
  };

  return (
      <View style={styles.container}>
        <Text style={styles.heading}>Order Form</Text>
        <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={(text) => setName(text)}
        />
        <TextInput
            style={styles.input}
            placeholder="Address"
            value={address}
            onChangeText={(text) => setAddress(text)}
        />
        <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleOrderSubmit}>
          <Text style={styles.buttonText}>Submit Order</Text>
        </TouchableOpacity>
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
    backgroundColor: "#ff6f00",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Order;
