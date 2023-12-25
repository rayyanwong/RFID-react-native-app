import React from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';

const Soldiercard = ({userObj}) => {
  const userNRIC = userObj.userNRIC;
  const userName = userObj.userName;
  const userHPNo = userObj.userHPNo;
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/soldiericon.png')}
        style={styles.imageIcon}
      />
      <View style={styles.infoContainer}>
        <Text
          style={{
            fontFamily: 'OpenSans-Bold',
            color: 'white',
            fontSize: 20,
            paddingBottom: 6,
          }}>
          {userName}
        </Text>
        <Text
          style={{
            fontFamily: 'OpenSans-Regular',
            color: 'white',
            fontSize: 14,
          }}>
          {userNRIC}
        </Text>
        <Text
          style={{
            fontFamily: 'OpenSans-Regular',
            color: 'white',
            fontSize: 14,
          }}>
          {userHPNo}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '95%',
    height: '15%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#36454F',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#36454F',
    elevation: 3,
  },
  imageIcon: {
    width: 60,
    height: 60,
    marginLeft: 24,
    borderWidth: 1,
    borderRadius: 24,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  infoContainer: {
    marginLeft: 24,
  },
});

export default Soldiercard;
