'use strict';

import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ConductingQrScanner = props => {
  const {navigation} = props;
  const height = Dimensions.get('window').height;
  const width = Dimensions.get('window').width;

  const onSuccess = e => {
    console.log(e.data);
  };
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={16} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Scan QR Code</Text>
      </View>
      <View>
        <QRCodeScanner
          reactivate={true}
          showMarker={true}
          markerStyle={{
            borderWidth: 3,
            borderColor: 'white',
            borderRadius: 16,
          }}
          containerStyle={{
            marginTop: 60,
          }}
          cameraStyle={{
            alignSelf: 'center',
            width: '80%',
          }}
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
        />
      </View>
    </View>
  );
};

export default ConductingQrScanner;

const styles = StyleSheet.create({
  container: {flexDirection: 'column'},
  headerContainer: {
    marginHorizontal: 16,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
    marginLeft: 120,
  },
  btn: {
    backgroundColor: 'black',
    width: '80%',
    alignSelf: 'center',
  },
});
