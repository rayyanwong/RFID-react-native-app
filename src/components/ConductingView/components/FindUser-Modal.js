import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import {useDebounce} from '../../../hooks/useDebounce';
import {SupaUser} from '../../../../supabase/database';

const FindUserModal = ({visible, setVisible, handleAddUser, details}) => {
  // console.log('Details are: ', details);
  const [result, setResult] = useState([]);
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 500);
  const onChangeText = text => {
    setValue(text);
  };

  function userInDetail(userid, details) {
    var flag = false;
    details.forEach(detail => {
      const detailArr = detail.detail;
      detailArr.forEach(userObj => {
        if (userObj.userid === userid) {
          flag = true;
        }
      });
    });
    return flag;
  }

  useEffect(() => {
    const fetchData = async () => {
      let {data, error} = await SupaUser.findUser(value.toUpperCase());
      if (data) {
        console.log(data);
        setResult(data);
      } else if (error) {
        console.log(`Error while searching for user in db: ${error}`);
      }
    };
    if (value !== '') {
      fetchData();
    }
  }, [debouncedValue]);

  const componentUnmount = () => {
    setValue('');
    setResult([]);
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      avoidKeyboard={false}>
      <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Search User</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={text => onChangeText(text)}
            placeholder="Enter User NRIC"
            style={styles.textInput}
            value={value}
          />
        </View>
        <View style={styles.textPrompt}>
          {result.length === 0 && value !== '' && (
            <View>
              <Text
                style={{
                  fontFamily: 'OpenSans-Regular',
                  fontSize: 14,
                  color: 'red',
                }}>
                No users found in the database
              </Text>
            </View>
          )}
          {result.length !== 0 && userInDetail(result[0].userid, details) && (
            <View>
              <Text
                style={{
                  fontFamily: 'OpenSans-Regular',
                  fontSize: 14,
                  color: 'red',
                }}>
                User {result[0].userName} is already in a detail
              </Text>
            </View>
          )}
          {result.length !== 0 && !userInDetail(result[0].userid, details) && (
            <View>
              <Text
                style={{
                  fontFamily: 'OpenSans-Regular',
                  fontSize: 14,
                  color: 'green',
                }}>
                User {result[0].userName} is found in the database
              </Text>
            </View>
          )}
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              handleAddUser(result[0]);
              componentUnmount();
            }}>
            <Text style={styles.btnText}>Add to detail</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              setVisible(false);
              setResult([]);
              setValue('');
            }}>
            <Text style={styles.btnText}>Cancel</Text>
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
  header: {alignSelf: 'center', padding: 14},
  headerTitle: {fontFamily: 'OpenSans-Bold', color: 'black', fontSize: 16},
  btn: {
    width: '80%',
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    height: '26%',
    justifyContent: 'center',
    marginVertical: 6,
  },
  btnContainer: {alignItems: 'center', justifyContent: 'center', marginTop: 6},
  btnText: {color: 'white', fontFamily: 'OpenSans-Regular'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#D9D9D9',
    width: '80%',
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    borderWidth: 1,
    alignSelf: 'center',
  },
  searchIcon: {},
  textPrompt: {
    alignSelf: 'center',
    marginTop: 8,
    height: '8%',
  },
});

export default FindUserModal;
