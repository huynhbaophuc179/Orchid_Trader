import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TextInput, Button, Avatar } from "react-native-paper";
import {FirebaseAuth, FirebaseStore} from "../../firebaseConfig";
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

    const handleSignOut = async () => {
        try {
            await FirebaseAuth.signOut();
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        source={require("../../assets/avatar.png")}
                        size={120}
                        style={styles.avatar}
                    />
                </View>
                <Button
                    mode="outlined"
                    onPress={() => handleSignOut}
                    style={styles.signOutButton}
                    labelStyle={styles.signOutButtonText}
                    theme={{
                        colors: {
                            primary: "#007AFF",
                        },
                    }}
                >
                    Sign Out
                </Button>
            </View>
            <View style={styles.rightContainer}>
                <Text style={styles.title}>Profile</Text>
                <TextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    theme={{
                        colors: {
                            primary: "#007AFF",
                        },
                    }}
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.input}
                    theme={{
                        colors: {
                            primary: "#007AFF",
                        },
                    }}
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                    theme={{
                        colors: {
                            primary: "#007AFF",
                        },
                    }}
                />
                <Button
                    mode="contained"
                    onPress={handleSaveProfile}
                    style={styles.button}
                    labelStyle={styles.buttonText}
                    theme={{
                        colors: {
                            primary: "#fff",
                        },
                    }}
                >
                    Save Profile
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F9F9F9",
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        backgroundColor: "#fff",
    },
    signOutButton: {
        borderWidth: 1,
        borderColor: "#007AFF",
    },
    signOutButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF",
    },
    rightContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 24,
        width: "100%",
        backgroundColor: "#007AFF",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default Profile;
