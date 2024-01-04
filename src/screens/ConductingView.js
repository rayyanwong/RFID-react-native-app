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
  const [details, setDetails] = useState([]); // array of objects
  console.log(details);
  // [ {detailnum: _ , users[{obj},{obj}]}, ... ]

  const {navigation} = props;
  useEffect(() => {
    console.log(
      `[ConductDetails] You have selected local Conductid: ${conductid} | DB conductid: ${conductDBid} | ConductName: ${conductname} | Conducting: ${isConducting} | ConductDate: ${conductdate} | Company: ${company}`,
    );
    console.log('[offlineConduct]: ', offlineConduct);
    console.log('[isOffline]: ', isOffline);
  }, []);

  const handleDelete = detailName => {
    const updatedDetails = details.filter(
      detail => detail.detailName !== detailName,
    );
    setDetails(updatedDetails);
  };

  const handleAddDetail = detailObj => {
    const temp = [...details];
    temp.push(detailObj);
    setDetails(temp);
  };

  const checkDuplicate = detailName => {
    for (const detail of details) {
      if (detail.detailName.toUpperCase() === detailName.toUpperCase()) {
        return true;
      }
    }
    return false;
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

          <DetailFlatList data={details} handleDelete={handleDelete} />
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
