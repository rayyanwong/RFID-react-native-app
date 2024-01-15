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
        <TouchableOpacity onPress={() => handleDelete(data)}>
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
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 10,
    elevation: 5,
    shadowColor: '#001919',
    shadowOpacity: 1,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    height: 60,
    justifyContent: 'flex-start',
    marginHorizontal: 14,
  },
  conducts: {
    color: '#121212',
    fontSize: 14,
    paddingLeft: 8,
    paddingRight: 0,
    // maxWidth: '90%',
    marginLeft: 15,
    fontFamily: 'OpenSans-Bold',
  },
});
