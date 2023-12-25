import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';

const HomeAvatar = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const hour = new Date().getHours();
    setMessage(
      'Good ' +
        ((hour < 12 && 'Morning') || (hour < 18 && 'Afternoon') || 'Evening'),
    );
  });
  return (
    <View style={styles.avatarContainer}>
      <Image
        source={require('../assets/images/guardslogo.png')}
        style={styles.avatarImage}
      />
      <Text style={styles.avatarText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {width: '40%', flexDirection: 'row', alignItems: 'center'},
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 45,
  },
  avatarText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
    marginLeft: 24,
    color: 'black',
  },
});

export default HomeAvatar;
