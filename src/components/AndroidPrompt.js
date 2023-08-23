import React, {forwardRef, useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NfcManager from 'react-native-nfc-manager';

const AndroidPrompt = (props, ref) => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [hintText, setHintText] = useState('');

  useEffect(() => {
    if (ref) {
      ref.current = {
        setPromptVisible,
        setHintText,
      };
    }
  }, [ref]);

  return (
    <Modal visible={promptVisible} transparent={true}>
      <View style={styles.content}>
        <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
        <View style={styles.prompt}>
          <Text style={styles.hint}>{hintText || 'Hello NFC'}</Text>
          <MaterialCommunityIcons
            name="nfc"
            size={50}
            color="black"
            padding={20}
          />
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              setPromptVisible(false);
              setHintText('');
              NfcManager.unregisterTagEvent().catch(() => 0);
            }}>
            <Text style={{color: 'black'}}>CANCEL</Text>
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
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  hint: {
    fontSize: 24,
    marginBottom: 0,
    color: 'black',
    textAlign: 'center',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
  },
});

export default forwardRef(AndroidPrompt);
