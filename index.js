const express = require("express"); // express is used to create a server for this web app
const winston = require("winston"); // Import winston which is used for logging requests and any error
const app = express(); // Initialize the express
const port = 3000; port //app will listen to specified port number

// Winston logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "calculator-microservice" }, //add meta data to the log json indicating it belongs to calculator-microservice
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), //Log all the errors in error.log file
    new winston.transports.File({ filename: "logs/combined.log" }), //log all messages (info, warn, error) on combined.log file
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Supported operations
const operations = {
  add: (n1, n2) => n1 + n2,
  subtract: (n1, n2) => n1 - n2,
  multiply: (n1, n2) => n1 * n2,
  divide: (n1, n2) => {
    if (n2 === 0) throw new Error("Cannot divide by zero");
    return n1 / n2;
  },
};

// API endpoint
app.get("/:operation", (req, res) => {
  const { operation } = req.params; // extract the operation value from url . ex will extract add from value /add?n1=10&n2=20
  const num1 = parseFloat(req.query.n1);  // convert the inputted no to floating point numbers
  const num2 = parseFloat(req.query.n2);

  logger.info(`Request from ${req.ip} - Operation: ${operation}, n1=${req.query.n1}, n2=${req.query.n2}`);

  if (!operations[operation]) {
    logger.error(`Invalid operation: ${operation}`);
    return res.status(400).json({ error: "Invalid operation" });
  }

  if (isNaN(num1) || isNaN(num2)) { // is NaN check for inputted number throw error if not a valid number value
    logger.error(`Invalid input numbers: n1=${req.query.n1}, n2=${req.query.n2}`);
    return res.status(400).json({ error: "Invalid numbers provided" });
  }
  // added error handling , throw respective rror during calc process
  try {
    const result = operations[operation](num1, num2);
    res.json({ operation, n1: num1, n2: num2, result });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  logger.info(`Calculator microservice listening on port ${port}`);
  console.log(`Server running at http://localhost:${port}`);
});
