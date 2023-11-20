import React, {forwardRef, useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SupaArfAttendance} from '../../supabase/database';

const ARFManualPrompt = (props, ref) => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [newNRIC, setNewNRIC] = useState();
  const [newName, setNewName] = useState();
  const [newHPNo, setNewHPNo] = useState();

  const handleDone = () => {
    setPromptVisible(false);
    setNewNRIC(null);
    setNewHPNo(null);
    setNewName(null);
  };

  const handleAdd = async () => {
    // add to db;
    try {
      console.log(newNRIC, newName, newHPNo);
      const {data, error} = await SupaArfAttendance.insertRecord(
        newNRIC,
        newName,
        newHPNo,
      );
      if (error) {
        console.log(
          '[ARFManualPrompt] Error while inserting record',
          error,
          data,
        );
      } else if (data) {
        console.log(
          `[ARFManualPrompt] Successfully inserted ${newName} of nric: ${newNRIC} into backend DB.`,
        );
      }
    } catch (e) {
      console.log('[ARFManualPrompt] Error in handleAdd function: ', e);
    } finally {
      setPromptVisible(false);
      setNewNRIC(null);
      setNewHPNo(null);
      setNewName(null);
    }
  };

  useEffect(() => {
    if (ref) {
      ref.current = {
        setPromptVisible,
        setNewNRIC,
        setNewName,
        setNewHPNo,
      };
    }
  }, [ref]);

  return (
    <Modal visible={promptVisible} transparent={true} animationType="fade">
      <View style={styles.content}>
        <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
        <View style={styles.prompt}>
          <View style={styles.promptHeader}>
            <Text style={styles.hint}>Please enter soldier's info</Text>
            <TouchableOpacity
              onPress={() => {
                handleDone();
              }}>
              <MaterialIcons name="cancel" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textinput}
            placeholder="NRIC of soldier"
            onChangeText={text => setNewNRIC(text)}
            placeholderTextColor="grey"
            value={newNRIC}
            multiline={true}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Name of soldier"
            onChangeText={text => setNewName(text)}
            placeholderTextColor="grey"
            value={newName}
          />
          <TextInput
            style={styles.textinput}
            placeholder="HP No of soldier"
            onChangeText={text => setNewHPNo(text)}
            placeholderTextColor="grey"
            value={newHPNo}
          />
          <TouchableOpacity
            onPress={async () => {
              await handleAdd();
            }}
            style={styles.btn}>
            <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
              Account Soldier
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  prompt: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: Dimensions.get('window').width - 2 * 20,
    backgroundColor: '#733a70',
    borderRadius: 8,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  hint: {
    fontSize: 20,
    marginBottom: 0,
    textAlign: 'center',
    marginRight: 10,
    color: 'white',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#98FB98',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#ab59a7',
    marginTop: 10,
  },
  promptHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  textinput: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 60,
    marginVertical: 10,
    width: 300,
    textAlign: 'left',
    color: 'white',
    paddingHorizontal: 20,
  },
});

export default forwardRef(ARFManualPrompt);
