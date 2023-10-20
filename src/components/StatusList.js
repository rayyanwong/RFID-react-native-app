import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SupaStatus} from '../../supabase/database';
const StatusList = ({data, handleEditStatus, handleRemoveStatus}) => {
  const statusIdx = data.statusId;
  const statusName = useRef('');
  //console.log(statusIdx);
  const getDBStatusName = async conductid => {
    const {data, error} = await SupaStatus.getStatusName(conductid);
    statusName.current = data[0].statusName;
  };
  useEffect(() => {
    getDBStatusName(statusIdx);
  }, []);
  const statusUUID = data.statusUUID;
  //console.log(statusName);
  return (
    <View style={styles.container}>
      <View style={styles.statusTitleContainer}>
        <Text style={styles.statusTitle}>{statusName.current}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>Start: {data.start_date}</Text>
        <Text style={styles.dateText}>End: {data.end_date}</Text>
        <TouchableOpacity
          onPress={() => handleEditStatus(data, statusName.current)}>
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

    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    paddingVertical: 20,
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
    fontWeight: 'bold',
    fontSize: 16,
    paddingLeft: 10,
    paddingVertical: 5,
  },
  dateText: {
    color: 'black',
    paddingHorizontal: 5,
  },
  statusTitleContainer: {
    borderRadius: 10,
    borderWidth: 2,
  },
});

export default StatusList;
