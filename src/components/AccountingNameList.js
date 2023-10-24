import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const AccountingNameList = ({data, func, func2, choice}) => {
  return (
    <View style={styles.cardContainer}>
      <View>
        <Text style={styles.cardText}>{data.userName}</Text>
      </View>
      <TouchableOpacity
        onPress={() => func(data.userid)}
        style={styles.manualBtn}>
        <MaterialCommunityIcons
          name={choice === 'notacc' ? 'account-check' : 'account-minus'}
          size={24}
          color="grey"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => func2(data.userid)}
        style={styles.manualBtn2}>
        <MaterialIcons name="remove-moderator" size={24} color="grey" />
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
    justifyContent: 'space-between',
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
  manualBtn: {
    position: 'absolute',
    right: 10,
  },
  manualBtn2: {
    position: 'absolute',
    right: 40,
  },
});

export default AccountingNameList;
