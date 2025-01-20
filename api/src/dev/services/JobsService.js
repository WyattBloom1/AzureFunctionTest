const { Cipher } = require("node:crypto");
const SQL = require("../../database/SQLQueries");
const knex = require("../../database/Knex").knex;
const fs = require("node:fs");

const getJobs = async (params) => {
  let jobs = await knex
    .raw(
      `EXEC [dbo].[GetJobs] 
      @AllJobs = ?`,
      [params.AllJobs ? params.AllJobs : null]
    )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("GetTotalSalesByYear failed: " + error);
      throw new Error(error);
    });

  return jobs;
};

const getJobById = async (params) => {
  console.log("Running get by id: " + JSON.stringify(params));
  const job = await knex
    .raw(
      `SELECT *, 
              geoLocation.Lat AS latitude, 
              geoLocation.Long AS longitude 
        FROM ActiveJobs WHERE jobNumber = ?;`,
      [params.jobNumber ? parseInt(params.jobNumber) : null]
    )
    .catch((error) => {
      console.error("Failed getting jobs: " + error);
      throw Error(error);
    });
  console.log(job);
  return job;
};

const getInvalidJobs = async (params) => {
  console.log(params.PageSize);
  const jobs = await knex.raw(
    `EXEC GetInvalidJobs 
     @PageSize = ?
    ,@PageNumber = ?
    ,@GetCount = ?;`,
    [
      params.pageSize ? params.pageSize : null,
      params.pageNumber ? params.pageNumber : null,
      params.getCount ? params.getCount : null,
    ]
  );
  return jobs;
};

const getScheduledJobs = async (defaultFilterParams) => {
  const jobs = await knex.raw(`EXEC GetScheduledJobs;`);
  return jobs;
};

const getLastSyncDate = async (params) => {
  return await knex.raw("SELECT MAX(lastSync) as LastSync FROM ActiveJobs");
};

const getTotalSalesByYear = async (params) => {
  console.log("Getting total sales by year: " + JSON.stringify(params));
  let jobs = await knex
    .raw(
      `EXEC [dbo].[GetTotalSalesByYear] 
      @Years = ?,
      @Month = ?,
      @GroupBy = ?;`,
      [
        params.Years ? params.Years : null,
        params.Month ? params.Month : null,
        params.GroupBy ? params.GroupBy : "",
      ]
    )
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("GetTotalSalesByYear failed: " + error);
      throw new Error(error);
    });
  return jobs;
};

const getOutstandingJobData = async (params) => {
  console.log("Getting outstanding jobs: " + JSON.stringify(params));
  let jobs = await knex
    .raw(`EXEC [dbo].[GetOutstandingJobs]`, [])
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error("GetTotalSalesByYear failed: " + error);
      throw new Error(error);
    });
  return jobs;
};

const getJobsRange = async (params, operator) => {
  console.log("JobsService - getJobsByRange: " + JSON.stringify(params));
  var foundJobs = await knex.transaction(async (trx) => {
    return await knex
      .raw(
        `EXEC GetJobsByDistance @Distance = ?, @Operator = ?, @Latitude = ?, @Longitude = ?;`,
        [
          params.Distance,
          operator,
          params.Latitude.toString(),
          params.Longitude.toString(),
        ]
      )
      .transacting(trx)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw Error(err);
      });
  });

  return foundJobs;
};

