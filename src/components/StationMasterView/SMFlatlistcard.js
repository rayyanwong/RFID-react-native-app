import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const SMFlatlistCard = ({
  data,
  handleEdit,
  field,
  handleUserToEdit,
  station,
  disabled,
}) => {
  const text = data[field];
  const [cardColor, setCardColor] = useState('#D9D9D9');

  useEffect(() => {
    if (data.attendance === false) {
      setCardColor('#fffd8d');
    } else {
      // check field if empty
      if (data[station] === null) {
        setCardColor('#ff4545');
      } else if (station === null) {
        setCardColor('#D9D9D9');
      } else {
        setCardColor('#cdffcd');
      }
    }
  });
  return (
    <View>
      <TouchableOpacity style={[styles.card, {backgroundColor: cardColor}]}>
        <Text style={styles.cardText}>{text}</Text>
        <TouchableOpacity
          disabled={disabled}
          onPress={() => {
            handleEdit(true);
            handleUserToEdit(data);
          }}
          style={styles.icon}>
          <FontAwesome5 name="edit" size={18} color="black" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignSelf: 'center',
    width: '95%',
    alignItems: 'center',
    marginTop: 6,
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
