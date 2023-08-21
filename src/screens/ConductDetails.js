import React, {useEffect, useState, useRef} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {openDatabase} from 'react-native-sqlite-storage';
import NfcManager, {NfcEvents, NfcTech, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/AndroidPrompt';

const db = openDatabase({
  name: 'appDatabase',
});

const ConductDetails = props => {
  const [accFor, setAccFor] = useState([]);
  const [notAccFor, setNotAccFor] = useState([]);
  const conductid = props.route.params.data.conductid;
  const [nricinput, setnricinput] = useState(null);
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [hasNfc, setHasNfc] = useState(false);

  useEffect(() => {
    const checkIsSupported = async () => {
      const deviceIsSupported = await NfcManager.isSupported();
      setHasNfc(deviceIsSupported);
      if (deviceIsSupported) {
        console.log('[ConductDetails] NFC is supported');
        await NfcManager.start();
      } else {
        console.log('[ConductDetails] NFC is not supported');
      }
    };
    checkIsSupported();
  }, []);

  useEffect(() => {
    updateAccounted();
    updatenotAccounted();
  });
  const updateAccounted = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ATTENDANCE.userid, USERS.userName FROM ATTENDANCE
         INNER JOIN USERS ON USERS.userid = ATTENDANCE.userid WHERE ATTENDANCE.accounted = 1 AND ATTENDANCE.conductid = (?)`,
        [conductid],
        (txObj, resultSet) => {
          var result = resultSet.rows;
          var curAccounted = [];
          for (let i = 0; i < result.length; i++) {
            curAccounted.push(result.item(0));
          }
          setAccFor(curAccounted);
        },
        e => {
          console.log('Update error', e);
        },
      );
    });
  };

  const updatenotAccounted = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ATTENDANCE.userid, USERS.userName FROM ATTENDANCE
         INNER JOIN USERS ON USERS.userid = ATTENDANCE.userid WHERE ATTENDANCE.accounted = 0 AND ATTENDANCE.conductid = (?)`,
        [conductid],
        (txObj, resultSet) => {
          var result = resultSet.rows;
          var curNotAccounted = [];
          for (let i = 0; i < result.length; i++) {
            curNotAccounted.push(result.item(0));
          }
          setNotAccFor(curNotAccounted);
        },
        e => {
          console.log('Update error', e);
        },
      );
    });
  };

  const manualAddUser = () => {
    // find if user exists in db first
    // if exists in Attendance alr then can catch error
    db.transaction(tx => {
      tx.executeSql(
        `SELECT userid FROM USERS where userNRIC = (?)`,
        [nricinput],
        (txObj, resultSet) => {
          console.log(resultSet);
          if (resultSet.rows.length === 1) {
            var userid = resultSet.rows.item(0).userid;
            // check if is in attendance
            if (userid) {
              db.transaction(tx => {
                tx.executeSql(
                  `INSERT INTO ATTENDANCE(userid,conductid,accounted) VALUES (?,?,?)`,
                  [userid, conductid, 0],
                  (txObj, resultSet) => {
                    if (resultSet.rowsAffected > 0) {
                      // need to RELOAD the FLATLIST HERE.
                      updateAccounted();
                      updatenotAccounted();
                      Alert.alert(
                        'User has been added into nominal roll for this conduct',
                      );
                    } else {
                      Alert.alert('Nothing happened...');
                    }
                  },
                  error => {
                    console.log(error);
                  },
                );
              });
            }
          } else {
            Alert.alert('User cannot be found in database');
          }
        },
        error => {
          console.log(error);
        },
      );
    });

    setnricinput(null);
    setaddModalVisible(false);
  };

  const resetNomRoll = () => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE ATTENDANCE SET accounted = 0 WHERE userid > 0`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            updateAccounted();
            updatenotAccounted();
          }
        },
        error => {
          console.log(error);
        },
      );
    });
    Alert.alert('Nominal roll has been reset');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.listHeader}>Not accounted for</Text>
      </View>
      <FlatList
        style={styles.notAccountedContainer}
        data={notAccFor}
        keyExtractor={item => String(item.userName + item.userid)}
        renderItem={({item}) => {}}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.listHeader}>Accounted for</Text>
      </View>
      <FlatList style={styles.accountedContainer} data={accFor} />

      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
          <MaterialCommunityIcons
            name="credit-card-scan-outline"
            size={30}
            color="white"
          />
          <Text style={{color: 'white', marginTop: 10, fontSize: 12}}>
            Scan cadet tag
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setaddModalVisible(true)}>
          <Ionicons name="person-add" size={30} color="white" />
          <Text style={{color: 'white', marginTop: 10, fontSize: 12}}>
            Add manually
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={resetNomRoll}>
          <MaterialCommunityIcons name="restart" size={30} color="white" />
          <Text style={{color: 'white', marginTop: 10, fontSize: 12}}>
            Unaccount all
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={addModalVisible} animationType="fade">
        <SafeAreaView style={styles.addModalContainer}>
          <View style={styles.addModalHeader}>
            <TouchableOpacity onPress={() => setaddModalVisible(false)}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.addModalTitle}>
              Manually add user from database
            </Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter NRIC of new user to search for"
            placeholderTextColor="grey"
            value={nricinput}
            onChangeText={text => setnricinput(text)}
          />
          <TouchableOpacity style={styles.manualAddbtn} onPress={manualAddUser}>
            <MaterialIcons name="person-search" size={24} color="white" />
            <Text style={styles.manualAddbtnText}>Find user in database</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#dedbf0',
    alignContent: 'center',
  },
  notAccountedContainer: {
    flexGrow: 0,
    height: Dimensions.get('screen').height / 4,
    backgroundColor: 'white',
    marginHorizontal: 15,
  },
  accountedContainer: {
    flexGrow: 0,
    height: Dimensions.get('screen').height / 4,
    backgroundColor: 'white',
    marginHorizontal: 15,
  },
  listHeader: {
    backgroundColor: '#493c90',
    color: '#FFF',
    fontSize: 16,
    padding: 10,
    fontWeight: 'bold',
  },
  headerContainer: {
    borderWidth: 1,
    marginTop: 15,
    marginHorizontal: 15,
  },
  actionBtn: {
    alignItems: 'center',
    width: 100,
    height: 100,
    backgroundColor: '#493c90',
    justifyContent: 'center',
    borderRadius: 30,
    elevation: 2,
    zIndex: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
    marginTop: 40,
  },

  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    alignContent: 'space-between',
    justifyContent: 'center',
  },
  addModalContainer: {
    backgroundColor: '#dedbf0',
    flex: 1,
  },
  textInput: {
    fontSize: 15,
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 9,
    height: 50,
    textAlignVertical: 'center',
    color: '#000',
    borderRadius: 10,
  },

  addModalTitle: {
    color: '#FFF',
    fontSize: 20,
    marginLeft: 15,
    fontWeight: '500',
  },
  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#bdb7e1',
  },
  manualAddbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#493c90',
    margin: 30,
    marginTop: 50,
    borderRadius: 8,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },
  manualAddbtnText: {
    padding: 18,
    fontSize: 14,
    color: '#FFF',
  },
});

export default ConductDetails;