const createJob = async (params) => {
  console.log("Creating: " + JSON.stringify(params));
  const clientParams = params; //params.client;

  const insertedJobInfo = await knex
    .transaction(async (trx) => {
      const jobOptions = params.jobOptions;

      const jobId = await knex
        .raw(
          `EXEC [dbo].[CreateJob] 
          @ActiveJob = ?,
          @JobNumber = ?,
          @ClientName = ?,
          @ClientEmail = ?,
          @ClientPhoneNumber = ?,
          @invoiceDate = ?,
          @surveyDate = ?,
          @specialInstructions = ?,
          @jobFolder = ?,
          @fee = ?,
          @fullyPaid = ?,
          @requiresCertificate = ?,
          @jobAddress = ?,
          @cityName = ?,
          @county = ?,
          @surveyorId = ?,
          @jobType = ?,
          @jobOptions = ?,
          @jobStatus = ?,
          @createDate = ?,
          @Latitude = ?,
          @Longitude = ?,
          @LastSyncDate = ?;`,
          [
            true,
            params.jobNumber ? parseInt(params.jobNumber) : null,
            params.clientName ? params.clientName : null,
            params.clientEmail ? params.clientEmail : null,
            params.clientPhoneNumber ? params.clientPhoneNumber : null,
            params.invoiceDate ? new Date(params.invoiceDate) : new Date(),
            params.surveyDate ? new Date(params.surveyDate) : null,
            params.specialInstructions ? params.specialInstructions : null,
            params.jobFolder ? params.jobFolder : null,
            params.fee ? parseInt(params.fee) : null,
            params.fullyPaid ? params.fullyPaid == "true" : false,
            params.requiresCertificate
              ? params.requiresCertificate == "true"
              : null,
            params.jobAddress ? params.jobAddress : null,
            params.cityName ? params.cityName : null,
            params.county ? params.county : null,
            params.surveyor ? parseInt(params.surveyor) : null,
            params.jobType ? params.jobType : null,
            params.jobOptions ? params.jobOptions.toString() : null,
            params.jobStatus ? params.jobStatus : null,
            params.createDate ? params.createDate : null,
            params.latitude ? params.latitude.toString() : null,
            params.longitude ? params.longitude.toString() : null,
            params.lastSyncDate ? params.lastSyncDate : null,
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

  return insertedJobInfo;
};

const batchInsert = async (jobsTable) => {
  await knex
    .transaction(async (trx) => {
      const jobOptions = jobsTable.jobOptions;
      for (var i = 0; i < jobsTable.length; i++) {
        let params = jobsTable[i];

        if (i == 3) console.log(params.lastSync);

        let jobId = await knex
          .raw(
            `EXEC [dbo].[CreateJob] 
            @ActiveJob = ?,
            @JobNumber = ?,
            @ClientName = ?,
            @ClientEmail = ?,
            @ClientPhoneNumber = ?,
            @invoiceDate = ?,
            @surveyDate = ?,
            @specialInstructions = ?,
            @jobFolder = ?,
            @fee = ?,
            @fullyPaid = ?,
            @requiresCertificate = ?,
            @jobAddress = ?,
            @cityName = ?,
            @county = ?,
            @surveyorId = ?,
            @jobType = ?,
            @jobOptions = ?,
            @jobStatus = ?,
            @createDate = ?,
            @Latitude = ?,
            @Longitude = ?,
            @LastSyncDate = ?,
            @PromisedBy = ?;`,
            [
              true,
              params.jobNumber ? parseInt(params.jobNumber) : null,
              params.clientName ? params.clientName : null,
              params.clientEmail ? params.clientEmail : null,
              params.clientPhoneNumber ? params.clientPhoneNumber : null,
              params.invoiceDate ? new Date(params.invoiceDate) : new Date(),
              params.surveyDate ? new Date(params.surveyDate) : null,
              params.specialInstructions ? params.specialInstructions : null,
              params.jobFolder ? params.jobFolder : null,
              params.fee ? parseInt(params.fee) : null,
              params.fullyPaid ? params.fullyPaid == "true" : false,
              params.requiresCertificate
                ? params.requiresCertificate == "true"
                : null,
              params.jobAddress ? params.jobAddress : null,
              params.cityName ? params.cityName : null,
              params.county ? params.county : null,
              params.surveyor ? parseInt(params.surveyor) : null,
              params.jobType ? params.jobType : null,
              params.jobOptions ? params.jobOptions.toString() : null,
              params.jobStatus ? params.jobStatus : null,
              params.createDate ? params.createDate : null,
              params.latitude ? params.latitude.toString() : null,
              params.longitude ? params.longitude.toString() : null,
              params.lastSync ? params.lastSync : null,
              params.promisedBy ? params.promisedBy : null,
            ]
          )
          .transacting(trx)
          .then((response) => {
            console.log("Imported " + params.jobNumber);
          })
          .catch((error) => {
            console.error(
              "Insert failed for " + params.jobNumber + ": " + error
            );
            throw new Error(error);
          });
      }
    })
    .catch((error) => {
      throw new Error(error);
    });

  return "SUCCESS"; //insertedJobInfo;
};

const getJobsById_Batch = async (jobs) => {
  console.log("Running get by id BATCH: " + JSON.stringify(params));
  // let jobs = params.jobs;
  let foundJobs = [];
  await knex
    .transaction(async (trx) => {
      for (var i = 0; i < jobs.length; i++) {
        let job = jobs[i];

        console.log(job);

        let jobInfo = await knex
          .raw(
            `SELECT *, 
                geoLocation.Lat AS latitude, 
                geoLocation.Long AS longitude 
          FROM ActiveJobs WHERE jobNumber = ?;`,
            [parseInt(job)]
          )
          .transacting(trx)
          .then((response) => {
            foundJobs.push(response[0]);
          })
          .catch((error) => {
            console.error(
              "Failed to find: " + job + ": " + error
            );
            throw new Error(error);
          });
          // jobs[i].jobAddress = jobInfo.jobAddress;
          // jobs[i].hasValidAddress = true;
          // jobs[i].latitude = jobInfo.latitude;
          // jobs[i].longitude = jobInfo.longitude;
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
    return foundJobs;
};

const batchInsert_Complete = async (jobsTable) => {
  await knex
    .transaction(async (trx) => {
      const jobOptions = jobsTable.jobOptions;
      for (var i = 0; i < jobsTable.length; i++) {
        let params = jobsTable[i];

        if (i == 3) console.log(params.lastSync);

        let jobId = await knex
          .raw(
            `EXEC [dbo].[CreateJob_Complete] 
            @ActiveJob = ?,
            @JobNumber = ?,
            @ClientName = ?,
            @ClientEmail = ?,
            @ClientPhoneNumber = ?,
            @invoiceDate = ?,
            @surveyDate = ?,
            @specialInstructions = ?,
            @jobFolder = ?,
            @fee = ?,
            @fullyPaid = ?,
            @requiresCertificate = ?,
            @jobAddress = ?,
            @cityName = ?,
            @county = ?,
            @surveyorId = ?,
            @jobType = ?,
            @jobOptions = ?,
            @jobStatus = ?,
            @createDate = ?,
            @Latitude = ?,
            @Longitude = ?,
            @LastSyncDate = ?,
            @PromisedBy = ?;`,
            [
              true,
              params.jobNumber ? parseInt(params.jobNumber) : null,
              params.clientName ? params.clientName : null,
              params.clientEmail ? params.clientEmail : null,
              params.clientPhoneNumber ? params.clientPhoneNumber : null,
              params.invoiceDate ? new Date(params.invoiceDate) : new Date(),
              params.surveyDate ? new Date(params.surveyDate) : null,
              params.specialInstructions ? params.specialInstructions : null,
              params.jobFolder ? params.jobFolder : null,
              params.fee ? parseInt(params.fee) : null,
              params.fullyPaid ? params.fullyPaid == "true" : false,
              params.requiresCertificate
                ? params.requiresCertificate == "true"
                : null,
              params.jobAddress ? params.jobAddress : null,
              params.cityName ? params.cityName : null,
              params.county ? params.county : null,
              params.surveyor ? parseInt(params.surveyor) : null,
              params.jobType ? params.jobType : null,
              params.jobOptions ? params.jobOptions.toString() : null,
              params.jobStatus ? params.jobStatus : null,
              params.createDate ? params.createDate : null,
              params.latitude ? params.latitude.toString() : null,
              params.longitude ? params.longitude.toString() : null,
              params.lastSync ? params.lastSync : null,
              params.promisedBy ? params.promisedBy : null,
            ]
          )
          .transacting(trx)
          .then((response) => {
            console.log("Imported " + params.jobNumber);
          })
          .catch((error) => {
            console.error(
              "Insert failed for " + params.jobNumber + ": " + error
            );
            throw new Error(error);
          });
      }
    })
    .catch((error) => {
      throw new Error(error);
    });

  return "SUCCESS"; //insertedJobInfo;
};

const batchInsert_Legacy = async (jobsTable) => {
  await knex
    .transaction(async (trx) => {
      const jobOptions = jobsTable.jobOptions;
      for (var i = 0; i < jobsTable.length; i++) {
        // jobsTable.length
        let params = jobsTable[i];

        if (
          params.jobNumber == 160354 &&
          params.jobAddress == "280 Cardinal Cir"
        )
          params.jobNumber = 161354;

        if (
          params.jobNumber == 160399 &&
          params.jobAddress == "2776 132nd Ln NW"
        )
          params.jobNumber = 161399;

        if (
          params.jobNumber == 160441 &&
          params.jobAddress == "2210 Lexington Ave S"
        )
          params.jobNumber = 161441;

        if (
          params.jobNumber == 160451 &&
          params.jobAddress == "1420 Thompson Ave"
        )
          params.jobNumber = 161451;

        if (
          params.jobNumber == 160546 &&
          params.jobAddress == "3004 Northview Rd"
        )
          params.jobNumber = 161546;

        if (
          params.jobNumber == 160547 &&
          params.jobAddress == "4801 Vallacher Ave"
        )
          params.jobNumber = 161547;

        if (params.jobNumber == 160624 && params.jobAddress == "401 N 33rd Ave")
          params.jobNumber = 161624;

        if (
          params.jobNumber == 160784 &&
          params.jobAddress == "13565 Henna Ave"
        )
          params.jobNumber = 161784;

        if (
          params.jobNumber == 160814 &&
          params.jobAddress == "291 Glenbrook Rd N"
        )
          params.jobNumber = 161814;

        if (
          params.jobNumber == 160882 &&
          params.jobAddress == "4237 Washburn Ave S"
        )
          params.jobNumber = 161882;

        if (params.jobNumber == 160948 && params.jobAddress == "128 19th Ave S")
          params.jobNumber = 161948;

        if (
          params.jobNumber == 160979 &&
          params.jobAddress == "2432 Clinton Ave"
        )
          params.jobNumber = 161979;

        if (
          params.jobNumber == 161111 &&
          params.jobAddress == "18745 Rutledge Rd"
        )
          params.jobNumber = 162111;

        if (params.jobNumber == 161219 && params.jobAddress == "1006 E Lake St")
          params.jobNumber = 162219;

        if (
          params.jobNumber == 161240 &&
          params.jobAddress == "4824 Chowen Ave S"
        )
          params.jobNumber = 162240;

        if (
          params.jobNumber == 161249 &&
          params.jobAddress == "4231 Washburn Ave S"
        )
          params.jobNumber = 162249;

        let jobId = await knex
          .raw(
            `EXEC [dbo].[CreateJob_Legacy] 
            @jobNumber = ?,
            @jobYear = ?,
            @jobAddress = ?,
            @cityName = ?,
            @county = ?,
            @jobFolder = ?,
            @Latitude = ?,
            @Longitude = ?;`,
            [
              params.jobNumber ? parseInt(params.jobNumber) : null,
              params.invoiceDate
                ? new Date(params.invoiceDate).getFullYear()
                : new Date(),
              params.jobAddress ? params.jobAddress : null,
              params.cityName ? params.cityName : null,
              params.county ? params.county : null,
              params.jobFolder ? params.jobFolder : null,
              params.latitude ? params.latitude.toString() : null,
              params.longitude ? params.longitude.toString() : null,
            ]
          )
          .transacting(trx)
          .then((response) => {
            console.log("Imported " + params.jobNumber);
          })
          .catch((error) => {
            console.error(
              "Insert failed for " + params.jobNumber + ": " + error
            );
            throw new Error(error);
          });
      }
    })
    .catch((error) => {
      throw new Error(error);
    });

  return "SUCCESS"; //insertedJobInfo;
};

const importJob = async (mainParams) => {
  try {
    var params = mainParams; //[0];
    // var address = await getLatLongFromAddress(params.clientAddress, params.cityName);

    let jobExists = await knex.raw(`EXEC GetJobByID @jobNumber = ?`, [
      params.jobNumber,
    ]);

    if (jobExists[0].jobNumber == "0") {
      console.log("Doesn't exist: " + JSON.stringify(jobExists[0].jobNumber));
    } else {
      console.log("Exists: " + JSON.stringify(jobExists[0].jobNumber));
    }
  } catch (err) {
    writeText("Insert failed for: " + params.jobNumber + "\n" + err, true);
  }

  return "SUCCESS";
};

function writeText(Content, IsError) {
  if (IsError) Content = "\n==ERROR==\n" + Content + "\n==ERROR==\n\n";
  else Content = Content + "\n";

  try {
    fs.appendFile("LogFile.txt", Content, (err) => {
      if (err) {
        console.error("Write Failed: " + err);
      } else {
        console.log("Success");
      }
    });
  } catch (err) {
    console.error("Fail: " + err);
  }
}

function writeJobInfo(params, clientId, address) {
  Content =
    (`?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?`,
    [
      params.jobNumber,
      params.invoiceDate,
      params.specialInstructions,
      params.jobFolder,
      params.fee,
      params.fullyPaid,
      params.requiresCertificate,
      params.cityName,
      clientId,
      params.surveyor,
      params.jobType,
      params.jobStatus,
      address.lng,
      address.lat,
      params.clientName,
      params.clientAddress,
      params.clientEmail,
      params.clientPhoneNumber,
    ]);

  fs.appendFile("BackupData.txt", Content.toString() + "\n", (err) => {
    if (err) {
      console.error("Write Failed: " + err);
    } else {
      // Success
    }
  });
}

const createLegacyJob = async (params) => {
  var address = await getLatLongFromAddress(params.jobAddress, params.cityName);

  const insertedJobInfo = await knex
    .transaction(async (trx) => {
      const jobId = await knex
        .insert(
          knex.raw(
            `(
            jobAddress,
            jobNumber,
            jobFolderLink,
            jobYear,
            cityName,
            geoLocation
            ) VALUES (?, ?, ?, ?, ?, geography::STPointFromText('POINT(' + CAST(?? AS VARCHAR(20)) + ' ' +  CAST(?? AS VARCHAR(20)) + ')', 4326))`,
            [
              params.jobAddress,
              parseInt(params.jobNumber),
              params.jobFolderLink,
              parseInt(params.jobYear),
              address.City,
              parseFloat(address.lng),
              parseFloat(address.lat),
            ]
          ),
          ["*"]
        )
        .into("LegacyJobs")
        .transacting(trx)
        .catch((error) => {
          console.error("Insert failed: " + error);
          throw new Error(error);
        });
      return jobId[0];
    })
    .catch((error) => {
      console.error("Insert failed: " + error);
      throw new Error(error);
    });

  return insertedJobInfo;
};

const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyDSpqJxeXlCAVpAVvJ_aFw1r1AJZgkqEyI",
  Promise: Promise,
});
const getLatLongFromAddress = async (address, city = "") => {
  const response = googleMapsClient
    .geocode({ address: address + (city == "" ? "" : ", " + city) })
    .asPromise()
    .then((response) => {
      if (response.json.status == "OK") {
        var formatAddress = "";
        var county = "";
        var hasStreet = false;

        response.json.results[0].geometry.location["City"] = city;
        response.json.results[0].geometry.location["Address"] = address;

        response.json.results[0].address_components.forEach((item) => {
          switch (item.types[0]) {
            case "street_number":
              formatAddress = item.short_name;
              hasStreet = true;
              break;
            case "route":
              formatAddress += " " + item.short_name;
              break;
            case "locality":
              city = item.short_name;
              formatAddress += ", " + item.short_name;
              break;
            case "administrative_area_level_1":
              response.json.results[0].geometry.location["City"] = city;
              formatAddress += ", " + item.short_name;
              break;
            case "administrative_area_level_2":
              response.json.results[0].geometry.location["County"] =
                item.short_name;
              break;
          }
        });

        if (hasStreet)
          response.json.results[0].geometry.location["Address"] = formatAddress;
        else {
          response.json.results[0].geometry.location.lat = "0";
          response.json.results[0].geometry.location.lng = "0";
        }
        // console.log(response.json.results[0].geometry.location);
        return response.json.results[0].geometry.location;
      } else {
        return new Object({
          Address: address,
          City: city,
          County: "",
          lat: "0",
          lng: "0",
        });
      }
    })
    .catch((err) => {
      // console.error("Get address failed: " + err);
      throw err;
    });
  return response;
};

// Using a store procedure
const setJobStatus = async (jobId, params) => {
  const insertedJobInfo = await knex
    .transaction(async (trx) => {
      const jobNumber = jobId;
      var updateJob = knex("ActiveJobs")
        .where({ jobNumber: jobNumber })
        .update(params, ["*"]);
      return updateJob;
    })
    .catch((error) => {
      console.error("Insert failed: " + error);
      throw new Error(error);
    });

  return insertedJobInfo;
};

const setJobLocation = async (jobId, params) => {
  console.log("Got setlocation");
  const insertedJobInfo = await knex
    .raw(
      `UPDATE CompletedJobs SET 
        geoLocation = geography::STPointFromText('POINT(' + CAST(? AS VARCHAR(20)) + ' ' +  CAST(? AS VARCHAR(20)) + ')', 4326),
        jobAddress = ?
        WHERE CompletedJobs.jobNumber = ?`,
      [params.lat, params.lng, params.address, jobId]
    )
    .then((response) => {
      return "SUCCESS";
    })
    .catch((error) => {
      console.error("Insert failed: " + error);
      throw new Error(error);
    });

  return insertedJobInfo;
};

const updateJob = async (params, jobNumber) => {
  console.log(params);
  const insertedJobInfo = await knex
    .transaction(async (trx) => {
      return await knex
        .raw(
          `EXEC [dbo].[UpdateJob] 
            @ActiveJob = ?,
            @jobNumber = ?,
            @ClientName = ?,
            @ClientEmail = ?,
            @ClientPhoneNumber = ?,
            @surveyDate = ?,
            @specialInstructions = ?,
            @jobFolder = ?,
            @fee = ?,
            @fullyPaid = ?,
            @requiresCertificate = ?,
            @jobAddress = ?,
            @cityName = ?,
            @county = ?,
            @surveyorId = ?,
            @jobType = ?,
            @jobStatus = ?,
            @Latitude = ?,
            @Longitude = ?,
            @PromisedBy = ?,
            @jobTable = ?;`,
          [
            params.IsActive ? params.IsActive : true,
            params.jobNumber,
            params.clientName ? params.clientName : null,
            params.clientEmail ? params.clientEmail : null,
            params.clientPhoneNumber ? params.clientPhoneNumber : null,
            params.surveyDate ? new Date(params.surveyDate) : null,
            params.specialInstructions ? params.specialInstructions : null,
            params.jobFolder ? params.jobFolder : null,
            params.fee ? params.fee : null,
            params.fullyPaid ? params.fullyPaid : null,
            params.requiresCertificate ? params.requiresCertificate : null,
            params.jobAddress ? params.jobAddress : null,
            params.cityName ? params.cityName : null,
            params.county ? params.county : null,
            params.surveyorId ? params.surveyorId : null,
            params.jobType ? params.jobType : null,
            params.jobStatus ? params.jobStatus : null,
            params.latitude ? params.latitude.toString() : null,
            params.longitude ? params.longitude.toString() : null,
            params.promisedBy ? params.promisedBy : null,
            params.jobTable ? params.jobTable : null,
          ]
        )
        .transacting(trx)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.error("Update failed: " + error);
          throw new Error(error);
        });
    })
    .catch((error) => {
      console.error("Insert failed: " + error);
      throw new Error(error);
    });

  return jobNumber; // insertedJobInfo;
};

const deleteJob = async (params) => {
  // Define the params list as inputs to the SQL query. The value will replace the @input in the query string
  const deletedJob = await knex
    .from("ActiveJobs")
    .where("JobNumber", params.jobNumber)
    .del();
  return deleteJob;
};

module.exports = {
  getJobs,
  getJobById,
  getJobsRange,
  getLastSyncDate,
  getScheduledJobs,
  getTotalSalesByYear,
  getOutstandingJobData,
  importJob,
  createJob,
  batchInsert,
  batchInsert_Complete,
  batchInsert_Legacy,
  getJobsById_Batch,
  createLegacyJob,
  setJobStatus,
  setJobLocation,
  updateJob,
  deleteJob,
  getInvalidJobs,
};
