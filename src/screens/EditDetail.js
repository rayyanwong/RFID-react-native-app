import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import DetailFlatList from '../components/ConductingView/components/NewDetail-FlatList';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const EditDetail = props => {
  const {navigation} = props;
  const detailObj = props.route.params.detailObj;
  console.log(detailObj);
  const [cdetailObj, setcDetailObj] = useState(detailObj);

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
        {/* touchable opacity to open Find user modal */}
      </View>
      <View style={styles.btnContainer}></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default EditDetail;
