import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const FlatlistCard = ({data, onPress, handleDelete, field}) => {
  // {detailName: , participants}
  const text = data[field];
  return (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.card}>
        <Text style={styles.cardText}>{text}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.cross}>
          <Entypo name="cross" size={18} style={styles.cross} color="black" />
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
  cross: {position: 'absolute', right: '5%', top: '26%'},
});

export default FlatlistCard;
