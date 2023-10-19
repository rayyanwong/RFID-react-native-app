import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ConductList({
  data,
  handleDelete,
  handleConductDetails,
}) {
  return (
    <View>
      <TouchableOpacity
        style={styles.container}
        onPress={() => handleConductDetails(data)}>
        <TouchableOpacity onPress={() => handleDelete(data.conductid)}>
          <Ionicons name="trash" size={20} color="#212121" />
        </TouchableOpacity>
        <View>
          <Text style={styles.conducts}>{data.conductName} </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  conducts: {
    color: '#121212',
    fontSize: 16,
    paddingLeft: 8,
    paddingRight: 0,
    maxWidth: '90%',
    marginLeft: 15,
  },
});
