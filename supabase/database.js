import supabase from './initdatabase';

class UserTable {
  async findUser(userNRIC) {
    const {data, error} = await supabase
      .from('User')
      .select('*')
      .eq('userNRIC', userNRIC);
    return {data, error};
  }
}

class UserStatusTable {
  async addUserStatusPair(new_userId, new_statusId, statusStart, statusEnd) {
    const {data, error} = await supabase
      .from('UserStatus')
      .insert([
        {
          userId: new_userId,
          statusId: new_statusId,
          start_date: statusStart,
          end_date: statusEnd,
        },
      ])
      .select();
    return {data, error};
  }

  async getUserStatus(userId, cur_Date) {
    let {data: UserStatus, error} = await supabase
      .from('UserStatus')
      .select('*')
      .eq('userId', userId)
      .gte('end_date', cur_Date);
    return {data, error};
  }
}

export const SupaUser = new UserTable();
export const SupaUserStatus = new UserStatusTable();
