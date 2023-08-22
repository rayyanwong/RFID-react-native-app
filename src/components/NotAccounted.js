import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const NotAccounted = ({data, accountManually, removeFromNR}) => {
  return (
    <View style={styles.cardContainer}>
      <View>
        <Text style={styles.cardText}>{data.userName}</Text>
      </View>
      <TouchableOpacity onPress={() => {}} style={styles.accountManuallyBtn}>
        <MaterialCommunityIcons name="account-check" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D5E3F0',
    borderRadius: 5,
    padding: 10,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 1,
      height: 3,
    },
    height: 40,
    justifyContent: 'flex-start',
  },
  cardText: {
    color: '#121212',
    fontSize: 14,
    paddingLeft: 8,
    paddingRight: 20,
    maxWidth: '90%',
    marginLeft: 15,
    fontWeight: 'bold',
  },
  accountManuallyBtn: {
    position: 'absolute',
    right: 20,
  },
});

export default NotAccounted;
