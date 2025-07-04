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

async function checkSeat(productId, scheduleId, seatId) {
  try {
    const res = await axios.post(
      'https://ticket.melon.com/api/seat/check',
      { productId, scheduleId, seatId },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; melon-ticket-checker/1.0)',
        },
      }
    );

    console.log(`座位 ${seatId} 返回数据：`, res.data);

    if (res.data && res.data.available === true) {
      const msg = `🎉 有票啦！产品 ${productId} 场次 ${scheduleId} 区域 ${seatId} 开售了！`;
      console.log(msg);
      await sendSlackMessage(msg);
    } else {
      console.log(`座位 ${seatId} 当前无票`);
    }
  } catch (error) {
    if (error.response) {
      console.error(`座位 ${seatId} HTTP 错误:`, error.response.status);
      console.error('返回数据:', error.response.data);
    } else {
      console.error(`座位 ${seatId} 请求失败:`, error.message);
    }
  }
}

async function checkAllSeats() {
  const productId = '211510';
  const scheduleId = '100001';
  const seatIds = ['1_6']; // 这里填你要监控的多个座位ID

  for (const seatId of seatIds) {
    await checkSeat(productId, scheduleId, seatId);
  }
}

checkAllSeats();
