const mongoose = require("mongoose");
const eventModel = require("../models/eventModel");

//! event create
exports.createEvent = async (req, res) => {
  try {
    let { title, description, date, time, location, organizerName, eventBanner } = req.body;

    let data = await eventModel.create({
     title, description, date, time, location, organizerName, eventBanner
    });

    res.status(200).json({
      success: true,
      message: "Event create successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! event get all with pagination
exports.allEvent = async (req, res) => {
  try {

    let pageNo = Number(req.params.pageNo)
    let perPage = Number(req.params.perPage)

    let skipRow = (pageNo - 1) * perPage

    let sortStage = {createdAt :  -1}

    let facetStage = {
      $facet : {
        totalCount : [{$count : 'count'}],
        blogs:[
            {
              $sort : sortStage
            },
            {
              $skip  : skipRow
            },
            {
              $limit : perPage
            },
            {
              $project : {
     title:1, description:1, date:1, time:1, location:1, organizerName:1, eventBanner:1              }
            }
        ]
      }
    }

    let events = await eventModel.aggregate([facetStage])

    console.log(events);

    res.status(200).json({
      success: true,
      message: "All Data event Get.",
      data:events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! event single data get
exports.singleEvent = async (req, res) => {
  try {
    let { id } = req.params;


      let data = await eventModel.findById(id);
    res.status(200).json({
      success: true,
      message: "All Data event Get.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! event single data update
exports.updateEvent = async (req, res) => {
  try {
    let { id } = req.params;
    let { title, description, date, time, location, organizerName, eventBanner } = req.body;
    let data = await eventModel.findByIdAndUpdate(
      id,
     {title, description, date, time, location, organizerName, eventBanner},
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "event update successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! event single data delete
exports.deleteEvent = async (req, res) => {
  try {
    let { id } = req.params;

    let data = await eventModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Event delete successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};
