import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button, Avatar } from "react-native-paper";
import { FirebaseStore } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const Profile = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const handleSaveProfile = async () => {
        try {
            const userRef = doc(FirebaseStore, "users", "userId"); // Replace "userId" with the actual user ID
            await setDoc(userRef, {
                name,
                email,
                phone,
            });

            // Success notification or navigation
            console.log("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.avatarContainer}>
                <Avatar.Image
                    source={require("../../assets/avatar.png")}
                    size={120}
                    style={styles.avatar}
                />
            </View>
            <View style={styles.formContainer}>
                <TextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.input}
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                />
            </View>
            <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={styles.button}
                labelStyle={styles.buttonText}
            >
                Save Profile
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f2f2f2",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
        alignSelf: "center",
    },
    avatarContainer: {
        marginBottom: 24,
        alignItems: "center",
    },
    avatar: {
        backgroundColor: "white",
    },
    formContainer: {
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    button: {
        alignSelf: "center",
        borderRadius: 8,
        marginBottom: 16,
        width: "60%",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Profile;
