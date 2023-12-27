import React from 'react';
import {View, StyleSheet, Image, Text} from 'react-native';

const OfflineErrorView = () => {
  return (
    <View style={styles.pageContainer}>
      <Image
        source={require('../assets/images/no-connection.png')}
        style={{width: 140, height: 140, alignSelf: 'center', marginTop: 140}}
      />
      <Text style={styles.header}>Oops!</Text>
      <Text style={styles.paragraph}>There is no internet connection</Text>
      <Text style={styles.paragraph}>
        Please connect to the internet to access this page
      </Text>
      <Text style={styles.paragraph}>Swipe left to return to main screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#131320',
    alignItems: 'center',
  },
  header: {
    color: 'white',
    fontFamily: 'OpenSans-Bold',
    fontSize: 30,
    marginTop: 100,
    marginBottom: 50,
  },
  paragraph: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'OpenSans-Regular',
  },
});

export default OfflineErrorView;
