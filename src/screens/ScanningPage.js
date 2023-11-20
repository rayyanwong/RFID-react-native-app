import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  View,
  Alert,
  Platform,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NfcManager, {NfcEvents, NfcTech, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/AndroidPrompt';
import {validInputData} from '../utils/validInputData';
import ArfModal from '../components/arfModal';

const db = openDatabase({
  name: 'appDatabase',
});

const ScanningPage = () => {
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [writeModalVisible, setwriteModalVisible] = useState(false);
  const [qrScannerVisible, setQRScannerVisible] = useState(false);
  const [towriteName, settoWriteName] = useState(null);
  const [towriteNRIC, settoWriteNRIC] = useState(null);
  const [towriteHP, settoWriteHP] = useState(null);
  const [nameinput, setnameinput] = useState(null);
  const [nricinput, setnricinput] = useState(null);
  const [hpinput, sethpinput] = useState(null);
  const [newWriteData, setNewWriteData] = useState('');
  const [hasNfc, setHasNfc] = useState(null);
  const promptRef = useRef();
  const [arfVisible, setARFVisible] = useState(false);

  const handleARFVisible = f => {
    setARFVisible(f);
  };

  useEffect(() => {
    const checkIsSupported = async () => {
      const deviceIsSupported = await NfcManager.isSupported();
      setHasNfc(deviceIsSupported);
      console.log(deviceIsSupported);
      if (deviceIsSupported) {
        console.log('[ScanningPage] NFC is supported');
        await NfcManager.start();
      } else {
        console.log('[ScanningPage] NFC is not supported');
      }
    };
    checkIsSupported();
  }, []);

  const manualAddUser = () => {
    if (!validInputData(nameinput, nricinput, hpinput)) {
      Alert.alert('Invalid inputs, please try again');
      setnameinput('');
      sethpinput('');
      setnricinput('');
      return;
    }
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Users(userNRIC,userName,userHPNo) VALUES (?,?,?)`,
        [nricinput, nameinput, hpinput],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            Alert.alert(`Successfully added user ${nameinput} into database!`);
            setnameinput('');
            sethpinput('');
            setnricinput('');
            setaddModalVisible(false);
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  async function nfcAddUser() {
    await NfcManager.registerTagEvent();
    if (Platform.OS === 'android') {
      promptRef.current.setPromptVisible(true);
      promptRef.current.setHintText('Please scan your NFC');
    }
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      try {
        var newTag = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
        const [newName, newNRIC, newHPNo] = newTag.split(',');
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO Users(userNRIC,userName,userHPNo) VALUES (?,?,?)`,
            [newNRIC, newName, newHPNo],
            (txObj, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                Alert.alert(`Successfully added ${newName} into the database`);
              }
            },
            error => {
              console.log(error);
            },
          );
        });
      } catch (e) {
        console.warn(e);
      } finally {
        NfcManager.unregisterTagEvent().catch(() => 0);
        promptRef.current.setHintText('');
        promptRef.current.setPromptVisible(false);
      }
    });
  }

  const setWriteData = () => {
    if (!validInputData(towriteName, towriteNRIC, towriteHP)) {
      Alert.alert('Invalid inputs, please try again');
      settoWriteName('');
      settoWriteNRIC('');
      settoWriteHP('');
      return;
    }

    let newDataObj = `${towriteName},${towriteNRIC},${towriteHP}`;
    console.log(newDataObj);
    setNewWriteData(newDataObj);
    settoWriteName('');
    settoWriteNRIC('');
    settoWriteHP('');
    Alert.alert(
      "Created new write data! Click 'Write data onto NFC tag' to write",
    );
    setwriteModalVisible(false);
  };

  async function nfcWriteUser() {
    await NfcManager.registerTagEvent();
    if (Platform.OS === 'android') {
      promptRef.current.setPromptVisible(true);
      promptRef.current.setHintText('Please scan NFC you want to write to!');
    }
    let result = false;
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      console.log(newWriteData);
      let bytes = Ndef.encodeMessage([Ndef.textRecord(newWriteData)]);
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        Alert.alert('Tag successfully written');
        result = true;
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error writing tag, try again!');
    } finally {
      NfcManager.cancelTechnologyRequest();
      NfcManager.unregisterTagEvent().catch(() => 0);
      promptRef.current.setHintText('');
      promptRef.current.setPromptVisible(false);
    }
    return result;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={nfcAddUser}>
        <Text style={styles.btnText}>Add user using NFC</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          setaddModalVisible(true);
        }}>
        <Text style={styles.btnText}>Add user manually</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.writeBtn}
        onPress={() => {
          setwriteModalVisible(true);
        }}>
        <Text style={styles.btnText}>Set write data</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.writeBtn}
        onPress={() => {
          nfcWriteUser();
        }}>
        <Text style={styles.btnText}>Write data onto NFC tag</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.qrscanBtn} onPress={() => {}}>
        <Text style={styles.btnText}>Scan Conduct QRCode</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.qrscanBtn}
        onPress={() => setARFVisible(true)}>
        <Text style={styles.btnText}>ARF Scanner</Text>
      </TouchableOpacity>
      <AndroidPrompt ref={promptRef} />
      <Modal visible={addModalVisible} animationType="fade">
        <SafeAreaView style={styles.addModalContainer}>
          <View style={styles.addModalHeader}>
            <TouchableOpacity onPress={() => setaddModalVisible(false)}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.addModalTitle}>Manually add user</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter name of new user"
            placeholderTextColor="grey"
            value={nameinput}
            onChangeText={text => setnameinput(text)}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter NRIC of new user"
            placeholderTextColor="grey"
            value={nricinput}
            onChangeText={text => setnricinput(text)}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Phone number of new user"
            placeholderTextColor="grey"
            value={hpinput}
            onChangeText={text => sethpinput(text)}
          />
          <TouchableOpacity
            style={styles.manualAddbtn}
            onPress={() => manualAddUser()}>
            <MaterialIcons name="person-add" size={24} color="white" />
            <Text style={styles.manualAddbtnText}>
              Add new user to database
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <Modal visible={writeModalVisible} animationType="fade">
        <SafeAreaView style={styles.writeModalContainer}>
          <View style={styles.writeModalHeader}>
            <TouchableOpacity onPress={() => setwriteModalVisible(false)}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <Text style={styles.writeModalTitle}>Set data to write to NFC</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter name of user to write"
            placeholderTextColor="grey"
            value={towriteName}
            onChangeText={text => settoWriteName(text)}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter NRIC of new user to write"
            placeholderTextColor="grey"
            value={towriteNRIC}
            onChangeText={text => settoWriteNRIC(text)}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Enter Phone number of new user to write"
            placeholderTextColor="grey"
            value={towriteHP}
            onChangeText={text => settoWriteHP(text)}
          />
          <TouchableOpacity
            style={styles.manualWritebtn}
            onPress={() => setWriteData()}>
            <MaterialIcons name="person-add" size={24} color="white" />
            <Text style={styles.manualWritebtnText}>Set write data</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <ArfModal arfVisible={arfVisible} setARFVisible={handleARFVisible} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dedbf0',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    padding: 16,
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#493c90',
    margin: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bdb7e1',
    width: 260,
    alignItems: 'center',
  },
  writeBtn: {
    backgroundColor: '#4cc19c',
    margin: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bdb7e1',
    width: 260,
    alignItems: 'center',
  },
  addModalContainer: {
    backgroundColor: '#dedbf0',
    flex: 1,
  },
  textInput: {
    fontSize: 15,
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 9,
    height: 50,
    textAlignVertical: 'center',
    color: '#000',
    borderRadius: 10,
  },

  addModalTitle: {
    color: '#FFF',
    fontSize: 20,
    marginLeft: 75,
    fontWeight: '500',
  },
  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#bdb7e1',
  },
  manualAddbtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#493c90',
    margin: 30,
    marginTop: 50,
    borderRadius: 8,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },
  manualAddbtnText: {
    padding: 18,
    fontSize: 14,
    color: '#FFF',
  },
  writeModalContainer: {
    backgroundColor: '#dedbf0',
    flex: 1,
  },
  writeModalTitle: {
    color: '#FFF',
    fontSize: 20,
    marginLeft: 55,
    fontWeight: '500',
  },
  writeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#4cc19c',
  },
  manualWritebtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4cc19c',
    margin: 30,
    marginTop: 50,
    borderRadius: 8,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },
  manualWritebtnText: {
    padding: 18,
    fontSize: 14,
    color: '#FFF',
  },
  qrscanBtn: {
    margin: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bdb7e1',
    width: 260,
    alignItems: 'center',
    backgroundColor: '#DA627D',
  },
});

export default ScanningPage;
