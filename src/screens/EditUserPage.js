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

const checkExist = async userNRIC => {
  const {data, error} = await SupaUser.findUser(userNRIC);
  if (error) {
    console.log(error);
  } else {
    console.log('Data is: ', data);
  }
};

const EditUserPage = props => {
  const userNRIC = props.route.params.data.userNRIC;
  const userObj = props.route.params.data;
  const userHPNo = props.route.params.data.userHPNo.toString();
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
  }, []);

  useEffect(() => {
    getStatusUser(userIdRef.current);
  });
  //console.log('[EditUserPage] ', statusArr);
  //console.log(userObj);
  //console.log('Existing: ', userExistingStatus);
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.card}>
          <Text style={styles.infoText}>NRIC: </Text>
          <TextInput
            editable={false}
            placeholder={userNRIC}
            placeholderTextColor="black"
            style={styles.textInputStyle}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.infoText}>HP Number: </Text>
          <TextInput
            editable={false}
            style={styles.textInputStyle}
            placeholder={userHPNo}
            placeholderTextColor="black"
          />
        </View>
      </View>
      {!isOffline && (
        <FlatList
          marginHorizontal={10}
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
      <View style={styles.btnContainer}>
        <Button
          title="Find User in Supbase"
          onPress={async () => await getStatusUser(userIdRef.current)}
        />
        <Button title="Get Add Prompt" onPress={() => setPromptVisible(true)} />
        <Button
          title="Get all statuses"
          onPress={() => console.log(statusArr.current)}
        />
      </View>

      <Modal visible={addPromptVisible} transparent={true}>
        <View style={styles.promptContainer}>
          <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
          <View style={styles.prompt}>
            <SelectDropdown
              buttonStyle={{marginBottom: 10}}
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
            />
            <Button
              title="Open start date picker"
              onPress={() => setSdVisible(true)}
            />
            <Button
              title="Open end date picker"
              onPress={() => setEdVisible(true)}
            />
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
              style={styles.promptCancelBtn}
              onPress={async () => {
                setPromptVisible(false);
                await handleAddNewStatus();
              }}>
              <Text style={{color: 'black'}}>Add New Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promptCancelBtn}
              onPress={() => {
                setPromptVisible(false);
                newStatusRef.current = null;
              }}>
              <Text style={{color: 'black'}}>Cancel</Text>
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
    backgroundColor: '#dedbf0',
    alignContent: 'center',
  },
  infoContainer: {},
  btnContainer: {},
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
    bottom: Dimensions.get('window').height / 2,
    left: 20,
    width: Dimensions.get('window').width - 2 * 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  promptCancelBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
  },
});

export default EditUserPage;
