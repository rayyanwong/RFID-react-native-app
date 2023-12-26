import React, {useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Dimensions,
  Button,
  TouchableOpacity,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {SupaConductStatus} from '../../supabase/database';
import Entypo from 'react-native-vector-icons/Entypo';

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
  const statusId = data.statusId;
  return (
    <View>
      <Modal visible={editStatusVisible} transparent={true}>
        <View style={styles.promptContainer}>
          <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
          <View style={styles.prompt}>
            <View style={styles.promptHeader}>
              <Text
                style={{
                  fontFamily: 'OpenSans-Bold',
                  fontSize: 18,
                  maxWidth: '80%',
                  textAlign: 'center',
                  alignSelf: 'center',
                  marginHorizontal: 14,
                  marginVertical: 16,
                  color: 'black',
                }}>
                {data.statusName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setNewEndDate(new Date(data.end_date));
                  cancelPrompt();
                }}
                style={{
                  backgroundColor: '#e9ecef',
                  width: 24,
                  height: 24,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  right: 16,
                  top: 16,
                  position: 'absolute',
                }}>
                <Entypo name="cross" size={16} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => setEdVisible(true)}>
                <Text style={styles.btnText}>New End Date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                  updateDBUserStatus(statusUUID, new_endDate);
                  cancelPrompt();
                }}>
                <Text style={styles.btnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
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
    marginTop: (Dimensions.get('window').height / 3) * 0.5,
    alignSelf: 'center',
    width: '90%',
    height: '30%',
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'column',
  },
  promptHeader: {marginVertical: 8},
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignSelf: 'center',
    borderRadius: 16,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
    width: '60%',
    marginVertical: 6,
  },
  btnText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 14,
    color: 'white',
    paddingVertical: 16,
  },
  btnContainer: {
    marginTop: 20,
  },
});

export default EditStatusPrompt;
