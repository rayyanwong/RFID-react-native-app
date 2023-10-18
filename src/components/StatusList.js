import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';

const StatusList = ({
  data,
  handleEditStatus,
  handleRemoveStatus,
  statusArr,
}) => {
  const statusIdx = data.statusId;
  const statusName = statusArr[statusIdx].statusName;

  return (
    <View style={styles.container}>
      <View style={styles.statusTitleContainer}>
        <Text style={styles.statusTitle}>{statusName}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{data.start_date}</Text>
        <Text style={styles.dateText}>{data.end_date}</Text>
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
  },
  statusTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    paddingLeft: 10,
  },
  dateText: {
    color: 'black',
    paddingHorizontal: 10,
  },
  statusTitleContainer: {
    borderRadius: 1,
    borderWidth: 1,
  },
});

export default StatusList;
