import serverless from 'serverless-http';
import app from '../../server/app.js';
import { connectDB } from '../../server/config/db.js';

// Cache connection across warm invocations
let isConnected = false;

// serverless-http wraps the Express app
const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Don't wait for event loop to drain (important for MongoDB keep-alive)
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to MongoDB Atlas (cached after first connection)
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    // When using `to = "/.netlify/functions/api"` (without :splat),
    // Netlify passes the original full path (e.g. /api/books) in event.path.
    // Our Express app is mounted at /api/* so this works directly.
    return await serverlessHandler(event, context);

  } catch (error) {
    console.error('Netlify function fatal error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: false,
        message: 'Server error: ' + error.message
      })
    };
  }
};
