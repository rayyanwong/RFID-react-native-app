import React, {forwardRef, useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  PermissionsAndroid,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SupaArfAttendance} from '../../supabase/database';
import DatePicker from 'react-native-date-picker';
import {FormatDate} from '../utils/FormatDate';
import XLSX from 'xlsx';
import {writeFile, readFile, DownloadDirectoryPath} from 'react-native-fs';
import Toast from 'react-native-simple-toast';

const ReqReportPrompt = (props, ref) => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [reqDate, setReqDate] = useState(new Date());
  const [dpVisible, setDpVisible] = useState(false);
  const [dateText, setDateText] = useState(null);
  var RNFS = require('react-native-fs');

  useEffect(() => {
    if (ref) {
      ref.current = {
        setPromptVisible,
      };
    }
  }, [ref]);

  async function exportDownload() {
    console.log(FormatDate(reqDate.toLocaleDateString()));
    let {data, error} = await SupaArfAttendance.generateReport(
      FormatDate(reqDate.toLocaleDateString()),
    );
    if (data) {
      console.log('Data is: ', data);
    } else if (error) {
      console.log('Error obtained: ', error);
    }
    // console.log(RNFS.DownloadDirectoryPath + '/arfattendancefile.xlsx');
    let export_data = data;
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(export_data);
    XLSX.utils.book_append_sheet(wb, ws, 'ARF_Attendance_Data');
    const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});
    writeFile(
      DownloadDirectoryPath +
        `/arfattendancefile${FormatDate(new Date().toLocaleDateString())}.xlsx`,
      wbout,
      'ascii',
    )
      .then(r => {
        console.log('Successfully downloaded file onto Device!');
        Toast.showWithGravity(
          'Successfully downloaded file onto device!',
          Toast.LONG,
          Toast.CENTER,
        );
      })
      .catch(e => {
        console.log('Error occured while trying to save file!', e);
        Toast.showWithGravity(
          'An error occured while downloading the file. Please try again!',
          Toast.LONG,
          Toast.CENTER,
        );
      });
  }

  async function handleDownload() {
    try {
      let isPermittedExternalStorage = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (!isPermittedExternalStorage) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage permissions are required to download file.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
            buttonNeutral: 'Ask again later',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await exportDownload();
          console.log('Permission granted to download file.');
        } else {
          console.log('Permission Denied');
        }
      } else {
        await exportDownload();
      }
    } catch (e) {
      console.log('Error while trying to get permission to download file: ', e);
      return;
    }
  }
  return (
    <Modal visible={promptVisible} transparent={true} animationType="fade">
      <View style={styles.content}>
        <View style={[styles.backdrop, StyleSheet.absoluteFill]} />
        <View style={styles.prompt}>
          <View style={styles.promptHeader}>
            <Text style={styles.hint}>Select Date Of Data To Download</Text>
            <TouchableOpacity
              onPress={() => {
                setPromptVisible(false);
                setReqDate(new Date());
                setDateText(null);
              }}>
              <MaterialIcons name="cancel" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <DatePicker
            theme="dark"
            modal
            mode="date"
            open={dpVisible}
            date={reqDate}
            onConfirm={date => {
              setDpVisible(false);
              setReqDate(date);
              setDateText(date.toLocaleDateString());
              console.log(date.toLocaleDateString());
            }}
            onCancel={() => {
              setDpVisible(false);
            }}
          />
          <TouchableOpacity
            onPress={() => setDpVisible(true)}
            style={styles.btn}>
            <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
              {dateText || 'Select Date'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDownload} style={styles.btn}>
            <MaterialIcons name="download" size={20} color="white" />
            <Text style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}>
              Download File
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
    fontFamily: 'OpenSans-Light',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#b18feb',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#ab59a7',
    marginTop: 20,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default forwardRef(ReqReportPrompt);
