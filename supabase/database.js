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

  async getUserStatus(userId) {
    let {data, error} = await supabase
      .from('UserStatus')
      .select('*')
      .eq('userId', userId)
      .gte('end_date', new Date().toLocaleString());
    return {data, error};
  }

  // async getUserStatusNRIC(userNRIC, cur_Date) {
  //   const {data, error} = await supabase
  //     .from('UserStatus')
  //     .select(
  //       `Status(statusName),
  //     start_date,
  //     end_date`,
  //     )
  //     .eq('User(userNRIC)', userNRIC)
  //     .gte('end_date', cur_Date);
  // }
}

class StatusTable {
  async getAllStatus() {
    let {data, error} = await supabase.from('Status').select('*');
    return {data, error};
  }
  async getStatusId(statusName) {
    let {data, error} = await supabase
      .from('Status')
      .select('statusId')
      .eq('statusName', statusName);
    return {data, error};
  }
  async getAllStatusNames() {
    let {data, error} = await supabase.from('Status').select('statusName');
    return {data, error};
  }
}

export const SupaUser = new UserTable();
export const SupaUserStatus = new UserStatusTable();
export const SupaStatus = new StatusTable();
