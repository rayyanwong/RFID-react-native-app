import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const SMFlatlistCard = ({data, handleClick, field}) => {
  // {detailName: , participants}
  const text = data[field];
  return (
    <View>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>{text}</Text>
        <TouchableOpacity onPress={handleClick} style={styles.icon}>
          <FontAwesome5 name="edit" size={18} color="black" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    width: '95%',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
  },
  cardText: {
    color: 'black',
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    alignSelf: 'center',
  },
  icon: {position: 'absolute', right: '5%', top: '26%'},
});

export default SMFlatlistCard;
