const express = require("express"); // express is used to create a server for this web app
const app = express(); // Initialize the express
const winston = require("winston"); // Import winston which is used for logging requests and any error

//setting up winston logger.
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "calc-service" }, //add meta data to the log json indicating it belongs to calc-service
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }), //Log all the errors in error.log file
    new winston.transports.File({ filename: "combined.log" }), //log all messages (info, warn, error) on combined.log file
  ],
});

if (process.env.NODE_ENV !== "production") { 
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}


// Create operations object which contains all the aritmetic operation 
const operations = {
  add: (n1, n2) => n1 + n2,
  subtract: (n1, n2) => n1 - n2,
  multiply: (n1, n2) => n1 * n2,
  divide: (n1, n2) => (n2 !== 0 ? n1 / n2 : "Cannot divide by zero"), // adding check for divide by zero call
};

// Set up a route handler that listens for GET requests with a dynamic URL parameter  like /add?n1=10&n2=20 )
app.get("/:operation", (req, res) => {
  try {
    const { operation } = req.params; // extract the operation value from url . ex will extract add from value /add?n1=10&n2=20
    const n1 = parseFloat(req.query.n1); // convert the inputted no to floating point numbers
    const n2 = parseFloat(req.query.n2); 

    if (isNaN(n1) || isNaN(n2)) { // is NaN check for inputted number throw error if not a valid number value
      logger.error("Invalid input: n1 or n2 is not a number");
      throw new Error("Invalid input: n1 or n2 is not a number");
    }

    if (!operations[operation]) { //throw error if operaion is not as the one's specified in the operation object
      logger.error("Invalid operation requested");
      throw new Error("Use supported operation: add, subtract, multiply, divide");
    }

    logger.info(`Operation ${operation} requested with parameters ${n1} and ${n2}`);
    const result = operations[operation](n1, n2);
    res.status(200).json({ statuscode: 200, operation, result });  // 200 indicates success return the result value
  } catch (error) {
    console.error(error);
    res.status(500).json({ statuscode: 500, msg: error.toString() }); // 500 indicates server error.Log the msg in error.log file
  }
});

const port = 3040; //app will listen to specified port number
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});