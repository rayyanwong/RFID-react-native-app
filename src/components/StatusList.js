import React, {useEffect, useRef, useMemo, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SupaStatus} from '../../supabase/database';
const StatusList = ({data, handleEditStatus, handleRemoveStatus}) => {
  const statusIdx = data.statusId;
  // const statusName = useRef('');
  const [statusName, setStatusName] = useState('');
  //console.log(statusIdx);
  const getDBStatusName = async conductid => {
    const {data, error} = await SupaStatus.getStatusName(conductid);
    // statusName.current = data[0].statusName;
    setStatusName(data[0].statusName);
  };
  useMemo(() => {
    getDBStatusName(statusIdx);
  }, [statusName]);
  const statusUUID = data.statusUUID;
  //console.log(statusName);
  return (
    <View style={styles.container}>
      <View style={styles.statusTitleContainer}>
        <Text style={styles.statusTitle}>{statusName}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>Start: {data.start_date}</Text>
        <Text style={styles.dateText}>End: {data.end_date}</Text>
        <TouchableOpacity onPress={() => handleEditStatus(data, statusName)}>
          <MaterialIcons name="edit-note" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRemoveStatus(statusUUID)}>
          <MaterialIcons name="delete-sweep" size={30} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    flexDirection: 'column',
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 10,
    paddingVertical: 20,
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 1,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowRadius: 10,
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  statusTitle: {
    color: 'black',
    fontSize: 14,
    paddingLeft: 10,
    paddingVertical: 5,
    fontFamily: 'OpenSans-Bold',
  },
  dateText: {
    color: 'black',
    paddingHorizontal: 5,
    fontFamily: 'OpenSans-Regular',
  },
  statusTitleContainer: {
    borderRadius: 6,
    borderWidth: 2,
  },
});

export default StatusList;
