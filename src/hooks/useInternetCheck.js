import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const useInternetCheck = () => {
  const [isOffline, setIsOffline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  });

  return isOffline;
};

export default useInternetCheck;
