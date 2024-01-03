import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import NewDetailFlatList from '../components/ConductingView/NewDetail/NewDetail-FlatList';
import FindUserModal from '../components/ConductingView/NewDetail/FindUser-Modal';

const NewDetail = props => {
  const [detailName, setDetailName] = useState('');
  const {navigation} = props;
  const [detail, setDetail] = useState([
    {userName: 'Rayyan'},
    {userName: 'Desmond'},
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const setVisible = e => {
    setModalVisible(e);
  };

  //  {detailName: "",detail}
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
      {/* Flatlist of people in detail -> Dynamically render whoever is added*/}
      <NewDetailFlatList data={detail} />
      {/* Search */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.btnText}>Search User</Text>
        </TouchableOpacity>
        {/* Create -> Uploads to backend & inserts in local db*/}
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Create Detail</Text>
        </TouchableOpacity>
        {/* Cancel */}
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={[styles.btn, {backgroundColor: '#827373', marginTop: 30}]}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <FindUserModal visible={modalVisible} setVisible={setVisible} />
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
    marginBottom: 24,
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
