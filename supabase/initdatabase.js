import {createClient} from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import {SUPABASE_KEY, SUPABASE_URL} from '@env';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {persistSession: false},
});
export default supabase;
