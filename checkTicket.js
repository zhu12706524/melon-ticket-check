const axios = require('axios');

async function checkTicket() {
  try {
    const res = await axios.post('https://ticket.melon.com/api/seat/check', {
      productId: '211510',
      scheduleId: '250829',
      seatId: '1_6'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; melon-ticket-checker/1.0)'
      }
    });

    console.log('Response data:', res.data);
  } catch (error) {
    if (error.response) {
      console.error('HTTP error:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

checkTicket();
