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

  // NetInfo.addEventListener(networkState => {
  //   console.log('Connection type - ', networkState.type);
  //   console.log('Is connected? - ', networkState.isConnected);
  // });

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
        `CREATE TABLE IF NOT EXISTS Conducts (conductid INTEGER PRIMARY KEY AUTOINCREMENT, conductName TEXT, conductDBid integer, conducting boolean)`,
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
          `INSERT INTO Conducts(conductName,conductDBid,conducting) values (?,?,?)`,
          [input, newconductDBid.current, isConducting],
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
    getAllConducts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerText}>CONDUCTS</Text>
      </View>
      <FlatList
        marginHorizontal={10}
        marginTop={30}
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
            <TouchableOpacity onPress={() => setmodalVisible(false)}>
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
            placeholder="What conduct would you like to add"
            style={styles.conductInput}
            value={input}
            onChangeText={text => setInput(text)}
            textAlignVertical="center"
          />
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
          <TouchableOpacity
            style={styles.newConductBtn}
            onPress={handleAddConduct}>
            <MaterialIcons name="add-to-home-screen" size={24} color="#FFF" />
            <Text style={styles.handleAddText}>Add new conduct</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      <TouchableOpacity
        style={styles.addConductBtn}
        onPress={() => setmodalVisible(true)}>
        <MaterialIcons name="library-add" size={25} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.delConductBtn}
        onPress={() => delConductTable()}>
        <MaterialIcons name="info-outline" size={25} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dedbf0',
    flex: 1,
  },
  topHeader: {
    backgroundColor: '#bdb7e1',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#000',
    fontFamily: 'OpenSans-Bold',
  },
  addConductBtn: {
    position: 'absolute',
    alignItems: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#493c90',
    justifyContent: 'center',
    borderRadius: 30,
    bottom: 40,
    right: 25,
    elevation: 2,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },

  delConductBtn: {
    position: 'absolute',
    alignItems: 'center',
    width: 60,
    height: 60,
    backgroundColor: '#493c90',
    justifyContent: 'center',
    borderRadius: 30,
    bottom: 120,
    right: 25,
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
    backgroundColor: '#dedbf0',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#bdb7e1',
  },
  modalText: {
    marginLeft: 80,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  newConductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#493c90',
    margin: 30,
    borderRadius: 8,
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 1,
      height: 3,
    },
  },
  conductInput: {
    fontSize: 15,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 9,
    height: 55,
    textAlignVertical: 'top',
    color: '#000',
    borderRadius: 10,
  },

  handleAddText: {
    color: 'white',
    padding: 18,
    fontSize: 14,
  },
  dropdownBtnStyle: {
    width: '80%',
    height: 50,
    backgroundColor: '#444',
    borderRadius: 8,
    marginVertical: 10,
    marginTop: 30,
    alignSelf: 'center',
  },
  dropdownBtnTextStyle: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
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
    fontWeight: 'bold',
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
    marginTop: 10,
  },
  checkBoxStyle: {
    alignSelf: 'center',
  },
  checkBoxLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
