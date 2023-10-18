import React, {useRef, useState} from 'react';
import {View, StyleSheet, Text, Modal, Dimensions, Button} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {SupaUserStatus} from '../../supabase/database';

const EditStatusPrompt = ({
  data,
  editStatusVisible,
  updateDBUserStatus,
  cancelPrompt,
}) => {
  if (data === null) {
    return;
  }
  const statusUUID = data.statusUUID;
  const [new_endDate, setNewEndDate] = useState(new Date(data.end_date));
  const [edVisible, setEdVisible] = useState(false);
  return (
    <View>
      <Modal visible={editStatusVisible} transparent={true}>
        <View style={styles.promptContainer}>
          <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
          <View style={styles.prompt}>
            <Text style={styles.titleHeader}>Status: {data.statusName}</Text>
            <Button
              title="Select New End Date"
              onPress={() => setEdVisible(true)}
            />
            <DatePicker
              theme="dark"
              modal
              mode="date"
              open={edVisible}
              date={new_endDate}
              onConfirm={date => {
                setEdVisible(false);
                setNewEndDate(date);
                console.log(date.toLocaleDateString());
              }}
              onCancel={() => {
                setEdVisible(false);
              }}
            />
            <Button
              title="Save Changes"
              onPress={() => {
                updateDBUserStatus(statusUUID, new_endDate);
                cancelPrompt();
              }}
            />
            <Button title="Cancel" onPress={cancelPrompt} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  promptContainer: {flex: 1},
  prompt: {
    position: 'absolute',
    bottom: Dimensions.get('window').height / 2,
    left: 20,
    width: Dimensions.get('window').width - 2 * 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleHeader: {
    fontSize: 24,
    fontWeight: '400',
    color: 'black',
  },
});

export default EditStatusPrompt;
