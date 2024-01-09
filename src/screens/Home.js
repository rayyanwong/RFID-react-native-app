import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import {openDatabase} from 'react-native-sqlite-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ConductList from '../components/ConductList';
import NetInfo from '@react-native-community/netinfo';
import NetworkModal from '../components/NetworkModal';
import {SupaConduct} from '../../supabase/database';
import SelectDropdown from 'react-native-select-dropdown';
import CheckBox from '@react-native-community/checkbox';
import DatePicker from 'react-native-date-picker';
import HomeAvatar from '../components/HomeAvatar';
import {useIsFocused} from '@react-navigation/native';

const db = openDatabase({
  name: 'appDatabase',
});
//test
const Home = ({navigation}) => {
  //   const [newConduct, setnewConduct] = useState('');
  const [modalVisible, setmodalVisible] = useState(false);
  const [input, setInput] = useState('');
  const [lastinsertId, setlastinsertId] = useState(null);
  const [allConducts, setallConducts] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [networkModalVisible, setNetworkModalVisible] = useState(isOffline);
  const [conductsCreationArr, setConductsCreationArr] = useState([]);
  const [isConducting, setConducting] = useState(false);
  const newconductDBid = useRef(null);
  const [datePickerVisible, setdatePickerVisible] = useState(false);
  const [newConductDate, setNewConductDate] = useState(new Date());
  const companies = ['ALPHA', 'BRAVO', 'CHARLIE', 'SUPPORT', 'CA', 'HQ'];
  const [company, setCompany] = useState('');
  const [ipptUUID, setIpptUUID] = useState('');

  const isFocused = useIsFocused();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      setNetworkModalVisible(offline);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDBData = async () => {
      if (!isOffline) {
        const {data, error} = await SupaConduct.getAllConducts();
        if (error) {
          console.log(
            'An Error has occured while fetching DB conduct details: ',
            error,
          );
        } else {
          setConductsCreationArr(data);
          // [{'conductid','conductName'},...]
          console.log(
            'Successfully set Conducts Creation Arr with all Database type of conducts',
          );
        }
      } else {
        setConductsCreationArr([
          {conductName: 'Conventional Operation Outfield', conductid: 23},
          {conductName: 'Urban Operation Outfield', conductid: 22},
        ]);
      }
    };
    fetchDBData();
  }, [isOffline]);

  //console.log(conductsCreationArr);

  const onDismiss = () => {
    setNetworkModalVisible(false);
  };
  const createUserTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Users (userid INTEGER PRIMARY KEY AUTOINCREMENT, userNRIC VARCHAR(9), userName TEXT, userHPNo INTEGER)`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Successfully created Users table');
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const createConductTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Conducts (conductid INTEGER PRIMARY KEY AUTOINCREMENT, conductName TEXT, conductDBid integer, conducting boolean, conductdate text,company TEXT, conductdbuuid TEXT)`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Successfully created Conducts Table');
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const createAttendanceTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Attendance (
                userid integer,
                conductid integer,
                accounted boolean ,
                eligible boolean, 
                forcego boolean,
                primary key (userid, conductid), 
                foreign key (userid) references Users(userid), 
                foreign key (conductid) references Conducts(conductid));`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Successfully created Attendance Table');
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const delConductTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `DROP TABLE IF EXISTS Conducts`,
        [],
        (txObj, resultSet) => {
          console.log('Conducts table removed');
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const delAttendanceTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `DROP TABLE IF EXISTS Attendance`,
        [],
        (txObj, resultSet) => {
          console.log('Attendance table removed');
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const getAllConducts = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM CONDUCTS`,
        [],
        (txObj, resultSet) => {
          if (resultSet.rows.length == 0) {
            Alert.alert('Conducts table is empty');
          } else {
            var curConducts = resultSet.rows;
            var tempConducts = [];
            for (let i = 0; i < curConducts.length; i++) {
              tempConducts.push(curConducts.item(i));
            }
            console.log(tempConducts);
            setallConducts(tempConducts);
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const handleAddConduct = () => {
    if (input === '' || newconductDBid.current == null) {
      Alert.alert('Input cannot be empty!');
      return;
    }

    // If not, insert the conduct into db
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO Conducts(conductName,conductDBid,conducting,conductdate,company, conductdbuuid) values (?,?,?,?,?,?)`,
          [
            input,
            newconductDBid.current,
            isConducting,
            newConductDate.toLocaleDateString(),
            company,
            ipptUUID,
          ],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected > 0) {
              console.log(`${input} successfully inserted into conducts table`);
              // insert into Attendance table
              console.log('Insert id: ', resultSet.insertId);
              var curConductid = resultSet.insertId;
              console.log('Current conduct id: ', curConductid);
              console.log(
                'ConductDBid of newly created conduct: ',
                newconductDBid.current,
              );
              db.transaction(tx => {
                tx.executeSql(
                  `SELECT userid FROM USERS where userid > 0`,
                  [],
                  (txObj, res) => {
                    var curUsers = res.rows;
                    for (let i = 0; i < curUsers.length; i++) {
                      let curUserid = curUsers.item(i).userid;
                      insertAttendance(curUserid, curConductid);
                    }
                  },
                  error => {
                    console.log(error);
                  },
                );
              });

              setInput('');
              setmodalVisible(false);
              getAllConducts();
              setConducting(false);
              setCompany('');
            }
          },
        );
      },
      error => {
        console.log(error);
      },
    );
  };

  const handleConductDetails = conductObj => {
    if (conductObj.conducting) {
      navigation.navigate('ConductingView', {
        name: conductObj.conductName,
        data: conductObj,
      });
    } else {
      navigation.navigate('ConductDetails', {
        name: conductObj.conductName,
        data: conductObj,
      });
    }
  };

  const insertAttendance = (userid, conductid) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ATTENDANCE(userid,conductid,accounted,eligible,forcego) VALUES (?,?,?,?,?)`,
        [userid, conductid, 0, 1, 0],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log(
              `Inserted userid: ${userid} into conductid: ${conductid}`,
            );
          }
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  const handleDelete = conductid => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ATTENDANCE where conductid = (?)`,
        [conductid],
        (txObj, resultSet) => {
          console.log('Deleted from attendance');
          db.transaction(tx => {
            tx.executeSql(
              `DELETE FROM Conducts where conductid = (?)`,
              [conductid],
              (txObj, resultSet) => {
                if (resultSet.rowsAffected > 0) {
                  console.log(`Removed ${conductid} from Conducts table`);
                  Alert.alert(`Delete successful`);
                  let existingConducts = [...allConducts].filter(
                    conduct => conduct.conductid !== conductid,
                  );
                  setallConducts(existingConducts);
                }
              },
              error => {
                console.log(error);
              },
            );
          });
        },
        error => {
          console.log(error);
        },
      );
    });
  };

  useEffect(() => {
    createUserTable();
    createConductTable();
    createAttendanceTable();
  }, []);
  useEffect(() => {
    getAllConducts();
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        {/* <TouchableOpacity
          disabled={false}
          style={styles.actionBtn}
          onPress={() => delConductTable()}>
          <MaterialIcons name="info-outline" size={24} color="black" />
        </TouchableOpacity> */}
        <HomeAvatar />
        {/* <Text style={styles.headerText}>Home</Text> */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setmodalVisible(true)}>
          <MaterialIcons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        marginHorizontal={10}
        marginTop={24}
        showsHorizontalScrollIndicator={false}
        data={allConducts}
        keyExtractor={item => String(item.conductid)}
        renderItem={({item}) => (
          <ConductList
            data={item}
            handleConductDetails={handleConductDetails}
            handleDelete={handleDelete}
          />
        )}
      />
      <NetworkModal show={networkModalVisible} onDismiss={onDismiss} />
      <Modal animationType="fade" visible={modalVisible}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setmodalVisible(false);
                setInput('');
                setConducting(false);
                setNewConductDate(new Date());
                newconductDBid.current = null;
                setIpptUUID('');
              }}>
              <Ionicons
                name="arrow-back-circle-outline"
                size={30}
                color="black"
              />
            </TouchableOpacity>
            <Text style={styles.modalText}>Create new conduct</Text>
          </View>
          <TextInput
            multiline={true}
            placeholder="Name of new conduct"
            style={styles.inputField}
            value={input}
            onChangeText={text => setInput(text)}
            textAlignVertical="center"
            maxLength={50}
            onKeyPress={e => {
              if (e.nativeEvent.key == 'Enter') {
                Keyboard.dismiss();
              }
            }}
          />
          <View style={styles.checkBoxContainer}>
            <CheckBox
              value={isConducting}
              onValueChange={newValue => {
                setConducting(newValue);
                console.log(newValue);
              }}
              style={styles.checkBoxStyle}
            />
            <Text style={styles.checkBoxLabel}>Create as conducting</Text>
          </View>
          <SelectDropdown
            data={conductsCreationArr}
            onSelect={(selectedItem, index) => {
              //console.log(selectedItem, index);
              newconductDBid.current = selectedItem.conductid;
              console.log('Current conductdbid is: ', newconductDBid.current);
            }}
            defaultButtonText={'Select Conduct Type'}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.conductName;
            }}
            rowTextForSelection={(item, index) => {
              return item.conductName;
            }}
            buttonStyle={styles.dropdownBtnStyle}
            buttonTextStyle={styles.dropdownBtnTextStyle}
            renderDropdownIcon={isOpened => {
              return (
                <FontAwesome
                  name={isOpened ? 'chevron-up' : 'chevron-down'}
                  color={'#FFF'}
                  size={18}
                />
              );
            }}
            dropdownIconPosition="right"
            dropdownStyle={styles.dropdownDropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTextStyle}
            selectedRowStyle={styles.dropdownSelectedRowStyle}
            search
            searchInputStyle={styles.dropdownSearhInputStyle}
            searchPlaceHolder="Search for conduct"
            searchPlaceHolderColor="#F8F8F8"
            renderSearchInputLeftIcon={() => {
              return <FontAwesome name="search" color="#FFF" size={18} />;
            }}
          />
          <SelectDropdown
            data={companies}
            onSelect={(selectedItem, index) => {
              //console.log(selectedItem, index);
              setCompany(selectedItem);
            }}
            defaultButtonText={'Select Company'}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              return item;
            }}
            buttonStyle={styles.dropdownBtnStyle}
            buttonTextStyle={styles.dropdownBtnTextStyle}
            renderDropdownIcon={isOpened => {
              return (
                <FontAwesome
                  name={isOpened ? 'chevron-up' : 'chevron-down'}
                  color={'#FFF'}
                  size={18}
                />
              );
            }}
            dropdownIconPosition="right"
            dropdownStyle={styles.dropdownDropdownStyle}
            rowStyle={styles.dropdownRowStyle}
            rowTextStyle={styles.dropdownRowTextStyle}
            selectedRowStyle={styles.dropdownSelectedRowStyle}
            search
            searchInputStyle={styles.dropdownSearhInputStyle}
            searchPlaceHolder="Search company"
            searchPlaceHolderColor="#F8F8F8"
            renderSearchInputLeftIcon={() => {
              return <FontAwesome name="search" color="#FFF" size={18} />;
            }}
          />
          <TouchableOpacity
            style={styles.dropdownBtnStyle}
            onPress={() => setdatePickerVisible(true)}>
            <Text style={styles.dropdownBtnTextStyle}>Select Conduct date</Text>
          </TouchableOpacity>
          <DatePicker
            theme="dark"
            modal
            mode="date"
            open={datePickerVisible}
            date={newConductDate}
            onConfirm={date => {
              setdatePickerVisible(false);
              setNewConductDate(date);
              console.log(date.toLocaleDateString());
            }}
            onCancel={() => {
              setdatePickerVisible(false);
            }}
          />
          {newconductDBid.current === 15 && isConducting === false && (
            <View>
              <TextInput
                multiline={true}
                placeholder="UUID of IPPT conduct"
                style={styles.inputField}
                value={ipptUUID}
                onChangeText={text => setIpptUUID(text)}
                textAlignVertical="center"
                maxLength={100}
                onKeyPress={e => {
                  if (e.nativeEvent.key == 'Enter') {
                    Keyboard.dismiss();
                  }
                }}
              />
            </View>
          )}
          <TouchableOpacity
            style={styles.newConductBtn}
            onPress={handleAddConduct}>
            <MaterialIcons name="add-to-home-screen" size={24} color="#FFF" />
            <Text style={styles.handleAddText}>Add new conduct</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fbfcfd',
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  headerText: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'OpenSans-Bold',
    fontWeight: '300',
  },
  actionBtn: {
    alignItems: 'center',
    width: 45,
    height: 45,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    borderRadius: 16,
    elevation: 2,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },

  modalContainer: {
    backgroundColor: '#fbfcfd',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fbfcfd',
    marginTop: 14,
    marginHorizontal: 16,
  },
  modalText: {
    marginLeft: 70,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  newConductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignSelf: 'center',
    borderRadius: 8,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
    marginTop: 60,
    width: '80%',
  },
  inputField: {
    fontSize: 14,
    width: '80%',
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 9,
    height: 55,
    textAlignVertical: 'top',
    color: '#000',
    borderRadius: 10,
    borderWidth: 2,
    textAlign: 'center',
    fontFamily: 'OpenSans-Regular',
  },

  handleAddText: {
    color: 'white',
    padding: 18,
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
  },
  dropdownBtnStyle: {
    width: '80%',
    height: 50,
    backgroundColor: '#444',
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 24,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  dropdownBtnTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
  },
  dropdownDropdownStyle: {
    backgroundColor: '#444',
    borderRadius: 12,
  },
  dropdownRowStyle: {
    backgroundColor: '#444',
    borderBottomColor: '#C5C5C5',
  },
  dropdownRowTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'OpenSans-Bold',
  },
  dropdownSelectedRowStyle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dropdownSearhInputStyle: {
    backgroundColor: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#FFF',
  },
  checkBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  checkBoxStyle: {
    alignSelf: 'center',
  },
  checkBoxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: 'black',
    fontFamily: 'OpenSans-Bold',
  },
});

export default Home;
