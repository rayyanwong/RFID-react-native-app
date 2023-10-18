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
  const [statusArr, setStatusArr] = useState([]);
  const [userExistingStatus, setUserExistingStatus] = useState([]);
  const userIdRef = useRef(0);
  const [addPromptVisible, setPromptVisible] = useState(false);
  const newStatusRef = useRef(null);
  const [new_startDate, setNewStartDate] = useState(new Date());
  const [new_endDate, setNewEndDate] = useState(new Date());
  const [sdVisible, setSdVisible] = useState(false);
  const [edVisible, setEdVisible] = useState(false);
  const [editStatusVisible, setEditStatusVisible] = useState(false);
  const toEditObj = useRef();

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

  const handleEditStatus = UserStatusObj => {
    toEditObj.current = UserStatusObj;
    setEditStatusVisible(true);
  };

  const DBEditStatus = () => {};

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
  };
  useEffect(() => {
    const getDBStatus = async () => {
      const {data, error} = await SupaStatus.getAllStatusNames();
      if (!error) {
        setStatusArr(data);
      }
    };
    const setUserIdRef = async userNRIC => {
      const {data, error} = await SupaUser.findUser(userNRIC);
      if (!error) {
        userIdRef.current = data[0].userid;
      }
      console.log('User supabase id is: ', userIdRef.current);
    };

    setUserIdRef(userNRIC);
    getDBStatus();
  }, []);

  useEffect(() => {
    getStatusUser(userIdRef.current);
  });

  //console.log(userObj);
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
      <FlatList
        marginHorizontal={10}
        data={userExistingStatus}
        keyExtractor={item => String(item.statusUUID)}
        renderItem={({item}) => (
          <StatusList
            data={item}
            handleEditStatus={handleEditStatus}
            handleRemoveStatus={handleRemoveStatus}
            statusArr={statusArr}
          />
        )}
      />
      <View style={styles.btnContainer}>
        <Button
          title="Find User in Supbase"
          onPress={async () => await getStatusUser(userIdRef.current)}
        />
        <Button title="Get Add Prompt" onPress={() => setPromptVisible(true)} />
        <Button
          title="Get all statuses"
          onPress={() => console.log(statusArr)}
        />
      </View>

      <Modal visible={addPromptVisible} transparent={true}>
        <View style={styles.promptContainer}>
          <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
          <View style={styles.prompt}>
            <SelectDropdown
              buttonStyle={{marginBottom: 10}}
              data={statusArr}
              onSelect={(selectedItem, index) => {
                console.log(selectedItem);
                newStatusRef.current = index;
                console.log(index);
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
        data={toEditObj.current}
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
