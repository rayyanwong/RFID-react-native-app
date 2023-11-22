import React, {useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NfcManager, {NfcEvents, NfcTech, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from './AndroidPrompt';
import {SupaArfAttendance} from '../../supabase/database';
import ARFManualPrompt from './arfManualPrompt';
import ReqReportPrompt from './reqReportPrompt';

const ArfModal = ({arfVisible, setARFVisible}) => {
  const promptRef = useRef();
  const manualPromptRef = useRef();
  const reqReportPromptRef = useRef();

  async function handleNFCScan() {
    await NfcManager.registerTagEvent();
    if (Platform.OS === 'android') {
      promptRef.current.setPromptVisible(true);
      promptRef.current.setHintText('Please scan your NFC');
    }
    NfcManager.setEventListener(NfcEvents.DiscoverTag, async tag => {
      try {
        var newTag = Ndef.text.decodePayload(tag.ndefMessage[0].payload);
        const [newName, newNRIC, newHPNo] = newTag.split(',');
        // add user into Backend
        const {data, error} = await SupaArfAttendance.insertRecord(
          newNRIC,
          newName,
          newHPNo,
        );
        if (error) {
          console.log(
            '[ARFModal]: Error while inserting new Record into backend DB',
          );
        } else if (data) {
          console.log(
            `[ARFModal]: Successfully inserted data of ${newName} of NRIC: ${newNRIC} into backend DB`,
          );
        }
      } catch (e) {
        console.log('[ARFmodal]: Error while trying to scan for nfc');
      } finally {
        NfcManager.unregisterTagEvent().catch(() => 0);
        promptRef.current.setHintText('');
        promptRef.current.setPromptVisible(false);
      }
    });
  }

  const handleManualAdd = () => {
    // get bottom prompt tab
    if (Platform.OS === 'android') {
      manualPromptRef.current.setPromptVisible(true);
    }
  };
  return (
    <View>
      <Modal visible={arfVisible} animationType="fade">
        <View style={styles.arfContainer}>
          <View style={styles.modalHeaderContainer}>
            <TouchableOpacity onPress={() => setARFVisible(false)}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
            <Text
              style={{
                color: '#FFF',
                fontSize: 20,
                marginLeft: 100,
                fontWeight: '500',
                fontFamily: 'OpenSans-Medium',
              }}>
              ARF Scanner
            </Text>
          </View>
          <View style={styles.btnBox}>
            <TouchableOpacity style={styles.btn} onPress={handleNFCScan}>
              <Text style={styles.btnText}>NFC Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleManualAdd}>
              <Text style={styles.btnText}>Account Manually</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => reqReportPromptRef.current.setPromptVisible(true)}>
              <Text style={styles.btnText}>Generate Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <AndroidPrompt ref={promptRef} />
      <ARFManualPrompt ref={manualPromptRef} />
      <ReqReportPrompt ref={reqReportPromptRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeaderContainer: {
    marginVertical: 15,
    marginHorizontal: 10,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#733a70',
  },
  arfContainer: {
    flex: 1,
    backgroundColor: '#140a14',
  },
  btnBox: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ab59a7',
    marginTop: 240,
    alignSelf: 'center',
    borderRadius: 60,
    width: Dimensions.get('window').width - 60,
    height: Dimensions.get('window').height / 3,
  },
  btnText: {
    color: 'white',
    fontFamily: 'OpenSans-Light',
    fontSize: 18,
  },
  btn: {
    backgroundColor: '#733a70',
    width: 240,
    height: 60,
    alignItems: 'center',
    marginVertical: 15,
    justifyContent: 'center',
    borderRadius: 60,
  },
});

export default ArfModal;
