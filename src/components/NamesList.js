import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// need to implement handle user details (view their information)
const NamesList = ({data, removeUser}) => {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={() => removeUser(data.userid)}>
        <Ionicons name="trash" size={20} color="#212121" />
      </TouchableOpacity>
      <View>
        <Text style={styles.cardText}>{data.userName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 1,
      height: 3,
    },
    height: 60,
    justifyContent: 'flex-start',
  },
  cardText: {
    color: '#121212',
    fontSize: 16,
    paddingLeft: 8,
    paddingRight: 20,
    maxWidth: '90%',
    marginLeft: 15,
  },
});

export default NamesList;
