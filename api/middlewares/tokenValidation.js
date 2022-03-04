const constants = require("../constants");
const jwt = require("jsonwebtoken");
const userService = require("../services/userLogin.service");
class ErrorHandler extends Error {
  constructor(msg, status) {
    super(msg, status);
    this.name = msg ? msg : "Critical Error";
    this.status = status ? status : "500";
  }
  _errorManager() {
    return { message: this.name, status: this.status };
  }
}
module.exports.validateToken = async (req, res, next) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.headers.authorization) throw new Error(constants.requestValidationMessage.TOKEN_MISSING);
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const token = req.headers.authorization.split("Bearer")[1].trim();
    const decoded = jwt.verify(token, process.env.SECRET_KEY || "my-secret-key");
    if (decoded) {
      let currentTime = new Date();
      let currentOffset = currentTime.getTimezoneOffset();
      let ISTOffset = 330; // IST offset UTC +5:30
      let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);
      // ISTTime now represents the time in IST coordinates
      let hoursIST = ISTTime.getHours();
      let minutesIST = ISTTime.getMinutes();
      let _ip = ip.split(":");
      let userData = await userService.searchLoginUser({ id: decoded.id });
      if (!userData) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
      req.body.user_id = decoded.id;
      req.body.user_role = userData.user_type;
      req.body.email = userData.email;
      req.body.ip = _ip ? _ip[_ip.length - 1] : "";
      console.log(
        `Virefied user -- ${userData.name}, with role - ${userData.user_type} from ip : ${
          _ip ? _ip[_ip.length - 1] : ""
        }, at - ${hoursIST}:${minutesIST} ${hoursIST < 12 ? 'AM' : 'PM'}`
      );
      return next();
    } else return false;
  } catch (error) {
    console.log("Error", error.message);
    response.message = error.message;
    response.status = 401;
  }
  return res.status(response.status).send(response);
};
