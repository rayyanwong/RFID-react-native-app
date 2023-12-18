import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import useInternetCheck from '../hooks/useInternetCheck';

const ConductingView = ({props}) => {
  const conductid = props.route.params.data.conductid;
  const conductname = props.route.params.name;
  const conductDBid = props.route.params.data.conductDBid;
  const offlineConduct =
    conductDBid === 22 || conductDBid === 23 ? true : false;
  const isConducting = props.route.params.data.conducting;
  const isOffline = useInternetCheck();
  {
    if (isOffline) {
      return <OfflineErrorView />;
    } else {
      return <View></View>;
    }
  }
};

const styles = StyleSheet.create({});

export default ConductingView;
