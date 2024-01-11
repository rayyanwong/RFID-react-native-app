import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, SafeAreaView} from 'react-native';
import {SupaIpptResult} from '../../supabase/database';
import {useIsFocused} from '@react-navigation/native';

const StationMasterView = props => {
  const {navigation} = props;
  const conductdbuuid = props.route.params.conductdbuuid;
  const isFocused = useIsFocused();

  useEffect(() => {
    const getDetails = async () => {
      const {data, error} = await SupaIpptResult.getJoinDetail(conductdbuuid);
      if (error) throw error;
      console.log(data);
    };
    getDetails();
  }, [isFocused]);

  //   After getting result from backend, need to filter it for result in:
  //  {detailName, detail: <userObj>[]}
  //  ^- Create copy of this arr for amendments
  //  Saving changes updates "field" with result in cArr

  return (
    // Dropdown to select station type -> Tap on user for prompt -> Insert result through input -> Store into temp obj -> Once save changes is pressed, then push to backend.
    <SafeAreaView>
      <View style={styles.header}></View>
      <View style={styles.detailInfo}>
        {/* Dropdown for station type */}
        {/* Dropdown list with details pulled */}
      </View>
      <View style={styles.btnContainer}>{/* Save changes btn */}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default StationMasterView;
