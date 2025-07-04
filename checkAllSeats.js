const axios = require('axios');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';  // 在环境变量设置
const COOKIE = '_fwb=1867Dia2EvmRqdqFyjQ7oHh.1714729274893; PCID=17509336239851306987338; TKT_POC_ID=WP19; i18next=EN; NetFunnel_ID=WP15; MAC_T="Mq7IlX0+NcGD/HpUHyTJyNgfVD4NckT7NPq0+7fjgm9F8Ny2evzWVfRg6pvlTmkcEPMQXhi+FqTWkb6LXyKoIw=="; keyCookie_T=1000325515; JSESSIONID=26ADB1B567EE58F34FD4D9103D5248C3; wcs_bt=s_322bdbd6fd48:1751635803';  // 替换成你的登录 Cookie 字符串

async function sendSlackMessage(text) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    await axios.post(SLACK_WEBHOOK_URL, { text });
    console.log('Slack通知已发送');
  } catch (e) {
    console.error('Slack通知发送失败:', e.message);
  }
}

async function fetchSeatGrades(productId, scheduleNo) {
  const url = 'https://tkglobal.melon.com/tktapi/glb/product/schedule/gradelist.json';
  const params = {
    callback: 'scheduleList4',
    v: '1',
    prodId: productId,
    pocCode: 'SC0002',
    scheduleNo: scheduleNo,
    perfTypeCode: 'GN0001',
    sellTypeCodeData: 'ST0001',
    langCd: 'EN',
    seatCntDisplayYn: 'N',
  };
  const headers = {
    'Accept': 'text/javascript, application/javascript',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': `https://tkglobal.melon.com/performance/index.htm?langCd=EN&prodId=${productId}`,
    'Cookie': COOKIE,
    'X-Requested-With': 'XMLHttpRequest',
  };

  const res = await axios.get(url, { params, headers });
  const jsonpPrefix = 'scheduleList4(';
  const jsonpSuffix = ');';
  let dataStr = res.data;
  if (dataStr.startsWith(jsonpPrefix) && dataStr.endsWith(jsonpSuffix)) {
    const jsonStr = dataStr.slice(jsonpPrefix.length, -jsonpSuffix.length);
    const data = JSON.parse(jsonStr);
    return data.data.seatGradelist || [];
  }
  throw new Error('无法解析座位等级列表数据');
}

async function fetchSeatList(productId, scheduleNo, seatGradeNo) {
  const url = 'https://tkglobal.melon.com/tktapi/glb/product/schedule/seatlist.json';
  const params = {
    callback: 'seatList4',
    v: '1',
    prodId: productId,
    pocCode: 'SC0002',
    scheduleNo,
    seatGradeNo,
    sellTypeCodeData: 'ST0001',
    langCd: 'EN',
  };
  const headers = {
    'Accept': 'text/javascript, application/javascript',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': `https://tkglobal.melon.com/performance/index.htm?langCd=EN&prodId=${productId}`,
    'Cookie': COOKIE,
    'X-Requested-With': 'XMLHttpRequest',
  };

  const res = await axios.get(url, { params, headers });
  const jsonpPrefix = 'seatList4(';
  const jsonpSuffix = ');';
  let dataStr = res.data;
  if (dataStr.startsWith(jsonpPrefix) && dataStr.endsWith(jsonpSuffix)) {
    const jsonStr = dataStr.slice(jsonpPrefix.length, -jsonpSuffix.length);
    const data = JSON.parse(jsonStr);
    return data.data.seatList || [];
  }
  throw new Error('无法解析座位列表数据');
}

async function main() {
  const productId = '211510';
  const scheduleNo = '100001';

  try {
    const grades = await fetchSeatGrades(productId, scheduleNo);
    console.log(`找到 ${grades.length} 个座位等级`);

    for (const grade of grades) {
      const seatGradeNo = grade.seatGradeNo;
      const seatGradeName = grade.seatGradeName;

      console.log(`查询座位等级: ${seatGradeName} (${seatGradeNo})`);
      const seats = await fetchSeatList(productId, scheduleNo, seatGradeNo);

      const availableSeats = seats.filter(s => s.status === 'AVAILABLE');

      if (availableSeats.length > 0) {
        const msg = `🎉【有票提醒】产品 ${productId} 场次 ${scheduleNo} 座位等级 ${seatGradeName} 有 ${availableSeats.length} 个可用座位！`;
        console.log(msg);
        await sendSlackMessage(msg);
      } else {
        console.log(`座位等级 ${seatGradeName} 暂无可用票`);
      }
    }
  } catch (e) {
    console.error('运行出错:', e.message);
  }
}

main();
