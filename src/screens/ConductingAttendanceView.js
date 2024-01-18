import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useIsFocused} from '@react-navigation/native';
import NfcManager, {NfcEvents, NfcTech, Ndef} from 'react-native-nfc-manager';

import AndroidPrompt from '../components/AndroidPrompt';
import AttendanceFlatlist from '../components/ConductingAttendanceView/AttendanceFlatlist';
import Dropdown from '../components/StationMasterView/Dropdown';
import {
  SupaConductStatus,
  SupaIpptResult,
  SupaUserStatus,
} from '../../supabase/database';

const ConductingAttendanceView = props => {
  const {navigation} = props;
  const isFocused = useIsFocused();
  const conductdbuuid = props.route.params.conductdbuuid;
  const [details, setDetails] = useState([]);
  const [nominalRoll, setNominalRoll] = useState([]); // Arr of objects
  const [tnominalRoll, setTNominalRoll] = useState([]);
  const [flatlistData, setFlatlistData] = useState([]);
  const [detailNames, setDetailNames] = useState(['All']);
  const [markAllText, setMarkAllText] = useState('Account all');
  const [madeChanges, setMadeChanges] = useState(false);
  const [selected, setSelected] = useState('All');
  const promptRef = useRef();

  function groupBy(xs, f) {
    return xs.reduce(
      (r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r),
      {},
    );
  }

  const handleClick = userObj_prop => {
    // console.log(userObj_prop);
    // TODO: CHECK IF HE IS GO OR NO GO
    let temp = [...tnominalRoll];
    temp.forEach(userObj => {
      if ((userObj.userid === userObj_prop.userid) & (userObj.noGo === null)) {
        userObj.attendance = !userObj.attendance;
      } else if (
        (userObj.noGo === true) &
        (userObj.userid === userObj_prop.userid)
      ) {
        console.log('No GO: ', userObj.userName);
      }
    });

    setTNominalRoll(temp);
    handleSelectStateArr();
    setMadeChanges(true);
    console.log('Temp: ', temp);
    //TODO: Handle flatlist data
  };

  const handleGo = userObj_prop => {
    let temp = [...tnominalRoll];
    temp.forEach(userObj => {
      if ((userObj.userid === userObj_prop.userid) & (userObj.noGo === null)) {
        userObj.noGo = true;
      } else if (
        (userObj.userid === userObj_prop.userid) &
        (userObj.noGo === true)
      ) {
        userObj.noGo = null;
      }
    });
    setMadeChanges(true);
    setTNominalRoll(temp);
    handleSelectStateArr();
    // TODO: Handle flatlist data
  };

  const handleCheckAll = () => {
    let temp = [...tnominalRoll];
    if (markAllText === 'Account all') {
      // account all
      temp.forEach(userObj => {
        userObj.attendance = true;
      });
    } else if (markAllText === 'Unaccount all') {
      //unaccount all
      console.log('unaccounting');
      temp.forEach(userObj => {
        userObj.attendance = false;
      });
    }
    setTNominalRoll(temp);
    setFlatlistData(temp);
    setMadeChanges(true);
    // TODO: handle flatlist data;
  };

  const handleConfirm = async () => {
    // go through each userObj
    // update their attendance field to bool
    // update their noGo
    // set main nominal roll to tNominalRoll
    tnominalRoll.forEach(async userObj => {
      const {data, error} = await SupaIpptResult.updateAttendance(
        conductdbuuid,
        userObj.userid,
        userObj.attendance,
      );
      if (error) {
        console.log('[HandleConfirm] while handling updateAttendance: ', error);
      }
      const {data2, error2} = await SupaIpptResult.updateNoGo(
        conductdbuuid,
        userObj.userid,
        userObj.noGo,
      );
      if (error2) {
        console.log('[HandleConfirm] while handling updateNoGo: ', error2);
      }
    });
    setNominalRoll(tnominalRoll);
    var grouped = groupBy(tnominalRoll, obj => obj.detail);
    // console.log(grouped);
    setDetails(grouped);
    setMadeChanges(false);
    Alert.alert('Successfully updated attendance into backend');
  };

  const handleRFID = async () => {
    await NfcManager.registerTagEvent();
    if (Platform.OS === 'android') {
      promptRef.current.setPromptVisible(true);
      promptRef.current.setHintText('Please scan your NFC');
    }
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      try {
        var newTag = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
        const [newName, newNRIC, newHPNo, ipptGo] = newTag.split(',');
        // find userObj
        // use handleClick
        let tmp = {};
        tnominalRoll.forEach(userObj => {
          if (userObj.userNRIC === newNRIC) {
            tmp = userObj;
          }
        });
        if (ipptGo === '1') {
          handleClick(tmp);
        } else if (ipptGo === '0') {
          // check with user if want to still allow him to do or put as no go

          Alert.alert(
            'Error',
            'User is unable to participate in IPPT. Would you like him to continue participating in the conduct?',
            [
              {text: 'Force go', onPress: () => handleClick(tmp)},
              {text: 'Mark as no go', onPress: () => handleGo(tmp)},
            ],
          );
        }
        console.log('handleRFID success');
      } catch (e) {
        console.warn(e);
      } finally {
        NfcManager.unregisterTagEvent().catch(() => 0);
        promptRef.current.setHintText('');
        promptRef.current.setPromptVisible(false);
      }
    });
  };

  const handleSelectStateArr = () => {
    //check state
    // if all, data remains
    // else, filter data and set proper state
    if (selected === 'All') {
      let tmp = [...tnominalRoll];
      setFlatlistData(tmp);
    } else {
      let tmp = [...tnominalRoll];
      tmp = tmp.filter(userObj => {
        return userObj.detail === selected;
      });
      setFlatlistData(tmp);
    }
  };
  const handleSelect = selectedItem => {
    // setSelected(selectedItem);
    if (selectedItem === 'All') {
      let tmp = [...tnominalRoll];
      setFlatlistData(tmp);
    } else {
      let tmp = [...tnominalRoll];
      tmp = tmp.filter(userObj => {
        return userObj.detail === selectedItem;
      });
      setFlatlistData(tmp);
    }
  };

  useEffect(() => {
    //  todo: retrieve data from backend
    // group data by groupBy function
    // set flatlistdata based on select

    const getDetails = async () => {
      //   console.log(conductdbuuid);
      const {data, error} = await SupaIpptResult.getJoinDetail(conductdbuuid);
      if (error) throw error;
      if (data) {
        const collatedList = [];
        data.forEach(record => {
          const UserObj = record.User;
          const temp = {...UserObj};
          for (const [key, val] of Object.entries(record)) {
            if (key !== 'User') {
              temp[key] = val;
            }
          }
          collatedList.push(temp);
        });
        // console.log('[ConductingAttendanceView] Collated list: ', collatedList);
        setNominalRoll(collatedList);
        setTNominalRoll(collatedList);
        // setFlatlistData(collatedList);
        handleSelectStateArr();
        var grouped = groupBy(collatedList, obj => obj.detail);
        // console.log(grouped);
        setDetails(grouped);
        // console.log('Detail names are: ', detailNamesArr);
        let tDetailNames = ['All'];
        const detailNamesArr = Object.keys(grouped);
        tDetailNames = tDetailNames.concat(detailNamesArr);
        setDetailNames(tDetailNames);
      }
    };
    getDetails();
  }, [isFocused]);

  useEffect(() => {
    try {
      // iterate through nominal roll
      // for each obj if there is ANY that are attendance=true
      // change mark all text to "Unaccount"
      //   console.log(nominalRoll);
      flag = false;
      nominalRoll.forEach(userObj => {
        if (userObj.attendance === true) {
          flag = true;
          setMarkAllText('Unaccount all');
        }
      });
      if (flag) {
        setMarkAllText('Unaccount all');
      } else {
        setMarkAllText('Account all');
      }
    } catch (e) {
      console.log('Error occured while checking all attendances');
    }
  }, [tnominalRoll]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Conduct Attendance</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleCheckAll()}
        style={{
          width: 100,
          borderWidth: 1,
          alignItems: 'center',
          borderRadius: 16,
          backgroundColor: 'white',
          marginRight: 10,
          position: 'absolute',
          top: 8,
          right: 20,
        }}>
        <Text
          style={{
            color: 'black',
            fontFamily: 'OpenSans-Bold',
            paddingVertical: 18,
            fontSize: 12,
          }}>
          {markAllText}
        </Text>
      </TouchableOpacity>
      <View style={styles.flatlistContainer}>
        <Dropdown
          data={detailNames}
          defaultText="Select nominal roll"
          searchPlaceholderText="Search for detail"
          handleOnSelect={handleSelect}
          width="85%"
          btnColor="black"
        />
        {/* Flatlist component */}
        <AttendanceFlatlist
          //   data={flatlistData.sort(function (x, y) {
          //     return x.attendance === y.attendance ? 0 : x.attendance ? 1 : -1;
          //   })}
          data={flatlistData}
          handleClick={handleClick}
          handleGo={handleGo}
        />
      </View>
      <View style={styles.btnContainer}>
        {/* Button to confirm changes */}
        <TouchableOpacity
          style={styles.btn}
          onPress={async () => await handleRFID()}>
          <Text style={styles.btnText}>Scan RFID</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => await handleConfirm()}
          style={[
            styles.btn,
            {backgroundColor: madeChanges === true ? '#65a765' : 'black'},
          ]}>
          <Text style={styles.btnText}>Confirm</Text>
        </TouchableOpacity>
      </View>
      <AndroidPrompt ref={promptRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, flexDirection: 'column', backgroundColor: 'white'},
  header: {flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 18},
  headerText: {
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
  },
  flatlistContainer: {marginTop: 24},
  btnContainer: {
    paddingTop: 18,
  },
  btn: {
    width: '80%',
    height: 40,
    backgroundColor: 'black',
    borderRadius: 8,
    marginTop: 14,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    alignSelf: 'center',
  },
});

export default ConductingAttendanceView;
