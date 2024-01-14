import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SupaIpptResult} from '../../supabase/database';
import {useIsFocused} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from '../components/StationMasterView/Dropdown';
import StationMasterFlatlist from '../components/StationMasterView/StationMaster-Flatlist';
import ResultModal from '../components/StationMasterView/ResultModal';

const StationMasterView = props => {
  const {navigation} = props;
  const conductdbuuid = props.route.params.conductdbuuid;
  const isFocused = useIsFocused();

  const [station, setStation] = useState(null);
  const [flatlistData, setFlatlistData] = useState([]);
  const [details, setDetails] = useState({});
  const [detailNames, setDetailNames] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState();
  const [tDetail, setTDetail] = useState();
  const [madeChanges, setMadeChanges] = useState(false);

  function groupBy(xs, f) {
    return xs.reduce(
      (r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r),
      {},
    );
  }

  const handleModalVisible = e => {
    setModalVisible(e);
  };

  const handleSelectStation = station => {
    if (station === 'Pushup') {
      setStation(1);
    } else if (station === 'Situp') {
      setStation(2);
    } else if (station === '2.4 KM') {
      setStation(3);
    }
  };

  const handleSelectDetail = detailName => {
    if (Object.keys(details).length !== 0) {
      setFlatlistData(details[detailName]);
      setTDetail(details[detailName]);
      console.log('TDetail is: ', details[detailName]);
    }
  };

  const handleUserToEdit = userObj => {
    setUserToEdit(userObj);
  };

  const handleConfirmResult = async (tDetail, station) => {
    // use Update method to push score into backend
    // station master will need to push score every detail
    // only need to focus on iterating through the updated tDetail and update value of field state;
    if (station === 1) {
      // update using pushup method
      tDetail.forEach(async userObj => {
        const {data, error} = await SupaIpptResult.updatePushup(
          conductdbuuid,
          userObj.userid,
          parseInt(userObj.pushup),
        );
        if (error) {
          Alert.alert(
            `Error while updating ${userObj.userName}'s pushup score`,
          );
          console.warn(
            `Error while updating ${userObj.userName}'s pushup score:`,
            error,
          );
        }
      });
    } else if (station === 2) {
      // update using situp method
      tDetail.forEach(async userObj => {
        const {data, error} = await SupaIpptResult.updateSitup(
          conductdbuuid,
          userObj.userid,
          parseInt(userObj.situp),
        );
        if (error) {
          Alert.alert(`Error while updating ${userObj.userName}'s situp score`);
          console.warn(
            `Error while updating ${userObj.userName}'s situp score:`,
            error,
          );
        }
      });
    } else if (station === 3) {
      // update using chipNo method
      tDetail.forEach(async userObj => {
        const {data, error} = await SupaIpptResult.updateChipNo(
          conductdbuuid,
          userObj.userid,
          userObj.chipNo,
        );
        if (error) {
          Alert.alert(`Error while updating ${userObj.userName}'s chip number`);
          console.warn(
            `Error while updating ${userObj.userName}'s chip number:`,
            error,
          );
        }
      });
    }
    setMadeChanges(false);
    Alert.alert('Successfully updated detail scores into database');
  };

  const handleRecordResult = (userid, score, field) => {
    // for (const [key,value] of Object.entries(tDetails)){
    //     if (key===)
    // }
    // console.log(tDetails);
    const temp = tDetail;
    temp.forEach(userObj => {
      // console.log('Userobj: ', userObj);
      if (userObj.userid === userid) {
        // update field score
        userObj[field] = score;
      }
    });
    setTDetail(temp);
    console.log('Updated: ', temp);
    setMadeChanges(true);
  };

  useEffect(() => {
    const getDetails = async () => {
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
        var grouped = groupBy(collatedList, obj => obj.detail);
        setDetails(grouped);
        const detailNamesArr = Object.keys(grouped);
        // console.log('Detail names are: ', detailNamesArr);
        setDetailNames(detailNamesArr);
      }
    };
    getDetails();
  }, [isFocused]);

  //   After getting result from backend, need to filter it for result in:
  //  {detailName, detail: <userObj>[]}
  //  ^- Create copy of this arr for amendments
  //  Saving changes updates "field" with result in cArr

  return (
    // Dropdown to select station type -> Tap on user for prompt -> Insert result through input -> Store into temp obj -> Once save changes is pressed, then push to backend.
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (madeChanges) {
              Alert.alert(
                'Unsaved changes',
                'You have made changes and not confirmed it. Are you sure you would like to exit?',
                [
                  {text: 'Yes', onPress: () => navigation.goBack()},
                  {text: 'No', style: 'cancel', onPress: () => {}},
                ],
              );
            } else {
              navigation.goBack();
            }
          }}>
          <MaterialIcons name="arrow-back-ios" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Station master view</Text>
        {/* Dropdown for station type */}
        <Dropdown
          handleOnSelect={handleSelectStation}
          searchPlaceholderText="Search station"
          defaultText="Select station type"
          data={['Pushup', 'Situp', '2.4 KM']}
          width={190}
          btnColor="#827373"
        />
      </View>
      <View style={styles.detailInfo}>
        {/* Dropdown list with details pulled */}
        <Dropdown
          handleOnSelect={handleSelectDetail}
          searchPlaceholderText="Search detail"
          defaultText="Select detail"
          data={detailNames}
          width={360}
          btnColor="black"
        />
        <StationMasterFlatlist
          data={flatlistData}
          handleEdit={handleModalVisible}
          handleUserToEdit={handleUserToEdit}
        />
      </View>
      <View style={styles.btnContainer}>
        {/* Save changes btn */}
        <TouchableOpacity
          disabled={madeChanges ? false : true}
          style={[
            styles.btn,
            {backgroundColor: madeChanges ? '#52e50d' : 'black'},
          ]}
          onPress={async () => {
            await handleConfirmResult(tDetail, station);
          }}>
          <Text
            style={{color: 'white', fontFamily: 'OpenSans-Bold', fontSize: 14}}>
            Confirm results
          </Text>
        </TouchableOpacity>
      </View>
      <ResultModal
        visible={modalVisible}
        setVisible={handleModalVisible}
        stationType={station}
        handleRecord={handleRecordResult}
        userObj={userToEdit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: 'white'},
  header: {
    flexDirection: 'row',
    marginHorizontal: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  headerText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    color: 'black',
    marginRight: 24,
  },
  btn: {
    width: '85%',
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    height: '26%',
    justifyContent: 'center',
    marginVertical: 6,
    alignSelf: 'center',
  },
  btnContainer: {
    marginTop: 100,
  },
});

export default StationMasterView;
