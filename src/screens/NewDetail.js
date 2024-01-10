import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  LogBox,
} from 'react-native';
import NewDetailFlatList from '../components/ConductingView/components/NewDetail-FlatList';
import FindUserModal from '../components/ConductingView/components/FindUser-Modal';
import {useDebounce} from '../hooks/useDebounce';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const NewDetail = props => {
  const [detailName, setDetailName] = useState('');
  const {navigation} = props;
  const details = props.route.params.details;
  const handleAddDetail = props.route.params.handleAddDetail;
  const checkDuplicate = props.route.params.checkDuplicate;

  const [detail, setDetail] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [error, setError] = useState(false);

  const componentUnmount = () => {
    setDetail([]);
    setDetailName('');
    navigation.goBack();
  };

  const setVisible = e => {
    setModalVisible(e);
  };

  const handleAddUser = userObj => {
    let temp = [...detail];
    console.log(temp);
    temp.push(userObj);
    setDetail(temp);
  };

  const handleDelete = userid => {
    const updatedDetail = detail.filter(user => user.userid !== userid);
    setDetail(updatedDetail);
  };
  //  {detailName: "",detail}

  const debouncedValue = useDebounce(detailName, 500);

  useEffect(() => {
    // check if detail name already exists in detail, function will be passed as props and defined in parent component - conductingView
    // display message if it is already taken, set state to error and prevent user from creating,
    const duplicate = checkDuplicate(detailName);
    if (duplicate) {
      setError(true);
    } else {
      setError(false);
    }
  }, [debouncedValue]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Input for new detail name */}
      <TextInput
        placeholder="Enter detail name. Eg. Detail 1"
        textAlign="center"
        style={styles.textInput}
        value={detailName}
        onChangeText={text => setDetailName(text)}
      />
      <View style={{alignSelf: 'center', height: 18}}>
        {error && (
          <Text style={{color: 'red', fontFamily: 'OpenSans-Regular'}}>
            Error! Detail name already exists
          </Text>
        )}
      </View>
      {/* Flatlist of people in detail -> Dynamically render whoever is added*/}
      <NewDetailFlatList data={detail} handleDelete={handleDelete} />
      {/* Search */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.btnText}>Search User</Text>
        </TouchableOpacity>
        {/* Create -> Uploads to backend & inserts in local db*/}
        <TouchableOpacity
          disabled={error ? true : false}
          style={styles.btn}
          onPress={() => {
            if ((detailName !== '') & (detail.length !== 0)) {
              handleAddDetail({detailName, detail});
              componentUnmount();
            } else {
              Alert.alert('Detail name / Detail cannot be empty!');
            }
          }}>
          <Text style={styles.btnText}>Create Detail</Text>
        </TouchableOpacity>
        {/* Cancel */}
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={[styles.btn, {backgroundColor: '#827373'}]}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <FindUserModal
        visible={modalVisible}
        setVisible={setVisible}
        handleAddUser={handleAddUser}
        details={details}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white', flexDirection: 'column'},
  textInput: {
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    borderWidth: 1,
    borderRadius: 18,
    width: '80%',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 16,
    height: 40,
  },
  btnContainer: {
    marginTop: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: 'black',
    width: '80%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  btnText: {
    color: 'white',
    paddingVertical: 14,
    fontFamily: 'OpenSans-Bold',
    fontSize: 12,
  },
});

export default NewDetail;
