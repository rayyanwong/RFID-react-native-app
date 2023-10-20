import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {openDatabase} from 'react-native-sqlite-storage';
import NfcManager, {NfcEvents, NfcTech, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/AndroidPrompt';
import QRCode from 'react-native-qrcode-svg';
import AccountedForFlatList from '../components/AccountedForFlatList';
import NotAccountForFlatList from '../components/NotAccountForFlatList';
import {
  SupaUserStatus,
  SupaConductStatus,
  SupaUser,
} from '../../supabase/database';
const db = openDatabase({
  name: 'appDatabase',
});

const ConductDetails = props => {
  // state init
  const [accFor, setAccFor] = useState([]);
  const [notAccFor, setNotAccFor] = useState([]);
  const [noGo, setNoGo] = useState([]);
  const [nricinput, setnricinput] = useState(null);
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [hasNfc, setHasNfc] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [qrModalVisibility, setQRmodalvisibility] = useState(false);
  const qrData = useRef([]);
  const [noGoIdArr, setNoGoIdArr] = useState([]);
  //console.log(props);
  //variable init
  const promptRef = useRef();
  const conductid = props.route.params.data.conductid;
  const conductname = props.route.params.name;
  const conductDBid = props.route.params.data.conductDBid;
  const offlineConduct =
    conductDBid === 22 || conductDBid === 23 ? true : false;
  //console.log('Is offline?: ', offlineConduct);
  console.log('No GO list: ', noGo);
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
    console.log(
      `[ConductDetails] You have selected local Conductid: ${conductid} | DB conductid: ${conductDBid} | ConductName: ${conductname} `,
    );
  }, []);

  useEffect(() => {
    const initialiseNoGoID = async () => {
      const {data, error} = await SupaConductStatus.getNoGoIdForConduct(
        conductDBid,
      );
      if (!error) {
        setNoGoIdArr(data);
        console.log('Ids are: ', data);
      } else {
        console.log('Error init: ', error);
      }
    };
    initialiseNoGoID();
    setisLoading(true);
    initialFilter();
    getAccounted();
    getnotAccounted();
    setisLoading(false);
  }, []);

  const getAttendance = () => {
    db.transaction(tx => {
      tx.executeSql(
        `select * from attendance where conductid = (?)`,
        [conductid],
        (_, res) => {
          for (let i = 0; i < res.rows.length; i++) {
            console.log(res.rows.item(i));
          }
        },
      );
    });
  };

  const checkStatusEligible = statusObj => {
    //console.log(statusObj);
    //console.log(statusObj.statusId);
    for (const c of noGoIdArr) {
      // console.log(
      //   'Checking ',
      //   c.statusid,
      //   'with statusid: ',
      //   statusObj.statusId,
      // );
      if (c.statusid == statusObj.statusId) {
        return 1;
      }
    }
    return 0;
  };

  const initialFilter = async () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ATTENDANCE.userid, USERS.userName, USERS.userNRIC from Attendance
        inner join Users on Users.userid = Attendance.userid where
        Attendance.accounted=0 and Attendance.conductid=(?)`,
        [conductid],
        (txObj, resultSet) => {
          var result = resultSet.rows;
          var curNotAccounted = [];
          for (let i = 0; i < result.length; i++) {
            curNotAccounted.push(result.item(i));
          }
          setNotAccFor(curNotAccounted);
        },
        e => {
          console.log(e);
        },
      );
    });
    if (!offlineConduct) {
      var filteredNotAcc = [];
      var curNotAccounted = [...notAccFor];
      var curNoGo = [];
      //
      for (let i = 0; i < curNotAccounted.length; i++) {
        const {data, error} = await SupaUserStatus.joinUserQuery(
          curNotAccounted[i].userNRIC,
        );
        const userStatuses = data[0].Statusid;
        console.log(userStatuses);
        if (userStatuses.length === 0) {
          filteredNotAcc.push(curNotAccounted[i]);
        } else {
          var tempArr = [];
          for (const j of userStatuses) {
            const uneligible = checkStatusEligible(j);
            tempArr.push(uneligible);
          }
          if (tempArr.includes(1)) {
            //curNoGo.push(curNotAccounted[i]);
            db.transaction(tx => {
              tx.executeSql(
                `UPDATE Attendance set eligible=0
              where Attendance.userid = (?) and Attendance.conductid =(?) `,
                [curNotAccounted[i].userid, conductid],
                (_, resultSet) => {
                  if (resultSet.rowsAffected > 0) {
                    console.log('Successfully updated eligible to 0');
                  }
                },
                e => {
                  console.log(e);
                },
              );
            });
          }
        }
      }
      getnotAccounted();
    }
  };

  // const initialFilter = async () => {
  //   // CHECK IF IS ONLINE CONDUCT
  //   //RETRIEVE ATTENDANCE DATA
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       `SELECT ATTENDANCE.userid, USERS.userName, USERS.userNRIC FROM ATTENDANCE
  //         INNER JOIN USERS on USERS.userid = ATTENDANCE.userid WHERE ATTENDANCE.accounted=0 and ATTENDANCE.conductid=(?)`,
  //       [conductid],
  //       async (txObj, resultSet) => {
  //         var result = resultSet.rows;
  //         var curNotAccounted = [];
  //         var curNoGo = [];
  //         for (let i = 0; i < result.length; i++) {
  //           if (offlineConduct) {
  //             curNotAccounted.push(result.item(i));
  //           } else {
  //             console.log(result.item(i).userNRIC);
  //             const {data, error} = await SupaUserStatus.joinUserQuery(
  //               result.item(i).userNRIC,
  //             );
  //             console.log(data);
  //             const statusIds = data[0].Statusid;
  //             //{"Statusid":[Obj], "userid": int}
  //             if (statusIds.length === 0) {
  //               curNotAccounted.push(result.item(i));
  //             } else {
  //               // CHECK FOR EACH STATUS
  //               for (const j of statusIds) {
  //                 var uneligible = checkStatusEligible(j);
  //                 console.log('Logging: ', uneligible);
  //                 if (uneligible) {
  //                   break;
  //                 }
  //               }
  //               if (uneligible) {
  //                 curNoGo.push(result.item(i));
  //               } else {
  //                 curNotAccounted.push(result.item(i));
  //               }
  //             }
  //           }
  //         }
  //         setNoGo(curNoGo);
  //         setNotAccFor(curNotAccounted);
  //       },
  //       error => {
  //         console.log('[ConductDetails][initialFilter] error: ', error);
  //       },
  //     );
  //   });
  // };
  const getAccounted = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ATTENDANCE.userid, USERS.userName, USERS.userNRIC FROM ATTENDANCE
         INNER JOIN USERS ON USERS.userid = ATTENDANCE.userid WHERE ATTENDANCE.accounted = 1 AND ATTENDANCE.conductid = (?) AND ATTENDANCE.eligible=1`,
        [conductid],
        (txObj, resultSet) => {
          var result = resultSet.rows;
          var curAccounted = [];
          for (let i = 0; i < result.length; i++) {
            curAccounted.push(result.item(i));
          }
          setAccFor(curAccounted);
        },
        e => {
          console.log('Update error', e);
        },
      );
    });
  };

  const getnotAccounted = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ATTENDANCE.userid, USERS.userName, USERS.userNRIC FROM ATTENDANCE
         INNER JOIN USERS ON USERS.userid = ATTENDANCE.userid WHERE ATTENDANCE.accounted = 0 AND ATTENDANCE.conductid = (?) and Attendance.eligible=1`,
        [conductid],
        (txObj, resultSet) => {
          var result = resultSet.rows;
          var curNotAccounted = [];
          for (let i = 0; i < result.length; i++) {
            curNotAccounted.push(result.item(i));
          }
          setNotAccFor(curNotAccounted);
        },
        e => {
          console.log('Update error', e);
        },
      );
    });
  };

  async function manualAddUser() {
    console.log(notAccFor);
    await db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ATTENDANCE(USERID,CONDUCTID,ACCOUNTED)
        SELECT (SELECT USERID FROM USERS WHERE USERNRIC = (?)),(?),(?)
        WHERE NOT EXISTS (SELECT 1 FROM ATTENDANCE WHERE USERID = (SELECT USERID FROM USERS WHERE USERNRIC = (?)) 
        AND CONDUCTID = (?)) AND  (SELECT USERID FROM USERS WHERE USERNRIC = (?)) IS NOT NULL`,
        [nricinput, conductid, 0, nricinput, conductid, nricinput],
        (_, resultSet) => {
          console.log(resultSet);
          if (resultSet.rowsAffected === 1) {
            console.log('Insert of user is successful');
            getnotAccounted();
          } else {
            console.log('No changes');
          }
        },
        error => {
          console.log(error);
        },
      );
    });
    setnricinput(null);
    setaddModalVisible(false);
  }

  async function accountManually(userid) {
    var newAccFor = [...accFor];
    var newNotAccFor = [];
    for (let i = 0; i < notAccFor.length; i++) {
      if (notAccFor[i].userid === userid) {
        newAccFor.push(notAccFor[i]);
        await db.transaction(tx => {
          tx.executeSql(
            `UPDATE ATTENDANCE SET ACCOUNTED = 1 WHERE USERID = (?) AND CONDUCTID = (?)`,
            [userid, conductid],
            (txObj, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                console.log('User has been accounted for');
                //Alert.alert(`${notAccFor[i].userName} has been accounted for`);
              }
            },
            error => {
              console.log(error);
            },
          );
        });
      } else {
        newNotAccFor.push(notAccFor[i]);
      }
    }
    setAccFor(newAccFor);
    setNotAccFor(newNotAccFor);
  }

  async function unaccountManually(userid) {
    var newAccFor = [];
    var newNotAccFor = [...notAccFor];
    for (let i = 0; i < accFor.length; i++) {
      if (accFor[i].userid === userid) {
        newNotAccFor.push(accFor[i]);
        await db.transaction(tx => {
          tx.executeSql(
            `UPDATE ATTENDANCE SET ACCOUNTED = 0 WHERE USERID = (?) AND CONDUCTID = (?)`,
            [userid, conductid],
            (txObj, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                console.log('User has been unaccounted');
                // Alert.alert(`${accFor[i].userName} has been unaccounted`);
              }
            },
          );
        });
        //db
      } else {
        newAccFor.push(accFor[i]);
      }
    }
    setAccFor(newAccFor);
    setNotAccFor(newNotAccFor);
  }

  async function resetNomRoll() {
    var newNotAccFor = [...notAccFor];
    for (let i = 0; i < accFor.length; i++) {
      newNotAccFor.push(accFor[i]);
    }
    await db.transaction(tx => {
      tx.executeSql(
        `UPDATE ATTENDANCE SET accounted = 0 WHERE USERID > 0 AND CONDUCTID = (?)`,
        [conductid],
        (txObj, resultSet) => {
          console.log('Nominal roll has been reset');
        },
        error => {
          console.log(error);
        },
      );
    });
    console.log('Reset');
    setAccFor([]);
    setNotAccFor(newNotAccFor);
  }

  async function nfcAccountUser() {
    await NfcManager.registerTagEvent();
    if (Platform.OS === 'android') {
      promptRef.current.setPromptVisible(true);
      promptRef.current.setHintText('Please scan your NFC');
    }
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      try {
        var newTag = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
        const [newName, newNRIC, newHPNo] = newTag.split(',');
        console.log(newName, newNRIC, newHPNo);
        var newNotAccFor = [];
        var newAccFor = [...accFor];
        for (let i = 0; i < notAccFor.length; i++) {
          if (
            notAccFor[i].userNRIC === newNRIC &&
            notAccFor[i].userName === newName
          ) {
            // do update query
            var userid = notAccFor[i].userid;
            db.transaction(tx => {
              tx.executeSql(
                `UPDATE ATTENDANCE SET ACCOUNTED = 1 WHERE USERID = (?) AND CONDUCTID = (?)`,
                [userid, conductid],
                (txObj, resultSet) => {
                  console.log(`${newName} has been accounted for`);
                },
                error => {
                  console.log(error);
                },
              );
            });
            newAccFor.push(notAccFor[i]);
          } else {
            newNotAccFor.push(notAccFor[i]);
          }
        }
        setAccFor(newAccFor);
        setNotAccFor(newNotAccFor);
      } catch (e) {
        console.warn(e);
      } finally {
        promptRef.current.setPromptVisible(false);
        promptRef.current.setHintText('');
        NfcManager.unregisterTagEvent().catch(() => 0);
      }
    });
  }

  const generateQRCode = () => {
    var tempData = [];
    var tempAccFor = [...accFor];
    // conducting will scan tag to check against db -> primary key
    // store a list of nrics that can check in db with the user data.
    for (let i = 0; i < tempAccFor.length; i++) {
      tempData.push(tempAccFor[i].userNRIC);
    }
    qrData.current = tempData;
    console.log(qrData.current);
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.listHeader}>Not accounted for</Text>
      </View>
      <NotAccountForFlatList
        notAccFor={notAccFor}
        accountManually={accountManually}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.listHeader}>Accounted for</Text>
      </View>
      <AccountedForFlatList
        accFor={accFor}
        unaccountManually={unaccountManually}
      />
      {!offlineConduct && <Text>This is an online conduct</Text>}

      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            await nfcAccountUser();
          }}>
          <MaterialCommunityIcons
            name="credit-card-scan-outline"
            size={24}
            color="white"
          />
          <Text style={{color: 'white', marginTop: 10, fontSize: 10}}>
            Scan cadet tag
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setaddModalVisible(true)}>
          <Ionicons name="person-add" size={24} color="white" />
          <Text style={{color: 'white', marginTop: 10, fontSize: 10}}>
            Add manually
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            generateQRCode();
            setQRmodalvisibility(true);
          }}>
          <Ionicons name="qr-code-outline" size={24} color="white" />
          <Text style={{color: 'white', marginTop: 10, fontSize: 10}}>
            Create QRCode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={async () => {
            await resetNomRoll();
          }}>
          <MaterialCommunityIcons name="restart" size={24} color="white" />
          <Text style={{color: 'white', marginTop: 10, fontSize: 10}}>
            Unaccount all
          </Text>
        </TouchableOpacity>
      </View>
      <AndroidPrompt ref={promptRef} />
      <Modal visible={addModalVisible} animationType="fade">
        <SafeAreaView style={styles.ModalContainer}>
          <View style={styles.ModalHeader}>
            <TouchableOpacity onPress={() => setaddModalVisible(false)}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.ModalTitle}>
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
      <Modal visible={qrModalVisibility} animationType="fade">
        <SafeAreaView style={styles.ModalContainer}>
          <View style={styles.ModalHeader}>
            <TouchableOpacity onPress={() => setQRmodalvisibility(false)}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.ModalTitle}>{conductname}'s NR QR Code</Text>
          </View>
          <QRCode size={200} value={qrData.current.toString() || []} />
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
    width: 80,
    height: 80,
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
  ModalContainer: {
    backgroundColor: '#dedbf0',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  ModalTitle: {
    color: '#FFF',
    fontSize: 20,
    marginLeft: 15,
    fontWeight: '500',
  },
  ModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#bdb7e1',
    position: 'absolute',
    width: Dimensions.get('screen').width,
    zIndex: 10,
    top: 0,
  },
  manualAddbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#493c90',
    margin: 30,
    width: Dimensions.get('screen').width / 2,
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
