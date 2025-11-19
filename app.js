const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");           // Import http module
const socketIo = require("socket.io");  // Import Socket.IO

dotenv.config({ path: "./.env" });
const app = express();

const PORT = process.env.PORT || 5000;
const MONGOURI = process.env.MONGOURI;

mongoose.set("strictQuery", false);
mongoose.connect(MONGOURI);
mongoose.connection.on("connected", () => {
  console.log("Connected to Database");
});
mongoose.connection.on("error", (err) => {
  console.log("Connecting error", err);
});

app.use(express.json());
app.use(cors());

// Import Models
require("./Models/Employee");
require("./Models/Expense");
require("./Models/ExpenseReconcile");
require("./Models/Income");
require("./Models/GoogleAuth");
require("./Models/Meeting");
require("./Models/IncomeReconcile");
require("./Models/Invoice");
require("./Models/Leave");
require("./Models/Quotation");
require("./Models/User");
require("./Models/Validate");
require("./Models/Bank");
require("./Models/Account");
require("./Models/Journal");
require("./Models/Leave");
require("./Models/LeaveType");
require("./Models/Roles");
require("./Models/Departments");
require("./Models/AdvanceSalary");
require("./Models/Allowance");
require("./Models/Deduction");
require("./Models/Payslips");
require("./Models/User");
require("./Models/CompanyInfo");



// Import Routes
app.use(require("./Routes/auth"));
app.use(require("./Routes/employee"));
app.use(require("./Routes/expense"));
app.use(require("./Routes/income"));
app.use(require("./Routes/invoice"));
app.use(require("./Routes/quotation"));
app.use(require("./Routes/bank"));
app.use(require("./Routes/account"));
app.use(require("./Routes/journal"));
app.use(require("./Routes/leave"));
app.use(require("./Routes/leaveType"));
app.use(require("./Routes/roles"));
app.use(require("./Routes/departments"));
app.use(require("./Routes/advanceSalary"));
app.use(require("./Routes/allowance"));
app.use(require("./Routes/deduction"));
app.use(require("./Routes/payslip"));
app.use(require("./Routes/user"));
app.use(require("./Routes/companyInfo"));
app.use(require("./Routes/upload"));
app.use(require("./Routes/authgoogle"));
app.use(require("./Routes/meetingschedule"));
app.use(require("./Routes/interviewschedule"));

const interviewRoutes = require('./Routes/interviewschedule');
app.use('/schedule-interview', interviewRoutes);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }, // Adjust the origin as needed
});

// Role hierarchy (using same case as your routes)
const rolePriority = {
  Employee: 0,
  Accountant: 1,
  HR: 2,
  Owner: 3,
};



io.on("connection", (socket) => {
  const role = socket.handshake.query.role;
  socket.role = role;
  console.log(`Socket connected with role: ${role}`);

  socket.on("send_message", (data) => {
    console.log(`Message from ${role}: ${data.message}`);
    // Only HR, Accountant, Owner may send; broadcast to all except sender
    if (["Owner", "HR", "Accountant"].includes(role)) {
      socket.broadcast.emit("receive_message", data);
    } else {
      console.warn(`Role ${role} not allowed to send messages.`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket with role ${socket.role} disconnected`);
  });
});

// Start the server using the HTTP server instead of app.listen
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


module.exports = app; // Export the app for testing purposes