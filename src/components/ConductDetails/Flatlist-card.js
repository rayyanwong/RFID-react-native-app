import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const FlatlistCard = ({userObj, handleClick, handleGo}) => {
  const [cardColor, setCardColor] = useState('#D9D9D9');
  const [iconName, setIconName] = useState('person-add');

  useEffect(() => {
    if (userObj.eligible === 0) {
      setCardColor('#ff4545');
    } else if (userObj.accounted === 1) {
      setCardColor('#cdffcd');
      setIconName('person-remove');
    } else if (userObj.accounted === 0) {
      setCardColor('#d9d9d9');
      setIconName('person-add');
    }
  }, [userObj.accounted, userObj.forceGo, userObj]);
  return (
    <View style={[styles.card, {backgroundColor: cardColor}]}>
      <Text style={styles.cardText}>{userObj.userName}</Text>
      <TouchableOpacity
        onPress={handleClick}
        style={{position: 'absolute', left: 10, top: 6}}>
        <MaterialIcons name={iconName} color="grey" size={24} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleGo}
        style={{position: 'absolute', right: 10, top: 6}}>
        <Feather
          name={
            userObj.forcego === 1
              ? 'shield-off'
              : userObj.forcego === 0 && userObj.eligible === 1
              ? 'shield-off'
              : 'shield'
          }
          color="grey"
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {alignSelf: 'center', width: '95%', borderRadius: 8, marginTop: 6},
  cardText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
    color: 'black',
    paddingVertical: 10,
    alignSelf: 'center',
  },
});

export default FlatlistCard;
