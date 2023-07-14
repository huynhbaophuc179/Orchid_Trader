import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { NavigationProp, RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ParamListBase } from "@react-navigation/routers";

interface detailProps {
  navigation: NavigationProp<any, any>;
}

interface routeParam {
  product: Product;
}

const Detail: React.FunctionComponent<detailProps> = ({ navigation }) => {
  const route = useRoute();
  const { product } = route.params as routeParam;

  console.log(product.title);
  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.category}>{product.category}</Text>
      </View>
      <View style={styles.lowerContainer}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: product.image }} />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  upperContainer: {
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
  lowerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  image: {
    width: "90%",
    aspectRatio: 1.5,
    borderColor: "black",
    marginHorizontal: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  category: {
    fontSize: 15,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    textAlign: "left",
  },
  descriptionTitle: {
    marginTop: 10,
    fontWeight: "bold",
  },
  description: {
    // marginTop: 10,
  },
});

export default Detail;
