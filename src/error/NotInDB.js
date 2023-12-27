import React from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';

const NotInDB = ({userName}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/not_in_db.png')}
        style={styles.image}
      />
      <Text style={styles.text}>{userName} is not in the database</Text>
      <Text style={styles.text}>
        Please contact the admins if you are experiencing this error
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 60,
  },
  text: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    color: 'black',
  },
});

export default NotInDB;
