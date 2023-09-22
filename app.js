require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
//packages
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');

//database
const connectDB = require("./db/connect");

//routers
const adminRouter = require('./routes/adminRoutes');
const teacherRouter = require('./routes/TeacherRoutes');
const studentRouter = require('./routes/studentRoutes');

//middleware
const notFoundMiddleware = require("./middleware/not_found");
const errorHandlerMiddleware = require("./middleware/error_handler");

app.use(cors());
app.use(helmet());

app.use(express.static('./public'));

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));


app.use('/api/v1/Admin', adminRouter);
app.use('/api/v1/Teacher', teacherRouter);
app.use('/api/v1/Student', studentRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 6000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening to ${port}....`));
  } catch (error) {
    console.log(error);
  }
};


start();
