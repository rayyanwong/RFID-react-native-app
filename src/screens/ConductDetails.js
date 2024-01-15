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
import NfcManager, {NfcEvents, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/AndroidPrompt';
import QRCode from 'react-native-qrcode-svg';
import AccountedForFlatList from '../components/AccountedForFlatList';
import NotAccountForFlatList from '../components/NotAccountForFlatList';
import {
  SupaUserStatus,
  SupaConductStatus,
  SupaStatus,
  SupaIpptResult,
  SupaUser,
} from '../../supabase/database';
import NoGoFlatList from '../components/NoGoFlatList';
import useInternetCheck from '../hooks/useInternetCheck';
import OfflineErrorView from '../error/OfflineErrorView';
import ConductingView from './ConductingView';
import Entypo from 'react-native-vector-icons/Entypo';

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
  const [isLoading, setisLoading] = useState(true);
  const [qrModalVisibility, setQRmodalvisibility] = useState(false);
  const qrData = useRef([]);
  const [noGoIdArr, setNoGoIdArr] = useState([]);

  const promptRef = useRef();
  const conductid = props.route.params.data.conductid;
  const conductname = props.route.params.name;
  const conductDBid = props.route.params.data.conductDBid;
  const offlineConduct =
    conductDBid === 22 || conductDBid === 23 ? true : false;
  const isConducting = props.route.params.data.conducting;
  const conductdate = props.route.params.data.conductdate;
  const company = props.route.params.data.company;
  const conductdbuuid = props.route.params.data.conductdbuuid;

  const isOffline = useInternetCheck();
  const {navigation} = props;

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
      `[ConductDetails] You have selected local Conductid: ${conductid} | DB conductid: ${conductDBid} | ConductName: ${conductname} | Conducting: ${isConducting} | ConductDate: ${conductdate} | Company: ${company} | Conduct DB UUID: ${conductdbuuid}`,
    );
    console.log('[offlineConduct]: ', offlineConduct);
    console.log('[isOffline]: ', isOffline);
  }, []);

  useEffect(() => {
    initialFilter2();
    getAccounted();
  }, [isOffline]);

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

  const checkStatusEligible = (statusObj, noGoIdArr) => {
    console.log(statusObj.statusId);
    for (const c of noGoIdArr) {
      if (c.statusid == statusObj.statusId) {
        return 1;
      }
    }
    return 0;
  };

  const initialFilter2 = async () => {
    let tempNoGoIDs = [];
    let tempNotAccFor = [];
    const {data, error} = await SupaConductStatus.getNoGoIdForConduct(
      conductDBid,
    );
    tempNoGoIDs = data;
    console.log('tempNogoids: ', tempNoGoIDs);
    setNoGoIdArr(data);
    db.transaction(tx => {
      tx.executeSql(
        `select attendance.userid, users.userName, users.userNRIC,attendance.forcego from attendance
        inner join users on users.userid=attendance.userid where attendance.accounted=0 and attendance.conductid=(?) and attendance.eligible=1`,
        [conductid],
        async (_, resultSet) => {
          //
          var result = resultSet.rows;
          for (let i = 0; i < result.length; i++) {
            tempNotAccFor.push(result.item(i));
          }
          console.log('tempNotAccFor: ', tempNotAccFor);
          if (offlineConduct) {
            setNotAccFor(tempNotAccFor);
            getNoGoArr();
          } else {
            let filteredNotAcc = [];
            for (let i = 0; i < tempNotAccFor.length; i++) {
              try {
                const {data, error} = await SupaUserStatus.joinUserQuery(
                  tempNotAccFor[i].userNRIC,
                );
                const userStatuses = data[0].Statusid;
                console.log('userstatuses: ', userStatuses);
                if (
                  userStatuses.length === 0 ||
                  tempNotAccFor[i].forcego === 1
                ) {
                  filteredNotAcc.push(tempNotAccFor[i]);
                } else {
                  var tempArr = [];
                  for (const j of userStatuses) {
                    const uneligible = checkStatusEligible(j, tempNoGoIDs);
                    tempArr.push(uneligible);
                  }
                  console.log('tempArr: ', tempArr);
                  if (tempArr.includes(1)) {
                    db.transaction(tx => {
                      tx.executeSql(
                        `UPDATE Attendance set eligible=0
                      where Attendance.userid = (?) and Attendance.conductid =(?) and forcego=0`,
                        [tempNotAccFor[i].userid, conductid],
                        (_, resultSet2) => {
                          if (resultSet2.rowsAffected > 0) {
                            console.log('Successfully updated eligible to 0');
                          }
                        },
                        e => {
                          console.log(e);
                          //
                          //
                        },
                      );
                    });
                  } else {
                    filteredNotAcc.push(tempNotAccFor[i]);
                  }
                }
              } catch (e) {
                filteredNotAcc.push(tempNotAccFor[i]);
              }
              setNotAccFor(filteredNotAcc);
              getNoGoArr();
            }
          }
        },
        e => {
          console.log(e);
        },
      );
    });
    getAccounted();
    setisLoading(false);
  };
  //
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

  const getNoGoArr = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT ATTENDANCE.userid, USERS.userName, USERS.userNRIC FROM ATTENDANCE
        INNER JOIN USERS on USERS.userid = ATTENDANCE.userid WHERE ATTENDANCE.conductid = (?) AND ATTENDANCE.eligible = 0 and attendance.forcego=0`,
        [conductid],
        (txObj, resultSet) => {
          var result = resultSet.rows;
          var curNoGo = [];
          for (let i = 0; i < result.length; i++) {
            curNoGo.push(result.item(i));
          }
          console.log('[getNoGoArr]: pass');
          setNoGo(curNoGo);
        },
        e => {
          console.log('Updating of No GO Arr Error: ', e);
        },
      );
    });
  };

  async function manualAddUser() {
    console.log(notAccFor);
    await db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ATTENDANCE(USERID,CONDUCTID,ACCOUNTED,ELIGIBLE)
        SELECT (SELECT USERID FROM USERS WHERE USERNRIC = (?)),(?),(?),(?)
        WHERE NOT EXISTS (SELECT 1 FROM ATTENDANCE WHERE USERID = (SELECT USERID FROM USERS WHERE USERNRIC = (?)) 
        AND CONDUCTID = (?)) AND  (SELECT USERID FROM USERS WHERE USERNRIC = (?)) IS NOT NULL`,
        [nricinput, conductid, 0, 1, nricinput, conductid, nricinput],
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
            `UPDATE ATTENDANCE SET ACCOUNTED = 1 WHERE USERID = (?) AND CONDUCTID = (?) AND ELIGIBLE=1`,
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
            `UPDATE ATTENDANCE SET ACCOUNTED = 0 WHERE USERID = (?) AND CONDUCTID = (?) AND ELIGIBLE=1`,
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

  async function forceGoManually(userid) {
    await db.transaction(tx => {
      tx.executeSql(
        `UPDATE ATTENDANCE SET ELIGIBLE=1,FORCEGO=1 WHERE USERID=(?) AND CONDUCTID=(?)`,
        [userid, conductid],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Updated eligibility for user is successful');
          }
        },
        e => {
          console.log('ForceGoManually has failed: ', e);
        },
      );
    });
    initialFilter2();
    getAccounted();
  }

  async function noGoManually(userid) {
    await db.transaction(tx => {
      tx.executeSql(
        `UPDATE ATTENDANCE SET ELIGIBLE=0, forcego=0 WHERE USERID=(?) AND CONDUCTID=(?)`,
        [userid, conductid],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Updated eligibility for user to 0 is successful');
          }
        },
        e => {
          console.log('noGoManually has failed: ', e);
        },
      );
    });
    initialFilter2();
    getNoGoArr();
  }

  async function resetNomRoll() {
    var newNotAccFor = [...notAccFor];
    for (let i = 0; i < accFor.length; i++) {
      newNotAccFor.push(accFor[i]);
    }
    await db.transaction(tx => {
      tx.executeSql(
        `UPDATE ATTENDANCE SET accounted = 0 WHERE USERID > 0 AND CONDUCTID = (?) AND ELIGIBLE=1`,
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

  const handleSync = async () => {
    console.log('Accounted for array: ', accFor);
    if ((accFor.length !== 0) & (conductdbuuid !== null)) {
      accFor.forEach(async userObj => {
        let {data, error} = await SupaUser.findUser(userObj.userNRIC);
        if (error) {
          throw error;
        }
        if (data.length !== 0) {
          let {data2, error2} = await SupaIpptResult.updateAttendance(
            conductdbuuid,
            data[0].userid,
            true,
          );
          if (error2) {
            throw error2;
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#5500dc" />
      </View>
    );
  }
  {
    if (!offlineConduct && isOffline) {
      return <OfflineErrorView />;
    } else if (isConducting) {
      return <ConductingView props={props} />;
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <MaterialIcons name="arrow-back-ios" size={16} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: 'OpenSans-Bold',
            fontSize: 14,
            color: 'black',
            marginLeft: 4,
            maxWidth: '45%',
          }}>
          {conductname}
        </Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              await nfcAccountUser();
            }}>
            <MaterialCommunityIcons
              name="credit-card-scan-outline"
              size={16}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setaddModalVisible(true)}>
            <Ionicons name="person-add" size={16} color="black" />
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              generateQRCode();
              setQRmodalvisibility(true);
            }}>
            <Ionicons name="qr-code-outline" size={16} color="black" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              await resetNomRoll();
            }}>
            <MaterialCommunityIcons name="restart" size={16} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              handleSync();
            }}>
            <MaterialCommunityIcons name="cloud-sync" size={16} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={conductDBid === 15 ? styles.actionBtn : {opacity: 0}}
            onPress={() => {
              navigation.navigate('StationMasterView', {conductdbuuid});
            }}
            disabled={conductDBid === 15 ? false : true}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={16}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.listHeader}>Not accounted for</Text>
      </View>
      <NotAccountForFlatList
        notAccFor={notAccFor}
        accountManually={accountManually}
        noGoManually={noGoManually}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.listHeader}>Accounted for</Text>
      </View>
      <AccountedForFlatList
        accFor={accFor}
        unaccountManually={unaccountManually}
        noGoManually={noGoManually}
      />
      {!offlineConduct && (
        <View>
          <View style={styles.headerContainer}>
            <Text style={[styles.listHeader, styles.listHeaderRed]}>No Go</Text>
          </View>
          <NoGoFlatList noGoArr={noGo} forceGoManually={forceGoManually} />
        </View>
      )}
      {offlineConduct && (
        <View>
          <View style={styles.headerContainer}>
            <Text style={styles.listHeader}>Fall out</Text>
          </View>
          <NoGoFlatList noGoArr={noGo} forceGoManually={forceGoManually} />
        </View>
      )}

      <AndroidPrompt ref={promptRef} />
      <Modal visible={addModalVisible} animationType="fade" transparent={true}>
        <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
        <SafeAreaView style={styles.ModalContainer}>
          <View style={styles.ModalHeader}>
            <Text style={styles.ModalTitle}>Add user to conduct</Text>
          </View>
          <TouchableOpacity
            onPress={() => setaddModalVisible(false)}
            style={{position: 'absolute', right: 14, top: 14}}>
            <Entypo name="cross" size={24} color="black" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Enter NRIC of new user"
            placeholderTextColor="grey"
            value={nricinput}
            onChangeText={text => setnricinput(text)}
          />
          <TouchableOpacity style={styles.manualAddbtn} onPress={manualAddUser}>
            <MaterialIcons name="person-search" size={18} color="white" />
            <Text style={styles.manualAddbtnText}>Search User</Text>
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
            {/* <Text style={styles.ModalTitle}>{conductname}'s NR QR Code</Text> */}
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
    backgroundColor: '#fbfcfd',
  },
  pageHeader: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  listHeader: {
    backgroundColor: 'black',
    color: '#FFF',
    fontSize: 14,
    padding: 8,
    fontFamily: 'OpenSans-Bold',
  },
  headerContainer: {
    marginTop: 10,
    marginHorizontal: 15,
  },
  actionBtn: {
    alignItems: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    borderRadius: 6,
    elevation: 2,
    zIndex: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },

  btnContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  ModalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    height: Dimensions.get('window').height / 3,
    alignSelf: 'center',
    marginTop: 120,
  },
  textInput: {
    fontSize: 14,

    marginTop: 30,
    backgroundColor: '#fff',
    width: '80%',
    height: 50,
    textAlign: 'center',
    color: '#000',
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: 'OpenSans-Regular',
  },

  ModalTitle: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
  },
  ModalHeader: {
    marginTop: 24,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  manualAddbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    margin: 30,
    width: '80%',
    marginTop: 30,
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
    fontFamily: 'OpenSans-Bold',
  },
  listHeaderRed: {
    backgroundColor: '#be0000',
  },
});

export default ConductDetails;
