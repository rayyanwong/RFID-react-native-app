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
          size={20}
          color="grey"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => func2(data.userid)}
        style={styles.manualBtn2}>
        <MaterialIcons name="remove-moderator" size={20} color="grey" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 1,
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
