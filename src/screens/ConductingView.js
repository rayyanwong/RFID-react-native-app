import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, FlatList, SafeAreaView} from 'react-native';
import useInternetCheck from '../hooks/useInternetCheck';
import OfflineErrorView from '../error/OfflineErrorView';
import customStyle from '../../styles';

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
          {/* Buttons to create detail -> Navigate to stacked page.*/}
          {/* Button to scan strength */}
        </SafeAreaView>
      );
    }
  }
};

const styles = StyleSheet.create({
  pageContainer: {backgroundColor: customStyle.background, flex: 1},
});

export default ConductingView;
