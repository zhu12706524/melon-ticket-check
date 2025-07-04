const axios = require('axios');

async function sendSlackMessage(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL 未设置，跳过发送 Slack 通知');
    return;
  }
  try {
    await axios.post(webhookUrl, { text: message });
    console.log('Slack 通知发送成功');
  } catch (error) {
    console.error('发送 Slack 通知失败:', error.message);
  }
}

async function checkSeatGrade(productId, scheduleNo, seatGradeNo) {
  try {
    // 注意：这个URL是示范，需要你确认抓包的接口地址是否一样
    const url = 'https://tkglobal.melon.com/api/ticket/checkSeatGrade'; 

    const payload = {
      prodId: productId,
      scheduleNo: scheduleNo,
      seatGradeNo: seatGradeNo
    };

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // 可能需要加入 User-Agent、Referer、Cookie 等，抓包确认
      'User-Agent': 'Mozilla/5.0 (compatible; melon-ticket-checker/1.0)'
    };

    const response = await axios.post(url, payload, { headers });
    console.log(`查询座位等级 ${seatGradeNo} 返回数据：`, response.data);

    if (response.data && response.data.available === true) {
      const msg = `🎉 有票啦！产品 ${productId} 场次 ${scheduleNo} 等级 ${seatGradeNo} 开售了！`;
      console.log(msg);
      await sendSlackMessage(msg);
    } else {
      console.log(`座位等级 ${seatGradeNo} 当前无票`);
    }

  } catch (error) {
    if (error.response) {
      console.error(`HTTP 错误: ${error.response.status}`);
      console.error('返回数据:', error.response.data);
    } else {
      console.error('请求失败:', error.message);
    }
  }
}

async function main() {
  const productId = '211510';
  const scheduleNo = '100001';
  const seatGrades = ['12239', '10008']; // aeXIS석 和 일반석

  for (const seatGradeNo of seatGrades) {
    await checkSeatGrade(productId, scheduleNo, seatGradeNo);
  }
}

main();
