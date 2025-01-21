const knex = require("../../database/Knex").knex;
const fs = require("node:fs");

const getMessages = async (params) => {
  let jobs = await knex
    .raw(
      `EXEC [dbo].[GetMessagesById] 
      @jobNumber = ?`,
      [params.jobNumber]
    )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("GetMessagesById failed: " + error);
      throw new Error(error);
    });

  return jobs;
};

const logNewMessage = async (params) => {
  console.log("Creating: " + JSON.stringify(params));

  const newMessage = await knex
    .transaction(async (trx) => {
      const jobId = await knex
        .raw(
          `EXEC [dbo].[LogNewMessage] 
          @jobNumber = ?,
          @employeeId = ?,
          @message = ?;`,
          [
            params.jobNumber ? parseInt(params.jobNumber) : null,
            params.employeeId ? params.employeeId : null,
            params.messageString ? params.messageString : null
          ]
        )
        .transacting(trx)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error("Insert failed: " + error);
          throw new Error(error);
        });
      return jobId;
    })
    .catch((error) => {
      throw new Error(error);
    });

  return newMessage;
};


const deleteJob = async (params) => {
  // Define the params list as inputs to the SQL query. The value will replace the @input in the query string
  const deletedJob = await knex
    .from("MessagesTable")
    .where("UID", params.messageId)
    .del();
  return deleteJob;
};

module.exports = {
  getMessages,
  logNewMessage,
  deleteJob
};
