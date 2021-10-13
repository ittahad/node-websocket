var express = require('express');
var router = express.Router();
var socketUtils = require('../socketUtils');
var responseWriter = require('../utility/res');

const AppSettings = require(`../config.${process.env.NODE_ENV}`);
const config = new AppSettings();

var SecurityContext = require('libidentity');
const securityContext = new SecurityContext(config)

router.all('*', securityContext.verifyToken, securityContext.dbContextAccessor, securityContext.verifyUser)
/**
   * A valid authorization token is mandatory for this endpoint. Send mail endpoint.
   * 
   * A sample client could be fount here https://core-websocket-service.herokuapp.com/test_client.html
   * 
   * @route POST /notify
   * @group Notification - notification-service endpoints
   * @param {NotifyInfo.model} notifyInfo.body.required
   * @returns {object} 200 - Delivery to notfication success response
   * @returns {Error}  default - Unexpected error
   * @security JWT
   */
  .post('/notify', function(req, res, next) {
    if(req.body.filter === null || typeof(req.body.filter) === 'undefined') {
      return responseWriter.response(res, {status: "incorrect filter"}, null, 400);
    }
    var filter = JSON.stringify(req.body.filter);
    socketUtils.socketNotify(filter, req.body.payload);
    return responseWriter.response(res, {status: "sent"}, null, 200);
  })
  /**
   * @route POST /broadcast
   * @group Notification - notification-service endpoints
   * @param {BroadcastInfo.model} broadcastInfo.body.required
   * @returns {object} 200 - Delivery to notfication success response
   * @returns {Error}  default - Unexpected error
   * @security JWT
   */
  .post('/broadcast', function(req, res, next) {
    socketUtils.socketBroadcast(req.body.payload);
    return responseWriter.response(res, {status: "sent"}, null, 200);
  });
  
/**
 * @typedef NotifyInfo
 * @property {string} filter.query.required - A filter based on which notification will be forwarded - eg: gaming
 * @property {object} payload.query.required - Notification payload - eg: {"secret": "12345"}
 */

/**
 * @typedef BroadcastInfo
 * @property {object} payload.query.required - Notification payload - eg: {"secret": "12345"}
 */

module.exports = router;
