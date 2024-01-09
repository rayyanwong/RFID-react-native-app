import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import useInternetCheck from '../hooks/useInternetCheck';
import OfflineErrorView from '../error/OfflineErrorView';
import customStyle from '../../styles';
import DetailFlatList from '../components/DetailFlatList';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SupaIpptConduct} from '../../supabase/database';
import Clipboard from '@react-native-clipboard/clipboard';
import {openDatabase} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const conductdbuuid = props.route.params.data.conductdbuuid;
  const [details, setDetails] = useState([]); // array of objects

  const db = openDatabase({
    name: 'appDatabase',
  });

  // [ {detailnum: _ , users[{obj},{obj}]}, ... ]

  const {navigation} = props;
  console.log(props.route.params.data);

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
      const parsedData = JSON.parse(curData);
      setDetails(parsedData);
    };
    if (conductdbuuid !== '') {
      getInitDetails();
    }
  }, []);

  const handleDelete = detailName => {
    const updatedDetails = details.filter(
      detail => detail.detailName !== detailName,
    );
    setDetails(updatedDetails);
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
    navigation.navigate('EditDetail', {detailObj});
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
  };

  const getConductUUID = async () => {
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
      if (t_conductUUID === null) {
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE Conducts SET conductdbuuid = (?) WHERE conductid = (?)`,
            [t2_conductUUID, conductid],
            (txObj, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                console.log('Successfully updated conductdbuuid');
                conductdbuuid = t_conductUUID;
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
          <View style={styles.flatlistHeaderContainer}>
            <Text style={styles.flatlistHeader}>Details</Text>
          </View>

          <DetailFlatList
            data={details}
            handleDelete={handleDelete}
            handleClick={handleClick}
          />
          {/* Buttons to create detail -> Navigate to stacked page.*/}
          {/* Button to scan strength: modal */}
          <View style={styles.btnContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('NewDetail', {
                  handleAddDetail,
                  checkDuplicate,
                });
              }}
              style={styles.btnStyle}>
              <Text style={styles.btnTextStyle}>Add Detail</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ConductingQrScanner');
              }}
              style={styles.btnStyle}>
              <Text style={styles.btnTextStyle}>Scan QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnStyle}
              onPress={async () => {
                await handleSave();
              }}>
              <Text style={styles.btnTextStyle}>Retrieve conduct UUID</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const curData = await AsyncStorage.getItem(conductdbuuid);
                if (curData !== null) {
                  const parsedJSON = JSON.parse(curData);
                  console.log(parsedJSON);
                } else {
                  console.log('Storage is empty');
                }
              }}
              style={styles.btnStyle}>
              <Text style={styles.btnTextStyle}>Push details</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
  }
};

const styles = StyleSheet.create({
  pageContainer: {backgroundColor: customStyle.background, flex: 1},
  btnContainer: {flexDirection: 'column', marginTop: 20},
  btnStyle: {
    width: '90%',
    height: 50,
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
    marginTop: 30,
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
});

export default ConductingView;
