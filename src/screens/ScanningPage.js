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
  Dimensions,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NfcManager, {NfcEvents, NfcTech, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from '../components/AndroidPrompt';
import {validInputData} from '../utils/validInputData';
import ArfModal from '../components/arfModal';
import Entypo from 'react-native-vector-icons/Entypo';

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
        const [newName, newNRIC, newHPNo, ipptGo] = newTag.split(',');
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

    let newDataObj = `${towriteName},${towriteNRIC},${towriteHP},1`;
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
      <View style={styles.pageHeader}>
        <Text style={styles.headerText}>Scanning</Text>
      </View>
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={[styles.pageBtn, styles.addBtn]}
          onPress={nfcAddUser}>
          <Text style={styles.btnText}>Add user using NFC</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pageBtn, styles.addBtn]}
          onPress={() => {
            setaddModalVisible(true);
          }}>
          <Text style={styles.btnText}>Add user manually</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pageBtn, styles.writeBtn]}
          onPress={() => {
            setwriteModalVisible(true);
          }}>
          <Text style={styles.btnText}>Set write data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pageBtn, styles.writeBtn]}
          onPress={() => {
            nfcWriteUser();
          }}>
          <Text style={styles.btnText}>Write data onto NFC tag</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={true}
          style={[styles.pageBtn, styles.arfBtn]}
          onPress={() => setARFVisible(true)}>
          <Text style={styles.btnText}>ARF Scanner</Text>
        </TouchableOpacity>
      </View>
      <AndroidPrompt ref={promptRef} />
      <Modal visible={addModalVisible} animationType="fade">
        <SafeAreaView style={styles.manualModalContainer}>
          <View style={styles.manualModalHeader}>
            <TouchableOpacity onPress={() => setaddModalVisible(false)}>
              <MaterialIcons
                size={24}
                name="arrow-back-ios"
                style={{color: 'black'}}
              />
            </TouchableOpacity>
            <Text style={styles.manualModalTitle}>Manually add user</Text>
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
            style={styles.manualBtn}
            onPress={() => manualAddUser()}>
            <MaterialIcons name="person-add" size={24} color="white" />
            <Text style={styles.manualBtnText}>Add new user to database</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <Modal visible={writeModalVisible} animationType="fade">
        <SafeAreaView style={styles.manualModalContainer}>
          <View style={styles.manualModalHeader}>
            <TouchableOpacity onPress={() => setwriteModalVisible(false)}>
              <MaterialIcons
                size={24}
                name="arrow-back-ios"
                style={{color: 'black'}}
              />
            </TouchableOpacity>
            <Text style={[styles.manualModalTitle, {marginLeft: 100}]}>
              Set data to write
            </Text>
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
            style={styles.manualBtn}
            onPress={() => setWriteData()}>
            <MaterialIcons name="person-add" size={24} color="white" />
            <Text style={styles.manualBtnText}>Set write data</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
      <ArfModal arfVisible={arfVisible} setARFVisible={handleARFVisible} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fbfcfd',
    flex: 1,
  },
  btnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  headerText: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontWeight: '300',
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    borderRadius: 6,
    alignItems: 'center',
    alignItems: 'center',
  },
  pageBtn: {
    backgroundColor: '#f8f9fa',
    marginVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'black',
    width: '70%',
    alignItems: 'center',
    elevation: 10,
    shadowOpacity: 0.6,
    shadowOffset: {
      width: 10,
      height: 30,
    },
    shadowRadius: 1,
  },
  btnText: {
    color: 'black',
    fontSize: 14,
    padding: 16,
    fontFamily: 'OpenSans-Bold',
  },
  manualModalContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  textInput: {
    fontSize: 12,
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 9,
    height: 50,
    borderWidth: 1,
    color: '#000',
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
    textAlign: 'center',
  },

  manualModalTitle: {
    color: 'black',
    fontSize: 16,
    marginLeft: 90,
    fontFamily: 'OpenSans-Bold',
  },
  manualModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',

    marginTop: 50,
    borderRadius: 8,
    height: 50,
    width: '80%',
    alignSelf: 'center',
  },
  manualBtnText: {
    fontSize: 12,
    marginLeft: 16,
    color: 'white',
    fontFamily: 'OpenSans-Bold',
  },

  arfBtn: {
    // shadowColor: '#fcca46',
    // shadowOpacity: 0.1,
  },
});

export default ScanningPage;
