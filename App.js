// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import AsyncStoreage from "@react-native-community/async-storage";
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  LogBox,
} from "react-native";
import * as firebase from "firebase";
import { GiftedChat } from "react-native-gifted-chat";
import "firebase/firestore";

firebaseConfig = {
  apiKey: "AIzaSyBI0D7y81ggBgsrsoSJY8xqvgGrWURODYc",
  authDomain: "react-native-chat-2f36d.firebaseapp.com",
  projectId: "react-native-chat-2f36d",
  storageBucket: "react-native-chat-2f36d.appspot.com",
  messagingSenderId: "1077121013285",
  appId: "1:1077121013285:web:f185370aa874f6ef5891cc",
};
// Initialize Firebase

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

const db = firebase.firestore();
const chatsRef = db.collection("chats");

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapShot) => {
      const messagesFirestore = querySnapShot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      appendMsgs(messagesFirestore);
    });
  }, []);

  const readUser = async () => {
    const user = await AsyncStoreage.getItem("user");
    user ? setUser(JSON.parse(user)) : user;
  };

  const handlePress = async () => {
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStoreage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const handleSend = async (msgs) => {
    const writes = msgs.map((msg) => chatsRef.add(msg));
    await Promise.all(writes);
  };

  const appendMsgs = useCallback(
    (msgs) => {
      setMsgs((previousMsgs) => GiftedChat.append(previousMsgs, msgs));
    },
    [msgs]
  );

  return user !== null ? (
    <GiftedChat messages={msgs} user={user} onSend={handleSend} />
  ) : (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Name"
        value={name}
        onChangeText={setName}
      />
      <Button onPress={handlePress} title="Enter the chat" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  input: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    marginBottom: 20,
    padding: 15,
    borderColor: "gray",
  },
});
