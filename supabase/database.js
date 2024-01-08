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
  async getAllStatusId(userId) {
    let {data, error} = await supabase
      .from('UserStatus')
      .select('statusid')
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

  async joinUserQuery(userNRIC) {
    let {data, error} = await supabase
      .from('User')
      .select(
        `userid,
        Statusid:UserStatus(statusId)`,
      )
      .eq('userNRIC', userNRIC)
      .gte('UserStatus.end_date', new Date().toLocaleString());
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
  async getStatusName(statusid) {
    let {data, error} = await supabase
      .from('Status')
      .select('statusName')
      .eq('statusId', statusid);
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
class ConductStatusPairTable {
  async searchByPair(conductid, statusid) {
    let {data, error} = await supabase
      .from('ConductStatusPair')
      .select('go')
      .eq('conductid', conductid)
      .eq('statusid', statusid);
    return {data, error};
  }

  async getNoGoIdForConduct(conductid) {
    let {data, error} = await supabase
      .from('ConductStatusPair')
      .select('statusid')
      .eq('conductid', conductid)
      .eq('go', 0);
    return {data, error};
  }
}

class ArfAttendanceTable {
  async insertRecord(new_userNRIC, new_userName, new_userHPNo) {
    let {data, error} = await supabase
      .from('ArfAttendance')
      .insert([
        {
          scanned_time: new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Singapore',
          }),
          userNRIC: new_userNRIC,
          userName: new_userName,
          userHPNo: new_userHPNo,
        },
      ])
      .select();
    return {data, error};
  }

  async generateReport(req_date) {
    let {data, error} = await supabase
      .from('ArfAttendance')
      .select('*')
      .eq('date', req_date);
    return {data, error};
  }
}

class DailyAttendanceTable {
  async insertRecord(user_obj) {
    let {data, error} = await supabase
      .from('DailyAttendance')
      .insert([
        {
          present: user_obj.present,
          userNRIC: user_obj.userNRIC,
          missing_reason: user_obj.missing_reason,
          outofcampma: user_obj.outofcampma,
          others: user_obj.others,
          first_parade: user_obj.first_parade,
        },
      ])
      .select();
    return {data, error};
  }
}

class IpptConductTable {
  async insertRecord(new_company, new_conductDate, new_conductName) {
    let {data, error} = await supabase
      .from('IpptConduct')
      .insert([
        {
          company: new_company,
          conductDate: new_conductDate,
          conductName: new_conductName,
        },
      ])
      .select();
    return {data, error};
  }

  async getconductUUID(company, conductDate, conductName) {
    let {data, error} = await supabase
      .from('IpptConduct')
      .select('conductUUID')
      .eq('company', company)
      .eq('conductDate', conductDate)
      .eq('conductName', conductName);
    return {data, error};
  }
}

class IpptResultTable {
  async insertRecord(conductUUID, userid, detail) {
    let {data, error} = await supabase
      .from('IpptResult')
      .insert([
        {
          conductUUID: conductUUID,
          userid: userid,
          detail: detail,
        },
      ])
      .select();
    return {data, error};
  }

  async updatePushup(conductUUID, userid, pu_score) {
    let {data, error} = await supabase
      .from('IpptResult')
      .update([
        {
          pushup: pu_score,
        },
      ])
      .eq('conductUUID', conductUUID)
      .eq('userid', userid)
      .select();
    return {data, error};
  }

  async updateSitup(conductUUID, userid, su_score) {
    let {data, error} = await supabase
      .from('IpptResult')
      .update([
        {
          situp: su_score,
        },
      ])
      .eq('conductUUID', conductUUID)
      .eq('userid', userid)
      .select();
    return {data, error};
  }

  async updateDetail(conductUUID, userid, new_detail) {
    let {data, error} = await supabase
      .from('IpptResult')
      .update([
        {
          detail: new_detail,
        },
      ])
      .eq('conductUUID', conductUUID)
      .eq('userid', userid)
      .select();
    return {data, error};
  }

  async updateAttendance(conductUUID, userid, bool) {
    let {data, error} = await supabase
      .from('IpptResult')
      .update([
        {
          attendance: bool,
        },
      ])
      .eq('conductUUID', conductUUID)
      .eq('userid', userid)
      .select();
    return {data, error};
  }
}

export const SupaUser = new UserTable();
export const SupaUserStatus = new UserStatusTable();
export const SupaStatus = new StatusTable();
export const SupaConduct = new ConductTable();
export const SupaConductStatus = new ConductStatusPairTable();
export const SupaArfAttendance = new ArfAttendanceTable();
export const SupaDailyAttendance = new DailyAttendanceTable();
