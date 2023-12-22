import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import useInternetCheck from '../hooks/useInternetCheck';
import OfflineErrorView from '../error/OfflineErrorView';
import customStyle from '../../styles';
import DetailFlatList from '../components/DetailFlatList';

const ConductingView = props => {
  const conductid = props.route.params.data.conductid;
  const conductname = props.route.params.name;
  const conductDBid = props.route.params.data.conductDBid;
  const offlineConduct =
    conductDBid === 22 || conductDBid === 23 ? true : false;
  const isConducting = props.route.params.data.conducting;
  const isOffline = useInternetCheck();
  const [details, setDetails] = useState([]); // array of objects
  // [ {detailnum: _ , users[{obj},{obj}]}, ... ]

  useEffect(() => {
    console.log(
      `[ConductDetails] You have selected local Conductid: ${conductid} | DB conductid: ${conductDBid} | ConductName: ${conductname} | Conducting: ${isConducting}`,
    );
    console.log('[offlineConduct]: ', offlineConduct);
    console.log('[isOffline]: ', isOffline);
  }, []);

  {
    if (isOffline) {
      return <OfflineErrorView />;
    } else {
      return (
        <SafeAreaView style={styles.pageContainer}>
          {/* FlatList of details */}
          <View style={styles.flatlistHeaderContainer}>
            <Text style={styles.flatlistHeader}>Details</Text>
          </View>

          <DetailFlatList data={details} />
          {/* Buttons to create detail -> Navigate to stacked page.*/}
          {/* Button to scan strength */}
          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={() => {}} style={styles.btnStyle}>
              <Text style={styles.btnTextStyle}>Add Detail</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.btnStyle}>
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
    width: '80%',
    height: 50,
    backgroundColor: customStyle.secondary,
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  btnTextStyle: {
    color: customStyle.text,
    fontFamily: 'OpenSans-Regular',
    fontWeight: '500',
    fontSize: 16,
    alignSelf: 'center',
  },
  flatlistHeader: {
    color: customStyle.text,
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
    padding: 8,
  },
  flatlistHeaderContainer: {
    backgroundColor: customStyle.primary,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 50,
  },
});

export default ConductingView;
