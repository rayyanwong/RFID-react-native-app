import {useMMKVStorage} from 'react-native-mmkv';

const useMMKV = () => {
  const {setItem, getItem, deleteItem} = useMMKVStorage();

  const setValue = (key, value) => {
    setItem(key, value);
  };

  const getValue = async key => {
    const value = await getItem(key);
    return value;
  };

  const removeValue = key => {
    deleteItem(key);
  };

  return {
    setValue,
    getValue,
    removeValue,
  };
};

export default useMMKV;
