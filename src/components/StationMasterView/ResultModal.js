import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const ResultModal = ({
  stationType,
  visible,
  setVisible,
  handleRecord,
  userObj,
}) => {
  const [value, setValue] = useState();

  const [field, setField] = useState();

  const onChangeText = text => {
    setValue(text);
  };

  const handleSetField = stationType => {
    if (stationType === 1) {
      setField('pushup');
    } else if (stationType === 2) {
      setField('situp');
    } else if (stationType === 3) {
      setField('chipNo');
    }
  };

  useEffect(() => {
    handleSetField(stationType);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      avoidKeyboard={false}>
      <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
      <View style={styles.container}>
        {/* Header to show what station, then respective text */}
        {/* Text input for score / chip input */}
        {/* Save changes button to push to temp arr which keeps amendments */}
        <View style={styles.header}>
          <Text
            style={{color: 'black', fontFamily: 'OpenSans-Bold', fontSize: 18}}>
            {userObj ? userObj.userName : ''}
          </Text>
          {stationType === 1 && (
            <Text style={styles.headerText}>Record pushup reps</Text>
          )}
          {stationType === 2 && (
            <Text style={styles.headerText}>Record situp reps</Text>
          )}
          {stationType === 3 && (
            <Text style={styles.headerText}>Record chip number</Text>
          )}
        </View>
        <TextInput
          onChangeText={text => onChangeText(text)}
          placeholder="Enter result"
          placeholderTextColor="black"
          style={styles.textInput}
          value={value}
        />
        <TouchableOpacity
          style={styles.icon}
          onPress={() => {
            setVisible(false);
            // also need to set the variables later to default value to cancel changes.
          }}>
          <Entypo name="cross" size={24} color="black" />
        </TouchableOpacity>
        {/* <TextInput /> */}
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              handleRecord(userObj.userid, value, field);
              setField();
              setValue();
              setVisible(false);
            }}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'OpenSans-Bold',
                fontSize: 14,
              }}>
              Record score
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height / 3 + 24,
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
    marginTop: 6,
  },
  btn: {
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginTop: 24,
  },
  icon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  headerText: {
    color: 'grey',
    fontSize: 14,
    paddingTop: 40,
    paddingBottom: 40,
    fontFamily: 'OpenSans-Regular',
  },
  header: {
    flexDirection: 'column',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  textInput: {
    backgroundColor: '#D9D9D9',
    width: '80%',
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    borderWidth: 1,
    alignSelf: 'center',
    color: 'black',
  },
});

export default ResultModal;
