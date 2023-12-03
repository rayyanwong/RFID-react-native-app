import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const ParadeStatePage = ({navigation}) => {
  return (
    <View style={styles.pageContainer}>
      <View style={styles.pageHeaderContainer}>
        <Text
          style={{
            color: '#FFF',
            fontSize: 20,
            fontWeight: '500',
            fontFamily: 'OpenSans-Bold',
          }}>
          Parade State
        </Text>
      </View>
      <View style={styles.btnBox}>
        <TouchableOpacity style={styles.btn} onPress={() => {}}>
          <MaterialCommunityIcons
            name="account-multiple"
            size={24}
            color="white"
            paddingLeft={30}
          />
          <Text style={[styles.btnText, styles.accountbtn]}>
            Account Strength
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => {}}>
          <FontAwesome6
            name="clipboard-list"
            size={24}
            color="white"
            paddingLeft={30}
          />
          <Text style={styles.btnText}>Generate Parade State</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageHeaderContainer: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'center',
    backgroundColor: '#c04444',
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#dedbf0',
  },
  btnBox: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#df9696',
    marginTop: 240,
    alignSelf: 'center',
    borderRadius: 60,
    width: Dimensions.get('window').width - 60,
    height: Dimensions.get('window').height / 3,
  },
  btnText: {
    color: 'white',
    fontFamily: 'OpenSans-Medium',
    fontSize: 18,
    paddingLeft: 10,
  },
  btn: {
    backgroundColor: '#c04444',
    width: 280,
    height: 60,
    alignItems: 'center',
    marginVertical: 15,
    borderRadius: 60,
    flexDirection: 'row',
  },
  accountbtn: {
    paddingLeft: 20,
  },
});

export default ParadeStatePage;
