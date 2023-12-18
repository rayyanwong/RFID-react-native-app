import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, FlatList} from 'react-native';
import useInternetCheck from '../hooks/useInternetCheck';
import OfflineErrorView from '../error/OfflineErrorView';
import customStyle from '../../styles';

const ConductingView = ({props}) => {
  const conductid = props.route.params.data.conductid;
  const conductname = props.route.params.name;
  const conductDBid = props.route.params.data.conductDBid;
  const offlineConduct =
    conductDBid === 22 || conductDBid === 23 ? true : false;
  const isConducting = props.route.params.data.conducting;
  const isOffline = useInternetCheck();
  const [details, setDetails] = useState([]);
  {
    if (isOffline) {
      return <OfflineErrorView />;
    } else {
      return (
        <View style={styles.pageContainer}>
          {/* FlatList of details */}
          {/* Buttons to create detail -> Navigate to stacked page.*/}
          {/* Button to scan strength */}
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  pageContainer: {backgroundColor: customStyle.background, flex: 1},
});

export default ConductingView;
