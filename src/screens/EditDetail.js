import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DetailInfoFlatList from '../components/ConductingView/components/DetailInfo-FlatList';

const EditDetail = props => {
  const {navigation} = props;
  const detailObj = props.route.params.detailObj;
  console.log('DetailObj is: ', detailObj);
  const [cdetailArr, setcDetailArr] = useState(detailObj.detail);

  const handleSaveChanges = props.route.params.handleSaveChanges;

  const handleDelete = userObj => {
    const updatedDetail = cdetailArr.filter(
      user => user.userid !== userObj.userid,
    );
    setcDetailArr(updatedDetail);
    console.log('Updated detail is: ', updatedDetail);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{detailObj.detailName}</Text>
      </View>
      <View style={styles.detailFlatlist}>
        {/* Flatlist */}
        <DetailInfoFlatList data={cdetailArr} handleDelete={handleDelete} />
        {/* touchable opacity to open Find user modal */}
        <TouchableOpacity onPress={() => {}} style={styles.addBtn}>
          <FontAwesome name="plus-square-o" size={40} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.btnContainer}>
        {/* Save changes */}
        <TouchableOpacity
          onPress={() => {
            handleSaveChanges(detailObj.detailName, cdetailArr);
          }}
          style={styles.btnStyle}>
          <Text style={styles.btnTextStyle}>Save changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerText: {
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  addBtn: {
    alignSelf: 'center',
    marginTop: 18,
  },
  btnStyle: {
    width: '90%',
    height: 50,
    backgroundColor: '#827373',
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 140,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  btnTextStyle: {
    color: 'white',
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    alignSelf: 'center',
  },
});

export default EditDetail;
