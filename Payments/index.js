import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
// import mpesaOrderRoutes from './routes/order-mpesa.js'; // Adjust path as needed



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mount the M-Pesa order router
// app.use('/api', mpesaOrderRoutes);

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST'],       // Allow specific methods
  credentials: true               // If cookies or auth headers are needed
}));


const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send(`<h1>App is running on port: ${PORT}</h1>`);
});

// Your existing tokenMiddleware
const tokenMiddleware = async (req, res, next) => {
  const MPESA_BASE_URL =
    process.env.MPESA_ENVIRONMENT === 'live'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const resp = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );

    req.mpesaToken = resp.data.access_token;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Your existing /stkpush route
app.post('/api/mpesa/stkpush', tokenMiddleware, async (req, res) => {
  const { phoneNumber, amount } = req.body;
  if (!phoneNumber || !amount) {
    return res.status(400).json({
      error: 'Phone number and amount are required',
    });
  }
  try {
    const MPESA_BASE_URL =
      process.env.MPESA_ENVIRONMENT === 'live'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);
    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString('base64');

    const formattedPhone = `254${phoneNumber.slice(-9)}`;
    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: 'https://mydomain.com/callback-url-path',
        AccountReference: phoneNumber,
        TransactionDesc: 'anything here',
      },
      {
        headers: {
          Authorization: `Bearer ${req.mpesaToken}`,
        },
      }
    );
    return res.status(200).json({
      status: 'success',
      message: `stk sent successfully to ${phoneNumber}`,
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add callback route if not already present
app.post('/callback', (req, res) => {
  console.log('Callback received:', req.body);
  const result = req.body.Body.stkCallback;

  if (result.ResultCode === 0) {
    console.log('Transaction successful:', result);
  } else {
    console.log('Transaction failed:', result.ResultDesc);
  }

  res.status(200).json({ status: 'Callback received' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});