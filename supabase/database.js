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

  async updateUserStatus(statusUUID, new_endDate) {
    let {data, error} = await supabase
      .from('UserStatus')
      .update({end_date: new_endDate})
      .eq('statusUUID', statusUUID)
      .select();
    return {data, error};
  }
  async deleteUserStatus(statusUUID) {
    let {data, error} = await supabase
      .from('UserStatus')
      .delete()
      .eq('statusUUID', statusUUID);
    return {data, error};
  }
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

class ConductTable {
  async getAllConducts() {
    let {data, error} = await supabase.from('Conducts').select('*');
    return {data, error};
  }
  async getConductId(conductName) {
    let {data, error} = await supabase
      .from('Conducts')
      .select('conductId')
      .eq('conductName', conductName);
    return {data, error};
  }
  async getAllConductNames() {
    let {data, error} = await supabase.from('Conducts').select('conductName');
    return {data, error};
  }
}

export const SupaUser = new UserTable();
export const SupaUserStatus = new UserStatusTable();
export const SupaStatus = new StatusTable();
export const SupaConduct = new ConductTable();