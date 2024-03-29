import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import {openDatabase} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import XLSX from 'xlsx';
import {writeFile, readFile, DownloadDirectoryPath} from 'react-native-fs';
import Toast from 'react-native-simple-toast';

import useInternetCheck from '../hooks/useInternetCheck';
import OfflineErrorView from '../error/OfflineErrorView';
import customStyle from '../../styles';
import DetailFlatList from '../components/DetailFlatList';
import {SupaDailyConduct, SupaIpptConduct} from '../../supabase/database';
import {SupaIpptResult} from '../../supabase/database';
import {FormatDate} from '../utils/FormatDate';

const ConductingView = props => {
  const conductid = props.route.params.data.conductid;
  const conductname = props.route.params.name;
  const conductDBid = props.route.params.data.conductDBid;
  const offlineConduct =
    conductDBid === 22 || conductDBid === 23 ? true : false;
  const isConducting = props.route.params.data.conducting;
  const isOffline = useInternetCheck();
  const conductdate = props.route.params.data.conductdate;
  const company = props.route.params.data.company;
  const [conductdbuuid, setConductDBuuid] = useState(
    props.route.params.data.conductdbuuid,
  );
  // const [tConductDBuuid, setTConductDBuuid] = useState(conductdbuuid);
  const [details, setDetails] = useState([]); // array of objects
  var RNFS = require('react-native-fs');

  const db = openDatabase({
    name: 'appDatabase',
  });

  // [ {detailnum: _ , users[{obj},{obj}]}, ... ]

  // console.log(details);

  const {navigation} = props;
  // console.log(props.route.params.data);

  useEffect(() => {
    console.log(
      `[ConductDetails] You have selected local Conductid: ${conductid} | DB conductid: ${conductDBid} | ConductName: ${conductname} | Conducting: ${isConducting} | ConductDate: ${conductdate} | Company: ${company} | ConductDBuuid: ${conductdbuuid}`,
    );
    console.log('[offlineConduct]: ', offlineConduct);
    console.log('[isOffline]: ', isOffline);
  }, []);

  useEffect(() => {
    const getInitDetails = async () => {
      const curData = await AsyncStorage.getItem(conductdbuuid);
      if ((curData !== '') & (curData !== null)) {
        const parsedData = JSON.parse(curData);
        setDetails(parsedData);
      }
    };
    if (conductdbuuid !== '') {
      getInitDetails();
    }
  }, [conductdbuuid]);

  const handleDelete = async detailName => {
    const updatedDetails = details.filter(
      detail => detail.detailName !== detailName,
    );
    setDetails(updatedDetails);

    // to update AsyncStorage

    await AsyncStorage.setItem(conductdbuuid, JSON.stringify(updatedDetails));
    // DB handle delete for all records with this detail name

    //  if "confirmed" and generated UUID, then can delete from backend
  };

  const handleAddDetail = async detailObj => {
    const temp = [...details];
    temp.push(detailObj);
    setDetails(temp);

    // store into MMKV
    try {
      const jsonValue = JSON.stringify(temp);
      await AsyncStorage.setItem(conductdbuuid, jsonValue);
      const curData = await AsyncStorage.getItem(conductdbuuid);
      console.log('curData: ', curData);
    } catch (e) {
      console.log('AsyncStorage error when setting item key pair: ', e);
    }
  };

  const handleClick = detailObj => {
    navigation.navigate('EditDetail', {detailObj, details, handleSaveChanges});
  };

  const checkDuplicate = detailName => {
    for (const detail of details) {
      if (detail.detailName.toUpperCase() === detailName.toUpperCase()) {
        return true;
      }
    }
    return false;
  };

  const handleInsert = async () => {
    if (conductDBid === 15) {
      try {
        let {data, error} = await SupaIpptConduct.insertRecord(
          company,
          conductdate,
          conductname,
        );
        if (error) {
          console.log(
            `Error has occured while trying to insert record into db:`,
            error,
          );
        } else {
          console.log(`Data from insertingRecord:`, data[0]);
        }
      } catch (e) {
        console.log(`Error has occured while using handleInsert:`, error);
      }
    } else {
      try {
        let {data, error} = await SupaDailyConduct.insertRecord(
          company,
          conductdate,
          conductname,
        );
        if (error) {
          console.log(
            `Error has occured while trying to insert record into db:`,
            error,
          );
        } else {
          console.log(`Data from insertingRecord:`, data[0]);
        }
      } catch (e) {
        console.log(`Error has occured while using handleInsert:`, error);
      }
    }
  };

  const getConductUUID = async () => {
    if (conductDBid === 15) {
      try {
        let {data, error} = await SupaIpptConduct.getconductUUID(
          company,
          conductdate,
          conductname,
        );
        if (error) {
          console.log(
            `Error has occured while trying to retrieve uuid from db `,
            error,
          );
          return null;
        } else {
          console.log(`Data from getConductUUID:`, data[0].conductUUID);
          return data[0].conductUUID;
        }
      } catch (e) {
        console.log(`Error has occured while using getConductUUID:`, e);
        return null;
      }
    } else {
      try {
        let {data, error} = await SupaDailyConduct.getconductUUID(
          company,
          conductdate,
          conductname,
        );
        if (error) {
          console.log(
            `Error has occured while trying to retrieve uuid from db `,
            error,
          );
          return null;
        } else {
          console.log(`Data from getConductUUID:`, data[0].conductUUID);
          return data[0].conductUUID;
        }
      } catch (e) {
        console.log(`Error has occured while using getConductUUID:`, e);
        return null;
      }
    }
  };

  const handleSave = async () => {
    try {
      const t_conductUUID = await getConductUUID();
      if (t_conductUUID === null) {
        // need to handle first insert
        await handleInsert();
        // handle local object's
      }
      const t2_conductUUID = await getConductUUID();
      console.log(t2_conductUUID);
      Clipboard.setString(t2_conductUUID);
      console.log('ConductUUID has been copied to clipboard');
      Alert.alert('Conduct UUID has been copied to clipboard!');
      if (t_conductUUID === null) {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE Conducts SET conductdbuuid = (?) WHERE conductid = (?)`,
            [t2_conductUUID, conductid],
            (txObj, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                console.log('Successfully updated conductdbuuid');
                setConductDBuuid(t2_conductUUID);
              }
            },
            error => {
              console.log('Error while updating conductDBuuid', error);
            },
          );
        });
      }
    } catch (e) {
      console.log(`Error while handling save`);
    }
  };

  const handleSaveChanges = async (detailName, new_detailArr) => {
    details.forEach(detailObj => {
      if (detailObj.detailName === detailName) {
        detailObj.detail = new_detailArr;
        console.log('Updated: ', detailObj.detail);
      }
    });
    try {
      await AsyncStorage.setItem(conductdbuuid, JSON.stringify(details));
      const newData = await AsyncStorage.getItem(conductdbuuid);
      console.log('New data is: ', newData);
    } catch (e) {
      console.log('Error occured while handling Savechanges: ', e);
    }
  };

  const handleSync = async () => {
    // delete all records first
    // reinsert all records

    const {error} = await SupaIpptResult.deleteAllRecords(conductdbuuid);
    // if (error) {
    //   console.log(`Error deleting all records:`, error);
    // }
    details.forEach(async detail => {
      // {detailName, detail: <userObj>[]}
      // userObj: {userName, userid,...}
      const detailArr = detail.detail;
      detailArr.forEach(async userObj => {
        const {data, error} = await SupaIpptResult.insertRecord(
          conductdbuuid,
          userObj.userid,
          detail.detailName,
        );
        if (error) {
          console.log('Error while inserting userObj into db: ', error);
        } else {
          console.log('Successfully inserted user into db:', data);
        }
      });
    });
  };

  const exportDownload = async () => {
    const {data, error} = await SupaIpptResult.getJoinDetail(conductdbuuid);
    if (error) {
      throw error;
    } else if (data) {
      var collatedList = [];
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
      // console.log(collatedList);
    }
    const aoa = [
      [
        'NRIC',
        'Name',
        'Company',
        'Attendance',
        'Pushup',
        'Situp',
        'Chip Number',
        'No Go',
      ],
    ]; // array of arrays for each record required to be written into the excel
    collatedList.forEach(userObj => {
      const temp = [];
      temp.push(userObj.userNRIC);
      temp.push(userObj.userName);
      temp.push(userObj.Company);
      temp.push(userObj.attendance);
      temp.push(userObj.pushup);
      temp.push(userObj.situp);
      temp.push(userObj.chipNo);
      temp.push(userObj.noGo);
      aoa.push(temp);
    });
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'Ippt Results');
    const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
    writeFile(
      DownloadDirectoryPath +
        `/${conductname.replace(' ', '_')}${FormatDate(
          new Date().toLocaleDateString(),
        )}.xlsx`,
      wbout,
      'ascii',
    )
      .then(r => {
        console.log('Successfully downloaded results onto device!');
        Toast.showWithGravity(
          'Successfully downloaded file onto device!',
          Toast.LONG,
          Toast.CENTER,
        );
      })
      .catch(e => {
        console.log('Error occured while trying to save file!', e);
        Toast.showWithGravity(
          'An error occured while downloading the file. Please try again!',
          Toast.LONG,
          Toast.CENTER,
        );
      });
  };

  async function handleGenerate() {
    try {
      let isPermittedExternalStorage = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (!isPermittedExternalStorage) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage permissions are required to download file.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
            buttonNeutral: 'Ask again later',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await exportDownload();
          console.log('Permission granted to download file.');
        } else {
          console.log('Permission Denied');
        }
      } else {
        await exportDownload();
      }
    } catch (e) {
      console.log('Error while trying to get permission to download file: ', e);
      return;
    }
  }

  {
    if (isOffline) {
      return <OfflineErrorView />;
    } else {
      return (
        <SafeAreaView style={styles.pageContainer}>
          <View style={styles.pageHeader}>
            <TouchableOpacity>
              <MaterialIcons
                size={24}
                name="arrow-back-ios"
                onPress={() => {
                  navigation.goBack();
                }}
                style={{color: 'black'}}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>{conductname}</Text>
          </View>
          {/* FlatList of details */}

          {conductDBid === 15 && (
            <View>
              <View style={styles.flatlistHeaderContainer}>
                <Text style={styles.flatlistHeader}>Details</Text>
              </View>

              <DetailFlatList
                data={details}
                handleDelete={handleDelete}
                handleClick={handleClick}
              />
            </View>
          )}

          {/* Buttons to create detail -> Navigate to stacked page.*/}
          {/* Button to scan strength: modal */}
          <View style={styles.btnContainer}>
            {conductDBid === 15 && (
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('NewDetail', {
                      handleAddDetail,
                      checkDuplicate,
                      details,
                    });
                  }}
                  style={styles.btnStyle}>
                  <Text style={styles.btnTextStyle}>Add Detail</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ConductingQrScanner');
              }}
              style={styles.btnStyle}>
              <Text style={styles.btnTextStyle}>Scan QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btnStyle,
                {backgroundColor: conductdbuuid === '' ? 'red' : 'black'},
              ]}
              onPress={async () => {
                await handleSave();
              }}>
              <Text style={styles.btnTextStyle}>Retrieve conduct UUID</Text>
            </TouchableOpacity>

            {conductDBid === 15 && (
              <View>
                <TouchableOpacity
                  onPress={async () => {
                    await handleSync();
                    Alert.alert('Successfully pushed details into backend');
                  }}
                  style={styles.btnStyle}>
                  <Text style={styles.btnTextStyle}>Push details</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* <TouchableOpacity onPress={() => {}} style={styles.btnStyle}>
              <Text style={styles.btnTextStyle}>Generate report</Text>
            </TouchableOpacity> */}
          </View>

          <TouchableOpacity
            style={[styles.headerBtn, {right: 20, top: 10}]}
            onPress={async () => {
              await handleGenerate();
            }}
            disabled={conductdbuuid === '' ? true : false}>
            <MaterialCommunityIcons
              name="cloud-download-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, {right: 70, top: 10}]}
            onPress={() => {
              navigation.navigate('ConductingAttendanceView', {
                details: details,
                conductdbuuid: conductdbuuid,
              });
            }}
            disabled={
              conductdbuuid === '' ? true : false && details.length === 0
            }>
            <MaterialIcons name="people-outline" size={24} color="black" />
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
  }
};

const styles = StyleSheet.create({
  pageContainer: {backgroundColor: customStyle.background, flex: 1},
  btnContainer: {flexDirection: 'column', marginTop: 14},
  btnStyle: {
    width: '80%',
    height: 40,
    backgroundColor: 'black',
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  btnTextStyle: {
    color: 'white',
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    alignSelf: 'center',
  },
  flatlistHeader: {
    color: customStyle.text,
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
    padding: 8,
  },
  flatlistHeaderContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
  },
  headerText: {
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
    width: '90%',
  },
  pageHeader: {
    marginHorizontal: 24,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    alignItems: 'center',
    width: 40,
    height: 40,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    borderRadius: 6,
    elevation: 5,
    zIndex: 10,
    margin: 5,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowOffset: {
      width: 1,
      height: 3,
    },
    position: 'absolute',
  },
});

export default ConductingView;
