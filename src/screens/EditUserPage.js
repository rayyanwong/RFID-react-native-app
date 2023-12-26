import React from 'react';
import {
  View,
  StyleSheet,
  Button,
  TextInput,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import {SupaUser, SupaUserStatus, SupaStatus} from '../../supabase/database';
import {useEffect, useState, useRef} from 'react';
import SelectDropdown from 'react-native-select-dropdown';
import DatePicker from 'react-native-date-picker';
import StatusList from '../components/StatusList';
import EditStatusPrompt from '../components/EditStatusPrompt';
import NetInfo from '@react-native-community/netinfo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Soldiercard from '../components/Soldiercard';
import Entypo from 'react-native-vector-icons/Entypo';
const checkExist = async userNRIC => {
  const {data, error} = await SupaUser.findUser(userNRIC);
  if (error) {
    console.log(error);
  } else {
    console.log('Data is: ', data);
  }
};

const EditUserPage = props => {
  const {navigation} = props;
  const userObj = props.route.params.data;
  const userNRIC = props.route.params.data.userNRIC;
  // const [statusArr, setStatusArr] = useState([]);
  // const [statusNameArr, setStatusNameArr] = useState([]);
  const statusArr = useRef([]);
  const statusNameArr = useRef([]);
  const [userExistingStatus, setUserExistingStatus] = useState([]);
  const userIdRef = useRef(0);
  const [addPromptVisible, setPromptVisible] = useState(false);
  const newStatusRef = useRef(null);
  const [new_startDate, setNewStartDate] = useState(new Date());
  const [new_endDate, setNewEndDate] = useState(new Date());
  const [sdVisible, setSdVisible] = useState(false);
  const [edVisible, setEdVisible] = useState(false);
  const [editStatusVisible, setEditStatusVisible] = useState(false);
  const toEditObj = useRef(null);
  const [isOffline, setIsOffline] = useState(false);

  const getStatusUser = async userId => {
    const {data, error} = await SupaUserStatus.getUserStatus(userId);
    if (error) {
      console.log('Status retrieval error: ', error);
    } else {
      //console.log('all statuses are: ', data);
      setUserExistingStatus(data);
    }
  };
  const handleAddNewStatus = async () => {
    const {data, error} = await SupaUserStatus.addUserStatusPair(
      userIdRef.current,
      newStatusRef.current,
      new_startDate,
      new_endDate,
    );
    if (error) {
      console.log('Error occured: ', error);
    } else {
      console.log('Success: ', data);
    }
  };

  const handleEditStatus = (UserStatusObj, editingStatusName) => {
    toEditObj.current = UserStatusObj;
    toEditObj.current.statusName = editingStatusName;
    setEditStatusVisible(true);
  };

  const DBEditStatus = async (statusUUID, new_endDate) => {
    const {data, error} = await SupaUserStatus.updateUserStatus(
      statusUUID,
      new_endDate,
    );
    if (error) {
      console.log('Error occured while updating status: ', error);
    } else {
      console.log('Successfully updated status: ', console.log(data));
    }
  };

  const handleRemoveStatus = async statusUUID => {
    const {data, error} = await SupaUserStatus.deleteUserStatus(statusUUID);
    if (error) {
      'Error occured while deleting status: ', error;
    } else {
      'Successfully deleted status: ', console.log(data);
    }
  };

  const cancelEditPrompt = () => {
    setEditStatusVisible(false);
    toEditObj.current = null;
  };

  useEffect(() => {
    const getDBStatus = async () => {
      const {data, error} = await SupaStatus.getAllStatus();
      if (!error) {
        //setStatusArr(data);
        statusArr.current = data;
      }
    };
    const getDBStatusNames = async () => {
      const {data, error} = await SupaStatus.getAllStatusNames();
      if (!error) {
        // setStatusNameArr(data);
        statusNameArr.current = data;
      }
    };
    const setUserIdRef = async userNRIC => {
      const {data, error} = await SupaUser.findUser(userNRIC);
      if (!error) {
        userIdRef.current = data[0].userid;
      }
      console.log('User supabase id is: ', userIdRef.current);
    };
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
    });
    setUserIdRef(userNRIC);
    getDBStatus();
    getDBStatusNames();
    return () => unsubscribe();
  }, [isOffline]);

  useEffect(() => {
    getStatusUser(userIdRef.current);
  });
  //console.log('[EditUserPage] ', statusArr);
  //console.log(userObj);
  //console.log('Existing: ', userExistingStatus);
  return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            color: 'black',
            fontFamily: 'OpenSans-Bold',
            fontSize: 18,
          }}>
          Info
        </Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setPromptVisible(true)}>
          <MaterialIcons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Soldiercard userObj={userObj} />
      {!isOffline && (
        <FlatList
          style={styles.flatlistStyle}
          marginHorizontal={12}
          data={userExistingStatus}
          keyExtractor={item => String(item.statusUUID)}
          renderItem={({item}) => (
            <StatusList
              data={item}
              handleEditStatus={handleEditStatus}
              handleRemoveStatus={handleRemoveStatus}
            />
          )}
        />
      )}
      {isOffline && (
        <Text>
          You are currently offline and unable to retrieve the User's statuses
        </Text>
      )}

      <Modal visible={addPromptVisible} transparent={true} animationType="fade">
        <View style={styles.promptContainer}>
          <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
          <View style={styles.prompt}>
            <View style={styles.promptHeader}>
              <Text
                style={{
                  fontFamily: 'OpenSans-Bold',
                  fontSize: 18,
                  maxWidth: '80%',
                  textAlign: 'center',
                  alignSelf: 'center',
                  marginHorizontal: 14,
                  marginVertical: 16,
                  color: 'black',
                }}>
                New Status
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPromptVisible(false);
                  newStatusRef.current = null;
                }}
                style={{
                  backgroundColor: '#e9ecef',
                  width: 24,
                  height: 24,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  right: 30,
                  top: 0,
                  position: 'absolute',
                }}>
                <Entypo name="cross" size={16} color="black" />
              </TouchableOpacity>
            </View>

            <SelectDropdown
              defaultButtonText="Search for status"
              data={statusArr.current}
              onSelect={(selectedItem, index) => {
                console.log(selectedItem);
                newStatusRef.current = selectedItem.statusId;
                console.log(newStatusRef.current);
              }}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.statusName;
              }}
              rowTextForSelection={(item, index) => {
                return item.statusName;
              }}
              buttonStyle={styles.dropdownBtnStyle}
              buttonTextStyle={styles.dropdownBtnTextStyle}
              renderDropdownIcon={isOpened => {
                return (
                  <FontAwesome
                    name={isOpened ? 'chevron-up' : 'chevron-down'}
                    color={'#FFF'}
                    size={18}
                  />
                );
              }}
              dropdownIconPosition="right"
              dropdownStyle={styles.dropdownDropdownStyle}
              rowStyle={styles.dropdownRowStyle}
              rowTextStyle={styles.dropdownRowTextStyle}
              selectedRowStyle={styles.dropdownSelectedRowStyle}
              search
              searchInputStyle={styles.dropdownSearhInputStyle}
              searchPlaceHolder="Search for status"
              searchPlaceHolderColor="#F8F8F8"
              renderSearchInputLeftIcon={() => {
                return <FontAwesome name="search" color="#FFF" size={18} />;
              }}
            />
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setSdVisible(true)}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'OpenSans-Bold',
                  paddingVertical: 16,
                }}>
                Start Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => setEdVisible(true)}>
              <Text
                style={{
                  color: 'white',
                  fontFamily: 'OpenSans-Bold',
                  paddingVertical: 16,
                }}>
                End Date
              </Text>
            </TouchableOpacity>
            <DatePicker
              theme="dark"
              modal
              mode="date"
              open={sdVisible}
              date={new_startDate}
              onConfirm={date => {
                setSdVisible(false);
                setNewStartDate(date);
                console.log(date.toLocaleDateString());
              }}
              onCancel={() => {
                setSdVisible(false);
              }}
            />
            <DatePicker
              theme="dark"
              modal
              mode="date"
              open={edVisible}
              date={new_endDate}
              onConfirm={date => {
                setEdVisible(false);
                setNewEndDate(date);
                console.log(date.toLocaleDateString());
              }}
              onCancel={() => {
                setEdVisible(false);
              }}
            />
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: 'white',
                  borderWidth: 1,
                  marginTop: 30,
                  elevation: 5,
                },
              ]}
              onPress={async () => {
                setPromptVisible(false);
                await handleAddNewStatus();
              }}>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'OpenSans-Bold',
                  paddingVertical: 16,
                }}>
                Add New Status
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <EditStatusPrompt
        data={toEditObj.current || null}
        editStatusVisible={editStatusVisible}
        updateDBUserStatus={DBEditStatus}
        cancelPrompt={cancelEditPrompt}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fbfcfd',
    alignContent: 'center',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 10,
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  btnContainer: {
    backgroundColor: 'black',
  },
  card: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  infoText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 15,
  },
  textInputStyle: {
    backgroundColor: 'white',
    borderRadius: 6,
    left: 20,
    paddingHorizontal: 30,
  },
  promptContainer: {flex: 1},
  prompt: {
    position: 'absolute',
    marginTop: (Dimensions.get('window').height / 3) * 0.5,
    alignSelf: 'center',
    width: '90%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  actionBtn: {
    alignItems: 'center',
    width: 45,
    height: 45,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    borderRadius: 16,
    elevation: 2,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  btn: {
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: 'black',
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dropdownBtnStyle: {
    width: '80%',
    height: 50,
    backgroundColor: '#444',
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 30,
    alignSelf: 'center',
  },
  dropdownBtnTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownDropdownStyle: {
    backgroundColor: '#444',
    borderRadius: 12,
  },
  dropdownRowStyle: {
    backgroundColor: '#444',
    borderBottomColor: '#C5C5C5',
  },
  dropdownRowTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  dropdownSelectedRowStyle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dropdownSearhInputStyle: {
    backgroundColor: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  flatlistStyle: {
    marginVertical: 14,
    marginBottom: 82,
    borderWidth: 1,
    borderRadius: 14,
  },
});

export default EditUserPage;
