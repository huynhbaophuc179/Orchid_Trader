import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { FirebaseAuth } from "../../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
// import type { FirebaseAuthError } from "";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = FirebaseAuth;
  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      alert("Sign in succeed");
      console.log(response);
    } catch (error: any) {
      console.log(error == "auth/invalid-email");
      alert(
        "Sign in failed, Please check your credentials and internet connections."
      );
    } finally {
      setLoading(false);
    }
  };
  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(response);
      alert("Sign up succeed");
    } catch (error: any) {
      console.log(error);
      alert("Sign up failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={style.container}>
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          style={style.input}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
          }}
        ></TextInput>
        <TextInput
          secureTextEntry={true}
          style={style.input}
          placeholder="Password"
          autoCapitalize="none"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
          }}
        ></TextInput>
        {loading ? (
          <ActivityIndicator size={"large"} color="#0000ff" />
        ) : (
          <>
            <View style={{ padding: 10 }}>
              <Button title="Sign In" onPress={signIn} />
            </View>
            <View style={{ padding: 10 }}>
              <Button title="Sign Up" onPress={signUp} />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
const style = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,

    justifyContent: "center",
  },
  input: {
    padding: 10,
  },
});
