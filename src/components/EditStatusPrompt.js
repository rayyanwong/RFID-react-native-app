import React, {useRef} from 'react';
import {View, StyleSheet, Text, Modal, Dimensions, Button} from 'react-native';

const EditStatusPrompt = ({
  data,
  editStatusVisible,
  updateDBUserStatus,
  cancelPrompt,
}) => {
  return (
    <View>
      <Modal visible={editStatusVisible} transparent={true}>
        <View style={styles.promptContainer}>
          <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
          <View style={styles.prompt}>
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
});

export default EditStatusPrompt;
