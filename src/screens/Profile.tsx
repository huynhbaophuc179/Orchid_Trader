import React, {useState} from "react";
import {View, Text, TextInput, StyleSheet, Button} from "react-native";
import { FirebaseStore } from "../../firebaseConfig";
import {doc, setDoc} from "firebase/firestore";

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
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <Button title="Save Profile" onPress={handleSaveProfile}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 4,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
});

export default Profile;
