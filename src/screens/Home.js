import React, {useState, useEffect} from 'react';
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
import ConductList from '../components/ConductList';

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
        `CREATE TABLE IF NOT EXISTS Conducts (conductid INTEGER PRIMARY KEY AUTOINCREMENT, conductName TEXT)`,
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
    if (input === '') {
      Alert.alert('Input cannot be empty!');
      return;
    }

    // If not, insert the conduct into db
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO Conducts(conductName) values (?)`,
          [input],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected > 0) {
              console.log(`${input} successfully inserted into conducts table`);
              // insert into Attendance table
              console.log(resultSet.insertId);
              var curConductid = resultSet.insertId;
              console.log(curConductid);
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
    navigation.navigate('ConductDetails', {
      name: conductObj.conductName,
      data: conductObj,
    });
  };

  const insertAttendance = (userid, conductid) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO ATTENDANCE(userid,conductid,accounted) VALUES (?,?,?)`,
        [userid, conductid, 0],
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
          />
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
        onPress={() => createAttendanceTable()}>
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
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
    height: 85,
    textAlignVertical: 'top',
    color: '#000',
    borderRadius: 10,
  },

  handleAddText: {
    color: 'white',
    padding: 18,
    fontSize: 14,
  },
});

export default Home;
