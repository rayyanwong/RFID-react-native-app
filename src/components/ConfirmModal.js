import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import AttendanceFlatlist from './ConductDetails/AttendanceFlatlist';

const ConfirmModal = ({visible, setVisible, accFor, noGo, notAccFor}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      avoidKeyboard={false}>
      <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
      <View style={styles.container}>
        <TouchableOpacity style={styles.icon} onPress={() => setVisible(false)}>
          <Entypo name="cross" size={32} color="black" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerText}>Confirm Results</Text>
        </View>
        <AttendanceFlatlist data={[...accFor, ...notAccFor, ...noGo]} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height / 1.5,
    width: '90%',
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 8,
    position: 'absolute',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  btn: {
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginTop: 10,
  },
  icon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  headerText: {
    color: 'black',
    fontSize: 18,
    paddingTop: 40,
    paddingBottom: 40,
    fontFamily: 'OpenSans-Regular',
  },
  header: {
    flexDirection: 'column',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConfirmModal;
